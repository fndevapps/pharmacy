var notificationDetailsView = (function (_this) {
    _this.viewModel = {
        view: null,
        onlineListener: null,
        offlineListener: null,
        previousView: null,
        record: null,
        notificationAttachmentsDS: new kendo.data.DataSource({
            transport: {
                read: function (options) {
                      var orders = _this.viewModel.record.attachments.map(function (item) {
                            return item;
                        })
                      options.success(orders);
                }
            },
            requestStart: function (e) {
                e.sender.loading = true;
            },
            requestEnd: function (e) {
                e.sender.loading = false;
            }
        }),
        onInit: function (e) {
            var view = e.view.element;
            _this.viewModel.view = view;

            layoutView(e, {}, function () {
                view.find(".container").css("height", (view.find(".content").height()) + "px");
                var itemImageContainer = view.find(".item-image-container");
                itemImageContainer.css("height", (view.find(".content").width() * 0.5) + "px");
            });
        },
        onShow: function (e) {
            var view = e.view.element;

            setupUserUI();

            if (e.view.params.preserveState == 1) {
                console.log("Preserving state...");
                return;
            }

            if(view.find(".content").data("kendoMobileScroller")) {
                view.find(".content").data("kendoMobileScroller").contentResized();
                view.find(".content").data("kendoMobileScroller").scrollTo(0, 0);
            }

            _this.viewModel.loadDetails();

            _this.viewModel.onlineListener = DelegateManager.registerEvent("app:online", function () {
            
            });
            _this.viewModel.offlineListener = DelegateManager.registerEvent("app:offline", function () {

            });
        },
        loadDetails: function () {
            var view = _this.viewModel.view;
            var item = _this.viewModel.record;

            if (!item) {
                _this.viewModel.back();
                return;
            }

            view.find(".item-image").setBackgroundImage([item.image, item.altImage], "./images/placeholder.png");
            view.find(".item-date").text(item.dateString);
            view.find(".item-name").text(currentLanguage == "ar" ? item.aTitle : item.eTitle);
            view.find(".item-name").dotdotdot();
            view.find(".header .title").text(currentLanguage == "ar" ? item.aTitle : item.eTitle);
            view.find(".item-description").html((currentLanguage == "ar" ? item.aDescription : item.eDescription).replace(/\r\n/g, "<br/>"));

            view.find(".item-description-container").data("kendoMobileScroller").contentResized();
            view.find(".item-description-container").data("kendoMobileScroller").scrollTo(0, 0);

            var listView = view.find("#notificationAttachmentsList");
            if (!listView.data("kendoMobileListView")) {
                listView.kendoMobileListView({
                    dataSource: _this.viewModel.notificationAttachmentsDS,
                    template: $("#notificationAttachmentsListTemplate").html(),
                    dataBound: function (e) {
                        if (this.dataSource.data().length == 0) {
                            if (this.dataSource.loading) {
                                //return listView.append('<div class="loading"></div>');
                                return;
                            }
                            return listView.append('<div class="no-data-found">' + TranslationManager.translate("general.noDataFound") + '</div>');
                        }
                    }
                })
            }
            else {
                _this.viewModel.notificationAttachmentsDS.read();
            }
        },
        onHide: function (e) {
            DelegateManager.unregisterEvent(_this.viewModel.onlineListener);
            DelegateManager.unregisterEvent(_this.viewModel.offlineListener);
        },
        back: function (e) {
            try {
                e.preventDefault();
                e.stopPropagation();
            } catch (ex) { }

            if (_this.viewModel.previousView) {
                navigate(_this.viewModel.previousView);
            }
            else {
                navigate("#:back");
            }
        },
        viewImage: function (e) {
            Modals.PhotoViewerModal.showPhotos({
                photos: [_this.viewModel.record.image],
                title: currentLanguage == "ar" ? _this.viewModel.record.aTitle : _this.viewModel.record.eTitle
            });
        },
        viewNotificationAttachment: function (e,uid){
            try {
                e.preventDefault();
                e.stopPropagation();
            } catch (ex) { }

            var attachment = _this.viewModel.notificationAttachmentsDS.getByUid(uid);
            var path = getURL(attachment.path);

            var extension = path.substring(path.lastIndexOf(".") + 1).toLowerCase();
            if(extension == "pdf") {
                showLoading();
                Utils.downloadFile(path, function(localPath) {
                    hideLoading();

                    Utils.openFile(localPath, function() {

                    }, function(error) {
                        _alert(error);
                    })
                }, function(error) {
                    console.error(error);
                    hideLoading();
                    _alert("Failed to download file!");
                });
            } else if(Utils.getMimeType(path).indexOf("image")>-1){
                Modals.PhotoViewerModal.showPhotos({
                    photos: [path],
                    title: currentLanguage == "ar" ? attachment.aName : attachment.eName
                });
            }
            else {
                window.open(encodeURI(path), "_blank");
            }
        }
    }

    return _this.viewModel;
})({});
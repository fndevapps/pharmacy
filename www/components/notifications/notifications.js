var notificationsView = (function (_this) {
    _this.viewModel = {
        view: null,
        cartListener: null,
        currentFilters: null,
        notificationsDS: new kendo.data.DataSource({
            transport: {
                read: function (options) {
                    Data.Notifications.getNotifications({
                        
                    }, function (err, data) {
                        if (err) {
                            console.error(err);
                            options.success([]);
                            return;
                        }

                        var orders = data.map(function (item) {
                            item["altImage"] = undefined;
                            item["image"] = getURL(item["image"]);
                            item["dateString"] = moment(item.createdAt).format("DD-MM-YYYY");
                            return item;
                        })

                        options.success(orders);
                    })
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
            });
        },
        onShow: function (e) {
            var view = e.view.element;

            setupUserUI();

            _this.viewModel.setupCart();

            if (e.view.params.preserveState == 1) {
                console.log("Preserving state...");
                return;
            }

            try {
                view.find(".tabs").data("kendoMobileTabStrip").switchTo(0);
            }
            catch (ex) { }

            var listView = view.find("#notificationsList");
            if (!listView.data("kendoMobileListView")) {
                listView.kendoMobileListView({
                    dataSource: _this.viewModel.notificationsDS,
                    template: $("#notificationsListTemplate").html(),
                    dataBound: function (e) {
                        if (this.dataSource.data().length == 0) {
                            if (this.dataSource.loading) {
                                //return listView.append('<div class="loading"></div>');
                                return;
                            }
                            return listView.append('<div class="no-data-found">' + TranslationManager.translate("general.noDataFound") + '</div>');
                        }
                        /* e.sender.element.find("li").each(function (index) {
                            var li = $(this);
                            li.find(".item-name").dotdotdot();
                            li.find(".item-image").setBackgroundImage([li.find(".item-image").attr("background-image"), li.find(".item-image").attr("alt-background-image")], "./images/placeholder.png");

                            setTimeout(function () {
                                li.find(".list-item").addClass("visible");
                            }, (index * 100));
                        }); */
                    }
                })
            }
            else {
                _this.viewModel.notificationsDS.read(_this.viewModel.currentFilters);
            }
        },
        onHide: function (e) {
            DelegateManager.unregisterEvent(_this.viewModel.cartListener);
            _this.viewModel.cartListener = null;
        },
        setupCart: function () {
            var cartBtn = _this.viewModel.view.find(".cartButton");
            cartBtn.find(".cartCount").text(MyCart.getNoOfItems());
            _this.viewModel.cartListener = DelegateManager.registerEvent("cart::updated", function (item) {
                cartBtn.find(".cartCount").text(MyCart.getNoOfItems());
            });
        },
        viewCart: function (e) {
            cartView.previousView = "components/myOrders/myOrders.html?preserveState=1";
            navigate("components/cart/cart.html");
        },
        search: {
            showSearch: function (e) {
                try {
                    e.preventDefault();
                    e.stopPropagation();
                }
                catch (ex) { }

                _this.viewModel.view.find(".navbar").hide();
                _this.viewModel.view.find(".navbar.search-header").show();

                setTimeout(function () {
                    _this.viewModel.view.find(".navbar.search-header").find(".search-input").focus();
                }, 50);
            },
            hideSearch: function (e) {
                try {
                    e.preventDefault();
                    e.stopPropagation();
                }
                catch (ex) { }

                _this.viewModel.search.cancelSearch(e);
                _this.viewModel.view.find(".navbar").hide();
                _this.viewModel.view.find(".navbar:not(.search-header)").show();
            },
            cancelSearch: function (e) {
                try {
                    e.preventDefault();
                    e.stopPropagation();
                }
                catch (ex) { }

                _this.viewModel.view.find(".navbar.search-header").find(".search-input").blur();
                _this.viewModel.view.find(".navbar.search-header").find(".search-input").val("");
                _this.viewModel.search.search("");
            },
            onSearch: function (e) {
                try {
                    e.preventDefault();
                    e.stopPropagation();
                }
                catch (ex) { }

                if (e.keyCode != 13) {
                    return;
                }

                _this.viewModel.search.search(_this.viewModel.view.find(".navbar.search-header").find(".search-input").val());
            },
            search: function (searchValue) {

                if (!searchValue || isEmpty(searchValue)) {
                    _this.viewModel.notificationsDS.filter({});
                }
                else {
                    _this.viewModel.notificationsDS.filter({
                        logic: "or",
                        filters: [{
                            field: "ETitle",
                            operator: "contains",
                            value: searchValue
                        }, {
                            field: "ATitle",
                            operator: "contains",
                            value: searchValue
                        }, {
                            field: "EDescription",
                            operator: "contains",
                            value: searchValue
                        }, {
                            field: "ADescription",
                            operator: "contains",
                            value: searchValue
                        }]
                    })
                }

                try {
                    _this.viewModel.view.find(".list-container:visible").data("kendoMobileScroller").scrollTo(0, 0);
                }
                catch (ex) { }
            }
        },
        viewNotificationDetails: function (e, uid) {
            try {
                e.preventDefault();
                e.stopPropagation();
            } catch (ex) { }

            var notification = _this.viewModel.notificationsDS.getByUid(uid);
            console.log(notification);

            notificationDetailsView.record = notification;
            notificationDetailsView.previousView = "components/notifications/notifications.html?preserveState=1";
            navigate("components/notifications/notificationDetails.html");
        }
    }

    return _this.viewModel;
})({});
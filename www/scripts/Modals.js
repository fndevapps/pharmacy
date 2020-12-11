var Modals = {
    PhotoViewerModal: {
        _gallery: null,
        _getModal: function () {
            var modal = $("#modal_photoViewer");
            if (modal.length === 0) {
                return {
                    modal: null,
                    kendoModal: null
                };
            }

            var kendoModal = modal.data("kendoMobileModalView");
            if (!kendoModal) {
                return {
                    modal: modal,
                    kendoModal: null
                };
            }

            return {
                modal: modal,
                kendoModal: kendoModal
            };
        },
        showPhotos: function (options, callback) {
            if (typeof options === "function") {
                callback = options;
                options = {};
            }
            else {
                options = options || {};
            }

            var modalEl = Modals.PhotoViewerModal._getModal();

            if (!modalEl.modal || !modalEl.kendoModal) {
                callback ? callback(null) : false;
                return;
            }

            var photos = options.photos || [];
            var currentIndex = options.currentIndex || 0;
            var title = options.title || "";

            modalEl.modal.data("callback", callback);
            modalEl.kendoModal.open();
            modalEl.modal.find(".header .title").text(title);

            var contentHeight = (modalEl.modal.find(".km-content").outerHeight(true) - (modalEl.modal.find(".header").outerHeight(true) + modalEl.modal.find(".footer").outerHeight(true)));
            var contentHeight = (modalEl.modal.find(".km-content").outerHeight(true) - (modalEl.modal.find(".header").outerHeight(true) + modalEl.modal.find(".footer").outerHeight(true)));
            modalEl.modal.find(".content").css("height", contentHeight + "px");

            setTimeout(function () {
                var pswpElement = modalEl.modal.find('.pswp')[0];

                processImages(photos, function (photos) {
                    // build items array
                    var items = photos.map(function (item) {
                        return {
                            src: item.ImageName,
                            w: item.width,
                            h: item.height
                        };
                    });

                    if (items.length == 0) {
                        return;
                    }

                    // define options (if needed)
                    var options = {
                        index: currentIndex,
                        pinchToClose: false,
                        closeOnScroll: false,
                        closeOnVerticalDrag: false,
                        history: false,
                        modal: false
                    };

                    // Initializes and opens PhotoSwipe
                    Modals.PhotoViewerModal._gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
                    Modals.PhotoViewerModal._gallery.init();
                });
            }, 500);

            function processImages(images, callback) {
                var operations = images.length;
                var processedImages = [];

                function checkCalcImages() {
                    if (operations == 0) {
                        callback ? callback(processedImages) : false;
                    }
                }
                function calcImage(imageSrc, isFallback) {
                    var img = new Image();
                    img.onload = function () {
                        var image = {};
                        image.ImageName = img.src;
                        image.width = img.width;
                        image.height = img.height;

                        console.log(image);

                        processedImages.push(image);

                        operations--;
                        checkCalcImages();
                    };
                    img.onerror = function () {
                        if (isFallback) {
                            operations--;
                            checkCalcImages();
                        }
                        else {
                            calcImage("./images/placeholder.png", true);
                        }
                    }
                    img.src = imageSrc;
                }
                for (var i = 0; i < images.length; i++) {
                    calcImage(images[i]);
                }
            }
        },
        showPhotos_2: function (options, callback) {

            if (typeof options === "function") {
                callback = options;
                options = {};
            }
            else {
                options = options || {};
            }

            var modalEl = Modals.PhotoViewerModal._getModal();

            if (!modalEl.modal || !modalEl.kendoModal) {
                callback ? callback(null) : false;
                return;
            }

            var photos = options.photos || [];
            var currentIndex = options.currentIndex || 0;
            var title = options.title || "";

            modalEl.modal.data("callback", callback);
            modalEl.kendoModal.open();
            modalEl.modal.find(".header .title").text(title);

            var scrollView = modalEl.modal.find("#photo_scrollView");
            var scrollViewOptions = {
                dataSource: new kendo.data.DataSource({
                    transport: {
                        read: function (options) {
                            options.success(photos);
                        }
                    }
                }),
                change: function (e) {
                    console.log(e);

                    var element = e.element.find(".pinch-zoom");
                    if (!element.hasClass("zoom")) {
                        element.addClass("zoom");
                        setTimeout(function () {
                            new PinchZoom(element[0], {
                                draggableUnzoomed: false,
                                use2d: false,
                                setOffsetsOnce: true
                            });
                        }, 250);
                    }
                }
            };

            setTimeout(function () {
                if (!modalEl.modal.find(".content").data("kendoMobileScroller")) {
                    var contentHeight = (modalEl.modal.find(".km-content").outerHeight(true) - (modalEl.modal.find(".header").outerHeight(true) + modalEl.modal.find(".footer").outerHeight(true)));
                    modalEl.modal.find(".content").css("height", contentHeight + "px");
                    modalEl.modal.find(".content").kendoMobileScroller();
                    modalEl.modal.find(".cardContainer").css("height", contentHeight + "px");

                    scrollViewOptions.contentHeight = contentHeight - 32;
                    scrollViewOptions.template = "<div class='pinch-zoom' style='width:100%;height:" + scrollViewOptions.contentHeight + "px;background-size:contain;background-position:center;background-repeat:no-repeat;background-color:black;background-image:url(#=ImageName#)'></div>";
                }
                else {
                    modalEl.modal.find(".content").data("kendoMobileScroller").contentResized();
                    modalEl.modal.find(".content").data("kendoMobileScroller").scrollTo(0, 0);
                }

                if (scrollView.data("kendoMobileScrollView")) {
                    scrollView.data("kendoMobileScrollView").setOptions(scrollViewOptions);
                }
                else {
                    scrollView.kendoMobileScrollView(scrollViewOptions);
                    scrollView.data("kendoMobileScrollView").refresh();
                }
                scrollView.data("kendoMobileScrollView").scrollTo(currentIndex);
            }, 50);
        },
        _onModalClosed: function (e) {
            Modals.PhotoViewerModal.close();
        },
        close: function () {
            var modalEl = Modals.PhotoViewerModal._getModal();

            if (!modalEl.modal || !modalEl.kendoModal) {
                return;
            }

            try {
                Modals.PhotoViewerModal._gallery.close();
            } catch (ex) { }

            modalEl.kendoModal.close();
            modalEl.modal.data("callback", null);
        }
    },
    UpdateLocationModal: {
        _record: null,
        _getModal: function () {
            var modal = $("#modal_updateLocation");
            if (modal.length === 0) {
                return {
                    modal: null,
                    kendoModal: null
                };
            }

            var kendoModal = modal.data("kendoMobileModalView");
            if (!kendoModal) {
                return {
                    modal: modal,
                    kendoModal: null
                };
            }

            return {
                modal: modal,
                kendoModal: kendoModal
            };
        },
        updateLocation: function (options, callback) {
            if (typeof options === "function") {
                callback = options;
                options = {};
            }
            else {
                options = options || {};
            }

            var record = options.record || {};
            Modals.UpdateLocationModal._record = record;
            var modalEl = Modals.UpdateLocationModal._getModal();

            if (!modalEl.modal || !modalEl.kendoModal) {
                callback ? callback(null) : false;
                return;
            }

            if(record.ID) {
                //Update
                modalEl.modal.find(".navbar .title.add").addClass("hide");
                modalEl.modal.find(".navbar .title.update").removeClass("hide");
            }
            else {
                //Add
                modalEl.modal.find(".navbar .title.update").addClass("hide");
                modalEl.modal.find(".navbar .title.add").removeClass("hide");
            }

            modalEl.modal.data("callback", callback);
            modalEl.kendoModal.open();

            setTimeout(function () {
                var contentHeight = (modalEl.modal.find(".km-content").outerHeight(true) - (modalEl.modal.find(".header").outerHeight(true) + modalEl.modal.find(".footer").outerHeight(true)));
                var contentHeight = (modalEl.modal.find(".km-content").outerHeight(true) - (modalEl.modal.find(".header").outerHeight(true) + modalEl.modal.find(".footer").outerHeight(true)));
                modalEl.modal.find(".content").css("height", contentHeight + "px");

                if (!modalEl.modal.find(".content").data("kendoMobileScroller")) {
                    modalEl.modal.find(".content").kendoMobileScroller();
                }
                else {
                    modalEl.modal.find(".content").data("kendoMobileScroller").contentResized();
                    modalEl.modal.find(".content").data("kendoMobileScroller").scrollTo(0, 0);
                }

                /* modalEl.modal.find("#txtName").animatedInput();
                // modalEl.modal.find("#txtCountryName").animatedInput();
                // modalEl.modal.find("#txtCityName").animatedInput();
                // modalEl.modal.find("#txtAreaName").animatedInput();
                modalEl.modal.find("#txtRoadName").animatedInput();
                modalEl.modal.find("#txtBuildingNumber").animatedInput();
                modalEl.modal.find("#txtApartmentNumber").animatedInput();
                modalEl.modal.find("#txtFloor").animatedInput();
                modalEl.modal.find("#txtLandmark").animatedInput();
                modalEl.modal.find("#txtDeliveryInstructions").animatedInput(); */

                modalEl.modal.find("#txtName").val(record.name);//.trigger("input");
                modalEl.modal.find("#selCountryID").val(record.countryId);//.trigger("input");
                modalEl.modal.find("#selCityID").val(record.cityId);//.trigger("input");
                modalEl.modal.find("#selAreaID").val(record.areaId);//.trigger("input");
                modalEl.modal.find("#txtRoadName").val(record.roadName);//.trigger("input");
                modalEl.modal.find("#txtBuildingNumber").val(record.buildingNumber);//.trigger("input");
                modalEl.modal.find("#txtApartmentNumber").val(record.apartmentNumber);//.trigger("input");
                modalEl.modal.find("#txtFloor").val(record.floor);//.trigger("input");
                modalEl.modal.find("#txtLandmark").val(record.landmark);//.trigger("input");
                modalEl.modal.find("#txtDeliveryInstructions").val(record.deliveryInstructions);//.trigger("input");

                modalEl.modal.find(".form").css("opacity", "1");

                Modals.UpdateLocationModal.loadCountries(record);
                modalEl.modal.find("#selCountryID").on("change", function() {
                    record.countryId = modalEl.modal.find("#selCountryID option:selected").val();
                    Modals.UpdateLocationModal.loadCities(record);
                });
                modalEl.modal.find("#selCityID").on("change", function() {
                    record.cityId = modalEl.modal.find("#selCityID option:selected").val();
                    Modals.UpdateLocationModal.loadAreas(record);
                });
            }, 250);
        },
        loadCountries: function(record) {
            var modalEl = Modals.UpdateLocationModal._getModal();

            Data.Addresses.getCountries({}, function (err, areas) {
                if (err) {
                    return;
                }

                var contentCountries = "";
                areas.forEach(function (item) {
                    var selected = item.id == record.countryId ? "selected" : "";
                    contentCountries += "<option value='" + item.id + "' " + selected + ">" + item.name + "</option>";
                });
                modalEl.modal.find("#selCountryID").html(contentCountries).trigger("change");
            });
        },
        loadCities: function(record) {
            var modalEl = Modals.UpdateLocationModal._getModal();

            Data.Addresses.getCities({countryId:record.countryId}, function (err, areas) {
                if (err) {
                    return;
                }

                var contentCities = "";
                areas.forEach(function (item) {
                    var selected = item.id == record.cityId ? "selected" : "";
                    contentCities += "<option value='" + item.id + "' countryID='" + item.countryId + "' " + selected + ">" + item.name + "</option>";
                });
                modalEl.modal.find("#selCityID").html(contentCities).trigger("change");
            });
        },
        loadAreas: function(record) {
            var modalEl = Modals.UpdateLocationModal._getModal();

            Data.Addresses.getAreas({cityId:record.cityId,countryId:record.countryId}, function (err, areas) {
                if (err) {
                    return;
                }

                var contentAreas = "";
                areas.forEach(function (item) {
                    var selected = item.id == record.areaId ? "selected" : "";
                    contentAreas += "<option value='" + item.id + "' cityID='" + item.cityId + "' countryID='" + item.countryId + "' " + selected + ">" + item.name + "</option>";
                });
                modalEl.modal.find("#selAreaID").html(contentAreas).trigger("change");
            });
        },
        saveChanges: function (e) {
            var modalEl = Modals.UpdateLocationModal._getModal();

            if (!modalEl.modal || !modalEl.kendoModal) {
                return;
            }

            var name = modalEl.modal.find("#txtName").val();
            // var countryName = modalEl.modal.find("#txtCountryName").val();
            // var cityName = modalEl.modal.find("#txtCityName").val();
            // var areaName = modalEl.modal.find("#txtAreaName").val();
            var areaId = modalEl.modal.find("#selAreaID option:selected").val();
            var cityId = modalEl.modal.find("#selCityID option:selected").val();
            var countryId = modalEl.modal.find("#selCountryID option:selected").val();
            var roadName = modalEl.modal.find("#txtRoadName").val();
            var buildingNumber = modalEl.modal.find("#txtBuildingNumber").val();
            var apartmentNumber = modalEl.modal.find("#txtApartmentNumber").val();
            var floor = modalEl.modal.find("#txtFloor").val();
            var landmark = modalEl.modal.find("#txtLandmark").val();
            var deliveryInstructions = modalEl.modal.find("#txtDeliveryInstructions").val();

            var record = Object.assign(Modals.UpdateLocationModal._record, {
                customerId: cachedUser.id,
                name: name,
                // CountryName: countryName,
                // CityName: cityName,
                // AreaName: areaName,
                areaId: areaId,
                cityId: cityId,
                countryId: countryId,
                roadName: roadName,
                buildingNumber: buildingNumber,
                apartmentNumber: apartmentNumber,
                floor: floor,
                landmark: landmark,
                deliveryInstructions: deliveryInstructions
            });

            if (Modals.UpdateLocationModal._record.id != 0) {
                Data.Addresses.updateAddress(record, function (err, result) {
                    if (err) {
                        _alert("_serverError", err);
                        return;
                    }

                    Modals.UpdateLocationModal.close(record);
                });
            }
            else {
                Data.Addresses.addAddress(record, function (err, result) {
                    if (err) {
                        _alert("_serverError", err);
                        return;
                    }

                    Modals.UpdateLocationModal.close(record);
                });
            }
        },
        _onModalClosed: function (e) {
            Modals.UpdateLocationModal.close();
        },
        close: function (record) {
            var modalEl = Modals.UpdateLocationModal._getModal();

            if (!modalEl.modal || !modalEl.kendoModal) {
                return;
            }

            try {
                modalEl.modal.find(".form").css("opacity", "0");
                modalEl.modal.find("#selAreaID").html("");
            } catch (ex) { }

            modalEl.modal.find("#selCountryID").off("change");
            modalEl.modal.find("#selCityID").off("change");

            modalEl.kendoModal.close();
            if (modalEl.modal.data("callback")) {
                var callbackData = record || Modals.UpdateLocationModal._record;
                modalEl.modal.data("callback")(callbackData.id ? callbackData : null);
            }
            modalEl.modal.data("callback", null);
        }
    },
    SelectLocationModal: {
        _getModal: function () {
            var modal = $("#modal_selectLocation");
            if (modal.length === 0) {
                return {
                    modal: null,
                    kendoModal: null
                };
            }

            var kendoModal = modal.data("kendoMobileModalView");
            if (!kendoModal) {
                return {
                    modal: modal,
                    kendoModal: null
                };
            }

            return {
                modal: modal,
                kendoModal: kendoModal
            };
        },
        selectLocation: function (options, callback) {
            if (typeof options === "function") {
                callback = options;
                options = {};
            }
            else {
                options = options || {};
            }

            var record = options.record || {};
            Modals.SelectLocationModal._record = record;
            var modalEl = Modals.SelectLocationModal._getModal();

            if (!modalEl.modal || !modalEl.kendoModal) {
                callback ? callback(null) : false;
                return;
            }

            modalEl.modal.data("callback", callback);
            modalEl.kendoModal.open();

            setTimeout(function () {
                var contentHeight = (modalEl.modal.find(".km-content").outerHeight(true) - (modalEl.modal.find(".header").outerHeight(true) + modalEl.modal.find(".footer").outerHeight(true)));
                var contentHeight = (modalEl.modal.find(".km-content").outerHeight(true) - (modalEl.modal.find(".header").outerHeight(true) + modalEl.modal.find(".footer").outerHeight(true)));
                modalEl.modal.find(".content").css("height", contentHeight + "px");

                if (!modalEl.modal.find(".content").data("kendoMobileScroller")) {
                    modalEl.modal.find(".content").kendoMobileScroller();
                }
                else {
                    modalEl.modal.find(".content").data("kendoMobileScroller").contentResized();
                    modalEl.modal.find(".content").data("kendoMobileScroller").scrollTo(0, 0);
                }

                if (!modalEl.modal.find("#modal_addressesList").data("kendoMobileListView")) {
                    modalEl.modal.find("#modal_addressesList").kendoMobileListView({
                        dataSource: new kendo.data.DataSource({
                            transport: {
                                read: function (options) {
                                    Data.User.getAddressses({
                                        customerId: cachedUser.id
                                    }, function (err, data) {
                                        if (err) {
                                            options.success([]);
                                            return;
                                        }

                                        options.success(data);
                                    })
                                }
                            }
                        }),
                        template: modalEl.modal.find("#modal_addressesTemplate").html()
                    })
                }
                else {
                    modalEl.modal.find("#modal_addressesList").data("kendoMobileListView").dataSource.read();
                }
            }, 250);
        },
        onLocationSelected: function (e, uid) {
            try {
                e.preventDefault();
                e.stopPropagation();
            } catch (ex) { }

            var modalEl = Modals.SelectLocationModal._getModal();

            if (!modalEl.modal || !modalEl.kendoModal) {
                return;
            }

            var dataSource = modalEl.modal.find("#modal_addressesList").data("kendoMobileListView").dataSource;
            var dataItem = dataSource.getByUid(uid);

            if (dataItem) {
                Modals.SelectLocationModal.close(dataItem.toJSON());
            }
        },
        _onModalClosed: function (e) {
            Modals.SelectLocationModal.close();
        },
        close: function (record) {
            var modalEl = Modals.SelectLocationModal._getModal();

            if (!modalEl.modal || !modalEl.kendoModal) {
                return;
            }

            try {
                modalEl.modal.find("#modal_addressesList").data("kendoMobileListView").dataSource.data([]);
            } catch (ex) { }

            modalEl.kendoModal.close();
            if (modalEl.modal.data("callback")) {
                var callbackData = record || Modals.SelectLocationModal._record;
                modalEl.modal.data("callback")(callbackData);
            }
            modalEl.modal.data("callback", null);
        }
    },
    AlertModal: {
        _getModal: function () {
            var modal = $("#modal_alert");
            if (modal.length === 0) {
                return {
                    modal: null,
                    kendoModal: null
                };
            }

            var kendoModal = modal.data("kendoMobileModalView");
            if (!kendoModal) {
                return {
                    modal: modal,
                    kendoModal: null
                };
            }

            return {
                modal: modal,
                kendoModal: kendoModal
            };
        },
        success: function (options, callback) {
            if (typeof options === "function") {
                callback = options;
                options = {};
            }
            else {
                options = options || {};
            }

            var modalEl = Modals.AlertModal._getModal();

            if (!modalEl.modal || !modalEl.kendoModal) {
                callback ? callback(null) : false;
                return;
            }

            modalEl.modal.attr("alert-type", "success");
            if (options.title) {
                modalEl.modal.find(".title").removeClass("hide").html(TranslationManager.translate(options.title));
            }
            else {
                modalEl.modal.find(".title").addClass("hide");
            }
            if (options.message) {
                modalEl.modal.find(".message").removeClass("hide").html(TranslationManager.translate(options.message));
            }
            else {
                modalEl.modal.find(".message").addClass("hide");
            }
            modalEl.modal.find(".action.action-ok").html(options.btnOk ? TranslationManager.translate(options.btnOk) : "OK");

            modalEl.modal.data("callback", callback);
            modalEl.kendoModal.open();

            setTimeout(function () {
                var contentHeight = (modalEl.modal.find(".km-content").outerHeight(true) - (modalEl.modal.find(".header").outerHeight(true) + modalEl.modal.find(".footer").outerHeight(true)));
                var contentHeight = (modalEl.modal.find(".km-content").outerHeight(true) - (modalEl.modal.find(".header").outerHeight(true) + modalEl.modal.find(".footer").outerHeight(true)));
                modalEl.modal.find(".content").css("height", contentHeight + "px");

                if (!modalEl.modal.find(".content").data("kendoMobileScroller")) {
                    modalEl.modal.find(".content").kendoMobileScroller();
                }
                else {
                    modalEl.modal.find(".content").data("kendoMobileScroller").contentResized();
                    modalEl.modal.find(".content").data("kendoMobileScroller").scrollTo(0, 0);
                }

            }, 250);
        },
        _onOkClicked: function (e, uid) {
            try {
                e.preventDefault();
                e.stopPropagation();
            } catch (ex) { }

            var modalEl = Modals.AlertModal._getModal();

            if (!modalEl.modal || !modalEl.kendoModal) {
                return;
            }

            Modals.AlertModal.close(1);
        },
        _onModalClosed: function (e) {
            Modals.AlertModal.close();
        },
        close: function (record) {
            var modalEl = Modals.AlertModal._getModal();

            if (!modalEl.modal || !modalEl.kendoModal) {
                return;
            }

            modalEl.kendoModal.close();
            if (modalEl.modal.data("callback")) {
                modalEl.modal.data("callback")(record);
            }
            modalEl.modal.data("callback", null);
        }
    }
}
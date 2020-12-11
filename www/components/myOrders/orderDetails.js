var orderDetailsView = (function (_this) {
    _this.viewModel = {
        view: null,
        onlineListener: null,
        offlineListener: null,
        previousView: null,
        currentFilters: null,
        record: null,
        summary: null,
        orderItemsDS: new kendo.data.DataSource({
            transport: {
                read: function (options) {
                    if (!appIsOnline) {
                        _alert("", "_offline");
                        options.success([]);
                        return;
                    }

                   /* Data.Orders.getOrderDetails({
                        orderId: _this.viewModel.record.id
                    }, function (err, result) {
                        if (err) {
                            _alert("error", err);
                            options.success([]);
                            return;
                        }*/

                        var data = _this.viewModel.record.items.map(function (item) {
                            item["itemImage"] = getURL(item["itemImage"]);
                            item.currentCurrency = currentCurrency;

                            if (item.itemId == 0) {
                                item.itemImage = './images/logo.png';
                                item.itemEName =  item.promotionName;
                                item.itemAName =  item.promotionAName;
                                item.priceString = '';
                            }else{
                                if (item.isPromotionItem && item.price == 0) {
                                    item.priceString = 'Free';
                                }
                                else {
                                    item.priceString = item.price + ' ' + currentCurrency;
                                }
                            }

                            

                            return item;
                        });

                        options.success(data);
                   // });
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

            if (e.view.params.preserveState == 1) {
                console.log("Preserving state...");
                return;
            }

            if (view.find(".content").data("kendoMobileScroller")) {
                view.find(".content").data("kendoMobileScroller").contentResized();
                view.find(".content").data("kendoMobileScroller").scrollTo(0, 0);
            }

            _this.viewModel.orderItemsDS.data([]);
            _this.viewModel.view.find("#lblOrderStatus").text(currentLanguage == 'ar' ? _this.viewModel.record.orderStatus.aName : _this.viewModel.record.orderStatus.eName);
            _this.viewModel.view.find("#lblOrderNumber").text(currentLanguage == 'ar' ? _this.viewModel.record.orderNo+"#" :"#"+_this.viewModel.record.orderNo);
            _this.viewModel.view.find("#lblOrderDate").text(moment(_this.viewModel.record.orderDate).format("DD-MM-YYYY (hh:mm A)"));

            var listView = view.find("#orderItemsList");
            if (!listView.data("kendoMobileListView")) {
                listView.kendoMobileListView({
                    dataSource: _this.viewModel.orderItemsDS,
                    template: $("#orderItemsListTemplate").html(),
                    dataBound: function (e) {

                        // _this.viewModel.calculateTotals();
                        _this.viewModel.renderSummary();
                        if (this.dataSource.data().length == 0) {
                            if (this.dataSource.loading) {
                                //return listView.append('<div class="loading"></div>');
                                return;
                            }
                            return listView.append('<div class="no-data-found">' + TranslationManager.translate("general.noDataFound") + '</div>');
                        }
                        e.sender.element.find("li").each(function (index) {
                            var li = $(this);
                            li.find(".item-name").dotdotdot();
                            li.find(".item-image").setBackgroundImage([li.find(".item-image").attr("background-image"), li.find(".item-image").attr("alt-background-image")], "./images/placeholder.png");

                            setTimeout(function () {
                                li.find(".list-item").addClass("visible");
                            }, (index * 100));
                        });
                    }
                })
            }
            else {
                _this.viewModel.orderItemsDS.read(_this.viewModel.currentFilters);
            }

            _this.viewModel.onlineListener = DelegateManager.registerEvent("app:online", function () {
                _this.viewModel.ordersDS.read(_this.viewModel.currentFilters);
            });
            _this.viewModel.offlineListener = DelegateManager.registerEvent("app:offline", function () {

            });
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
        calculateTotals: function () {
            var items = _this.viewModel.orderItemsDS.data();

            var subTotal = 0;
            var discount = 0;
            var tax = 0;
            var total = 0;
            var delivery = parseFloatNumber(_this.viewModel.record.deliveryAmount || "0");

            items.forEach(function (item) {
                subTotal += parseFloatNumber(item.subTotal);
                discount += parseFloatNumber(item.discountAmount);
                tax += parseFloatNumber(item.taxAmount);
                total += parseFloatNumber(item.total);
            });

            _this.viewModel.summary = {
                subtotal: subTotal,
                discount: discount,
                tax: tax,
                delivery: delivery,
                total: total + delivery
            };

            _this.viewModel.renderSummary();
        },
        renderSummary: function () {
            var section = _this.viewModel.view.find("#section-summary");
            section.find(".total-detail.subtotal .value").html(kendo.toString(_this.viewModel.record.subtotalAmount, "n2") + " " + currentCurrency);
            section.find(".total-detail.discount .value").html(kendo.toString(_this.viewModel.record.discountAmount, "n2") + " " + currentCurrency);
            section.find(".total-detail.tax .value").html(kendo.toString(_this.viewModel.record.taxAmount, "n2") + " " + currentCurrency);
            section.find(".total-detail.delivery .value").html(kendo.toString(_this.viewModel.record.deliveryAmount, "n2") + " " + currentCurrency);
            section.find(".total-detail.total .value").html(kendo.toString(_this.viewModel.record.totalAmount, "n2") + " " + currentCurrency);
        }
    }

    return _this.viewModel;
})({});
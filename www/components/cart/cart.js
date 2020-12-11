var cartView = (function (_this) {
    _this.viewModel = {
        view: null,
        previousView: null,
        cartListener: null,
        itemsDS: new kendo.data.DataSource({
            transport: {
                read: function (options) {
                    console.log(MyCart.getCartItems());
                    options.success(MyCart.getCartItems());
                }
            },
            schema: {
                model: {
                    id: "id"
                }
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
                return;
            }

            try {
                _this.viewModel.view.find(".list-container").data("kendoMobileScroller").contentResized();
                _this.viewModel.view.find(".list-container").data("kendoMobileScroller").scrollTo(0, 0);
            }
            catch (ex) { }

            var listView = view.find("#itemsList");
            if (!listView.data("kendoMobileListView")) {
                listView.kendoMobileListView({
                    dataSource: _this.viewModel.itemsDS,
                    template: $("#cartItemsListTemplate").html(),
                    dataBound: function (e) {
                        if (this.dataSource.data().length == 0) {
                            return listView.append('<div class="no-data-found">' + TranslationManager.translate("general.noDataFound") + '</div>');
                        }
                        e.sender.element.find("li").each(function (index) {
                            var li = $(this);
                            li.find(".item-name").dotdotdot();
                            li.find(".item-image").setBackgroundImage(li.find(".item-image").attr("background-image"));

                            setTimeout(function () {
                                li.find(".list-item").addClass("visible");
                            }, (index * 100));

                            var listItem = li.find(".list-item");
                            listItem.kendoTouch({
                                enableSwipe: true,
                                swipe: function (e) {
                                    if (currentLanguage == "en" && e.direction == "left") {
                                        if (listItem.hasClass("slide")) {
                                            return;
                                        }
                                        listView.find(".slide").removeClass("slide");
                                        listItem.addClass("slide");
                                    }
                                    else if (currentLanguage == "ar" && e.direction == "right") {
                                        if (listItem.hasClass("slide")) {
                                            return;
                                        }
                                        listView.find(".slide").removeClass("slide");
                                        listItem.addClass("slide");
                                    }
                                    else {
                                        listItem.removeClass("slide");
                                    }
                                }
                            });
                            listItem.on("click", function (e) {
                                try {
                                    e.preventDefault();
                                    e.stopPropagation();
                                } catch (ex) { }

                                listItem.removeClass("slide");
                            });
                        })
                    }
                })
            }
            else {
                listView.data("kendoMobileListView").dataSource.read();
            }
        },
        onHide: function (e) {
            DelegateManager.unregisterEvent(_this.viewModel.cartListener);
            _this.viewModel.cartListener = null;
        },
        back: function (e) {
            if (_this.viewModel.previousView) {
                navigate(_this.viewModel.previousView);
            }
            else {
                navigate("#:back");
            }
        },
        setupCart: function () {
            var cartBtn = _this.viewModel.view.find(".cartButton");

            function onCartUpdated(item) {
                var noOfItems = MyCart.getNoOfItems();

                cartBtn.find(".cartCount").text(noOfItems);
                _this.viewModel.view.find("#cart-count").text(noOfItems);

                if (noOfItems == 0) {
                    _this.viewModel.view.find(".footer.action").addClass("disabled");
                }
                else {
                    _this.viewModel.view.find(".footer.action").removeClass("disabled");
                }

                _this.viewModel.calculateOrder();
            }

            _this.viewModel.cartListener = DelegateManager.registerEvent("cart::updated", function (item) {
                onCartUpdated(item);
            });
            onCartUpdated();
        },
        removeFromCart: function (e) {
            var li = $(e.target).closest("li");
            var uid = li.data("uid");
            var item = _this.viewModel.itemsDS.getByUid(uid);

            MyCart.removeItem(item.toJSON());
            _this.viewModel.itemsDS.read().then(function () {
                _this.viewModel.view.find(".list-container").fixScroll();
            })
        },
        increaseQty: function (e) {
            var li = $(e.target).closest("li");
            var uid = li.data("uid");
            var item = _this.viewModel.itemsDS.getByUid(uid);

            var newQty = MyCart.increaseQty(item);
            item.qty = newQty;
            li.find(".item-count-qty").text(newQty);
        },
        decreaseQty: function (e) {
            var li = $(e.target).closest("li");
            var uid = li.data("uid");
            var item = _this.viewModel.itemsDS.getByUid(uid);

            var newQty = MyCart.decreaseQty(item);
            item.qty = newQty;
            li.find(".item-count-qty").text(newQty);
        },
        clearCart: function (e) {
            try {
                e.preventDefault();
                e.stopPropagation();
            } catch (ex) { }

            _confirm(TranslationManager.translate("messages._warning"), function (buttonIndex) {

                if (buttonIndex == 2) {
                    MyCart.clearCart();
                    _this.viewModel.itemsDS.read();
                }

            }, TranslationManager.translate("messages.confirmClearCart"), [TranslationManager.translate("messages._no"), TranslationManager.translate("messages._yes")])
        },
        calculateOrder: function () {
            var items = MyCart.getCartItems();

            var subTotal = 0;
            var discount = 0;
            var tax = 0;
            var total = 0;
            var delivery = parseFloatNumber(getSystemParameter("DeliveryRate", 0));
            if (cachedUser.hasOwnProperty("deliveryRate")){
                delivery=cachedUser.deliveryRate;
            }

            items.forEach(function (item) {
                var itemSubTotal = parseFloatNumber(item.qty * item.price);
                var itemDiscount = parseFloatNumber(itemSubTotal * item.discountRate);
                var itemTax = parseFloatNumber(parseFloatNumber(itemSubTotal - itemDiscount) * item.tax.rate);
                var itemTotal = parseFloatNumber(itemSubTotal - itemDiscount + itemTax);

                subTotal = parseFloatNumber(subTotal) + itemSubTotal;
                discount = parseFloatNumber(discount) + itemDiscount;
                tax = parseFloatNumber(tax) + itemTax;
                total = parseFloatNumber(total) + itemTotal;
            });

            var grid = _this.viewModel.view.find(".cart-totals");
            grid.find(".total-detail.subtotal .value").html(kendo.toString(subTotal, "n2") + " " + currentCurrency);
            grid.find(".total-detail.discount .value").html(kendo.toString(discount, "n2") + " " + currentCurrency);
            grid.find(".total-detail.tax .value").html(kendo.toString(tax, "n2") + " " + currentCurrency);
            grid.find(".total-detail.delivery .value").html(kendo.toString(delivery, "n2") + " " + currentCurrency);
            grid.find(".total-detail.total .value").html(kendo.toString(total, "n2") + " " + currentCurrency);
        },
        checkout: function () {
            if (MyCart.getNoOfItems() == 0) {
                _alert("_error", "cart.noItemsInCart");
                return;
            }

            var order = {};
            var items = MyCart.getCartItems().filter(function (item) {
                //check with client to exclude offers
                return !item.isOffer;
            });

            var invoiceItems = {};
            var subTotal = 0;
            var discount = 0;
            var tax = 0;
            var total = 0;
            var delivery = parseFloatNumber(getSystemParameter("DeliveryRate", 0));
            if (cachedUser.hasOwnProperty("deliveryRate")){
                delivery=cachedUser.deliveryRate;
            }
            items.forEach(function (item) {
                var itemSubTotal = parseFloatNumber(item.qty * item.price);
                var itemDiscount = parseFloatNumber(itemSubTotal * item.discountRate);
                var itemTax = parseFloatNumber(parseFloatNumber(itemSubTotal - itemDiscount) * item.tax.rate);
                var itemTotal = parseFloatNumber(itemSubTotal - itemDiscount + itemTax);

                subTotal = parseFloatNumber(subTotal) + itemSubTotal;
                discount = parseFloatNumber(discount) + itemDiscount;
                tax = parseFloatNumber(tax) + itemTax;
                total = parseFloatNumber(total) + itemTotal;

                invoiceItems[item.id] = {
                    qty: item.qty,
                    amount: total,
                    price: item.price,
                    id: item.id,
                    taxRate: item.tax.rate

                }
            });

            order.items = invoiceItems;
            order.summary = MyCart.getSummary();
            if (!getSystemParameter("EnablePromotions", false)) {
                navigate("components/checkout/checkout.html");
            }
            else {
                Promotions.checkPromotions(order, function (promotions) {
                    checkoutView.promotionsItems=promotions;
                     navigate("components/checkout/checkout.html");
                 });
            }
           


        }
    }

    return _this.viewModel;
})({});
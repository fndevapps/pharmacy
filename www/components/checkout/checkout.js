var checkoutView = (function (_this) {
    _this.viewModel = {
        view: null,
        previousView: null,
        cartListener: null,
        languageChangedListener: null,
        currentAddress: null,
        paymentMethods: [],
        summary: null,
        promotionsItems: [],
        onInit: function (e) {
            var view = e.view.element;
            _this.viewModel.view = view;

            layoutView(e, {}, function () {
                view.find(".container").css("height", (view.find(".content").height() - view.find("#itemsListHeader").outerHeight(true)) + "px");
            });
        },
        onShow: function (e) {
            var view = e.view.element;

            setupUserUI();

            _this.viewModel.setupCart();

            if (e.view.params.preserveState == 1) {
                return;
            }

            if (view.find(".content").data("kendoMobileScroller")) {
                view.find(".content").data("kendoMobileScroller").contentResized();
                view.find(".content").data("kendoMobileScroller").scrollTo(0, 0);
            }

            if (!getSystemParameter("EnablePromoCode", false)) {
                _this.viewModel.view.find("#section-promo-code").addClass("disabled");
            }
            else {
                _this.viewModel.view.find("#section-promo-code").removeClass("disabled");
            }

            if (!getSystemParameter("EnablePromotions", false)) {
                _this.viewModel.view.find("#section-promotions").hide();
            }
            else {
                _this.viewModel.view.find("#section-promotions").show();
                _this.viewModel.loadPromotions();
            }

            _this.viewModel.view.find(".footer.action").addClass("disabled");

            _this.viewModel.currentAddress = null;
            _this.viewModel.renderAddress();
            _this.viewModel.loadUserDetails();

            _this.viewModel.languageChangedListener = DelegateManager.registerEvent("language_changed", function () {
                _this.viewModel.renderPaymentMethods();
            });
        },
        onHide: function (e) {
            DelegateManager.unregisterEvent(_this.viewModel.cartListener);
            _this.viewModel.cartListener = null;

            DelegateManager.unregisterEvent(_this.viewModel.languageChangedListener);
            _this.viewModel.languageChangedListener = null;
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
        setupCart: function () {
            var cartBtn = _this.viewModel.view.find(".cartButton");

            function onCartUpdated() {
                var noOfItems = MyCart.getNoOfItems();

                cartBtn.find(".cartCount").text(noOfItems);

                _this.viewModel.validateOrder();
                _this.viewModel.calculateOrder();
            }

            _this.viewModel.cartListener = DelegateManager.registerEvent("cart::updated", function (item) {
                onCartUpdated(item);
            });
            onCartUpdated();
        },
        getAllCartItemsWithPromotions: function () {
            //Gets all cart items + promotions items
            var items = [].concat(MyCart.getCartItems());
            items = items.concat(_this.viewModel.promotionsItems);
            return items;
        },
        calculateOrder: function () {
            var items = _this.viewModel.getAllCartItemsWithPromotions();

            var subTotal = 0;
            var discount = 0;
            var tax = 0;
            var total = 0;
            var delivery = parseFloatNumber(getSystemParameter("DeliveryRate", 0));
            if (cachedUser.hasOwnProperty("deliveryRate")) {
                delivery = cachedUser.deliveryRate;
            }

            //invoiceTaxRate represents the tax rate of the total invoice
            //This is used to re-calculate the tax + total IF an invoice level promotion is applied
            var invoiceTaxRate = 0;
            //First loop to get subtotal and tax before applying promotions
            items.filter(function (item) { return !item.isPromotionItem; }).forEach(function (item) {
                var itemSubTotal = parseFloatNumber(item.qty * item.price);
                var itemDiscount = parseFloatNumber(itemSubTotal * item.discountRate);
                var itemTax = parseFloatNumber(parseFloatNumber(itemSubTotal - itemDiscount) * item.tax.rate);
                var itemTotal = parseFloatNumber(itemSubTotal - itemDiscount + itemTax);

                subTotal = parseFloatNumber(subTotal) + itemSubTotal;
                discount = parseFloatNumber(discount) + itemDiscount;
                tax = parseFloatNumber(tax) + itemTax;
                total = parseFloatNumber(total) + itemTotal;
            });
            invoiceTaxRate = parseFloatNumber(tax / parseFloatNumber(subTotal + discount));
            console.log("invoiceTaxRate ", invoiceTaxRate);

            subTotal = 0;
            discount = 0;
            tax = 0;
            total = 0;

            //Loop through all NON ITEMS (invoice promotion)
            items.filter(function (item) { return item.id == 0; }).forEach(function (item) {
                discount = parseFloatNumber(discount) + parseFloatNumber(item.discountAmount || 0);
            });
            console.log("discount ", discount);

            //Loop through all ITEMS including promotion items
            items.filter(function (item) { return item.id != 0; }).forEach(function (item) {
                console.log("item ", item)
                var itemSubTotal = 0;
                var itemDiscount = 0;
                var itemTax = 0;
                var itemTotal = 0;

                if (item.excludeFromSubTotal) {
                    itemSubTotal = 0;
                    itemDiscount = item.discountAmount;
                    itemTax = 0;
                    itemTotal = item.total;
                }
                else {
                    itemSubTotal = parseFloatNumber(item.qty * item.price);
                    itemDiscount = parseFloatNumber(itemSubTotal * item.discountRate);
                    itemTax = parseFloatNumber(parseFloatNumber(itemSubTotal - itemDiscount) * item.tax.rate);
                    itemTotal = parseFloatNumber(itemSubTotal - itemDiscount + itemTax);
                }

                subTotal = parseFloatNumber(subTotal) + itemSubTotal;
                discount = parseFloatNumber(discount) + itemDiscount;
                tax = parseFloatNumber(tax) + itemTax;
                total = parseFloatNumber(total) + itemTotal;
            });

            console.log(subTotal, discount, invoiceTaxRate);

            tax = parseFloatNumber(parseFloatNumber(subTotal - discount) * invoiceTaxRate);
            total = parseFloatNumber(subTotal) - parseFloatNumber(discount) + parseFloatNumber(tax);

            _this.viewModel.summary = {
                subtotal: subTotal,
                discount: discount,
                tax: tax,
                delivery: delivery,
                total: total + delivery
            };
            //_this.viewModel.summary = MyCart.getSummary();
            _this.viewModel.renderSummary();
        },
        placeOrder: function () {
            if (MyCart.getNoOfItems() == 0) {
                _alert("_error", "cart.noItemsInCart");
                return;
            }

            var subTotal = 0;
            var discount = 0;
            var tax = 0;
            var total = 0;

            var cartItems = _this.viewModel.getAllCartItemsWithPromotions();
            console.log("cartItems ", cartItems);
            var order = {
                customerId: cachedUser.id,
                customerEName: cachedUser.eName,
                customerAName: cachedUser.aName,
                customerLocationId: (function () {
                    var locID = 0;

                    try {
                        locID = _this.viewModel.currentAddress.id || 0;
                    }
                    catch (ex) {
                        locID = 0;
                    }

                    return locID;
                }()),
                customerLocationName: (function () {
                    var locName = "";

                    try {
                        locName = _this.viewModel.currentAddress.name || "";
                    }
                    catch (ex) {
                        locName = 0;
                    }

                    return locName;
                }()),
                customerLocationCountryId: (function () {
                    var locID = 0;

                    try {
                        locID = _this.viewModel.currentAddress.countryId || 0;
                    }
                    catch (ex) {
                        locID = 0;
                    }

                    return locID;
                }()),
                customerLocationCityId: (function () {
                    var locID = 0;

                    try {
                        locID = _this.viewModel.currentAddress.cityId || 0;
                    }
                    catch (ex) {
                        locID = 0;
                    }

                    return locID;
                }()),
                customerLocationAreaId: (function () {
                    var locID = 0;

                    try {
                        locID = _this.viewModel.currentAddress.areaId || 0;
                    }
                    catch (ex) {
                        locID = 0;
                    }

                    return locID;
                }()),
                customerLocationRoadName: (function () {
                    var locID = "";

                    try {
                        locID = _this.viewModel.currentAddress.roadName || "";
                    }
                    catch (ex) {
                        locID = "";
                    }

                    return locID;
                }()),
                customerLocationNeighborhood: (function () {
                    var locID = "";

                    try {
                        locID = _this.viewModel.currentAddress.neighborhood || "";
                    }
                    catch (ex) {
                        locID = "";
                    }

                    return locID;
                }()),
                subtotalAmount: _this.viewModel.summary.subtotal,
                discountAmount: _this.viewModel.summary.discount,
                taxAmount: _this.viewModel.summary.tax,
                deliveryAmount: _this.viewModel.summary.delivery,
                totalAmount: _this.viewModel.summary.total,
                noOfItems: cartItems.length,
                paymentTypeId: (function () {
                    var paymentTypeID = 0;
                    try {
                        paymentTypeID = _this.viewModel.paymentMethods.filter(function (item) {
                            return item.isSelected;
                        })[0].id;
                    }
                    catch (ex) {
                        paymentTypeID = 0;
                    }

                    return paymentTypeID;
                })(),
                currencyId: 1,
                deliveryNotes: "Do no rung the bell!",
                items: cartItems.map(function (item) {
                    var itemSubTotal = parseFloatNumber(item.qty * item.price);
                    var itemDiscount = parseFloatNumber(itemSubTotal * item.discountRate);
                    var itemTax = parseFloatNumber(parseFloatNumber(itemSubTotal - itemDiscount) * item.tax.rate);
                    var itemTotal = parseFloatNumber(itemSubTotal - itemDiscount + itemTax);

                    subTotal = parseFloatNumber(subTotal) + itemSubTotal;
                    discount = parseFloatNumber(discount) + itemDiscount;
                    tax = parseFloatNumber(tax) + itemTax;
                    total = parseFloatNumber(total) + itemTotal;

                    return {
                        orderId: 0,
                        itemId: item.id,
                        price: item.price,
                        qty: item.qty,
                        subTotal: itemSubTotal,
                        taxRate: item.tax.rate,
                        taxName: item.taxEName,
                        taxId: item.taxId,
                        taxAmount: itemTax,
                        discountRate: item.discountRate,
                        discountAmount: itemDiscount,
                        total: itemTotal,
                        isPromotionItem: item.isPromotionItem || false,
                        promotionId: item.promotionId || 0,
                        promotionDetailId: item.promotionDetailId || 0,
                        qtyOfDiscountItems: item.qtyOfDiscountItems || 0,
                        tenantId: tenantID
                    };
                })
            }

            console.log(order)

            Data.Orders.saveOrder({
                order: order
            }, function (err, result) {
                if (err) {
                    console.error(err);
                    _alert("_failed", err);
                    return;
                }

                /* _alert("", "cart.orderPlacedSuccessfully", function () {
                    MyCart.clearCart();
                    navigate("components/home/home.html", "fade");
                }); */

                Modals.AlertModal.success({
                    title: "checkout.thankYou",
                    message: "cart.orderPlacedSuccessfully",
                    btnOk: "checkout.goBackHome"
                }, function (buttonIndex) {
                    MyCart.clearCart();
                    navigate("components/home/home.html", "fade");
                });
            })

            /* showLoading();
            setTimeout(function () {
                hideLoading();
                _alert("", "cart.orderPlacedSuccessfully", function () {
                    MyCart.clearCart();
                    _this.viewModel.back();
                });
            }, 2000); */
        },
        loadUserDetails: function () {
            Data.User.getAddressses({
                customerId: cachedUser.id
            }, function (err, addresses) {
                if (err) {
                    return;
                }

                _this.viewModel.currentAddress = null;
                _this.viewModel.addresses = addresses;

                if (addresses.length > 0) {
                    //Get first DEFAULT address
                    _this.viewModel.currentAddress = addresses.sort(function (a, b) {
                        return b.isDefault - a.isDefault;
                    })[0];
                }

                _this.viewModel.validateOrder();
                _this.viewModel.renderAddress();

                /* var contentAreas = "";
                addresses.forEach(function (item) {
                    contentAreas += "<option value='" + item.ID + "'>" + item.Name + "</option>";
                });
                _this.viewModel.view.find("#selAddressID").html(contentAreas).trigger("change");

                if (addresses.length == 0) {
                    _this.viewModel.view.find(".footer.action").addClass("disabled");
                    _this.viewModel.view.find("#selAddressID").addClass("hide");
                    _this.viewModel.view.find("#btnAddAddress").removeClass("hide");
                }
                else {
                    _this.viewModel.view.find(".footer.action").removeClass("disabled");
                    _this.viewModel.view.find("#btnAddAddress").addClass("hide");
                    _this.viewModel.view.find("#selAddressID").removeClass("hide");
                } */
            });

            Data.PaymentMethods.getPaymentMethods({}, function (err, data) {
                if (err) {
                    return;
                }

                _this.viewModel.paymentMethods = data.map(function (item, index) {
                    item.isSelected = index == 0;
                    return item;
                });
                _this.viewModel.renderPaymentMethods();
            });
        },
        addAddress: function (e) {
            try {
                e.preventDefault();
                e.stopPropagation();
            } catch (ex) { }

            Modals.UpdateLocationModal.updateLocation({
                record: {
                    id: 0,
                    name: "",
                    cityId: 0,
                    // cityCode: "0",
                    // cityName: "",
                    countryId: 0,
                    // countryCode: "0",
                    // countryName: "",
                    areaId: 0,
                    // areaCode: "0",
                    //areaName: "",
                    roadName: "",
                    buildingNumber: "",
                    apartmentNumber: "",
                    floor: "",
                    landmark: "",
                    deliveryInstructions: "",
                    latitude: "",
                    longitude: "",
                    isDefault: true
                }
            }, function (newModel) {
                console.log(newModel);
                if (!newModel) {
                    return;
                }

                _this.viewModel.loadUserDetails();
            });
        },
        selectAddress: function (e) {
            try {
                e.preventDefault();
                e.stopPropagation();
            } catch (ex) { }

            Modals.SelectLocationModal.selectLocation({}, function (location) {
                console.log(location);

                _this.viewModel.currentAddress = location;
                _this.viewModel.renderAddress();
            })
        },
        renderPaymentMethods: function () {
            var data = _this.viewModel.paymentMethods;

            var contentPaymentMethods = "";
            data.forEach(function (item) {
                contentPaymentMethods += "<div class='row'>";
                contentPaymentMethods += "<div class='title flex " + (item.isSelected ? 'bold' : '') + "' onclick='checkoutView.setPaymentMethod(event, " + item.id + ")'>" + (currentLanguage == "ar" ? item.aName : item.eName);
                if (item.isSelected) {
                    contentPaymentMethods += "<span class='checkbox'></span>";
                }
                contentPaymentMethods += "</div>"; //title
                contentPaymentMethods += "</div>"; //row

                /* if (item.CardNumber != "") {
                    contentPaymentMethods += "<div class='row'>";
                    contentPaymentMethods += "<div class='title flex'>";
                    contentPaymentMethods += "<div class='card-icon' style='-webkit-mask-image:url(\"" + getURL(item.cardTypeImage) + "\")'></div>&nbsp;" + item.cardNumber;
                    contentPaymentMethods += "</div>"; //title
                    contentPaymentMethods += "</div>"; //row
                } */
            });
            _this.viewModel.view.find("#section-payment-method .paymentMethodsList").html(contentPaymentMethods);
        },
        setPaymentMethod: function (e, id) {
            try {
                e.preventDefault();
                e.stopPropagation();
            } catch (ex) { }

            _this.viewModel.paymentMethods = _this.viewModel.paymentMethods.map(function (item) {
                item.isSelected = item.id == id;
                return item;
            });

            _this.viewModel.renderPaymentMethods();
        },
        renderAddress: function () {
            var formattedAddressParts = [];
            var formattedAddress = "";

            if (_this.viewModel.currentAddress) {
                formattedAddress = getFormattedAddress(_this.viewModel.currentAddress);
                if (formattedAddress.length > 0) {
                    formattedAddress = "<b>" + _this.viewModel.currentAddress.name + "</b><br/>" + formattedAddress;
                }

                _this.viewModel.view.find("#section-address .addressDetails .title").html(formattedAddress);
                _this.viewModel.view.find("#section-address .noAddress").addClass("hide");
                _this.viewModel.view.find("#section-address .addressDetails").removeClass("hide");
            }
            else {
                _this.viewModel.view.find("#section-address .addressDetails").addClass("hide");
                _this.viewModel.view.find("#section-address .noAddress").removeClass("hide");
            }
        },
        renderSummary: function () {
            var section = _this.viewModel.view.find("#section-summary");

            section.find(".total-detail.subtotal .value").html(kendo.toString(_this.viewModel.summary.subtotal, "n2") + " " + currentCurrency);
            section.find(".total-detail.discount .value").html(kendo.toString(_this.viewModel.summary.discount, "n2") + " " + currentCurrency);
            section.find(".total-detail.tax .value").html(kendo.toString(_this.viewModel.summary.tax, "n2") + " " + currentCurrency);
            section.find(".total-detail.delivery .value").html(kendo.toString(_this.viewModel.summary.delivery, "n2") + " " + currentCurrency);
            section.find(".total-detail.total .value").html(kendo.toString(_this.viewModel.summary.total, "n2") + " " + currentCurrency);
        },
        validateOrder: function () {
            var orderIsValid = true;

            console.log("Validating order...");

            if (MyCart.getNoOfItems() == 0) {
                orderIsValid = false;

                console.log("Cart Items Check FAILED");
            }
            if (!_this.viewModel.currentAddress) {
                orderIsValid = false;

                console.log("Current Address Check FAILED");
            }

            console.log("Validating order result: " + orderIsValid);

            if (orderIsValid) {
                _this.viewModel.view.find(".footer.action").removeClass("disabled");
            }
            else {
                _this.viewModel.view.find(".footer.action").addClass("disabled");
            }
        },
        loadPromotions: function () {
            var htmlContent = "";
            var template = $("#promotionItemTemplate").html();
            var itemTemplate = kendo.template(template);

            var promotionItems = _this.viewModel.promotionsItems;
            if (!promotionItems || promotionItems.length == 0) {
                var noPromo = {
                    name: TranslationManager.translate("general.noDataFound"),
                    aName: TranslationManager.translate("general.noDataFound"),
                    totalString: ''
                }
                htmlContent += itemTemplate(noPromo);
            } else {
                promotionItems.forEach(function (item) {
                    var templateItem = Object.assign({}, item);

                    templateItem.totalString = kendo.toString(templateItem.total, "n2") + " " + currentCurrency;

                    if (!templateItem.id) {
                        templateItem.totalString = kendo.toString(templateItem.discountRate, "n2") + '%';
                    }
                    else {
                        if (templateItem.qty > 0) {
                            templateItem.name += " x" + templateItem.qty;
                            templateItem.aName += " x" + templateItem.qty;
                        }
                        if (templateItem.total == 0) {
                            templateItem.totalString = 'Free';
                        }
                    }

                    htmlContent += itemTemplate(templateItem);
                });
            }



            _this.viewModel.view.find("#section-promotions .row-list").html(htmlContent);
        }
    }

    return _this.viewModel;
})({});
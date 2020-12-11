var homeView = (function (_this) {
    _this.viewModel = {
        view: null,
        onlineListener: null,
        offlineListener: null,
        cartListener: null,
        currentFilters: null,
        categoriesDS: new kendo.data.DataSource({
            transport: {
                read: function (options) {
                    /* var categories = [];

                    categories.push({ ID: 1, Name: "Dairy" });
                    categories.push({ ID: 2, Name: "Cheese" });
                    categories.push({ ID: 3, Name: "Juice" });
                    categories.push({ ID: 4, Name: "Chillz" });
                    categories.push({ ID: 5, Name: "Ice Cream" });

                    options.success(categories); */

                    Data.Categories.getCategories({}, function (err, data) {
                        if (err) {
                            console.error(err);
                        }

                        data = data.map(function (item) {
                            item["isOffer"] = false;
                            return item;
                        });
                        data.unshift({ id: 0, code: "0", name: "Offers", aName: "العروض", isOffer: true });

                        options.success(data);
                    })
                }
            }
        }),
        itemsDS: new kendo.data.DataSource({
            transport: {
                read: function (options) {


                    if (!options.data || (!options.data.hasOwnProperty("categoryId") && !options.data.hasOwnProperty("isOffer"))) {
                        console.log(options.data);
                        console.log(options.data.categoryId);
                        console.log(options.data.isOffer);
                        return options.success([]);
                    }
                    Data.Items.getCategoryItems({
                        categoryId: options.data.categoryId || 0,
                        isOffer: options.data.isOffer || 0
                    }, function (err, data) {
                        if (err) {
                            console.error(err);
                            options.success([]);
                            return;
                        }

                        if (data.length > 2) {
                            if (currentLanguage == "ar") {
                                _this.viewModel.view.find(".totalOfProducts").text(data.length + " مواد");
                            } else {
                                _this.viewModel.view.find(".totalOfProducts").text(data.length + " products");
                            }
                        } else {
                            if (currentLanguage == "ar") {
                                _this.viewModel.view.find(".totalOfProducts").text(data.length + " مادة");
                            } else {
                                _this.viewModel.view.find(".totalOfProducts").text(data.length + " product");
                            }
                        }



                        var items = data.map(function (item) {
                            var itemExists = MyCart.itemExists(item);

                            item["altImage"] = undefined;
                            item["image"] = getURL(item["image"]);

                            item["addedToCart"] = itemExists;
                            item["qty"] = itemExists ? MyCart.getItemByID(item.id).qty : 0;
                            return item;
                        });

                        options.success(items);
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

                var banner = view.find(".banner");
                banner.css("height", (view.find(".content").width() * 0.5) + "px");
                /* banner.kendoMobileScrollView({
                    dataSource: _this.viewModel.bannerDS,
                    template: "<div class='banner-background' style='background-image:url(\"#=Image#\")'></div>",
                    contentHeight: banner.height() + "px",
                    enablePager: false
                });
                banner.data("kendoMobileScrollView").refresh(); */

                var banners = [];
                /* banners.push({ id: 1, image: "images/ads/sale.jpg" });
                banners.push({ id: 2, image: "images/ads/1.jpg" });
                banners.push({ id: 3, image: "images/ads/2.jpg" });
                banners.push({ id: 4, image: "images/ads/3.jpg" });
                banners.push({ id: 5, image: "images/ads/4.jpg" });
                banners.push({ id: 6, image: "images/ads/5.jpg" }); */
                Data.Banners.getBanners({
                }, function (err, data) {
                    if (err) {
                        console.error(err);
                        options.success([]);
                        return;
                    }
                    var banners = data.map(function (item) {
                        item["image"] = getURL(item["image"]);
                        return item;
                    });

                    banner.Banner({
                        slides: banners,
                        delay: 5000,
                        contentHeight: banner.height()
                    })
                })

            });
        },
        onShow: function (e) {
            var view = e.view.element;

            setupUserUI();

            _this.viewModel.setupCart();
            _this.viewModel.reflectCartUpdates();

            try {
                if (_this.viewModel.view.find(".banner").data("banner")) {
                    _this.viewModel.view.find(".banner").data("banner").play();
                }
            } catch (ex) { console.error(ex); }

            if (e.view.params.preserveState == 1) {
                console.log("Preserving state...");
                return;
            }

            try {
                view.find(".tabs").data("kendoMobileTabStrip").switchTo(0);
            }
            catch (ex) { }
            
            try {
                _this.viewModel.view.find("#categoriesList").data("kendoMobileListView").refresh();
            } catch (ex) { }
            try {
                _this.viewModel.view.find("#itemsList").data("kendoMobileListView").refresh();
            } catch (ex) { }

            var tabsList = view.find("#categoriesList");
            if (!tabsList.data("kendoMobileListView")) {
                tabsList.kendoMobileListView({
                    dataSource: _this.viewModel.categoriesDS,
                    template: "#=currentLanguage == 'ar' ? aName : name#",
                    dataBound: function (e) {
                        var width = 2;

                        e.sender.element.find("li").each(function () {
                            width += $(this).outerWidth(true);

                            $(this).click(function () {
                                _this.viewModel.onCategorySelected($(this));
                            })
                        });

                        e.sender.element.closest(".scrolling-tabs-container").css("width", width + "px");
                        e.sender.element.closest(".scrolling-tabs").data("kendoMobileScroller").contentResized();
                        e.sender.element.closest(".scrolling-tabs").data("kendoMobileScroller").scrollTo(0, 0);

                        setTimeout(function () {
                            _this.viewModel.onCategorySelected(e.sender.element.find("li:nth-of-type(1)"));
                        }, 50);
                    }
                })
            }

            var listView = view.find("#itemsList");
            if (!listView.data("kendoMobileListView")) {
                listView.kendoMobileListView({
                    dataSource: _this.viewModel.itemsDS,
                    template: $("#itemsListTemplate").html(),
                    dataBound: function (e) {
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
                _this.viewModel.itemsDS.read(_this.viewModel.currentFilters);
            }

            _this.viewModel.onlineListener = DelegateManager.registerEvent("app:online", function () {
                _this.viewModel.itemsDS.read(_this.viewModel.currentFilters);
            });
            _this.viewModel.offlineListener = DelegateManager.registerEvent("app:offline", function () {

            });
        },
        onHide: function (e) {
            DelegateManager.unregisterEvent(_this.viewModel.cartListener);
            _this.viewModel.cartListener = null;

            DelegateManager.unregisterEvent(_this.viewModel.onlineListener);
            DelegateManager.unregisterEvent(_this.viewModel.offlineListener);

            try {
                if (_this.viewModel.view.find(".banner").data("banner")) {
                    _this.viewModel.view.find(".banner").data("banner").pause();
                }
            } catch (ex) { console.error(ex); }
        },
        onCategorySelected: function (li) {
            var uid = li.data("uid");

            li.siblings("li").removeClass("active");
            li.addClass("active");

            _this.viewModel.centerTab(li);

            var category = _this.viewModel.categoriesDS.getByUid(uid);

            if (!category) {
                category = {
                    id: 0,
                    isOffer: false
                }
            }

            if (category.id == 0) {
                _this.viewModel.view.find(".banner").show();
                try {
                    if (_this.viewModel.view.find(".banner").data("banner")) {
                        _this.viewModel.view.find(".banner").data("banner").play();
                    }
                } catch (ex) { console.error(ex); }
            }
            else {
                _this.viewModel.view.find(".banner").hide();
                try {
                    if (_this.viewModel.view.find(".banner").data("banner")) {
                        _this.viewModel.view.find(".banner").data("banner").pause();
                    }
                } catch (ex) { console.error(ex); }
            }

            _this.viewModel.currentFilters = {
                categoryId: category.id,
                isOffer: category.isOffer
            };

            //Added a little timeout to make the "centerTab" animate smoothly
            setTimeout(function () {
                _this.viewModel.itemsDS.read(_this.viewModel.currentFilters);
                _this.viewModel.itemsDS.data([]);

                _this.viewModel.view.find(".list-container").data("kendoMobileScroller").contentResized();
                _this.viewModel.view.find(".list-container").data("kendoMobileScroller").scrollTo(0, 0);
            }, 100);
        },
        centerTab: function (tab) {
            try {
                var container = tab.closest(".scrolling-tabs");
                var scroller = container.data("kendoMobileScroller");

                var tabOffset = tab.offset().left;
                var tabWidth = tab.outerWidth(true);
                var scrollerOffset = scroller.scrollLeft;
                var scrollerWidth = container.width();
                var scrollLimit = scroller.scrollWidth() - scrollerWidth;

                var requiredOffset = tabOffset - ((scrollerWidth - tabWidth) / 2) + scrollerOffset;

                if (requiredOffset < 0) {
                    requiredOffset = 0;
                }
                else if (requiredOffset > scrollLimit) {
                    requiredOffset = scrollLimit;
                }

                scroller.animatedScrollTo(-requiredOffset, 0);
            }
            catch (ex) { console.error(ex) }
        },
        setupCart: function () {
            var cartBtn = _this.viewModel.view.find(".cartButton");
            cartBtn.find(".cartCount").text(MyCart.getNoOfItems());
            MyCart.getNoOfItems() > 0 ? cartBtn.find(".cartCount").addClass("visible") : cartBtn.find(".cartCount").removeClass("visible");
            _this.viewModel.cartListener = DelegateManager.registerEvent("cart::updated", function (item) {
                cartBtn.find(".cartCount").text(MyCart.getNoOfItems());
                MyCart.getNoOfItems() > 0 ? cartBtn.find(".cartCount").addClass("visible") : cartBtn.find(".cartCount").removeClass("visible");
            });
        },
        addToCart: function (e) {
            var li = $(e.target).closest("li");
            var uid = li.data("uid");
            var item = _this.viewModel.itemsDS.getByUid(uid);

            MyCart.addItem(item.toJSON());
            item.addedToCart = true;
            li.find(".list-item").addClass("added-to-cart");
        },
        removeFromCart: function (e) {
            var li = $(e.target).closest("li");
            var uid = li.data("uid");
            var item = _this.viewModel.itemsDS.getByUid(uid);

            MyCart.removeItem(item.toJSON());
            item.addedToCart = false;
            li.find(".list-item").removeClass("added-to-cart");
        },
        increaseQty: function (e) {
            var li = $(e.target).closest("li");
            var uid = li.data("uid");
            var item = _this.viewModel.itemsDS.getByUid(uid);

            var newQty = MyCart.increaseQty(item, true);
            item.qty = newQty;
            li.find(".item-count-qty input").val(newQty);
        },
        decreaseQty: function (e) {
            var li = $(e.target).closest("li");
            var uid = li.data("uid");
            var item = _this.viewModel.itemsDS.getByUid(uid);

            var newQty = MyCart.decreaseQty(item, true);
            item.qty = newQty;
            li.find(".item-count-qty input").val(newQty);
        },
        onQtyFocus: function (e) {
            var input = $(e.target).closest("input");
            var value = input.val();

            if (value <= 0) {
                input.val("");
            }
        },
        onQtyBlur: function (e) {
            /* var input = $(e.target).closest("input");
            var value = input.val();
 
            console.log(value);
 
            if(value == "") {
                input.val(0);
            } */

            var li = $(e.target).closest("li");
            var uid = li.data("uid");
            var item = _this.viewModel.itemsDS.getByUid(uid);

            var value = $(e.target).closest("input").val().replace(/[^0-9.]/g, '') || "0";

            console.log(value);

            var qty = parseFloatNumber(value);
            var newQty = MyCart.updateQty(item, qty);
            item.qty = newQty;

            console.log(newQty);

            li.find(".item-count-qty input").val(newQty);
        },
        setQty: function (e) {
            /* var li = $(e.target).closest("li");
            var uid = li.data("uid");
            var item = _this.viewModel.itemsDS.getByUid(uid);
 
            var value = $(e.target).closest("input").val().replace(/[^0-9.]/g, '') || "0";
 
            console.log(value);
 
            var qty = parseFloatNumber(value);
            var newQty = MyCart.updateQty(item, qty);
            item.Qty = newQty;
 
            console.log(newQty);
 
            li.find(".item-count-qty input").val(newQty); */

            var input = $(e.target).closest("input");
            var value = input.val().replace(/[^0-9.]/g, '');
            input.val(value);
        },
        reflectCartUpdates: function () {
            /**
             * This function is used to loop through the cart items
             * and manually setting the values in the text boxes
             * This is needed since preserveState prevents the list
             * from refreshing and this should also optimize performance
             */

            //Update item in list
            try {
                var listView = _this.viewModel.view.find("#itemsList");
                if (!listView.data("kendoMobileListView")) {
                    return;
                }

                listView.data("kendoMobileListView").dataItems().map(function (dItem) {
                    var item = MyCart.getItemByID(dItem.id);
                    var li = listView.find("li[data-uid=" + dItem.uid + "]");

                    if (item) {
                        dItem.qty = item.qty;
                        li.find(".item-count-qty input").val(item.qty);
                    }
                    else {
                        dItem.qty = 0;
                        li.find(".item-count-qty input").val(0);
                    }
                });
            }
            catch (ex) { console.error(ex) }
        },
        viewCart: function (e) {
            cartView.previousView = "components/home/home.html?preserveState=1";
            navigate("components/cart/cart.html");
        },
        viewItemDetails: function (e) {
            var li = $(e.target).closest("li");
            var uid = li.data("uid");
            var dataItem = _this.viewModel.itemsDS.getByUid(uid);

            itemDetailsView.item = dataItem;
            itemDetailsView.previousView = "components/home/home.html?preserveState=1";
            navigate("components/itemDetails/itemDetails.html");
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
                    _this.viewModel.itemsDS.filter({});
                }
                else {
                    _this.viewModel.itemsDS.filter({
                        logic: "or",
                        filters: [{
                            field: "name",
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
        }
    }

    return _this.viewModel;
})({});
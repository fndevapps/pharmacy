var itemDetailsView = (function (_this) {
    _this.viewModel = {
        view: null,
        item: null,
        previousView: null,
        cartListener: null,
        onInit: function (e) {
            var view = e.view.element;
            _this.viewModel.view = view;

            layoutView(e, {}, function () {
                view.find(".container").css("height", (view.find(".content").height()) + "px");

                var itemImageContainer = view.find(".item-image-container");
                itemImageContainer.css("height", (view.find(".content").width() * 0.5) + "px");

                var itemDescriptionContainer = view.find(".item-description-container .item-description-padding");
                var itemInfoContainer = view.find(".item-info-container");
                console.log(itemInfoContainer.outerHeight(true));
                console.log(itemImageContainer.outerHeight(true));
                itemDescriptionContainer.css("height", itemInfoContainer.outerHeight(true) + itemImageContainer.outerHeight(true) + "px");

                view.find(".item-description-container").data("kendoMobileScroller").bind("scroll", function (e) {
                    var value = e.scrollTop / (e.sender.scrollHeight() / 3);

                    var transitionValue = (1 - value);

                    itemImageContainer.css("opacity", transitionValue);
                    itemInfoContainer.css("opacity", transitionValue);
                    if (transitionValue > 0 && transitionValue < 1) {
                        itemImageContainer.css("transform", "scale(" + transitionValue + ")");
                        itemInfoContainer.css("transform", "scale(" + transitionValue + ")");
                    }

                    var zIndex = e.scrollTop > 0 ? Math.ceil(e.scrollTop) : 0;
                    view.find(".item-description-container").css("z-index", zIndex);
                })
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

            var itemImageContainer = view.find(".item-image-container");
            var itemDescriptionContainer = view.find(".item-description-container");
            var itemInfoContainer = view.find(".item-info-container");
            itemImageContainer.css("opacity", 1);
            itemInfoContainer.css("opacity", 1);
            itemImageContainer.css("transform", "scale(1)");
            itemInfoContainer.css("transform", "scale(1)");

            _this.viewModel.loadDetails();
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
            var view = _this.viewModel.view;

            function onCartUpdated() {
                var noOfItems = MyCart.getNoOfItems();
                var item = _this.viewModel.item;

                cartBtn.find(".cartCount").text(noOfItems);
                MyCart.getNoOfItems() > 0 ? cartBtn.find(".cartCount").addClass("visible") : cartBtn.find(".cartCount").removeClass("visible");

                console.log("setupCart ", item, MyCart.getCartItems());

                if (MyCart.itemExists(item)) {
                    view.find(".footer.action").removeClass("addToCart");
                    view.find(".footer.action").text(TranslationManager.translate("cart.removeFromCart"));
                }
                else {
                    view.find(".footer.action").addClass("addToCart");
                    view.find(".footer.action").text(TranslationManager.translate("cart.addToCart"));
                }
            }

            _this.viewModel.cartListener = DelegateManager.registerEvent("cart::updated", function () {
                onCartUpdated();
            });
            onCartUpdated();
        },
        loadDetails: function () {
            var view = _this.viewModel.view;
            var item = _this.viewModel.item;

            if (!item) {
                _this.viewModel.back();
                return;
            }

            view.find(".item-image").setBackgroundImage([item.image, item.altImage], "./images/placeholder.png");
            view.find(".item-price").text(currentLanguage == "ar" ? item.price + " " + item.currency.aName : item.price + " " + item.currency.eName);
            view.find(".item-name").text(currentLanguage == "ar" ? item.aName : item.name);
            view.find(".item-name").dotdotdot();
            view.find(".header .title").text(currentLanguage == "ar" ? item.aName : item.name);
            view.find(".item-description").html((currentLanguage == "ar" ? item.aDescription : item.eDescription).replace(/\r\n/g, "<br/>"));

            view.find(".item-description-container").data("kendoMobileScroller").contentResized();
            view.find(".item-description-container").data("kendoMobileScroller").scrollTo(0, 0);
        },
        addOrRemoveItemFromCart: function (e) {
            var item = _this.viewModel.item;

            if (MyCart.itemExists(item)) {
                MyCart.removeItem(item);
            }
            else {
                MyCart.addItem(item);
            }
        },
        viewCart: function (e) {
            cartView.previousView = "components/itemDetails/itemDetails.html";//?preserveState=1";
            navigate("components/cart/cart.html");
        },
        viewImage: function (e) {
            Modals.PhotoViewerModal.showPhotos({
                photos: [_this.viewModel.item.image],
                title: currentLanguage == "ar" ? _this.viewModel.item.aName : _this.viewModel.item.name
            });
        }
    };

    return _this.viewModel;
})({});
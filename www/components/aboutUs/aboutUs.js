var aboutUsView = (function (_this) {
    _this.viewModel = {
        view: null,
        cartListener: null,
        languageChangedListener: null,
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
            
            if(view.find(".content").data("kendoMobileScroller")) {
                view.find(".content").data("kendoMobileScroller").contentResized();
                view.find(".content").data("kendoMobileScroller").scrollTo(0, 0);
            }

            if(currentLanguage=="ar"){
                view.find(".content .container").html(getSystemParameter("AboutUsAR"));
            }else{
                view.find(".content .container").html(getSystemParameter("AboutUsEN"));
            }

            _this.viewModel.languageChangedListener = DelegateManager.registerEvent("language_changed", function () {
                if(currentLanguage=="ar"){
                    view.find(".content .container").html(getSystemParameter("AboutUsAR"));
                }else{
                    view.find(".content .container").html(getSystemParameter("AboutUsEN"));
                }
            });
        },
        onHide: function (e) {
            DelegateManager.unregisterEvent(_this.viewModel.cartListener);
            _this.viewModel.cartListener = null;

            DelegateManager.unregisterEvent(_this.viewModel.languageChangedListener);
            _this.viewModel.languageChangedListener = null;
        },
        setupCart: function () {
            var cartBtn = _this.viewModel.view.find(".cartButton");
            cartBtn.find(".cartCount").text(MyCart.getNoOfItems());
            _this.viewModel.cartListener = DelegateManager.registerEvent("cart::updated", function (item) {
                cartBtn.find(".cartCount").text(MyCart.getNoOfItems());
            });
        },
        viewCart: function (e) {
            cartView.previousView = "components/aboutUs/aboutUs.html?preserveState=1";
            navigate("components/cart/cart.html");
        }
    }

    return _this.viewModel;
})({});
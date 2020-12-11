var pendingView = (function (_this) {
    _this.viewModel = {
        view: null,
        cartListener: null,
        currentFilters: null,
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

            try {
                view.find(".tabs").data("kendoMobileTabStrip").switchTo(0);
            }
            catch (ex) { }
        },
        onHide: function (e) {
            DelegateManager.unregisterEvent(_this.viewModel.cartListener);
            _this.viewModel.cartListener = null;
        }
    }

    return _this.viewModel;
})({});
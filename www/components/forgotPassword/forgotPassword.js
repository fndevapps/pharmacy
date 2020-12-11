var forgotPasswordView = (function (_this) {
	_this.viewModel = {
		view: null,
		onlineListener: null,
		offlineListener: null,
		onInit: function (e) {
			var view = e.view.element;
			_this.viewModel.view = view;

			layoutView(e, {}, function () {
				view.find(".container").css("height", (view.find(".content").height()) + "px");
			});

			_this.viewModel.view.find("#txtUsername").animatedInput();
		},
		onShow: function (e) {
			var view = e.view.element;
			setupUserUI();


			_this.viewModel.onlineListener = DelegateManager.registerEvent("app:online", function () {
				_this.viewModel.view.find("#btnLogin").removeClass("disabled");
			});
			_this.viewModel.offlineListener = DelegateManager.registerEvent("app:offline", function () {
				_this.viewModel.view.find("#btnLogin").addClass("disabled");
			});

		},
		onHide: function (e) {
			var view = e.view.element;

			try {

			} catch (ex) { }
			DelegateManager.unregisterEvent(_this.viewModel.onlineListener);
			DelegateManager.unregisterEvent(_this.viewModel.offlineListener);
		},
		back: function (e) {
			try {
				e.preventDefault();
				e.stopPropagation();
			}
			catch (ex) { }
			navigate("components/login/login.html");

		},

	}

	return _this.viewModel;
})({});
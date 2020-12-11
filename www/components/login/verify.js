var verifyView = (function (_this) {
	_this.viewModel = {
		view: null,
		profile: null,
		onlineListener: null,
		offlineListener: null,
		onInit: function (e) {
			var view = e.view.element;
			_this.viewModel.view = view;
			layoutView(e, {}, function () {
				view.find(".container").css("height", (view.find(".content").height()) + "px");
			});

			_this.viewModel.view.find("#txtPIN").animatedInput();
		},
		onShow: function (e) {
			var view = e.view.element;
			setupUserUI();

			_this.viewModel.view.find("#btnLogin").removeClass("disabled");

			_this.viewModel.onlineListener = DelegateManager.registerEvent("app:online", function () {
				_this.viewModel.view.find("#btnLogin").removeClass("disabled");
			});
			_this.viewModel.offlineListener = DelegateManager.registerEvent("app:offline", function () {
				_this.viewModel.view.find("#btnLogin").addClass("disabled");
			});

			if (_this.viewModel.profile) {
				_this.viewModel.view.find("#txtPIN").val(_this.viewModel.profile.PINCode);
				//_this.viewModel.view.find("#txtPIN").val("");
				_this.viewModel.view.find("#txtPIN").trigger("input");
			}

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
			} catch (ex) { }
			
			if (_this.viewModel.previousView) {
				navigate(_this.viewModel.previousView);
			}
			else {
				navigate("#:back");
			}
		},
		verifyPinCode: function (e) {
			try {
				e.preventDefault();
				e.stopPropagation();
			} catch (ex) { }

			var profile = _this.viewModel.profile;
			var mobileNumber = profile.Mobile;
			var pinCode = _this.viewModel.view.find("#txtPIN").val();

			var btn = _this.viewModel.view.find("#btnLogin");
			btn.addClass("disabled");

			if (pinCode == "") {
				_alert("_error", "messages.inertVerificationPin");
				btn.removeClass("disabled");
				return;
			}

			Data.User.verifyPINCode({
				Mobile: mobileNumber,
				PINCode: pinCode
			}, function (err, result) {
				if (err) {
					btn.removeClass("disabled");
					_alert("_error", err);
					return;
				}

				console.log("Did verify PIN Code");
				console.log("IsRegistered: " + profile.IsRegistered);

				if (profile.IsRegistered) {
					cachedUser = result;
					setupAjax(result);

					console.log(result);
					Data.User.saveUserProfile(result, function (didSave) {
						if (!didSave) {
							console.error("Could not save user profile!");
						}

						navigate("components/home/home.html");
						btn.removeClass("disabled");
					});
				}
				else {
					fillInfoView.profile = result;
					navigate("components/login/fillInfo.html");
					btn.removeClass("disabled");
				}
			})
		},
		resendPinCode: function(e) {
			try {
				e.preventDefault();
				e.stopPropagation();
			} catch (ex) { }

			var profile = _this.viewModel.profile;
			var mobileNumber = profile.Mobile;

			Data.User.resendPINCode({
				Mobile: mobileNumber
			}, function (err, result) {
				if (err) {
					_alert("_error", err);
					return;
				}

				console.log(result);
			})
		}
	}

	return _this.viewModel;
})({});
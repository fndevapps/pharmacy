var fillInfoView = (function (_this) {
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

			_this.viewModel.view.find("#txtFirstName").animatedInput();
			_this.viewModel.view.find("#txtLastName").animatedInput();

			_this.viewModel.view.find("#txtFirstName").on("keydown", function(e) {
				var which = e.which || e.keyCode;
				if(which == 13) {
					setTimeout(function() {
						_this.viewModel.view.find("#txtLastName").focus();
					});
				}
			});
			_this.viewModel.view.find("#txtLastName").on("keydown", function(e) {
				var which = e.which || e.keyCode;
				if(which == 13) {
					_this.viewModel.updateProfile(e);
				}
			});
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
			
			/* if (_this.viewModel.previousView) {
				navigate(_this.viewModel.previousView);
			}
			else {
				navigate("#:back");
			} */

			_alert("_alert", "messages.cantGoBack");
		},
		updateProfile: function (e) {
			try {
				e.preventDefault();
				e.stopPropagation();
			} catch (ex) { }

			var profile = _this.viewModel.profile;
			var firstName = $.trim(_this.viewModel.view.find("#txtFirstName").val());
			var lastName = $.trim(_this.viewModel.view.find("#txtLastName").val());

			var btn = _this.viewModel.view.find("#btnLogin");
			btn.addClass("disabled");

			if (firstName == "") {
				_alert("_error", "messages.insertFirstName");
				btn.removeClass("disabled");
				return;
			}
			if (lastName == "") {
				_alert("_error", "messages.insertSurname");
				btn.removeClass("disabled");
				return;
			}

			Data.User.setupProfile({
				Mobile: profile.Mobile,
				FirstName: firstName,
				LastName: lastName
			}, function (err, result) {
				if (err) {
					btn.removeClass("disabled");
					_alert("_error", err);
					return;
				}

				result.Token = profile.Token;

				cachedUser = result;
				setupAjax(result);

				console.log(result);
				Data.User.saveUserProfile(result, function (didSave) {
					if (!didSave) {
						console.error("Could not save user profile!");
					}

					// navigate("components/home/home.html");
					// setupPushNotifications(result);
					navigate("components/login/fillAddress.html");
					btn.removeClass("disabled");
				});
			})
		}
	}

	return _this.viewModel;
})({});
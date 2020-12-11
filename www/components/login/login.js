var loginView = (function (_this) {
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

			_this.viewModel.view.find("#txtMobile").animatedInput();
			_this.viewModel.view.find("#txtPassword").animatedInput();

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

			_this.viewModel.view.find("#txtMobile").val("").trigger("change");
			_this.viewModel.view.find("#txtPassword").val("").trigger("change");
		},
		onHide: function (e) {
			var view = e.view.element;

			try {

			} catch (ex) { }

			DelegateManager.unregisterEvent(_this.viewModel.onlineListener);
			DelegateManager.unregisterEvent(_this.viewModel.offlineListener);
		},
		onInputMobile: function (e) {
			var input = $(e.target).closest("input");
			var value = input.val();
			//input.val(value.substr(0, 12).replace(/[^0-9.]/g, '')); //Remove anything that is not a number
		},
		onInputPassword: function (e) {
			var input = $(e.target).closest("input");
			var value = input.val();

		},
		login: function (e) {
			try {
				e.preventDefault();
				e.stopPropagation();
			} catch (ex) { }

			var btn = _this.viewModel.view.find("#btnLogin");
			btn.addClass("disabled");

			var mobile = $.trim(_this.viewModel.view.find("#txtMobile").val() || "");
			var password = $.trim(_this.viewModel.view.find("#txtPassword").val() || "");
			if (mobile == "") {
				_alert("_error", "messages.insertMobile");
				btn.removeClass("disabled");
				return;
			}
			if (password == "") {
				_alert("_error", "messages.insertPassword");
				btn.removeClass("disabled");
				return;
			}

			Data.User.login({
				Username: mobile,
				Password: password
			}, function (err, result) {
				if (err) {
					btn.removeClass("disabled");
					_alert("_error", err);
					return;
				}

				//We should receive a verification PIN so go to the verify page
				/* verifyView.profile = result;
				navigate("components/login/verify.html");
				btn.removeClass("disabled"); */
				

				cachedUser = result;
				setupAjax(result);

				console.log(result);
				Data.User.saveUserProfile(result, function (didSave) {
					if (!didSave) {
						console.error("Could not save user profile!");
					}
					Data.User.myProfile({
						customerId: result.customerId
					}, function (err, profileResult) {
						if (!err) {
							cachedUser = profileResult;
							setupAjax(result);
						}
						setupPushNotifications(cachedUser);
						if(cachedUser.hasOwnProperty("customerStatusId") && cachedUser.customerStatusId !=2){
							navigate("components/pending/pending.html");
						}else{
							navigate("components/home/home.html");
						}
						
						btn.removeClass("disabled");
					});

				
				});
			});

			/* Data.User.login({
				Username: mobile
			}, function (err, result) {
				btn.removeClass("disabled");

				console.log(result);

				if (err) {
					console.error(err);
					if (err == -2) {
						_alert("_error", TranslationManager.translate("messages.noUser"));
					} else {
						_alert("_error", err);
					}
					return;
				}

				var profile = {
					Username: username,
					ID: result.ID,
					Code: result.Code,
					AName: result.AName,
					EName: result.EName,
					Mobile: result.Mobile,
					Email: result.Email,
					TaxFree: result.TaxFree,
					TenantID: result.TenantID,
					BranchID: result.BranchID,
					Token: result.Token
				};

				cachedUser = profile;
				setupAjax(profile);

				console.log(profile);
				Data.User.saveUserProfile(profile, function (didSave) {
					if (!didSave) {
						console.error("Could not save user profile!");
					}

					navigate("components/home/home.html");
				});
			}); */
		},
		logout: function (e) {
			try {
				e.preventDefault();
				e.stopPropagation();
			} catch (ex) { }

			_confirm(TranslationManager.translate("messages.logoutMessage"), function (buttonIndex) {
				if (buttonIndex === 2) {
					Data.User.deleteUserProfile(function (didDelete) {
						//closeMenu(e);
						setTimeout(function () {
							localStorage.removeItem("TokenManager.token");
							cachedUser = {};
							cachedUser.userMode = USER_MODES.SURF_THE_APP;
							resetAppState();
							navigate("components/login/login.html", "fade");
						}, 100);
					});
				}
			}, TranslationManager.translate("messages._warning"), [TranslationManager.translate("messages._no"), TranslationManager.translate("messages._yes")]);
		},
		forgotPassword: function (e) {
			try {
				e.preventDefault();
				e.stopPropagation();
			} catch (ex) { }

			navigate("components/forgotPassword/forgotPassword.html");
		},
		onKeyDown: function (e, target) {
			if (e.keyCode != 13) {
				return;
			}

			if (target != null) {
				_this.viewModel.view.find(target).focus();
			} else {
				_this.viewModel.login(e);
			}
		},
		signUp: function (e) {
			try {
				e.preventDefault();
				e.stopPropagation();
			} catch (ex) { }

			navigate("components/signUp/signUp.html");
		}
	}

	return _this.viewModel;
})({});
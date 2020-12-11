var changepinView = (function (_this) {
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
		},
		onShow: function (e) {
			var view = e.view.element;
            setupUserUI();
            
            view.find("#textoldpin").val("");
            view.find("#textnewpin").val("");
            view.find("#textconfirmpin").val("");
    
            view.find("#textoldpin").attr("placeholder", TranslationManager.translate("infoHere.infoHere"));
            view.find("#textnewpin").attr("placeholder", TranslationManager.translate("infoHere.infoHere"));
            view.find("#textconfirmpin").attr("placeholder", TranslationManager.translate("infoHere.infoHere")); 

            _this.viewModel.onlineListener = DelegateManager.registerEvent("app:online", function() {
				_this.viewModel.view.find("#changebtn").removeClass("disabled");
			});
			_this.viewModel.offlineListener = DelegateManager.registerEvent("app:offline", function() {
				_this.viewModel.view.find("#changebtn").addClass("disabled");
            });
            _this.viewModel.onlineListener = DelegateManager.registerEvent("app:online", function() {
				_this.viewModel.view.find("#backBtn").removeClass("disabled");
			});
			_this.viewModel.offlineListener = DelegateManager.registerEvent("app:offline", function() {
				_this.viewModel.view.find("#backBtn").addClass("disabled");
			});
		},
		onHide: function (e) {
			var view = e.view.element;
			
            try {} 
            catch (ex) { }
            DelegateManager.unregisterEvent(_this.viewModel.onlineListener);
			DelegateManager.unregisterEvent(_this.viewModel.offlineListener);

        },
        change : function(){
            try {
				e.preventDefault();
				e.stopPropagation();
			}
            catch (ex) { }
            
            _this.viewModel.view.find(".changebtn").addClass("disabled");


            if (!appIsOnline) {
                _alert("", "_offline");
                return;
            }
            if (_this.viewModel.view.find("#textoldpin").val() == "") {
                _alerttest("_alerttest", "messages.insertCurrentPin");
                _this.viewModel.view.find(".changebtn").removeClass("disabled");
                return;
            }
            if (_this.viewModel.view.find("#textnewpin").val() == "") {
                _alerttest("_alerttest", "messages.insertNewPin");
                _this.viewModel.view.find(".changebtn").removeClass("disabled");
                return;
            }
            if (_this.viewModel.view.find("#textconfirmpin").val() == "") {
                _alerttest("_alerttest", "messages.insertConfirmPin");
                _this.viewModel.view.find(".changebtn").removeClass("disabled");
                return;
            }if (_this.viewModel.view.find("#textnewpin").val() == cachedUser.Password) {
                _alert("_alert", "messages.pinShouldBeDifferentThanCurrent");
                _this.viewModel.view.find(".changebtn").removeClass("disabled");
                return;
            }
            if (_this.viewModel.view.find("#textnewpin").val() != _this.viewModel.view.find("#textconfirmpin").val()) {
                _alerttest("_alerttest", "messages.pinNotMatched");
                _this.viewModel.view.find(".changebtn").removeClass("disabled");
                return;
            }

            var pin = _this.viewModel.view.find("#textnewpin").val();
            var currentPin = _this.viewModel.view.find("#textoldpin").val();
    
            if (hasArabicLetters(pin) || hasArabicLetters(currentPin)) {
                _alerttest("_alerttest", "messages.pinShouldBeEnglish");
                _this.viewModel.view.find(".changebtn").removeClass("disabled");
                return;
            }
    
            if (pin.length < config.web_password_length) {
                if (currentLanguage == "en") {
                    _alerttest("_alerttest", "messages.web_password_EnMessage");
                } else {
                    _alerttest("_alerttest", "messages.web_password_EnMessage");
                }
    
                _this.viewModel.view.find(".changebtn").removeClass("disabled");
                return;
            }
            var data = {
                CardholderID: cachedUser.CardholderID,
                CloneID: config.cloneID,
                CountryID: config.countryID,
                LanguageID: config.languageID,
                NewPassword: _this.viewModel.view.find("#textnewpin").val(),
                OldPassword: _this.viewModel.view.find("#textoldpin").val(),
                Token: cachedUser.Token,
                Username: cachedUser.UserName,
            }
            Data.ChangePin.changePin(data, function (err, res) {
                if (err) {
                    _alert("_serverError", err);
                    _this.viewModel.view.find(".changebtn").removeClass("disabled");
                    return;
                }
    
                _alert("_alert", res, function () {
                    cachedUser.Password = data.NewPassword;
                    Data.User.saveUserProfile(cachedUser, function () {
                        _this.viewModel.view.find(".changebtn").removeClass("disabled");
                        navigate("components/profile/profile.html");
                    });
                });
            })
    
            },
        back : function(){
            try{
                e.preventDefault();
                e.stopPropagation();
            }
            catch(ex){
                navigate("components/profile/profile.html");
            }
        },
	}

	return _this.viewModel;
})({});
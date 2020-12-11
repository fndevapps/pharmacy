var registerView = (function (_this) {
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

            _this.viewModel.onlineListener = DelegateManager.registerEvent("app:online", function () {
                _this.viewModel.view.find("#regsiterbtn").removeClass("disabled");
            });
            _this.viewModel.offlineListener = DelegateManager.registerEvent("app:offline", function () {
                _this.viewModel.view.find("#regsiterbtn").addClass("disabled");
            });
        },
        onHide: function (e) {
            var view = e.view.element;

            try { }
            catch (ex) { }
            DelegateManager.unregisterEvent(_this.viewModel.onlineListener);
            DelegateManager.unregisterEvent(_this.viewModel.offlineListener);

        },
        Submit: function () {
            try {
                e.preventDefault();
                e.stopPropagation();
            }
            catch (ex) { }
            registerView.view.find(".btnregsiter").addClass("disabled");


            if (!appIsOnline) {
                _alert("", "_offline");
                return;
            }
            var firstName = $.trim(registerView.view.find("#textFirstname").val());
            var lastName = $.trim(registerView.view.find("#textLastname").val());
            var email = $.trim(registerView.view.find("#email").val());
            var confirmEmail = $.trim(registerView.view.find("#conEmail").val());
            var phoneNumber = $.trim(registerView.view.find("#phonenumber").val().toString());
            var pinCode = $.trim(registerView.view.find("#pincode").val());
            var confirmPnCode = $.trim(registerView.view.find("#confirmPinCode").val());

            if (firstName == "") {
                _alert("_alert", "messages.insertFirstName");
                registerView.view.find(".regsiterbtn").removeClass("disabled");
                return;
            }
            if (lastName == "") {
                _alert("_alert", "messages.insertLastName");
                registerView.view.find(".regsiterbtn").removeClass("disabled");
                return;
            }
            if (email == "") {
                _alert("_alert", "messages.insertEmail");
                registerView.view.find(".regsiterbtn").removeClass("disabled");
                return;
                
            }
            if (confirmEmail == "") {
                _alert("_alert", "messages.insertConfirmEmail");
                registerView.view.find(".regsiterbtn").removeClass("disabled");
                return;}
            if (confirmEmail != email) {
                _alert("_alert", "messages.emailNotMatched");
                registerView.view.find(".regsiterbtn").removeClass("disabled");
                return;
            }
             if (email != "" && !validEmail(email)) {
                _alert("_alert", "messages.invalidEmail");
                registerView.view.find(".regsiterbtn").removeClass("disabled");
                return;
            } 


              if (phoneNumber == "") {
                _alert("_alert", "messages.insertPhoneNumber");
                registerView.view.find(".regsiterbtn").removeClass("disabled");
                return;
            }
            if (!validPhoneNumber(phoneNumber)) {
                _alert("_alert", "messages.invalidPhoneNumber");
                registerView.view.find(".regsiterbtn").removeClass("disabled");
                return;
            }   
            if (pinCode == "") {
                _alert("_alert", "messages.insertNewPin");
                registerView.view.find(".regsiterbtn").removeClass("disabled");
                return;
            }
            if (confirmPnCode == "") {
                _alert("_alert", "messages.insertConfirmPin");
                registerView.view.find(".regsiterbtn").removeClass("disabled");
                return;
            }


            if (hasArabicLetters(pinCode) || hasArabicLetters(confirmPnCode)) {
                _alert("_alert", "messages.pinShouldBeEnglish");
                registerView.view.find(".regsiterbtn").removeClass("disabled");
                return;
            }

            if (pinCode.length < config.web_password_length) {
                if (currentLanguage == "en") {
                    _alert("_alert", "messages.web_password_EnMessage");
                } else {
                    _alert("_alert", "messages.web_password_EnMessage");
                }

                registerView.view.find(".regsiterbtn").removeClass("disabled");
                return;
            }

        },
        back: function () {

            try {
                e.preventDefault();
                e.stopPropagation();
            }
            catch (ex) { }
            registerView.view.find(".regsiterbtn").removeClass("disabled");
            navigate("components/login/login.html");
        },
    }

    return _this.viewModel;
})({});
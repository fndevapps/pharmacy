var signUpView = (function (_this) {
	_this.viewModel = {
		view: null,
		onlineListener: null,
		offlineListener: null,
		map: {},
		record: {
			Name: '',
			Email: '',
			Mobile: '',
			Address: '',
			City: '',
			Area: '',
			Street: '',
			Flat: '',
			Lat: '31.9539',
			Long: '35.930359'
		},
		onInit: function (e) {
			var view = e.view.element;
			_this.viewModel.view = view;

			layoutView(e, {}, function () {
				view.find(".container").css("height", (view.find(".content").height()) + "px");
			});

			_this.viewModel.view.find("#aName").animatedInput();
			_this.viewModel.view.find("#eName").animatedInput();
			_this.viewModel.view.find("#email").animatedInput();
			_this.viewModel.view.find("#confirmEmail").animatedInput();
			_this.viewModel.view.find("#mobile").animatedInput();
			_this.viewModel.view.find("#username").animatedInput();
			_this.viewModel.view.find("#password").animatedInput();
			_this.viewModel.view.find("#confirmPassword").animatedInput();
			_this.viewModel.view.find("#selCountryId").animatedInput();
			_this.viewModel.view.find("#selCityId").animatedInput();
			_this.viewModel.view.find("#selAreaId").animatedInput();
			_this.viewModel.view.find("#neighborhood").animatedInput();
			_this.viewModel.view.find("#street").animatedInput();
			_this.viewModel.view.find("#flat").animatedInput();
			_this.viewModel.view.find("#address").animatedInput();


		},
		onShow: function (e) {
			var view = e.view.element;
			setupUserUI();

			_this.viewModel.onlineListener = DelegateManager.registerEvent("app:online", function () {
				_this.viewModel.view.find("#btnSignUp").removeClass("disabled");
			});
			_this.viewModel.offlineListener = DelegateManager.registerEvent("app:offline", function () {
				_this.viewModel.view.find("#btnSignUp").addClass("disabled");
			});


			Data.Addresses.getCountries({}, function (err, areas) {
				if (err) {
					return;
				}

				var contentCountries = "";
				contentCountries += "<option value='0' ></option>";
				areas.forEach(function (item) {
					contentCountries += "<option value='" + item.id + "' >" + item.name + "</option>";
				});
				_this.viewModel.view.find("#selCountryId").html(contentCountries).trigger("change");
			});


			_this.viewModel.view.find("#aName").val("").trigger("change");
			_this.viewModel.view.find("#eName").val("").trigger("change");
			_this.viewModel.view.find("#email").val("").trigger("change");
			_this.viewModel.view.find("#confirmEmail").val("").trigger("change");
			_this.viewModel.view.find("#mobile").val("").trigger("change");
			_this.viewModel.view.find("#username").val("").trigger("change");
			_this.viewModel.view.find("#password").val("").trigger("change");
			_this.viewModel.view.find("#confirmPassword").val("").trigger("change");
			_this.viewModel.view.find("#selCountryId").val("").trigger("change");
			_this.viewModel.view.find("#selCityId").val("").trigger("change");
			_this.viewModel.view.find("#selAreaId").val("").trigger("change");
			_this.viewModel.view.find("#neighborhood").val("").trigger("change");
			_this.viewModel.view.find("#street").val("").trigger("change");
			_this.viewModel.view.find("#flat").val("").trigger("change");
			_this.viewModel.view.find("#address").val("").trigger("change");

			/*Utils.getCurrentLocation(
				function (res) {
					if (res) {
						signUpView.record.Lat = res.Latitude;
						signUpView.record.Long = res.Longitude;

						Utils.getLocationName(signUpView.record.Lat, signUpView.record.Long,
							function (data) {
								if (data) {
									console.log("Location data", data);
									_this.viewModel.view.find("#city").val(data.city);
									_this.viewModel.view.find("#area").val(data.area);
									_this.viewModel.view.find("#street").val(data.roadName);
								}
							}
						);
					}
					console.log("Location long lat", res);

					try {
						GoogleMaps.getInstance(function () {
							var centerMap = new google.maps.LatLng(
								parseFloat(signUpView.record.Lat), parseFloat(signUpView.record.Long)
							);
							if (!signUpView.map.map) {
								signUpView.map.map = new google.maps.Map(signUpView.view.find("#map")[0], {
									zoom: 13,
									mapTypeId: google.maps.MapTypeId.ROADMAP,
									center: centerMap
								});
							} else {
								signUpView.map.map.setCenter(centerMap)
							}

							if (signUpView.map.marker) {
								signUpView.map.marker.setMap(null);
							}
							signUpView.map.marker = new google.maps.Marker({
								map: signUpView.map.map,
								position: centerMap
							});

						});
					} catch (ex) { }
				}
			);*/
		},
		onHide: function (e) {
			var view = e.view.element;

			try {

			} catch (ex) { }

			DelegateManager.unregisterEvent(_this.viewModel.onlineListener);
			DelegateManager.unregisterEvent(_this.viewModel.offlineListener);
		},
		onCountryChanged: function (e) {
			Data.Addresses.getCities({ countryId: _this.viewModel.view.find("#selCountryId").val() }, function (err, areas) {
				if (err) {
					return;
				}

				var contentCities = "";
				contentCities += "<option value='0' ></option>";
				areas.forEach(function (item) {
					contentCities += "<option value='" + item.id + "' >" + item.name + "</option>";
				});
				_this.viewModel.view.find("#selCityId").html(contentCities).trigger("change");
			})
			_this.viewModel.view.find("#selAreaId").html("").trigger("change");
		},
		onCityChanged: function (e) {
			Data.Addresses.getAreas({ countryId: _this.viewModel.view.find("#selCountryId").val(), cityId: _this.viewModel.view.find("#selCityId").val() }, function (err, areas) {
				if (err) {
					return;
				}

				var contentAreas = "";
				contentAreas += "<option value='0' ></option>";
				areas.forEach(function (item) {
					contentAreas += "<option value='" + item.id + "' >" + item.name + "</option>";
				});
				_this.viewModel.view.find("#selAreaId").html(contentAreas).trigger("change");
			})
		},
		onMobileChanged: function (e) {
			var input = $(e.target).closest("input");
			var value = input.val();

			input.val(value.substr(0, 12));
		},
		signUp: function (e) {
			try {
				e.preventDefault();
				e.stopPropagation();
			} catch (ex) { }

			var btn = _this.viewModel.view.find("#btnConfirm");
			btn.addClass("disabled");

			var username = _this.viewModel.view.find("#username").val();
			var password = _this.viewModel.view.find("#password").val();
			var confirmPassword = _this.viewModel.view.find("#confirmPassword").val();
			var aName = _this.viewModel.view.find("#aName").val();
			var eName = _this.viewModel.view.find("#eName").val();
			var email = _this.viewModel.view.find("#email").val();
			var confirmEmail = _this.viewModel.view.find("#confirmEmail").val();
			var mobile = _this.viewModel.view.find("#mobile").val();
			var address = _this.viewModel.view.find("#address").val();
			var countryId = _this.viewModel.view.find("#selCountryId").val();
			var cityId = _this.viewModel.view.find("#selCityId").val();
			var areaId = _this.viewModel.view.find("#selAreaId").val();
			var neighborhood = _this.viewModel.view.find("#neighborhood").val();
			var street = _this.viewModel.view.find("#street").val();
			var latitude = "";
			var longitude = "";

			if (aName == '') {
				_alert("_error", "messages.insertAName");
				btn.removeClass("disabled");
				return;
			}

			if (eName == '') {
				_alert("_error", "messages.insertEName");
				btn.removeClass("disabled");
				return;
			}
			/* if (email == '') {
				_alert("_error", "messages.insertEmail");
				btn.removeClass("disabled");
				return;
			} */
			if (email != '' && !validEmail(email)) {
				_alert("_alert", "messages.invalidEmail");
				_this.viewModel.view.find(".profilebtn").removeClass("disabled");
				return;
			}
			if (email != confirmEmail) {
				_alert("_error", "messages.emailNotMatched");
				btn.removeClass("disabled");
				return;
			}
			if (username == "") {
				_alert("_error", "messages.insertUsername");
				btn.removeClass("disabled");
				return;
			}
			if (password == "") {
				_alert("_error", "messages.insertPassword");
				btn.removeClass("disabled");
				return;
			}
			if (confirmPassword == "") {
				_alert("_error", "messages.confirmPassword");
				btn.removeClass("disabled");
				return;
			}
			if (confirmPassword != password) {
				_alert("_error", "messages.passwordsNotMatched");
				btn.removeClass("disabled");
				return;
			}
			if (mobile == '') {
				_alert("_error", "messages.insertMobile");
				btn.removeClass("disabled");
				return;
			}
			/*else {
				if (!(/^9627[7,8,9]{1}[0-9]{7}/.test(mobile))) {
					_alert("_error", "messages.invalidPhoneNumber");
					btn.removeClass("disabled");
					return;
				}
			}*/
			if (countryId == '' || countryId == 0) {
				_alert("_error", "messages.insertCountry");
				btn.removeClass("disabled");
				return;
			}
			if (cityId == '' || cityId == 0) {
				_alert("_error", "messages.insertCity");
				btn.removeClass("disabled");
				return;
			}
			if (areaId == '' || areaId == 0) {
				_alert("_error", "messages.insertArea");
				btn.removeClass("disabled");
				return;
			}
			/* if (neighborhood == '') {
				_alert("_error", "messages.insertNeighborhood");
				btn.removeClass("disabled");
				return;
			}
			if (street == '') {
				_alert("_error", "messages.insertStreet");
				btn.removeClass("disabled");
				return;
			} */
			/*if (flat == '') {
				_alert("_error", "messages.insertFlat");
				btn.removeClass("disabled");
				return;
			}*/
			/* if (address == '') {
				 _alert("_error", "messages.insertAddress");
				 btn.removeClass("disabled");
				 return;
			} */
			//	if ((long == 0 || lat == 0 || long > 50 || long < 20 || lat > 50 || lat < 20) && address == '') {
			/* if (address == '') {
				_alert("_error", "messages.insertAddress");
				btn.removeClass("disabled");
				return;
			} */
			Data.User.signUp({
				id: 0,
				username: username,
				password: password,
				aName: aName,
				eName: eName,
				email: email,
				mobile: mobile,
				address: address,
				countryId: countryId,
				cityId: cityId,
				areaId: areaId,
				neighborhood: neighborhood,
				street: street,
				//flat: flat,
				latitude: latitude,
				longitude: longitude,
				tenantId: cachedUser.tenantId ? cachedUser.tenantId : 1
			}, function (err, result) {
				btn.removeClass("disabled");

				console.log(result);

				if (err) {
					console.error(err);
					_alert("_error", err);
					return;
				}
				_alert("messages._success", TranslationManager.translate("messages.signUpSuccess"), function () {
					navigate("components/login/login.html");
				});
			});

		},
		back: function (e) {
			navigate("components/login/login.html");
		}
	}

	return _this.viewModel;
})({});
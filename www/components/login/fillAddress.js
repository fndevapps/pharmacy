var fillAddressView = (function (_this) {
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

			_this.viewModel.view.find("#txtName").animatedInput();
			_this.viewModel.view.find("#selAreaID").animatedInput();
			_this.viewModel.view.find("#txtRoadName").animatedInput();
			_this.viewModel.view.find("#txtBuildingNumber").animatedInput();
			_this.viewModel.view.find("#txtApartmentNumber").animatedInput();
			_this.viewModel.view.find("#txtFloor").animatedInput();
			_this.viewModel.view.find("#txtLandmark").animatedInput();
			_this.viewModel.view.find("#txtDeliveryInstructions").animatedInput();

			Data.Addresses.getAreas({}, function(err, areas) {
				if(err) {
					return;
				}

				var contentAreas = "";
				areas.forEach(function(item) {
					contentAreas += "<option value='" + item.ID + "' cityID='" + item.CityID + "' countryID='" + item.CountryID + "' >" + item.Name + "</option>";
				});
				_this.viewModel.view.find("#selAreaID").html(contentAreas).trigger("change");
			})
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
		saveAddress: function (e) {
			try {
				e.preventDefault();
				e.stopPropagation();
			} catch (ex) { }

			var btn = _this.viewModel.view.find("#btnLogin");
			btn.addClass("disabled");

			var name = $.trim(_this.viewModel.view.find("#txtName").val());
            // var countryName = _this.viewModel.view.find("#txtCountryName").val();
            // var cityName = _this.viewModel.view.find("#txtCityName").val();
            // var areaName = _this.viewModel.view.find("#txtAreaName").val();
            var areaID = _this.viewModel.view.find("#selAreaID option:selected").val();
            var cityID = _this.viewModel.view.find("#selAreaID option:selected").attr("cityID");
            var countryID = _this.viewModel.view.find("#selAreaID option:selected").attr("countryID");
            var roadName = $.trim(_this.viewModel.view.find("#txtRoadName").val());
            var buildingNumber = $.trim(_this.viewModel.view.find("#txtBuildingNumber").val());
            var apartmentNumber = $.trim(_this.viewModel.view.find("#txtApartmentNumber").val());
            var floor = $.trim(_this.viewModel.view.find("#txtFloor").val());
            var landmark = $.trim(_this.viewModel.view.find("#txtLandmark").val());
            var deliveryInstructions = $.trim(_this.viewModel.view.find("#txtDeliveryInstructions").val());

			if(!name) {
				_alert("_error", "messages.insertAddressName");
				btn.removeClass("disabled");
				return;
			}
			if(!areaID) {
				_alert("_error", "messages.insertArea");
				btn.removeClass("disabled");
				return;
			}
			if(!roadName) {
				_alert("_error", "messages.insertStreet");
				btn.removeClass("disabled");
				return;
			}
			if(!buildingNumber) {
				_alert("_error", "messages.insertStreet");
				btn.removeClass("disabled");
				return;
			}

            var record = {
				ID: 0,
				CustomerID: cachedUser.ID,
                Name: name,
                // CountryName: countryName,
                // CityName: cityName,
                // AreaName: areaName,
                AreaID: areaID,
                CityID: cityID,
                CountryID: countryID,
                RoadName: roadName,
                BuildingNumber: buildingNumber,
                ApartmentNumber: apartmentNumber,
                Floor: floor,
                Landmark: landmark,
				DeliveryInstructions: deliveryInstructions,
				IsDefault: true
            }

			Data.Addresses.addAddress(record, function(err, result) {
				if (err) {
					btn.removeClass("disabled");
					_alert("_error", err);
					return;
				}

				navigate("components/home/home.html");
				setupPushNotifications(cachedUser);
				btn.removeClass("disabled");
			})
		}
	}

	return _this.viewModel;
})({});
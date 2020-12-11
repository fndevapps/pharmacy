var profileView = (function (_this) {
	_this.viewModel = {
		view: null,
		onlineListener: null,
		offlineListener: null,
		customerLocations:[],
		addressesDS: new kendo.data.DataSource({
			transport: {
				read: function (options) {
				/*	Data.User.getAddressses({
						customerId: cachedUser.id
					}, function (err, data) {
						if (err) {
							console.error(err);
							options.success([]);
							return;
						}*/
						var data  = _this.viewModel.customerLocations;

						if(data.length == 0) {
							data = [{
								name: "address.noDataFound",
								_noDataFound: true
							}];
						}
						else {
							data = data.map(function(item) {
								item._noDataFound = false;
								return item;
							});
						}

						options.success(data);
				//	});
				}
			}
		}),
		onInit: function (e) {
			var view = e.view.element;
			_this.viewModel.view = view;
			layoutView(e, {}, function () {
				view.find(".container").css("height", (view.find(".content").height()) + "px");
			});

			_this.viewModel.view.find("#txtAName").animatedInput();
			_this.viewModel.view.find("#txtEName").animatedInput();
			_this.viewModel.view.find("#txtMobileNumber").animatedInput();
			_this.viewModel.view.find("#txtBalance").animatedInput();
		},
		onShow: function (e) {
			var view = e.view.element;
			setupUserUI();

			if(view.find(".content").data("kendoMobileScroller")) {
                view.find(".content").data("kendoMobileScroller").contentResized();
                view.find(".content").data("kendoMobileScroller").scrollTo(0, 0);
            }

			_this.viewModel.resetForm();
	        _this.viewModel.loadDetails();
				
				

			

			_this.viewModel.onlineListener = DelegateManager.registerEvent("app:online", function () {
				_this.viewModel.view.find("#btnSaveProfile").removeClass("disabled");
			});
			_this.viewModel.offlineListener = DelegateManager.registerEvent("app:offline", function () {
				_this.viewModel.view.find("#btnSaveProfile").addClass("disabled");
			});

			
		},
		onHide: function (e) {
			var view = e.view.element;

			try { }
			catch (ex) { }
			DelegateManager.unregisterEvent(_this.viewModel.onlineListener);
			DelegateManager.unregisterEvent(_this.viewModel.offlineListener);

		},
		back: function () {
			try {
				e.preventDefault();
				e.stopPropagation();
			}
			catch (ex) { }

		},
		loadDetails: function () {
			Data.User.myProfile({
			}, function (err, result) {
				if (err) {
					_this.viewModel.view.find("#txtBalance").val("");
					_this.viewModel.view.find("#txtBalance").trigger("input");
					return;
				}
				_this.viewModel.view.find("#txtAName").val(result.aName);
				_this.viewModel.view.find("#txtAName").trigger("input");
				_this.viewModel.view.find("#txtEName").val(result.eName);
				_this.viewModel.view.find("#txtEName").trigger("input");
				_this.viewModel.view.find("#txtMobileNumber").val(result.mobile);
				_this.viewModel.view.find("#txtMobileNumber").trigger("input");
				_this.viewModel.view.find("#txtBalance").val(result.balance);
				_this.viewModel.view.find("#txtBalance").trigger("input");
				_this.viewModel.customerLocations = result.customerLocations;
				_this.viewModel.addressesDS.read();
				
			});
			
		},
		setDefaultLocation: function (e, uid) {
			try {
				e.preventDefault();
				e.stopPropagation();
			} catch (ex) { }

			_this.viewModel.addressesDS.data().forEach(function (item) {
				item.isDefault = item.uid == uid;
			});
			_this.viewModel.view.find("#addressesList").data("kendoMobileListView").refresh();
			var record = _this.viewModel.addressesDS.getByUid(uid);
			Data.Addresses.updateAddress(record, function (err, result) {
				if (err) {
					_alert("_serverError", err);
					return;
				}
			});

		},
		editLocation: function (e, uid) {
			try {
				e.preventDefault();
				e.stopPropagation();
			} catch (ex) { }

			var model = _this.viewModel.addressesDS.getByUid(uid);
			if (!model) {
				return;
			}

			Modals.UpdateLocationModal.updateLocation({
				record: {
					id: model.id,
					name: model.name,
					cityId: model.cityId,
					// CityCode: model.CityCode,
					// CityName: model.CityName,
					countryId: model.countryId,
					// CountryCode: model.CountryCode,
					// CountryName: model.CountryName,
					areaId: model.areaId,
					// AreaCode: model.AreaCode,
					// AreaName: model.AreaName,
					roadName: model.roadName,
					buildingNumber: model.buildingNumber,
					apartmentNumber: model.apartmentNumber,
					floor: model.floor,
					landmark: model.landmark,
					deliveryInstructions: model.deliveryInstructions,
					//latitude: model.latitude,
					//longitude: model.longitude,
					isDefault: model.isDefault
				}
			}, function (updatedModel) {
				if (!updatedModel) {
					return;
				}

				_this.viewModel.loadDetails();
			});
		},
		addLocation: function(e) {
			try {
				e.preventDefault();
				e.stopPropagation();
			} catch (ex) { }

			Modals.UpdateLocationModal.updateLocation({
				record: {
					id: 0,
					name: "",
					cityId: 0,
					// CityCode: "0",
					// CityName: "",
					countryId: 0,
					// CountryCode: "0",
					// CountryName: "",
					areaId: 0,
					// AreaCode: "0",
					//AreaName: "",
					roadName: "",
					buildingNumber: "",
					apartmentNumber: "",
					floor: "",
					landmark: "",
					deliveryInstructions: "",
					//latitude: "",
					//longitude: "",
					isDefault: true
				}
			}, function (newModel) {
				if (!newModel) {
					return;
				}
				
				_this.viewModel.loadDetails();
			});
		},
		updateProfile: function (e) {
			try {
				e.preventDefault();
				e.stopPropagation();
			} catch (ex) { }

			var aName = _this.viewModel.view.find("#txtAName").val();
			var eName = _this.viewModel.view.find("#txtEName").val();
			var mobile = _this.viewModel.view.find("#txtMobileNumber").val();
			if (aName == '') {
				_alert("_error", "messages.insertAName");
				return;
			}

			if (eName == '') {
				_alert("_error", "messages.insertEName");
				return;
			}
			if (mobile == '') {
				_alert("_error", "messages.insertMobile");
				return;
			}
			var defaultLocation = _this.viewModel.addressesDS.data().filter(function (item) {
				return item.isDefault == 1;
			})[0];
			var defaultAddressId = defaultLocation ? defaultLocation.id : 0;

			Data.User.updateProfile({
				customerId: cachedUser.id,
				aName: aName,
				eName: eName,
				mobile: mobile
			}, function (err, data) {
				if (err) {
					_alert("_serverError", err);
					return;
				}

				cachedUser.firstName = aName;
				cachedUser.lastName = eName;
				cachedUser.eName =eName;
				cachedUser.aName;
				Data.User.saveUserProfile(cachedUser, function () {
					Data.User.myProfile({
					}, function (err, result) {
						if (err) {
							return;
						}
						cachedUser = result;
					});
				});
			})
		},
		resetForm: function () {
			var view = _this.viewModel.view;

			view.find("#txtFirstName").val("");
			view.find("#txtFirstName").trigger("input");
			view.find("#txtLastName").val("");
			view.find("#txtLastName").trigger("input");
		}
	}

	return _this.viewModel;
})({});
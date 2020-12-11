var Data = {};

Data.SystemParameters = {
    getSystemParameters: function(options, callback) {
        options = options || {};

        Utils.requestWebService("systemParameters", {}, function(resp) {
            if(resp.Error) {
                callback ? callback(resp.Result, null) : false;
                return;
            }

            callback ? callback(null, resp.Result) : false;
        }, function(error) {
            console.error(error);
            callback ? callback(error, null) : false;
        }, {
            preventLoading: options.preventLoading || false
        })
    }
}

Data.User = {
    getCachedUser: function (callback) {
        if (DB.db) {
            var userProfile = null;

            DB.db.transaction(function (tx) {

                tx.executeSql("SELECT * FROM CachedUser", [], function (trx, results) {

                    if (results.rows.length > 0) {
                        userProfile = results.rows.item(0);
                    }

                }, function (err) {
                    return true;
                });

            }, function () {
                callback ? callback(null, null) : false;
            },
                function () {
                    callback ? callback(null, userProfile) : false;
                });
        } else {
            callback ? callback(null, null) : false;
        }
    },
    saveUserProfile: function (profile, callback) {
        console.log("profile ", profile)
        if (DB.db) {
            DB.db.transaction(function (tx) {
                tx.executeSql("DELETE FROM CachedUser", [], function (trx, result) {

                    var name = profile.aName || profile.eName;

                    var params = [];
                    params[0] = profile.tenantId;
                    params[1] = 1;
                    params[2] = profile.username;
                    params[3] = profile.customerId;
                    params[4] = profile.customerId;
                    params[5] = profile.name;
                    params[6] = name;
                    params[7] = name.split(" ")[0] || "";
                    params[8] = name.split(" ")[1] || "";
                    params[9] = "";
                    params[10] = "";
                    params[11] = 0;
                    params[12] = profile.token;

                    trx.executeSql("INSERT INTO CachedUser(tenantId, branchId, username, id, code, aName, eName, firstName, lastName, mobile, email, taxFree, token) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)", params, function () {
                        console.log("Cached Profile!");
                    }, function (evt, err) {
                        console.log(err);
                        return false;
                    });
                }, function () {
                    return true;
                });

            }, function () {
                callback ? callback(false) : false;
            }, function () {
                callback ? callback(true) : false;
            });
        } else {
            callback ? callback(false) : false;
        }
    },
    deleteUserProfile: function (callback) {
        if (DB.db) {
            DB.db.transaction(function (tx) {
                tx.executeSql("DELETE FROM CachedUser", [], function () {
                    callback ? callback(true) : false;
                }, function () {
                    callback ? callback(false) : false;
                });
            });
        } else {
            callback ? callback(false) : false;
        }
    },
    login: function (options, callback) {
        options = options || "";

        var username = options.Username;
        var password = options.Password;

        if (!username) {
            callback ? callback("Username cannot be empty", null) : false;
            return;
        }
        if (!password) {
            callback ? callback("Password cannot be empty", null) : false;
            return;
        }

        Utils.requestWebService("users/login", {
            Username: username,
            Password:password
        }, function (resp) {
            if (resp.Error) {
                callback ? callback(resp.Result, null) : false;
                return;
            }
            callback ? callback(null, resp.Result) : false;
        }, function (error) {
            console.error(error);
            callback ? callback("_serverError", null) : false;
        }, {
            preventLoading: options.preventLoading || false,
            method:"POST"
        });
    },
    myProfile: function (options, callback) {
        options = options || "";


        Utils.requestWebService("users/myProfile", {
            customerId: options.customerId || cachedUser.id
        }, function (resp) {
            if (resp.Error) {
                callback ? callback(resp.Result, null) : false;
                return;
            }
            callback ? callback(null, resp.Result) : false;
        }, function (error) {
            console.error(error);
            callback ? callback("_serverError", null) : false;
        }, {
            preventLoading: options.preventLoading || false
        });
    },
    verifyPINCode: function (options, callback) {
        options = options || {};

        Utils.requestWebService("verifyPINCode", {
            Args: JSON.stringify({
                Mobile: options.Mobile,
                PINCode: options.PINCode,
                Language: currentLanguage,
                TenantID: tenantID
            })
        }, function (resp) {
            if (resp.Error) {
                callback ? callback(resp.Result, null) : false;
                return;
            }
            callback ? callback(null, resp.Result) : false;
        }, function (error) {
            console.error(error);
            callback ? callback("_serverError", null) : false;
        }, {
            preventLoading: options.preventLoading || false
        });
    },
    resendPINCode: function (options, callback) {
        options = options || {};

        Utils.requestWebService("resendPINCode", {
            Args: JSON.stringify({
                Mobile: options.Mobile,
                Language: currentLanguage,
                TenantID: tenantID
            })
        }, function (resp) {
            if (resp.Error) {
                callback ? callback(resp.Result, null) : false;
                return;
            }
            callback ? callback(null, resp.Result) : false;
        }, function (error) {
            console.error(error);
            callback ? callback("_serverError", null) : false;
        }, {
            preventLoading: options.preventLoading || false
        });
    },
    setupProfile: function (options, callback) {
        options = options || {};

        Utils.requestWebService("setupProfile", {
            Args: JSON.stringify({
                Mobile: options.Mobile,
                FirstName: options.FirstName,
                LastName: options.LastName,
                Language: currentLanguage,
                TenantID: tenantID
            })
        }, function (resp) {
            if (resp.Error) {
                callback ? callback(resp.Result, null) : false;
                return;
            }
            callback ? callback(null, resp.Result) : false;
        }, function (error) {
            console.error(error);
            callback ? callback("_serverError", null) : false;
        }, {
            preventLoading: options.preventLoading || false
        });
    },
    savePushToken: function (options, callback) {
        options = options || {};

        Utils.requestWebService("pushDevices", {
                userId: options.UserID,
                token: options.Token,
                platform: options.Platform
        }, function (resp) {
            if (resp.Error) {
                callback ? callback(resp.Result, null) : false;
                return;
            }
            callback ? callback(null, resp.Result) : false;
        }, function (error) {
            console.error(error);
            callback ? callback("_serverError", null) : false;
        }, {
                preventLoading: options.preventLoading || false,
                method:"POST"
            });
    },
    getAddressses: function (options, callback) {
        options = options || {};

        Utils.requestWebService("customerLocations", {
                customerId: options.customerId,
        }, function (resp) {
            if (resp.Error) {
                callback ? callback(resp.Result, []) : false;
                return;
            }
            callback ? callback(null, resp.Result.data) : false;
        }, function (error) {
            console.error(error);
            callback ? callback("_serverError", []) : false;
        }, {
            preventLoading: options.preventLoading || false
        });
    },
    updateProfile: function (options, callback) {
        options = options || {};

        Utils.requestWebService("users/updateProfile", {
                customerId: options.customerId,
                aName: options.aName,
                eName: options.eName,
                mobile: options.mobile
        }, function (resp) {
            if (resp.Error) {
                callback ? callback(resp.Result, null) : false;
                return;
            }
            callback ? callback(null, resp.Result) : false;
        }, function (error) {
            console.error(error);
            callback ? callback("_serverError", []) : false;
        }, {
            preventLoading: options.preventLoading || false,
            method:"POST"
        });
    },
    signUp: function (options, callback) {
        options = options || {};

        Utils.requestWebService("customers", {
                id: options.id,
                username: options.username,
				password: options.password,
				aName: options.aName,
				eName:options.eName,
				email: options.email,
				mobile: options.mobile,
				address: options.address,
				countryId:options.countryId,
                cityId: options.cityId,
                areaId: options.areaId,
				neighborhood: options.neighborhood,
				street: options.street,
				//flat: options.flat,
				latitude: options.latitude,
				longitude: options.longitude,
				tenantId: options.tenantId
        }, function (resp) {
            if (resp.Error) {
                callback ? callback(resp.Result, null) : false;
                return;
            }
            callback ? callback(null, resp.Result) : false;
        }, function (error) {
            console.error(error);
            callback ? callback("_serverError", []) : false;
        }, {
            preventLoading: options.preventLoading || false,
            method:"POST"
        });
    }
};

Data.Categories = {
    getCategories: function (options, callback) {
        options = options || {};

        Utils.requestWebService("categories", {
           
        }, function (resp) {
            if (resp.Error) {
                callback ? callback(resp.Result, []) : false;
                return;
            }
            callback ? callback(null, resp.Result.data) : false;
        }, function (error) {
            console.error(error);
            callback ? callback("_serverError", []) : false;
        }, {
            preventLoading: options.preventLoading || false
        });
    },
    getSubCategories: function (options, callback) {
        options = options || {};

        Utils.requestWebService("getSubCategories", {
            Args: JSON.stringify({
                TenantID: tenantID,
                BranchID: branchID,
                CategoryID: options.CategoryID
            })
        }, function (resp) {
            if (resp.Error) {
                callback ? callback(resp.Result, []) : false;
                return;
            }
            callback ? callback(null, resp.Result) : false;
        }, function (error) {
            console.error(error);
            callback ? callback("_serverError", []) : false;
        }, {
            preventLoading: options.preventLoading || false
        });
    }
};

Data.Items = {
    getCategoryItems: function (options, callback) {
        options = options || {};

        Utils.requestWebService("items", {
                categoryId: options.categoryId,
                isOffer: options.isOffer
        }, function (resp) {
            if (resp.Error) {
                callback ? callback(resp.Result, []) : false;
                return;
            }
            callback ? callback(null, resp.Result.data) : false;
        }, function (error) {
            console.error(error);
            callback ? callback("_serverError", []) : false;
        }, {
            preventLoading: options.preventLoading || false
        });
    }
};

Data.Orders = {
    getOrders: function (options, callback) {
        options = options || {};

        if (!options.customerId) {
            callback ? callback("Customer cannot be empty", []) : false;
            return;
        }

        Utils.requestWebService("orders", {
          customerId:options.customerId,
          _sortBy:"createdAt",
          _sortDirection:"desc",
          _page:1,
          _pageSize:50
        }, function (resp) {
            if (resp.Error) {
                callback ? callback(resp.Result, []) : false;
                return;
            }
            callback ? callback(null, resp.Result.data) : false;
        }, function (error) {
            console.error(error);
            callback ? callback("_serverError", []) : false;
        }, {
            preventLoading: options.preventLoading || false
        });
    },
    saveOrder: function (options, callback) {
        options = options || {};

        var order = options.order;

        if (!order) {
            callback ? callback("Order cannot be empty", null) : false;
            return;
        }

        Utils.requestWebService("orders", order, function (resp) {
            if (resp.Error) {
                callback ? callback(resp.Result, null) : false;
                return;
            }
            callback ? callback(null, resp.Result) : false;
        }, function (error) {
            console.error(error);
            callback ? callback("_serverError", null) : false;
        }, {
            preventLoading: options.preventLoading || false,
            method: "POST"
        })
    },
    getOrderDetails: function (options, callback) {
        options = options || {};

        var orderId = options.orderId || 0;
        if (!orderId) {
            callback ? callback("Order not found!") : false;
            return;
        }

        Utils.requestWebService("orders/details", {
            orderId: orderId
        }, function(resp) {
            if(resp.Error) {
                callback ? callback(resp.Result, null) : false;
                return;
            }

            callback ? callback(null, resp.Result) : false;
        }, function(error) {
            callback ? callback("_serverError", null) : false;
        }, {
            preventLoading: options.preventLoading || false
        })
    }
};

Data.Addresses = {
    getCountries: function (options, callback) {
        options = options || {};

        Utils.requestWebService("countries", {
          
        }, function (resp) {
            if (resp.Error) {
                callback ? callback(resp.Result, []) : false;
                return;
            }
            callback ? callback(null, resp.Result.data) : false;
        }, function (error) {
            console.error(error);
            callback ? callback("_serverError", []) : false;
        }, {
            preventLoading: options.preventLoading || false
        });
    },
    getCities: function (options, callback) {
        options = options || {};

        Utils.requestWebService("cities", {
            countryId:options.countryId,
        }, function (resp) {
            if (resp.Error) {
                callback ? callback(resp.Result, []) : false;
                return;
            }
            callback ? callback(null, resp.Result.data) : false;
        }, function (error) {
            console.error(error);
            callback ? callback("_serverError", []) : false;
        }, {
            preventLoading: options.preventLoading || false
        });
    },
    getAreas: function (options, callback) {
        options = options || {};

        Utils.requestWebService("areas", {
          countryId:options.countryId,
          cityId:options.cityId
        }, function (resp) {
            if (resp.Error) {
                callback ? callback(resp.Result, []) : false;
                return;
            }
            callback ? callback(null, resp.Result.data) : false;
        }, function (error) {
            console.error(error);
            callback ? callback("_serverError", []) : false;
        }, {
            preventLoading: options.preventLoading || false
        });
    },
    updateAddress: function (options, callback) {
        options = options || {};
        var record = Object.assign(options, {
           // Language: currentLanguage
        });

        Utils.requestWebService("customerLocations", record, function (resp) {
            if (resp.Error) {
                callback ? callback(resp.Result, null) : false;
                return;
            }
            callback ? callback(null, resp.Result) : false;
        }, function (error) {
            console.error(error);
            callback ? callback("_serverError", null) : false;
        }, {
            preventLoading: options.preventLoading || false,
            method: record.id==0?"POST":"PUT"
        })
    },
    addAddress: function (options, callback) {
        options = options || {};
        var record = Object.assign(options, {
           // Language: currentLanguage
        });

        Utils.requestWebService("customerLocations", record, function (resp) {
            if (resp.Error) {
                callback ? callback(resp.Result, null) : false;
                return;
            }
            callback ? callback(null, resp.Result) : false;
        }, function (error) {
            console.error(error);
            callback ? callback("_serverError", null) : false;
        }, {
            preventLoading: options.preventLoading || false,
            method:"POST"
        })
    }
}

Data.PaymentMethods = {
    getPaymentMethods: function(options, callback) {
        options = options || {};

        Utils.requestWebService("paymentTypes", {
         
        }, function(resp) {
            if(resp.Error) {
                callback ? callback(resp.Result, []) : false;
                return;
            }

            callback ? callback(null, resp.Result.data) : false;
        }, function(error) {
            console.error(error);
            callback ? callback("_serverError", []) : false;
        }, {
            preventLoading: options.preventLoading || false
        })
    },
    getCustomerPaymentMethods: function(options, callback) {
        options = options || {};

        if (!options.CustomerID) {
            callback ? callback("Customer cannot be empty", []) : false;
            return;
        }

        Utils.requestWebService("getCustomerPaymentMethods", {
            Args: JSON.stringify({
                CustomerID: options.CustomerID
            })
        }, function(resp) {
            if(resp.Error) {
                callback ? callback(resp.Result, []) : false;
                return;
            }

            callback ? callback(null, resp.Result) : false;
        }, function(error) {
            console.error(error);
            callback ? callback("_serverError", []) : false;
        }, {
            preventLoading: options.preventLoading || false
        })
    }
}

Data.Notifications = {
    getNotifications: function(options, callback) {
        options = options || {};

        Utils.requestWebService("notifications", {
            active: 1,
            _sortBy:"createdAt",
            _sortDirection:"desc",
            _page:1,
            _pageSize:50
        }, function(resp) {
            if(resp.Error) {
                callback ? callback(resp.Result, []) : false;
                return;
            }

            callback ? callback(null, resp.Result.data) : false;
        }, function(error) {
            console.error(error);
            callback ? callback(error, []) : false;
        }, {
            preventLoading: options.preventLoading || false
        })
    }
}


Data.Banners = {
    getBanners: function(options, callback) {
        options = options || {};

        Utils.requestWebService("banners", {
            active: 1,
            _sortBy:"createdAt",
            _sortDirection:"desc",
            _page:1,
            _pageSize:50
        }, function(resp) {
            if(resp.Error) {
                callback ? callback(resp.Result, []) : false;
                return;
            }

            callback ? callback(null, resp.Result.data) : false;
        }, function(error) {
            console.error(error);
            callback ? callback(error, []) : false;
        }, {
            preventLoading: options.preventLoading || false
        })
    }
}

Data.Promotions = {
    getPromotions: function (options, callback) {
        options = options || {};

        Utils.requestWebService("promotions", {
                active: 1,
                checkDate:true,
                checkTime:true
        }, function (resp) {
            if (resp.Error) {
                callback ? callback(resp.Result, []) : false;
                return;
            }
            callback ? callback(null, resp.Result.data) : false;
        }, function (error) {
            console.error(error);
            callback ? callback("_serverError", []) : false;
        }, {
            preventLoading: options.preventLoading || false
        });
    }
};
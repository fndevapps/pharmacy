var Utils = {
    requestWebService: function (api, params, successCB, errorCB, options) {
        options = options || {};

        var method = (options.method || "GET").toLowerCase();

        params = params || {};
        if (Object.keys(params).length == 0) {
            params = method == "get" ? "" : undefined;
        } else {
            if (method == "get") {
                var qParams = [];
                Object.keys(params).forEach(function (key) {
                    qParams.push(key + "=" + params[key]);
                });
                if (qParams.length > 0) {
                    params = qParams.join("&");
                }
                else {
                    params = "";
                }
            }
            else {
                params = JSON.stringify(params);
            }
        }
        //params.Random = Date.now();

        console.log(api + " - " + JSON.stringify(options));

        if (options.preventLoading) {
            console.log("Loading Prevented");
        } else {
            showLoading();
        }

        var wcfUrl = options.isFullURL ? api : getWCFURL(api);

        //console.log(wcfUrl);
        //console.log();

        console.log("Checking connection")
        Utils.checkConnection(function (isConnected) {
            console.log("Checked Connection " + isConnected);
            if (!isConnected) {
                //errorCB ? errorCB("_offline") : false;
                hideLoading();
                return;
            }

            $.ajax({
                type: options.method || "GET",
                dataType: "json",
                contentType: "application/json",
                url: wcfUrl,
                data: params,
                success: successCB,
                error: function (error) {
                    errorCB ? errorCB("_serverError") : false;
                },
                complete: function () {
                    if (options.preventLoading) {
                        console.log("Loading Prevented");
                    } else {
                        hideLoading();
                    }
                }
            });
        });
    },
    getCurrentLocation: function (callback, options, retries) {
        options = options || {};

        console.log("Get Location " + JSON.stringify({
            enableHighAccuracy: options.hasOwnProperty("enableHighAccuracy") ? options.enableHighAccuracy : true,
            timeout: options.hasOwnProperty("timeout") ? options.timeout : 60000,
            retries: retries || 0
        }))

        if (!retries) {
            retries = 0;
        }

        if (retries == 2) {
            if (!options.preventLoading) {
                hideLoading();
            }
            callback ? callback(false) : false;
            return;
        }

        if (!options.preventLoading) {
            showLoading();
        }
        if (!navigator.simulator) {
            Utils.checkGPS(function (enabled) {
                if (enabled) {
                    navigator.geolocation.getCurrentPosition(function (pos) {
                        hideLoading();
                        callback ? callback({
                            Latitude: pos.coords.latitude,
                            Longitude: pos.coords.longitude
                        }) : false;
                    }, function (error) {
                        //_alert(JSON.stringify(error));
                        if (!options.preventLoading) {
                            hideLoading();
                        }
                        //callback ? callback(false) : false;
                        options.enableHighAccuracy = false;
                        return Utils.getCurrentLocation(callback, options, ++retries)
                    }, {
                        enableHighAccuracy: options.hasOwnProperty("enableHighAccuracy") ? options.enableHighAccuracy : true,
                        timeout: options.hasOwnProperty("timeout") ? options.timeout : 60000
                    });
                }
                else {
                    callback ? callback(false) : false;
                }
            })
        } else {
            navigator.geolocation.getCurrentPosition(function (pos) {
                hideLoading();
                callback ? callback({
                    Latitude: pos.coords.latitude,
                    Longitude: pos.coords.longitude
                }) : false;
            }, function (error) {
                if (!options.preventLoading) {
                    hideLoading();
                }
                callback ? callback(false) : false;
            }, { /*enableHighAccuracy: true, timeout: 10000*/ });
        }
    },
    getLocationName: function (lat, long, callback) {
        console.log(lat + "," + long);
        console.log("http://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + long + "&sensor=true");
        Utils.requestWebService("http://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + long + "&sensor=true", {}, function (res) {
            if (res.status.toLowerCase() === "ok") {
                var results = res.results;
                console.log("googleMap ", results)
                var result = results.filter(function (item) {
                    try {
                        return false || item.address_components.filter(function (component) {
                            try {
                                return component.types;
                            } catch (ex) {
                            }
                        })[0];
                    } catch (ex) {
                    }
                })[0];

                if (!result) {
                    callback ? callback(false) : false;
                    return;
                }

                var country = result.address_components.filter(function (item) {
                    try {
                        return item.types.indexOf("country") > -1;
                    } catch (ex) {
                    }
                })[0] || {};

                var city = result.address_components.filter(function (item) {
                    try {
                        return item.types.indexOf("locality") > -1;
                    } catch (ex) {
                    }
                })[0] || {};

                var area = result.address_components.filter(function (item) {
                    try {
                        return item.types.indexOf("sublocality_level_1") > -1;
                    } catch (ex) {
                    }
                })[0] || {};

                var roadName = result.address_components.filter(function (item) {
                    try {
                        return item.types.indexOf("route") > -1;
                    } catch (ex) {
                    }
                })[0] || {};

                var data = {
                    country: country.long_name || "",
                    city: city.short_name || "",
                    area: area.short_name || "",
                    roadName: roadName.short_name || ""
                }

                callback ? callback(data) : false;
            } else {
                callback ? callback(false) : false;
            }
        }, function (error) {
            hideLoading();
            callback ? callback(false) : false;
        }, { isFullURL: true })
    },
    getPicture: function (callback, options) {
        options = options || {};

        if (options.source) {
            if (options.source === "gallery") {
                Utils.getPictureFromSource(navigator.camera.PictureSourceType.PHOTOLIBRARY, callback, options);
                return;
            } else if (options.source === "camera") {
                Utils.getPictureFromSource(navigator.camera.PictureSourceType.CAMERA, callback, options);
                return;
            }
        }

        if (navigator.simulator) {
            Utils.getPictureFromSource(navigator.camera.PictureSourceType.PHOTOLIBRARY, callback, options);
            return;
        }

        //Show a Gallery/Camera action sheet to get the source of the picture
        window.plugins.actionsheet.show({
            'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT, // default is THEME_TRADITIONAL
            'title': options.title,
            'buttonLabels': ['Take Photo', 'Camera Roll'],
            'androidEnableCancelButton': false, // default false
            'winphoneEnableCancelButton': true, // default false
            'addCancelButtonWithLabel': 'Cancel',
            'position': [20, 40] // for iPad pass in the [x, y] position of the popover
        }, function (buttonIndex) {
            if (buttonIndex === 1) {
                //Camera
                Utils.getPictureFromSource(navigator.camera.PictureSourceType.CAMERA, callback, options);
                return;
            } else if (buttonIndex === 2) {
                //Gallery
                Utils.getPictureFromSource(navigator.camera.PictureSourceType.PHOTOLIBRARY, callback, options);
                return;
            }
        });
    },
    getPictureFromSource: function (source, callback, options) {
        options = options || {};

        if (source.toString().toLowerCase() === "gallery") {
            source = navigator.camera.PictureSourceType.PHOTOLIBRARY;
        }
        if (source.toString().toLowerCase() === "camera") {
            source = navigator.camera.PictureSourceType.CAMERA;
        }

        navigator.camera.getPicture(function (picture) {
            if (!options.destinationType || (options.destinationType && options.destinationType === Camera.DestinationType.DATA_URL)) {
                picture = "data:image/png;base64," + picture;
            }
            callback ? callback(picture) : false;
        }, function (err) {
            callback ? callback("") : false;
        }, {
            quality: options.quality || parseInt(getSystemParameter('CameraQuality', '80')),
            targetWidth: options.targetWidth || parseInt(getSystemParameter('CameraTargetWidth', '350')),
            targetHeight: options.targetHeight || parseInt(getSystemParameter('CameraTargetHeight', '350')),
            destinationType: options.destinationType || Camera.DestinationType.DATA_URL,
            sourceType: source,
            correctOrientation: true
        });
    },
    getMimeType: function (fileName) {
        var extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        var mimeType = "";

        switch (extension) {
            case "png":
            case "jpg":
            case "jpeg":
            case "bmp":
            case "gif":
                mimeType = "image/" + extension;
                break;
            case "pdf":
                mimeType = "application/pdf"
                break;
        }

        return mimeType;
    },
    getDownloadPath: function (target, callback) {
        if (window["url"]) {
            target = target.replace(url, "");
        }

        var fileDir = "";
        if (device.platform.toLowerCase() === "android") {
            fileDir = cordova.file.externalDataDirectory;
        } else {
            fileDir = cordova.file.dataDirectory;
        }

        window.resolveLocalFileSystemURL(fileDir, function (dir) {
            Utils.createDirectory(dir, target.substr(0, target.lastIndexOf("/")), function (res) {
                res.getFile(target.substr(target.lastIndexOf("/") + 1), {
                    create: true,
                    exclusive: false
                }, function (entry) {
                    callback ? callback(null, entry) : false;
                }, onError);
            }, onError);
        }, onError);

        function onError(ex) {
            callback ? callback(ex, null) : false;
        }
    },
    downloadFile: function (filePath, successCB, errorCB) {
        var fileName = filePath.substring(filePath.lastIndexOf("/") + 1);

        Utils.getDownloadPath("/downloads/" + fileName, function (err, fileEntry) {
            if (err) {
                errorCB ? errorCB(err) : false;
                return;
            }

            var req = new XMLHttpRequest();
            req.open("GET", filePath, true);
            req.responseType = "blob";
            req.onload = function (e) {
                console.log("on XHR response!");
                var blob = req.response;
                if (blob) {
                    var dataBlob = new Blob([blob], { type: Utils.getMimeType(fileName) });
                    fileEntry.createWriter(function (writer) {
                        writer.onwriteend = function () {
                            console.log("Done writing file...");
                            successCB ? successCB(fileEntry.nativeURL) : false;
                        }
                        writer.onerror = function (err) {
                            console.log("Write Error " + err);
                            errorCB ? errorCB(err) : false;
                        }
                        writer.write(dataBlob);
                    })
                }
                else {
                    console.log("No response found!");
                    errorCB ? errorCB("Could not download file!") : false;
                }
            };
            req.onerror = function (err) {
                console.error("Request Error ", err);
                errorCB ? errorCB(err) : false;
            }
            req.send(null);
        })
    },
    openFile: function(path, successCB, errorCB) {
        if(!cordova.plugins || !cordova.plugins.fileOpener2) {
            errorCB ? errorCB("Failed to open file") : false;
            return;
        }

        cordova.plugins.fileOpener2.open(
            path,
            Utils.getMimeType(path),
            {
                error : function(e) {
                    console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                    errorCB ? errorCB(e.message) : false;
                },
                success : function () {
                    console.log('file opened successfully');
                    successCB ? successCB() : false;
                }
            }
        );
    },
    createDirectory: function (root, path, successCB, errorCB) {
        var dirs = path.split("/").reverse();

        var createDir = function (dir) {
            root.getDirectory(dir, {
                create: true,
                exclusive: false
            }, successGetDir, failGetDir);
        };

        var successGetDir = function (entry) {
            root = entry;
            if (dirs.length > 0) {
                createDir(dirs.pop());
            } else {
                successCB ? successCB(entry) : false;
            }
        };

        var failGetDir = function (error) {
            errorCB ? errorCB(error) : false;
        };

        createDir(dirs.pop());
    },
    deleteDirectory: function (target, callback) {
        var fileDir = "";
        if (device.platform.toLowerCase() === "android") {
            fileDir = cordova.file.externalDataDirectory;
        } else {
            fileDir = cordova.file.dataDirectory;
        }

        window.resolveLocalFileSystemURL(fileDir, function (dir) {
            Utils.createDirectory(dir, target.substr(0, target.lastIndexOf("/")), function (res) {
                dir.getDirectory(target, { create: false, exclusive: false }, function (targetDir) {
                    targetDir.removeRecursively(function () {
                        console.log("Directory Deleted!");
                        callback ? callback(true) : false;
                    }, function () {
                        callback ? callback(false) : false;
                    });
                }, function () {
                    //Directory not found
                    callback ? callback(true) : false;
                });
            }, function () {
                callback ? callback(false) : false;
            });
        }, function () {
            callback ? callback(false) : false;
        });

        function onError() {
            callback ? callback(target) : false;
        }
    },
    getLocalURL: function (resource) {
        var fileDir = "";
        if (device.platform.toLowerCase() === "android") {
            fileDir = cordova.file.externalDataDirectory;
        } else {
            fileDir = cordova.file.dataDirectory;
        }

        var localURL = fileDir + (fileDir.substr(fileDir.length - 1) === "/" ? "" : "/") + resource;

        var img = new Image();
        img.onload = function () {
            console.log("Local image loaded!")
        };
        img.onerror = function (error) {
            console.log("local image error : " + JSON.stringify(error))
        };
        img.src = localURL;

        return localURL;
    },
    _showingCheckConnectionError: false,
    checkConnection: function (callback) {
        var connType = navigator.connection.type;

        if (connType === Connection.NONE) {
            console.log("Connection Type is NONE!");

            //hideLoading();

            setTimeout(function () {
                if (!Utils._showingCheckConnectionError) {
                    Utils._showingCheckConnectionError = true;
                    _alert("", "_offline", function () {
                        Utils._showingCheckConnectionError = false;
                    });
                }

                if (appIsOnline) {
                    setTimeout(function () {
                        DelegateManager.triggerEvent("app:offline");
                    }, 50);
                }

                appIsOnline = false;
                callback ? callback(appIsOnline) : false;
            }, 250);

            return
        }

        //Utils.requestWebService("ping", {}, function (res) {
        //    callback ? callback(true) : false;
        //}, function (error, xhr) {
        //    console.log("Error: ", error, xhr);
        //    callback ? callback(false) : false;
        //}, {
        //        preventLoading: true
        //    })

        $.ajax({
            type: "GET",
            url: getWCFURL("help?v=" + Date.now()),
            //url: "https://www.google.com",
            timeout: 1000 * 30, //30 seconds
            success: function () {
                if (!appIsOnline) {
                    setTimeout(function () {
                        DelegateManager.triggerEvent("app:online");
                    }, 50);
                }

                appIsOnline = true;
                callback ? callback(appIsOnline) : false;
            },
            error: function (a, b, c) {
                //hideLoading();

                setTimeout(function () {
                    if (!Utils._showingCheckConnectionError) {
                        Utils._showingCheckConnectionError = true;
                        _alert("", "_offline", function () {
                            Utils._showingCheckConnectionError = false;
                        });
                    }

                    if (appIsOnline) {
                        setTimeout(function () {
                            DelegateManager.triggerEvent("app:offline");
                        }, 50);
                    }

                    appIsOnline = false;
                    callback ? callback(appIsOnline) : false;
                }, 250);
            }
        });
    },
    getRandomAlphaNumeric: function (size) {
        var options = "1234567890abcdefghijklmnopqrstuvqxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var output = "";

        for (var i = 0; i < size; i++) {
            output += options.charAt(Math.floor(Math.random() * options.length) + 1);
        }

        return output;
    },
    scanQRCode: function (callback, options) {
        if (!cordova.plugins || !cordova.plugins.barcodeScanner) {
            if (navigator.simulator) {
                navigator.notification.prompt("Enter QR", function (e) {
                    console.log(e);
                    if (e.buttonIndex === 1) {
                        callback ? callback(false, null) : false;
                    }
                    else {
                        callback ? callback(false, e.input1) : false;
                    }
                }, "PROMPT", ["Cancel", "Ok"]);
            }
            else {
                callback ? callback(false, null) : false;
            }
            return;
        }
        options = options || {};

        isScanningBarcode = true;
        console.log("Is Scanning Barcode");
        cordova.plugins.barcodeScanner.scan(function (result) {
            if (result.cancelled) {
                callback ? callback(false, "") : false;
                setTimeout(function () {
                    isScanningBarcode = false;
                    console.log("Is NOT Scanning Barcode");
                }, 1000);
                return;
            }
            if (options.preserveText) {
                callback ? callback(false, result.text) : false;
            }
            else {
                callback ? callback(false, result.text.replace(/[^a-zA-Z0-9_\-]/g, "")) : false;
            }
        }, function (error) {
            isScanningBarcode = false;
            console.log("Is NOT Scanning Barcode");
            console.error(error);
            if (typeof error == "string" && error.toLowerCase().indexOf("prohibited") > -1 && error.toLowerCase().indexOf("access") > -1) {
                callback ? callback(true, PERMISSION_ERRORS.CAMERA) : false;
            }
            else {
                callback ? callback(true, error) : false;
            }
        }, {
            prompt: options.prompt || "Scan QR Code"
        });
    },
    getShareDetails: function (callback) {
        var shareDetails = {
            title: '',
            link: ''
        }
        cordova.getAppVersion.getAppName().then(function (appName) {
            cordova.getAppVersion.getPackageName().then(function (packageName) {
                shareDetails.title = appName;

                if (device.platform.toLowerCase() == "android") {
                    shareDetails.link = "https://play.google.com/store/apps/details?id=" + packageName;
                } else if (device.platform.toLowerCase() == "ios") {
                    shareDetails.link = "https://itunes.apple.com/app/id" + config.appStoreID;
                }

                callback ? callback(shareDetails) : false;
            });
        });
    },
    getCameraPermission: function (callback) {
        if (!navigator.simulator && cordova.plugins.permissions && device.platform.toLowerCase() == "android") {
            var permissions = cordova.plugins.permissions;
            var permissionsList = [permissions.CAMERA];

            permissions.checkPermission(permissionsList[0], function (status) {
                console.log("::CAMERA:: CAMERA permission ", status);
                if (status.hasPermission) {
                    callback ? callback(true) : false;
                }
                else {
                    console.log("::CAMERA:: requesting permission");
                    permissions.requestPermissions(permissionsList, function (status) {
                        if (status.hasPermission) {
                            callback ? callback(true) : false;
                        }
                        else {
                            callback ? callback(false) : false;
                        }
                    }, function () {
                        callback ? callback(false) : false;
                    });
                }
            }, function () {
                callback ? callback(false) : false;
            });
        }
        else {
            callback ? callback(true) : false;
        }
    },
    checkGPS: function (callback) {
        console.log("checkGPS");
        if (!navigator.simulator && CheckGPS) {
            console.log("CheckGPS Plugin Found!");
            CheckGPS.check(function () {
                console.log("GPS is enabled!");
                callback ? callback(true) : false;
            }, function (error) {
                console.error("GPS is not enabled " + JSON.stringify(error));
                if (cordova.dialogGPS && device.platform.toLowerCase() != "ios") {
                    console.log("cordova.dialogGPS Plugin Found!");

                    cordova.dialogGPS(TranslationManager.translate("messages.gpsNotEnabled"), //message
                        "", //description
                        function (buttonIndex) {//callback
                            switch (buttonIndex) {
                                case 0:
                                    callback ? callback(false) : false;
                                    break;//cancel
                                case 1:
                                    callback ? callback(false) : false;
                                    break;//neutro option
                                case 2:
                                    var gpsSettingsCB = DelegateManager.registerEvent("app:resume", function () {
                                        DelegateManager.unregisterEvent(gpsSettingsCB);

                                        Utils.checkGPS(callback);
                                    });
                                    break;//user go to configuration
                            }
                        },
                        " ", //title
                        [TranslationManager.translate("general.cancel"), TranslationManager.translate("general.later"), TranslationManager.translate("general.enable")]);//buttons
                }
                else {
                    console.warn("cordova.dialogGPS Plugin NOT Found!");

                    navigator.notification.alert(TranslationManager.translate("messages.gpsNotEnabled"), function () {
                        callback ? callback(false) : false;
                    }, " ", "btn_OK");
                }
            });
        }
        else {
            console.warn("CheckGPS Plugin NOT Found!");
            callback ? callback(true) : false;
        }
    }
}
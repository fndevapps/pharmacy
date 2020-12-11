//PushNotifications
//init: function(registrationCallback, onNotificationCallback, onNotificationClickedCallback, options)
//options: {senderID: "ANDROID_SENDER_ID"}

//==================Push Notifications=====================//
var notificationCenter = {
    isBusy: false,
    notificationTimeout: false,
    notifications: [],
    notificationSelectedCB: null,
    init: function (notificationSelectedCB) {
        notificationCenter.notificationSelectedCB = notificationSelectedCB;
    },
    onNotification: function (notification) {
        notificationCenter.notifications.push(notification);
        notificationCenter.checkNotifications();
    },
    checkNotifications: function () {
        if (notificationCenter.notifications.length > 0) {
            setTimeout(function () {
                notificationCenter.showNotification();
            }, 100);
        }
    },
    showNotification: function () {
        if (!notificationCenter.isBusy) {
            var notification = notificationCenter.notifications.shift(); //remove the notification from array that was shown.
            var bar = $("#notification-bar");

            if(!navigator.simulator) {
                if (device.platform.toLowerCase() === "ios") {
                    try {
                        NotificationSoundPlugin.playNotification();
                    } catch (ex) {
                    }
                }
                else {
                    try {
                        setTimeout(function () {
                            navigator.notification.beep(1);
                        }, 1000);
                    }
                    catch (ex) { }
                }
            }

            notificationCenter.isBusy = true;
            bar.attr("isvisible", "true");
            bar.find(".notMessage").html(notification.Title);

            //to open the notification details .
            if ('kendo' in window) {
                if (bar.data("kendoTouch")) {
                    bar.data("kendoTouch").destroy();
                }
                bar.kendoTouch({
                    tap: function (e) {
                        try {
                            notificationCenter.notificationSelectedCB(notification);
                        } catch (ex) {
                        }

                        notificationCenter.hideNotification(function () {
                            notificationCenter.checkNotifications();
                        });
                    },
                    drag: function (e) {
                        notificationCenter.hideNotification(function () {
                            notificationCenter.checkNotifications();
                        });
                    }
                });
            }
            bar.css("-webkit-transform", "translate3d(0px,0px,0px)");
            notificationCenter.notificationTimeout = setTimeout(function () {
                notificationCenter.hideNotification(function () {
                    notificationCenter.checkNotifications();
                });
            }, 5000);
        }
    },
    hideNotification: function (callback) {
        var bar = $("#notification-bar");
        var height = bar.outerHeight() * 2;

        //destroy the bar touch , to make the area unclickable .
        if ('kendo' in window) {
            bar.data("kendoTouch").destroy(bar);
        }

        bar.css("-webkit-transform", "translate3d(0px,-" + height + "px,0px)");
        setTimeout(function () {
            bar.find(".notMessage").html("");
            clearTimeout(notificationCenter.notificationTimeout);
            notificationCenter.notificationTimeout = false;
            notificationCenter.isBusy = false;
            callback ? callback() : false;
        }, 200);
    }
};
//=================/Push Notifications=====================//

var PushNotifications = {
    _pushNotification: null,
    registrationCB: null,
    notificationCB: null,
    notificationViewedCB: null,
    init: function (regCB, pushCB, viewCB, options) {
        var _this = this;

        PushNotifications.registrationCB = regCB;
        PushNotifications.notificationCB = pushCB;
        PushNotifications.notificationViewedCB = viewCB;

        options = options || {};

        notificationCenter.init(viewCB);

        _this._pushNotification = window.FirebasePlugin;
        if (!_this._pushNotification) {
            return;
        }

        var onError = function (error) {
            console.error(error);
        };

        if (device.platform.toLowerCase() == "ios") {
            _this._pushNotification.hasPermission(function (isEnabled) {
                if (isEnabled) {
                    continueInit();
                }
                else {
                    _this._pushNotification.grantPermission(function () {
                        continueInit();
                    }, onError);
                }
            }, onError);
        }
        else {
            continueInit();
        }

        function continueInit() {
            _this._pushNotification.onTokenRefresh(function (data) {
                if (PushNotifications.registrationCB) {
                    PushNotifications.registrationCB(data);
                }
            });
            _this._pushNotification.getToken();
            try {
                _this._pushNotification.subscribe("default");
            }
            catch(ex){}

            _this._pushNotification.onMessageReceived(function (data) {
                console.log("on notification ", data);

                var payload = data.payload || {};
                if (typeof payload == "string") {
                    payload = JSON.parse(payload || "{}");
                }
                var notificationData = Object.assign({}, payload);
                payload.Title = data.title;
                payload.Message = data.message;
                payload.Coldstart = !data.tap;
                payload.IsForeground = !data.tap;
                payload.IsSilent = (function () {
                    if (data.messageType == "data") {
                        if (!data.title && !data.message) {
                            return true;
                        }
                        return false;
                    }
                    else {
                        return false;
                    }
                }());
                payload.NotificationData = notificationData;

                try {
                    if (!payload.IsForeground) {
                        PushNotifications.notificationViewedCB(payload);
                    } else {
                        try {
                            PushNotifications.notificationCB(payload);
                        } catch (ex) {
                        }

                        if (!payload.IsSilent) {
                            notificationCenter.onNotification(payload);
                        }
                    }
                } catch (ex) {
                }

                /* try {
                    if(data.badge || data.Badge || payload.NotificationData.badge || payload.NotificationData.Badge) {
                        var badge = data.badge || data.Badge || payload.NotificationData.badge || payload.NotificationData.Badge;
                        _this.setApplicationIconBadgeNumber(badge, function() {});
                    }
                } catch (ex) { } */
            }, onError);
        }
    },
    setApplicationIconBadgeNumber: function (badge, callback) {
        var _this = this;

        try {
            _this._pushNotification.setBadgeNumber(badge, function () {
                callback ? callback() : false;
            }, function () {
                callback ? callback() : false;
            });
        }
        catch (ex) { }
    },
    getApplicationIconBadgeNumber: function (callback) {
        var _this = this;

        _this._pushNotification.getBadgeNumber(function (badge) {
            callback ? callback(badge) : false;
        }, function () {
            callback ? callback(0) : false;
        });
    }
};
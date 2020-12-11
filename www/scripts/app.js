

//var url = "http://192.168.2.200:42094";
//var url = "http://185.96.69.66:42094";
//88114d39117f2d8896ef903c69418db2dfa58047
var url = "http://barakatnet.ddns.net:5426";

var tenantID = 1;
var branchID = 0;

var app = null;
var appVersion = "1.0.0";
var currentLanguage = 'ar';
var appIsOnline = true;
var isScanningBarcode = false;
var systemParams = {};
var currentUser = null;
var cachedUser = {

};
var currentDeviceLanguage = "en";


var currentCurrency = "";

var PERMISSION_ERRORS = {
    CAMERA: 1,
    LOCATION: 2
}

var drawerViews = [
    'components/home/home.html',
    'components/myOrders/myOrders.html',
    'components/aboutUs/aboutUs.html',
    'components/profile/profile.html',
    'components/notifications/notifications.html',
];

$(function () {
    document.addEventListener("deviceready", onDeviceReady, false);

    /* $(document.body).click(function (e) {
        if ($(e.target).hasClass("form-group")) {
            $(e.target).find(".form-control").focus();
        }
        else {
            $(".form-control:focus").blur();
        }
    }); */
});

function onDeviceReady() {
    console.log("Device Ready!");

    if (device.isVirtual) {
        navigator.simulator = true;
    }

    try {
        StatusBar.backgroundColorByHexString('#97c242');
    } catch (ex) { }

    //Disabled Accessibility Font Size
    try {
        MobileAccessibility.usePreferredTextZoom(false);
    } catch (ex) { }

    try {
        navigator.globalization.getLocaleName(
            function (locale) {
                var loc = locale.value;
                if (loc.indexOf("-") > -1) {
                    loc = loc.split("-")[0];
                }
                currentDeviceLanguage = (loc || "").toLowerCase().indexOf("ar") > -1 ? "ar" : "en";
            },
            function () { }
        );
    } catch (ex) { }


    DB.openDB(function () {
        Data.User.getCachedUser(function (err, profile) {
            if (err || profile === null) {
                bootstrap({
                    initial: "components/login/login.html"
                    //initial: "components/home/home.html"
                });
            } else {
                Utils.checkConnection(function (isConnected) {
                    if (isConnected) {
                        loadProfile();
                        //continueLogin();
                    } else {
                        _alert("_error", "_offline", function () {
                            var connectionState = DelegateManager.registerEvent("app:online", function () {
                                DelegateManager.unregisterEvent(connectionState);

                                loadProfile();
                                //continueLogin();
                            });
                        });
                    }
                });
            }

            function loadProfile() {
                Data.User.myProfile({
                    customerId: profile.id
                }, function (err, result) {
                    console.log(err, result);
                    if (!err) {
                        profile = result;
                    }
                    
                    continueLogin();
                });
            }

            function continueLogin() {
                cachedUser = profile;
                tenantID = profile.tenantId;
                branchID = profile.branchId;

                setupAjax(profile);
                setupUserUI();
                //Utils.getCurrentLocation(function () {
                setupPushNotifications(profile);
                //});
                console.log("User Profile *****" + JSON.stringify(profile));

                /* SupportSockets.init({
                    url: config.diagnosisSocketURL + ":" + config.diagnosisSocketPort,
                    userID: profile.UserName
                }); */

                if(cachedUser.hasOwnProperty("customerStatusId") && cachedUser.customerStatusId !=2){
                    bootstrap({
                        initial: "components/pending/pending.html"
                    });
                }else{
                    bootstrap({
                        initial: "components/home/home.html"
                    });
                }

               
            }
        });
    });

    //bootstrap();

    document.addEventListener("pause", function () {
        DelegateManager.triggerEvent("app:pause");
    }, false);
    document.addEventListener("resume", function () {
        DelegateManager.triggerEvent("app:resume");
    }, false);
    document.addEventListener("backbutton", function () {
        console.log("Is Scanning Barcode: " + isScanningBarcode);
        if (isScanningBarcode) {
            return;
        }

        if ($(":focus").length > 0) {
            $(":focus").blur();
        }

        switch (getViewID()) {
            case "#loginView":
                try {
                    navigator.app.exitApp();
                } catch (ex) { }
                break;
            case "#homeView":
                logoutUser();
                break;
            default:
                try {
                    var activeController = $(getViewID()).data("controller");
                    window[activeController].back();
                } catch (ex) { }
                break;
        }
    }, false);
    document.addEventListener("online", function () {
        console.info("ONLINE - checking connection");
        Utils.checkConnection();
    }, false);
    document.addEventListener("offline", function () {
        console.info("OFFLINE - checking connection");
        Utils.checkConnection();
    }, false);
}

function bootstrap(options) {
    options = Object.assign({}, options);

    if (app !== null) {
        return;
    }

    currentLanguage = localStorage.getItem("language") || "en";

    Data.SystemParameters.getSystemParameters({}, function (err, data) {
        if (err) {
            try {
                navigator.splashscreen.hide();
            } catch (ex) { }
            _alert("Please reload the app!");
            return;
        }
        systemParams = data;
        currentCurrency = currentLanguage == "ar" ? getSystemParameter('CurrencyAR', '') : getSystemParameter('CurrencyEN', '');

        app = new kendo.mobile.Application(document.body, {
            skin: "flat",
            initial: options.initial || "components/login/login.html",
            init: function () {
                window.isTablet = $("html").hasClass("km-tablet");
                initCSS();

                FastClick.attach(document.body);

                setLanguage(currentLanguage);

                setTimeout(function () {
                    $("body").css("visibility", "visible");
                    try {
                        navigator.splashscreen.hide();
                    } catch (ex) { }
                }, 500);

                DelegateManager.registerEvent("language_changed", function () {
                    currentCurrency = currentLanguage == "ar" ? getSystemParameter('CurrencyAR', '') : getSystemParameter('CurrencyEN', '');
                })
            }
        });
    });
}

function layoutView(e, options, callback) {
    var view = e.view.element;

    options = options || {};
    var padding = options.padding || 0;

    setTimeout(function () {
        var contentHeight = view.find(".km-content").height() - padding;

        view.find(".header:visible").each(function () {
            contentHeight -= $(this).outerHeight(true);
        });
        view.find(".footer:visible").each(function () {
            contentHeight -= $(this).outerHeight(true);
        });

        view.find(".content").css("height", contentHeight + "px");

        if (!options.disableScroll) {
            if (view.find(".content").data("kendoMobileScroller")) {
                view.find(".content").data("kendoMobileScroller").contentResized();
            } else {
                view.find(".content").kendoMobileScroller({
                    elastic: options.hasOwnProperty("elastic") ? options.elastic : true
                })
            }
        }

        callback ? callback() : false;
    }, 100)
}

function getViewID() {
    return '#' + app.view().element.attr("id");
}

function navigate(href, dir) {
    //app.navigate(href, dir || "slide:left");
    navigateNative(href, dir);
}

function navigateNativeWithHighlight(e, href, direction, targetView) {
    try {
        e.preventDefault();
        e.stopPropagation();
    } catch (ex) { }
    $("#drawer ul li").removeClass("active");
    $("#ar_drawer ul li").removeClass("active");
    $(e.target).closest("li").addClass("active");
    navigateNative(href, direction, targetView);
}

function navigateNative(href, direction, targetView) {

    if (targetView === getViewID()) {
        closeMenu(event);
        console.log("sameView")
        return;
    }

    //if (href.indexOf(".html") < 0) {
    if (href.indexOf("#") < 0) {
        href = "#" + href;
    }
    //}

    console.log("navigateNative " + href + ", " + direction);

    $(":focus").blur();
    setTimeout(function () {
        closeMenu(event);

        if (!navigator.simulator && window.plugins.nativepagetransitions && direction !== 'none') {
            if (direction.indexOf("right") > -1) {
                direction = currentLanguage === "ar" ? "left" : "right";
            } else {
                direction = currentLanguage === "ar" ? "right" : "left";
            }
            setTimeout(function () {
                if (direction == "fade") {
                    console.log("Navigate (FADE)");
                    window.plugins.nativepagetransitions.fade({
                        'href': href
                    });
                } else {
                    console.log("Navigate (SLIDE) " + direction + ", " + dir);
                    window.plugins.nativepagetransitions.slide({
                        'href': href,
                        'direction': direction,
                        //'duration': 5000
                    });
                }
            });
        } else {
            console.log("Using KendoUI Transitions ", direction);
            console.log("app.navigate(" + href + "," + direction + ")");
            app.navigate(href, direction || "fade");
        }
    }, 0);
}

function initDrawer() {
    var drawer = $("#drawer");

    if (drawer.data("kendoMobileDrawer")) {
        //showMenu();
        return;
        // drawer.data("kendoMobileDrawer").destroy();
    }
    drawer.attr("data-views", JSON.stringify(drawerViews));
    drawer.kendoMobileDrawer({
        show: drawerShow,
        beforeShow: beforeShow,
        swipeToOpen: true,
        position: (function () {
            try {
                /* if (currentLanguage == "ar") {
                     return "right";
                 }*/
                return "left";
            } catch (ex) {
                return "left";
            }
        })(),
        views: drawerViews
    })
}

function initAr_Drawer() {
    var drawer = $("#ar_drawer");

    if (drawer.data("kendoMobileDrawer")) {
        //showMenu();
        return;
        // drawer.data("kendoMobileDrawer").destroy();
    }
    drawer.attr("data-views", JSON.stringify(drawerViews));
    drawer.kendoMobileDrawer({
        show: ar_drawerShow,
        beforeShow: ar_beforeShow,
        swipeToOpen: true,
        position: (function () {
            try {

                return "right";
            } catch (ex) {
                return "right";
            }
        })(),
        views: drawerViews
    })
}

function initCSS() {
    console.log("initCss");
    var css = "";
    var width = $(window).width();
    var height = $(window).height();

    //Home
    (function () {
        var liWidth = width * 0.46;
        //css += "#homeView .grid-list li { height: " + (width * 0.65) + "px}";
        css += "#homeView .grid-list li .item-image { height: " + (liWidth * 0.6) + "px;}";

    })();
    //SignUp
    (function () {
        css += "#signUpView #map {height: " + (height * 0.6) + "px;}";

    })();
    (function () {
        css += "#homeView .grid-list li .list-item .item-name {font-size: " + (width * 0.04) + "px;}";
        css += "#homeView .grid-list li .list-item .item-price {font-size: " + (width * 0.035) + "px;}";
        css += "#homeView .grid-list li .list-item .item-count .item-count-up, #homeView .grid-list li .list-item .item-count .item-count-down {width: " + (height * 0.045) + "px;}";
        css += "#homeView .grid-list li .list-item .item-count .item-count-up, #homeView .grid-list li .list-item .item-count .item-count-down {height: " + (height * 0.045) + "px;}";

    })();

    //pending
    (function() {
        var width = $(window).width();
        var liWidth = width * 0.46;

        css +="#pendingView .warningContainer span {font-size: " + width * 0.055 + "px !important;}";
    })();

    $(document.head).append("<style id='app_style'>" + css + "</style>");
}

function setupAjax(profile) {
    /* $.ajaxSetup({
        headers: { 'tm6bqttbk4h0ontat1': profile.Token || "" }
    }); */

    $.ajaxSetup({
        headers: {
            'tm6bqttbk4h0ontat1': profile.Token || "",
            'TenantID': profile.tenantId,
            'BranchID': profile.branchId
        }
    });
}

function setupUserUI() {
    TranslationManager.updateUI({
        view: (function () {
            if (app && app.view() && app.view().element) {
                return app.view().element;
            }
            return null;
        })()
    });

    //Update User info in drawers
    //English Drawer
    try {
        $("#drawer .userInfo .name").text(cachedUser.eName);
    } catch (ex) {
        console.error(ex);
    }
    //Arabic Drawer
    try {
        $("#ar_drawer .userInfo .name").text(cachedUser.eName);
    } catch (ex) {
        console.error(ex);
    }

    //Update active link in drawers
    //English Drawer
    try {
        if (!app) {
            return;
        }
        var li = $("#drawer").find("li[view='" + getViewID() + "']:eq(0)");
        if (!li) {
            return;
        }
        li.siblings("li").removeClass("active");
        li.addClass("active");
    } catch (ex) {
        console.error(ex);
    }
    //Arabic Drawer
    try {
        if (!app) {
            return;
        }
        var li = $("#ar_drawer").find("li[view='" + getViewID() + "']:eq(0)");
        if (!li) {
            return;
        }
        li.siblings("li").removeClass("active");
        li.addClass("active");
    } catch (ex) {
        console.error(ex);
    }
}

function setupPushNotifications(profile) {
    console.log("Setting up notifications for user " + profile.id);

    PushNotifications.init(function (token) {
        //Save Device Token
        Data.User.savePushToken({
            UserID: profile.id,
            Token: token,
            Platform: device.platform.toLowerCase(),
            preventLoading: true
        }, function (err, result) {
            if (err) {
                console.error(err);
                return;
            }
            console.log("Device token saved " + result);
        });
    }, function (notification) {
        console.log(notification);
    }, function (viewedNotification) {
        console.log(viewedNotification);
    });
}

function isEmpty(value) {
    if (!value || $.trim(value) === "") {
        return true;
    }
    return false;
}
$.prototype.scrollToBottom = function () {
    var el = $(this);
    var scroll = el.data("kendoMobileScroller");

    if (!scroll) {
        return;
    }

    var offset = el.height() - scroll.scrollHeight();
    if (offset > 0) {
        offset = 0;
    }

    //scroll.animatedScrollTo(0, offset);
    scroll.animatedScrollTo(0, offset);
}
$.prototype.fixScroll = function () {
    var el = $(this);
    var scroll = el.data("kendoMobileScroller");

    if (!scroll) {
        return;
    }

    var offset = el.height() - scroll.scrollHeight();

    if (Math.abs(scroll.scrollTop) > offset) {
        scroll.animatedScrollTo(0, offset);
    }
    if (scroll.scrollTop > 0) {
        scroll.animatedScrollTo(0, 0);
    }
}

function getWCFURL(api) {
    return url + "/api/" + api;
}

function getURL(resource, moduleName) {
    moduleName = moduleName || "";
    if (moduleName) {
        moduleName += "/";
    }

    if (resource.indexOf("http") > -1) {
        return resource;
    }

    return url + ("/" + moduleName + resource).replace(/\/+/g, '/');
}

function showLoading(msg) {
    if (window._isActivityIndicatorLoading) {
        return;
    }
    console.log("showLoading");
    window._isActivityIndicatorLoading = true;
    if (!navigator.simulator && ActivityIndicator) {
        ActivityIndicator.show(msg || TranslationManager.translate("_loading"));
    } else {
        app ? app.showLoading() : false;
    }
}

function hideLoading() {
    console.log("hideLoading");
    if (!navigator.simulator && ActivityIndicator) {
        setTimeout(function () {
            ActivityIndicator.hide();
            window._isActivityIndicatorLoading = false;
        }, 1);
    } else {
        app ? app.hideLoading() : false;
        window._isActivityIndicatorLoading = false;
    }
}

function _alert(title, message, callback) {
    if (!message) {
        message = title;
        title = "_alert";
    }
    message = TranslationManager.translate(message);
    title = TranslationManager.translate(title);
    navigator.notification.alert(message, callback || false, title, TranslationManager.translate("btn_OK"));
}
/* function _alerttest(title,message,callback){
    if(!message){
        message =title;
        title="_alert";
    }
    message = TranslationManager.translate(message);
    title = TranslationManager.translate(title);
    navigator.notification.alert(message, callback || false, title, TranslationManager.translate("btn_OK"));
} */
function _confirm(title, callback, message, buttons) {
    navigator.notification.confirm(message, callback, title, buttons);
}
$.prototype.setBackgroundImage = function (bgImage, altImage, options) {
    options = options || {};

    if ($.type(bgImage) != "array") {
        bgImage = [bgImage];
    }

    //console.log("trying to load images " + JSON.stringify(bgImage));

    var el = $(this);
    if (!options.preventClear) {
        el.css("background-image", "none");
    }

    var loading = (options && options.withLoading) || true;
    var loadingClass = "loading-" + el.css("position") === "absolute" ? "absolute" : "relative";

    loading ? el.addClass(loadingClass) : false;

    function tryLoadImage() {
        var imgUrl = bgImage.pop();

        //console.log("Trying to load " + imgUrl + ", " + typeof imgUrl);
        if (!imgUrl || imgUrl == "undefined") {
            return onerror();
        }

        var img = new Image();
        img.onload = function () {
            loading ? el.removeClass(loadingClass) : false;

            el.css("background-image", "url('" + img.src + "')");

            options.done ? options.done() : false;
        };
        img.onerror = onerror;
        img.src = imgUrl;
    }

    function onerror() {
        if (bgImage.length > 0) {
            return tryLoadImage();
        }

        loading ? el.removeClass(loadingClass) : false;

        //console.log("Loading ALT Image: " + altImage);

        if (!altImage || altImage === "") {
            altImage = "none";
        } else {
            altImage = "url('" + altImage + "')";
        }
        el.css("background-image", altImage);

        options.done ? options.done() : false;
    }

    tryLoadImage();
}

function getSystemParameter(name, defaultValue) {
    var param = defaultValue;
    try {
        return systemParams[name];
    } catch (ex) {
        param = defaultValue;
    }

    return param;
}

function getBool(value) {
    var boolResult = false;
    switch (value.toString()) {
        case "1":
        case "true":
        case "yes":
            boolResult = true;
            break;
        default:
            break;
    }
    return boolResult;
}

function checkCorrectNumberForCardNo(e) { //to check the number on coorect form and length
    var length = config.cardholder_id_length;
    var val = '';
    val = $(e.target).val().slice(0, length);
    $(e.target).val(val);


}

function openInAppBrowser(link, title) {
    var params = {
        location: "yes",
        hideurlbar: "yes",
        toolbarcolor: "#bf262b",
        toolbarposition: "top",
        navigationbuttoncolor: "#ffffff",
        closebuttoncolor: "#ffffff",
        closebuttoncaption: "x",
        zoom: "no",
        tsu_direction: (currentDeviceLanguage == "ar" ? "rtl" : "ltr")
    }
    if (title && title != "") {
        params.tsu_title = title;
    }

    var iabParams = [];
    Object.keys(params).forEach(function (key) {
        iabParams.push(key + "=" + params[key]);
    });
    window.open(link, "_blank", iabParams.join(","));
}

function enablePlaceholder(el) {
    setTimeout(function () {
        console.log("Enable Placeholder ");
        console.log(el);

        var placeholder = el.closest("[hasplaceholder]").find(".placeholder");

        if (el.data("placeholder")) {
            console.log("returning");
            resetPlaceholder();
            return;
        }

        el.data("placeholder", placeholder.find("translation").attr("value"));

        function resetPlaceholder() {
            console.log("reset placeholder");
            try {
                if (!el.val() || el.val().length === 0) {
                    placeholder.show();
                    placeholder.find("span").html("<div>" + TranslationManager.translate(el.data("placeholder")) + "</div>");
                } else {
                    placeholder.show();
                    if (el[0].tagName === "SELECT") {
                        placeholder.find("span").html("<div>" + el.find("option:selected").text() + "</div>");
                    } else {
                        placeholder.find("span").html("<div>" + el.val() + "</div>");
                    }
                }
            } catch (ex) {
                console.error("Could not reset placeholder!");
                console.log(ex);
            }
        }

        el.bind("keyup change", resetPlaceholder);

        resetPlaceholder();
    }, 0);
}

function validateCardNo(cardNo) {
    var regExp = new RegExp("^[0-9]+$", "g");

    if (!regExp.test(cardNo)) {
        return {
            valid: false,
            error: "scanCard.characterValidation"
        };
    }

    if (cardNo.length != 16) {
        return {
            valid: false,
            error: "scanCard.minLengthValidation"
        };
    }

    return {
        valid: true,
        error: null
    };
}

function getFormattedCardName(card) {
    try {
        return card.CardTypeName + " - " + card.CardholderID.substr(-4)
    } catch (ex) {
        return card.CardTypeName;
    }
}

function onTabNavigate(e, target) {
    try {
        e.preventDefault();
        e.stopPropagation();
    } catch (ex) { }

    var preserveState = 0;

    switch (target) {
        case 'home':
            if (myCardsView.didInit) {
                preserveState = 1;
            }
            navigate('components/myCards/myCards.html?preserveState=' + preserveState, 'none');
            break;
        case 'addCode':
            if (addCodeView.didInit) {
                preserveState = 1;
            }
            navigate('components/addCode/addCode.html?preserveState=' + preserveState, 'none');
            break;
        case 'Rewards':
            if (RewardsView.didInit) {
                preserveState = 1;
            }
            navigate('components/Rewards/Rewards.html?preserveState=' + preserveState, 'none');
            break;
        case 'profile':
            if (ProfileView.didInit) {
                preserveState = 1;
            }
            navigate('components/profile/profile.html?preserveState=' + preserveState, 'none');
            break;
        case 'explore':
            if (exploreView.didInit) {
                preserveState = 1;
            }
            navigate('components/explore/explore.html?preserveState=' + preserveState, 'none');
            break;
        default:
            break;
    }
}

function openMoreMenu(e) {
    try {
        e.preventDefault();
        e.stopPropagation();
    } catch (ex) { }

    var popover = $("#popover").data("kendoMobilePopOver");
    if (!popover) {
        return;
    }

    popover.open($(e.target).closest("a"));
}

function resetAppState() {
    try {
        loginView.didInit = false;
        verifyView.didInit = false;
        fillInfoView.didInit = false;
        registerView.didInit = false;
        homeView.didInit = false;
        changepinView.didInit = false;
        checkoutView.didInit = false;
        itemDetailsView.didInit = false;
        myOrdersView.didInit = false;
        profileView.didInit = false;
        signUpView.didInit = false;
        cartView.didInit = false;
    } catch (ex) {
        console.error(ex)
    }
}

function hasArabicLetters(value) {
    var arabicCharUnicodeRange = /[\u0600-\u06FF]/g;
    return arabicCharUnicodeRange.test(value);
}

function logoutUser(e) {
    try {
        e.preventDefault();
        e.stopPropagation();
    } catch (ex) { }

    _confirm(TranslationManager.translate("messages._warning"), function (buttonIndex) {
        if (buttonIndex === 2) {
            Data.User.deleteUserProfile(function (didDelete) {
                closeMenu(e);
                setTimeout(function () {
                    localStorage.removeItem("TokenManager.token");
                    cachedUser = {};
                    cachedUser.userMode = USER_MODES.SURF_THE_APP;
                    try {
                        myCardsView.view.find(".cardsListHeaderValue .yourBalanceValue").text("0    " + TranslationManager.translate("myCards.points"));
                    } catch (ex) { }
                    resetAppState();
                    navigate("components/login/login.html", "fade");
                }, 100);
            });
            resetAppState();
            navigate("components/login/login.html", "fade");
        }
    }, TranslationManager.translate("messages.logoutMessage"), [TranslationManager.translate("messages._no"), TranslationManager.translate("messages._yes")]);
}

function validEmail(value) {
    value = value || "";

    if (value.indexOf(" ") == 0) {
        return false;
    }

    if ($.trim(value) == "") {
        return false;
    }

    var re = /[a-zA-Z\_\.0-9]+@[a-zA-Z\_\.0-9]+\.[a-zA-Z]+/;
    return re.test(value);
}

function validPhoneNumber(value) {
    value = value || "";

    if (value.indexOf(" ") == 0) {
        return false;
    }

    if ($.trim(value) == "") {
        return false;
    }
    var np = /^[0-9]+$/;
    if (!np.test(value)) { //Make sure the value consists of numbers ONLY
        return false
    }

    return true;
}
$.prototype.password = function () {
    var el = $(this);
    var arabicCharUnicodeRange = /[\u0600-\u06FF]/g;

    el.bind("keyup", function (event) {
        var value = event.target.value;
        console.log(value);
        value = value.replace(arabicCharUnicodeRange, '');
        console.log(value);
        event.target.value = value;
    })
}

function setLanguage(language) {

    //menuView.menuDataSource.read();
    TranslationManager.setLanguage(language);

    var list = $(".km-listview:not(.static):visible");
    if (list.length > 0 && list.data("kendoMobileListView") && list.data("kendoMobileListView").dataSource) {
        list.data("kendoMobileListView").refresh();
    }

    initDrawer();
    initAr_Drawer();
    DelegateManager.triggerEvent("language_changed");
}

function toggleMenu(e) {
    try {
        e.preventDefault();
        e.stopPropagation();
    } catch (ex) { }

    //$("#splitView").toggleClass("slide");
    var drawer = null;
    if (currentLanguage == "ar") {
        drawer = $("#ar_drawer").data("kendoMobileDrawer");
    } else {
        drawer = $("#drawer").data("kendoMobileDrawer");
    }
    if (drawer) {
        if (drawer.visible) {
            drawer.hide();
        } else {
            drawer.show();
        }
    }
}

function closeMenu(e) {
    try {
        e.preventDefault();
        e.stopPropagation();
    } catch (ex) { }

    //$("#splitView").toggleClass("slide");
    var drawer = null;
    if (currentLanguage == "ar") {
        drawer = $("#ar_drawer").data("kendoMobileDrawer");
    } else {
        drawer = $("#drawer").data("kendoMobileDrawer");
    }
    if (drawer && drawer.visible) {
        drawer.hide();
    }
}

function showMenu(e) {
    try {
        e.preventDefault();
        e.stopPropagation();
    } catch (ex) { }

    //$("#splitView").toggleClass("slide");
    var drawer = null;
    if (currentLanguage == "ar") {
        drawer = $("#ar_drawer").data("kendoMobileDrawer");
    } else {
        drawer = $("#drawer").data("kendoMobileDrawer");
    }
    if (drawer && !drawer.visible) {
        drawer.show();
    }
}

function parseFloatNumber(number, decimalPlaces) {
    try {
        number = number.toString().replace(/,/g, '');
        number = parseFloat(number);
        if (typeof decimalPlaces == "undefined" || decimalPlaces == null) {
            decimalPlaces = 2;
        }
        var output = kendo.toString(number, "n" + decimalPlaces);
        output = output.toString().replace(/,/g, '');
        return parseFloat(output);
    } catch (ex) {
        return parseFloat(number);
    }
}

$.prototype.animatedInput = function () {
    var el = $(this).closest(".form-group");

    if (el.data("animatedInput")) {
        return;
    }

    el.addClass("animated");
    el.data("animatedInput", true);

    var input = null;

    if (el.find("input").length > 0) {
        input = el.find("input");
    }
    else if (el.find("textarea").length > 0) {
        input = el.find("textarea");
    }
    else if (el.find("select").length > 0) {
        input = el.find("select");
    }

    if (!input) {
        return;
    }

    input.on("input change", function () {
        var val = $(this).val();

        if (!val) {
            el.removeClass("full");
        } else {
            el.addClass("full");
        }
    })
}

//======== DRAWER MENU FUNCTIONS =========//
function drawerShow(e) {
    console.log("drawerShow " + e.view.element.data("newUserLogin"));
    if (e.view.element.data("newUserLogin") === true || e.view.element.data("newUserLogin") === undefined) {
        e.view.element.data("newUserLogin", false);

        layoutView(e);
    }
    var view = $("#drawer");
    if (!view.find(".switchContentContainer .switch").data("kendoMobileSwitch")) {
        console.log("CHANGING SETUP!!!!")
        console.log(view.find(".switchContentContainer .switch"))
        view.find(".switchContentContainer .switch").kendoMobileSwitch({
            change: function (e) {
                console.log("CHANGING LANGUAGE #drawer " + e.checked);
                changeLanguage(e);
            },
            checked: false
        });
        //view.find(".switchContentContainer .availableRequestContainer .switchConatiner .km-switch").css("height", view.find(".availableRequestContainer .switchConatiner .km-switch").width() / 1.8);
        //view.find(".switchContentContainer .availableRequestContainer .switchConatiner .km-switch").css("height", view.find(".availableRequestContainer .switchConatiner .km-switch-handle").width() * 1.12);
        //view.find(".switchContentContainer .availableRequestContainer .switchConatiner .km-switch-handle").css("height", view.find(".availableRequestContainer .switchConatiner .km-switch-handle").width());
    }
}

function changeLanguage(e) {
    closeMenu(e);

    console.log("CHange Language!!!");

    setTimeout(function () {
        if (currentLanguage == "ar") {
            var view = $("#drawer");
            if (view.find(".switchContentContainer .switch").data("kendoMobileSwitch")) {
                view.find(".switchContentContainer .switch").data("kendoMobileSwitch").check(false);
                setLanguage('en');
            } else {
                setLanguage('en');
            }

        } else {
            var view = $("#ar_drawer");
            if (view.find(".switchContentContainer .switch").data("kendoMobileSwitch")) {
                view.find(".switchContentContainer .switch").data("kendoMobileSwitch").check(true);
                setLanguage('ar');
            } else {
                setLanguage('ar');
            }
        }
    }, 500);

    //  setLanguage('ar');
    try {
        //  view.find(".switchContentContainer .switch").data("kendoMobileSwitch").check(false);

    } catch (ex) {

    }
}

function beforeShow(e) {
    if (currentLanguage == "ar") {
        e.preventDefault(e);
    }

    if (e.view.element.data("newUserLogin") === true || e.view.element.data("newUserLogin") === undefined) {
        e.view.element.data("newUserLogin", false);

        layoutView(e);
    }
}

function ar_drawerShow(e) {
    console.log("ar_drawerShow " + e.view.element.data("newUserLogin"));
    if (e.view.element.data("newUserLogin") === true || e.view.element.data("newUserLogin") === undefined) {
        e.view.element.data("newUserLogin", false);

        layoutView(e);
    }
    var view = $("#ar_drawer");
    if (!view.find(".switchContentContainer .switch").data("kendoMobileSwitch")) {
        view.find(".switchContentContainer .switch").kendoMobileSwitch({
            change: function (e) {
                console.log("CHANGING LANGUAGE #ar_drawer");
                changeLanguage(e);
            },
            checked: true
        });
        //view.find(".switchContentContainer .availableRequestContainer .switchConatiner .km-switch").css("height", view.find(".availableRequestContainer .switchConatiner .km-switch").width() / 1.8);
        view.find(".switchContentContainer .availableRequestContainer .switchConatiner .km-switch").css("height", view.find(".availableRequestContainer .switchConatiner .km-switch-handle").width() * 1.14);
        view.find(".switchContentContainer .availableRequestContainer .switchConatiner .km-switch-handle").css("height", view.find(".availableRequestContainer .switchConatiner .km-switch-handle").width());
    }
}

function ar_beforeShow(e) {
    if (currentLanguage == "en") {
        e.preventDefault(e);
    }

    if (e.view.element.data("newUserLogin") === true || e.view.element.data("newUserLogin") === undefined) {
        e.view.element.data("newUserLogin", false);

        layoutView(e);
    }
}
//======== DRAWER MENU FUNCTIONS =========//

function getFormattedAddress(address) {
    var formattedAddressParts = [];

    console.log("getFormattedAddress " , address);

    if (address.area && address.area.name)
        formattedAddressParts.push(address.area.name);
    if (address.roadName)
        formattedAddressParts.push(address.roadName);
    if (address.buildingNumber)
        formattedAddressParts.push("Building #" + address.buildingNumber);
    if (address.floor)
        formattedAddressParts.push("Floor #" + address.floor);

    console.log(formattedAddressParts.join(","));

    return formattedAddressParts.join(", ");
}

window.onerror = function (error, url, line) {
    console.log("Error in " + url + " at line " + line + ": " + JSON.stringify(error));
}
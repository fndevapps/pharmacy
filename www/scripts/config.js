var config = {
    cloneID: 101,
    countryID: 7,
    languageID: 2,
    //app config
    autoLogin: true,
    googleMapKey:"",
    appStoreID: "1418947175", //used for generating the share link on iOS
    cardholder_id_length: 16,
    cardholderArMessage:"يجب أن يكون رقم البطاقة 16 رقما",
    cardholderEnMessage:"Card number must be 16 digits",
    mobile_no_length: 20,
    web_password_length: 6,
    web_password_EnMessage: "PIN length should be more than 5 digits",
    web_password_ArMessage: "يجب أن يكون طول كلمة المرور أكثر من 5 خانات",
    email_address_max_length: 50,
    cardholder_name_max_length: 80,
    zip_code_id_length: 5,
    city_id_max_length: 50,
    //Push Notifications
    senderID: "000000000000",
    //Support Sockets
    diagnosisSocketPort: "8888",
    diagnosisSocketURL: "185.193.177.97"
}

var USER_MODES = {
    LOGIN: 1,
    SURF_THE_APP: 2,
    BOTH: 3
}

var sideMenuItems = {
    1: {
        title: "menu.register",
        userMode: USER_MODES.SURF_THE_APP,
        icon: "images/icons/icon_about.png",
        link: "",
        viewName: "",
        showBadge: false,
        count: 0,
        order: 1
    },
    2: {
        title: "menu.myCards",
        userMode: USER_MODES.LOGIN,
        validation: function (_data) {
            if (_data.Cards && _data.Cards.length > 0) {
                return true;
            }
            return false
        },
        icon:"images/icons/icon_about.png",
        link: "components/myCards/myCards.html",
        viewName: "",
        showBadge: false,
        count: 0,
        order: 2
    },
    3: {
        title: "menu.addNewCard",
        userMode: USER_MODES.LOGIN,
        validation: function (_data) {
            if (!_data.Cards || _data.Cards.length == 0) {
                return true;
            }
            return false
        },
        icon: "images/icons/icon_about.png",
        link: "components/addNewCard/addNewCard.html",
        viewName:"",
        showBadge: false,
        count: 0,
        order: 3
    },
    //4: {
    //    title: "menu.cardsBalance",
    //    userMode: USER_MODES.LOGIN,
    //    icon: "images/icons/icon_about.png",
    //    link: "components/cardBalances/cardBalances.html",
    //    viewName: "",
    //    showBadge: false,
    //    count:0,
    //    order: 4
    //},
    //5: {
    //    title: "menu.reportLostCard",
    //    userMode: USER_MODES.LOGIN,
    //    validation: function (_data) {
    //        if (_data.Cards && _data.Cards.length > 0) {
    //            return true;
    //        }
    //        return false
    //    },
    //    icon: "images/icons/icon_about.png",
    //    link: "components/reportLostCard/reportLostCard.html",
    //    viewName: "",
    //    showBadge: false,
    //    order: 5
    //},
    //6: {
    //    title: "menu.transferBalance",
    //    userMode: USER_MODES.LOGIN,
    //    validation: function (_data) {
    //        if (_data.Cards && _data.Cards.length > 0) {
    //            return true;
    //        }
    //        return false
    //    },
    //    icon: "images/icons/icon_about.png",
    //    link: "components/transferBalance/transferBalance.html",
    //    viewName: "",
    //    showBadge: false,
    //    count: 0,
    //    order: 6
    //},
    7: {
        title: "menu.ourLocations",
        userMode: USER_MODES.BOTH,
        icon: "images/icons/icon_about.png",
        link: "components/storeLocator/storeLocator.html",
        viewName: "#storeLocatorView",
        showBadge: false,
        count: 0,
        order: 7
    },
    8: {
        title: "menu.specialOffers",
        userMode: USER_MODES.BOTH,
        icon: "images/icons/icon_about.png",
        //link: "",
        //viewName: "",
        link: "components/offers/offers.html",
        viewName: "#offersView",
        showBadge: false,
        count: 0,
        order: 8
    },
    9: {
        title: "menu.ePointsCollect",
        userMode: USER_MODES.LOGIN,
        icon: "images/icons/icon_about.png",
        link: "",
        viewName: "",
        showBadge: false,
        count: 0,
        order: 9
    },
    10: {
        title: "menu.purchaseDeals",
        userMode: USER_MODES.BOTH,
        icon: "",
        link: "",
        showBadge: false,
        count: 0,
        order: 10
    },
    11: {
        title: "menu.profile",
        userMode: USER_MODES.LOGIN,
        icon: "images/icons/icon_about.png",
        link: "components/profile/profile.html",
        viewName: "",
        showBadge: false,
        count: 0,
        order: 11
    },
    12: {
        title: "menu.aboutUs",
        userMode: USER_MODES.BOTH,
        static: true,
        icon: "images/icons/icon_about.png",
        link: "components/about/about.html", 
        viewName: "#aboutView",
        showBadge: false,
        count: 0,
        order: 12
    },
    13: {
        title: "menu.signIn",
        userMode: USER_MODES.SURF_THE_APP,
        static: true,
        icon: "images/icons/icon_about.png",
        link: "components/login/login.html",
        viewName: "loginView",
        showBadge: false,
        count: 0,
        order: 13
    },
    14: {
        title: "menu.scanCode",
        userMode: USER_MODES.LOGIN,
        static: true,
        icon: "images/icons/icon_qr.png",
        //link: "components/qrReader/qrReader.html",
        //viewName: "#qrReaderView",
        action: "scanCode",
        showBadge: false,
        count: 0,
        order: 0
    },
    15: {
        title: "menu.logOut",
        userMode: USER_MODES.LOGIN,
        static: true,
        icon: "images/icons/icon_about.png",
        action: "logoutUser",
        showBadge: false,
        count: 0,
        order: 15
    }
}
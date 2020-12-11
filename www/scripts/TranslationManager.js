var TranslationManager = {
    generateTranslation: function (language) {
        function genTrans(transNodes, transKey, transObject) {
            transNodes = transNodes || {};
            transKey = transKey || "";

            if ($.type(transObject) === "object" || $.type(transObject) === "array") {
                $.each(transObject, function (i, item) {
                    genTrans(transNodes, transKey + (transKey === "" ? "" : ".") + i, item);
                });
            } else {
                transNodes[transKey] = transObject.replace(/\;/g, '');
            }

            return transNodes;
        }

        var trans = genTrans({}, "", TranslationManager.translations[language]);
        return trans;
    },
    setLanguage: function (language) {
        localStorage.setItem("language", language);

        currentLanguage = language;

        if (currentLanguage == "ar") {
            moment.locale('ar_SA');
        } else {
            moment.locale('en');
        }

        if (language == "ar") {
            $("body").addClass("ar");
            $("body").removeClass("en");
        } else {
            $("body").removeClass("ar");
            $("body").addClass("en");
        }

        var translations = this.generateTranslation(language);

        Object.keys(translations).forEach(function (key) {
            $("translation[value='" + key + "']").html(translations[key]);
        });
    },
    updateUI: function (options) {
        options = options || {};

        var language = options.language || localStorage.getItem("language") || "en";
        var view = options.view || null;

        var translations = this.generateTranslation(language);

        Object.keys(translations).forEach(function (key) {
            if (view !== null) {
                view.find("translation[value='" + key + "']").html(translations[key]);
            } else {
                $("translation[value='" + key + "']").html(translations[key]);
            }
        });
    },
    translate: function (key, options) {
        options = options || {};

        var language = options.language || localStorage.getItem("language") || "en";
        var view = options.view || null;

        var translations = this.generateTranslation(language);

        if (translations.hasOwnProperty(key)) {
            var value = translations[key];

            if (value.indexOf("{{") > -1 && options.hasOwnProperty("params")) {
                Object.keys(options.params).forEach(function (param) {
                    value = value.replace("{{" + param + "}}", options.params[param]);
                });
            }

            return value;
        }
        return key;
    }
}
TranslationManager.translations = {};
TranslationManager.translations["ar"] = {
    _alert: "تنبيه",
    _error: "خطأ",
    _offline: "الرجاء التأكد من الإتصال بالإنترنت",
    _serverError: "خطأ في الخادم",
    _serverErrorMessage: "حصل خطأ في الخادم! يرجى المحاولة مرة أخرى",
    _loading: "جاري التحميل...",
    _pullToRefresh: "اسحب للتحديث",
    _releaseToRefresh: "اترك للتحديث",
    _refresh: "جاري التحديث",
    btn_OK: "حسنا",
    general: {
        scan: "مسح الرقم",
        gpsError: "خطأ في تحديد موقعك",
        welcome: "أهلا",
        cancel: "إلغاء",
        later: "لاحقا",
        enable: "تفعيل",
        noDataFound: "لا يوجد بيانات",
        save: "تخزين",
        qty: "الكمية",
        price: "السعر",
        item: "المادة",
        items: "مادة",
        continue: "المتابعة",
        add: "إضافة",
        change: "تغيير",
        name:"الإسم",
        aname:"الإسم بالعربية",
        ename:"الإسم بالإنجليزية"
    },
    login: {
        welcome: "مرحبا",
        loginInstructions: "يرجى إدخال رقم هاتفك للمتابعة",
        login: "تسجيل الدخول",
        username: "اسم المستخدم",
        password: "كلمة المرور",
        forgotPassword: "نسيت كلمة المرور؟",
        signUp: "مستخدم جديد",
    },
    signUp: {
        aName:"الاسم بالعربية",
        eName:"الاسم بالانجليزية",
        firstName: "الاسم الأول",
        surname: "العائلة",
        email: "البريد الالكتروني",
        confirmEmail: "تأكيد البريد",
        password: "كلمة المرور",
        confrimPassword: "تأكيد كلمة المرور",
        mobile: "رقم الموبايل",
        country:"البلد",
        city: "المدينة",
        area: "المنطقة",
        address:"العنوان",
        neighborhood:"الحي",
        street: "الشارع",
        flat: "رقم الشقة / البيت",
        location: "الموقع",
        fillFields:"الرجاء تعبئة الحقول التالية:",
        signUpMe:"تسجيل",
        username: "اسم المستخدم",
        signUpError: "حصل خطأ أثناء إنشاء حسابك! الرجاء المجاولة مرة أخرى.",
        balance:"الرصيد"
    },
    verify: {
        verify: "تأكيد",
        verificationInstructions: "تم إرسال رمز الدخول الى هاتفك عبر SMS.<br/><br/>يرجى إدخال رمز الدخول للمتابعة.",
        pin: "رمز الدخول",
        verifyPIN: "تأكيد رمز الدخول",
        resend: "إعادة إرسال الرمز",
        changeMobile: "تغيير رقم الموبايل"
    },
    fillInfo: {
        info: "ملفك",
        address: "العنوان",
        fillInfoInstructions: "قم بتعبئة بياناتك",
        fillAddressInstructions: "قم بتعبئة تفاصيل عنوانك"
    },
    forgotPassword: {
        forgotPassword: "نسيت كلمة المرور",
        username: "اسم المستخدم",
        send: "ارسال",
        instructions: "عند ارسال اسم المستخدم الخاص بك, سيتم ارسال بريد الكتروني يحتوي على كلمة سر جديدة"
    },
    register: {
        register: "تسجيل",
        FirstName: "الاسم الاول",
        LastName: "لاسم التاني",
        PIN: "كود التحقق",
        ConfirmPin: "تأكيد كود التحقق",
        Gender: "الجنس",
        Male: "ذكر",
        Female: "انثى",
    },
    menu: {
        home: "الرئيسية",
        search: "بحث",
        more: "المزيد",
        profile: "الملف الشخصي",
        logout: "تسجيل خروج",
        notifications: "اشعارات",
        settings: "الاعدادت",
        explore: "استكشف",
        cart: "العربة",
        myOrders: "طلبياتي",
        checkout: "تأكيد الطلبية",
        aboutUs: "نبذة عنا",

        english: "English",
        arabic: "العربية",
        signUp:"مستخدم جديد",

        editProfile: "تعديل ملفي"
    },
    cart: {
        placeOrder: "تخزين الطلبية",
        subtotal: "المجموع",
        discount: "الخصم",
        delivery: "قيمة التوصيل",
        tax: "الضريبة",
        total: "الإجمالي",
        addToCart: "أضف الى العربة",
        removeFromCart: "إزالة من العربة",
        noItemsInCart: "لا يوجد مواد في العربة",
        orderPlacedSuccessfully: "تم تخزين طلبك بنجاح",
        checkout: "المتابعة",
        address: "العنوان",
        remove: "إزالة",
        items: "مواد",
        clearAll: "إزالة جميع المواد"
    },
    checkout: {
        deliveryAddress: "عنوان التوصيل",
        paymentMethod: "طريقة الدفع",
        promoCode: "كود العرض",
        summary: "الخلاصة",
        thankYou: "شكرا لإرسال طلبك",
        goBackHome: "العودة للشاشة الرئيسية",
        promotions:"العروض",
        appliedPromotions:"العروض المطبقة",
    },
    currency: {
        jd: "د.أ."
    },
    address: {
        updateAddress: "تحديث العنوان",
        name: "الإسم",
        country: "الدولة",
        city: "المدينة",
        area: "المنطقة",
        road: "الشارع",
        buildingNumber: "رقم العمارة",
        apartmentNumber: "رقم الشقة",
        floor: "الطابق",
        landmark: "معلم معروف",
        deliveryInstructions: "تعليمات التوصيل",
        noDataFound: "لم يتم إضافة عناوين",
        addNew: "إضافة عنوان",
        selectAddress: "إختيار العنوان"
    },
    orders: {
        orderNo: "طلبية",
        orderDetails: "تفاصيل الطلبية",
        orderNumber: "رقم الطلبية",
        orderDate: "تاريخ الطلبية",
        customerName: "اسم العميل",
        orderAddress: "العنوان",
        orderStatus:"حالة الطلبية"
    },
    profile: {
        personalInfo: "المعلومات الشخصية",
        addresses: "العناوين"
    },
    messages: {
        _alert: "تنبيه",
        _success: "نجاح",
        _failed: "فشل",
        _warning: "تنبيه",

        cantGoBack: "لا يمكنك العودة الى الشاشة السابقة",

        //signUp
        insertUsername: "الرجاء إدخال اسم الدخول",
        insertPassword: "الرجاء إدخال كلمة المرور",
        confirmPassword: "الرجاء تأكيد كلمة المرور",
        passwordsNotMatched: "تأكيد كلمة المرور غير مطايق للكلمة المدخلة",


        insertAName:"الرجاءإدخال الاسم بالعربية",
        insertEName:"الرجاء إدخال الاسم بالانجليزية",

        insertFirstName: "الرجاء إدخال الاسم الأول",
        insertSurname: "الرجاء إدخال اسم العائلة",

        insertEmail: "الرجاء إدخال البريد الالكتروني",
        invalidEmail: "الرجاء إدخال البريد بالشكل الصحيح",
        confirmEmail: "الرجاء تأكيد البريد",
        emailNotMatched: "تأكيد البريد غير مطايق للبريد المدخل",

        insertAddressName: "الرجاء إدخال إسم العنوان",
        insertAddress: "الرجاء إدخال أقرب معلم",
        insertCountry: "الرجاء إختيار البلد",
        insertCity: "الرجاء إختيار المدينة",
        insertArea: "الرجاء إختيار المنطقة",
        insertNeighborhood:"الرجاء إدخال الحي",
        insertStreet: "الرجاء إدخال اسم الشارع",
        insertFlat: "الرجاء إدخال رقم الشقة أو البيت",
        inertBuildingNumber: "الرجاء إدخال رقم العمارة",
        setLocation: "الرجاء تعيين موقعك على الخريطة ",
        insertMobile:"الرجاء إدخال رقم الموبايل",
        insertPhone: "الرجاء إدخال رقم الموبايل",
        inertVerificationPin: "الرجاء إدخال رمز الدخول",
        insertCurrentPin: "Please enter the Current Password",
        insertNewPin: "Please enter the New Password",
        insertPhoneNumber: "الرجاء إدخال رقم الموبايل",
        invalidPhoneNumber: "رقم الموبايل غير صحيح",
        insertConfirmPin: "Please enter the Confirm Password",
        pinNotMatched: "Password and confirm password do not match",
        insertLostCard: "Insert Lost Card",
        yourPasswordIsNotCorrect: "Your password is not correct",
        yourPINIsNotCorrect: "Your pin is not correct",
        insertToCard: "Select To Card",
        insertFromCard: "Select From Card",
        insertNationality: "Please select the Nationality",
        minimumAgeRequired: "You must be at least 3 years old",
        logoutMessage: "Are you sure you want to logout?",
        _yes: "Yes",
        _no: "No",
        loginToYourAccount: "LOGIN TO YOUR ACCOUNT",
        forgotPassword: "FORGOT PASSWORD?",
        registerAnAccount: "REGISTER AN ACCOUNT",
        checkConnection: "Please Check your internet connection",
        allowCameraPermission: "Please allow access to the camera",
        gpsNotEnabled: "Your GPS is disabled, please enable it from your device settings.",
        enableGPS: "Please enable location services",
        cameraNotEnabled: "Access to the camera is disabled, please enable it from your device settings.",
        enterUsernameAndPassword: "Please enter both phone number and password",
        pinShouldBeDifferentThanCurrent: "Please enter a different password",
        pinShouldBeEnglish: "Passwords cannot contain Arabic letters or numbers",
        web_password_EnMessage: "PIN length should be more than 5 digits",
        noUser: "تأكد أنك قمت بالتسجيل مسبقًا !",
        existsUser: "اسم المستخدم المدخل مسجّل مسبقًا !",
        existsMobile: " رقم الموبايل المدخل مسجّل مسبقًا !",
        existsEmail: " البريد المدخل مسجّل مسبقًا !",
        signUpSuccess:"تم حفظ المعلومات يمكنك تسجيل الدخول الآن .",
        accountNotActived: "لم يتم تفعيل هذا الحساب بعد.",

        confirmClearCart: "هل أنت متأكد من حذف جميع المواد؟"
    },
    pending:{
        pending:"Pending",
        weAreEvaluatingYourProfile:"we are evaluating your profile, we will email you when we have approved your profile."
    }
}
TranslationManager.translations["en"] = {
    _alert: "Alert",
    _error: "Error",
    _offline: "Please check your internet connection",
    _serverError: "Server Error",
    _serverErrorMessage: "A server error has ocurred! Please try again",
    _loading: "Loading...",
    _pullToRefresh: "Pull to refresh",
    _releaseToRefresh: "Release to refresh",
    _refresh: "Refreshing",
    btn_OK: "Ok",
    general: {
        scan: "Scan",
        gpsError: "Failed to get your current location",
        welcome: "Welcome",
        cancel: "Cancel",
        later: "Later",
        enable: "Enable",
        noDataFound: "No Records Found",
        save: "Save",
        qty: "Qty",
        price: "Price",
        item: "Item",
        items: "Item(s)",
        continue: "Continue",
        add: "Add",
        change: "Change",
        name:"Name",
        aname:"Arabic Name",
        ename:"English Name"
    },
    login: {
        welcome: "Welcome",
        loginInstructions: "Please enter your mobile number to continue",
        login: "Login",
        username: "Username",
        password: "Password",
        forgotPassword: "Forgot Password?",
        signUp: "Sign up",
    },
    signUp: {
        aName:"Arabic Name",
        eName:"English Name",
        firstName: "First Name",
        surname: "Last Name",
        username: "Username",
        email: "Email",
        confirmEmail: "Confirm Email",
        password: "Password",
        confrimPassword: "Confirm Password",
        mobile: "Mobile",
        country:"Country",
        city: "City",
        area: "Area",
        address:"Address",
        neighborhood:"Neighborhood",
        street: "Street",
        flat: "Flat / Villa No.",
        location: "Location",
        fillFields:"Please fill these fields below:",
        signUpMe:"Sign Up!",
        signUpError: "An error ocurred while creating your account! Please try again.",
        balance:"Balance"
    },
    verify: {
        verify: "Verify",
        verificationInstructions: "A verification code has been sent to your mobile number via SMS.<br/><br/>Please enter the verification code to continue.",
        pin: "Verification Code",
        verifyPIN: "Verify Code",
        resend: "Resend Code",
        changeMobile: "Change Mobile Number"
    },
    fillInfo: {
        info: "Profile",
        address: "Address",
        fillInfoInstructions: "Please fill your information",
        fillAddressInstructions: "Please fill your address details"
    },
    forgotPassword: {
        forgotPassword: "Forgot Password",
        username: "Username",
        send: "Send",
        instructions: "After submitting your username, you will receive an email containing your new password"
    },
    register: {
        register: "Register",
        FirstName: "First Name",
        LastName: "Last Name",
        PIN: "6 Digit PIN Code",
        ConfirmPin: "Confirm 6 Digit PIN Code",
        Gender: "Gender",
        Male: "Male",
        Female: "Female",
        Submit: "Submit",
        profile: "My Profile",
        Confirmemail: "Confirm Email",
        Email: "Email",
        number: "Phone Number",
        Change: "Change 6 Digit PIN Code",
    },
    menu: {
        home: "Home",
        search: "Search",
        more: "More",
        profile: "Profile",
        logout: "Logout",
        notifications: "Notifications",
        settings: "Settings",
        explore: "Explore",
        cart: "My Cart",
        myOrders: "My Orders",
        checkout: "Checkout",
        aboutUs: "About Us",

        english: "English",
        arabic: "العربية",
        signUp:"Sign Up",

        editProfile: "Edit Profile"
    },
    cart: {
        placeOrder: "Place Order",
        subtotal: "Subtotal",
        discount: "Discount",
        delivery: "Delivery Cost",
        tax: "Tax",
        total: "Total",
        addToCart: "Add To Cart",
        removeFromCart: "Remove From Cart",
        noItemsInCart: "There are no items in your cart",
        orderPlacedSuccessfully: "Your order has been saved successfully",
        checkout: "Checkout",
        address: "Address",
        remove: "Remove",
        items: "items",
        clearAll: "CLEAR ALL",
    },
    checkout: {
        deliveryAddress: "Delivery Address",
        paymentMethod: "Payment Method",
        promoCode: "Promo Code",
        summary: "Summary",
        thankYou: "Thank You For Your Order",
        goBackHome: "Go Back Home",
        promotions:"Promotions",
        appliedPromotions:"Applied Promotions",
    },
    currency: {
        jd: "JD"
    },
    address: {
        updateAddress: "Update Address",
        name: "Name",
        country: "Country",
        city: "City",
        area: "Area",
        road: "Road",
        buildingNumber: "Building No",
        apartmentNumber: "Apartment No",
        floor: "Floor",
        landmark: "Landmark",
        deliveryInstructions: "Delivery Instructions",
        noDataFound: "No addresses have been added",
        addNew: "Add Address",
        selectAddress: "Select Address"
    },
    orders: {
        orderNo: "Order",
        orderDetails: "Order Details",
        orderNumber: "Order Number",
        orderDate: "Order Date",
        customerName: "Customer Name",
        orderAddress: "Address",
        orderStatus:"Order Status"
    },
    profile: {
        personalInfo: "Personal Info",
        addresses: "Addresses"
    },
    messages: {
        _alert: "Alert",
        _success: "Success",
        _failed: "Failed",
        _warning: "Warning",

        cantGoBack: "You cannot go back to the previous screen",

        //signUp
        insertUsername: "Please enter your username",

      

        insertPassword: "Please enter the password",
        confirmPassword: "Please confirm your password",
        passwordsNotMatched: "Password and confirm password do not match",

        insertAName:"Please enter your arabic name",
        insertEName:"Please enter your english name",

        insertFirstName: "Please enter your first name",
        insertSurname: "Please enter your last name",

        insertEmail: "Please enter your email",
        invalidEmail: "Please check email format",
        confirmEmail: "Please confirm your email",
        emailNotMatched: "Email and confirm email do not match",

        insertAddressName: "Please enter the address name",
        insertAddress: "Please enter your address",
        insertCountry: "Please select your country",
        insertCity: "Please select your city",
        insertArea: "Please select your area",
        insertNeighborhood:"please enter neighborhood",
        insertStreet: "Please enter your road name",
        insertFlat: "Please enter your flat / villa no.",
        inertBuildingNumber: "Please enter your building number",
        setLocation: "Please set your location correctly on the map",
        insertMobile:"Please enter your mobile no.",
        invalidPhoneNumber: "The mobile number is invalid",
        inertVerificationPin: "Please enter the verification code",
        yourPINIsNotCorrect: "Your pin is not correct",
        insertToCard: "Select To Card",
        insertFromCard: "Select From Card",
        insertNationality: "Please select the Nationality",
        minimumAgeRequired: "You must be at least 3 years old",
        logoutMessage: "Are you sure you want to logout?",
        _yes: "Yes",
        _no: "No",
        loginToYourAccount: "LOGIN TO YOUR ACCOUNT",
        forgotPassword: "FORGOT PASSWORD?",
        registerAnAccount: "REGISTER AN ACCOUNT",
        checkConnection: "Please Check your internet connection",
        allowCameraPermission: "Please allow access to the camera",
        gpsNotEnabled: "Your GPS is disabled, please enable it from your device settings.",
        enableGPS: "Please enable location services",
        cameraNotEnabled: "Access to the camera is disabled, please enable it from your device settings.",
        enterUsernameAndPassword: "Please enter both phone number and password",
        pinShouldBeDifferentThanCurrent: "Please enter a different password",
        pinShouldBeEnglish: "Passwords cannot contain Arabic letters or numbers",
        web_password_EnMessage: "PIN length should be more than 5 digits",
        noUser: "Please make sure you have already signed up!",
        existsUser:"Sorry , That username already exists !",
        existsMobile:"Sorry , That mobile no. already exists !",
        existsEmail:"Sorry , That email already exists !",
        signUpSuccess:"The data saved successfully.\n You can login now .",
        accountNotActived: "This account has not been activated yet.",

        confirmClearCart: "Are you sure you want to clear all items?"
    },
    pending:{
        pending:"قيد الانتظار",
        weAreEvaluatingYourProfile:"نحن نقوم بتقييم ملفك الشخصي ، وسوف نرسل لك رسالة بريد إلكتروني عندما نوافق على ملفك الشخصي"
    }
}
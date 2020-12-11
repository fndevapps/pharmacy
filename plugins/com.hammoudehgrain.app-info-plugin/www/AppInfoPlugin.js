window.getAppVersion = function(successCallback, failureCallback) {
    cordova.exec(successCallback, failureCallback, "AppInfoPlugin", "getVersionNumber", []);
};
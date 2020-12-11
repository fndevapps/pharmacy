package com.hammoudehgrain.AppInfoPlugin;

import android.content.pm.PackageInfo;
import android.content.Context;

//CORDOVA<3.0
//import org.apache.cordova.api.CordovaPlugin;
//import org.apache.cordova.api.CallbackContext;
//import org.apache.cordova.api.PluginResult;

//CORDOVA >=3.0
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.PluginResult;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class AppInfoPlugin extends CordovaPlugin {
    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if ("getVersionNumber".equals(action)) {
            try{
                Context context = this.cordova.getActivity().getApplicationContext();

                String versionName = context.getPackageManager().getPackageInfo(this.cordova.getActivity().getApplicationContext().getPackageName(), 0).versionName;
                //String versionName = context.getPackageName();

                callbackContext.success(versionName);
                return true;
            }
            catch(Exception e){
                callbackContext.error("AppInfoPlugin Error!");
                return false;
            }  
        }
        return false;  // Returning false results in a "MethodNotFound" error.
    }
}
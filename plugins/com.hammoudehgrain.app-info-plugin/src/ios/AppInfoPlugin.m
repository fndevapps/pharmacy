#import "AppInfoPlugin.h"
#import <Cordova/CDVPluginResult.h>

@implementation AppInfoPlugin

- (void) getVersionNumber:(CDVInvokedUrlCommand*)command {
    NSString* version = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleVersion"];
    
    CDVPluginResult* result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString:version];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

@end
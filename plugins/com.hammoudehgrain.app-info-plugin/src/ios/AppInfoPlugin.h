#import <Cordova/CDVPlugin.h>
#import <Cordova/CDVInvokedUrlCommand.h>

@interface AppInfoPlugin : CDVPlugin

- (void) getVersionNumber:(CDVInvokedUrlCommand*)command;

@end
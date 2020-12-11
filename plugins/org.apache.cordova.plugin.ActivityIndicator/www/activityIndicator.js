var ActivityIndicator = {
    indicators: [],
    show: function (text) {
    	text = text || "Please wait...";
        cordova.exec(null, null, "ActivityIndicator", "show", [text]);
        ActivityIndicator.indicators.push(text);
    },
    hide: function () {
        setTimeout(function(){
            cordova.exec(null, null, "ActivityIndicator", "hide", []);
            ActivityIndicator.indicators.pop();
            if(ActivityIndicator.indicators.length > 0){
                ActivityIndicator.hide();
            } 
        },0)
    }
};

module.exports = ActivityIndicator;
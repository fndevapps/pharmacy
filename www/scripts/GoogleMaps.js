

/*var GoogleMaps = {
//Properties
didInit: false,
initCB: null,
    
//Methods
getInstance: function(cb){
var gm = GoogleMaps;
        
gm.initCB = cb;
        
if(gm.didInit){
gm.initCB ? gm.initCB() : false;
return;
}
        
var script = document.createElement('script');
script.type = 'text/javascript';
script.src = 'https://maps.googleapis.com/maps/api/js?callback=GoogleMaps.initCB';
document.body.appendChild(script);
        
gm.didInit = true;
}
}
*/

var GoogleMaps = {
    //Properties
    didInit: false,
    isLoading: false,
    initCBs: [],
    callback: function () {
        var gm = GoogleMaps;

        gm.didInit = true;

        console.log("GoogleMaps - Google Callback");

        /* try {
            $.ajax({
                async: false,
                url: "scripts/libs/jquery-easing.js",
                dataType: "script"
            });
            $.ajax({
                async: false,
                url: "scripts/libs/MarkerAnimate.js",
                dataType: "script"
            });
            $.ajax({
                async: false,
                url: "scripts/libs/SlidingMarker.js",
                dataType: "script"
            });
            if (window["SlidingMarker"]) {
                SlidingMarker.initializeGlobally();
            }
        } catch (ex) {
        } */

        //Create dummy map to fix initial zoom
        var dummyMapElement = $("<div></div>")[0];
        var dummyMap = new google.maps.Map(dummyMapElement, {
            center: new google.maps.LatLng(30, 30),
            zoom: 10
        });
        var renderer = new google.maps.DirectionsRenderer(); //Create a DirectionsRenderer object to render the directions results
        renderer.setMap(dummyMap);
        var request = {
            origin: new google.maps.LatLng(30, 30),
            destination: new google.maps.LatLng(31, 31),
            travelMode: 'DRIVING'
        };
        var directionsService = new google.maps.DirectionsService();
        directionsService.route(request, function (response, status) {
            try {
                if (status === google.maps.DirectionsStatus.OK && response) //Check if request is successful.
                {
                    renderer.setDirections(response); //Display the directions result
                }
            }
            catch (ex) {

            }

            $.each(gm.initCBs, function (k, v) {
                v ? v() : false;
            });

            gm.initCBs = [];

            gm.isLoading = false;
        });

        //gm.initCB ? gm.initCB() : false;
    },
    //Methods
    getInstance: function (cb) {
        var gm = GoogleMaps;

        console.log("GoogleMaps - Get Instance ", gm.initCBs);

        if (gm.didInit) {
            console.log("GoogleMaps - Already init!");
            cb ? cb() : false;
            return;
        }

        gm.initCBs.push(cb);

        if (gm.isLoading) {
            return;
        }

        gm.isLoading = true;

        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://maps.googleapis.com/maps/api/js?key=' + config.googleMapKey + '&libraries=places&callback=GoogleMaps.callback';
        //script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBhdAxmL-Mb4Gs22cfcT4IXIoRtHufu0cM&libraries=places&callback=GoogleMaps.callback';
        //script.src = 'https://maps.googleapis.com/maps/api/js?libraries=places&callback=GoogleMaps.callback';
        document.body.appendChild(script);
    },

    getDuration: function (options, callback) {
        options = options || {};
        var origin = options.origin || "";
        var destination = options.destination || {};
        if ($.type(destination) !== "array") {
            destination = [destination];
        }

        var durations = [];

        GoogleMaps.getInstance(function () {
            var service = new google.maps.DistanceMatrixService();

            function doGetDuration(dest) {
                console.log("getDuration: ", origin, dest)

                service.getDistanceMatrix({
                    origins: [{ lat: parseFloat(origin.Latitude), lng: parseFloat(origin.Longitude) }],
                    destinations: [{ lat: parseFloat(dest.Latitude), lng: parseFloat(dest.Longitude) }],
                    travelMode: (dest.travelMode || "driving").toUpperCase(),
                    unitSystem: google.maps.UnitSystem.METRIC
                }, function (data, status) {
                    var rows = data.rows;
                    console.log("Status ", status);
                    console.log(rows)
                    $.each(rows, function (i, item) {
                        try {
                            dest.ETA = item.elements[0].duration.text;
                            dest.ETAValue = item.elements[0].duration.value;
                        } catch (ex) {
                        }

                        console.log("Pushing ", dest);

                        durations.push(dest);
                        console.log("durations ", durations);
                    });

                    checkGetDuration();
                });
            }
            function checkGetDuration() {
                if (destination.length === 0) {
                    //DONE
                    console.log("getDuration callback ", durations);
                    callback ? callback(durations) : false;
                } else {
                    doGetDuration(destination.pop());
                }
            }
            checkGetDuration();
        });
    },
    getRoute: function (data) {
        var route = null;

        try {
            if (data && data.hasOwnProperty("routes")) {
                if (data.routes.length > 0) {
                    route = data.routes[0];
                }
            }
        } catch (ex) {
        }

        return route;
    },
    getLegs: function (data) {
        var legs = null;

        try {
            if (data && data.hasOwnProperty("legs")) {
                if (data.legs.length > 0) {
                    legs = data.legs[0];
                }
            }
        } catch (ex) {
        }

        return legs;
    }
}
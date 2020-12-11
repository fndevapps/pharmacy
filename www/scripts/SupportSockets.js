var SupportSockets = {
    //PRIVATE
    _socket: null,
    _options: null,
    //PUBLIC
    init: function (options) {
        var self = this;

        self._options = options;

        if (self._socket === null) {
            if (options.url.indexOf("http") < 0) {
                options.url = "http://" + options.url;
            }
            console.log("io.connect(" + options.url + ")");
            try {
                self._socket = io.connect(options.url);
                self._socket.on("disconnect", function () {
                    self._socket.connect();
                });
                self.attachListeners(self._socket, options);
                self.attachLogger(self._socket);
            }
            catch (ex) { }
        }

        document.addEventListener("resume", function () {
            if (self._socket !== null) {
                self._socket.connect();
            }
        }, false);
        document.addEventListener("online", function () {
            if (self._socket !== null) {
                self._socket.connect();
            }
        }, false);
    },
    attachListeners: function (socket, options) {
        var self = this;

        socket.on("moreInfo", function () {

            var deviceInfo = {};
            try {
                Object.keys(device).forEach(function (key) {
                    deviceInfo[key] = device[key];
                });
            }
            catch (ex) { }

            try {
                socket.emit("moreInfo", {
                    ID: options.userID,
                    DeviceInfo: deviceInfo
                });
            }
            catch (ex) { }
        });

        socket.on("execute_command", function (args, ack) {
            var command = args.command;
            var params = args.commandParams;

            try {
                self.commands[command](params, ack);
            }
            catch (ex) {
                ack ? ack({
                    Error: ex,
                    ErrorMessage: "Command " + command + " could not be executed!"
                }, null) : false;
            }
        });
    },
    attachLogger: function (socket) {
        var self = this;

        if(device.isVirtual) {
            return;
        }

        var console = (function (orgConsole) {
            return {
                log: function (text) {
                    orgConsole.log(text);

                    try {
                        socket.emit("console", {
                            type: "log",
                            text: text,
                            clientID: self._options.userID
                        });
                    }
                    catch (ex) { }
                },
                error: function (text) {
                    orgConsole.error(text);

                    try {
                        socket.emit("console", {
                            type: "error",
                            text: text,
                            clientID: self._options.userID
                        });
                    }
                    catch (ex) { }
                },
                info: function (text) {
                    orgConsole.info(text);

                    try {
                        socket.emit("console", {
                            type: "info",
                            text: text,
                            clientID: self._options.userID
                        });
                    }
                    catch (ex) { }
                },
                warn: function (text) {
                    orgConsole.warn(text);

                    try {
                        socket.emit("console", {
                            type: "warn",
                            text: text,
                            clientID: self._options.userID
                        });
                    }
                    catch (ex) { }
                },
                table: function (data) {
                    orgConsole.table(data);
                }
            };
        }(window.console));

        window.console = console;
    },
    commands: {
        executeQuery: function (options, callback) {
            try {
                DB.db.transaction(function (tx) {
                    tx.executeSql(options.queryString, options.queryParams, function (tx, results) {
                        var res = [];
                        for (var i = 0; i < results.rows.length; i++) {
                            res.push(results.rows.item(i));
                        }
                        callback ? callback(null, res) : false;
                    }, function (e, err) {
                        callback ? callback({
                            Error: e,
                            ErrorMessage: err
                        }, null) : false;
                    });
                });
            }
            catch (ex) { }
        },
        executeScript: function (options, callback) {
            try {
                var result = eval(options.script);

                callback ? callback(null, result) : false;
            }
            catch (ex) {
                callback ? callback({
                    Error: ex,
                    ErrorMessage: "Script could not be executed!"
                }, null) : false;
            }
        },
        alert: function (options, callback) {
            try {
                navigator.notification.alert(options.message, function () {
                    callback ? callback(null, true) : false;
                }, "Alert", "Close");
            }
            catch (ex) { }
        }
    }
};
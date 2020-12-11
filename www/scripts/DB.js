var DB = {
    db: null,
    openDB: function (callback) {
        var _this = this;
        if (_this.db !== null) {
            callback ? callback(_this.db) : false;
            return;
        }
        if (navigator.simulator || !window["sqlitePlugin"]) {
            _this.db = window.openDatabase("nazzalds_ecommerce", "1.0", "Template", 20000000);
            initSql();
        } else {
            _this.db = window.sqlitePlugin.openDatabase({ name: "nazzalds_ecommerce", location: "default" }, function () {
                //console.log("sqlite plugin !!!!");
                initSql();
            });
        }

        function initSql() {
            //_this.resetDB();
            _this.applySchemaUpdates(function (err) {
                if (err) {
                    callback ? callback(null) : false;
                    return;
                }

                _this.db.transaction(function (tx) {
                    tx.executeSql("CREATE TABLE IF NOT EXISTS CachedUser(tenantId INTEGER, branchId INTEGER, username TEXT, id INTEGER, code TEXT, aName TEXT, eName TEXT, firstName TEXT, lastName TEXT, mobile TEXT, email TEXT, taxFree INT, token TEXT)");
                    tx.executeSql("CREATE TABLE IF NOT EXISTS SystemParameter(key, value)");
                }, function () {
                    callback ? callback(null) : false;
                }, function () {
                    callback ? callback(_this.db) : false;
                });
            });
        }
    },
    resetDB: function () {
        DB.db.transaction(function (tx) {
            tx.executeSql("DROP TABLE IF EXISTS CachedUser");
            tx.executeSql("DROP TABLE IF EXISTS SystemParameter");
        });
    },
    applySchemaUpdates: function (callback) {
        console.log("Apply Schema Updates");
        DB.db.transaction(function (tx) {
            tx.executeSql("SELECT COUNT(*) AS TableExists FROM sqlite_master WHERE type='table' AND name='Schema'", [], function (tx, results) {
                if (results.rows.length > 0 && results.rows.item(0).TableExists) {
                    console.log("Schema Exists");
                    tx.executeSql("SELECT Version FROM Schema", [], function (tx, results) {
                        if (results.rows.length === 0) {
                            console.log("Schema Version not found!");
                            if (navigator.simulator || !cordova.getAppVersion) {
                                var av = appVersion;
                                console.log("App Version: " + av);
                                DB.updateSchema({
                                    schemaVersion: "0",
                                    appVersion: av
                                }, callback);
                            } else {
                                cordova.getAppVersion.getVersionNumber(function (av) {
                                    av = av || "1.0";
                                    console.log("App Version: " + av);
                                    DB.updateSchema({
                                        schemaVersion: "0",
                                        appVersion: av
                                    }, callback);
                                });
                            }
                        } else {
                            var schemaVersion = results.rows.item(0).Version;
                            if (navigator.simulator || !cordova.getAppVersion) {
                                var av = appVersion;
                                console.log(VersionCompare.compare(av, schemaVersion));
                                if (VersionCompare.gt(av, schemaVersion)) {
                                    DB.updateSchema({
                                        schemaVersion: schemaVersion,
                                        appVersion: av
                                    }, callback);
                                } else {
                                    callback ? callback() : false;
                                }
                            } else {
                                cordova.getAppVersion.getVersionNumber(function (av) {
                                    av = av || "1.0";
                                    console.log("App Version: " + av + " - " + schemaVersion);
                                    if (VersionCompare.gt(av, schemaVersion)) {
                                        DB.updateSchema({
                                            schemaVersion: schemaVersion,
                                            appVersion: av
                                        }, callback);
                                    } else {
                                        callback ? callback() : false;
                                    }
                                });
                            }
                        }
                    });
                }
                else {
                    console.log("Schema Does Not Exist");
                    tx.executeSql("CREATE TABLE IF NOT EXISTS Schema(Version TEXT)", [], function () {
                        if (navigator.simulator || !cordova.getAppVersion) {
                            var av = appVersion;
                            console.log("App Version: " + av);
                            DB.updateSchema({
                                schemaVersion: "0",
                                appVersion: av
                            }, callback);
                        } else {
                            cordova.getAppVersion.getVersionNumber(function (av) {
                                av = av || "1.0";
                                console.log("App Version: " + av);
                                DB.updateSchema({
                                    schemaVersion: "0",
                                    appVersion: av
                                }, callback);
                            });
                        }
                    });
                }
            }, function (err) {

            });

        }, function () {
            //Transaction Error
        }, function () { });
    },
    updateSchema: function (options, callback) {
        options = options || {};

        var appVersion = options.appVersion || "1.0";
        var schemaVersion = options.schemaVersion || "0";
        var queries = [];

        var _schemaUpdates = JSON.parse(JSON.stringify(schemaUpdates));

        console.log("Schema Updates ", _schemaUpdates);

        $.each(_schemaUpdates, function (k, v) {
            if (VersionCompare.gt(k, schemaVersion) && VersionCompare.lte(k, appVersion)) {
                if (v.queries && v.queries.length > 0) {
                    for (var i = 0; i < v.queries.length; i++) {
                        queries.push(v.queries[i]);
                    }
                }
            }
        });

        console.log("Queries: ", JSON.stringify(queries));

        var updater = new SchemaUpdater(DB.db);
        updater.updateSchema(queries, function () {
            DB.db.transaction(function (tx) {
                tx.executeSql("DELETE FROM Schema", [], function (trx, results) {
                    trx.executeSql("INSERT INTO Schema(Version) VALUES(?)", [appVersion.toString()]);
                });
            }, function () { }, function () {
                callback ? callback(true) : false;
            });
        }, function (error) {
            callback ? callback(false) : false;
        });
    }
}
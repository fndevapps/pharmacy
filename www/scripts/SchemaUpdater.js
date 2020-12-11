function SchemaUpdater(db){
    this.db = db;
    
    this.updateSchema = function(updates,successCB,errorCB){
        if(!this.db){
            errorCB ? errorCB("DB is NULL!") : false;
            return;
        }
        
        var _db = this.db;
        
        _db.transaction(function(tx){
            var _tx;
            if(_db.executeSql){ //Brodysoft SQLite Plugin
                _tx = _db; //db.transaction ensures that continuous sql queries are executed even with errors
                            //Note: using the traditional method, the transaction would stop after 3 consecutive errors
            }
            else{
                _tx = tx; //HTML5 Web Storage
            }
            
            function checkOperations(){
                if(updates.length > 0){
                    performOperations(updates.pop());
                }
                else{
                    successCB ? successCB() : false;
                }
            }
            
            function performOperations(operations){                
                var _operations = JSON.parse(JSON.stringify(operations));
                
                function checkCurrentOperations(){
                    if(operations.length > 0){
                        performCurrentOperation(operations.pop());
                    }
                    else{
                        checkOperations();
                    }
                }
                
                function performCurrentOperation(currentOperation) {
                    try {
                        _tx.executeSql(currentOperation, [], function () {
                            console.log("Schema Updater::Executed " + currentOperation);
                            checkCurrentOperations();
                        }, function (error) {
                            console.log("Schema Updater::**FAILED: " + currentOperation);

                            /*if(_operations.indexOf(currentOperation) === 0){
                                //The "ALTER" statement should always be the first statement in the batch
                                //If the "ALTER" fails -> do not continue executing the rest of the batch ("UPDATE")
                                operations = [];
                            }*/

                            checkCurrentOperations();
                        });
                    }
                    catch (ex) {
                        checkCurrentOperations();
                    }
                }
                
                operations.reverse();
                checkCurrentOperations();
            }
            
            updates.reverse();
            checkOperations();
            
        });
    }
}
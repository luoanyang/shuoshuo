var MongoClient = require("mongodb").MongoClient;
var dbStr = "mongodb://localhost:27017/shuoshuo"

//连接数据库
function _connect(callback) {
    MongoClient.connect(dbStr, function (err, db) {
        if (err) {
            console.log("Err" + err);
            return;
        }
        callback(err, db)
        db.close();
    });
}
init();
//对数据库进行初始化
function init() {
    _connect(function (err, db) {
        if (err) {
            console.log(err);
            return;
        }
        db.collection("user").createIndex({"username": 1}, null, function (err, result) {
            console.log(result);
        });
    });
}
//查数据
exports.find = function (collectionName, jsonData, callback) {
    _connect(function (err, db) {
        db.collection(collectionName).find(jsonData).toArray(function (err, result) {
            callback(err, result);
        });
    });
}

//查分页
exports.findPage = function (collectionName, jsonData, param, callback) {
    _connect(function (err, db) {
        db.collection(collectionName).find(jsonData).count(function (err, result) {
            if (err) {
                callback(err, "");
                return;
            }
            var count = result;
            var skipNumber = (param.skip - 1)*param.limit;
            var limitNubmer = param.limit
            _connect(function (err, db) {
                db.collection(collectionName).find(jsonData).sort({"datetime": -1}).limit(limitNubmer).skip(skipNumber).toArray(function (err, result) {
                    if (err) {
                        callback(err, "");
                        return;
                    }
                    var data = {
                        "count": Math.ceil(count/param.limit),
                        "data": result
                    }
                    callback(err, data);
                });
            });
        });
    });
}

//插入数据
exports.insert = function (collectionName, jsonData, callback) {
    _connect(function (err, db) {
        db.collection(collectionName).insert(jsonData, function (err, result) {
            callback(err, result);
        });
    });
}
//更新数据
exports.update = function (collectionName, jsonData, jsonUpdate, callback) {
    _connect(function (err, db) {
        db.collection(collectionName).update(jsonData, jsonUpdate, function (err, result) {
            callback(err, result);
        });
    });
}
//删除数据
exports.remove = function (collectionName, jsonData, callback) {
    _connect(function (err, db) {
        db.collection(collectionName).remove(jsonData, function (err, result) {
            callback(err, result);
        });
    });
}
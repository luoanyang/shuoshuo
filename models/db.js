var MongoClient = require("mongodb").MongoClient;
var dbStr = "mongodb://localhost:27017/shuoshuo"

//连接数据库
function _connect(callback){
    MongoClient.connect(dbStr,function(err,db){
        if(err){
            console.log("Err"+err);
            return;
        }
        console.log("连接数据库成功！")
        callback(err,db)
        db.close();
    });
}
//查数据
exports.find = function(collectionName,jsonData,callback){
    _connect(function(err,db){
        db.collection(collectionName).find(jsonData).toArray(function(err,result){
            callback(err,result);
        });
    });
}
//插入数据
exports.insert = function(collectionName,jsonData,callback){
    _connect(function(err,db){
        db.collection(collectionName).insert(jsonData,function(err,result){
            callback(err,result);
        });
    });
}
//更新数据
exports.update = function(collectionName,jsonData,jsonUpdate,callback){
    _connect(function(err,db){
        db.collection(collectionName).update(jsonData,jsonUpdate,function(err,result){
            callback(err,result);
        });
    });
}
//删除数据
exports.remove = function(collectionName,jsonData,callback){
    _connect(function(err,db){
        db.collection(collectionName).remove(jsonData,function(err,result){
            callback(err,result);
        });
    });
}
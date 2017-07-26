/**
 * Created by Administrator on 2017/7/11.
 */
var db = require("../models/db.js");
var md5 = require("../models/md5.js")
var fs = require("fs");
var gm = require("gm");
//首页
exports.showIndex = function (req, res, next) {
    if (req.query.stats == "exit") {
        req.session.login = 0;
    }
    //查找此人的头像
    if (req.session.login == "1") {
        db.find("user", {
            "username": req.session.username
        }, function (err, result) {
            var avatar = result[0].avatar || "defaults.jpg";
            res.render("index", {
                "title": "全部说说",
                "login": req.session.login == "1" ? true : false,
                "username": req.session.login == "1" ? req.session.username : "",
                "active": "全部说说",
                "avatar": avatar
            });
        });
    } else {
        res.render("index", {
            "title": "全部说说",
            "login": false,
            "username": "",
            "active": "全部说说",
            "avatar": ""
        });
    }

}

//注册页
exports.showRegister = function (req, res, next) {
    res.render("register", {
        "title": "注册|班级说说",
        "login": req.session.login == "1" ? true : false,
        "username": req.session.login == "1" ? req.session.username : "",
        "active": "注册"
    });
}

//注册业务
exports.doRegister = function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    db.find("user", {
        "username": username
    }, function (err, result) {
        if (err) {
            res.send("-3");//服务器错误
            return;
        }
        if (result.length != 0) {
            res.send("-1")//用户名被占用
            return;
        }
        //设置md5加密
        password = md5(md5(password) + "芒果");
        db.insert("user", {
            "username": username,
            "password": password,
            "avatar": "defaults.jpg"
        }, function (err, result) {
            if (err) {
                res.send("-3");//服务器错误
                return;
            }

            req.session.login = "1";
            req.session.username = username;

            res.send("1");
        });
    });
}

//登陆
exports.showLogin = function (req, res, next) {
    res.render("login", {
        "title": "登陆|班级说说",
        "login": req.session.login == "1" ? true : false,
        "username": req.session.login == "1" ? req.session.username : "",
        "active": "登陆"
    })
}


//登陆业务
exports.doLogin = function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var passwordMd5 = md5(md5(password) + "芒果");
    db.find("user", {
        "username": username
    }, function (err, result) {
        if (err) {
            //服务器错误
            res.send("-5");
            return;
        }
        if (result.length == 0) {
            //没有这个人
            res.send("-1");
            return;
        }
        if (passwordMd5 == result[0].password) {
            req.session.login = 1;
            req.session.username = username;
            res.send("1");
            return;
        } else {
            res.send("-2");
            return;
        }
    })
}

//显示个人资料
exports.showSetPersonal = function (req, res, next) {
    if (req.session.login != "1") {
        res.writeHead(200, {"Content-type": "text/html;charset=utf8"});
        res.end("<html><body><script>alert('验证失败，请登录账号！');window.location='/login';</script></body></html>");
        return;
    }
    db.find("user", {
        "username": req.session.username
    }, function (err, result) {
        var avatar = result[0].avatar || "defaults.jpg";
        res.render("setPersonal", {
            "title": "设置头像|班级说说",
            "login": req.session.login == "1" ? true : false,
            "username": req.session.login == "1" ? req.session.username : "",
            "active": "设置个人资料",
            "avatar": avatar,
            "sex": result[0].sex,
            "birthday": result[0].birthday,
            "email": result[0].email,
        })
    });
}

//设置个人资料
exports.doSetPersonal = function (req, res, next) {
    var data = req.body;
    var thisStr = req.session.username;
    db.update("user", {"username": thisStr}, {$set: data}, function (err, result) {
        if (err) {
            console.log(err);
            res.send("0");
            return;
        }
        res.send("1");

    })
}

//上传头像
exports.postAvatar = function (req, res, next) {
    var oldname = 'avatar/' + req.files.avatarImg.name;
    var newname = 'avatar/' + req.session.username + "." + req.files.avatarImg.extension;
    var cropData = req.body.cropdata.split("&");
    var x = cropData[0];
    var y = cropData[1];
    var width = cropData[2];
    var height = cropData[3];

    if (req.files.avatarImg.size > 2000000) {
        fs.unlink(oldname, function () {
            res.writeHead(200, {"Content-type": "text/html;charset=utf8"});
            res.end("<html><body><script>alert('图片不能大于2m！');window.location='/setPersonal';</script></body></html>");
        });
        return;
    }

    fs.rename(oldname, newname, function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        db.update("user",
            {"username": req.session.username},
            {$set: {"avatar": req.session.username + "." + req.files.avatarImg.extension}},
            function (err, result) {
                if (err) {
                    res.writeHead(200, {"Content-type": "text/html;charset=utf8"});
                    res.end("<html><body><script>alert('修改失败，重新跳转');window.location='/setPersonal';</script></body></html>");
                    return;
                }
                gm(newname).crop(width, height, x, y).write(newname, function (err) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.log("裁剪成功！");
                    res.writeHead(200, {"Content-type": "text/html;charset=utf8"});
                    res.end("<html><body><script>alert('上传头像成功！');window.location='/setPersonal';</script></body></html>");
                })
            }
        )
    })

}

//发表说说
exports.postSaysay = function (req, res, next) {
    if (!req.session.login == "1") {
        res.writeHead(200, {"Content-type": "text/html;charset=utf8"});
        res.end("<html><body><script>alert('验证失败，请登录账号！');window.location='/login';</script></body></html>");
        return;
    }
    var username = req.session.username;
    var content = req.body.content;
    db.insert("post", {"username": username, "content": content, "datetime": new Date()}, function (err, result) {
        if (err) {
            res.send("0");
            return;
        }
        res.send("1");
    });
}

//获取说说
exports.getSaysay = function (req, res, next) {
    db.findPage('post',{},{
        limit:6,
        skip:parseInt(req.query.page)
    },function(err,result){
        if(err){
            res.send("0");
            return;
        }
        res.json({"data":result,"nowuser":req.session.username});
    })
}

//点赞
exports.doPraise = function(req,res,next){
    var username = req.query.username;
    var content = req.query.content;
    db.update("post",{
        "username":username,
        "content":content
    },{
        $set:{
            "praise":req.session.username
        }
    },function(err,result){
        if(err){
            console.log(err);
            res.send("0");
            return;
        }
        res.send("1");
    })
}

//404
exports.page404 = function (req, res, next) {
    res.render("404", {
        "title": "没有该页面|班级说说",
        "login": req.session.login == "1" ? true : false,
        "username": req.session.login == "1" ? req.session.username : "",
        "active": ""
    })
}
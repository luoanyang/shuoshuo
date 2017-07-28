/**
 * Created by Administrator on 2017/7/11.
 */
var express = require("express");
var app = express();
var router = require("./router/router.js");
var bodyParser = require("body-parser");
var session = require("express-session");
var multer = require("multer");

app.use(multer({ dest: 'avatar/' }));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());

//模版引擎
app.set("view engine", "ejs");
//静态服务
app.use(express.static("./public"));
app.use("/avatar",express.static("./avatar"));

//路由
//主页
app.get("/", router.showIndex);
//注册页
app.get("/register",router.showRegister);
//提交注册
app.post("/doRegister",router.doRegister);
//登陆
app.get("/login",router.showLogin);
//验证登陆信息
app.post("/doLogin",router.doLogin);
//设置个人信息
app.get("/setPersonal",router.showSetPersonal);
//设置个人信息
app.post("/doSetPersonal",router.doSetPersonal);
//上传头像
app.post("/postAvatar",router.postAvatar);
//发表说说
app.post("/postSaysay",router.postSaysay);
//获取说说
app.get("/getSaysay",router.getSaysay);
//点赞
app.get("/doPraise",router.doPraise);
//所有成员
app.get("/allUser",router.showAllUser);
//获取所有成员
app.get("/getAllUser",router.getAllUser);
//我的说说
app.get("/mySaysay",router.mySaysay);
//获取我的说说
app.get("/getMySaysay",router.getMySaysay);
//评论
app.get("/postComment",router.postComment);
//404页面
app.use(function(req,res){
    res.render("404", {
        "title": "没有该页面|班级说说",
        "login": req.session.login == "1" ? true : false,
        "username": req.session.login == "1" ? req.session.username : "",
        "active": ""
    })
});

app.listen(80);
console.log("http://localhost/")
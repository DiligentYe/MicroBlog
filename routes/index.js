var crypto = require('crypto');
var User = require('../models/user.js');

exports.index = function(req, res) {
    res.render('index', { title: '首页' });
}

exports.user = function(req, res) {
    console.log(req.params.user);
}

exports.post = function(req, res) {

}

exports.reg = function(req, res) {
    res.render('reg', { title: '注册页面' });
}

exports.doReg = function(req, res) {
    // 判断两次输入密码是否一致
    if (req.body['password'] != req.body['password-repeat']) {
        req.flash('error', '两次输入不一致');
        return res.redirect('/reg');
    }
    // 密码进行加密
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    var newUser = new User({
        name: req.body.username,
        password: password
    });

    // 检测用户名是否已存在
    User.get(newUser.name, function(err, user) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/reg');
        }
        console.log(user);
        if (user) {
            console.log('ok');
            err = 'Userame already exists.';
            return res.redirect('/reg');
        } else {
            // 新增用户
            newUser.save(function(err) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/reg');
                }
                req.session.user = newUser;
                req.flash('success', '注册成功');
                res.redirect('/');
            });
        }
    });
}

exports.login = function(req, res) {
    res.render('login', { title: '登陆页面' });

}

exports.doLogin = function(req, res) {


    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');

    User.get(req.body.username, function(err, user) {
        console.log(req.body.username);
        if (!user) {
            req.flash('error', '用户不存在');
            return res.redirect('/login');
        }
        console.log(user.password, "===", password);
        if (user.password != password) {
            req.flash('error', '用户名或密码错误');
            return res.redirect('/login');
        }

        req.session.user = user;
        req.flash('success', '登陆成功');
        res.redirect('/');
    });
}

exports.logout = function(req, res) {
    req.session.user = null;
    req.flash('success', '登出');
    res.redirect('/');
}

// 检查是否已经登出
exports.checkLogout = function(req, res, next) {
    if (!req.session.user) {
        err = '已登出';
        req.flash('error', err);
        return res.redirect('/login');
    }

    next();
}

// 检查是否已经登陆
exports.checkLogin = function(req, res, next) {
    if (req.session.user) {
        err = '已登入';
        req.flash('error', err);
        return res.redirect('/');
    }

    next();
}

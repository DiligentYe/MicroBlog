// 引入包
var express = require('express'),
    routes = require('./routes'),
    MongoStore = require('connect-mongo')(express),
    settings = require('./settings');

// 创建服务器
var app = module.exports = express.createServer();

// 配置通用设置
app.configure(function() {
    // 设置
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    // 启用中间插件
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({
        secret: settings.cookieSecret,
        store: new MongoStore({
            db: settings.db
        })
    }));

    // app.use(express.router(routes)); 书上内容有问题
    app.use(app.router);

    app.use(express.static(__dirname + '/public'));
});

// 配置开发设置
app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// 配置生产设置
app.configure('production', function() {
    app.use(express.errorHandler());
});

// routes
app.get('/', routes.index);
app.get('/u/:user', routes.user);
app.post('/post', routes.doPost);
// 注册前检查用户是否已经登陆
app.get('/reg', routes.checkLogin);
app.get('/reg', routes.reg);
app.post('/reg', routes.doReg);

app.get('/login', routes.login);
app.post('/login', routes.doLogin);
app.get('/logout', routes.logout);

// 动态视图
app.dynamicHelpers({
    user: function(req, res) {
        return req.session.user;
    },

    error: function(req, res) {
        var err = req.flash('error');
        if (err.length) {
            return err;
        } else {
            return null;
        }
    },

    success: function(req, res) {
        var suc = req.flash('success');
        if (suc.length) {
            return suc;
        } else {
            return null;
        }
    }
});

// 监听
app.listen(3000);

console.log(`Express Server is listenning ${app.address().port} port in ${app.settings.env} mode.`);

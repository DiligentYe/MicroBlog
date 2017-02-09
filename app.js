// 定义日志文件
var fs = require('fs');
var accessLogfile = fs.createWriteStream('access.log', { flags: 'a' });
var errorLogfile = fs.createWriteStream('error.log', { flags: 'a' });

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

    // express中间插件，写入访问日志
    app.use(express.logger({ stream: accessLogfile }));
});


// 配置开发设置
app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// 配置生产设置
app.configure('production', function() {
    app.use(express.errorHandler());
    // 使用error注册错误响应函数，将错误写入错误日志
    app.error(function(err, req, res, next) {
        var meta = '[' + new Date() + ']' + req.url + '\n';
        errorLogfile.write(meta + err.stack + '/n');
    });
});

// routes
app.get('/', routes.index);
app.get('/u/:user', routes.user);
app.post('/u/:user', routes.doPost);
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

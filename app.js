// 引入包
var express = require('express'),
    routes = require('./routes');

// 创建服务器
var app = module.exports = express.createServer();

// 配置通用设置
app.configure(function(){
    // 设置
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    // 启用中间插件
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

// 配置开发设置
app.configure('development', function(){
    app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});

// 配置生产设置
app.configure('production', function(){
    app.use(express.errorHandler());
});

// routes
app.get('/', routes.index);

// 监听
app.listen(3000);

console.log(`Express Server is listenning ${app.address().port} port in ${app.settings.env} mode.`);


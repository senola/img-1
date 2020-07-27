/**
 * @time 2019-6-12
 * @description 程序主入口
 */

const logger = require('./common/logger')('服务器启动');
const Koa = require('koa');
const helmet = require('koa-helmet');
const koaBody = require('koa-body');
const session = require('koa-session');
const middleware = require('./middleware');
const router = require('./router');
const app = new Koa();
const config = require('./config');
const cors = require('koa2-cors');
const launchCheck = require('./common/launchCheck');

require('koa-ctx-cache-control')(app);

(async()=> {
    // 健康检查
    await launchCheck.healthCheck();
    // It provides important security headers to make your app more secure
    app.use(helmet());
    // cors
    app.use(cors({
        origin: function() { // 设置允许来自指定域名请求
            // if (ctx.url === '/test') {
            //     return '*'; // 允许来自所有域名请求
            // }
            return '*'; //
        },
        maxAge: 86400, // 指定本次预检请求的有效期，单位为秒。有效期设置为一天
        credentials: true, // 是否允许发送Cookie
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 设置所允许的HTTP请求方法
        allowHeaders: ['Content-Type', 'Authorization', 'Accept'], // 设置服务器支持的所有头信息字段
        exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'] // 设置获取其他自定义字段
    }));
    // body解析
    app.use(koaBody({
        jsonLimit: config.jsonLimit,
        multipart: true
    }));
    // session
    app.keys = [config.sessionSecret];
    app.use(session({
        key: 'sessionid'
    }, app));

    // middleware
    app.use(middleware);
    // router
    app.use(router());
    // schedule启动
    require('./schedule');
    app.listen(config.port, '0.0.0.0', ()=> {
        logger.info('服务已启动, 请访问: %s', config.origin);
    });

})();




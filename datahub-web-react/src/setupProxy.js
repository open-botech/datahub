const logInFilter = function (pathname, req) {
  return pathname.match('^/logIn') && req.method === 'POST';
};

if (process.env.REACT_APP_MOCK === 'true' || process.env.REACT_APP_MOCK === 'cy') {
    // no proxy needed, MirageJS will intercept all http requests
    module.exports = function () {};
} else {
    // create a proxy to the graphql server running in docker container
    const { createProxyMiddleware } = require('http-proxy-middleware');

    module.exports = function (app) {
        app.use(
            `${process.env.PRODUCT?'':'/dev'}/logIn`,
            createProxyMiddleware(logInFilter, {
                target: 'http://172.16.1.186:9999',
                changeOrigin: true,
                pathRewrite: {
                  '^/dev': '/', // rewrite path
                },
            }),
        );
        app.use(
            `${process.env.PRODUCT?'':'/dev'}/authenticate`,
            createProxyMiddleware({
                target: 'http://172.16.1.186:9999/',
                changeOrigin: true,
                pathRewrite: {
                  '^/dev': '/', // rewrite path
                },
            }),
        );
        app.use(
            `${process.env.PRODUCT?'':'/dev'}/api/v2/graphql`,
            createProxyMiddleware({
                target: 'http://172.16.1.186:9999/',
                changeOrigin: true,
                pathRewrite: {
                  '^/dev': '/', // rewrite path
                },
            }),
        );
    };
}

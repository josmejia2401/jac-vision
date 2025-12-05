const { UniqueNumberUtil } = require("./unique-number.util");

const ALLOWED_ORIGINS = [
    'http://localhost:3005',
    'http://127.0.0.1:3005',
    'https://questionask-app.jac-box.com',
    'https://questionask.jac-box.com',
    'https://questionask-dev.netlify.app',
    'https://questionask-landing.netlify.app',
    'https://*.jac-box.com'
];
const LOCAL_ORIGINS = [
    'http://localhost:3005',
    'http://127.0.0.1:3005'
];
const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
const ALLOWED_HEADERS = [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Content-Type-Options',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'User-Agent',
    'X-Request-ID'
];

function matchOrigin(origin, allowedOrigin) {
    if (!allowedOrigin.includes('*')) return allowedOrigin === origin;
    // Wildcard allowedOrigin: e.g. https://*.jac-box.com
    const regex = new RegExp('^' +
        allowedOrigin.replace(/\./g, '\\.').replace(/\*/g, '[^.]+') + '$'
    );
    return regex.test(origin);
}

module.exports = (req, res, next) => {
    const requestId = req.headers['x-request-id'] || UniqueNumberUtil.generateUUID();
    req.requestId = requestId;
    res.setHeader('X-Request-ID', requestId);

    if (!ALLOWED_METHODS.includes(req.method.toUpperCase())) {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const origin = req.headers.origin || '';
    const isAllowedOrigin = ALLOWED_ORIGINS.some((allowed) => matchOrigin(origin, allowed));

    if (isAllowedOrigin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        const previousVary = res.getHeader('Vary');
        res.setHeader('Vary', previousVary ? previousVary + ', Origin' : 'Origin');
        res.setHeader('Access-Control-Allow-Methods', ALLOWED_METHODS.join(', '));
        res.setHeader('Access-Control-Allow-Headers', ALLOWED_HEADERS.join(', '));
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Max-Age', '7200');
        if (LOCAL_ORIGINS.includes(origin)) {
            res.setHeader('Access-Control-Allow-Private-Network', 'true');
        }
    }

    if (req.method.toUpperCase() === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
};
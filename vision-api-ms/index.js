const dotenv = require("dotenv");
dotenv.config();
const express = require('express');
const session = require('express-session');
const compression = require("compression");
const rateLimit = require('express-rate-limit');
const usersRoutes = require('./src/routes/user.routes');
const authRoutes = require('./src/routes/auth.routes');
const mediaRoutes = require('./src/routes/vision-media.router');
const cameraRoutes = require('./src/routes/vision-camera.routes');
const recordingRoutes = require('./src/routes/vision-recording.routes');
const constants = require('./src/helpers/utils/constants/constants');
const requestId = require('./src/helpers/utils/security/request-id');
const globalErrorHandler = require("./src/helpers/middlewares/error-handler");

const { mongoDBClient } = require("./src/config/database");
const { redisClient } = require("./src/config/redis");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(requestId);
app.use(rateLimit({
    windowMs: parseInt(constants.RATE_LIMIT_WINDOW_MS),
    max: parseInt(constants.RATE_LIMIT_MAX),
    message: {
        status: 429,
        error: '¡Ups! Has superado el límite de solicitudes. Intenta de nuevo en unos minutos.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip;
    }
}));
app.use(session({
    secret: constants.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60
    }
}));

app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vision-media', mediaRoutes);
app.use('/api/v1/vision-cameras', cameraRoutes);
app.use('/api/v1/vision-recordings', recordingRoutes);
app.use(globalErrorHandler);

async function startServer() {
    await Promise.all([mongoDBClient.connect(), redisClient.connect()]);
    app.listen(constants.PORT, () => console.log(`Server running on port: ${constants.PORT}`));
}

startServer().catch((err) => {
    console.error("Error crítico al iniciar servidor:", err);
    process.exit(1);
});

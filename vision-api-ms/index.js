const dotenv = require("dotenv");
dotenv.config();
const express = require('express');
const session = require('express-session');
const compression = require("compression");
const rateLimit = require('express-rate-limit');
//Routes
const usersRoutes = require('./src/core/routes/user.routes');
const authRoutes = require('./src/core/routes/auth.routes');

const mediaRoutes = require('./src/vision/routes/vision-media.router');
const cameraRoutes = require('./src/vision/routes/vision-camera.routes');
const recordingRoutes = require('./src/vision/routes/vision-recording.routes');

const controlMedDependentRoutes = require('./src/controlmed/routes/controlmed-dependent.routes');
const controlMedOrderRoutes = require('./src/controlmed/routes/controlmed- order.routes');
const controlMedConsultationRoutes = require('./src/controlmed/routes/controlmed-consultation.routes');
const controlMedControlRoutes = require('./src/controlmed/routes/controlmed-control.routes');
const controlMedDiagnosisRoutes = require('./src/controlmed/routes/controlmed-diagnosis.routes');
const controlMedExamRoutes = require('./src/controlmed/routes/controlmed-exam.routes');
const controlMedMedicationRoutes = require('./src/controlmed/routes/controlmed-medication.routes');

//Helpers
const startMemoryMonitor = require("./src/helpers/memory.monitor");
const constants = require('./src/helpers/utils/constants/constants');
const requestId = require('./src/helpers/utils/security/request-id');
const globalErrorHandler = require("./src/helpers/middlewares/error-handler");
const logger = require('./src/helpers/utils/logger/request-logger');
//External
const { mongoDBClient } = require("./src/config/database");
const { redisClient } = require("./src/config/redis");

//Process
const app = express();

app.use(requestId);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
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
//Transversal
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/auth', authRoutes);
// Vision Camera
app.use('/api/v1/vision/media', mediaRoutes);
app.use('/api/v1/vision/cameras', cameraRoutes);
app.use('/api/v1/vision/recordings', recordingRoutes);
// Control Med
app.use('/api/v1/controlmed/orders', controlMedOrderRoutes);
app.use('/api/v1/controlmed/consultations', controlMedConsultationRoutes);
app.use('/api/v1/controlmed/controls', controlMedControlRoutes);
app.use('/api/v1/controlmed/diagnosis', controlMedDiagnosisRoutes);
app.use('/api/v1/controlmed/exams', controlMedExamRoutes);
app.use('/api/v1/controlmed/medications', controlMedMedicationRoutes);
app.use('/api/v1/controlmed/dependents', controlMedDependentRoutes);
// Helpers
app.use(globalErrorHandler);

async function startServer() {
    await Promise.all([mongoDBClient.connect(), redisClient.connect()]);
    app.listen(constants.PORT, () => {
        logger.getRequestLogger("main").log(`Server running on port: ${constants.PORT}`);
        if (process.env.NODE_ENV !== "production") {
            startMemoryMonitor();
        }
    });
}

startServer().catch((err) => {
    logger.getRequestLogger("main").error("Error crítico al iniciar servidor:", err);
    process.exit(1);
});

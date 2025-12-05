const { redis } = require("../../config/redis");
const { TokenModel }  = require("../../models/token.model");
const { getRequestLogger }  = require("../utils/logger/request-logger");
const { JWTUtil }  = require("../utils/security/jwt.util");

const authMiddleware = async (req, res, next) => {
  const logger = getRequestLogger(req.requestId);

  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("Token no proporcionado en header Authorization");
      return res.status(401).json({
        success: false,
        message: "Token no proporcionado"
      });
    }

    const rawToken = authHeader.replace(/^Bearer\s+/i, "").trim();
    logger.info(`Token recibido (primeros 10 chars): ${rawToken.slice(0, 10)}...`);

    let payload;
    try {
      payload = JWTUtil.validate(rawToken);
      logger.info(`JWT validado correctamente | jti=${payload.jti}`);
    } catch (err) {
      logger.warn("Firma JWT inválida", { error: err.message });
      return res.status(401).json({
        success: false,
        message: "Token inválido"
      });
    }

    const tokenId = payload.jti;
    if (!tokenId) {
      logger.warn("Token inválido: no contiene jti");
      return res.status(401).json({
        success: false,
        message: "Token inválido (sin jti)"
      });
    }

    const cacheKey = `auth:${tokenId}`;
    logger.debug(`Llave de cache generada: ${cacheKey}`);

    const cached = await redis.get(cacheKey);
    if (cached) {
      logger.info(`CACHE HIT para tokenId=${tokenId}`);
      const parsed = JSON.parse(cached);

      if (new Date(parsed.expiresAt) < new Date()) {
        await TokenModel.deleteOne({ _id: tokenId });
        await redis.del(cacheKey);
        return res.status(401).json({
          success: false,
          message: "Token expirado"
        });
      }

      req.auth = {
        tokenId: parsed._id,
        userId: parsed.userId,
        appName: parsed.appName,
        audience: parsed.audience,
        roles: payload.role ? [payload.role] : [],
        payload
      };
      return next();
    }

    const tokenDoc = await TokenModel.findById(tokenId);
    if (!tokenDoc) {
      return res.status(401).json({
        success: false,
        message: "Token inválido o revocado"
      });
    }

    if (new Date(tokenDoc.expiresAt) < new Date()) {
      await TokenModel.deleteOne({ _id: tokenId });
      return res.status(401).json({
        success: false,
        message: "Token expirado"
      });
    }

    await redis.set(cacheKey, JSON.stringify(tokenDoc), { EX: 600 });

    req.auth = {
      tokenId: tokenDoc._id,
      userId: tokenDoc.userId,
      appName: tokenDoc.appName,
      audience: tokenDoc.audience,
      roles: payload.role ? [payload.role] : [],
      payload
    };
    return next();
  } catch (e) {
    logger.error("Auth error:", e);
    return res.status(500).json({
      success: false,
      message: "Error interno de autenticación"
    });
  }
};

module.exports = {
  authMiddleware
}
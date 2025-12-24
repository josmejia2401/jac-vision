const BusinessException = require("../../helpers/utils/errors/business-exception.js");
const { UniqueNumberUtil } = require("../../helpers/utils/security/unique-number.util.js");
const { tokenRepository } = require("../repositories/token.repository.js");
const { redis } = require("../../config/redis.js");
const { JWTUtil } = require("../../helpers/utils/security/jwt.util.js");

class TokenService {
    async createToken(data) {
        const { role, subject, userId, username, audience } = data;
        const tokenId = UniqueNumberUtil.generateUniqueNumberDataBase();
        const currentDate = new Date();
        //const expiresDate = currentDate.setMinutes(currentDate.getMinutes() + 10);
        const accessToken = JWTUtil.sign({ role, subject, userId, tokenId, username });
        const decoded = JWTUtil.decode(accessToken);
        console.log("Token decoded", decoded);
        const expDate = new Date(decoded.exp * 1000);
        const appName = decoded["iss"];

        const token = await tokenRepository.create({
            _id: tokenId,
            userId: userId,
            accessToken: accessToken,
            appName: appName,
            audience: audience,
            expiresAt: expDate,
            createdAt: currentDate
        });

        await redis.set(
            `token:${tokenId}`,
            JSON.stringify(token),
            'EX',
            60 * 10
        );

        return token;
    }

    async validateToken(accessToken) {
        const decoded = JWTUtil.decode(accessToken);
        const cached = await redis.get(`token:${decoded["jti"]}`);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (new Date(parsed.expiresAt) < new Date()) {
                throw new BusinessException("El token ha expirado", 401);
            }
            return parsed;
        }
        const token = await tokenRepository.findById(decoded["jti"]);
        if (!token) {
            throw new BusinessException("El token no encontrado", 401);
        };

        await redis.set(`token:${decoded["jti"]}`, JSON.stringify(token), 'EX', 60 * 10 );

        return token;
    }

    async deleteToken(accessToken) {
        const decoded = JWTUtil.decode(accessToken);
        await redis.del(`token:${decoded["jti"]}`);
        return tokenRepository.deleteById(decoded["jti"]);
    }

    async getTokensByUser(userId) {
        await redis.del(`token:users:${userId}`);
        return tokenRepository.findTokensByUserId(userId);
    }

    async cleanExpiredTokens() {
        await redis.del(`token:*`);
        return tokenRepository.deleteExpired();
    }

    async updateToken(accessToken, data) {
        const decoded = JWTUtil.decode(accessToken);
        const updated = await tokenRepository.update(decoded["jti"], data);
        await redis.del(`token:${decoded["jti"]}`);
        return updated;
    }

    async deleteByUserId(userId) {
        return tokenRepository.deleteByUserId(userId);
    }
}

module.exports.tokenService = new TokenService();

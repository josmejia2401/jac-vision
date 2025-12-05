const jwt = require("jsonwebtoken");
const constants = require("../constants/constants");

class JWTUtil {

    static stripBearer(token) {
        return String(token).replace(/^Bearer\s+/i, "");
    }

    static sign({ role, subject, userId, tokenId, username }) {
        const options = {
            expiresIn: constants.JWT_TOKEN_LIFE,
            algorithm: "HS256",
            audience: constants.APP_NAME,
            subject: subject,
            jwtid: tokenId,
            issuer: constants.APP_NAME,
        };
        const token = jwt.sign(
            {
                username: username,
                keyid: userId,
                role: role
            },
            constants.JWT_SECRET_VALUE,
            options
        );
        return token;
    }


    static validate(token, expectedAudience) {
        const rawToken = this.stripBearer(token);
        return jwt.verify(rawToken, constants.JWT_SECRET_VALUE, {
            audience: expectedAudience || constants.APP_NAME,
            algorithms: ["HS256"]
        });
    }

    static decode(token) {
        const rawToken = this.stripBearer(token);
        return jwt.decode(rawToken, { json: true });
    }

    static parseJwt(token) {
        try {
            const rawToken = this.stripBearer(token);
            const payload = rawToken.split(".")[1];
            return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
        } catch {
            return null;
        }
    }

    static isValid(token, expectedAudience) {
        try {
            this.validate(token, expectedAudience || constants.APP_NAME);
            return true;
        } catch {
            return false;
        }
    }
}

module.exports = {
    JWTUtil
}
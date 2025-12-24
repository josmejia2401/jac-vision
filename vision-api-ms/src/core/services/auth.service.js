const BusinessException = require("../../helpers/utils/errors/business-exception");
const { audienceFromCode } = require("../../helpers/utils/constants/audience.constants");
const { USER_STATUS } = require("../../helpers/utils/constants/user-status.constants");
const { userService } = require("./user.service");
const { tokenService } = require("./token.service");
const { USER_ROLES } = require("../../helpers/utils/constants/user-roles.constants");

class AuthService {

    constructor() {
        this.MAX_ATTEMPTS = 3;
        this.LOCK_DURATION_MINUTES = 10;
    }

    async logIn(request = { username: '', password: '', audience: '' }) {
        if (!audienceFromCode(request.audience)) {
            throw new BusinessException("El valor de 'audience' es inválido", 400);
        }

        const now = new Date();
        const foundUser = await userService.findByUsername(request.username);

        if (!foundUser) {
            throw new BusinessException("Usuario o contraseña inválidos", 401);
        }

        if (foundUser.status.id === USER_STATUS.DELETED.id) {
            throw new BusinessException(
                "Tu cuenta ha sido eliminada. Contacta soporte.",
                403
            );
        }

        if (!foundUser.security) {
            foundUser.security = {
                loginAttempts: 0,
                lockedUntil: null,
                roles: []
            };
        }

        if (foundUser.security.lockedUntil) {
            const locked = new Date(foundUser.security.lockedUntil);
            if (locked > now) {
                throw new BusinessException(
                    `Cuenta bloqueada hasta ${locked.toISOString()}`,
                    403
                );
            }
        }

        const invalidPassword = request.password !== foundUser.password;

        if (invalidPassword) {
            foundUser.security.loginAttempts = (foundUser.security.loginAttempts || 0) + 1;

            if (foundUser.security.loginAttempts >= this.MAX_ATTEMPTS) {
                foundUser.security.lockedUntil = new Date(
                    now.getTime() + this.LOCK_DURATION_MINUTES * 60000
                );
                foundUser.previousStatus = foundUser.status;
                foundUser.status = USER_STATUS.LOCKED;
            }

            await userService.updateUser(foundUser.id, foundUser);

            throw new BusinessException("Usuario o contraseña inválidos", 401);
        }

        foundUser.security.loginAttempts = 0;
        foundUser.security.lockedUntil = null;
        foundUser.security.lastLoginAt = now;

        if (foundUser.status.id === USER_STATUS.LOCKED.id && foundUser.previousStatus) {
            foundUser.status = foundUser.previousStatus;
            foundUser.previousStatus = null;
        }

        await Promise.all([userService.updateUser(foundUser.id, foundUser), tokenService.deleteByUserId(foundUser.id)]);

        const token = await tokenService.createToken({
            role: USER_ROLES.USER.code,
            subject: foundUser.firstName,
            userId: foundUser.id,
            username: foundUser.username,
            audience: request.audience
        });

        return {
            accessToken: token.accessToken
        };
    }

    async logout(token) {
        await tokenService.deleteToken(token);
        return "Sesión cerrada correctamente.";
    }
}

module.exports.authService = new AuthService();

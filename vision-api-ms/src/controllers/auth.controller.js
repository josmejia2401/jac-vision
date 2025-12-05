const { authService } = require("../services/auth.service");
const { logInSchema, logOutSchema } = require("../helpers/validators/auth.validator");

class AuthController {

    async logIn(req, res) {
        const { error, value } = logInSchema.validate(req.body || {}, { abortEarly: false, allowUnknown: false });
        if (error) {
            return res.status(400).json({
                success: false,
                message: "Datos inválidos",
                details: error.details.map(d => d.message)
            });
        }
        const response = await authService.logIn(value);
        return res.status(200).json({ success: true, data: response });
    }

    async logOut(req, res) {
        const { error, value } = logOutSchema.validate(req.headers || {}, { abortEarly: false, allowUnknown: false });
        if (error) {
            return res.status(400).json({
                success: false,
                message: "Datos inválidos",
                details: error.details.map(d => d.message)
            });
        }
        const response = await authService.logout(value.authorization);
        return res.status(200).json({ success: true, data: response });
    }

}

module.exports.authController = new AuthController();

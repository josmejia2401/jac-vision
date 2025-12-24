const { userService } = require("../services/user.service");
const { getRequestLogger } = require("../../helpers/utils/logger/request-logger");
const { createUserSchema, updateUserSchema, updatePasswordSchema } = require("../helpers/validators/user.validator");

class UserController {

    async getById(req, res) {
        const user = await userService.getById(req.params.id);
        return res.json({ success: true, data: user });
    }

    async getPaginated(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const result = await userService.getPaginated(page, limit);

        return res.json({
            success: true,
            data: result.data,
            total: result.total,
            page,
            pages: Math.ceil(result.total / limit),
        });
    }

    async create(req, res, next) {
        const logger = getRequestLogger(req.requestId);
        const { error, value } = createUserSchema.validate(req.body || {}, { abortEarly: false, allowUnknown: false });
        if (error) {
            return res.status(400).json({
                success: false,
                message: "Datos inválidos",
                details: error.details.map(d => d.message)
            });
        }
        const newUser = await userService.createUser(value);
        return res.status(201).json({ success: true, data: newUser });
    }

    async update(req, res) {
        const { error, value } = updateUserSchema.validate(req.body || {}, { abortEarly: false });

        if (error) {
            return res.status(400).json({
                success: false,
                message: "Datos inválidos",
                details: error.details.map(d => d.message),
            });
        }

        const updated = await userService.updateUser(req.params.id, value);
        return res.json({ success: true, data: updated });
    }

    async delete(req, res) {
        const deleted = await userService.deleteUser(req.params.id);
        return res.json({ success: true, data: deleted });
    }

    async updatePassword(req, res) {
        const { error, value } = updatePasswordSchema.validate(req.body || {}, { abortEarly: false });

        if (error) {
            return res.status(400).json({
                success: false,
                message: "Datos inválidos",
                details: error.details.map(d => d.message),
            });
        }

        const updated = await userService.updatePassword(req.params.id, value);
        return res.json({ success: true, data: updated });
    }
}

module.exports.userController = new UserController();

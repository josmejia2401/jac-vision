const { USER_STATUS } = require("../helpers/utils/constants/user-status.constants.js");
const { userRepository } = require("../repositories/user.repository.js");
const { UniqueNumberUtil } = require("../helpers/utils/security/unique-number.util.js");
const BusinessException = require("../helpers/utils/errors/business-exception.js");

class UserService {

    async getById(id) {
        const user = await userRepository.findById(id);
        if ([USER_STATUS.DELETED.id, USER_STATUS.INACTIVE.id, USER_STATUS.LOCKED.id].includes(user.status.id)) {
            throw new BusinessException("Usuario no disponible en este momento", 400);
        }
        if (!user) {
            throw new BusinessException("Usuario no encontrado", 400);
        }
        return user;
    }

    async findByUsername(username) {
        const user = await userRepository.findByUsername(username);
        if (user && [USER_STATUS.DELETED.id, USER_STATUS.INACTIVE.id, USER_STATUS.LOCKED.id].includes(user.status.id)) {
            throw new BusinessException("Usuario no disponible en este momento", 400);
        }
        return user;
    }

    async getPaginated(page, limit) {
        return userRepository.findPaginated(page, limit);
    }

    async createUser(data) {
        data._id = UniqueNumberUtil.generateUniqueNumberDataBase();
        return userRepository.create({
            ...data,
            created_at: new Date(),
            status: { id: USER_STATUS.PENDING.id, name: USER_STATUS.PENDING.name },
        });
    }

    async updateUser(id, data) {
        return userRepository.update(id, data);
    }

    async deleteUser(id) {
        return userRepository.softDelete(id);
    }

    async updatePassword(id, value = { password: '', newPassword: '' }) {
        const user = await this.getById(id);
        if (user.password !== value.password) {
            throw new BusinessException("La contraseña actual no es correcta", 400);
        }
        if (value.newPassword === value.password) {
            throw new BusinessException("La nueva contraseña no puede ser igual a la anterior", 400);
        }
        return userRepository.updatePassword(id, value);
    }
}

module.exports.userService = new UserService();

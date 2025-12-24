const { UserModel } = require("../models/user.model");
const { USER_STATUS } = require("../../helpers/utils/constants/user-status.constants");

class UserRepository {

    findById(id) {
        return UserModel.findById(id);
    }

    findByUsername(username) {
        return UserModel.findOne({ username: username });
    }

    async findPaginated(page, limit) {
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            UserModel.find({}).skip(skip).limit(limit),
            UserModel.countDocuments({}),
        ]);

        return { data, total };
    }

    create(data) {
        return UserModel.create(data);
    }

    update(id, data) {
        return UserModel.findOneAndUpdate({ _id: id }, data, { new: true });
    }

    softDelete(id) {
        return UserModel.findOneAndUpdate(
            { _id: id },
            {
                status: { id: USER_STATUS.DELETED.id, name: USER_STATUS.DELETED.name },
            },
            { new: true }
        );
    }

    async updatePassword(id, { password, newPassword }) {
        return UserModel.updateOne({ _id: id, password: password },
            {
                password: newPassword
            },
            { new: true }
        );
    }
}

module.exports.userRepository = new UserRepository();

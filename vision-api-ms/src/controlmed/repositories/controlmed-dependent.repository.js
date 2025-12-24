const { DependentModel } = require("../models/controlmed-dependent.model");

class DependentRepository {

    findById(id) {
        return DependentModel.findById(id);
    }

    findByUser(userId) {
        return DependentModel.find({ userId, isActive: true });
    }

    async findPaginatedByUser(userId, page, limit) {
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            DependentModel.find({ userId, isActive: true })
                .skip(skip)
                .limit(limit),
            DependentModel.countDocuments({ userId, isActive: true })
        ]);

        return { data, total };
    }

    create(data) {
        return DependentModel.create(data);
    }

    update(id, data) {
        return DependentModel.findOneAndUpdate(
            { _id: id },
            data,
            { new: true }
        );
    }

    softDelete(id) {
        return DependentModel.findOneAndUpdate(
            { _id: id },
            { isActive: false },
            { new: true }
        );
    }
}

module.exports.dependentRepository = new DependentRepository();

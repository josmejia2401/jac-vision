const { UniqueNumberUtil } = require("../../helpers/utils/security/unique-number.util");
const { dependentRepository } = require("../repositories/controlmed-dependent.repository");

class DependentService {

    getById(id) {
        return dependentRepository.findById(id);
    }

    getByUser(userId, page, limit) {
        if (page && limit) {
            return dependentRepository.findPaginatedByUser(userId, page, limit);
        }
        return dependentRepository.findByUser(userId);
    }

    create(data) {
        return dependentRepository.create({
            ...data,
            createdAt: new Date(),
            _id: UniqueNumberUtil.generateUniqueNumberDataBase()
        });
    }

    update(id, data) {
        return dependentRepository.update(id, data);
    }

    delete(id) {
        return dependentRepository.softDelete(id);
    }
}

module.exports.dependentService = new DependentService();

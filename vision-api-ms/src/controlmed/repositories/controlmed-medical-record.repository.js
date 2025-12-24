const { ControlMedMedicalRecordModel } = require("../models/controlmed-medical-record.model");
const { STATUS } = require("../../helpers/utils/constants/status.constants");

class ControlMedMedicalRecordRepository {

    findById(id) {
        return ControlMedMedicalRecordModel.findById(id);
    }

    findByDependent(dependentId) {
        return ControlMedMedicalRecordModel.find({ dependentId });
    }

    findByRecordType(type) {
        return ControlMedMedicalRecordModel.find({ type });
    }

    async findPaginated({ page = 1, limit = 10, dependentId, type }) {
        const skip = (page - 1) * limit;

        const query = {};

        if (dependentId) query.dependentId = dependentId;
        if (type) query.type = type;

        const [data, total] = await Promise.all([
            ControlMedMedicalRecordModel.find(query).skip(skip).limit(limit),
            ControlMedMedicalRecordModel.countDocuments(query),
        ]);

        return { data, total };
    }

    create(data) {
        return ControlMedMedicalRecordModel.create(data);
    }

    update(id, data) {
        return ControlMedMedicalRecordModel.findOneAndUpdate(
            { _id: id },
            data,
            { new: true }
        );
    }

    delete(id) {
        return ControlMedMedicalRecordModel.findOneAndDelete({ _id: id });
    }

    softDelete(id) {
        return ControlMedMedicalRecordModel.findOneAndUpdate(
            { _id: id },
            {
                status: {
                    id: STATUS.DELETED.id,
                    name: STATUS.DELETED.name
                }
            },
            { new: true }
        );
    }
}

module.exports.controlMedMedicalRecordRepository = new ControlMedMedicalRecordRepository();

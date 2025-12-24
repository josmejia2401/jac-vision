const { controlMedMedicalRecordRepository } = require("../repositories/controlmed-medical-record.repository");

class ControlRecordService {
    constructor() {
        this.recordType = "CONTROL";
    }

    create(data) {
        return controlMedMedicalRecordRepository.create({
            ...data,
            type: this.recordType
        });
    }

    update(id, data) {
        return controlMedMedicalRecordRepository.update(id, data);
    }

    delete(id) {
        return controlMedMedicalRecordRepository.delete(id);
    }

    findById(id) {
        return controlMedMedicalRecordRepository.findById(id);
    }

    findByDependent(dependentId) {
        return controlMedMedicalRecordRepository.findByDependent(dependentId, this.recordType);
    }

    findPaginated(page, limit, dependentId) {
        return controlMedMedicalRecordRepository.findPaginated({
            page,
            limit,
            dependentId,
            type: this.recordType
        });
    }
}

module.exports.controlRecordService = new ControlRecordService();

const { controlMedMedicalRecordRepository } = require("../repositories/controlmed-medical-record.repository");

class ExamRecordService {
    constructor() {
        this.recordType = "EXAM";
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

module.exports.examRecordService = new ExamRecordService();

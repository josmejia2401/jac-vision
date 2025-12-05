const { visionPeopleRepository } = require("../repositories/vision-people.repository");
const { UniqueNumberUtil } = require("../helpers/utils/security/unique-number.util");

class VisionPeopleService {

    async getOne(id) {
        const person = await visionPeopleRepository.findById(id);
        if (!person) throw new Error("Persona no encontrada");
        return person;
    }

    async getByUser(userId, page = 1, limit = 20) {
        const [data, total] = await Promise.all([
            visionPeopleRepository.findByUser(userId, limit, page),
            visionPeopleRepository.countByUser(userId)
        ]);

        return { data, total };
    }

    async createPerson(dto) {
        dto._id = dto._id ?? UniqueNumberUtil.generateUniqueNumberDataBase();
        return visionPeopleRepository.create(dto);
    }

    async updatePerson(id, dto) {
        const updated = await visionPeopleRepository.update(id, dto);
        if (!updated) throw new Error("No existe el registro para actualizar");
        return updated;
    }

    async deletePerson(id) {
        const deleted = await visionPeopleRepository.delete(id);
        if (!deleted) throw new Error("No existe el registro a eliminar");
        return deleted;
    }

    async addEmbedding(personId, embeddingDto) {
        embeddingDto._id = UniqueNumberUtil.generateUniqueNumberDataBase();
        return visionPeopleRepository.addEmbedding(personId, embeddingDto);
    }

    async removeEmbedding(personId, embeddingId) {
        return visionPeopleRepository.removeEmbedding(personId, embeddingId);
    }
}

module.exports.visionPeopleService = new VisionPeopleService();

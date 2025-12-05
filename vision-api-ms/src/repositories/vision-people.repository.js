const { PersonModel } = require("../models/vision-people.model");

class VisionPeopleRepository {

    findById(id) {
        return PersonModel.findOne({ _id: id });
    }

    findByUser(userId, limit = 20, page = 1) {
        const skip = (page - 1) * limit;
        return PersonModel.find({ userId })
            .skip(skip)
            .limit(limit);
    }

    countByUser(userId) {
        return PersonModel.countDocuments({ userId });
    }

    create(data) {
        return PersonModel.create(data);
    }

    update(id, data) {
        return PersonModel.findOneAndUpdate(
            { _id: id },
            data,
            { new: true }
        );
    }

    delete(id) {
        return PersonModel.findOneAndDelete({ _id: id });
    }

    addEmbedding(personId, embedding) {
        return PersonModel.findOneAndUpdate(
            { _id: personId },
            { $push: { embeddings: embedding } },
            { new: true }
        );
    }

    removeEmbedding(personId, embeddingId) {
        return PersonModel.findOneAndUpdate(
            { _id: personId },
            { $pull: { embeddings: { _id: embeddingId } } },
            { new: true }
        );
    }
}

module.exports.visionPeopleRepository = new VisionPeopleRepository();

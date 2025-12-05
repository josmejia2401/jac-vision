const { TokenModel } = require("../models/token.model");

class TokenRepository {

    findById(id) {
        return TokenModel.findOne({ _id: id });
    }

    create(tokenData) {
        return TokenModel.create(tokenData);
    }

    findTokensByUserId(userId) {
        return TokenModel.find({ userId });
    }

    deleteExpired() {
        return TokenModel.deleteMany({ expiresAt: { $lte: new Date() } });
    }

    update(id, data) {
        return TokenModel.findOneAndUpdate({ _id: id }, data, { new: true });
    }

    deleteById(id) {
        return TokenModel.findOneAndDelete({ _id: id });
    }

    deleteByUserId(userId) {
        return TokenModel.deleteMany({ userId: userId });
    }
}

module.exports.tokenRepository = new TokenRepository();

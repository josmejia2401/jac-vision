import { createAxiosInstance } from './http/axios.instance';

const api = createAxiosInstance();

class UsersService {

    static create(payload) {
        return api.post('/users', payload);
    }

    static getById(userId) {
        return api.get(`/users/${userId}`);
    }

    static updateById(userId, payload) {
        return api.put(`/users/${userId}`, payload);
    }

    static deleteById(userId) {
        return api.delete(`/users/${userId}`);
    }
}

export default UsersService;

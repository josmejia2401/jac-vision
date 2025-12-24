import { createAxiosInstance } from './http/axios.instance';

const api = createAxiosInstance();

class DependentsService {
  static getAll() {
    return api.get('/controlmed/dependents');
  }

  static create(payload) {
    return api.post('/controlmed/dependents', payload);
  }

  static update(id, payload) {
    return api.put(`/controlmed/dependents/${id}`, payload);
  }

  static remove(id) {
    return api.delete(`/controlmed/dependents/${id}`);
  }
}

export default DependentsService;

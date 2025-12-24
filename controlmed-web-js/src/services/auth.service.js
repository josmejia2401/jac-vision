import { createAxiosInstance } from './http/axios.instance';
import { AuthStore } from '../helpers/cache/index';

const api = createAxiosInstance();

class AuthService {

    static async login({ username, password }) {
        const response = await api.post('/auth/login', {
            username,
            password
        });

        const { accessToken, user } = response.data;

        if (accessToken) {
            localStorage.setItem('token', accessToken);
            AuthStore.setToken(accessToken);
        }

        if (user) {
            AuthStore.setUserInfo(user);
        }

        return response.data;
    }

    static async logout() {
        const response = await api.post('/auth/logout', {});
        AuthStore.logout();
        return response.data;
    }
}

export default AuthService;

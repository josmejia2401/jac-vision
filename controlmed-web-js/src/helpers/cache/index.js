import { parseJwt } from "../utils/utils";

const STORAGE_KEY = "auth_state";

export class AuthStore {
  static data = {
    isAuthenticated: false,
    token: null,
    tokenInfo: null,
    userInfo: null
  };

  static getState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return { ...AuthStore.data };

      const parsed = JSON.parse(stored);

      // Recalcular tokenInfo siempre
      if (parsed.token) {
        parsed.tokenInfo = parseJwt(parsed.token);
        parsed.isAuthenticated = true;
      }

      AuthStore.data = parsed;
      return parsed;
    } catch (error) {
      console.error("AuthStore.getState error:", error);
      return { ...AuthStore.data };
    }
  }

  static setToken(token) {
    const data = {
      token,
      tokenInfo: parseJwt(token),
      isAuthenticated: true,
      userInfo: AuthStore.getState().userInfo
    };

    AuthStore.persist(data);
  }

  static setUserInfo(userInfo) {
    const data = {
      ...AuthStore.getState(),
      userInfo
    };

    AuthStore.persist(data);
  }

  static logout() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.clear();

    AuthStore.data = {
      isAuthenticated: false,
      token: null,
      tokenInfo: null,
      userInfo: null
    };
  }

  static persist(data) {
    AuthStore.data = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

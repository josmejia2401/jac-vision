import axios from 'axios';
import { AuthStore } from '../../helpers/cache/index';

const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

/* ===============================
   DEVICE DETECTION (cacheado)
================================= */

let cachedDeviceType = null;

function detectDeviceType() {
  if (cachedDeviceType) return cachedDeviceType;

  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    cachedDeviceType = 'unknown';
    return cachedDeviceType;
  }

  const ua = navigator.userAgent.toLowerCase();
  const width = window.innerWidth;

  const isMobileUA = /iphone|android(?!.*tablet)|ipod|phone/i.test(ua);
  const isTabletUA = /ipad|tablet|playbook|silk/i.test(ua);

  if (isMobileUA || width <= 767) cachedDeviceType = 'mobile';
  else if (isTabletUA || width <= 1024) cachedDeviceType = 'tablet';
  else cachedDeviceType = 'desktop';

  return cachedDeviceType;
}

/* ===============================
   ERROR NORMALIZER
================================= */

function normalizeAxiosError(error) {
  console.error(error);
  // Request cancelado
  if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
    return Promise.reject({ cancelled: true });
  }

  // Error sin respuesta (red / CORS / backend caído)
  if (!error.response) {
    return Promise.reject({
      status: 0,
      error: 'Network Error',
      message: 'No se pudo conectar con el servidor.'
    });
  }

  const { status, data } = error.response;

  return Promise.reject({
    status: status || 500,
    error: data?.error || 'Error',
    message:
      data?.message ||
      'Ocurrió un error inesperado. Intenta nuevamente.'
  });
}

/* ===============================
   REQUEST DEDUPLICATION
================================= */

const pendingRequests = new Map();

function getRequestKey(config) {
  const { url, method, params, data } = config;
  return [
    method,
    url,
    JSON.stringify(params),
    JSON.stringify(data)
  ].join('|');
}

/* ===============================
   AXIOS INSTANCE
================================= */

export function createAxiosInstance(baseURL = API_BASE) {
  const instance = axios.create({
    baseURL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  });

  instance.interceptors.request.use((config) => {
    const key = getRequestKey(config);

    if (pendingRequests.has(key)) {
      pendingRequests.get(key).abort();
    }

    const controller = new AbortController();
    config.signal = controller.signal;
    pendingRequests.set(key, controller);

    // 🔐 Token
    const token = AuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 📱 Audience
    const deviceType = detectDeviceType();
    config.headers.audience =
      deviceType === 'desktop' || deviceType === 'unknown'
        ? 'web'
        : 'app';

    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      const key = getRequestKey(response.config);
      pendingRequests.delete(key);
      return response.data;
    },
    (error) => {
      if (error.config) {
        const key = getRequestKey(error.config);
        pendingRequests.delete(key);
      }
      return normalizeAxiosError(error);
    }
  );

  return instance;
}


export function jsonToQueryParams(obj = {}) {
  const params = new URLSearchParams();

  Object.entries(obj).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;

    if (Array.isArray(value)) {
      value.forEach(v => params.append(key, v));
    } else if (value instanceof Date) {
      params.append(key, value.toISOString());
    } else if (typeof value === 'object') {
      params.append(key, JSON.stringify(value));
    } else {
      params.append(key, value);
    }
  });

  return params.toString();
}

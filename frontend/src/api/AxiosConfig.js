import axios from "axios";


const api = axios.create({
  baseURL: 'http://localhost:8080'    // directly connect to backend
  // baseURL:'https://9c96-103-106-239-104.ap.ngrok.io',
  // headers:{"ngrok-skip-browser-warning": "true"}
});

// request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

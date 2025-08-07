import axios from 'axios';

// 检查是否在浏览器环境中
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

// 根据当前URL判断环境
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === '192.168.184.1' || hostname === 'your-production-domain.com') {
      return 'http://192.168.184.1:7001';
    }
  }
  return 'http://localhost:7001';
};

// 创建axios实例
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
});

// 请求拦截器 - 自动添加token
api.interceptors.request.use(
  (config) => {
    if (isBrowser) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && isBrowser) {
      // token过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 
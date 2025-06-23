import axios from 'axios';
import { store } from '@/store/store';
import { logout } from '@/store/authSlice';

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default axios;

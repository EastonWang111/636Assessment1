import axios from 'axios';

const axiosInstance = axios.create({
  //baseURL: 'http://localhost:5001', // local
  baseURL: 'http://52.64.199.195/api',// live
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;

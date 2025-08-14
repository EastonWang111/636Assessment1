import axios from 'axios';

const axiosInstance = axios.create({
  //baseURL: 'http://localhost:5001', // local
  baseURL: 'http://13.239.25.94',// live
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;

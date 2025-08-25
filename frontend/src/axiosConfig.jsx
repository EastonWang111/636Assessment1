import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001/api', // local
  //baseURL: 'http://16.176.159.212',// live
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;






import axios from "axios";

const axiosInstance = axios.create({
     baseURL: import.meta.env.VITE_API_BASE_URL,
     withCredentials: true,
     headers: {
          "Content-Type": "application/json",
     },
});

axiosInstance.interceptors.response.use(
     (response) => {
          const { data: axiosDataObj } = response;
          if (axiosDataObj.data.redirectTo && window.location.pathname !== axiosDataObj.data.redirectTo) {
               window.location.href = axiosDataObj.data.redirectTo
          }
          return Promise.resolve(axiosDataObj);
     },
     (error) => {
          // Handle all global errors
          return Promise.reject(error.response.data);
     },
);

export { axiosInstance };

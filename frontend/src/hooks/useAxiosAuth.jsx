import axios from "axios";
import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";

const useAxiosAuth = () => {
  const { refresh } = useAuth();

  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: process.env.REACT_APP_API_URL,
      withCredentials: true, // cookies
    });

    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    let isRefreshing = false;
    let failedQueue = [];

    const processQueue = (error, token) => {
      failedQueue.forEach((prom) => {
        if (error) {
          prom.reject(error);
        } else {
          prom.resolve(token);
        }
      });
      failedQueue = [];
    };

    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (!error.response) {
          return Promise.reject(error);
        }

        if (error.response.status === 401 && !originalRequest._retry) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return instance(originalRequest); 
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const newAccessToken = await refresh(); 
            localStorage.setItem("accessToken", newAccessToken);
            processQueue(null, newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return instance(originalRequest); 
          } catch (err) {
            processQueue(err, null);
            return Promise.reject(err);
          } finally {
            isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );

    return instance;
  }, [refresh]);

  return axiosInstance;
};

export default useAxiosAuth;

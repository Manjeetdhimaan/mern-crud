import axios, { AxiosHeaders, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { getAuthToken } from './auth';
import { baseAPIUrl } from '../constants/local.constants';

class HttpClient {
    instance: AxiosInstance;
    constructor() {
        this.instance = axios.create({
            baseURL: baseAPIUrl,
        });

        this.instance.interceptors.request.use(
            this._handleRequest,
            this._handleRequestError
        );

        this.instance.interceptors.response.use(
            this._handleResponse,
            this._handleResponseError
        );
    }

    _handleRequest = (config: InternalAxiosRequestConfig<AxiosHeaders>): InternalAxiosRequestConfig<AxiosHeaders>  => {
        const token = getAuthToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    };

    _handleRequestError = (error: Error) => {
        return Promise.reject(error);
    };

    _handleResponse = (response: AxiosResponse) => {
        return response;
    };

    _handleResponseError = (error: Error) => {
        return Promise.reject(error);
    };

    get = (url: string, queryparams?: string, config?: AxiosHeaders) => {
        return this.instance.get(url, { params: queryparams, ...config });
    };

    post = <T>(url: string, data: T, config?: AxiosHeaders) => {
        return this.instance.post(url, data, {...config});
    };

    put = <T>(url: string, data: T, config?: AxiosHeaders) => {
        return this.instance.put(url, data, {...config});
    };

    delete = (url: string, config?: AxiosHeaders) => {
        return this.instance.delete(url, {...config});
    };
}

export default new HttpClient();
import axios, { AxiosHeaders, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { getAuthToken } from '../../util/auth';
import { BASE_API_URL } from '../../constants/local.constants';

class HttpClient {
    instance: AxiosInstance;
    constructor() {
        this.instance = axios.create({
            baseURL: BASE_API_URL,
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
        window.dispatchEvent(new Event('httpRequestStart'));
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    };

    _handleRequestError = (error: Error) => {
        window.dispatchEvent(new Event('httpRequestEnd'));
        return Promise.reject(error);
    };

    _handleResponse = (response: AxiosResponse) => {
        window.dispatchEvent(new Event('httpRequestEnd'));
        return response;
    };

    _handleResponseError = (error: Error) => {
        return Promise.reject(error);
    };

    get = <T>(url: string, queryparams?: T, config?: AxiosHeaders) => {
        return this.instance.get(url, { params: queryparams, ...config });
    };

    getWithStream = (url: string, queryparams?: any, config?: AxiosHeaders) => {
        return this.instance.get(url, {
            params: queryparams,
            responseType: 'blob',  // Set responseType to 'blob' for streaming
            ...config
        });
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
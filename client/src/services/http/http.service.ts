import axios, { AxiosHeaders, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { getAuthToken } from '../../util/auth';
import { BASE_API_URL } from '../../constants/api.constants';

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

    private _handleRequest = (config: InternalAxiosRequestConfig<AxiosHeaders>): InternalAxiosRequestConfig<AxiosHeaders>  => {
        const token = getAuthToken();
        window.dispatchEvent(new Event('httpRequestStart'));
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    };

    private _handleRequestError = (error: Error): Promise<Error> => {
        window.dispatchEvent(new Event('httpRequestEnd'));
        return Promise.reject(error);
    };

    private _handleResponse = (response: AxiosResponse): AxiosResponse => {
        window.dispatchEvent(new Event('httpRequestEnd'));
        return response;
    };

    private _handleResponseError = (error: Error): Promise<Error> => {
        window.dispatchEvent(new Event('httpRequestEnd'));
        return Promise.reject(error);
    };

    get = <T>(url: string, queryparams?: T, config?: AxiosHeaders): Promise<AxiosResponse> => {
        return this.instance.get(url, { params: queryparams, ...config });
    };

    getWithStream = (url: string, queryparams?: any, config?: AxiosHeaders): Promise<AxiosResponse> => {
        return this.instance.get(url, {
            params: queryparams,
            responseType: 'blob',  // Set responseType to 'blob' for streaming
            ...config
        });
    };

    post = <T>(url: string, data: T, config?: AxiosHeaders): Promise<AxiosResponse> => {
        return this.instance.post(url, data, {...config});
    };

    put = <T>(url: string, data: T, config?: AxiosHeaders): Promise<AxiosResponse> => {
        return this.instance.put(url, data, {...config});
    };

    delete = (url: string, config?: AxiosHeaders): Promise<AxiosResponse> => {
        return this.instance.delete(url, {...config});
    };
}

export default new HttpClient();
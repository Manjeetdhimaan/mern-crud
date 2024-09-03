import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';

import { UseHttpReturnType } from '../models/http.model';

export default function useHttp<T>(fetchFn: () => Promise<T>, initialValue: T): UseHttpReturnType<T> {
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<{ message: string }>();
  const [fetchedData, setFetchedData] = useState<T>(initialValue);

  useEffect(() => {
    async function fetchData() {
      setIsFetching(true);
      try {
        const data = await fetchFn();
        setFetchedData(data);
      } catch (err) {
        const axiosError = err as AxiosError;
        setError({ message: axiosError.message || 'Failed to fetch data.' });
      }
      setIsFetching(false);
    }

    fetchData();
  }, [fetchFn]);

  return {
    isFetching,
    fetchedData,
    setFetchedData,
    error,
  };
}

// import { useState, useEffect, useCallback } from 'react';
// import axios, { AxiosRequestConfig } from 'axios';

// interface HttpRequestState<T> {
//   data: T | null;
//   error: string | null;
//   loading: boolean;
// }

// export const useHttpRequest = <T = any>(
//   url: string,
//   options?: AxiosRequestConfig,
//   immediate: boolean = true // whether to trigger the request immediately
// ) => {
//   const [state, setState] = useState<HttpRequestState<T>>({
//     data: null,
//     error: null,
//     loading: false,
//   });

//   const makeRequest = useCallback(async () => {
//     setState({ ...state, loading: true });
//     try {
//       const response = await axios(url, options);
//       setState({ data: response.data, error: null, loading: false });
//     } catch (err) {
//       setState({
//         data: null,
//         error: (err as Error).message || 'Something went wrong!',
//         loading: false,
//       });
//     }
//   }, [url, options]);

//   useEffect(() => {
//     if (immediate) {
//       makeRequest();
//     }
//   }, [makeRequest, immediate]);

//   return { ...state, refetch: makeRequest };
// };


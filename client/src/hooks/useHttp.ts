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

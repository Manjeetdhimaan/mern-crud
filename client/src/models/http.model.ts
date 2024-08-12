export type UseHttpReturnType<T> = {
    isFetching: boolean;
    fetchedData: T;
    setFetchedData: React.Dispatch<React.SetStateAction<T>>;
    error: { message: string } | undefined;
  };
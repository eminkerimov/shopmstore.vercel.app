import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../helpers/baseURL";

const useFetch = (url) => {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ key: null, data: null, loading: false, error: null });
  const requestKey = url ? url + "|" + attempt : null;
  const refetch = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    if (!url) {
      setResult({ key: null, data: null, loading: false, error: null });
      return undefined;
    }

    const controller = new AbortController();
    const { signal } = controller;
    setResult({ key: requestKey, data: null, loading: true, error: null });

    const fetchData = async () => {
      try {
        const response = await axios.get(BASE_URL + url, { signal });
        if (!signal.aborted) {
          setResult({ key: requestKey, data: response.data, loading: false, error: null });
        }
      } catch (error) {
        if (signal.aborted || axios.isCancel(error)) return;
        setResult({ key: requestKey, data: null, loading: false, error });
      }
    };

    fetchData();
    return () => controller.abort();
  }, [url, requestKey]);

  if (!url) return { data: null, loading: false, error: null, refetch };
  // Hide the previous route's response before the next request effect runs.
  if (result.key !== requestKey) return { data: null, loading: true, error: null, refetch };
  return { data: result.data, loading: result.loading, error: result.error, refetch };
};

export default useFetch;

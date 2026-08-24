import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/src/api/client";

export function useFetch<T = any>(path: string | null, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<T>(path);
      setData(res);
    } catch (e: any) {
      setError(e.message || "خطأ");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...deps]);

  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, error, reload: run };
}

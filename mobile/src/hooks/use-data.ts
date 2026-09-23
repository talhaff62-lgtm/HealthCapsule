import { useCallback, useEffect, useRef, useState } from "react";
import { createStaleGuard } from "@/utils/stale-guard";

type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  errorCode: string | null;
};

// Tiny async-data hook. Each call gets a monotonically increasing request
// token; only the latest token can update state, so an in-flight older
// response can never overwrite a newer one. A mounted ref blocks updates
// after unmount. The loader is read through a ref so callers can pass a fresh
// closure without retriggering the effect on every render; callers must
// memoize the loader themselves so the effect dependency is stable.
//
// The initial `loading: true` setState is queued via `queueMicrotask` so it
// runs after the effect frame, satisfying `react-hooks/set-state-in-effect`.
export function useAsync<T>(loader: () => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
    errorCode: null,
  });

  const mountedRef = useRef(true);
  const guard = useRef(createStaleGuard());
  const loaderRef = useRef(loader);

  const execute = useCallback(() => {
    const token = guard.current.next();
    queueMicrotask(() => {
      if (!mountedRef.current || !guard.current.isCurrent(token)) return;
      setState((s) =>
        s.loading && !s.error ? s : { ...s, loading: true, error: null, errorCode: null },
      );
    });
    loaderRef
      .current()
      .then((data) => {
        if (!mountedRef.current || !guard.current.isCurrent(token)) return;
        setState({ data, loading: false, error: null, errorCode: null });
      })
      .catch((err: Error & { code?: string }) => {
        if (!mountedRef.current || !guard.current.isCurrent(token)) return;
        setState({
          data: null,
          loading: false,
          error: err.message,
          errorCode: err.code ?? null,
        });
      });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  useEffect(() => {
    execute();
  }, [execute, loader]);

  const reload = useCallback(() => execute(), [execute]);

  return { ...state, reload };
}

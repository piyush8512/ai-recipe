
import { useState } from "react";
import { toast } from "sonner";

type AsyncCallback<TData, TArgs extends unknown[]> = (...args: TArgs) => Promise<TData>;

const useFetch = <TData = unknown, TArgs extends unknown[] = unknown[]>(
  cb: AsyncCallback<TData, TArgs>
) => {
  const [data, setData] = useState<TData | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fn = async (...args: TArgs): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      setData(response);
      setError(null);
    } catch (error: unknown) {
      const typedError =
        error instanceof Error ? error : new Error("Something went wrong");
      setError(typedError);
      toast.error(typedError.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;

import { act, renderHook, waitFor } from "@testing-library/react";
import axios from "axios";
import useFetch from "./useFetch";

jest.mock("axios", () => ({ get: jest.fn(), isCancel: jest.fn() }));

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => { resolve = resolvePromise; reject = rejectPromise; });
  return { promise, resolve, reject };
};

beforeEach(() => {
  jest.clearAllMocks();
  axios.isCancel.mockReturnValue(false);
});

test("cancels the previous request and ignores its late response after a route change", async () => {
  const first = deferred();
  const second = deferred();
  axios.get.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
  const { result, rerender } = renderHook(({ url }) => useFetch(url), { initialProps: { url: "/product/1" } });
  const firstSignal = axios.get.mock.calls[0][1].signal;
  rerender({ url: "/product/2" });
  expect(firstSignal.aborted).toBe(true);
  expect(result.current.data).toBeNull();
  expect(result.current.loading).toBe(true);
  await act(async () => { second.resolve({ data: { id: 2 } }); });
  expect(result.current.data).toEqual({ id: 2 });
  await act(async () => { first.resolve({ data: { id: 1 } }); });
  expect(result.current.data).toEqual({ id: 2 });
  expect(result.current.loading).toBe(false);
});

test("retry clears the previous error and replaces it with a successful response", async () => {
  const failure = Object.assign(new Error("Unavailable"), { response: { status: 503 } });
  const retry = deferred();
  axios.get.mockRejectedValueOnce(failure).mockReturnValueOnce(retry.promise);
  const { result } = renderHook(() => useFetch("/product?category=1"));
  await waitFor(() => expect(result.current.error).toBe(failure));
  act(() => result.current.refetch());
  expect(result.current.error).toBeNull();
  expect(result.current.loading).toBe(true);
  await act(async () => { retry.resolve({ data: [{ id: 1 }] }); });
  expect(result.current.data).toEqual([{ id: 1 }]);
  expect(result.current.error).toBeNull();
  expect(result.current.loading).toBe(false);
});

test("null URLs skip fetching and cancel any active request", () => {
  axios.get.mockReturnValueOnce(new Promise(() => {}));
  const { result, rerender } = renderHook(({ url }) => useFetch(url), { initialProps: { url: null } });
  expect(axios.get).not.toHaveBeenCalled();
  expect(result.current.loading).toBe(false);
  rerender({ url: "/product/1" });
  const signal = axios.get.mock.calls[0][1].signal;
  rerender({ url: null });
  expect(signal.aborted).toBe(true);
  expect(result.current).toMatchObject({ data: null, error: null, loading: false });
});

test("an empty collection response completes without an error", async () => {
  axios.get.mockResolvedValueOnce({ data: [] });
  const { result } = renderHook(() => useFetch("/product?category=1"));
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.data).toEqual([]);
  expect(result.current.error).toBeNull();
});

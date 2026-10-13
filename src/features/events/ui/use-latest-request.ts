import { useMemo, useRef } from "react";

/** "Latest request wins" for async loads: Server Actions may resolve out of
 *  order, so a response is applied only while it is still the newest. */
export type LatestRequest = {
  /** Starts a request, outdating every earlier one. The returned function
   *  says whether this request is still the newest. */
  start(): () => boolean;
  /** Follows the newest request without starting one (e.g. loading more of
   *  the same list): the returned function turns false once a new one starts. */
  current(): () => boolean;
};

/** The returned object keeps its identity, so it is safe in hook deps. */
export function useLatestRequest(): LatestRequest {
  const counter = useRef(0);
  return useMemo(
    () => ({
      start() {
        const mine = ++counter.current;
        return () => mine === counter.current;
      },
      current() {
        const mine = counter.current;
        return () => mine === counter.current;
      },
    }),
    []
  );
}

import { useState } from "react";
import { filterEquals, type EventFilterState } from "../lib/event-filter";

/** The same Filter object until the Filter really changes (by
 *  `filterEquals`), so it is safe as a hook dependency. */
export function useStableFilter(filter: EventFilterState): EventFilterState {
  const [stable, setStable] = useState(filter);
  if (filterEquals(stable, filter)) return stable;
  setStable(filter);
  return filter;
}

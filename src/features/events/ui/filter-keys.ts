import {
  isNarrowing,
  UNFILTERED,
  type EventFilterState,
} from "../lib/event-filter";

/** Primitive keys derived from the filter, stable across renders until the
 *  filter really changes (safe as hook dependencies). */
export type FilterKeys = {
  importanceKey: string;
  searchText: string;
  /** True when the Importance or keyword filter narrows the Events. */
  isFiltered: boolean;
};

const SEPARATOR = ",";

export function deriveFilterKeys(
  filter: EventFilterState = UNFILTERED
): FilterKeys {
  return {
    importanceKey: filter.importance.join(SEPARATOR),
    searchText: filter.q,
    isFiltered: isNarrowing(filter),
  };
}

/** The `importance`/`q` fields the list actions expect. */
export function toFilterQuery(
  keys: Pick<FilterKeys, "importanceKey" | "searchText">
) {
  return {
    importance: keys.importanceKey ? keys.importanceKey.split(SEPARATOR) : [],
    q: keys.searchText,
  };
}

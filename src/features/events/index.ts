// Public surface of the events module. Other modules and app/ may import only
// from this file (and actions.ts); everything else is private (ADR 0001).
export { EventCalendar } from "./ui/EventCalendar";
export { EventsWorkspace } from "./ui/EventsWorkspace";

// PROTOTYPE (ui-redesign): view-state helpers so prototype layouts can drive
// the same URL state as EventsWorkspace from their own controls.
export {
  dateForModeSwitch,
  MODES,
  parseViewState,
  VIEWS,
  withViewState,
  type CalendarMode,
  type ViewState,
} from "./lib/view-state";
export { IMPORTANCES, type Importance } from "./lib/schemas";
export { IMPORTANCE_COLORS } from "./ui/importance";
export { toLocalParts } from "./lib/datetime";

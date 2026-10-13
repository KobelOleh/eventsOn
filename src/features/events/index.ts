// Public surface of the events module. Other modules and app/ may import only
// from this file (and actions.ts); everything else is private (ADR 0001).
export { EventCalendar } from "./ui/EventCalendar";
export { EventsWorkspace } from "./ui/EventsWorkspace";
// Open the create dialog of the mounted view from outside the workspace.
export { CreateEventFab, CreateEventProvider } from "./ui/create-event";

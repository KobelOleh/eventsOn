"use client";

import Fab from "@mui/material/Fab";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { uk } from "@/shared/i18n/uk";

type Opener = () => void;

type CreateEventApi = {
  /** The mounted view (calendar or list) registers how it opens its dialog. */
  register: (open: Opener) => () => void;
  open: () => void;
};

const CreateEventContext = createContext<CreateEventApi | null>(null);

/** Lets a button outside the workspace open the create dialog of whichever
 *  view (calendar or list) is currently mounted inside it. */
export function CreateEventProvider({ children }: { children: ReactNode }) {
  const opener = useRef<Opener | null>(null);
  const register = useCallback((open: Opener) => {
    opener.current = open;
    return () => {
      if (opener.current === open) opener.current = null;
    };
  }, []);
  const api = useMemo(
    () => ({ register, open: () => opener.current?.() }),
    [register]
  );
  return (
    <CreateEventContext.Provider value={api}>
      {children}
    </CreateEventContext.Provider>
  );
}

/** Called by a view with a stable `open` that shows its create dialog. */
export function useRegisterCreateEvent(open: Opener) {
  const api = useContext(CreateEventContext);
  useEffect(() => api?.register(open), [api, open]);
}

/** Floating "create Event" button; needs a CreateEventProvider above it. */
export function CreateEventFab() {
  const api = useContext(CreateEventContext);
  return (
    <Fab
      color="primary"
      variant="extended"
      aria-label={uk.ui.create}
      onClick={() => api?.open()}
      sx={{
        position: "fixed",
        right: { xs: 16, sm: 32 },
        bottom: { xs: 24, sm: 32 },
        fontWeight: 700,
        boxShadow: "0 12px 30px rgba(108,92,231,0.5)",
      }}
    >
      + {uk.ui.create}
    </Fab>
  );
}

"use client";

// PROTOTYPE (throwaway): helpers shared by the signed-in layouts. They drive
// the same URL state (view/mode/importance/q) EventsWorkspace reads.
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Typography from "@mui/material/Typography";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { signOutAction } from "@/features/auth/actions";
import {
  parseViewState,
  withViewState,
  type ViewState,
} from "@/features/events";
import { uk } from "@/shared/i18n/uk";

export function useWorkspaceUrl() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = parseViewState(searchParams);
  const update = useCallback(
    (patch: Partial<ViewState>, how: "push" | "replace" = "replace") => {
      const query = withViewState(window.location.search, patch);
      const url = query ? `${pathname}?${query}` : pathname;
      window.history[how === "push" ? "pushState" : "replaceState"](
        null,
        "",
        url
      );
    },
    [pathname]
  );
  return { state, update };
}

/** Opens the existing create dialog by "clicking" today's cell in the
 *  calendar (switching to the calendar view first when needed). */
export function openCreateFlow(
  view: ViewState["view"],
  update: ReturnType<typeof useWorkspaceUrl>["update"]
) {
  if (view !== "calendar") update({ view: "calendar" }, "push");
  const click = () => {
    // FullCalendar v7 hashes its class names; day cells carry data-date.
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const cells = document.querySelectorAll<HTMLElement>(
      `[data-date="${today}"]`
    );
    // Last match: in week/day views the first one is the column header.
    const cell = cells[cells.length - 1];
    if (!cell) return;
    // FullCalendar listens to pointer events, so a bare .click() is ignored.
    const rect = cell.getBoundingClientRect();
    const init = {
      bubbles: true,
      cancelable: true,
      clientX: rect.x + 10,
      clientY: rect.y + 10,
      button: 0,
      pointerId: 1,
      pointerType: "mouse",
      isPrimary: true,
    };
    cell.dispatchEvent(new PointerEvent("pointerdown", init));
    cell.dispatchEvent(new MouseEvent("mousedown", init));
    cell.dispatchEvent(new PointerEvent("pointerup", init));
    cell.dispatchEvent(new MouseEvent("mouseup", init));
    cell.dispatchEvent(new MouseEvent("click", init));
  };
  setTimeout(click, view === "calendar" ? 0 : 700);
}

export function SignOut({
  variant = "text",
}: {
  variant?: "text" | "outlined";
}) {
  return (
    <form action={signOutAction}>
      <Button type="submit" size="small" variant={variant}>
        {uk.auth.signOut}
      </Button>
    </form>
  );
}

/** Avatar button opening a small menu with the email and sign-out. */
export function AccountMenu({ email }: { email?: string | null }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const letter = (email ?? "?").slice(0, 1).toUpperCase();
  return (
    <>
      <IconButton
        aria-label={uk.ui.account}
        onClick={(e) => setAnchor(e.currentTarget)}
        size="small"
      >
        <Avatar sx={{ width: 32, height: 32, fontSize: 15 }}>{letter}</Avatar>
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
      >
        <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
          <Typography variant="body2" color="text.secondary" noWrap>
            {email}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <SignOut variant="outlined" />
          </Box>
        </Box>
      </Menu>
    </>
  );
}

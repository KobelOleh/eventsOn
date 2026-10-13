"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { uk } from "@/shared/i18n/uk";
import type { EventDto } from "../lib/event-service";
import { IMPORTANCE_COLORS } from "./importance";

const formatStart = (iso: string) =>
  new Date(iso).toLocaleString("uk-UA", {
    dateStyle: "long",
    timeStyle: "short",
  });

type Props = {
  event: EventDto;
  /** Hook for opening the Event (edit); the row is not clickable without it. */
  onSelect?: (event: EventDto) => void;
};

/** One row of the List view. */
export function EventListItem({ event, onSelect }: Props) {
  const content = (
    <>
      <Box
        aria-hidden
        sx={{
          width: 6,
          alignSelf: "stretch",
          borderRadius: 1,
          mr: 2,
          bgcolor: IMPORTANCE_COLORS[event.importance],
        }}
      />
      <ListItemText
        primary={event.title}
        secondary={formatStart(event.startsAt)}
      />
      <Chip
        size="small"
        label={uk.importance[event.importance]}
        sx={{
          bgcolor: IMPORTANCE_COLORS[event.importance],
          color: "#ffffff",
        }}
      />
    </>
  );

  return (
    <ListItem disablePadding divider data-testid="event-list-item">
      {onSelect ? (
        <ListItemButton onClick={() => onSelect(event)}>
          {content}
        </ListItemButton>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            px: 2,
            py: 1,
          }}
        >
          {content}
        </Box>
      )}
    </ListItem>
  );
}

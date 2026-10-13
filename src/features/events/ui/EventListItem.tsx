"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import type { EventDto } from "../lib/event-service";
import { presentationOf } from "./importance";

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
  const importance = presentationOf(event.importance);
  const content = (
    <>
      <Box
        aria-hidden
        sx={{
          width: 6,
          alignSelf: "stretch",
          borderRadius: 1,
          mr: 2,
          bgcolor: importance.color,
        }}
      />
      <ListItemText
        primary={event.title}
        secondary={formatStart(event.startsAt)}
      />
      <Chip
        size="small"
        label={importance.label}
        sx={{
          bgcolor: importance.color,
          color: importance.textColor,
        }}
      />
    </>
  );

  return (
    <ListItem
      disablePadding
      divider
      // The list's border closes the last row; its own divider would show
      // as a stray line under the rounded card.
      sx={{ "&:last-of-type": { borderBottom: 0 } }}
      data-testid="event-list-item"
    >
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

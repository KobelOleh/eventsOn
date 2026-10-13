import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import { uk } from "@/shared/i18n/uk";

/** Height of a List row (two text lines), so rows do not jump when loaded. */
const ROW_HEIGHT = 72;
const ROWS = 5;

/** A rounded-pill placeholder, sized to the control it stands in for. */
function PillSkeleton({ width, height }: { width: number; height: number }) {
  return (
    <Skeleton
      variant="rounded"
      width={width}
      height={height}
      sx={{ borderRadius: 999 }}
    />
  );
}

/** Placeholder rows shaped like EventListItem. */
export function EventListSkeleton() {
  return (
    <Paper variant="outlined" role="status" aria-label={uk.list.loading}>
      <List disablePadding>
        {Array.from({ length: ROWS }, (_, i) => (
          <ListItem
            key={i}
            divider={i < ROWS - 1}
            sx={{ height: ROW_HEIGHT, gap: 2, px: 2 }}
          >
            <Skeleton
              variant="rounded"
              width={6}
              height={40}
              sx={{ flexShrink: 0 }}
            />
            <Box sx={{ flexGrow: 1 }}>
              <Skeleton width="45%" height={24} />
              <Skeleton width="30%" height={20} />
            </Box>
            <PillSkeleton width={76} height={24} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

/** Placeholder for the calendar grid while FullCalendar mounts on the client. */
export function CalendarGridSkeleton() {
  return (
    <Box
      role="status"
      aria-label={uk.events.loading}
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Skeleton width={160} height={36} />
        <PillSkeleton width={150} height={36} />
      </Box>
      <Skeleton variant="rounded" height={520} />
    </Box>
  );
}

/** Whole-workspace placeholder: switchers, filters and a calendar grid. */
export function EventsWorkspaceSkeleton() {
  return (
    <Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <PillSkeleton width={190} height={38} />
        <PillSkeleton width={230} height={38} />
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <PillSkeleton width={330} height={32} />
        <PillSkeleton width={260} height={40} />
      </Box>
      <CalendarGridSkeleton />
    </Box>
  );
}

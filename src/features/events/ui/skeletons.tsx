import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import { uk } from "@/shared/i18n/uk";

/** Height of a List row (two text lines), so rows do not jump when loaded. */
const ROW_HEIGHT = 72;

/** Placeholder rows shaped like EventListItem. */
export function EventListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Paper
      variant="outlined"
      role="status"
      aria-label={uk.list.loading}
      aria-busy
    >
      <List disablePadding>
        {Array.from({ length: rows }, (_, i) => (
          <ListItem
            key={i}
            divider={i < rows - 1}
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
            <Skeleton
              variant="rounded"
              width={76}
              height={24}
              sx={{ borderRadius: 999 }}
            />
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
      aria-busy
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
        <Skeleton
          variant="rounded"
          width={150}
          height={36}
          sx={{ borderRadius: 999 }}
        />
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
        <Skeleton
          variant="rounded"
          width={190}
          height={38}
          sx={{ borderRadius: 999 }}
        />
        <Skeleton
          variant="rounded"
          width={230}
          height={38}
          sx={{ borderRadius: 999 }}
        />
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <Skeleton
          variant="rounded"
          width={330}
          height={32}
          sx={{ borderRadius: 999 }}
        />
        <Skeleton
          variant="rounded"
          width={260}
          height={40}
          sx={{ borderRadius: 999 }}
        />
      </Box>
      <CalendarGridSkeleton />
    </Box>
  );
}

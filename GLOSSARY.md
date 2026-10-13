# EventsOn

A web app where signed-in users plan their own Events and view them in a calendar or as a list.

## Language

**Event**:
A planned occurrence a user wants to remember, with a title, a start date and time, an optional description and an Importance.
_Avoid_: Task, meeting, reminder, appointment

**Owner**:
The user an Event belongs to. Only the Owner can see, change or delete the Event.
_Avoid_: Author, creator, member

**Importance**:
How much an Event matters to its Owner: **Normal**, **Important** or **Critical**. Shown in Ukrainian as «звичайна», «важлива», «критична».
_Avoid_: Priority, severity, level

**Calendar view**:
Showing the Owner's Events placed on a month, week or day grid.

**List view**:
Showing the Owner's Events as a paged list sorted by start time.
_Avoid_: Table view, agenda

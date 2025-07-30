import {
  Card,
  Image,
  Text,
  Container,
  Modal,
  Badge,
  Button,
  Group,
  Stack,
  Divider,
  Grid,
  Skeleton,
  Select,
  SegmentedControl,
  Box,
  Paper,
  ActionIcon,
  ThemeIcon,
  Timeline,
  Title,
  TextInput,
  rem,
  AppShell,
  Collapse,
  CloseButton,
  Center,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment-timezone";
import { modals } from "@mantine/modals";
import { Calendar } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import DOMPurify from "isomorphic-dompurify";
import {
  IconCalendarEvent,
  IconList,
  IconSearch,
  IconClockHour2,
  IconFilter,
  IconUser,
  IconUsers,
  IconArrowNarrowRight,
  IconCheck,
  IconCalendarStats,
  IconCalendarDue,
  IconMapPin,
  IconX,
  IconBrandZoom,
  IconCalendarTime,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";

import { getServerTime } from "../../../utils/getServerTime";

// Define an interface for the event object
interface Event {
  eventID: string;
  eventTitle: string;
  eventImage: string;
  eventStart: string;
  eventEnd: string;
  isFreeEvent: boolean;
  eventDesc: string;
  isApproved: boolean;
  going: number;
  eventType: string;
  meetingLink: string;
  submittedBy: string;
  submittedByName?: string;
}

// New interface for filter options
interface FilterOptions {
  eventType: string | null;
  isFreeEvent: string | null;
  eventStatus: string;
  searchQuery: string;
}

export function EventsCardsGrid() {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [attendingEventIDs, setAttendingEventIDs] = useState<string[]>([]);
  const [currentUserID, setCurrentUserID] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [attendanceCounts, setAttendanceCounts] = useState<{
    [key: string]: number;
  }>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState<Event[]>(
    []
  );
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [viewMode, setViewMode] = useState<"calendar" | "timeline">("calendar");
  const [advancedFiltersOpen, { toggle: toggleAdvancedFilters }] =
    useDisclosure(false);
  
  const [serverNow, setServerNow] = useState<moment.Moment | null>(null);

  useEffect(() => {
    getServerTime("datetime")
      .then((datetime) => setServerNow(moment.tz(datetime, "Asia/Manila")))
      .catch(() => setServerNow(moment.tz("Asia/Manila")));
  }, []);
  
    // Filter states
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    eventType: null,
    isFreeEvent: null,
    eventStatus: "active",
    searchQuery: "",
  });

  const showNotification = (title: string, message: string, color: string) => {
    notifications.show({
      title,
      message,
      color,
      autoClose: 5000,
    });
  };

  // Fetch the current user ID from the API
  const fetchCurrentUserID = async () => {
    try {
      const response = await axios.get("/api/get_current_userid");
      if (response.data && response.data.userID) {
        setCurrentUserID(response.data.userID);
      } else {
        console.error("User ID not found in response:", response.data);
      }
    } catch (error) {
      console.error("Error fetching current user ID:", error);
    }
  };

  // Fetch the list of event IDs the user is attending
  const fetchAttendingEvents = async (userID: string) => {
    try {
      const response = await axios.get("/api/check_event_attendance", {
        params: { userID },
      });
      const eventIDs = response.data.eventIDs.map(
        (event: any) => event.eventID
      );
      setAttendingEventIDs(eventIDs);
    } catch (error) {
      console.error("Error fetching attending events:", error);
    }
  };

  const fetchUserProfile = async (userID: string) => {
    try {
      const response = await axios.get(
        `/api/get_user_profile?userID=${userID}`
      );
      return response.data.userProfile;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  const getNow = () => serverNow

  // Fetch events from the API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/get_events");
      const events = response.data.events;
      const now = getNow();

      const upcomingEvents = events.filter((event: Event) => {
        return moment(event.eventEnd).tz("Asia/Manila").isAfter(now);
      });

      const finishedEvents = events.filter((event: Event) => {
        return moment(event.eventEnd).tz("Asia/Manila").isBefore(now);
      });

      const sortedUpcomingEvents = upcomingEvents.sort((a: Event, b: Event) => {
        return (
          new Date(a.eventStart).getTime() - new Date(b.eventStart).getTime()
        );
      });

      const sortedFinishedEvents = finishedEvents.sort((a: Event, b: Event) => {
        return (
          new Date(b.eventStart).getTime() - new Date(a.eventStart).getTime()
        );
      });

      // Fetch user profiles for each event
      const profiles: { [key: string]: any } = {};
      for (const event of events) {
        if (!profiles[event.submittedBy]) {
          const profile = await fetchUserProfile(event.submittedBy);
          if (profile) {
            profiles[event.submittedBy] = profile;
          }
        }
      }

      const eventsWithUserNames = [
        ...sortedUpcomingEvents,
        ...sortedFinishedEvents,
      ].map((event: Event) => ({
        ...event,
        submittedByName: profiles[event.submittedBy]
          ? `${profiles[event.submittedBy].first_name} ${
              profiles[event.submittedBy].last_name
            }`
          : "Unknown",
      }));

      setEvents(eventsWithUserNames);
      setFilteredEvents(sortedUpcomingEvents);

      // Set featured events (first 3 upcoming events)
      setFeaturedEvents(sortedUpcomingEvents.slice(0, 3));

      // Set upcoming events (next 10 events after featured)
      setUpcomingEvents(sortedUpcomingEvents.slice(3, 13));

      updateEventsForSelectedDate(
        selectedDate || new Date(),
        sortedUpcomingEvents
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchCurrentUserID();
    };
    initialize();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (currentUserID) {
        await fetchAttendingEvents(currentUserID);
        await fetchEvents();
      }
    };
    fetchData();
  }, [currentUserID]);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    open();
  };

  const fetchAttendanceCount = async (eventID: string) => {
    try {
      const response = await axios.get("/api/get_attendance_count", {
        params: { eventID },
      });
      setAttendanceCounts((prevCounts) => ({
        ...prevCounts,
        [eventID]: response.data.count,
      }));
    } catch (error) {
      console.error("Error fetching attendance count:", error);
    }
  };

  useEffect(() => {
    const fetchAttendanceCountsForAllEvents = async () => {
      const now = getNow();

      for (const event of events) {
        const endDate = moment(event.eventEnd).tz("Asia/Manila");
        if (!now) {
          continue;
        }
        const isFinished = now.isAfter(endDate);

        // Skip fetching if attendance is already recorded for finished events
        if (isFinished && attendanceCounts[event.eventID]) {
          continue;
        }

        try {
          const response = await axios.get("/api/get_attendance_count", {
            params: { eventID: event.eventID },
          });

          setAttendanceCounts((prevCounts) => ({
            ...prevCounts,
            [event.eventID]: response.data.count,
          }));
        } catch (error) {
          console.error(
            "Error fetching attendance count for eventID",
            event.eventID,
            ":",
            error
          );
        }
      }
    };

    if (events.length > 0) {
      fetchAttendanceCountsForAllEvents();
    }
  }, [events]);

  const handleAttendEvent = async (event: Event) => {
    try {
      await axios.post("/api/insert_attendee", {
        eventID: event.eventID,
        userID: currentUserID,
        saveToUser: event.eventType === "Online" ? event.meetingLink : null,
        eventType: event.eventType,
      });

      showNotification(
        "Registration Successful",
        `You've registered for "${event.eventTitle}". Check My Events for details.`,
        "green"
      );

      // Update the attending events list
      await fetchAttendingEvents(currentUserID!);
    } catch (error) {
      console.error("Error attending event:", error);
      showNotification(
        "Registration Failed",
        "Could not register for the event. Please try again.",
        "red"
      );
    }
  };

  const showConfirmationModal = (event: Event) => {
    modals.openConfirmModal({
      title: "Confirm Registration",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to register for &quot;{event.eventTitle}&quot;?
          {event.eventType === "Online" && (
            <Text mt="xs" c="dimmed">
              You&apos;ll receive access to the online meeting link after
              registration.
            </Text>
          )}
        </Text>
      ),
      labels: { confirm: "Register Now", cancel: "Cancel" },
      confirmProps: { color: "teal" },
      onConfirm: () => {
        handleAttendEvent(event);
      },
    });
  };

  // Apply filters to events
  useEffect(() => {
    if (events.length === 0) return;

    const now = getNow();

    // Filter approved events
    let filteredResults = events.filter((event) => event.isApproved);

    // Apply search query
    if (filterOptions.searchQuery.trim()) {
      const query = filterOptions.searchQuery.toLowerCase().trim();
      filteredResults = filteredResults.filter(
        (event) =>
          event.eventTitle.toLowerCase().includes(query) ||
          event.eventDesc.toLowerCase().includes(query) ||
          event.submittedByName?.toLowerCase().includes(query)
      );
    }

    // Apply event type filter
    if (filterOptions.eventType) {
      filteredResults = filteredResults.filter(
        (event) => event.eventType === filterOptions.eventType
      );
    }

    // Apply free/paid filter
    if (filterOptions.isFreeEvent !== null) {
      const isFree = filterOptions.isFreeEvent === "free";
      filteredResults = filteredResults.filter(
        (event) => event.isFreeEvent === isFree
      );
    }

    // Apply active/finished filter
    if (filterOptions.eventStatus !== "all") {
      if (filterOptions.eventStatus === "active") {
        filteredResults = filteredResults.filter((event) =>
          moment(event.eventEnd).tz("Asia/Manila").isAfter(now)
        );
      } else if (filterOptions.eventStatus === "finished") {
        filteredResults = filteredResults.filter((event) =>
          moment(event.eventEnd).tz("Asia/Manila").isBefore(now)
        );
      }
    }

    // Sort by start date
    filteredResults = filteredResults.sort((a, b) => {
      if (filterOptions.eventStatus === "finished") {
        // For finished events, show most recent first
        return (
          new Date(b.eventStart).getTime() - new Date(a.eventStart).getTime()
        );
      } else {
        // For upcoming events, show soonest first
        return (
          new Date(a.eventStart).getTime() - new Date(b.eventStart).getTime()
        );
      }
    });

    setFilteredEvents(filteredResults);

    // Update events for the currently selected date
    if (selectedDate) {
      updateEventsForSelectedDate(selectedDate, filteredResults);
    }
  }, [events, filterOptions, selectedDate]);

  // Function to update the displayed events for the selected date
  const updateEventsForSelectedDate = (date: Date, eventsList: Event[]) => {
    const selectedDateEvents = eventsList.filter((event) => {
      const eventStartDate = moment(event.eventStart).tz("Asia/Manila");
      const eventEndDate = moment(event.eventEnd).tz("Asia/Manila");
      const selectedMoment = moment(date).tz("Asia/Manila").startOf("day");

      // Check if the selected date falls within event start and end dates
      return selectedMoment.isBetween(
        eventStartDate.clone().startOf("day"),
        eventEndDate.clone().startOf("day"),
        "day",
        "[]"
      );
    });

    setEventsForSelectedDate(selectedDateEvents);
  };

  // Handler for calendar date change
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    updateEventsForSelectedDate(date, filteredEvents);
  };

  // Handler for month navigation
  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
  };

  // Function to determine if a day has events
  const getDayProps = (date: Date) => {
    const hasEvent = filteredEvents.some((event) => {
      const eventStartDate = moment(event.eventStart)
        .tz("Asia/Manila")
        .startOf("day");
      const eventEndDate = moment(event.eventEnd)
        .tz("Asia/Manila")
        .startOf("day");
      const checkDate = moment(date).tz("Asia/Manila").startOf("day");

      return checkDate.isBetween(eventStartDate, eventEndDate, undefined, "[]");
    });

    const isToday = moment(date)
      .tz("Asia/Manila")
      .startOf("day")
      .isSame(moment().tz("Asia/Manila").startOf("day"));

    if (hasEvent) {
      return {
        style: {
          backgroundColor: "#f0f9ff",
          color: "#0369a1",
          fontWeight: 600,
        },
        onClick: () => handleDateChange(date),
      };
    }

    return { onClick: () => handleDateChange(date) };
  };

  // Format event time
  const formatEventTime = (start: string, end: string) => {
    const startTime = moment(start).tz("Asia/Manila");
    const endTime = moment(end).tz("Asia/Manila");

    if (startTime.isSame(endTime, "day")) {
      return `${startTime.format("MMM D, YYYY")} • ${startTime.format(
        "h:mm a"
      )} - ${endTime.format("h:mm a")}`;
    } else {
      return `${startTime.format("MMM D")} - ${endTime.format(
        "MMM D, YYYY"
      )} • ${startTime.format("h:mm a")} - ${endTime.format("h:mm a")}`;
    }
  };

  // Determine event status
  const getEventStatus = (event: Event) => {
    const now = getNow();
    const startTime = moment(event.eventStart).tz("Asia/Manila");
    const endTime = moment(event.eventEnd).tz("Asia/Manila");

    if (!now) {
      return { status: "unknown", color: "gray", label: "Unknown" };
    }
    if (now.isBefore(startTime)) {
      return { status: "upcoming", color: "blue", label: "Upcoming" };
    } else if (now.isBetween(startTime, endTime)) {
      return { status: "ongoing", color: "green", label: "Happening Now" };
    } else {
      return { status: "finished", color: "gray", label: "Ended" };
    }
  };

  // Get time until event
  const getTimeUntilEvent = (event: Event) => {
    const now = getNow();
    const startTime = moment(event.eventStart).tz("Asia/Manila");

    if (!now || now.isAfter(startTime)) {
      return null;
    }

    const duration = moment.duration(startTime.diff(now));
    const days = Math.floor(duration.asDays());

    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} from now`;
    }

    const hours = Math.floor(duration.asHours());
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} from now`;
    }

    const minutes = Math.floor(duration.asMinutes());
    return `${minutes} minute${minutes > 1 ? "s" : ""} from now`;
  };

  // Render calendar view
  const renderCalendarView = () => {
    return (
      <Stack gap="md">
        <Grid>
          <Grid.Col span={{ base: 4, sm: 12, md: 12, lg: 4 }}>
            {" "}
            <Paper p="md" withBorder>
              <Calendar
                size="lg"
                date={selectedDate || undefined}
                defaultDate={selectedDate || currentMonth}
                onDateChange={(date) => {
                  setSelectedDate(date);
                  updateEventsForSelectedDate(date, filteredEvents);
                }}
                getDayProps={getDayProps}
                styles={(theme) => ({
                  day: {
                    borderRadius: theme.radius.sm,
                    height: rem(40),
                    fontSize: theme.fontSizes.sm,
                  },
                  weekday: {
                    fontSize: theme.fontSizes.sm,
                  },
                  calendarHeader: {
                    marginBottom: rem(10),
                  },
                })}
                renderDay={(date) => {
                  const day = date.getDate();
                  const hasEvent = filteredEvents.some((event) => {
                    const eventStartDate = moment(event.eventStart)
                      .tz("Asia/Manila")
                      .startOf("day");
                    const eventEndDate = moment(event.eventEnd)
                      .tz("Asia/Manila")
                      .startOf("day");
                    const checkDate = moment(date)
                      .tz("Asia/Manila")
                      .startOf("day");

                    return checkDate.isBetween(
                      eventStartDate,
                      eventEndDate,
                      undefined,
                      "[]"
                    );
                  });

                  return (
                    <div>
                      <div>{day}</div>
                      {hasEvent && (
                        <div
                          style={{
                            width: "4px",
                            height: "4px",
                            backgroundColor: "#0369a1",
                            borderRadius: "50%",
                            margin: "0 auto",
                            marginTop: "2px",
                          }}
                        />
                      )}
                    </div>
                  );
                }}
              />
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 8, sm: 12, md: 12, lg: 8 }}>
            {selectedDate && (
              <Stack gap="md">
                <Paper p="md" withBorder>
                  <Title order={6}>
                    Events on {moment(selectedDate).format("MMMM D, YYYY")}
                  </Title>
                </Paper>

                {eventsForSelectedDate.length === 0 ? (
                  <Paper p="md" withBorder>
                    <Text ta="center">No events on this date</Text>
                  </Paper>
                ) : (
                  eventsForSelectedDate.map((event) => {
                    const eventStatus = getEventStatus(event);
                    const isAttending = attendingEventIDs.includes(
                      event.eventID
                    );
                    const timeUntil = getTimeUntilEvent(event);

                    return (
                      <Paper key={event.eventID} p="md" withBorder radius="md">
                        {/* Header with badges */}
                        <Group justify="space-between" mb="md">
                          <Group gap="xs">
                            <Badge color={eventStatus.color}>
                              {eventStatus.label}
                            </Badge>
                            {event.isFreeEvent ? (
                              <Badge color="green" variant="light">
                                Free
                              </Badge>
                            ) : (
                              <Badge color="yellow" variant="light">
                                Paid
                              </Badge>
                            )}
                            <Badge color="blue" variant="light">
                              {event.eventType}
                            </Badge>
                            {isAttending && (
                              <Badge
                                color="teal"
                                leftSection={<IconCheck size={14} />}
                              >
                                Registered
                              </Badge>
                            )}
                          </Group>
                        </Group>

                        {/* Main content */}
                        <Grid gutter="md">
                          {/* Event image */}
                          <Grid.Col span={{ base: 12, sm: 3 }}>
                            <Image
                              src={`https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${event.eventImage}`}
                              radius="md"
                              height={120}
                              alt={event.eventTitle}
                            />
                          </Grid.Col>

                          {/* Event details */}
                          <Grid.Col span={{ base: 12, sm: 9 }}>
                            <Stack gap="xs">
                              <Text fw={700} size="lg">
                                {event.eventTitle}
                              </Text>

                              {/* Time information */}
                              <Group gap="xs">
                                <IconClockHour2
                                  size={16}
                                  style={{ opacity: 0.7 }}
                                />
                                <Text size="sm">
                                  {moment(event.eventStart)
                                    .tz("Asia/Manila")
                                    .format("h:mm a")}{" "}
                                  -
                                  {moment(event.eventEnd)
                                    .tz("Asia/Manila")
                                    .format("h:mm a")}
                                </Text>
                              </Group>

                              {/* Location information */}
                              {event.eventType === "Face to Face" && (
                                <Group gap="xs">
                                  <IconMapPin
                                    size={16}
                                    style={{ opacity: 0.7 }}
                                  />
                                  <Text size="sm">On-site Event</Text>
                                </Group>
                              )}

                              {event.eventType === "Online" && (
                                <Group gap="xs">
                                  <IconBrandZoom
                                    size={16}
                                    style={{ opacity: 0.7 }}
                                  />
                                  <Text size="sm">Virtual Meeting</Text>
                                </Group>
                              )}

                              {/* Organizer information */}
                              <Group gap="xs">
                                <IconUser size={16} style={{ opacity: 0.7 }} />
                                <Text size="sm">
                                  Organized by {event.submittedByName}
                                </Text>
                              </Group>

                              {/* Attendance information */}
                              <Group gap="xs">
                                <IconUsers size={16} style={{ opacity: 0.7 }} />
                                <Text size="sm">
                                  {attendanceCounts[event.eventID] ||
                                    event.going ||
                                    0}{" "}
                                  people registered
                                </Text>
                              </Group>

                              {/* Time until event */}
                              {timeUntil && (
                                <Text size="sm" fw={500} c="blue">
                                  {timeUntil}
                                </Text>
                              )}
                            </Stack>
                          </Grid.Col>
                        </Grid>

                        {/* Event description - limited preview */}
                        <Paper p="xs" mt="md" bg="gray.0">
                          <Text size="sm" lineClamp={3}>
                            {event.eventDesc ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(
                                    event.eventDesc
                                      .replace(/<\/?[^>]+(>|$)/g, " ")
                                      .substring(0, 200) +
                                      (event.eventDesc.length > 200
                                        ? "..."
                                        : "")
                                  ),
                                }}
                              />
                            ) : (
                              <Text c="dimmed">No description available</Text>
                            )}
                          </Text>
                        </Paper>

                        {/* Action buttons */}
                        <Group justify="flex-end" mt="md">
                          <Button
                            variant="light"
                            onClick={() => handleEventClick(event)}
                          >
                            View Full Details
                          </Button>
                          {!isAttending &&
                            eventStatus.status === "upcoming" && (
                              <Button
                                color="blue"
                                onClick={() => showConfirmationModal(event)}
                              >
                                Register
                              </Button>
                            )}
                        </Group>
                      </Paper>
                    );
                  })
                )}
              </Stack>
            )}
          </Grid.Col>
        </Grid>
      </Stack>
    );
  };

  // Render timeline view
  const renderTimelineView = () => {
    if (filteredEvents.length === 0) {
      return (
        <Paper p="xl" radius="md" withBorder shadow="sm">
          <Center>
            <Stack align="center" gap="md">
              <IconCalendarEvent size={64} opacity={0.3} color="#e0e0e0" />
              <Text ta="center" size="lg" fw={500}>
                No events found
              </Text>
              <Text ta="center" c="dimmed">
                There are no events matching your current filters.
              </Text>
              <Button
                variant="light"
                onClick={() =>
                  setFilterOptions({
                    eventType: null,
                    isFreeEvent: null,
                    eventStatus: "active",
                    searchQuery: "",
                  })
                }
              >
                Clear Filters
              </Button>
            </Stack>
          </Center>
        </Paper>
      );
    }

    // Group events by month
    const groupedEvents: { [key: string]: Event[] } = {};
    filteredEvents.forEach((event) => {
      const month = moment(event.eventStart)
        .tz("Asia/Manila")
        .format("MMMM YYYY");
      if (!groupedEvents[month]) {
        groupedEvents[month] = [];
      }
      groupedEvents[month].push(event);
    });

    // Custom bullet component - day card
    const DayCard = ({
      date,
      eventStatus,
    }: {
      date: moment.Moment;
      eventStatus: any;
    }) => {
      const day = date.format("D");
      const weekday = date.format("ddd");

      // Determine color based on event status
      let backgroundColor = "#f5f5f5";
      let textColor = "#333333";

      if (eventStatus.status === "ongoing") {
        backgroundColor = "#e6f4ea";
        textColor = "#146a3e";
      } else if (eventStatus.status === "upcoming") {
        backgroundColor = "white";
        textColor = "#146a3e";
      }

      return (
        <Box
          style={{
            width: "48px",
            height: "48px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor,
            color: textColor,
            borderRadius: "8px", // Replace theme.radius.md with a fixed value
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            border: "1px solid rgba(0,0,0,0.08)",
            fontWeight: 600,
            transition: "transform 0.2s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <Text size="xs" fw={700}>
            {weekday.toUpperCase()}
          </Text>
          <Text size="xl" fw={700} lh={1}>
            {day}
          </Text>
        </Box>
      );
    };

    return (
      <Stack gap="xl" style={{ borderRadius: 16 }}>
        {Object.keys(groupedEvents).map((month) => (
          <Box key={month}>
            <Paper
              p="xs"
              radius="md"
              withBorder={false}
              shadow="xs"
              mb="xl"
              bg="white"
            >
              <Group bg="#f1f8e9" p="xs" gap={0}>
                <IconCalendarDue color="#146a3e" />
                <Title order={3} p="xs" c="#146a3e">
                  {" "}
                  {month}
                </Title>
              </Group>
            </Paper>

            <Timeline
              active={-1}
              bulletSize={48}
              lineWidth={2}
              color="#146a3e"
              styles={(theme) => ({
                item: {
                  paddingBottom: "2rem",
                },
                itemBullet: {
                  boxShadow: "none",
                  border: "none",
                  backgroundColor: "transparent",
                },
              })}
            >
              {groupedEvents[month].map((event, index) => {
                const eventStatus = getEventStatus(event);
                const timeUntil = getTimeUntilEvent(event);
                const isAttending = attendingEventIDs.includes(event.eventID);
                const startDate = moment(event.eventStart).tz("Asia/Manila");

                return (
                  <Timeline.Item
                    key={event.eventID}
                    bullet={
                      <DayCard date={startDate} eventStatus={eventStatus} />
                    }
                    color="#146a3e"
                    lineVariant="solid"
                  >
                    <Paper
                      p="md"
                      radius="md"
                      withBorder
                      shadow="sm"
                      ml="sm"
                      style={{
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        transform: "translateY(0)",
                        boxShadow: "none",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0px 4px 6px rgba(0, 0, 0, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <Grid gutter="md">
                        <Grid.Col span={{ base: 12, md: 3 }}>
                          <Image
                            src={`https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${event.eventImage}`}
                            radius="md"
                            height={150}
                            alt={event.eventTitle}
                          />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 9 }}>
                          <Stack gap="xs" h="100%">
                            <Group justify="space-between" wrap="nowrap">
                              <Group gap="xs">
                                <Badge
                                  color={eventStatus.color}
                                  variant="light"
                                  radius="sm"
                                >
                                  {eventStatus.label}
                                </Badge>
                                {event.isFreeEvent ? (
                                  <Badge
                                    color="green"
                                    variant="light"
                                    radius="sm"
                                  >
                                    Free
                                  </Badge>
                                ) : (
                                  <Badge
                                    color="yellow"
                                    variant="light"
                                    radius="sm"
                                  >
                                    Paid
                                  </Badge>
                                )}
                                <Badge color="blue" variant="light" radius="sm">
                                  {event.eventType}
                                </Badge>
                              </Group>
                              {isAttending && (
                                <Badge
                                  color="#146a3e"
                                  variant="light"
                                  radius="sm"
                                  leftSection={<IconCheck size={14} />}
                                >
                                  Registered
                                </Badge>
                              )}
                            </Group>

                            <Title
                              order={4}
                              fw={600}
                              style={{ cursor: "pointer" }}
                              onClick={() => handleEventClick(event)}
                            >
                              {event.eventTitle}
                            </Title>

                            <Group gap="xs">
                              <IconClockHour2
                                size={16}
                                style={{ color: "#146a3e" }}
                              />
                              <Text size="sm" c="dimmed">
                                {startDate.format("h:mm a")} -{" "}
                                {moment(event.eventEnd)
                                  .tz("Asia/Manila")
                                  .format("h:mm a")}
                              </Text>
                            </Group>

                            {event.eventType === "Face to Face" && (
                              <Group gap="xs">
                                <IconMapPin
                                  size={16}
                                  style={{ color: "#146a3e" }}
                                />
                                <Text size="sm" c="dimmed">
                                  On-site Event
                                </Text>
                              </Group>
                            )}

                            {event.eventType === "Online" && (
                              <Group gap="xs">
                                <IconBrandZoom
                                  size={16}
                                  style={{ color: "#146a3e" }}
                                />
                                <Text size="sm" c="dimmed">
                                  Virtual Meeting
                                </Text>
                              </Group>
                            )}

                            <Group gap="xs">
                              <IconUser
                                size={16}
                                style={{ color: "#146a3e" }}
                              />
                              <Text size="sm" c="dimmed">
                                Organized by {event.submittedByName}
                              </Text>
                            </Group>

                            <Group mt="xs">
                              {timeUntil && (
                                <Badge
                                  size="sm"
                                  radius="sm"
                                  variant="dot"
                                  color="blue"
                                >
                                  {timeUntil}
                                </Badge>
                              )}
                            </Group>

                            <Divider my="sm" />
                            <Group gap="xs" mt="auto" justify="flex-end">
                              <Button
                                variant="light"
                                color="#146a3e"
                                size="sm"
                                onClick={() => handleEventClick(event)}
                              >
                                View Details
                              </Button>
                              {!isAttending &&
                                eventStatus.status === "upcoming" && (
                                  <Button
                                    variant="filled"
                                    color="#146a3e"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      showConfirmationModal(event);
                                    }}
                                  >
                                    Register
                                  </Button>
                                )}
                            </Group>
                          </Stack>
                        </Grid.Col>
                      </Grid>
                    </Paper>
                  </Timeline.Item>
                );
              })}
            </Timeline>
          </Box>
        ))}
      </Stack>
    );
  };

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <Container size="lg" pl={0} pr={0}>
        <Card shadow="sm" p="md" ml={0} mr={0} radius="md" withBorder mb="lg">
          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <TextInput
                placeholder="Search events by title, description, or organizer"
                leftSection={<IconSearch size={16} />}
                value={filterOptions.searchQuery}
                onChange={(e) =>
                  setFilterOptions({
                    ...filterOptions,
                    searchQuery: e.currentTarget.value,
                  })
                }
                rightSection={
                  filterOptions.searchQuery ? (
                    <ActionIcon
                      onClick={() =>
                        setFilterOptions({
                          ...filterOptions,
                          searchQuery: "",
                        })
                      }
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  ) : null
                }
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Group grow>
                <Button
                  variant="light"
                  leftSection={<IconFilter size={16} />}
                  onClick={toggleAdvancedFilters}
                >
                  {advancedFiltersOpen ? "Hide Filters" : "Filters"}
                </Button>
                <Select
                  placeholder="Filter Status"
                  data={[
                    { value: "active", label: "Upcoming Events" },
                    { value: "finished", label: "Past Events" },
                    { value: "all", label: "All Events" },
                  ]}
                  value={filterOptions.eventStatus}
                  onChange={(value) =>
                    setFilterOptions({
                      ...filterOptions,
                      eventStatus: value || "active",
                    })
                  }
                />
              </Group>
            </Grid.Col>
          </Grid>

          <Collapse in={advancedFiltersOpen}>
            <Divider my="md" />
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label="Event Type"
                  placeholder="All types"
                  clearable
                  data={[
                    { value: "Face to Face", label: "Face to Face" },
                    { value: "Online", label: "Online" },
                  ]}
                  value={filterOptions.eventType}
                  onChange={(value) =>
                    setFilterOptions({
                      ...filterOptions,
                      eventType: value,
                    })
                  }
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label="Price"
                  placeholder="All events"
                  clearable
                  data={[
                    { value: "free", label: "Free Events Only" },
                    { value: "paid", label: "Paid Events Only" },
                  ]}
                  value={filterOptions.isFreeEvent}
                  onChange={(value) =>
                    setFilterOptions({
                      ...filterOptions,
                      isFreeEvent: value,
                    })
                  }
                />
              </Grid.Col>
            </Grid>
            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                onClick={() =>
                  setFilterOptions({
                    eventType: null,
                    isFreeEvent: null,
                    eventStatus: "active",
                    searchQuery: "",
                  })
                }
              >
                Clear All Filters
              </Button>
            </Group>
          </Collapse>
        </Card>

        {loading ? (
          <Stack>
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} height={160} radius="md" />
              ))}
          </Stack>
        ) : (
          <>
            {/* Main Event Content */}
            <Box>
              <Group justify="space-between" mb="md">
                <Title order={2}>
                  {filterOptions.eventStatus === "active"
                    ? "Upcoming Events"
                    : filterOptions.eventStatus === "finished"
                    ? "Past Events"
                    : "All Events"}
                </Title>
                <SegmentedControl
                  value={viewMode}
                  onChange={(value) =>
                    setViewMode(value as "calendar" | "timeline")
                  }
                  data={[
                    {
                      value: "calendar",
                      label: (
                        <Center>
                          <IconCalendarEvent size={16} />
                          <Box ml={10}>Calendar</Box>
                        </Center>
                      ),
                    },
                    {
                      value: "timeline",
                      label: (
                        <Center>
                          <IconCalendarStats size={16} />
                          <Box ml={10}>Timeline</Box>
                        </Center>
                      ),
                    },
                  ]}
                />
              </Group>

              {viewMode === "calendar" && renderCalendarView()}
              {viewMode === "timeline" && renderTimelineView()}
            </Box>
          </>
        )}
      </Container>

      {/* Event Detail Modal */}
      <Modal
        opened={opened}
        onClose={close}
        size="70%"
        centered
        overlayProps={{ blur: 3 }}
        styles={{
          content: {
            padding: 0,
            borderRadius: 12,
          },
          header: {
            display: "none",
          },
        }}
      >
        {selectedEvent && (
          <>
            {/* Event Image Header */}
            <Box
              pos="relative"
              h={200}
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url(https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${selectedEvent.eventImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <Box p="md" pos="absolute" top={0} right={0}>
                <CloseButton
                  onClick={close}
                  color="white"
                  variant="transparent"
                  size="lg"
                />
              </Box>

              <Box p="xl" pos="absolute" bottom={0} left={0} right={0}>
                <Group gap="xs" mb="xs">
                  {selectedEvent.isFreeEvent ? (
                    <Badge color="green" size="lg">
                      Free
                    </Badge>
                  ) : (
                    <Badge color="yellow" size="lg">
                      Paid
                    </Badge>
                  )}
                  <Badge color="blue" size="lg">
                    {selectedEvent.eventType}
                  </Badge>
                  {getEventStatus(selectedEvent).status === "ongoing" && (
                    <Badge color="green" size="lg">
                      Happening Now
                    </Badge>
                  )}
                </Group>

                <Title order={2} c="white">
                  {selectedEvent.eventTitle}
                </Title>
              </Box>
            </Box>

            {/* Event Content */}
            <Grid p="md">
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Stack>
                  <Paper p="md" withBorder>
                    <Title order={4} c="teal" mb="md">
                      Event Details
                    </Title>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                          selectedEvent.eventDesc || ""
                        ),
                      }}
                    />
                  </Paper>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 4 }}>
                <Stack>
                  <Paper p="md" withBorder>
                    <Stack gap="md">
                      <Group gap="xs">
                        <ThemeIcon color="blue" variant="light" size="lg">
                          <IconCalendarEvent size={20} />
                        </ThemeIcon>
                        <Stack gap={0}>
                          <Text fw={500}>Date & Time</Text>
                          <Text size="sm" c="dimmed">
                            {formatEventTime(
                              selectedEvent.eventStart,
                              selectedEvent.eventEnd
                            )}
                          </Text>
                        </Stack>
                      </Group>

                      <Group gap="xs">
                        <ThemeIcon color="blue" variant="light" size="lg">
                          {selectedEvent.eventType === "Online" ? (
                            <IconBrandZoom size={20} />
                          ) : (
                            <IconMapPin size={20} />
                          )}
                        </ThemeIcon>
                        <Stack gap={0}>
                          <Text fw={500}>Location</Text>
                          <Text size="sm" c="dimmed">
                            {selectedEvent.eventType === "Online"
                              ? "Virtual Meeting"
                              : "Face to Face Event"}
                          </Text>
                        </Stack>
                      </Group>

                      <Group gap="xs">
                        <ThemeIcon color="blue" variant="light" size="lg">
                          <IconUser size={20} />
                        </ThemeIcon>
                        <Stack gap={0}>
                          <Text fw={500}>Organizer</Text>
                          <Text size="sm" c="dimmed">
                            {selectedEvent.submittedByName}
                          </Text>
                        </Stack>
                      </Group>

                      <Group gap="xs">
                        <ThemeIcon color="blue" variant="light" size="lg">
                          <IconUsers size={20} />
                        </ThemeIcon>
                        <Stack gap={0}>
                          <Text fw={500}>Attendance</Text>
                          <Text size="sm" c="dimmed">
                            {attendanceCounts[selectedEvent.eventID] ||
                              selectedEvent.going ||
                              0}{" "}
                            people registered
                          </Text>
                        </Stack>
                      </Group>
                    </Stack>
                  </Paper>

                  <Paper p="md" withBorder>
                    <Stack>
                      {attendingEventIDs.includes(selectedEvent.eventID) ? (
                        <>
                          <Text fw={500} c="teal" ta="center">
                            You are registered for this event
                          </Text>
                          <Button
                            variant="light"
                            color="blue"
                            leftSection={<IconCalendarDue size={16} />}
                            onClick={close}
                            disabled
                          >
                            View in My Events
                          </Button>
                        </>
                      ) : (
                        <>
                          {getEventStatus(selectedEvent).status ===
                          "upcoming" ? (
                            <Button
                              color="teal"
                              size="lg"
                              onClick={() =>
                                showConfirmationModal(selectedEvent)
                              }
                            >
                              Register for this Event
                            </Button>
                          ) : getEventStatus(selectedEvent).status ===
                            "ongoing" ? (
                            <Button
                              color="green"
                              size="lg"
                              onClick={() =>
                                showConfirmationModal(selectedEvent)
                              }
                            >
                              Join Now
                            </Button>
                          ) : (
                            <Text fw={500} c="dimmed" ta="center">
                              This event has ended
                            </Text>
                          )}
                        </>
                      )}
                    </Stack>
                  </Paper>
                </Stack>
              </Grid.Col>
            </Grid>
          </>
        )}
      </Modal>
    </AppShell>
  );
}

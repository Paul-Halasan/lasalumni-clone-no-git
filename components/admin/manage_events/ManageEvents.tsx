import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  TextInput,
  Textarea,
  Select,
  MultiSelect,
  FileInput,
  Group,
  Container,
  RadioGroup,
  Radio,
  Title,
  Divider,
  Notification,
  ScrollArea,
  Center,
  Stack,
  Text,
  ActionIcon,
  Tooltip,
  Loader,
  Checkbox,
  Tabs,
  Alert,
  Pagination,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import moment from "moment-timezone";
import {
  IconX,
  IconCheck,
  IconPencil,
  IconTrash,
  IconProgressCheck,
  IconCalendarEvent,
  IconCalendarDue,
  IconAlertCircle,
  IconSearch,
  IconCalendarOff
} from "@tabler/icons-react";
import classes from "../../../pages/user_admin/search/search_alumni.module.css";

const ManageEvents = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<{
    eventID: string;
    eventTitle: string;
    eventStart: string;
    eventEnd: string;
    isFreeEvent: boolean;
    eventDesc: string;
    eventType: string;
    meetingLink: string;
    selectedFacilitators: string[];
  } | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [eventStart, setEventStart] = useState<Date | null>(null);
  const [eventEnd, setEventEnd] = useState<Date | null>(null);
  const [isFreeEvent, setIsFreeEvent] = useState(true);
  const [eventDesc, setEventDesc] = useState("");
  const [eventType, setEventType] = useState<string | null>("");
  const [meetingLink, setMeetingLink] = useState("");
  const [selectedFacilitators, setSelectedFacilitators] = useState<string[]>(
    []
  );
  const [facilitators, setFacilitators] = useState([]);
  const [userProfiles, setUserProfiles] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    color: "green" | "red";
  } | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>("active");
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Bulk delete states
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkDeleteModalOpened, setBulkDeleteModalOpened] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const xIcon = <IconX style={{ width: 20, height: 20 }} />;
  const checkIcon = <IconCheck style={{ width: 20, height: 20 }} />;

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

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("/api/get_events");
        // Fetch user profiles for each event
        const profiles: { [key: string]: any } = {};
        for (const event of response.data.events) {
          if (!profiles[event.submittedBy]) {
            const profile = await fetchUserProfile(event.submittedBy);
            if (profile) {
              profiles[event.submittedBy] = profile;
            }
          }
        }
        setUserProfiles(profiles);
        setEvents(response.data.events);
      } catch (error) {
        console.error("Error fetching events:", error);
        setNotification({
          message: "Failed to fetch events",
          color: "red",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchFacilitators = async () => {
      try {
        const response = await axios.get("/api/get_facilitators");
        const alumni = response.data.alumni;
        const formattedFacilitators = alumni.map((alum: any) => ({
          label: `${alum.first_name} ${alum.last_name}`,
          value: alum.userID,
        }));
        setFacilitators(formattedFacilitators);
      } catch (error) {
        console.error("Error fetching facilitators:", error);
      }
    };

    fetchEvents();
    fetchFacilitators();
  }, []);

  // Reset selected events when tab changes, page changes, or search changes
  useEffect(() => {
    setSelectedEvents([]);
    setSelectAll(false);
    setCurrentPage(1); // Reset to first page when search or tab changes
  }, [activeTab, searchQuery]);

  const handleEdit = (event: any) => {
    setSelectedEvent(event);
    setEventTitle(event.eventTitle);
    setEventStart(new Date(event.eventStart));
    setEventEnd(new Date(event.eventEnd));
    setIsFreeEvent(event.isFreeEvent === true || event.isFreeEvent === "true");
    setEventDesc(event.eventDesc);
    setEventType(event.eventType);
    setMeetingLink(event.meetingLink || "");
    setSelectedFacilitators(event.selectedFacilitators || []);
    setModalOpened(true);
  };

  const openDeleteConfirmation = (event: any) => {
    setEventToDelete({ id: event.eventID, title: event.eventTitle });
    setDeleteConfirmationOpen(true);
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;

    setDeletingEventId(eventToDelete.id);
    setDeleteConfirmationOpen(false);

    try {
      await axios.delete(`/api/delete_event?eventID=${eventToDelete.id}`);
      setEvents(
        events.filter((event: any) => event.eventID !== eventToDelete.id)
      );
      notifications.show({
        title: "Event Deleted",
        message: "The event has been deleted successfully.",
        color: "green",
        icon: checkIcon,
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      notifications.show({
        title: "Error",
        message: "Failed to delete the event.",
        color: "red",
        icon: xIcon,
      });
    } finally {
      setDeletingEventId(null);
      setEventToDelete(null);
    }
  };

  // Handle individual checkbox selection
  const handleCheckboxChange = (eventID: string) => {
    setSelectedEvents((prev) => {
      if (prev.includes(eventID)) {
        return prev.filter((id) => id !== eventID);
      } else {
        return [...prev, eventID];
      }
    });
  };

  // Handle "select all" checkbox - only select events on current page
  const handleSelectAllChange = () => {
    const paginatedEvents = getPaginatedEvents();
    if (selectAll) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(paginatedEvents.map((event) => event.eventID));
    }
    setSelectAll(!selectAll);
  };

  // Handle bulk delete confirmation
  // Handle search
  const handleSearch = (query: string) => {
    setIsSearching(true);
    setSearchQuery(query);
    setTimeout(() => {
      setIsSearching(false);
    }, 300);
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedEvents.length === 0) return;

    setIsDeleting(true);
    try {
      const failedDeletions: string[] = [];

      for (const eventID of selectedEvents) {
        try {
          const response = await axios.delete(
            `/api/delete_event?eventID=${eventID}`
          );
          if (!response.data || response.status !== 200) {
            failedDeletions.push(eventID);
          }
        } catch (error) {
          console.error(`Error deleting event ${eventID}:`, error);
          failedDeletions.push(eventID);
        }
      }

      if (failedDeletions.length === 0) {
        notifications.show({
          title: "Success",
          message: `Successfully deleted ${selectedEvents.length} events`,
          color: "green",
          icon: checkIcon,
        });
      } else {
        notifications.show({
          title: "Partial Success",
          message: `Failed to delete ${failedDeletions.length} out of ${selectedEvents.length} events`,
          color: "red",
          icon: xIcon,
        });
      }

      // Update events list
      setEvents(
        events.filter((event) => !selectedEvents.includes(event.eventID))
      );

      // Reset selection and close modal
      setSelectedEvents([]);
      setSelectAll(false);
      setBulkDeleteModalOpened(false);
    } catch (error) {
      console.error("Error performing bulk deletion:", error);
      notifications.show({
        title: "Error",
        message: "An error occurred while deleting the selected events",
        color: "red",
        icon: xIcon,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const validateEventDates = () => {
    if (!eventStart || !eventEnd) {
      notifications.show({
        title: "Invalid Event Dates",
        message: "Event start and end dates are required.",
        color: "red",
        icon: xIcon,
        autoClose: false,
      });
      return false;
    }
    const now = moment();
    const start = moment(eventStart);
    const end = moment(eventEnd);

    if (start.isSameOrBefore(now, "day")) {
      notifications.show({
        title: "Invalid Event Start Date",
        message: "Event start date must be later than today.",
        color: "red",
        icon: xIcon,
        autoClose: false,
      });
      return false;
    }

    if (end.isBefore(start)) {
      notifications.show({
        title: "Invalid Event Dates",
        message: "Event end date must be later than event start date.",
        color: "red",
        icon: xIcon,
        autoClose: false,
      });
      return false;
    }

    if (start.isSame(end)) {
      notifications.show({
        title: "Invalid Event Dates",
        message: "Event start date and end date cannot be the same.",
        color: "red",
        icon: xIcon,
        autoClose: false,
      });
      return false;
    }

    return true;
  };

  const insertFacilitators = async (
    eventID: string,
    facilitators: string[],
    eventType: string
  ) => {
    try {
      for (const facilitator of facilitators) {
        await axios.post("/api/insert_facilitators", {
          eventID,
          facilitator,
          saveToUser: true,
          eventType,
        });
      }
      notifications.show({
        title: "Facilitators Added",
        message: "Facilitators have been added successfully.",
        color: "green",
        icon: checkIcon,
      });
    } catch (error) {
      console.error("Error adding facilitators:", error);
      notifications.show({
        title: "Error",
        message: "Failed to add facilitators.",
        color: "red",
        icon: xIcon,
      });
    }
  };

  const updateEvent = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission behavior

    if (!validateEventDates()) {
      return;
    }

    if (!selectedEvent) {
      notifications.show({
        title: "Error",
        message: "No event selected.",
        color: "red",
        icon: xIcon,
      });
      return;
    }

    const payload: {
      eventID: string;
      eventTitle: string;
      eventStart: string;
      eventEnd: string;
      isFreeEvent: string;
      eventDesc: string;
      eventType: string;
      meetingLink: string;
      selectedFacilitators: string[];
      eventImageFileName?: string;
    } = {
      eventID: selectedEvent.eventID,
      eventTitle,
      eventStart: moment(eventStart)
        .tz("Asia/Manila")
        .format("YYYY-MM-DDTHH:mm:ssZ"),
      eventEnd: moment(eventEnd)
        .tz("Asia/Manila")
        .format("YYYY-MM-DDTHH:mm:ssZ"),
      isFreeEvent: isFreeEvent.toString(),
      eventDesc,
      eventType: eventType || "",
      meetingLink,
      selectedFacilitators,
    };

    // If an image is included, upload it first and include its filename in the payload
    if (eventImage) {
      const eventImageFileName = `${Date.now()}-${eventImage.name}`;

      // Get presigned URL
      const {
        data: { url },
      } = await axios.get(
        `/api/generate_presigned_url?fileName=${eventImageFileName}&fileType=${eventImage.type}`
      );

      // Upload the image to S3
      const uploadResponse = await axios.put(url, eventImage, {
        headers: {
          "Content-Type": eventImage.type,
        },
      });

      // Log the status code from the upload response
      console.log("S3 upload response status:", uploadResponse.status);
      payload.eventImageFileName = eventImageFileName;
    }

    try {
      // Use JSON to send the request
      console.log("payload:", payload);
      await axios.put("/api/update_event", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Insert new facilitators
      await insertFacilitators(
        selectedEvent.eventID,
        selectedFacilitators,
        eventType || ""
      );

      setEvents(
        events.map((evt) =>
          evt.eventID === selectedEvent.eventID ? { ...evt, ...payload } : evt
        )
      );
      setModalOpened(false);
      notifications.show({
        title: "Event Updated",
        message: "The event has been updated successfully.",
        color: "green",
        icon: checkIcon,
      });
    } catch (error) {
      console.error("Error updating event:", error);
      notifications.show({
        title: "Error",
        message: "Failed to update the event.",
        color: "red",
        icon: xIcon,
      });
    }
  };

  // Filter approved events and categorize by active/finished status
  const approvedEvents = events.filter((event: any) => event.isApproved);

  const deniedEvents = events.filter((event: any) => event.isApproved === 2);

  const now = moment();
  const activeEvents = approvedEvents.filter((event: any) =>
    moment(event.eventEnd).isAfter(now)
  );

  const finishedEvents = approvedEvents.filter((event: any) =>
    moment(event.eventEnd).isSameOrBefore(now)
  );

  // Function to get current tab events with search filter
  const getCurrentTabEvents = () => {
  let baseEvents: any[] = [];
  if (activeTab === "active") baseEvents = activeEvents;
  else if (activeTab === "finished") baseEvents = finishedEvents;
  else if (activeTab === "denied") baseEvents = deniedEvents;

  if (!searchQuery.trim()) return baseEvents;

  const query = searchQuery.toLowerCase().trim();
  return baseEvents.filter((event) => {
    return (
      event.eventTitle?.toLowerCase().includes(query) ||
      event.eventType?.toLowerCase().includes(query) ||
      (
        userProfiles[event.submittedBy]?.first_name +
        " " +
        userProfiles[event.submittedBy]?.last_name
      )
        .toLowerCase()
        .includes(query)
    );
  });
};

  // Get paginated events for the current tab
  const getPaginatedEvents = () => {
    const events = getCurrentTabEvents();
    return events.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  };

  // Function to render the event table with pagination
  const renderEventsTable = () => {
    const eventsToShow = getPaginatedEvents();
    return (
      <div className={classes.tableContainer} style={{ marginTop: 0 }}>
        <table className={classes.table}>
          <thead>
            <tr className={classes.tableHeader}>
              <th className={classes.tableHeader}>
                <Center>
                  <Checkbox
                    checked={selectAll}
                    onChange={handleSelectAllChange}
                    indeterminate={
                      selectedEvents.length > 0 &&
                      selectedEvents.length < eventsToShow.length
                    }
                  />
                </Center>
              </th>
              <th className={classes.tableHeader}>Title</th>
              <th className={classes.tableHeader}>Start Date</th>
              <th className={classes.tableHeader}>End Date</th>
              <th className={classes.tableHeader}>Submitted By</th>
              <th className={classes.tableHeader}>Submission Time</th>
              <th className={classes.tableHeader}>Type</th>
              <th className={classes.tableHeader}>Free</th>
              <th className={classes.tableHeader}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {eventsToShow.map((event: any) => (
              <tr key={event.eventID} className={classes.tableRow}>
                <td>
                  <Center>
                    <Checkbox
                      checked={selectedEvents.includes(event.eventID)}
                      onChange={() => handleCheckboxChange(event.eventID)}
                    />
                  </Center>
                </td>
                <td className={`${classes.tableCell} ${classes.nameCell}`}>
                  {event.eventTitle}
                </td>
                <td className={classes.tableCell}>
                  {moment(event.eventStart).format("MMM D, YYYY, h:mm A")}
                </td>
                <td className={classes.tableCell}>
                  {moment(event.eventEnd).format("MMM D, YYYY, h:mm A")}
                </td>
                <td className={classes.tableCell}>
                  {userProfiles[event.submittedBy]
                    ? `${userProfiles[event.submittedBy].first_name} ${
                        userProfiles[event.submittedBy].last_name
                      }`
                    : "Loading..."}
                </td>
                <td className={classes.tableCell}>{moment(event.createdAt).format("MMM D, YYYY, h:mm A")}</td>
                <td className={classes.tableCell}>{event.eventType}</td>
                <td className={classes.tableCell}>
                  {event.isFreeEvent === true || event.isFreeEvent === "true"
                    ? "Yes"
                    : "No"}
                </td>
                <td className={classes.tableCell}>
                  <Group
                    gap="xs"
                    justify="flex-end"
                    wrap="nowrap"
                    className={classes.actionButtons}
                  >
                    <Tooltip label="Edit Event">
                      <ActionIcon
                        variant="outline"
                        color="blue"
                        size="lg"
                        onClick={() => handleEdit(event)}
                        title="Edit Event"
                      >
                        <IconPencil style={{ width: 20, height: 20 }} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete Event">
                      <ActionIcon
                        variant="outline"
                        color="red"
                        size="lg"
                        onClick={() => openDeleteConfirmation(event)}
                        title="Delete Event"
                        loading={deletingEventId === event.eventID}
                        disabled={deletingEventId === event.eventID}
                      >
                        <IconTrash style={{ width: 20, height: 20 }} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Container size="xl" p={15} bg="white" style={{ borderRadius: 15 }}>
      <Group align="center" gap="sm" p="md" pt="md">
        <IconProgressCheck size={24} color="#146a3e" />
        <Title order={3} c="#146a3e">
          Manage Events
        </Title>
      </Group>

      <Divider my="xs" />

      {notification && (
        <Notification
          color={notification.color}
          onClose={() => setNotification(null)}
          mt="md"
        >
          {notification.message}
        </Notification>
      )}

      {isLoading ? (
        <Center py="xl">
          <Stack align="center" gap="sm">
            <Loader color="#146a3e" size="md" />
            <Text c="dimmed" size="sm">
              Loading events...
            </Text>
          </Stack>
        </Center>
      ) : approvedEvents.length > 0 || deniedEvents.length > 0 ? (
        <>
          <Group justify="space-between" mt="xl" mb="md" align="center">
            <Tabs
              color="#146a3e"
              variant="pills"
              value={activeTab}
              onChange={setActiveTab}
              mb={0}
            >
              <Tabs.List>
                <Tabs.Tab
                  value="active"
                  leftSection={<IconCalendarEvent size={16} />}
                  style={{ fontWeight: 600 }}
                >
                  Active Events ({activeEvents.length})
                </Tabs.Tab>
                <Tabs.Tab
                  value="finished"
                  leftSection={<IconCalendarDue size={16} />}
                  style={{ fontWeight: 600 }}
                >
                  Finished Events ({finishedEvents.length})
                </Tabs.Tab>
                <Tabs.Tab
                  value="denied"
                  leftSection={<IconCalendarOff size={16} />}
                  style={{ fontWeight: 600}}
                >
                  Denied Events ({deniedEvents.length})
                </Tabs.Tab>
              </Tabs.List>
            </Tabs>

            <Group>
              {/* Search Box */}
              <TextInput
                placeholder="Search events..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: "250px" }}
                rightSection={
                  isSearching ? (
                    <Loader size="xs" />
                  ) : searchQuery ? (
                    <ActionIcon onClick={() => handleSearch("")} size="sm">
                      <IconX size={14} />
                    </ActionIcon>
                  ) : null
                }
              />

              {/* Bulk Action Button */}
              {getCurrentTabEvents().length > 0 && activeTab !== "denied" && (
                <Button
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  disabled={selectedEvents.length === 0}
                  onClick={() => setBulkDeleteModalOpened(true)}
                >
                  Delete Selected ({selectedEvents.length})
                </Button>
              )}
            </Group>
          </Group>

          <div>
            {isSearching ? (
              <Center py="xl">
                <Stack align="center" gap="sm">
                  <Loader color="#146a3e" size="md" />
                  <Text c="dimmed" size="sm">
                    Searching events...
                  </Text>
                </Stack>
              </Center>
            ) : getCurrentTabEvents().length > 0 ? (
              <>
                {renderEventsTable()}

                {/* Pagination */}
                <div
                  className={classes.paginationContainer}
                  style={{ marginTop: "2rem" }}
                >
                  <Center>
                    <Pagination
                      withEdges
                      total={Math.ceil(
                        getCurrentTabEvents().length / itemsPerPage
                      )}
                      value={currentPage}
                      onChange={(page) => {
                        setCurrentPage(page);
                        setSelectedEvents([]);
                        setSelectAll(false);
                      }}
                      radius="md"
                    />
                  </Center>
                </div>
              </>
            ) : searchQuery ? (
              <Text c="dimmed" ta="center" py="xl">
                No {activeTab === "active"
                  ? "active"
                  : activeTab === "finished"
                  ? "finished"
                  : "denied"} events found
                matching &quot;{searchQuery}&quot;.
              </Text>
            ) : (
              <Text c="dimmed" ta="center" py="xl">
                No {activeTab === "active"
                  ? "active"
                  : activeTab === "finished"
                  ? "finished"
                  : "denied"} events available.
              </Text>
            )}
          </div>
        </>
      ) : (
        <div className={classes.emptyState}>
          <Text c="dimmed" ta="center" py="xl">
            No approved or denied events found. Events will appear here after approval or denial.
          </Text>
        </div>
      )}

      {/* Edit Event Modal */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={<Title order={4}>Edit Event</Title>}
        size="lg"
      >
        <ScrollArea h={500} type="auto">
          <form onSubmit={updateEvent}>
            <TextInput
              label="Event Title"
              placeholder="Enter event title"
              value={eventTitle}
              onChange={(event) => setEventTitle(event.currentTarget.value)}
              required
              styles={{
                root: { marginBottom: 16 },
                label: { fontWeight: 500, marginBottom: 8, fontSize: "0.9rem" },
              }}
            />
            <FileInput
              label="Upload Event Image"
              placeholder="Choose image"
              onChange={(file) => setEventImage(file)}
              accept="image/*"
              styles={{
                root: { marginBottom: 16 },
                label: { fontWeight: 500, marginBottom: 8, fontSize: "0.9rem" },
              }}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <DateTimePicker
                value={eventStart}
                onChange={setEventStart}
                valueFormat="YYYY-MM-DD HH:mm:ss"
                label="Event Start Date and Time"
                placeholder="When is the event?"
                required
                styles={{
                  root: { marginBottom: 8 },
                  label: {
                    fontWeight: 500,
                    marginBottom: 8,
                    fontSize: "0.9rem",
                  },
                }}
              />
              <DateTimePicker
                value={eventEnd}
                onChange={setEventEnd}
                valueFormat="YYYY-MM-DD HH:mm:ss"
                label="Event End Date and Time"
                placeholder="When does the event end?"
                required
                styles={{
                  root: { marginBottom: 8 },
                  label: {
                    fontWeight: 500,
                    marginBottom: 8,
                    fontSize: "0.9rem",
                  },
                }}
              />
            </div>
            <Select
              label="Select Event Type"
              placeholder="Event Type"
              data={["Online", "Face-to-Face"]}
              value={eventType}
              onChange={setEventType}
              required
              styles={{
                root: { marginBottom: 16 },
                label: { fontWeight: 500, marginBottom: 8, fontSize: "0.9rem" },
              }}
              allowDeselect={false}
            />
            {eventType === "Online" && (
              <TextInput
                label="Meeting Link"
                placeholder="Enter meeting link"
                value={meetingLink}
                onChange={(event) => setMeetingLink(event.currentTarget.value)}
                required
                styles={{
                  root: { marginBottom: 16 },
                  label: {
                    fontWeight: 500,
                    marginBottom: 8,
                    fontSize: "0.9rem",
                  },
                }}
              />
            )}
            {eventType === "Face-to-Face" && (
              <MultiSelect
                label="Select Alumni Facilitators"
                placeholder="Select users"
                data={facilitators}
                value={selectedFacilitators}
                onChange={setSelectedFacilitators}
                required
                styles={{
                  root: { marginBottom: 16 },
                  label: {
                    fontWeight: 500,
                    marginBottom: 8,
                    fontSize: "0.9rem",
                  },
                }}
                searchable
                clearable
              />
            )}
            <RadioGroup
              label="Is this a free event?"
              value={isFreeEvent.toString()}
              onChange={(value) => setIsFreeEvent(value === "true")}
              required
              styles={{
                root: { marginBottom: 16 },
                label: { fontWeight: 500, marginBottom: 8, fontSize: "0.9rem" },
              }}
            >
              <Radio value="true" label="Yes" />
              <Radio value="false" label="No" />
            </RadioGroup>
            <Textarea
              label="Event Description"
              placeholder="Enter event description"
              value={eventDesc}
              onChange={(event) => setEventDesc(event.currentTarget.value)}
              required
              styles={{
                root: { marginBottom: 24 },
                label: { fontWeight: 500, marginBottom: 8, fontSize: "0.9rem" },
              }}
              minRows={4}
            />
            <Group justify="flex-end" gap="md">
              <Button
                type="button"
                onClick={() => setModalOpened(false)}
                variant="outline"
                color="gray"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                style={{
                  backgroundColor: "#146a3e",
                  color: "white",
                }}
              >
                Save Changes
              </Button>
            </Group>
          </form>
        </ScrollArea>
      </Modal>

      {/* Single Delete Confirmation Modal */}
      <Modal
        opened={deleteConfirmationOpen}
        onClose={() => setDeleteConfirmationOpen(false)}
        title={
          <Title order={4} c="red">
            Delete Event
          </Title>
        }
        centered
        size="md"
      >
        <Text mb="md">
          Are you sure you want to delete the event{" "}
          <b>&quot;{eventToDelete?.title}&quot;</b>? This action cannot be undone.
        </Text>
        <Group justify="flex-end" gap="md">
          <Button
            variant="outline"
            color="gray"
            onClick={() => setDeleteConfirmationOpen(false)}
          >
            Cancel
          </Button>
          <Button
            color="red"
            onClick={handleDelete}
            loading={!!deletingEventId}
          >
            Delete Event
          </Button>
        </Group>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        opened={bulkDeleteModalOpened}
        onClose={() => setBulkDeleteModalOpened(false)}
        title={
          <Group align="center">
            <IconAlertCircle size={20} color="red" />
            <Text fw={600}>Confirm Bulk Delete</Text>
          </Group>
        }
        centered
      >
        <Text mb="md">
          Are you sure you want to delete {selectedEvents.length} selected
          events? This action cannot be undone.
        </Text>

        <Alert color="red" icon={<IconAlertCircle size={16} />} mb="md">
          Warning: This will permanently remove all data associated with these
          events.
        </Alert>

        <Group justify="flex-end" mt="xl">
          <Button
            variant="outline"
            onClick={() => setBulkDeleteModalOpened(false)}
          >
            Cancel
          </Button>
          <Button
            color="red"
            onClick={handleBulkDeleteConfirm}
            loading={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Events"}
          </Button>
        </Group>
      </Modal>
    </Container>
  );
};

export default ManageEvents;

import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Container,
  Notification,
  Modal,
  Textarea,
  rem,
  Group,
  Title,
  Divider,
  Checkbox,
  Center,
  ActionIcon,
  Text,
  Image,
  Stack,
  Badge,
  ScrollArea,
  Box,
  Tooltip,
  Paper,
  Grid,
  Loader,
  Alert,
} from "@mantine/core";
import axios from "axios";
import { notifications } from "@mantine/notifications";
import {
  IconX,
  IconCheck,
  IconProgressCheck,
  IconEye,
  IconRosetteDiscountCheck,
  IconCircleX,
  IconTrash,
  IconAlertCircle,
} from "@tabler/icons-react";
import DOMPurify from "dompurify";
import classes from "../../../pages/user_admin/search/search_alumni.module.css";
import { getServerTime } from "../../../utils/getServerTime";
import moment from "moment";

interface Event {
  eventID: string;
  eventTitle: string;
  eventImage: string;
  eventStart: string;
  eventEnd: string;
  isFreeEvent: boolean;
  eventDesc: string;
  createdAt: string;
  updatedAt: string;
  isApproved: boolean;
  submittedBy: string;
  eventType: string;
  meetingLink: string;
}

interface ApproveEventsProps {
  updateUnapprovedEventsCount: () => void;
  events: Event[];
}

const ApproveEvents: React.FC<ApproveEventsProps> = ({
  updateUnapprovedEventsCount,
  events,
}) => {
  const [eventList, setEventList] = useState<Event[]>(events);
  const [notification, setNotification] = useState<{
    message: string;
    color: "green" | "red";
  } | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedEventID, setSelectedEventID] = useState<string | null>(null);
  const [selectedEventTitle, setSelectedEventTitle] = useState<string | null>(
    null
  );
  const [selectedSubmittedBy, setSelectedSubmittedBy] = useState<string | null>(
    null
  );
  const [userProfiles, setUserProfiles] = useState<{ [key: string]: any }>({});
  const xIcon = <IconX style={{ width: rem(20), height: rem(20) }} />;
  const checkIcon = <IconCheck style={{ width: rem(20), height: rem(20) }} />;
  const [isLoading, setIsLoading] = useState(false);

  // Add state for details modal
  const [detailsModalOpened, setDetailsModalOpened] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Bulk delete states
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkDeleteModalOpened, setBulkDeleteModalOpened] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [serverNow, setServerNow] = useState<Date>(new Date());

  useEffect(() => {
    getServerTime("datetime")
      .then((datetime) => setServerNow(new Date(datetime)))
      .catch(() => setServerNow(new Date()));
  }, []);

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

  // Deny event
  const denyEvent = async (eventID: string) => {
    try {
      const response = await fetch("/api/deny_event", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventID }),
      });

      if (response.ok) {
        notifications.show({
          title: "Event Denied",
          message: "The event has been denied successfully.",
          color: "green",
          icon: checkIcon,
          autoClose: false,
        });
        fetchEvents(); // Refresh the events list
      } else {
        const errorData = await response.json();
        notifications.show({
          title: "Error Denying Event",
          message:
            errorData.error || "An error occurred while denying the event.",
          color: "red",
          icon: xIcon,
          autoClose: false,
        });
      }
    } catch (error) {
      console.error("Error denying event:", error);
      notifications.show({
        title: "Error Denying Event",
        message: "An error occurred while denying the event.",
        color: "red",
        icon: xIcon,
        autoClose: false,
      });
    }
  };

  // Fetch events from the API
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/get_events");
      setEventList(response.data.events);
      updateUnapprovedEventsCount(); // Update the count of unapproved events

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
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Approve event
  const approveEvent = async (
    eventID: string,
    submittedBy: string,
    eventTitle: string
  ) => {
    try {
      const response = await axios.post("/api/approve_event", { eventID });
      if (response.status === 200) {
        setNotification({
          message: "Event approved successfully",
          color: "green",
        });

        // Insert notification into the database
        await axios.post("/api/insert_notif", {
          message: `Event "${eventTitle}" has been approved. You may check it out now at the My Events Tab!`,
          directTo: "events",
          userID: submittedBy, // Use submittedBy for the userID
          isAdmin: true,
        });

        fetchEvents(); // Refresh the events list
      } else {
        setNotification({ message: "Failed to approve event", color: "red" });
      }
    } catch (error) {
      setNotification({ message: "Error approving event", color: "red" });
    }
  };

  // Filter events to only include those that are not approved
  const unapprovedEvents = eventList.filter((event) => !event.isApproved);

  // Handle deny button click
  const handleDenyClick = (
    eventID: string,
    eventTitle: string,
    submittedBy: string
  ) => {
    setSelectedEventID(eventID);
    setSelectedEventTitle(eventTitle);
    setSelectedSubmittedBy(submittedBy);
    setModalOpened(true);
  };

  // Handle modal submit
  const handleModalSubmit = async () => {
    if (selectedEventID && selectedEventTitle && selectedSubmittedBy) {
      await denyEvent(selectedEventID);

      // Insert notification into the database
      await axios.post("/api/insert_notif", {
        message: `Event "${selectedEventTitle}" has been denied. Reason: ${rejectionReason}`,
        directTo: "events",
        userID: selectedSubmittedBy, // Use selectedSubmittedBy for the userID
        isAdmin: true,
      });

      setModalOpened(false);
      setRejectionReason("");
      setSelectedEventID(null);
      setSelectedEventTitle(null);
      setSelectedSubmittedBy(null);
    }
  };

  // Handle view details click
  const handleViewDetailsClick = (event: Event) => {
    setSelectedEvent(event);
    setDetailsModalOpened(true);
  };

  // Format date helper function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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

  // Handle "select all" checkbox
  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(unapprovedEvents.map((event) => event.eventID));
    }
    setSelectAll(!selectAll);
  };

  // Handle bulk delete confirmation
  const handleBulkDeleteConfirm = async () => {
    if (selectedEvents.length === 0) return;

    setIsDeleting(true);
    try {
      const failedDeletions: string[] = [];

      for (const eventID of selectedEvents) {
        try {
          const response = await fetch("/api/deny_event", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ eventID }),
          });

          if (response.ok) {
            // Find the event to get the submittedBy and eventTitle for notification
            const event = unapprovedEvents.find((e) => e.eventID === eventID);
            if (event) {
              // Insert notification into the database
              await axios.post("/api/insert_notif", {
                message: `Event "${event.eventTitle}" has been denied as part of a bulk denial.`,
                directTo: "events",
                userID: event.submittedBy,
                isAdmin: true,
              });
            }
          } else {
            failedDeletions.push(eventID);
          }
        } catch (error) {
          console.error(`Error denying event ${eventID}:`, error);
          failedDeletions.push(eventID);
        }
      }

      if (failedDeletions.length === 0) {
        setSuccessMessage(
          `Successfully denied ${selectedEvents.length} events`
        );
        setErrorMessage(null);
      } else {
        setErrorMessage(
          `Failed to deny ${failedDeletions.length} out of ${selectedEvents.length} events`
        );
        setSuccessMessage(
          selectedEvents.length > failedDeletions.length
            ? `Successfully denied ${
                selectedEvents.length - failedDeletions.length
              } events`
            : null
        );
      }

      // Reset selection and close modal
      setSelectedEvents([]);
      setSelectAll(false);
      setBulkDeleteModalOpened(false);
      fetchEvents();
    } catch (error) {
      console.error("Error performing bulk denial:", error);
      setErrorMessage("An error occurred while denying the selected events");
      setSuccessMessage(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Container
      fluid
      p={15}
      mt={0}
      bg="white"
      className={classes.tableContainer}
    >
      <Group align="center" gap="sm" p="md" pt="lg">
        <IconProgressCheck size={24} color="#146a3e" />
        <Title order={3} c="#146a3e">
          Approve Event Request Promotion
        </Title>
      </Group>

      <Divider my="md" />
      {notification && (
        <Notification
          color={notification.color}
          onClose={() => setNotification(null)}
          mt="md"
        >
          {notification.message}
        </Notification>
      )}

      {/* Bulk Action Buttons */}
      {unapprovedEvents.length > 0 && (
        <Group justify="flex-end" mb="md">
          <Button
            color="red"
            leftSection={<IconTrash size={16} />}
            disabled={selectedEvents.length === 0}
            onClick={() => setBulkDeleteModalOpened(true)}
          >
            Deny Selected ({selectedEvents.length})
          </Button>
        </Group>
      )}

      {isLoading ? (
        <Center py="xl">
          <Stack align="center" gap="sm">
            <Loader color="#146a3e" size="md" />
            <Text c="dimmed" size="sm">
              Loading event requests...
            </Text>
          </Stack>
        </Center>
      ) : (
        <Table className={classes.table}>
          <thead className={classes.tableHeader}>
            <tr>
              <th>
                <Center>
                  <Checkbox
                    checked={selectAll}
                    onChange={handleSelectAllChange}
                    indeterminate={
                      selectedEvents.length > 0 &&
                      selectedEvents.length < unapprovedEvents.length
                    }
                  />
                </Center>
              </th>
              <th>Event ID</th>
              <th>Title</th>
              <th>Event Start</th>
              <th>Free Event</th>
              <th>Event Medium</th>
              <th>Submitted By</th>
              <th>Submission Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {unapprovedEvents.length > 0 ? (
              unapprovedEvents.map((event) => (
                <tr key={event.eventID} className={classes.tableRow}>
                  <td>
                    <Center>
                      <Checkbox
                        checked={selectedEvents.includes(event.eventID)}
                        onChange={() => handleCheckboxChange(event.eventID)}
                      />
                    </Center>
                  </td>
                  <td className={classes.tableCell}>{event.eventID}</td>
                  <td className={classes.tableCell}>{event.eventTitle}</td>
                  <td className={classes.tableCell}>
                    {new Date(event.eventStart).toLocaleString()}
                  </td>
                  <td className={classes.tableCell}>
                    {event.isFreeEvent ? "Yes" : "No"}
                  </td>
                  <td className={classes.tableCell}>{event.eventType}</td>
                  <td className={classes.tableCell}>
                    {userProfiles[event.submittedBy]
                      ? `${userProfiles[event.submittedBy].first_name} ${
                          userProfiles[event.submittedBy].middle_name
                        } ${userProfiles[event.submittedBy].last_name}`
                      : "Loading..."}
                  </td>
                  <td className={classes.tableCell}>{moment(event.createdAt).format("MMM D, YYYY, h:mm A")}</td>
                  <td className={classes.tableCell}>
                    <Group
                      gap="xs"
                      justify="flex-end"
                      wrap="nowrap"
                      className={classes.actionButtons}
                    >
                      <Tooltip label="View Information">
                        <ActionIcon
                          variant="outline"
                          color="blue"
                          size="lg"
                          onClick={() => handleViewDetailsClick(event)}
                          title="View Event Details"
                        >
                          <IconEye
                            style={{ width: rem(20), height: rem(20) }}
                          />
                        </ActionIcon>
                      </Tooltip>

                      <Tooltip label="Approve Event">
                        <ActionIcon
                          variant="outline"
                          color="green"
                          size="lg"
                          onClick={() =>
                            approveEvent(
                              event.eventID,
                              event.submittedBy,
                              event.eventTitle
                            )
                          }
                          title="Approve"
                        >
                          <IconRosetteDiscountCheck
                            style={{ width: rem(20), height: rem(20) }}
                          />
                        </ActionIcon>
                      </Tooltip>

                      <Tooltip label="Deny Event">
                        <ActionIcon
                          variant="outline"
                          color="red"
                          size="lg"
                          onClick={() =>
                            handleDenyClick(
                              event.eventID,
                              event.eventTitle,
                              event.submittedBy
                            )
                          }
                          title="Deny"
                        >
                          <IconCircleX
                            style={{ width: rem(20), height: rem(20) }}
                          />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  <Text c="dimmed">No event requests found to approve.</Text>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {/* Rejection Reason Modal */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Reason for Rejection"
      >
        <Textarea
          placeholder="Type the reason for rejection here..."
          value={rejectionReason}
          onChange={(event) => setRejectionReason(event.currentTarget.value)}
          minRows={4}
        />
        <Button onClick={handleModalSubmit} mt="md">
          Submit
        </Button>
      </Modal>

      {/* Event Details Modal */}
      <Modal
        opened={detailsModalOpened}
        onClose={() => setDetailsModalOpened(false)}
        title={
          <Title order={4} fw={600}>
            {selectedEvent?.eventTitle}
          </Title>
        }
        size="lg"
        centered
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        {selectedEvent && (
          <ScrollArea h={500} type="auto">
            <Stack gap="md">
              {selectedEvent.eventImage && (
                <Box>
                  <Image
                    src={`https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${selectedEvent.eventImage}`}
                    alt={selectedEvent.eventTitle}
                    height={200}
                    fit="cover"
                    fallbackSrc="/placeholder-image.png"
                  />
                </Box>
              )}

              <Group justify="flex-start">
                <Badge
                  color={selectedEvent.isFreeEvent ? "green" : "blue"}
                  size="lg"
                  variant="filled"
                >
                  {selectedEvent.isFreeEvent ? "Free Event" : "Paid Event"}
                </Badge>
                <Badge color="gray" size="lg">
                  {selectedEvent.eventType}
                </Badge>
              </Group>

              <Paper withBorder p="md" radius="md" mb="lg">
                <Title order={4} c="#146a3e" pt="md" pb="md">
                  Event Details
                </Title>
                <Divider mb="lg" />

                <Grid>
                  <Grid.Col span={{ lg: 6, md: 12, sm: 12 }}>
                    <Stack gap={0}>
                      <Text fw={700}>Start Time</Text>
                      <Text>{formatDate(selectedEvent.eventStart)}</Text>
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={{ lg: 6, md: 12, sm: 12 }}>
                    <Stack gap={0}>
                      <Text fw={700}>End Time</Text>
                      <Text>{formatDate(selectedEvent.eventEnd)}</Text>
                    </Stack>
                  </Grid.Col>
                </Grid>

                {selectedEvent.meetingLink && (
                  <Stack gap={0} mb="md">
                    <Text fw={700}>Meeting Link</Text>
                    <Text component="a" target="_blank">
                      {selectedEvent.meetingLink}
                    </Text>
                  </Stack>
                )}

                <Stack gap={0}>
                  <Text fw={700}>Description</Text>
                  <Text
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        selectedEvent?.eventDesc || ""
                      ),
                    }}
                  />
                </Stack>
              </Paper>

              <Paper withBorder p="md" radius="md" mb="lg">
                <Title order={4} c="#146a3e" pt="md" pb="md">
                  Additional Information
                </Title>
                <Divider mb="lg" />

                <Group grow>
                  <Stack gap={0}>
                    <Text fw={700}>Event ID</Text>
                    <Text size="sm" c="dimmed">
                      {selectedEvent.eventID}
                    </Text>
                  </Stack>
                  <Stack gap={0} mb="md">
                    <Text fw={700}>Submitted By</Text>
                    <Text>
                      {userProfiles[selectedEvent.submittedBy]
                        ? `${
                            userProfiles[selectedEvent.submittedBy].first_name
                          } ${
                            userProfiles[selectedEvent.submittedBy].middle_name
                          } ${
                            userProfiles[selectedEvent.submittedBy].last_name
                          }`
                        : selectedEvent.submittedBy}
                    </Text>
                  </Stack>
                </Group>

                <Group grow mb="md">
                  <Stack gap={0}>
                    <Text fw={700}>Created At</Text>
                    <Text>{formatDate(selectedEvent.createdAt)}</Text>
                  </Stack>
                </Group>
              </Paper>
            </Stack>
          </ScrollArea>
        )}
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        opened={bulkDeleteModalOpened}
        onClose={() => setBulkDeleteModalOpened(false)}
        title={
          <Group align="center">
            <IconAlertCircle size={20} color="red" />
            <Text fw={600}>Confirm Bulk Event Denial</Text>
          </Group>
        }
        centered
      >
        <Text mb="md">
          Are you sure you want to deny {selectedEvents.length} selected event
          requests? This action cannot be undone.
        </Text>

        <Alert color="red" icon={<IconAlertCircle size={16} />} mb="md">
          Warning: This will permanently remove these events and notify the
          submitters of the denial.
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
            {isDeleting ? "Denying Events..." : "Deny Selected Events"}
          </Button>
        </Group>
      </Modal>

      {errorMessage && (
        <Alert
          title="Error"
          color="red"
          mt="md"
          withCloseButton
          onClose={() => setErrorMessage(null)}
        >
          {errorMessage}
        </Alert>
      )}
      {successMessage && (
        <Alert
          title="Success"
          color="green"
          mt="md"
          withCloseButton
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}
    </Container>
  );
};

export default ApproveEvents;

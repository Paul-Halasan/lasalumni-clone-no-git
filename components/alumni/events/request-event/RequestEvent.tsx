import React, { useEffect, useState } from "react";
import {
  TextInput,
  RadioGroup,
  Radio,
  Button,
  Container,
  Group,
  Select,
  rem,
  MultiSelect,
  FileInput,
  Grid,
  Title,
  Divider,
  Image,
  Text,
  Stack,
  LoadingOverlay,
  Box,
  Paper,
} from "@mantine/core";
import RichTextEditor from "../../../common/richtextbox";
import { DateTimePicker } from "@mantine/dates";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import withAuth from "../../../withAuth";
import {
  IconX,
  IconCheck,
  IconGlassChampagne,
  IconCalendarEvent,
  IconBlendMode,
  IconLink,
  IconUsers,
  IconPhotoScan,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
//const moment = require('moment-timezone');
import moment from "moment-timezone";

// Extend dayjs with customParseFormat and isSameOrBefore plugins
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

import { getServerTime } from "../../../../utils/getServerTime";

interface Facilitator {
  first_name: string;
  last_name: string;
  userID: string;
}

const RequestEventPage = () => {
  const [eventTitle, setEventTitle] = useState("");
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [eventStart, setEventStart] = useState<Date | null>(null);
  const [eventEnd, setEventEnd] = useState<Date | null>(null);
  const [isFreeEvent, setIsFreeEvent] = useState(true);
  const [eventDesc, setEventDesc] = useState("");
  const [eventType, setEventType] = useState<string | null>("");
  const [meetingLink, setMeetingLink] = useState(""); // Add state for meeting link
  const [saveToUser, setSaveToUser] = useState("");
  const [selectedFacilitators, setSelectedFacilitators] = useState<string[]>(
    []
  );
  const [facilitators, setFacilitators] = useState([]);
  const [loading, setLoading] = useState(false);

  const xIcon = <IconX style={{ width: rem(20), height: rem(20) }} />;
  const checkIcon = <IconCheck style={{ width: rem(20), height: rem(20) }} />;

  const [serverNow, setServerNow] = useState<moment.Moment | null>(null);

  useEffect(() => {
    getServerTime("datetime")
      .then((datetime) => setServerNow(moment.tz(datetime, "Asia/Manila")))
      .catch(() => setServerNow(moment.tz("Asia/Manila")));
    fetchFacilitators();
    document.title = "Request Event Promotion | Lasalumni Connect";
  }, []);

  const fetchFacilitators = async () => {
    try {
      const response = await axios.get("/api/get_facilitators");
      const alumni = response.data.alumni;
      const formattedFacilitators = alumni.map((alum: Facilitator) => ({
        label: `${alum.first_name} ${alum.last_name}`,
        value: alum.userID,
      }));
      setFacilitators(formattedFacilitators);
    } catch (error) {
      console.error("Error fetching facilitators:", error);
    }
  };

  useEffect(() => {
    document.title = "Request Event Promotion | Lasalumni Connect";
    fetchFacilitators();
  }, []);

  const validateEventDates = () => {
    if (!eventStart || !eventEnd) {
      return false;
    }
    const now = serverNow;
    const start = dayjs(eventStart);
    const end = dayjs(eventEnd);

    if (now && start.isSameOrBefore(now.toDate(), "day")) {
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

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateEventDates()) {
      return;
    }

    setLoading(true);

    const now = moment().tz("Asia/Manila");
    const start = moment(eventStart).tz("Asia/Manila");
    const end = moment(eventEnd).tz("Asia/Manila");

    // Check if eventImage is selected
    if (!eventImage) {
      setLoading(false);
      notifications.show({
        title: "Image Required",
        message: "Please upload an event image before submitting.",
        color: "red",
        icon: xIcon,
        autoClose: false,
      });
      return;
    }

    const eventImageFileName = `${Date.now()}-${eventImage.name}`;

    try {
      // Get presigned URL
      const {
        data: { url },
      } = await axios.get(
        `/api/generate_presigned_url?fileName=${eventImageFileName}&fileType=${eventImage.type}`
      );

      // Upload the image directly to S3 using the presigned URL
      await axios.put(url, eventImage, {
        headers: {
          "Content-Type": eventImage.type,
        },
      });

      // Fetch the current user ID
      const userResponse = await fetch("/api/get_current_userid", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const userData = await userResponse.json();
      const currentUserID = userData.userID;

      // Add current user ID to selected facilitators if event type is "Face-to-Face"
      const updatedFacilitators =
        eventType === "Face-to-Face" &&
        currentUserID &&
        !selectedFacilitators.includes(currentUserID)
          ? [...selectedFacilitators, currentUserID]
          : selectedFacilitators;

      // Continue with form data submission
      const formData = {
        eventTitle,
        eventImageFileName, // Send the filename instead of the file
        eventStart: eventStart
          ? moment(eventStart).tz("Asia/Manila").format("YYYY-MM-DDTHH:mm:ssZ")
          : "",
        eventEnd: eventEnd
          ? moment(eventEnd).tz("Asia/Manila").format("YYYY-MM-DDTHH:mm:ssZ")
          : "",
        isFreeEvent: isFreeEvent.toString(),
        eventDesc,
        eventType: eventType || "",
        meetingLink, // Include meetingLink in the form data
        saveToUser,
        selectedFacilitators: updatedFacilitators,
      };

      // Proceed with the event submission
      const response = await axios.post("/api/submit_event", formData, {
        withCredentials: true, // Ensure cookies (access-token) are included
      });

      if (response.status === 201) {
        await handleEventSuccess();
      } else {
        setLoading(false);
        notifications.show({
          title: "Event Request Failed!",
          message: "Event request is invalid, please review your request.",
          color: "red",
          icon: xIcon,
          autoClose: false,
        });
      }
    } catch (error: any) {
      // If the error is related to token expiry, try refreshing the token
      if (error.response && error.response.status === 401) {
        try {
          // Attempt to refresh the access token first
          const refreshResponse = await axios.post("/api/refresh", {
            withCredentials: true,
          });

          if (refreshResponse.status === 200) {
            console.log("Access token refreshed successfully");
            // Retry the form submission after refreshing the token
            try {
              // Get presigned URL
              const {
                data: { url },
              } = await axios.get(
                `/api/generate_presigned_url?fileName=${eventImageFileName}&fileType=${eventImage.type}`
              );

              // Upload the image directly to S3 using the presigned URL
              await axios.put(url, eventImage, {
                headers: {
                  "Content-Type": eventImage.type,
                },
              });

              // Continue with form data submission
              const formData = {
                eventTitle,
                eventImageFileName, // Send the filename instead of the file
                eventStart: eventStart
                  ? moment(eventStart)
                      .tz("Asia/Manila")
                      .format("YYYY-MM-DDTHH:mm:ssZ")
                  : "",
                eventEnd: eventEnd
                  ? moment(eventEnd)
                      .tz("Asia/Manila")
                      .format("YYYY-MM-DDTHH:mm:ssZ")
                  : "",
                isFreeEvent: isFreeEvent.toString(),
                eventDesc,
                eventType: eventType || "",
                meetingLink, // Include meetingLink in the form data
                saveToUser,
                selectedFacilitators,
              };

              // Proceed with the event submission
              const response = await axios.post("/api/submit_event", formData, {
                withCredentials: true, // Ensure cookies (access-token) are included
              });

              if (response.status === 201) {
                await handleEventSuccess();
              } else {
                setLoading(false);
                notifications.show({
                  title: "Event Request Failed!",
                  message:
                    "Event request is invalid, please review your request.",
                  color: "red",
                  icon: xIcon,
                  autoClose: false,
                });
              }
            } catch (retryError) {
              console.error("Error during retry submission:", retryError);
              notifications.show({
                title: "Event Request Failed!",
                message: "Error submitting form! Please try again.",
                color: "red",
                icon: xIcon,
                autoClose: false,
              });
            }
          }
        } catch (refreshError) {
          console.error("Error refreshing the token:", refreshError);
          notifications.show({
            title: "Session Expired",
            message: "Please log in again to continue.",
            color: "red",
            icon: xIcon,
            autoClose: false,
          });
        }
      } else {
        console.error("Error during submission:", error);
        notifications.show({
          title: "Event Request Failed!",
          message: "Error submitting form! Please try again.",
          color: "red",
          icon: xIcon,
          autoClose: false,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Removed 'response' parameter as it's unused
  const handleEventSuccess = async () => {
    setLoading(false);
    notifications.show({
      title: "Event Request Successful!",
      message: "Your event request is now being reviewed...",
      color: "green",
      icon: checkIcon,
      autoClose: false,
    });

    // Insert notification into the database
    await fetch("/api/insert_notif", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Event request: "${eventTitle}" has been submitted. It is now being reviewed. You will be notified once it is accepted.`,
        directTo: "events",
      }),
    });

    // Get the eventID of the event that was just created
    const lEvent = await fetch("/api/get_latest_event", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const dat = await lEvent.json();
    const eventIDx = dat.eventID;

    // Fetch the current user ID
    const userResponse = await fetch("/api/get_current_userid", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const userData = await userResponse.json();
    const currentUserID = userData.userID;

    // Insert current user ID as a facilitator
    const updatedFacilitators = [...selectedFacilitators, currentUserID];

    // Insert each facilitator into the database
    if (Array.isArray(updatedFacilitators) && updatedFacilitators.length > 0) {
      for (const facilitator of updatedFacilitators) {
        await fetch("/api/insert_facilitators", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventID: eventIDx,
            facilitator,
            saveToUser,
          }),
        });
      }
    }

    // Reset form fields
    setEventTitle("");
    setEventImage(null);
    setEventStart(null);
    setEventEnd(null);
    setIsFreeEvent(true);
    setEventDesc("");
    setEventType("");
    setMeetingLink("");
    setSaveToUser("");
    setSelectedFacilitators([]);
  };

  return (
    <div style={{ position: "relative" }}>
      <LoadingOverlay visible={loading} />
      <Container
        size="md"
        p="xl"
        pt={10}
        bg={"white"}
        style={{
          borderRadius: 8,
        }}
      >
        <Box bg="#f1f8e9" p="md" my="lg" style={{ borderRadius: 8 }}>
          <Stack gap={4}>
            <Title order={3} c="#146a3e">
              Event Promotion Form
            </Title>
            <Text>
              Share Events that you want to celebrate with the alumni
              association.
            </Text>

            <Paper p="md" mt="md">
              {" "}
              <Text>
                Please be advised that all submitted Event Promotions will be
                reviewed by an administrator prior to posting. Approval may take
                two to three business days.
              </Text>
            </Paper>
          </Stack>
        </Box>

        <Divider my="xl" />

        <Grid gutter="xl">
          <Grid.Col span={{ lg: 4, md: 12, sm: 12 }}>
            <Group mt="md" justify="center">
              <Image
                src={
                  eventImage
                    ? URL.createObjectURL(eventImage)
                    : "https://content.hostgator.com/img/weebly_image_sample.png"
                }
                alt="Event Pubmat Poster"
                radius="md"
                fit="contain"
                height={"auto"}
                width={300}
              />
            </Group>

            <FileInput
              label="Upload Event Image"
              onChange={(file) => setEventImage(file)}
              required
              accept="image/*"
              placeholder="Click to Upload Event Image"
              mt="md"
              clearable
              leftSection={
                <IconPhotoScan size={20} stroke={1.5} color="#cccccc" />
              }
            />
          </Grid.Col>
          <Grid.Col span={{ lg: 8, md: 12, sm: 12 }}>
            <form onSubmit={handleFormSubmit}>
              <TextInput
                label="Event Title"
                placeholder="Name of Event"
                value={eventTitle}
                onChange={(event) => setEventTitle(event.currentTarget.value)}
                required
                mb="md"
                leftSection={
                  <IconGlassChampagne size={20} stroke={1.5} color="#cccccc" />
                }
              />

              <Grid gutter="md">
                <Grid.Col span={{ lg: 6, md: 12, sm: 12 }}>
                  <DateTimePicker
                    value={eventStart}
                    onChange={setEventStart}
                    valueFormat="DD/MM/YYYY HH:mm:ss"
                    label="Event Start Date and Time"
                    placeholder="Start Date (Hour:Minute AM/PM)"
                    required
                    highlightToday
                    minDate={serverNow ? serverNow.toDate() : new Date()}
                    leftSection={
                      <IconCalendarEvent
                        size={20}
                        stroke={1.5}
                        color="#cccccc"
                      />
                    }
                  />
                </Grid.Col>

                <Grid.Col span={{ lg: 6, md: 12, sm: 12 }}>
                  <DateTimePicker
                    value={eventEnd}
                    onChange={setEventEnd}
                    valueFormat="DD/MM/YYYY HH:mm:ss"
                    label="Event End Date and Time"
                    placeholder="End Date (Hour:Minute AM/PM)"
                    required
                    highlightToday
                    minDate={serverNow ? serverNow.toDate() : new Date()}
                    leftSection={
                      <IconCalendarEvent
                        size={20}
                        stroke={1.5}
                        color="#cccccc"
                      />
                    }
                  />
                </Grid.Col>
              </Grid>
              <Select
                label="Event Type"
                placeholder="Select a category"
                data={["Online", "Face-to-Face"]}
                value={eventType}
                onChange={setEventType}
                required
                mt="lg"
                allowDeselect={false}
                leftSection={
                  <IconBlendMode size={20} stroke={1.5} color="#cccccc" />
                }
              />
              {eventType === "Online" && (
                <TextInput
                  label="Meeting Link"
                  placeholder="Enter meeting link"
                  value={meetingLink} // Set the value of meetingLink
                  onChange={(event) =>
                    setMeetingLink(event.currentTarget.value)
                  } // Update the state of meetingLink
                  required
                  mt="md"
                  leftSection={
                    <IconLink size={20} stroke={1.5} color="#cccccc" />
                  }
                />
              )}
              {eventType === "Face-to-Face" && (
                <MultiSelect
                  label="Select Alumni Facilitators"
                  placeholder="Select users"
                  data={facilitators}
                  value={selectedFacilitators}
                  onChange={setSelectedFacilitators}
                  mt="md"
                  searchable
                  clearable
                  leftSection={
                    <IconUsers size={20} stroke={1.5} color="#cccccc" />
                  }
                />
              )}
              <RadioGroup
                label="Is this a free event?"
                value={isFreeEvent.toString()}
                onChange={(value) => setIsFreeEvent(value === "true")}
                required
                mt="md"
              >
                <Group mt="xs">
                  <Radio value="true" label="Yes" />
                  <Radio value="false" label="No" />
                </Group>
              </RadioGroup>

              <Divider my="lg" />

              <Text size="sm" fw="500">
                Event Description <span style={{ color: "#fa5252" }}>*</span>
              </Text>
              <RichTextEditor content={eventDesc} setContent={setEventDesc} />

              <Group justify="flex-end" mt="md">
                <Button type="submit" color="#146a3e">
                  Submit Event Request
                </Button>
              </Group>
            </form>
          </Grid.Col>
        </Grid>
      </Container>
    </div>
  );
};

export default withAuth(RequestEventPage, ["alumni"]);

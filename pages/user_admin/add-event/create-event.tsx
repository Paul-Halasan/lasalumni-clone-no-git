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
} from "@mantine/core";
import RichTextEditorComponent from "../../../components/common/richtextbox";
import { DateTimePicker } from "@mantine/dates";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import withAuth from "../../../components/withAuth";
import { IconX, IconCheck } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import axios from "axios";
import moment from "moment-timezone";
import { getServerTime } from "../../../utils/getServerTime"; // <-- Add this import

// Extend dayjs with plugins
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);

interface Facilitator {
  label: string;
  value: string;
}

const AdminEventPage = () => {
  const [eventTitle, setEventTitle] = useState("");
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [eventStart, setEventStart] = useState<Date | null>(null);
  const [eventEnd, setEventEnd] = useState<Date | null>(null);
  const [isFreeEvent, setIsFreeEvent] = useState(true);
  const [eventDesc, setEventDesc] = useState("");
  const [eventType, setEventType] = useState<string | null>("");
  const [meetingLink, setMeetingLink] = useState("");
  const [saveToUser, setSaveToUser] = useState("");
  const [selectedFacilitators, setSelectedFacilitators] = useState<string[]>(
    []
  );
  const [facilitators, setFacilitators] = useState<Facilitator[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventCreator, setEventCreator] = useState<string | null>(null);

  // Add serverNow state
  const [serverNow, setServerNow] = useState<Date>(new Date());

  const xIcon = <IconX style={{ width: rem(20), height: rem(20) }} />;
  const checkIcon = <IconCheck style={{ width: rem(20), height: rem(20) }} />;

  useEffect(() => {
    document.title = "Create Event | Admin Dashboard";

    const fetchFacilitators = async () => {
      try {
        const response = await axios.get("/api/get_facilitators");
        const alumni = response.data.alumni;
        const formattedFacilitators = alumni.map((alum: any) => ({
          label: `${alum.first_name} ${alum.last_name}`,
          value: alum.userID,
        }));
        setFacilitators(formattedFacilitators); // Populate the MultiSelect with alumni data
      } catch (error) {
        console.error("Error fetching facilitators:", error);
      }
    };

    fetchFacilitators(); // Call the function to fetch data

    // Fetch server time
    getServerTime("datetime")
      .then((datetime) => setServerNow(new Date(datetime)))
      .catch(() => setServerNow(new Date()));
  }, []);

  const validateEventDates = () => {
    if (!eventStart || !eventEnd) {
      return false;
    }
    const now = dayjs(serverNow); // Use serverNow here
    const start = dayjs(eventStart);
    const end = dayjs(eventEnd);

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

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateEventDates()) {
      return;
    }

    setLoading(true);

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

    try {
      console.log("Selected Event Creator ID:", eventCreator);

      // Prepare the payload
      const payload = {
        eventTitle,
        eventStart,
        eventEnd,
        isFreeEvent,
        eventDesc,
        eventType,
        meetingLink,
        eventImageFileName: eventImage.name, // Assuming the image is uploaded separately
        eventCreator, // Pass the selected event creator's ID
        facilitators: selectedFacilitators, // Pass the selected facilitators' IDs
      };

      // Call the admin_submit_events API
      const response = await axios.post("/api/admin_submit_events", payload);

      if (response.status === 201) {
        handleEventSuccess();
      }
    } catch (error) {
      console.error("Error during submission:", error);
      notifications.show({
        title: "Event Creation Failed!",
        message: "Error submitting form! Please try again.",
        color: "red",
        icon: xIcon,
        autoClose: false,
      });
      setLoading(false);
    }
  };

  const handleEventSuccess = () => {
    setLoading(false);
    notifications.show({
      title: "Event Created Successfully!",
      message: "The event has been published to the platform.",
      color: "green",
      icon: checkIcon,
      autoClose: 5000,
    });

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

  const filteredFacilitators = facilitators.filter(
    (facilitator) => facilitator.value !== eventCreator
  );

  return (
    <div style={{ position: "relative" }}>
      <LoadingOverlay visible={loading} />
      <Container
        size="lg"
        p={40}
        bg={"white"}
        style={{
          borderRadius: 16,
        }}
      >
        <Stack align="center">
          <Title order={3} c="#146a3e">
            Create New Event
          </Title>
          <Text maw={750} c="dimmed" ta="center">
            Create a new event that will be immediately published to the
            platform. Please ensure all information is accurate before
            submission.
          </Text>
        </Stack>
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
                    minDate={serverNow} // Use serverNow here
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
                    minDate={serverNow} // Use serverNow here
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
              />
              <Select
                label="Event Submitted By:"
                placeholder="Select from the users list who submitted the event"
                data={facilitators}
                value={eventCreator}
                onChange={setEventCreator}
                searchable
                mt="md"
                required
              />
              <MultiSelect
                label="Facilitator/s"
                placeholder="Select or type facilitator/s"
                data={filteredFacilitators} // Use the fetched facilitators data
                value={selectedFacilitators}
                onChange={setSelectedFacilitators}
                searchable
                mt="md"
              />
              {eventType === "Online" && (
                <TextInput
                  label="Meeting Link"
                  placeholder="Enter meeting link"
                  value={meetingLink}
                  onChange={(event) =>
                    setMeetingLink(event.currentTarget.value)
                  }
                  required
                  mt="md"
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
              <RichTextEditorComponent
                content={eventDesc}
                setContent={setEventDesc}
              />

              <Group justify="flex-end" mt="md">
                <Button type="submit" color="#146a3e">
                  Create Event
                </Button>
              </Group>
            </form>
          </Grid.Col>
        </Grid>
      </Container>
    </div>
  );
};

export default withAuth(AdminEventPage, ["admin"]);

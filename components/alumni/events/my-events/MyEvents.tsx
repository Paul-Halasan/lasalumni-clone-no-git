import { useState, useEffect } from "react";
import QrScanner from "react-qr-scanner";
import { modals } from "@mantine/modals";
import {
  SimpleGrid,
  Card,
  Image,
  Text,
  Container,
  AspectRatio,
  Modal,
  Badge,
  Button,
  Group,
  Stack,
  Divider,
  Skeleton,
  Tabs,
} from "@mantine/core";
import classes from "../EventCard.module.css";
import { IconClockHour2 } from "@tabler/icons-react";
import DOMPurify from "isomorphic-dompurify";
import moment from "moment-timezone";
import axios from "axios";
import { useDisclosure } from "@mantine/hooks";
import PlaceholderNoData from "../../../common/PlaceholderNoData";

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
}

interface AttendingEvent {
  eventID: string;
  isFacilitator: boolean;
  isAttend: boolean;
}

export function MyEvents() {
  const [opened, { open, close }] = useDisclosure(false);
  const [scannerOpened, { open: openScanner, close: closeScanner }] =
    useDisclosure(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [attendingEventIDs, setAttendingEventIDs] = useState<AttendingEvent[]>(
    []
  );
  const [currentUserID, setCurrentUserID] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [useLegacyMode, setUseLegacyMode] = useState<boolean>(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [currentCameraIndex, setCurrentCameraIndex] = useState<number>(0);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  // Update the type of attendanceCounts
  const [attendanceCounts, setAttendanceCounts] = useState<
    Record<string, number>
  >({});

  const [activeTab, setActiveTab] = useState<string>("attend");

  // All your existing functions and effects remain the same
  const selectCamera = async (index: number) => {
    try {
      // Enumerate all media devices (cameras, microphones, etc.)
      const devices = await navigator.mediaDevices.enumerateDevices();

      // Filter video input devices (cameras)
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      setVideoDevices(videoDevices);

      console.log("Video devices:", videoDevices);

      if (videoDevices.length > 0) {
        const selectedDevice = videoDevices[index % videoDevices.length];
        setSelectedDeviceId(selectedDevice.deviceId);
      } else {
        console.log("No video devices found");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchCurrentUserID();
      await selectCamera(currentCameraIndex);
    };
    initialize();
  }, []);

  const fetchCurrentUserID = async () => {
    try {
      const responseID = await axios.get("/api/get_current_userid");
      if (responseID.data && responseID.data.userID) {
        setCurrentUserID(responseID.data.userID);
      } else {
        console.error("User ID not found in response:", responseID.data);
      }
    } catch (error) {
      console.error("Error fetching current user ID:", error);
    }
  };

  const fetchAttendingEvents = async (userID: string) => {
    try {
      const response = await axios.get("/api/check_event_attendance", {
        params: { userID },
      });
      setAttendingEventIDs(response.data.eventIDs);
    } catch (error) {
      console.error("Error fetching attending events:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get("/api/get_events");
      console.log("Fetched events:", response.data.events);
      setEvents(response.data.events);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
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
      console.error(
        "Error fetching attendance count for eventID:",
        eventID,
        error
      );
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchCurrentUserID();
    };
    initialize();
  }, []);

  useEffect(() => {
    const fetchAttendanceCounts = async () => {
      console.log("Fetching attendance counts...");
      const eventsToFetch = events.filter(
        (event) => !attendanceCounts[event.eventID] // Only fetch for events without recorded counts
      );

      if (eventsToFetch.length === 0) {
        console.log("All attendance counts are already cached.");
        return;
      }

      try {
        const counts = await Promise.all(
          eventsToFetch.map(async (event) => {
            const response = await axios.get("/api/get_attendance_count", {
              params: { eventID: event.eventID },
            });
            return { eventID: event.eventID, count: response.data.count };
          })
        );

        const countsMap = counts.reduce((acc, item) => {
          if (item) acc[item.eventID] = item.count;
          return acc;
        }, {} as Record<string, number>);

        setAttendanceCounts((prevCounts) => ({
          ...prevCounts,
          ...countsMap,
        }));
      } catch (error) {
        console.error("Error fetching attendance counts:", error);
      }
    };

    if (events.length > 0) {
      fetchAttendanceCounts();
    }
  }, [events]);

  useEffect(() => {
    const fetchData = async () => {
      if (currentUserID) {
        await fetchAttendingEvents(currentUserID);
        await fetchEvents();
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUserID]);

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setUseLegacyMode(true);
    }
  }, []);

  const handleCardClick = (event: Event) => {
    setSelectedEvent(event);
    open();
  };

  const getFilteredEvents = (isFacilitator: boolean) => {
    const eventIDs = attendingEventIDs
      .filter((attend) => attend.isFacilitator === isFacilitator)
      .map((attend) => attend.eventID);
    return events.filter(
      (event) =>
        eventIDs.includes(event.eventID) &&
        !moment(event.eventEnd).isBefore(moment()) // Exclude finished events
    );
  };

  const openAttendeeScanner = () => {
    openScanner();
  };

  const handleScan = async (data: any) => {
    if (data) {
      const [userID, eventID] = data.text.split("-");
      try {
        const response = await axios.get("/api/retrieve_user_event_details", {
          params: { userID, eventID },
        });

        const { first_name, last_name, eventTitle } = response.data;

        modals.open({
          title: "Welcome",
          children: (
            <Text>
              Welcome to {eventTitle}, {first_name} {last_name}
            </Text>
          ),
        });

        if (
          selectedEvent &&
          selectedEvent.eventID === eventID &&
          moment(selectedEvent.eventStart).isSame(moment(), "day")
        ) {
          await axios.post("/api/count_attendance", { userID, eventID });
        }
      } catch (error) {
        console.error("Error fetching user or event details:", error);
      }

      closeScanner();
    }
  };

  const handleError = (err: any) => {
    console.error("Error scanning QR code:", err);
  };

  const downloadQRCode = (qrCodeUrl: string, eventTitle: string) => {
    fetch(qrCodeUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `QRCode_${eventTitle}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => alert("Failed to download QR Code."));
  };

  const renderCards = (filteredEvents: Event[], isFacilitator: boolean) =>
    filteredEvents.map((event: Event) => {
      const isToday = moment()
        .tz("Asia/Manila")
        .isBetween(event.eventStart, event.eventEnd, "day", "[]");
      const isFinished = moment(event.eventEnd)
        .tz("Asia/Manila")
        .isBefore(moment().tz("Asia/Manila"));

      // Format dates for display
      const eventStart = moment(event.eventStart).tz("Asia/Manila");
      const eventEnd = moment(event.eventEnd).tz("Asia/Manila");

      let eventDuration;
      if (eventStart.isSame(eventEnd, "day")) {
        eventDuration = `${eventStart.format(
          "MMMM Do YYYY, h:mm a"
        )} - ${eventEnd.format("h:mm a")}`;
      } else {
        eventDuration = `${eventStart.format(
          "MMMM Do YYYY, h:mm a"
        )} - ${eventEnd.format("MMMM Do YYYY, h:mm a")}`;
      }

      return (
        <Card
          key={event.eventID}
          p="lg"
          radius="md"
          shadow="sm"
          className={classes.card}
          onClick={() => handleCardClick(event)}
        >
          {isFinished && (
            <div className={classes.finishedOverlay}>Event Finished</div>
          )}
          <AspectRatio ratio={1920 / 1080}>
            <Image
              src={`https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${event.eventImage}`}
            />
          </AspectRatio>

          <Stack gap="xs" mt="md">
            <Group gap="xs" align="center">
              <IconClockHour2 size={16} color="gray" />
              <Text size="sm" color="dimmed">
                {eventDuration}
              </Text>
            </Group>

            <Text fw={500} size="lg" lineClamp={2}>
              {event.eventTitle}
            </Text>

            <Text size="sm" color="dimmed">
              {isFinished
                ? `${attendanceCounts[event.eventID] || 0} people attended`
                : isToday
                ? `${
                    attendanceCounts[event.eventID] || 0
                  } people currently attending`
                : `${event.going} people going`}
            </Text>

            <Group gap="xs" mt="xs">
              {event.isFreeEvent && (
                <Badge color="green" variant="light">
                  Free
                </Badge>
              )}

              {event.eventType && (
                <Badge color="blue" variant="light">
                  {event.eventType}
                </Badge>
              )}

              {isToday && (
                <Badge color="red" variant="light">
                  Today
                </Badge>
              )}
            </Group>

            <Button
              variant="light"
              color="blue"
              fullWidth
              mt="md"
              onClick={async (e) => {
                e.stopPropagation();
                if (isFacilitator && event.eventType !== "Online") {
                  openAttendeeScanner();
                } else {
                  if (isToday) {
                    await axios.post("/api/count_attendance", {
                      userID: currentUserID,
                      eventID: event.eventID,
                    });
                  }
                  if (event.eventType === "Online") {
                    // Ensure the meeting link has a proper URL format
                    let meetingUrl = event.meetingLink;

                    // Add https:// prefix if the URL doesn't have a protocol
                    if (meetingUrl && !meetingUrl.match(/^https?:\/\//i)) {
                      meetingUrl = "https://" + meetingUrl;
                    }

                    // Open in a new tab with proper attributes
                    const newWindow = window.open(
                      meetingUrl,
                      "_blank",
                      "noopener,noreferrer"
                    );

                    // Fallback if window.open was blocked
                    if (
                      !newWindow ||
                      newWindow.closed ||
                      typeof newWindow.closed === "undefined"
                    ) {
                      // Create a temporary anchor element and click it
                      const link = document.createElement("a");
                      link.href = meetingUrl;
                      link.target = "_blank";
                      link.rel = "noopener noreferrer";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  } else {
                    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${currentUserID}-${event.eventID}&size=200x200`;
                    modals.open({
                      title: "QR Code for Attendance",
                      children: (
                        <div>
                          <Text>
                            Event Facilitators will scan this QR Code to count
                            your attendance at the event.
                          </Text>
                          <img src={qrCodeUrl} alt="QR Code" />
                          <Button
                            mt="sm"
                            onClick={() =>
                              downloadQRCode(qrCodeUrl, event.eventTitle)
                            }
                          >
                            Save QR Code to Device
                          </Button>
                          {useLegacyMode && (
                            <Button
                              mt="sm"
                              onClick={() => {
                                const input = document.createElement("input");
                                input.type = "file";
                                input.accept = "image/*";
                                input.onchange = (event: any) => {
                                  const file = event.target.files[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (e) => {
                                      const imageDataUrl = e.target?.result;
                                      if (imageDataUrl) {
                                        handleScan(imageDataUrl);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                };
                                input.click();
                              }}
                            >
                              Upload QR Code Image
                            </Button>
                          )}
                        </div>
                      ),
                    });
                  }
                }
              }}
              disabled={
                isFinished || (!isToday && event.eventType !== "Online")
              } // Disable the button if the event is finished or not today for face-to-face events
            >
              {isFinished
                ? "Event Finished"
                : isFacilitator && event.eventType !== "Online"
                ? "Open Attendee Scanner"
                : event.eventType === "Online"
                ? "Show Meeting/Registration Link"
                : isToday
                ? "Show QR Code"
                : "QR Code will be available at the day of the event"}
            </Button>
          </Stack>
        </Card>
      );
    });

  // Skeleton loading component that mimics the structure of your cards
  const renderSkeletonCards = () => {
    return Array(3)
      .fill(0)
      .map((_, index) => (
        <Card key={index} p="lg" radius="md" shadow="sm">
          <AspectRatio ratio={1920 / 1080}>
            <Skeleton height="100%" width="100%" />
          </AspectRatio>

          <Stack gap="xs" mt="md">
            <Group gap="xs">
              <Skeleton height={16} width={16} circle />
              <Skeleton height={16} width="70%" />
            </Group>
            <Skeleton height={24} width="90%" mt={8} />
            <Skeleton height={16} width="50%" mt={8} />

            <Group gap="xs" mt="xs">
              <Skeleton height={20} width={70} radius="xl" />
              <Skeleton height={20} width={70} radius="xl" />
            </Group>

            <Skeleton height={36} mt="md" width="100%" />
          </Stack>
        </Card>
      ));
  };

  return (
    <Container size="lg" p={0}>
      <Tabs
        value={activeTab}
        onChange={(value: string | null) => setActiveTab(value || "attend")}
        variant="pills"
        color="#146a3e"
      >
        <Container
          size="lg"
          bg="white"
          style={{
            borderRadius: 15,
          }}
          p={10}
          mb={30}
        >
          <Tabs.List grow>
            <Tabs.Tab value="attend" p="md">
              Events to Attend
            </Tabs.Tab>
            <Tabs.Tab value="facilitate" p="md">
              Events to Facilitate
            </Tabs.Tab>
          </Tabs.List>
        </Container>

        {/* Tab Panels with conditional rendering for PlaceholderNoData */}
        <Tabs.Panel value="attend">
          <Container size="lg" p={0}>
            {getFilteredEvents(false).length > 0 ? (
              <SimpleGrid cols={{ base: 1, sm: 3 }}>
                {renderCards(getFilteredEvents(false), false)}
              </SimpleGrid>
            ) : (
              <PlaceholderNoData
                message="No Events to Attend"
                submessage="You haven't registered for any upcoming events yet. Check out the Events page to find events you might be interested in."
              />
            )}
          </Container>
        </Tabs.Panel>

        <Tabs.Panel value="facilitate">
          <Container size="lg" p={0}>
            {getFilteredEvents(true).length > 0 ? (
              <SimpleGrid cols={{ base: 1, sm: 3 }}>
                {renderCards(getFilteredEvents(true), true)}
              </SimpleGrid>
            ) : (
              <PlaceholderNoData
                message="No Events to Facilitate"
                submessage="You're not currently assigned to facilitate any upcoming events."
              />
            )}
          </Container>
        </Tabs.Panel>
      </Tabs>

      {/* Event Details Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title={selectedEvent?.eventTitle}
        size="lg"
        centered
      >
        {selectedEvent && (
          <div>
            <AspectRatio ratio={1920 / 1080} mb="md">
              <Image
                src={`https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${selectedEvent.eventImage}`}
                alt={selectedEvent.eventTitle}
              />
            </AspectRatio>

            <Group gap="xs" mb="xs">
              {selectedEvent.isFreeEvent && (
                <Badge color="green" variant="light">
                  Free
                </Badge>
              )}
              {selectedEvent.eventType && (
                <Badge color="blue" variant="light">
                  {selectedEvent.eventType}
                </Badge>
              )}
            </Group>

            <Text fw={500} size="lg" mb="xs">
              Event Details
            </Text>

            <Group gap="xs" mb="md">
              <IconClockHour2 size={16} />
              <Text size="sm">
                {moment(selectedEvent.eventStart).format(
                  "MMMM Do YYYY, h:mm A"
                )}{" "}
                -{" "}
                {moment(selectedEvent.eventEnd).format("MMMM Do YYYY, h:mm A")}
              </Text>
            </Group>

            <Divider my="md" />

            <Text fw={500} size="lg" mb="xs">
              Description
            </Text>
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(selectedEvent.eventDesc),
              }}
            />
          </div>
        )}
      </Modal>

      {/* QR Scanner Modal */}
      <Modal
        opened={scannerOpened}
        onClose={closeScanner}
        title="Scan Attendee QR Code"
        size="md"
        centered
      >
        <div>
          {videoDevices.length > 1 && (
            <Button
              mb="md"
              onClick={() => {
                const newIndex = (currentCameraIndex + 1) % videoDevices.length;
                setCurrentCameraIndex(newIndex);
                selectCamera(newIndex);
              }}
            >
              Switch Camera
            </Button>
          )}

          {!useLegacyMode ? (
            <QrScanner
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: "100%" }}
              constraints={
                selectedDeviceId
                  ? {
                      video: { deviceId: selectedDeviceId },
                    }
                  : undefined
              }
            />
          ) : (
            <div>
              <Text mb="md">
                Camera access is not available. Please upload a QR code image
                instead.
              </Text>
              <Button
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = (event: any) => {
                    const file = event.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const imageDataUrl = e.target?.result;
                        if (imageDataUrl) {
                          handleScan({ text: imageDataUrl });
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                }}
              >
                Upload QR Code Image
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </Container>
  );
}

export default MyEvents;

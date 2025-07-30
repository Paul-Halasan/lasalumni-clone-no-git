import React, { useMemo, useState, useEffect } from "react";
import {
  AppShell,
  Image,
  Burger,
  Group,
  NavLink,
  ScrollArea,
  Button,
  ActionIcon,
  Menu,
  Loader,
  Stack,
  Indicator,
  Paper,
  Text,
  Divider,
  Badge,
  Avatar,
  Center,
  Modal,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./AlumniNav.module.css";
import {
  IconBell,
  IconBellOff,
  IconCheck,
  IconHeartHandshake,
  IconCalendarEvent,
  IconBriefcase2,
  IconUser,
  IconInfoCircle,
  IconHome2,
  IconUserSearch,
  IconLogout2,
} from "@tabler/icons-react";
import axios from "axios";
import router from "next/router";
import useSWR, { mutate } from "swr";
import moment from "moment";
import Head from "next/head"; // Import Head from next/head

interface AlumniLayoutProps {
  children?: React.ReactNode;
}

const fetcher = async (url: string) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    if ((error as any).response && (error as any).response.status === 401) {
      // Attempt to refresh the access token
      try {
        await axios.post("/api/refresh");
        // Retry the original request
        const response = await axios.get(url);
        return response.data;
      } catch (refreshError) {
        console.error("Error refreshing access token:", refreshError);
        throw refreshError;
      }
    } else {
      throw error;
    }
  }
};

const AlumniLayout: React.FC<AlumniLayoutProps> = ({ children }) => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const [activeComponent, setActiveComponent] = useState<React.ReactNode>(null);
  const [active, setActive] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [pageTitle, setPageTitle] = useState<string>("Animo Connect"); // State for page title

  const [modalOpened, setModalOpened] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  interface Notification {
    notifID: string;
    message: string;
    created_at: string;
    directTo: string;
    isRead: number;
    userID?: string;
    updated_at?: string;
  }

  const {
    data: notifications,
    error,
    isValidating,
  } = useSWR<Notification[]>(
    "/api/get_notification",
    fetcher,
    { refreshInterval: 10000 } // Increased to 10 seconds for better performance
  );
  // Filter and sort notifications
  const unreadNotifications = notifications
    ? notifications.filter((notif) => notif.isRead === 0)
    : [];
  const hasUnreadNotifications = unreadNotifications.length > 0;

  // Sort notifications to show unread ones first
  const sortedNotifications = notifications
    ? [...notifications].sort((a, b) =>
        a.isRead === b.isRead ? 0 : a.isRead ? 1 : -1
      )
    : [];

  const getNotificationIcon = (directTo: string) => {
    switch (directTo) {
      case "donation-drives":
        return <IconHeartHandshake size="1rem" />;
      case "events":
      case "event-calendar":
      case "my-events":
      case "request-event":
        return <IconCalendarEvent size="1rem" />;
      case "view-jobs":
      case "create-job":
      case "manage-job":
      case "partner-companies":
        return <IconBriefcase2 size="1rem" />;
      case "user-profile":
      case "edit-profile":
      case "search-alumni":
        return <IconUser size="1rem" />;
      case "animo-feed":
        return <IconHome2 size="1rem" />;
      default:
        return <IconBell size="1rem" />;
    }
  };

  const getNotificationColor = (directTo: string) => {
    switch (directTo) {
      case "donation-drives":
      case "submit-ddr":
        return "red";
      case "events":
      case "event-calendar":
      case "my-events":
      case "request-event":
        return "blue";
      case "view-jobs":
      case "create-job":
      case "manage-job":
      case "partner-companies":
        return "orange";
      case "user-profile":
      case "edit-profile":
      case "search-alumni":
        return "grape";
      case "animo-feed":
        return "green";
      default:
        return "gray";
    }
  };

  // Map of page keys to human-readable titles
  const pageTitles = useMemo(
    () => ({
      "animo-feed": "Animo Feed",
      "donation-drives": "Donation Drives",
      "search-alumni": "Alumni Directory",
      "user-profile": "My Profile",
      "edit-profile": "Edit Profile",
      "request-event": "Request Event",
      "my-events": "My Events",
      "view-jobs": "Job Listings",
      "create-job": "Post Job Opportunity",
      "manage-job": "Manage Job Listings",
      "event-calendar": "Event Calendar",
      "submit-ddr": "Submit Donation Drive Request",
      "partner-companies": "Partner Companies",
    }),
    []
  );

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await axios.post(`/api/mark_notification_as_read`, {
        id: notificationId,
      });
      // Update the notifications data
      mutate("/api/get_notification");
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Function to mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      await axios.post("/api/mark_all_notifications_as_read");
      mutate("/api/get_notification");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Render notification item function
  const renderNotificationItem = (notification: Notification) => (
    <Menu.Item
      key={notification.notifID}
      onClick={() => handleNotificationClick(notification)}
      py="sm"
      styles={{
        item: {
          padding: 0,
          transition: "all 0.2s ease",
          borderLeft:
            notification.isRead === 0
              ? "3px solid var(--mantine-color-green-5)"
              : "3px solid transparent",
          backgroundColor:
            notification.isRead === 0
              ? "var(--mantine-color-green-0)"
              : "transparent",
          "&:hover": {
            backgroundColor: "var(--mantine-color-gray-1)",
          },
        },
      }}
    >
      <Group wrap="nowrap" px="md" gap="md">
        <Avatar
          size="md"
          radius="xl"
          color={getNotificationColor(notification.directTo)}
          variant="light"
        >
          {getNotificationIcon(notification.directTo)}
        </Avatar>
        <div style={{ flex: 1 }}>
          <Text
            size="sm"
            fw={notification.isRead === 0 ? 600 : 400}
            lineClamp={2}
          >
            {notification.message}
          </Text>
          <Group justify="space-between" mt={4}>
            <Text size="xs" c="dimmed">
              {moment(notification.created_at).fromNow()}
            </Text>
            {notification.isRead === 0 && (
              <Badge size="xs" color="green" variant="dot" radius="xl">
                New
              </Badge>
            )}
          </Group>
        </div>
      </Group>
    </Menu.Item>
  );

  // Update the handleNotificationClick function
  const handleNotificationClick = (notification: Notification) => {
    // Mark notification as read if it's unread
    if (notification.isRead === 0) {
      markNotificationAsRead(notification.notifID);
    }

    // Show the modal with details
    setSelectedNotification(notification);
    setModalOpened(true);
  };

  const PlaceholderComponent = () => (
    <div>
      <h1>Page Under Construction</h1>
      <p>This page is coming soon!</p>
    </div>
  );

  const loadPageComponent = async (page: string) => {
    try {
      let Component: React.ComponentType;

      switch (page) {
        case "animo-feed":
          Component = (
            await import("../../pages/user_alumni/animo-feed/feedpage")
          ).default;
          break;
        case "donation-drives":
          Component = (
            await import("../../pages/user_alumni/donation-drives/page")
          ).default;
          break;
        case "search-alumni":
          Component = (
            await import("../../pages/user_alumni/search-alumni/page")
          ).default;
          break;
        case "user-profile":
          Component = (
            await import("../../pages/user_alumni/alumni-profile/profile-main")
          ).default;
          break;
        case "edit-profile":
          Component = (
            await import("../../pages/user_alumni/alumni-profile/edit-profile")
          ).default;
          break;
        case "request-event":
          Component = (
            await import("../../pages/user_alumni/events/request-events")
          ).default;
          break;
        case "my-events":
          Component = (await import("../../pages/user_alumni/events/my-events"))
            .default;
          break;
        case "view-jobs":
          Component = (await import("../../pages/user_alumni/jobs/view-jobs"))
            .default;
          break;
        case "create-job":
          Component = (await import("../../pages/user_alumni/jobs/create-job"))
            .default;
          break;
        case "manage-job":
          Component = (await import("../../pages/user_alumni/jobs/manage-jobs"))
            .default;
          break;

        case "event-calendar":
          Component = (
            await import("../../pages/user_alumni/events/event-calendar")
          ).default;
          break;
        case "submit-ddr":
          Component = (
            await import("../../pages/user_alumni/donation-drives/request-dd")
          ).default;
          break;

        case "partner-catalog":
          Component = (
            await import("../../pages/user_alumni/jobs/partner-catalog")
          ).default;
          break;
        default:
          Component = PlaceholderComponent;
      }

      return Component;
    } catch (error) {
      return () => <div>Error loading component</div>;
    }
  };

  const handleLinkClick = async (
    page: string | undefined,
    hasChildren: boolean = false
  ) => {
    if (!page) return;
    setLoading(true);
    router.push(`?page=${page}`);

    if (hasChildren) {
      setActive(page);
      if (mobileOpened) {
        toggleMobile();
      }
      setLoading(false);
      return;
    }

    // Set the document title based on the page
    const title =
      pageTitles[page as keyof typeof pageTitles] || "Animo Connect";
    setPageTitle(title);
    document.title = `Alumni | ${title}`;

    const Component = await loadPageComponent(page);
    setActiveComponent(<Component />);
    setActive(page);
    setLoading(false);

    if (mobileOpened) {
      toggleMobile();
    }
  };

  interface NavLink {
    id: number;
    label: string;
    icon?: React.ReactNode;
    page?: string;
    children?: { id: number; label: string; page: string }[];
  }
  const navLinks: NavLink[] = useMemo(
    () => [
      {
        id: 0,
        label: "Animo Feed",
        icon: <IconHome2 size="1.3rem" stroke={2} />,
        page: "animo-feed",
      },

      {
        id: 1,
        label: "Search Alumni",
        icon: <IconUserSearch size="1.3rem" stroke={2} />,
        page: "search-alumni",
      },
      {
        id: 2,
        label: "Opportunities",
        icon: <IconBriefcase2 size="1.3rem" stroke={2} />,
        children: [
          { id: 0, label: "Job Search", page: "view-jobs" },
          { id: 1, label: "Partner Companies", page: "partner-catalog" },
          { id: 2, label: "Give Job Opportunities", page: "create-job" },
          { id: 3, label: "Manage Job Opportunities", page: "manage-job" },
        ],
      },
      {
        id: 3,
        label: "Events",
        icon: <IconCalendarEvent size="1.3rem" stroke={2} />,
        children: [
          { id: 0, label: "Event Calendar", page: "event-calendar" },
          { id: 1, label: "My Events", page: "my-events" },
          {
            id: 2,
            label: "Submit an Event Promotion Request",
            page: "request-event",
          },
        ],
      },
      {
        id: 4,
        label: "Donation Drives",
        icon: <IconHeartHandshake size="1.3rem" stroke={2} />,

        children: [
          { id: 0, label: "All donation drives", page: "donation-drives" },
          { id: 1, label: "Submit donation drive request", page: "submit-ddr" },
        ],
      },
    ],
    []
  );

  useEffect(() => {
    const currentPage = new URLSearchParams(window.location.search).get("page");
    if (currentPage) {
      const loadComponent = async () => {
        // Set the document title based on the page
        const title =
          pageTitles[currentPage as keyof typeof pageTitles] || "Animo Connect";
        setPageTitle(title);
        document.title = `Alumni | ${title}`;

        const Component = await loadPageComponent(currentPage);
        setActiveComponent(<Component />);
        setActive(currentPage);
      };
      loadComponent();
    } else {
      // Set the first nav link as the initial active component
      const firstLink = navLinks[0];
      handleLinkClick(firstLink.page);
      window.history.pushState(null, "", window.location.href);
    }

    const handlePopState = async (event: PopStateEvent) => {
      const page =
        new URLSearchParams(window.location.search).get("page") || "";

      // Update page title when using browser back/forward buttons
      const title =
        pageTitles[page as keyof typeof pageTitles] || "Animo Connect";
      setPageTitle(title);
      document.title = `Alumni | ${title}`;

      const Component = await loadPageComponent(page);
      setActiveComponent(<Component />);
      setActive(page);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout");

      router.replace("/?page=login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <>
      <Head>
        <title>Alumni | {pageTitle}</title>
      </Head>
      <AppShell
        layout="alt"
        header={{ height: 60 }}
        navbar={{
          width: 270,
          breakpoint: "sm",
          collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
        }}
        padding={"md"}
      >
        <AppShell.Header className={classes.shellHeader}>
          <Group>
            <Burger
              title="Toggle Navigation Menu"
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="sm"
            />
            <Burger
              title="Toggle Navigation Menu"
              opened={desktopOpened}
              onClick={toggleDesktop}
              visibleFrom="sm"
              size="sm"
            />
            <Image
              alt="Animo Logo"
              src="/logo2.png"
              fit="contain"
              className={classes.logo}
              onClick={() => handleLinkClick("animo-feed")}
              visibleFrom="sm"
            />
          </Group>

          <Group gap="xs">
            <Menu
              position="bottom-end"
              width={350}
              shadow="md"
              withArrow
              arrowPosition="center"
            >
              <Menu.Target>
                <Indicator
                  disabled={!hasUnreadNotifications}
                  color="red"
                  size={16}
                  offset={4}
                  label={unreadNotifications.length}
                  withBorder
                >
                  <ActionIcon
                    title="Notifications"
                    variant="outline"
                    radius="md"
                    size="lg"
                    color={hasUnreadNotifications ? "green" : "gray.6"}
                  >
                    <IconBell size="1.5rem" stroke={2} />
                  </ActionIcon>
                </Indicator>
              </Menu.Target>

              <Menu.Dropdown p={0}>
                <Paper radius="md" withBorder={false}>
                  {/* Header with clean design */}
                  <Group
                    justify="space-between"
                    p="md"
                    style={{
                      borderBottom: "1px solid var(--mantine-color-gray-2)",
                    }}
                  >
                    <Text fw={700} size="xl" c="dark">
                      Notifications
                    </Text>
                    {hasUnreadNotifications && (
                      <Badge color="red" variant="light" size="sm" radius="xl">
                        {unreadNotifications.length} new
                      </Badge>
                    )}
                  </Group>

                  <Divider />

                  <ScrollArea
                    h={notifications && notifications.length > 0 ? 500 : 120}
                    offsetScrollbars
                  >
                    {notifications && notifications.length > 0 ? (
                      <Stack gap={4} p="xs">
                        {/* Group notifications by time period */}
                        {(() => {
                          // Create time-based groups
                          const today = moment().startOf("day");
                          const thisWeek = moment()
                            .subtract(7, "days")
                            .startOf("day");
                          const thisMonth = moment()
                            .subtract(30, "days")
                            .startOf("day");

                          // Group notifications
                          const todayNotifs: Notification[] = [];
                          const weekNotifs: Notification[] = [];
                          const monthNotifs: Notification[] = [];
                          const olderNotifs: Notification[] = [];

                          sortedNotifications.forEach((notification) => {
                            const notifDate = moment(notification.created_at);

                            if (notifDate.isSameOrAfter(today)) {
                              todayNotifs.push(notification);
                            } else if (notifDate.isSameOrAfter(thisWeek)) {
                              weekNotifs.push(notification);
                            } else if (notifDate.isSameOrAfter(thisMonth)) {
                              monthNotifs.push(notification);
                            } else {
                              olderNotifs.push(notification);
                            }
                          });

                          // Generate the grouped UI with more spacing
                          return (
                            <>
                              {todayNotifs.length > 0 && (
                                <>
                                  <Text
                                    py="md"
                                    px="sm"
                                    size="xs"
                                    fw={600}
                                    c="dimmed"
                                  >
                                    TODAY
                                  </Text>
                                  {todayNotifs.map((notification) => (
                                    <Menu.Item
                                      key={notification.notifID}
                                      onClick={() =>
                                        handleNotificationClick(notification)
                                      }
                                      py="md"
                                      styles={{
                                        item: {
                                          padding: 0,
                                          transition: "all 0.2s ease",
                                          borderLeft:
                                            notification.isRead === 0
                                              ? "3px solid var(--mantine-color-green-5)"
                                              : "3px solid transparent",
                                          backgroundColor:
                                            notification.isRead === 0
                                              ? "var(--mantine-color-green-0)"
                                              : "transparent",
                                          "&:hover": {
                                            backgroundColor:
                                              "var(--mantine-color-gray-0)",
                                          },
                                          marginBottom: 4,
                                        },
                                      }}
                                    >
                                      <Group wrap="nowrap" px="md" gap="md">
                                        <Avatar
                                          size="md"
                                          radius="xl"
                                          color={getNotificationColor(
                                            notification.directTo
                                          )}
                                          variant="light"
                                        >
                                          {getNotificationIcon(
                                            notification.directTo
                                          )}
                                        </Avatar>
                                        <div style={{ flex: 1 }}>
                                          <Text
                                            size="sm"
                                            fw={
                                              notification.isRead === 0
                                                ? 600
                                                : 400
                                            }
                                            lineClamp={2}
                                          >
                                            {notification.message}
                                          </Text>
                                          <Group justify="space-between" mt={4}>
                                            <Text size="xs" c="dimmed">
                                              {moment(
                                                notification.created_at
                                              ).fromNow()}
                                            </Text>
                                            {notification.isRead === 0 && (
                                              <Badge
                                                size="xs"
                                                color="green"
                                                variant="dot"
                                                radius="xl"
                                              >
                                                New
                                              </Badge>
                                            )}
                                          </Group>
                                        </div>
                                      </Group>
                                    </Menu.Item>
                                  ))}
                                </>
                              )}

                              {weekNotifs.length > 0 && (
                                <>
                                  <Text
                                    py="md"
                                    px="sm"
                                    size="xs"
                                    fw={600}
                                    c="dimmed"
                                  >
                                    THIS WEEK
                                  </Text>
                                  {weekNotifs.map((notification) => (
                                    <Menu.Item
                                      key={notification.notifID}
                                      onClick={() =>
                                        handleNotificationClick(notification)
                                      }
                                      py="md"
                                      styles={{
                                        item: {
                                          padding: 0,
                                          transition: "all 0.2s ease",
                                          borderLeft:
                                            notification.isRead === 0
                                              ? "3px solid var(--mantine-color-green-5)"
                                              : "3px solid transparent",
                                          backgroundColor:
                                            notification.isRead === 0
                                              ? "var(--mantine-color-green-0)"
                                              : "transparent",
                                          "&:hover": {
                                            backgroundColor:
                                              "var(--mantine-color-gray-0)",
                                          },
                                          marginBottom: 4,
                                        },
                                      }}
                                    >
                                      <Group wrap="nowrap" px="md" gap="md">
                                        <Avatar
                                          size="md"
                                          radius="xl"
                                          color={getNotificationColor(
                                            notification.directTo
                                          )}
                                          variant="light"
                                        >
                                          {getNotificationIcon(
                                            notification.directTo
                                          )}
                                        </Avatar>
                                        <div style={{ flex: 1 }}>
                                          <Text
                                            size="sm"
                                            fw={
                                              notification.isRead === 0
                                                ? 600
                                                : 400
                                            }
                                            lineClamp={2}
                                          >
                                            {notification.message}
                                          </Text>
                                          <Group justify="space-between" mt={4}>
                                            <Text size="xs" c="dimmed">
                                              {moment(
                                                notification.created_at
                                              ).fromNow()}
                                            </Text>
                                            {notification.isRead === 0 && (
                                              <Badge
                                                size="xs"
                                                color="green"
                                                variant="dot"
                                                radius="xl"
                                              >
                                                New
                                              </Badge>
                                            )}
                                          </Group>
                                        </div>
                                      </Group>
                                    </Menu.Item>
                                  ))}
                                </>
                              )}

                              {monthNotifs.length > 0 && (
                                <>
                                  <Text
                                    py="md"
                                    px="sm"
                                    size="xs"
                                    fw={600}
                                    c="dimmed"
                                  >
                                    THIS MONTH
                                  </Text>
                                  {monthNotifs.map((notification) => (
                                    <Menu.Item
                                      key={notification.notifID}
                                      onClick={() =>
                                        handleNotificationClick(notification)
                                      }
                                      py="md"
                                      styles={{
                                        item: {
                                          padding: 0,
                                          transition: "all 0.2s ease",
                                          borderLeft:
                                            notification.isRead === 0
                                              ? "3px solid var(--mantine-color-green-5)"
                                              : "3px solid transparent",
                                          backgroundColor:
                                            notification.isRead === 0
                                              ? "var(--mantine-color-green-0)"
                                              : "transparent",
                                          "&:hover": {
                                            backgroundColor:
                                              "var(--mantine-color-gray-0)",
                                          },
                                          marginBottom: 4,
                                        },
                                      }}
                                    >
                                      <Group wrap="nowrap" px="md" gap="md">
                                        <Avatar
                                          size="md"
                                          radius="xl"
                                          color={getNotificationColor(
                                            notification.directTo
                                          )}
                                          variant="light"
                                        >
                                          {getNotificationIcon(
                                            notification.directTo
                                          )}
                                        </Avatar>
                                        <div style={{ flex: 1 }}>
                                          <Text
                                            size="sm"
                                            fw={
                                              notification.isRead === 0
                                                ? 600
                                                : 400
                                            }
                                            lineClamp={2}
                                          >
                                            {notification.message}
                                          </Text>
                                          <Group justify="space-between" mt={4}>
                                            <Text size="xs" c="dimmed">
                                              {moment(
                                                notification.created_at
                                              ).fromNow()}
                                            </Text>
                                            {notification.isRead === 0 && (
                                              <Badge
                                                size="xs"
                                                color="green"
                                                variant="dot"
                                                radius="xl"
                                              >
                                                New
                                              </Badge>
                                            )}
                                          </Group>
                                        </div>
                                      </Group>
                                    </Menu.Item>
                                  ))}
                                </>
                              )}

                              {olderNotifs.length > 0 && (
                                <>
                                  <Text
                                    py="md"
                                    px="sm"
                                    size="xs"
                                    fw={600}
                                    c="dimmed"
                                  >
                                    OLDER
                                  </Text>
                                  {olderNotifs.map((notification) => (
                                    <Menu.Item
                                      key={notification.notifID}
                                      onClick={() =>
                                        handleNotificationClick(notification)
                                      }
                                      py="md"
                                      styles={{
                                        item: {
                                          padding: 0,
                                          transition: "all 0.2s ease",
                                          borderLeft:
                                            notification.isRead === 0
                                              ? "3px solid var(--mantine-color-green-5)"
                                              : "3px solid transparent",
                                          backgroundColor:
                                            notification.isRead === 0
                                              ? "var(--mantine-color-green-0)"
                                              : "transparent",
                                          "&:hover": {
                                            backgroundColor:
                                              "var(--mantine-color-gray-0)",
                                          },
                                          marginBottom: 4,
                                        },
                                      }}
                                    >
                                      <Group wrap="nowrap" px="md" gap="md">
                                        <Avatar
                                          size="md"
                                          radius="xl"
                                          color={getNotificationColor(
                                            notification.directTo
                                          )}
                                          variant="light"
                                        >
                                          {getNotificationIcon(
                                            notification.directTo
                                          )}
                                        </Avatar>
                                        <div style={{ flex: 1 }}>
                                          <Text
                                            size="sm"
                                            fw={
                                              notification.isRead === 0
                                                ? 600
                                                : 400
                                            }
                                            lineClamp={2}
                                          >
                                            {notification.message}
                                          </Text>
                                          <Group justify="space-between" mt={4}>
                                            <Text size="xs" c="dimmed">
                                              {moment(
                                                notification.created_at
                                              ).fromNow()}
                                            </Text>
                                            {notification.isRead === 0 && (
                                              <Badge
                                                size="xs"
                                                color="green"
                                                variant="dot"
                                                radius="xl"
                                              >
                                                New
                                              </Badge>
                                            )}
                                          </Group>
                                        </div>
                                      </Group>
                                    </Menu.Item>
                                  ))}
                                </>
                              )}
                            </>
                          );
                        })()}
                      </Stack>
                    ) : (
                      <Center py="xl">
                        <Stack align="center" gap="md">
                          <Avatar size="xl" radius="xl" color="gray.1">
                            <IconBellOff
                              size="2rem"
                              stroke={1.5}
                              color="gray"
                            />
                          </Avatar>
                          <div>
                            <Text ta="center" fw={600}>
                              No notifications
                            </Text>
                            <Text c="dimmed" size="sm" ta="center">
                              You&apos;re all caught up!
                            </Text>
                          </div>
                        </Stack>
                      </Center>
                    )}
                  </ScrollArea>

                  {hasUnreadNotifications && (
                    <>
                      <Divider />
                      <Group p="md" grow>
                        <Button
                          variant="light"
                          color="#146a3e"
                          size="sm"
                          leftSection={<IconCheck size="0.9rem" />}
                          onClick={markAllNotificationsAsRead}
                          radius="md"
                        >
                          Mark all as read
                        </Button>
                      </Group>
                    </>
                  )}
                </Paper>
              </Menu.Dropdown>
            </Menu>

            <Group>
              <ActionIcon
                title="User Profile"
                variant="filled"
                radius="md"
                size="lg"
                color="#146a3e"
                component="a"
                href="?page=user-profile"
              >
                <IconUser size="1.5rem" stroke={2} />
              </ActionIcon>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar>
          <nav className={classes.navbar}>
            <div className={classes.header}>
              <Stack>
                {mobileOpened ? (
                  <Image
                    alt="Animo Logo"
                    src="/logo2.png"
                    fit="contain"
                    className={classes.logo}
                    onClick={() => handleLinkClick("animo-feed")}
                  />
                ) : null}

                <p
                  style={{
                    color: "#146a3e",
                    fontSize: "14px",
                    fontWeight: "bolder",
                  }}
                >
                  NAVIGATION MENU
                </p>
              </Stack>
              <Burger
                title="Toggle Navigation Menu"
                opened={mobileOpened}
                onClick={toggleMobile}
                hiddenFrom="sm"
                size="sm"
              />
            </div>
            <ScrollArea>
              <div className={classes.linksInner}>
                {navLinks.map((link) => (
                  <NavLink
                    styles={{ label: { fontSize: "15px" } }}
                    key={`parent-${link.id}`}
                    p="md"
                    label={link.label}
                    leftSection={link.icon}
                    active={active === link.page}
                    onClick={(e) => {
                      if (link.page === "external-link") {
                        return;
                      }
                      e.preventDefault();
                      handleLinkClick(link.page, !!link.children);
                    }}
                    color="rgba(255, 255, 255, 1)"
                    variant="filled"
                    autoContrast
                    classNames={{
                      root:
                        active === link.page
                          ? classes.navLinkActive
                          : classes.navLinkRoot,
                    }}
                    component="a"
                    href={link.page ? `?page=${link.page}` : "#"}
                    target={link.page === "external-link" ? "_blank" : "_self"}
                  >
                    {link.children &&
                      link.children.map((child) => (
                        <NavLink
                          key={`child-${child.id}`}
                          label={child.label}
                          onClick={(e) => {
                            if (child.page === "external-link") {
                              return;
                            }
                            e.preventDefault();
                            handleLinkClick(child.page);
                          }}
                          active={active === child.page}
                          className={classes.borderleft}
                          color="rgba(255, 255, 255, 1)"
                          variant="filled"
                          autoContrast
                          classNames={{
                            root:
                              active === child.page
                                ? classes.navLinkActive
                                : classes.navLinkChild,
                          }}
                          component="a"
                          href={`?page=${child.page}`}
                          target={
                            child.page === "external-link" ? "_blank" : "_self"
                          }
                          tabIndex={link.children ? -1 : 0}
                        />
                      ))}
                  </NavLink>
                ))}
              </div>
            </ScrollArea>
          </nav>

          <div className={classes.footer}>
            <Button
              title="Log Out"
              variant="solid"
              color="white"
              leftSection={<IconLogout2 size="1.3rem" stroke={1.5} />}
              onClick={handleLogout}
              className={classes.logoutButton}
            >
              Log Out
            </Button>
          </div>
        </AppShell.Navbar>

        <AppShell.Main
          className={mobileOpened ? classes.mainContentHidden : ""}
          style={{
            backgroundColor: "#f5f5f5",
          }}
        >
          {loading ? <Loader /> : activeComponent}
        </AppShell.Main>

        <Modal
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          title={
            <Group>
              <Avatar
                size="sm"
                radius="xl"
                color={
                  selectedNotification
                    ? getNotificationColor(selectedNotification.directTo)
                    : "green"
                }
                variant="filled"
              >
                {selectedNotification ? (
                  getNotificationIcon(selectedNotification.directTo)
                ) : (
                  <IconBell size="1rem" />
                )}
              </Avatar>
              <Text>Notification</Text>
            </Group>
          }
          centered
        >
          {selectedNotification && (
            <Stack>
              <Text>{selectedNotification.message}</Text>
              <Text size="sm" c="dimmed">
                {moment(selectedNotification.created_at).format(
                  "MMMM Do YYYY, h:mm a"
                )}
              </Text>
            </Stack>
          )}
        </Modal>
      </AppShell>
    </>
  );
};

export default AlumniLayout;

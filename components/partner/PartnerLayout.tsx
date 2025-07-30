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
  Modal,
  Indicator,
  Paper,
  Text,
  Divider,
  Badge,
  Avatar,
  Center,
  Stack,
  Loader,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./PartnerNav.module.css";
import {
  IconHome2,
  IconHeartHandshake,
  IconLogout2,
  IconBell,
  IconUser,
  IconCalendarEvent,
  IconBriefcase2,
  IconSchool,
  IconFolderPlus,
} from "@tabler/icons-react";
import axios from "axios";
import router from "next/router";
import useSWR, { mutate } from "swr";
import moment from "moment";

interface PartnerLayoutProps {
  children?: React.ReactNode;
}

interface Notification {
  notifID: string;
  message: string;
  created_at: string;
  directTo: string;
  isRead: number;
  userID?: string;
  updated_at?: string;
}

const fetcher = async (url: string) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    if ((error as any).response && (error as any).response.status === 401) {
      try {
        await axios.post("/api/refresh");
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

const PartnerLayout: React.FC<PartnerLayoutProps> = ({ children }) => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const [activeComponent, setActiveComponent] = useState<React.ReactNode>(null);
  const [active, setActive] = useState<string>("");
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  const {
    data: notifications,
    error,
    isValidating,
  } = useSWR<Notification[]>("/api/get_notification", fetcher, {
    refreshInterval: 10000,
  });

  const unreadNotifications = notifications
    ? notifications.filter((notif) => notif.isRead === 0)
    : [];
  const hasUnreadNotifications = unreadNotifications.length > 0;

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
      case "partner-dashboard":
        return <IconHome2 size="1rem" />;
      default:
        return <IconBell size="1rem" />;
    }
  };

  const getNotificationColor = (directTo: string) => {
    switch (directTo) {
      case "donation-drives":
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
      case "partner-dashboard":
        return "green";
      default:
        return "gray";
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await axios.post(`/api/mark_notification_as_read`, {
        id: notificationId,
      });
      mutate("/api/get_notification");
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      setIsMarkingAllRead(true);
      await axios.post("/api/mark_all_notifications_as_read");
      await mutate("/api/get_notification");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.isRead === 0) {
      markNotificationAsRead(notification.notifID);
    }
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
        case "partner-dashboard":
          Component = (
            await import("../../pages/user_partner/dashboard/dashboard")
          ).default;
          break;
        case "job-posting":
          Component = (await import("../../pages/user_partner/job/create_job"))
            .default;
          break;
        case "display-jobs":
          Component = (
            await import("../../pages/user_partner/job/display_jobs")
          ).default;
          break;
        case "partner-profile":
          Component = (
            await import(
              "../../pages/user_partner/partner-profile/profile-page"
            )
          ).default;
          break;
        case "user-profile":
          Component = (
            await import("../../pages/user_partner/alumni/alumni-profile")
          ).default;
          break;
        case "partner-alumni":
          Component = (
            await import("../../pages/user_partner/alumni/alumni-search")
          ).default;
          break;

        case "edit-partner-profile":
          Component = (
            await import(
              "../../pages/user_partner/partner-profile/edit-partner-profile"
            )
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
    page: string,
    hasChildren: boolean = false
  ) => {
    router.push(`?page=${page}`);

    const Component = await loadPageComponent(page);
    setActiveComponent(<Component />);
    setActive(page);

    if (!hasChildren && mobileOpened) {
      toggleMobile();
    }
  };

  const navLinks = useMemo(
    () => [
      {
        label: "Dashboard",
        icon: <IconHome2 size="1.3rem" stroke={2} />,
        page: "partner-dashboard",
      },
      {
        label: "Add Job Posting",
        icon: <IconFolderPlus size="1.3rem" stroke={2} />,
        page: "job-posting",
      },
      {
        label: "Posted Jobs",
        icon: <IconBriefcase2 size="1.3rem" stroke={2} />,
        page: "display-jobs",
      },
      {
        label: "Search Alumni Catalog",
        icon: <IconSchool size="1.3rem" stroke={2} />,
        page: "partner-alumni",
      },
    ],
    []
  );

  useEffect(() => {
    const currentPage = new URLSearchParams(window.location.search).get("page");
    if (currentPage) {
      const loadComponent = async () => {
        const Component = await loadPageComponent(currentPage);
        setActiveComponent(<Component />);
        setActive(currentPage);
      };
      loadComponent();
    } else {
      const firstLink = navLinks[0];
      handleLinkClick(firstLink.page);
      window.history.pushState(null, "", window.location.href);
    }

    const handlePopState = async (event: PopStateEvent) => {
      const page =
        new URLSearchParams(window.location.search).get("page") || "";
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
    <AppShell
      layout="alt"
      header={{ height: 60 }}
      navbar={{
        width: 270,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header className={classes.shellHeader}>
        <Group>
          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            hiddenFrom="sm"
            size="sm"
          />
          <Burger
            opened={desktopOpened}
            onClick={toggleDesktop}
            visibleFrom="sm"
            size="sm"
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
                      {sortedNotifications.map((notification) => (
                        <Menu.Item
                          key={notification.notifID}
                          onClick={() => handleNotificationClick(notification)}
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
                                backgroundColor: "var(--mantine-color-gray-0)",
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
                    </Stack>
                  ) : (
                    <Center h={120}>
                      <Text c="dimmed">No notifications</Text>
                    </Center>
                  )}
                </ScrollArea>
                {notifications && notifications.length > 0 && (
                  <Button
                    fullWidth
                    variant="light"
                    color="gray"
                    onClick={markAllNotificationsAsRead}
                    disabled={isMarkingAllRead}
                  >
                    {isMarkingAllRead ? (
                      <Loader size="sm" color="gray" />
                    ) : (
                      "Mark all as read"
                    )}
                  </Button>
                )}
              </Paper>
            </Menu.Dropdown>
          </Menu>

          <Group>
            <ActionIcon
              variant="outline"
              radius="md"
              size="lg"
              color="#ff851b"
              onClick={() => handleLinkClick("partner-profile")}
            >
              <IconUser size="1.5rem" stroke={2} />
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        <nav className={classes.navbar}>
          <div className={classes.header}>
            <Image src="/partnerlogo.png" w={240} fit="contain" />
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="sm"
            />
          </div>
          <ScrollArea className={classes.links}>
            <div className={classes.linksInner}>
              {navLinks.map((link) => (
                <NavLink
                  key={link.label}
                  p="md"
                  label={link.label}
                  leftSection={link.icon}
                  active={active === link.page}
                  onClick={(e) => {
                    if (link.page === "external-link") {
                      return;
                    }
                    e.preventDefault();
                    handleLinkClick(link.page);
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
                  href={`?page=${link.page}`}
                  target={link.page === "external-link" ? "_blank" : "_self"}
                />
              ))}
            </div>
          </ScrollArea>

          <div className={classes.footer}>
            <Button
              variant="solid"
              color="white"
              leftSection={<IconLogout2 size="1.3rem" stroke={1.5} />}
              onClick={handleLogout}
              className={classes.logoutButton}
            >
              Log Out
            </Button>
          </div>
        </nav>
      </AppShell.Navbar>

      <AppShell.Main
        className={mobileOpened ? classes.mainContentHidden : ""}
        style={{
          backgroundColor: "#f5f5f5",
        }}
      >
        {activeComponent}
      </AppShell.Main>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Notification Details"
      >
        {selectedNotification && (
          <div>
            <p>{selectedNotification.message}</p>
            <p>
              {moment(selectedNotification.created_at).format(
                "MMMM Do YYYY, h:mm a"
              )}
            </p>
          </div>
        )}
      </Modal>
    </AppShell>
  );
};

export default PartnerLayout;

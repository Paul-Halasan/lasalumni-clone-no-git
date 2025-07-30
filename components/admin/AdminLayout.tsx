import React, { useMemo, useState, useEffect } from "react";
import {
  AppShell,
  Image,
  Burger,
  Group,
  NavLink,
  ScrollArea,
  Button,
  Autocomplete,
  Modal,
  Menu,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./AdminNav.module.css";
import {
  IconUsersPlus,
  IconLogout2,
  IconSearch,
  IconDashboard,
  IconBell,
  IconMoodDollar,
  IconEdit,
  IconCalendarEvent,
  IconUserExclamation
} from "@tabler/icons-react";
import axios from "axios";
import router from "next/router";
import useSWR from "swr";
import moment from "moment";

interface AdminLayoutProps {
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

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const [activeComponent, setActiveComponent] = useState<React.ReactNode>(null);
  const [active, setActive] = useState<string>("");

  const [modalOpened, setModalOpened] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  interface Notification {
    id: string;
    message: string;
    createdAt: string;
  }

  const { data: notifications, error: notificationsError } = useSWR<
    Notification[]
  >("/api/get_notification", fetcher, { refreshInterval: 5000 });

  const { data, error: eventsError } = useSWR("/api/get_events", fetcher, {
    refreshInterval: 1,
  });

  const unapprovedEventsCount = data?.unapprovedEventsCount || 0;

  const PlaceholderComponent = () => (
    <div>
      <h1>Page Under Construction</h1>
      <p>This page is coming soon!</p>
    </div>
  );

  // Find the switch-case block in AdminLayout.tsx and wrap the declarations in curly braces
  const loadPageComponent = async (page: string) => {
    try {
      let Component: React.ComponentType;

      switch (page) {
        case "dashboard": {
          Component = (await import("../../pages/user_admin/dash/dashboard"))
            .default;
          break;
        }
        case "add-alumni": {
          Component = (await import("../../pages/user_admin/add/add_alumni"))
            .default;
          break;
        }
        case "approve-events": {
          Component = (
            await import("../../pages/user_admin/approve-events/page")
          ).default;
          break;
        }
        case "search-alumni": {
          Component = (
            await import("../../pages/user_admin/search/search_alumni")
          ).default;
          break;
        }
        case "search-company": {
          Component = (
            await import("../../pages/user_admin/search/search_company")
          ).default;
          break;
        }
        case "partner-company": {
          Component = (await import("../../pages/user_admin/add/add_company"))
            .default;
          break;
        }
        case "approve-dd": {
          Component = (await import("../../pages/user_admin/approve-dd/page"))
            .default;
          break;
        }
        case "job-approval": {
          const { default: ApproveJobs } = await import(
            "../../pages/user_admin/job/job_approval"
          );
          Component = (props) => (
            <ApproveJobs
              {...props}
              updateUnapprovedJobsCount={() => {}}
              jobs={[]}
            />
          );
          break;
        }
        case "edit-homepage": {
          Component = (
            await import("../../pages/user_admin/edit-homepage/page")
          ).default;
          break;
        }
        case "manage-events": {
          Component = (
            await import("../../pages/user_admin/manage-events/page")
          ).default;
          break;
        }
        case "manage-dd": {
          Component = (await import("../../pages/user_admin/manage-dd/page"))
            .default;
          break;
        }
        case "add-event": {
          Component = (
            await import("../../pages/user_admin/add-event/create-event")
          ).default;
          break;
        }

        case "admin-job-form": {
          Component = (await import("../../pages/user_admin/job/create_job"))
            .default;
          break;
        }

        case "manage-jobs-admin": {
          Component = (
            await import("../../pages/user_admin/job/manage-jobs-admin")
          ).default; // Reused alumni manage-jobs component
          break;
        }

        case "admin-account-management": {
          Component = (
            await import("../../pages/user_admin/admin-account/admin-account-management")
          ).default; // Reused alumni manage-jobs component
          break;
        }

        default: {
          Component = PlaceholderComponent;
        }
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
    router.push(`?page=${page}`);

    if (hasChildren) {
      setActive(page);
      if (mobileOpened) {
        toggleMobile();
      }
      return;
    }

    const Component = await loadPageComponent(page);
    setActiveComponent(<Component />);
    setActive(page);

    if (mobileOpened) {
      toggleMobile();
    }
  };

  const navLinks = useMemo(
    () => [
      {
        label: "Dashboard",
        icon: <IconDashboard size="1.3rem" stroke={1.5} />,
        page: "dashboard",
      },
      {
        label: "User Management",
        icon: <IconUsersPlus size="1.3rem" stroke={1.5} />,
        children: [
          { label: "Add New Alumni User", page: "add-alumni" },
          { label: "Add New Partner Company User", page: "partner-company" }
        ],
      },
      {
        label: "Search",
        icon: <IconSearch size="1.3rem" stroke={1.5} />,
        children: [
          { label: "Alumni", page: "search-alumni" },
          { label: "Partner Company", page: "search-company" },
        ],
      },
      {
        label: "Event Promotion Manager",
        icon: <IconCalendarEvent size="1.3rem" stroke={1.5} />,
        children: [
          { label: "Create Event Post", page: "add-event" },
          { label: "Approve Events", page: "approve-events" },
          { label: "Manage Events", page: "manage-events" },
        ],
      },
      {
        label: "Donation Drive Promotion Manager",
        icon: <IconMoodDollar size="1.3rem" stroke={1.5} />,
        children: [
          { label: "Approve Donation Drive", page: "approve-dd" },
          { label: "Manage Donation Drive", page: "manage-dd" },
        ],
      },
      {
        label: "Jobs",
        icon: <IconSearch size="1.3rem" stroke={1.5} />,

        children: [
          { label: "Create Job Post", page: "admin-job-form" },
          { label: "Job Approval", page: "job-approval" },
          { label: "Manage Jobs", page: "manage-jobs-admin" },
        ],
      },
      {
        label: "Edit Homepage",
        icon: <IconEdit size="1.3rem" stroke={1.5} />,
        page: "edit-homepage",
      },
      {
        label: "Admin Account Management",
        icon: <IconUserExclamation size="1.3rem" stroke={1.5} />,
        page: "admin-account-management",
      }
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
      // Set the first nav link as the initial active component
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

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setModalOpened(true);
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
          <Autocomplete
            className={classes.search}
            placeholder="Search"
            leftSection={
              <IconSearch style={{ width: 16, height: 16 }} stroke={1.5} />
            }
            visibleFrom="xs"
          />
          {/* Notification */}
          <Menu>
            <Menu.Target>
              <Button
                variant="light"
                radius={"md"}
                size="sm"
                color="var(--mantine-color-gray-7)"
              >
                <IconBell size="1.5rem" stroke={1.5} />
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              {notifications && notifications.length > 0 ? (
                notifications.map((notification) => (
                  <Menu.Item
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {notification.message}
                  </Menu.Item>
                ))
              ) : (
                <Menu.Item disabled>No notifications</Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        <nav className={classes.navbar}>
          <div className={classes.header}>
            <Image src="/adminlogo.png" w={240} fit="contain" />

            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="sm"
            ></Burger>
          </div>
          <ScrollArea>
            <div className={classes.linksInner}>
              {navLinks.map((link) => (
                <NavLink
                  key={`parent-${link.label}`}
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
                        key={`child-${child.label}`}
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
              {moment(selectedNotification.createdAt).format(
                "MMMM Do YYYY, h:mm a"
              )}
            </p>
          </div>
        )}
      </Modal>
    </AppShell>
  );
};

export default AdminLayout;

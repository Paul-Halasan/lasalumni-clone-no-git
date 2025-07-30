import React, { useEffect, useState } from "react";
import {
  Container,
  Text,
  Title,
  Button,
  Divider,
  Group,
  Stack,
  ActionIcon,
  Paper,
  SimpleGrid,
  RingProgress,
  Skeleton,
  Badge,
  Popover,
  Alert,
} from "@mantine/core";
import {
  IconUserPlus,
  IconCalendarPlus,
  IconHeartCheck,
  IconCalendarCheck,
  IconBuildingPlus,
  IconZoomCheck,
  IconArrowUpRight,
  IconUsers,
  IconCalendar,
  IconBriefcase,
  IconInfoCircle,
} from "@tabler/icons-react";

import { AreaChart } from "@mantine/charts";
import { DatePicker } from "@mantine/dates";
import withAuth from "../../../components/withAuth";
import LoginAnalytics from "../../../components/admin/dashboard/LoginAnalytics"; // Import the new component
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import axios from "axios";
import { getServerTime } from "../../../utils/getServerTime";

const Dashboard = () => {
  const [data, setData] = useState({
    totalUsers: 0,
    companyUsers: 0,
    alumniUsers: 0,
    newSignups: 0,
    newCompanySignups: 0,
    signupsOver7Days: [],
    companySignupsOver7Days: [],
    eventsApprovalStatus: [],
    totalEvents: 0,
  });

  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [pickerOpened, setPickerOpened] = useState(false);

  const [pendingCounts, setPendingCounts] = useState({
    donationDrives: 0,
    jobs: 0,
    events: 0,
  });

  const [serverNow, setServerNow] = useState<Date>(new Date());

  useEffect(() => {
    getServerTime("datetime")
      .then((datetime) => setServerNow(new Date(datetime)))
      .catch(() => setServerNow(new Date()));
  }, []);

  useEffect(() => {
    const fetchPendingCounts = async () => {
      try {
        const donationResponse = await axios.get("/api/get_dd_count");
        const jobsResponse = await axios.get("/api/get_pending_jobs_count");
        const eventsResponse = await axios.get("/api/get_pending_events_count");

        console.log("Pending Counts:", {
          donationDrives: donationResponse.data.count || 0,
          jobs: jobsResponse.data.count || 0,
          events: eventsResponse.data.count || 0,
        });

        setPendingCounts({
          donationDrives: donationResponse.data.count || 0,
          jobs: jobsResponse.data.count || 0,
          events: eventsResponse.data.count || 0,
        });
      } catch (error) {
        console.error("Error fetching pending counts:", error);
      }
    };

    fetchPendingCounts();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let query = "";
        if (dateRange[0] && dateRange[1]) {
          const startDate = dateRange[0].toISOString();
          const endDate = dateRange[1].toISOString();
          query = `?startDate=${startDate}&endDate=${endDate}`;
        }

        const response = await fetch(`/api/dashboard${query}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const handleDateRangeChange = (range: [Date | null, Date | null]) => {
    setDateRange(range);
    if (range[0] && range[1]) {
      setPickerOpened(false); // Close the date picker when dates are selected
    }
  };

  const statsData = [
    {
      title: "Total Users",
      value: data.totalUsers,
      icon: IconUsers,
      color: "blue",
    },
    {
      title: "Events Submitted",
      value: data.totalEvents,
      icon: IconCalendar,
      color: "violet",
    },
    {
      title: "Jobs Posted",
      value: data.totalUsers,
      icon: IconBriefcase,
      color: "orange",
    },
  ];

  if (loading) {
    return (
      <Container size="xl" p="md">
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          <Skeleton height={120} radius="md" />
          <Skeleton height={120} radius="md" />
          <Skeleton height={120} radius="md" />
        </SimpleGrid>
        <Skeleton height={300} mt="xl" radius="md" />
        <Skeleton height={300} mt="xl" radius="md" />
      </Container>
    );
  }

  // Sample color palette for charts
  const colorPalette = {
    alumni: ["#1A73E8", "#4285F4", "#8AB4F8"],
    company: ["#34A853", "#4FC988", "#8ADEA8"],
    events: ["#9B59B6", "#C39BD3", "#EBDEF0"],
  };

  return (
    <Container size="xl" p="md">
      <Paper p="md" radius="md" withBorder mb="lg">
        <Stack gap={0} mb="md">
          <Title order={2} ta="center" c="#4f4f4f">
            ADMIN DASHBOARD
          </Title>
          <Text c="#146a3e" ta="center" size="lg">
            LASALUMNI CONNECT
          </Text>
        </Stack>

        {/* Date Range Controls */}
        <Group justify="center" mb="md">
          <Popover
            opened={pickerOpened}
            onChange={setPickerOpened}
            position="bottom"
            width="auto"
          >
            <Popover.Target>
              <Button
                variant="outline"
                onClick={() => setPickerOpened((prev) => !prev)}
                rightSection={<IconCalendar size={16} />}
                fullWidth={false}
              >
                {dateRange[0] && dateRange[1]
                  ? `${dateRange[0].toLocaleDateString()} - ${dateRange[1].toLocaleDateString()}`
                  : "Select Dates"}
              </Button>
            </Popover.Target>

            <Popover.Dropdown>
              <DatePicker
                type="range"
                value={dateRange}
                onChange={handleDateRangeChange}
                maxDate={serverNow} // Use authoritative server time here
                size="sm"
              />
            </Popover.Dropdown>
          </Popover>
        </Group>

        {/* Quick Action Button Section - left as is per your request */}
        <Group justify="center" p="md" gap="md">
          <ActionButton
            icon={
              <IconUserPlus
                style={{ width: "70%", height: "70%" }}
                stroke={1.5}
              />
            }
            text="Add Alumni User"
            color="#3498db"
            href="?page=add-alumni"
          />

          <ActionButton
            icon={
              <IconBuildingPlus
                style={{ width: "70%", height: "70%" }}
                stroke={1.5}
              />
            }
            text="Add Company"
            color="#2ecc71"
            href="?page=partner-company"
          />

          <ActionButton
            icon={
              <IconCalendarPlus
                style={{ width: "70%", height: "70%" }}
                stroke={1.5}
              />
            }
            text="Create Event"
            color="#9b59b6"
            href="?page=add-event"
          />

          <ActionButton
            icon={
              <IconHeartCheck
                style={{ width: "70%", height: "70%" }}
                stroke={1.5}
              />
            }
            text="Donation Approval"
            color="#e74c3c"
            href="?page=approve-dd"
          >
            {pendingCounts.donationDrives > 0 && (
              <Badge
                size="lg"
                color="red"
                radius="xl"
                style={{
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                }}
              >
                {pendingCounts.donationDrives}
              </Badge>
            )}
          </ActionButton>

          <ActionButton
            icon={
              <IconZoomCheck
                style={{ width: "70%", height: "70%" }}
                stroke={1.5}
              />
            }
            text="Jobs Approval"
            color="#f39c12"
            href="?page=job-approval"
          >
            {pendingCounts.jobs > 0 && (
              <Badge
                size="lg"
                color="orange"
                radius="xl"
                style={{
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                }}
              >
                {pendingCounts.jobs}
              </Badge>
            )}
          </ActionButton>

          <ActionButton
            icon={
              <IconCalendarCheck
                style={{ width: "70%", height: "70%" }}
                stroke={1.5}
              />
            }
            text="Events Approval"
            color="#00bcd4"
            href="?page=approve-events"
          >
            {pendingCounts.events > 0 && (
              <Badge
                size="lg"
                color="blue"
                radius="xl"
                style={{
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                }}
              >
                {pendingCounts.events}
              </Badge>
            )}
          </ActionButton>
        </Group>
      </Paper>

      {/* Stats Cards with improved design */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {statsData.map((stat, index) => (
          <StatsCard key={index} data={stat} />
        ))}
      </SimpleGrid>

      {/* Alumni Login Analytics Section with Prompt */}
      {dateRange[0] && dateRange[1] ? (
        <LoginAnalytics
          dateRange={[dateRange[0], dateRange[1]]}
          colorPalette={colorPalette}
        />
      ) : (
        <Paper p="lg" radius="md" withBorder mt="xl">
          <Alert
            icon={<IconInfoCircle size={16} />}
            title="Login Analytics"
            color="#146a3e"
          >
            <Stack align="center" gap="md">
              <Text size="sm">
                Please select a date range above to view alumni login analytics
                data.
              </Text>
              <Button
                leftSection={<IconCalendar size={16} />}
                variant="light"
                color="#146a3e"
                onClick={() => setPickerOpened(true)}
              >
                Choose Dates
              </Button>
            </Stack>
          </Alert>
        </Paper>
      )}

      {/* Alumni section with improved design */}
      <Paper p="lg" radius="md" withBorder mt="xl">
        <Group justify="space-between" align="center" mb="md">
          <Title order={3} c="#146a3e">
            <Group gap="xs">
              <IconUsers size={24} />
              <Text>Alumni Analytics</Text>
            </Group>
          </Title>
          <Badge size="lg" radius="md" color="green">
            {data.alumniUsers} Total Alumni
          </Badge>
        </Group>

        <Divider mb="md" />

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="lg">
          <Paper p="md" radius="md" withBorder>
            <Group justify="space-between">
              <Text fw={500} size="lg">
                Alumni Users
              </Text>
              <Badge color="green">{data.alumniUsers}</Badge>
            </Group>
            <RingProgress
              sections={[
                {
                  value: (data.alumniUsers / data.totalUsers) * 100,
                  color: colorPalette.alumni[0],
                },
              ]}
              label={
                <Text fw={700} ta="center" size="xl">
                  {((data.alumniUsers / data.totalUsers) * 100).toFixed(1)}%
                </Text>
              }
              size={160}
              thickness={16}
              roundCaps
            />
            <Text c="dimmed" size="sm" ta="center" mt="xs">
              {data.alumniUsers} of {data.totalUsers} total users
            </Text>
            <Text c="dimmed" size="xs" ta="center" mt="xs" fw={500}>
              Percentage of total users who are alumni
            </Text>
          </Paper>

          <Paper p="md" radius="md" withBorder>
            <Group justify="space-between">
              <Text fw={500} size="lg">
                New Signups Today
              </Text>
              <Group gap="xs">
                <IconArrowUpRight
                  size={20}
                  color="green"
                  style={{
                    visibility: data.newSignups > 0 ? "visible" : "hidden",
                  }}
                />
                <Text c="green" fw={700}>
                  {data.newSignups}
                </Text>
              </Group>
            </Group>
            <AreaChart
              h={140}
              data={data.signupsOver7Days.slice(-7)}
              dataKey="date"
              series={[{ name: "Signups", color: colorPalette.alumni[0] }]}
              curveType="monotone"
              withLegend={false}
              withYAxis={false}
              withGradient={true}
              withTooltip={true}
            />
          </Paper>
        </SimpleGrid>

        <Paper p="md" radius="md" withBorder>
          <Text fw={500} size="lg" mb="md">
            Alumni Signups Trend
          </Text>
          <AreaChart
            h={300}
            data={data.signupsOver7Days}
            dataKey="date"
            series={[{ name: "Signups", color: colorPalette.alumni[0] }]}
            curveType="monotone"
            withLegend={true}
            strokeWidth={2}
            withDots={true}
            withGradient={true}
            withTooltip={true}
            gridAxis="xy"
          />
        </Paper>
      </Paper>

      {/* Partner Company section with improved design */}
      <Paper p="lg" radius="md" withBorder mt="xl">
        <Group justify="space-between" align="center" mb="md">
          <Title order={3} c="#146a3e">
            <Group gap="xs">
              <IconBuildingPlus size={24} />
              <Text>Partner Company Analytics</Text>
            </Group>
          </Title>
          <Badge size="lg" radius="md" color="green">
            {data.companyUsers} Companies
          </Badge>
        </Group>

        <Divider mb="md" />

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="lg">
          <Paper p="md" radius="md" withBorder>
            <Group justify="space-between">
              <Text fw={500} size="lg">
                Company Users
              </Text>
              <Badge color="green">{data.companyUsers}</Badge>
            </Group>
            <RingProgress
              sections={[
                {
                  value: (data.companyUsers / data.totalUsers) * 100,
                  color: colorPalette.company[0],
                },
              ]}
              label={
                <Text fw={700} ta="center" size="xl">
                  {((data.companyUsers / data.totalUsers) * 100).toFixed(1)}%
                </Text>
              }
              size={160}
              thickness={16}
              roundCaps
            />
            <Text c="dimmed" size="sm" ta="center" mt="xs">
              {data.companyUsers} of {data.totalUsers} total users
            </Text>
            <Text c="dimmed" size="xs" ta="center" mt="xs" fw={500}>
              Percentage of total users who are partner companies
            </Text>
          </Paper>

          <Paper p="md" radius="md" withBorder>
            <Group justify="space-between">
              <Text fw={500} size="lg">
                New Company Signups Today
              </Text>
              <Group gap="xs">
                <IconArrowUpRight
                  size={20}
                  color="green"
                  style={{
                    visibility:
                      data.newCompanySignups > 0 ? "visible" : "hidden",
                  }}
                />
                <Text c="green" fw={700}>
                  {data.newCompanySignups}
                </Text>
              </Group>
            </Group>
            <AreaChart
              h={140}
              data={data.companySignupsOver7Days.slice(-7)}
              dataKey="date"
              series={[{ name: "Signups", color: colorPalette.company[0] }]}
              curveType="monotone"
              withLegend={false}
              withYAxis={false}
              withGradient={true}
              withTooltip={true}
            />
          </Paper>
        </SimpleGrid>
      </Paper>
    </Container>
  );
};

// Stats Card Component
const StatsCard = ({
  data,
}: {
  data: {
    title: string;
    value: number;
    icon: any;
    color: string;
  };
}) => {
  const Icon = data.icon;

  return (
    <Paper p="md" radius="md" withBorder>
      <Group justify="space-between" align="flex-start">
        <Stack gap={0}>
          <Text c="dimmed" size="sm">
            {data.title}
          </Text>
          <Text fw={700} size="xl">
            {data.value.toLocaleString()}
          </Text>
        </Stack>
        <ActionIcon radius="xl" variant="light" color={data.color} size="lg">
          <Icon size={24} />
        </ActionIcon>
      </Group>
    </Paper>
  );
};

// ActionButton component (unchanged as requested)
const ActionButton: React.FC<{
  icon: React.ReactNode;
  text: string;
  color?: string;
  width?: number;
  hoverColor?: string;
  defaultColor?: string;
  onClick?: () => void;
  component?: React.ElementType;
  href?: string;
  target?: string;
  children?: React.ReactNode; // Add this line
}> = ({
  icon,
  text,
  color = "#146a3e",
  width = 150,
  hoverColor = "#f0f7f3",
  defaultColor = "white",
  onClick,
  component = "div",
  href,
  target,
  children, // Destructure children
}) => {
  // Common styles and handlers
  const commonStyles = {
    border: "1px solid",
    borderColor: "#d7e8e0",
    borderRadius: 12,
    cursor: "pointer",
    backgroundColor: defaultColor,
    transition: "all 0.3s ease",
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.backgroundColor = hoverColor;
    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
    e.currentTarget.style.transform = "translateY(-5px)";
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.backgroundColor = defaultColor;
    e.currentTarget.style.boxShadow = "none";
    e.currentTarget.style.transform = "translateY(0px)";
  };

  // Button content
  const buttonContent = (
    <>
      <div style={{ position: "relative", width: "80px", height: "80px" }}>
        <ActionIcon variant="transparent" size={80} p={0} c={color}>
          {icon}
        </ActionIcon>
        {children && (
          <div
            style={{
              position: "absolute",
              top: -5,
              right: -5,
            }}
          >
            {children}
          </div>
        )}
      </div>

      <Text
        size="sm"
        fw={500}
        c={color}
        ta="center"
        style={{
          marginTop: 5,
          lineHeight: 1.2,
        }}
      >
        {text}
      </Text>
    </>
  );

  // Render as anchor if component is 'a' or href is provided
  if (component === "a" || href) {
    return (
      <a
        href={href}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        onClick={onClick}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: width,
          padding: "0.5rem",
          textDecoration: "none",
          ...commonStyles,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {buttonContent}
      </a>
    );
  }

  // Default rendering as a Stack (original behavior)
  return (
    <Stack
      w={width}
      style={commonStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      align="center"
      p="sm"
      gap="0"
      onClick={onClick}
    >
      {buttonContent}
    </Stack>
  );
};

export default withAuth(Dashboard, ["admin"]);

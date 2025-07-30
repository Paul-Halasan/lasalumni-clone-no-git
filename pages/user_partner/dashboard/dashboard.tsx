import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Text,
  Group,
  Badge,
  ActionIcon,
  Stack,
  Paper,
  Title,
  SimpleGrid,
  Button,
  ThemeIcon,
} from "@mantine/core";
import {
  IconBriefcase,
  IconSearch,
  IconUserSearch,
  IconBuilding,
  IconUsers,
  IconClockHour3,
  IconChevronRight,
} from "@tabler/icons-react";
import axios from "axios";

// Static dashboard data
const dashboardData = {
  totalJobs: 15,
  activeJobs: 8,
  pendingApprovals: 3,
  totalApplicants: 50,
  recentJobs: [
    { id: 1, title: "Software Engineer", status: "active", applicants: 10 },
    { id: 2, title: "Data Analyst", status: "pending", applicants: 5 },
    { id: 3, title: "Project Manager", status: "active", applicants: 8 },
  ],
};

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

interface TopJob {
  job_id: number;
  job_title: string;
  company_name: string;
  job_status: string;
  applicantsCount: number;
}

// Updated ActionButton component
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
}) => {
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

  const buttonContent = (
    <>
      <ActionIcon variant="transparent" size={80} p={0} c={color}>
        {icon}
      </ActionIcon>
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

const PartnerDashboard = () => {
  const [topJobs, setTopJobs] = useState<TopJob[]>([]); // Use the TopJob interface
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch top jobs from the API
    const fetchTopJobs = async () => {
      try {
        const response = await axios.get("/api/partner_top_jobs");
        setTopJobs(response.data);
      } catch (error) {
        console.error("Error fetching top jobs:", error);
        setTopJobs([]); // Set an empty array to avoid breaking the UI
      } finally {
        setLoading(false); // Stop loading
      }
    };
  
    fetchTopJobs();
  }, []);

  const statsData = [
    {
      title: "Total Jobs",
      value: dashboardData.totalJobs,
      icon: IconBriefcase,
      color: "blue",
    },
    {
      title: "Active Jobs",
      value: dashboardData.activeJobs,
      icon: IconSearch,
      color: "green",
    },
    {
      title: "Pending Approvals",
      value: dashboardData.pendingApprovals,
      icon: IconClockHour3,
      color: "yellow",
    },
    {
      title: "Total Applicants",
      value: dashboardData.totalApplicants,
      icon: IconUsers,
      color: "orange",
    },
  ];

  return (
    <Container size="xl" p="md">
      <Paper p="md" radius="md" withBorder mb="lg">
        <Stack gap={0} mb="md" mt="md">
          <Title order={2} ta="center" c="#ff851b">
            PARTNER COMPANY DASHBOARD
          </Title>
          <Text c="#146a3e" ta="center" size="lg">
            LASALUMNI CONNECT
          </Text>
        </Stack>

        <Group justify="center" p="md" gap="md">
          <ActionButton
            icon={
              <IconBriefcase
                style={{ width: "70%", height: "70%" }}
                stroke={1.5}
              />
            }
            text="Create New Job"
            color="#3498db"
            href="?page=job-posting"
          />
          <ActionButton
            icon={
              <IconSearch
                style={{ width: "70%", height: "70%" }}
                stroke={1.5}
              />
            }
            text="View All Jobs"
            color="#2ecc71"
            href="?page=display-jobs"
          />
          <ActionButton
            icon={
              <IconUserSearch
                style={{ width: "70%", height: "70%" }}
                stroke={1.5}
              />
            }
            text="Search Alumni"
            color="#9b59b6"
            href="?page=partner-alumni"
          />
          <ActionButton
            icon={
              <IconBuilding
                style={{ width: "70%", height: "70%" }}
                stroke={1.5}
              />
            }
            text="Edit Profile"
            color="#e74c3c"
          />
        </Group>
      </Paper>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="md">
        {statsData.map((stat, index) => (
          <StatsCard key={index} data={stat} />
        ))}
      </SimpleGrid>

      <Card shadow="sm" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Text size="lg" fw={700}>
            Top Job Postings
          </Text>
        </Group>
        <Stack>
          {loading ? (
            <Text size="sm" c="dimmed" ta="center">
              Loading top jobs...
            </Text>
          ) : topJobs.length > 0 ? (
            topJobs.map((job) => (
              <Card key={job.job_id} withBorder shadow="sm" radius="sm" p="sm">
                <Group justify="space-between" wrap="nowrap">
                  <Group wrap="nowrap">
                    <ThemeIcon size="lg" variant="light" color="blue">
                      <IconBriefcase size={20} />
                    </ThemeIcon>
                    <div>
                      <Text fw={500}>{job.job_title}</Text>
                      <Group gap="xs">
                        <Badge
                          color={job.job_status === "active" ? "green" : "yellow"}
                        >
                          {job.job_status}
                        </Badge>
                        <Group gap="xs">
                          <IconUsers size={14} />
                          <Text size="xs" c="dimmed">
                            {job.applicantsCount} applicants
                          </Text>
                        </Group>
                      </Group>
                    </div>
                  </Group>
                </Group>
              </Card>
            ))
          ) : (
            <Text size="sm" c="dimmed" ta="center">
              No top jobs available.
            </Text>
          )}
        </Stack>
      </Card>
    </Container>
  );
};

export default PartnerDashboard;

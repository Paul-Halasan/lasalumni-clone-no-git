import React, { useEffect, useState } from "react";
import {
  Paper,
  Title,
  Text,
  Group,
  Badge,
  Divider,
  SimpleGrid,
  RingProgress,
  Box,
} from "@mantine/core";
import {
  IconLogin,
  IconArrowUpRight,
  IconArrowDownRight,
} from "@tabler/icons-react";
import { AreaChart } from "@mantine/charts";

interface LoginAnalyticsProps {
  dateRange: [Date, Date];
  colorPalette: { alumni: string[] };
}

interface LoginData {
  totalLogins: number;
  uniqueUsers: number;
  activePercentage: number;
  inactiveUsers: number;
  avgLoginsPerUser: number;
  loginChange: number;
  dailyLogins: Array<{ date: string; logins: number }>;
}

const LoginAnalytics = ({ dateRange, colorPalette }: LoginAnalyticsProps) => {
  const [loginData, setLoginData] = useState<LoginData>({
    totalLogins: 0,
    uniqueUsers: 0,
    activePercentage: 0,
    inactiveUsers: 0,
    avgLoginsPerUser: 0,
    loginChange: 0,
    dailyLogins: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLoginData = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = "";
        if (dateRange[0] && dateRange[1]) {
          // Make sure dates are properly formatted
          const startDate = dateRange[0].toISOString();
          const endDate = dateRange[1].toISOString();
          query = `?startDate=${encodeURIComponent(
            startDate
          )}&endDate=${encodeURIComponent(endDate)}`;
        }

        console.log("Fetching data with query:", query);

        // Updated to use the comprehensive analytics endpoint
        const response = await fetch(
          `/api/analytics/alumni_login_analytics${query}`
        );

        if (!response.ok) {
          throw new Error(
            `API returned ${response.status}: ${response.statusText}`
          );
        }

        const result = await response.json();
        console.log("API response:", result);

        setLoginData(result);
      } catch (error) {
        console.error("Error fetching login analytics:", error);
        setError("Failed to load login data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLoginData();
  }, [dateRange]);

  // Calculate weekly total logins
  const weeklyTotalLogins =
    loginData.dailyLogins
      ?.slice(-7)
      .reduce((sum, day) => sum + day.logins, 0) || 0;

  // Calculate average daily logins
  const avgDailyLogins =
    loginData.dailyLogins?.length > 0
      ? loginData.totalLogins / loginData.dailyLogins.length
      : 0;

  if (loading) {
    return (
      <Paper p="lg" radius="md" withBorder mt="xl">
        <Text>Loading login analytics...</Text>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper
        p="lg"
        radius="md"
        withBorder
        mt="xl"
        style={{ backgroundColor: "#FFF4F4" }}
      >
        <Text color="red">{error}</Text>
        <Text size="sm" mt="xs">
          Check the console for more details.
        </Text>
      </Paper>
    );
  }

  return (
    <Paper p="lg" radius="md" withBorder mt="xl">
      <Group justify="space-between" align="center" mb="md">
        <Title order={3} c="#146a3e">
          <Group gap="xs">
            <IconLogin size={24} />
            <Text>Alumni Login Analytics</Text>
          </Group>
        </Title>
        <Badge size="lg" radius="md" color="green">
          {loginData.totalLogins} Total Logins
        </Badge>
      </Group>

      <Divider mb="md" />

      {/* Summary metrics row */}
      <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="md" mb="lg">
        <Paper p="md" radius="md" withBorder>
          <Text fw={500} size="sm" c="dimmed" ta="center">
            Total Login Events
          </Text>
          <Text fw={700} size="xl" ta="center" c="#146a3e">
            {loginData.totalLogins}
          </Text>
          <Text size="xs" c="dimmed" ta="center">
            across all users
          </Text>
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Text fw={500} size="sm" c="dimmed" ta="center">
            Active Alumni
          </Text>
          <Text fw={700} size="xl" ta="center" c="#146a3e">
            {loginData.uniqueUsers}
          </Text>
          <Text size="xs" c="dimmed" ta="center">
            out of {loginData.uniqueUsers + loginData.inactiveUsers} total
          </Text>
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Text fw={500} size="sm" c="dimmed" ta="center">
            Logins Per User
          </Text>
          <Text fw={700} size="xl" ta="center" c="#146a3e">
            {loginData.avgLoginsPerUser.toFixed(1)}
          </Text>
          <Text size="xs" c="dimmed" ta="center">
            average logins per alumni
          </Text>
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Text fw={500} size="sm" c="dimmed" ta="center">
            Last 7 Days
          </Text>
          <Text fw={700} size="xl" ta="center" c="#146a3e">
            {weeklyTotalLogins}
          </Text>
          <Text size="xs" c="dimmed" ta="center">
            total login events
          </Text>
        </Paper>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="lg">
        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between">
            <Text fw={500} size="lg">
              Active vs Inactive Alumni
            </Text>
            <Badge color="blue">{loginData.uniqueUsers} active</Badge>
          </Group>
          <RingProgress
            sections={[
              {
                value: loginData.activePercentage || 0,
                color: colorPalette.alumni[0],
              },
            ]}
            label={
              <Text fw={700} ta="center" size="xl">
                {(loginData.activePercentage || 0).toFixed(1)}%
              </Text>
            }
            size={160}
            thickness={16}
            roundCaps
          />
          <Text c="dimmed" size="sm" ta="center" mt="xs">
            {loginData.inactiveUsers} alumni have not logged in during this
            period
          </Text>
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between">
            <Text fw={500} size="lg">
              Login Activity Trend
            </Text>
            <Group gap="xs">
              {loginData.loginChange > 0 ? (
                <IconArrowUpRight size={20} color="green" />
              ) : (
                <IconArrowDownRight size={20} color="red" />
              )}
              <Text c={loginData.loginChange > 0 ? "green" : "red"} fw={700}>
                {Math.abs(loginData.loginChange || 0).toFixed(1)}%
              </Text>
            </Group>
          </Group>
          <AreaChart
            h={140}
            data={loginData.dailyLogins?.slice(-7) || []}
            dataKey="date"
            series={[{ name: "logins", color: colorPalette.alumni[0] }]}
            curveType="monotone"
            withLegend={false}
            withYAxis={true}
            withGradient={true}
            withTooltip={true}
            tooltipProps={{
              content: ({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <Box
                      p="xs"
                      style={{
                        backgroundColor: "white",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                      }}
                    >
                      <Text size="sm" fw={600}>
                        {label}
                      </Text>
                      <Text size="sm">
                        <span
                          style={{
                            color: colorPalette.alumni[0],
                            fontWeight: 500,
                          }}
                        >
                          {payload[0].value}
                        </span>{" "}
                        login events
                      </Text>
                    </Box>
                  );
                }
                return null;
              },
            }}
          />
          <Text c="dimmed" size="sm" ta="center" mt="xs">
            Last 7 days: {weeklyTotalLogins} total logins
          </Text>
        </Paper>
      </SimpleGrid>
    </Paper>
  );
};

export default LoginAnalytics;

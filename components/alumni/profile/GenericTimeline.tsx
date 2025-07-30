import React, { useState, useEffect } from "react";
import { Timeline, Text, Card, Flex, Stack, Title } from "@mantine/core";
import { IconCertificate2 } from "@tabler/icons-react";

interface Achievement {
  title: string;
  achievements?: string;
}

interface TimelineItemProps {
  title: string;
  subtitle: string;
  dateRange: string;
  description?: Achievement[];
}

interface GenericTimelineProps {
  data: TimelineItemProps[];
  mainIcon: typeof IconCertificate2;
  dateIcon: typeof IconCertificate2;
  achievementIcon: typeof IconCertificate2;
}

const GenericTimeline = ({
  data,
  mainIcon: MainIcon,
  dateIcon: DateIcon,
  achievementIcon: AchievementIcon,
}: GenericTimelineProps) => {
  return (
    <Timeline
      color="#48a774"
      active={data.length - 1}
      mt="10"
      lineWidth={2}
      bulletSize={18}
    >
      {data.map((item, index) => (
        <Timeline.Item
          key={index}
          style={{ fontSize: "1.15rem" }}
          title={item.title}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              gap: "0.5rem",
              alignItems: "center",
              marginTop: "1rem",
              marginLeft: "1rem",
            }}
          >
            <MainIcon size="19.2px" stroke={1} />
            <Text size="md" color="dimmed">
              {item.subtitle}
            </Text>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto auto 1fr",
              gap: "0.5rem",
              alignItems: "center",
              marginTop: "0.5rem",
              marginLeft: "1rem",
            }}
          >
            <DateIcon size="19.2px" stroke={1} />
            <Text size="md" color="dimmed">
              {item.dateRange}
            </Text>
          </div>

          {item.description?.map((achievement, index) => (
            <Card
              key={index}
              shadow="sm"
              padding="xl"
              radius="md"
              withBorder
              mt={15}
              c="dimmed"
            >
              <Flex
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: "0.5rem",
                  alignItems: "flex-start",
                }}
              >
                <AchievementIcon size="19.2px" stroke={1} />
                <Stack gap="xs" align="flex-start" justify="center">
                  <Title order={5} mt={-3}>
                    {achievement.title}
                  </Title>
                  {achievement.achievements && (
                    <Text c="dimmed" size="md">
                      {achievement.achievements}
                    </Text>
                  )}
                </Stack>
              </Flex>
            </Card>
          ))}
        </Timeline.Item>
      ))}
    </Timeline>
  );
};

export default GenericTimeline;

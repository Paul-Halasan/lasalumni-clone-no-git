import React from "react";
import withAuth from "../../../components/withAuth";
import { EventsCardsGrid } from "../../../components/alumni/events/EventCard";
import { Container, Text, Stack, Group, Divider, Title } from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";

const EventsPage = () => {
  return (
    <>
      <Container
        size="lg"
        style={{
          borderRadius: 15,
        }}
        bg="white"
        p={8}
        mb="md"
      >
        <Stack align="center" gap="xs" pb={15} mt="lg">
          <Title ta="center" style={{ fontSize: "1.8rem" }}>
            <span style={{ color: "#146a3e" }}>Alumni Calendar Events</span>
          </Title>

          <Text ta="center" fw="400" size="lg">
            Connecting alumni, fostering community, and celebrating our shared
            legacy.
          </Text>
        </Stack>
      </Container>

      <EventsCardsGrid />
    </>
  );
};

export default withAuth(EventsPage, ["alumni"]);

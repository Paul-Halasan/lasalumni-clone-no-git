import React from "react";
import withAuth from "../../../components/withAuth";
import { MyEvents } from "../../../components/alumni/events/my-events/MyEvents";
import { Container, Title, Text, Divider, Stack } from "@mantine/core";
import { IconTicket } from "@tabler/icons-react";

const MyEventsPage = () => {
  return (
    <div>
      <Container
        size="lg"
        style={{
          borderRadius: 15,
        }}
        bg="white"
        p={20}
        mb={30}
      >
        <Stack align="center" gap="xs" pb={15} mt="lg">
          <Title ta="center" style={{ fontSize: "1.8rem" }} pb={15}>
            <span style={{ color: "#146a3e" }}>
              My Alumni Association Events
            </span>
          </Title>

          <Text ta="center" fw="400" size="lg">
            View upcoming events you&apos;re attending and those you&apos;re
            invited to facilitate.
          </Text>
        </Stack>
      </Container>

      <MyEvents />
    </div>
  );
};

export default withAuth(MyEventsPage, ["alumni"]);

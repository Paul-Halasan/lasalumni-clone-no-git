import React from "react";
import { Container, Flex, Text, Image } from "@mantine/core";

interface PlaceholderNoDataProps {
  message: string;
  submessage: string;
}

const PlaceholderNoData: React.FC<PlaceholderNoDataProps> = ({
  message,
  submessage,
}) => (
  <Container
    size="xl"
    p={50}
    bg={"white"}
    style={{
      borderRadius: 15,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap="xl"
      style={{ textAlign: "center" }}
    >
      <div>
        <Text size="xl" fw={700}>
          {message}
        </Text>
        <Text size="lg" c="dimmed" maw={400}>
          {submessage}
        </Text>
      </div>
      <Image
        h={600}
        w="auto"
        fit="contain"
        src="/nodata_vector.svg"
        alt="No events available"
        style={{ maxHeight: "300px", maxWidth: "100%" }}
      />
    </Flex>
  </Container>
);

export default PlaceholderNoData;

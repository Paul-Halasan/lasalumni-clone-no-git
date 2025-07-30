// components/SectionHeader.tsx
import React from "react";
import { Group, Title, Text } from "@mantine/core";

const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <Group
    style={{
      gap: 0,
      alignContent: "center",
      paddingBottom: 20,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f0f0f0",
      padding: 20,
      borderRadius: 10,
      textAlign: "center",
      flexDirection: "column",
      width: "100%",
      marginBottom: 30,
    }}
  >
    {icon}
    <Title order={3}>{title}</Title>
    <Text c="dimmed">{description}</Text>
  </Group>
);

export default SectionHeader;

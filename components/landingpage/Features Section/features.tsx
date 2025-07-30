import React from "react";
import { Container, Title, Text, Card, SimpleGrid } from "@mantine/core";
import {
  IconUsers,
  IconBriefcase,
  IconNews,
  IconCalendarEvent,
  IconHeartHandshake,
} from "@tabler/icons-react";
import classes from "./features.module.css";

const featureData = [
  {
    title: "Connect with Alumni",
    description:
      "Join a vast network of professionals from various industries.",
    icon: <IconUsers size={50} color="#4CAF50" />,
  },

  {
    title: "Stay Updated",
    description:
      "Keep up with the latest news happening in the alumni community.",
    icon: <IconNews size={50} color="#2196F3" />,
  },

  {
    title: "Career Opportunities",
    description:
      "Discover exclusive job postings catered specifically to our alumni community.",
    icon: <IconBriefcase size={50} color="#FF9800" />,
  },

  {
    title: "Event News",
    description:
      "Stay in the loop and never miss out on exciting alumni events. Join the fun with just one click!",
    icon: <IconCalendarEvent size={50} color="#9C27B0" />,
  },

  {
    title: "Support Our Community",
    description:
      "Let's come together to make a positive impact. Join us in supporting our cause.",
    icon: <IconHeartHandshake size={50} color="#E91E63" />,
  },
];

const FeatureSection = () => {
  const featureCard = featureData.map((feature) => (
    <Card
      key={feature.title}
      shadow="md"
      radius="md"
      className={classes.card}
      padding="xl"
    >
      {feature.icon}
      <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
        {feature.title}
      </Text>
      <Text fz="sm" c="dimmed" mt="sm">
        {feature.description}
      </Text>
    </Card>
  ));

  return (
    <div
      data-aos="fade-up"
      data-aos-duration="1000"
      style={{ paddingTop: "50px" }}
    >
      {/* <Container size="lg" py="xl" pt={30}>
        <Group justify="center">
          <Text>SERVICES OFFERED</Text>
        </Group>
      </Container> */}

      <Title order={2} ta="center" mt="sm">
        Empower Your Alumni Journey
      </Title>

      <Text c="dimmed" ta="center" mt="md">
        We provide a range of services to help you connect with fellow alumni,
        stay updated with the latest news, and discover exclusive job postings
      </Text>

      <Container size="lg" py={80}>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
          {featureCard}
        </SimpleGrid>
      </Container>
    </div>
  );
};

export default FeatureSection;

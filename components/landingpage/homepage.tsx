import { Container, Title, Text, Stack, ActionIcon, Box } from "@mantine/core";
import classes from "./homepage.module.css";
import { IconChevronDown } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import FeatureSection from "./Features Section/features";
import axios from "axios";

const HomeComponent = () => {
  const [description, setDescription] = useState("");
  const [homepageBackgroundImage, setHomepageBackgroundImage] = useState("");

  useEffect(() => {
    AOS.init();

    const fetchData = async () => {
      try {
        const response = await axios.get("/api/get_homepage_content");
        setDescription(response.data.description);
        setHomepageBackgroundImage(response.data.homepageBackgroundImage);
      } catch (error) {
        console.error("Error fetching homepage content:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Container
        fluid
        className={classes.wrapper}
        style={{ backgroundImage: `url(${homepageBackgroundImage})` }}
      >
        <div className={classes.inner}>
          <div className={classes.content}>
            <Stack align="center" justify="center" style={{ flex: 1 }}>
              <Title
                style={{
                  background: "linear-gradient(to right, #6ba95e, #24adb1)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
                className={classes.title}
              >
                LASALUMNI CONNECT
              </Title>

              <Text className={classes.description} mt={30}>
                {description}
              </Text>
            </Stack>
            <Stack align="center">
              <Text c={"white"} maw={300} size="lg">
                EXPLORE THE DEPTHS OF OUR ALUMNI PORTAL.
              </Text>
              <ActionIcon variant="default" size="lg" radius="xl">
                <IconChevronDown height={16} width={16} />
              </ActionIcon>
            </Stack>
          </div>
        </div>
      </Container>

      <FeatureSection />
      <Container size="lg" fluid>
        <Box h={1000}></Box>
      </Container>
    </div>
  );
};

export default HomeComponent;

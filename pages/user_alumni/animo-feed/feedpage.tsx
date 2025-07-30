import React from "react";
import withAuth from "../../../components/withAuth";
import LatestPost from "../../../components/alumni/feed/LatestPostGrid";
import { Container, Text, Title, Tabs, Grid } from "@mantine/core";
import { useState } from "react";
import { IconBaselineDensitySmall, IconLayoutBoard } from "@tabler/icons-react";

const FinalAlumniFeed = () => {
  const [activeTab, setActiveTab] = useState<string | null>("second");
  const iconStyle = { width: 12, height: 12 };

  return (
    <>
      <Container size="xl" p={15}>
        <Tabs value={activeTab} onChange={setActiveTab} color="#146a3e">
          <Tabs.List justify="flex-end">
            <Tabs.Tab
              value="second"
              leftSection={<IconLayoutBoard style={iconStyle} />}
            >
              Grid View
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="second">
            <LatestPost />
          </Tabs.Panel>
        </Tabs>
      </Container>
    </>
  );
};

export default withAuth(FinalAlumniFeed, ["alumni"]);

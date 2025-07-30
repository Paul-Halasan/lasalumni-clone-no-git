// pages/user_alumni/page.tsx
import React from "react";
import withAuth from "../../../components/withAuth";
import AdminLayout from "../../../components/admin/AdminLayout";
import { AppShell, Image, Burger, Group, Skeleton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

export function AlumniHomePage() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 270,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            hiddenFrom="sm"
            size="sm"
          />
          <Burger
            opened={desktopOpened}
            onClick={toggleDesktop}
            visibleFrom="sm"
            size="sm"
          />
          <Image src="/logo2.png" w={160} fit="contain" />
        </Group>
      </AppShell.Header>
      <AppShell.Navbar>
        <AdminLayout />
      </AppShell.Navbar>
      <AppShell.Main>Main</AppShell.Main>
    </AppShell>
  );
}

export default withAuth(AlumniHomePage, ["alumni"]);

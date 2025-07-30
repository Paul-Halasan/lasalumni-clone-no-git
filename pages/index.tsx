import { useRouter } from "next/router";
import { Button, Group, AppShell, Box, Image } from "@mantine/core";
import Link from "next/link";
import classes from "./login.module.css";
import { useHeadroom } from "@mantine/hooks";

// Import your components
import HomeComponent from "../components/landingpage/homepage";
import LoginPage from "./login";

export default function IndexPage() {
  const router = useRouter();
  const pinned = useHeadroom({ fixedAt: 80 });

  return (
    <>
      <AppShell header={{ height: 80, collapsed: !pinned }}>
        <AppShell.Header>
          <Group justify="space-between" h="100%" p={16}>
            <Box component={Link} href="/">
              <Image
                src="logo2.png"
                fit="contain"
                className={classes.logo}
                alt="horizontal logo"
              />
            </Box>

            <Button
              title="Redirect to login page"
              component={Link}
              href="/?page=login"
              w={120}
              h={45}
              radius={12}
              color="#096A2E"
            >
              Log in
            </Button>
          </Group>
        </AppShell.Header>

        <AppShell.Main>
          {router.query.page === "login" ? <LoginPage /> : <HomeComponent />}
        </AppShell.Main>
      </AppShell>
    </>
  );
}

//ITO GAMITIN PAG GUSTO GAMITIN YUNG CLOCK
// import { useRouter } from "next/router";
// import {
//   Button,
//   Group,
//   AppShell,
//   Box,
//   Image,
//   ActionIcon,
//   Text,
//   Paper,
// } from "@mantine/core";
// import Link from "next/link";
// import classes from "./login.module.css";
// import { useHeadroom } from "@mantine/hooks";
// import { IconClock } from "@tabler/icons-react";
// import { useEffect, useState, useRef } from "react";

// // Import your components
// import HomeComponent from "../components/landingpage/homepage";
// import LoginPage from "./login";
// import { getServerTime } from "../utils/getServerTime";

// export default function IndexPage() {
//   const router = useRouter();
//   const pinned = useHeadroom({ fixedAt: 80 });

//   // Toggle state: false = show icon, true = show time
//   const [showTime, setShowTime] = useState(false);
//   const [serverTime, setServerTime] = useState<Date | null>(null);
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);

//   // Fetch server time when toggled on
//   useEffect(() => {
//     if (showTime) {
//       let offset = 0;
//       const fetchTime = async () => {
//         try {
//           const dateTime = await getServerTime("datetime");
//           const serverDate = new Date(dateTime);
//           setServerTime(serverDate);
//           offset = serverDate.getTime() - Date.now();
//         } catch {
//           setServerTime(null);
//         }
//       };
//       fetchTime();

//       intervalRef.current = setInterval(() => {
//         setServerTime((prev) => {
//           if (!prev) return null;
//           // Instead of incrementing, recalculate based on offset for accuracy
//           return new Date(Date.now() + offset);
//         });
//       }, 1000);

//       return () => {
//         if (intervalRef.current) clearInterval(intervalRef.current);
//       };
//     } else {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//     }
//   }, [showTime]);

//   return (
//     <>
//       <AppShell header={{ height: 80, collapsed: !pinned }}>
//         <AppShell.Header>
//           <Group justify="space-between" h="100%" p={16}>
//             <Box component={Link} href="/">
//               <Image
//                 src="logo2.png"
//                 fit="contain"
//                 className={classes.logo}
//                 alt="horizontal logo"
//               />
//             </Box>

//             <Button
//               title="Redirect to login page"
//               component={Link}
//               href="/?page=login"
//               w={120}
//               h={45}
//               radius={12}
//               color="#096A2E"
//             >
//               Log in
//             </Button>
//           </Group>
//         </AppShell.Header>

//         <AppShell.Main>
//           {router.query.page === "login" ? <LoginPage /> : <HomeComponent />}
//         </AppShell.Main>

//         {/* Floating clock icon or time display */}
//         <Box
//           style={{
//             position: "fixed",
//             bottom: 24,
//             left: 24,
//             zIndex: 1000,
//           }}
//         >
//           {!showTime ? (
//             <ActionIcon
//               variant="filled"
//               color="green"
//               size="xl"
//               radius="xl"
//               onClick={() => setShowTime(true)}
//               title="Show server time"
//               aria-label="Show server time"
//             >
//               <IconClock size={28} />
//             </ActionIcon>
//           ) : (
//             <Paper
//               p="xs"
//               radius="xl"
//               shadow="sm"
//               style={{
//                 minWidth: 200,
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 8,
//                 cursor: "pointer",
//                 background: "#e6f4ea",
//               }}
//               onClick={() => setShowTime(false)}
//               title="Hide server time"
//               aria-label="Hide server time"
//             >
//               <IconClock size={22} color="#096A2E" />
//               <Text size="md" fw={500} c="green">
//                 {serverTime
//                   ? serverTime.toLocaleString("en-US", {
//                       month: "short",
//                       day: "numeric",
//                       year: "numeric",
//                       hour: "numeric",
//                       minute: "2-digit",
//                       hour12: true,
//                     })
//                   : "Loading..."}
//               </Text>
//             </Paper>
//           )}
//         </Box>
//       </AppShell>
//     </>
//   );
// }

import "@mantine/core/styles.css";
import "@mantine/hooks";
import "@mantine/form";
import Head from "next/head";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { theme } from "../theme";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";

export default function App({ Component, pageProps }: any) {
  return (
    <MantineProvider theme={theme}>
      <ModalsProvider>
        <Head>
          <title>LASALUMNI CONNECT</title>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
          />
          <link rel="shortcut icon" href="/green_icon.png" />
        </Head>
        <Notifications position="top-right" />
        <Component {...pageProps} />
      </ModalsProvider>
    </MantineProvider>
  );
}

import React, { useEffect, useState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Container,
  Center,
  Text,
  Image,
  Modal,
} from "@mantine/core";
import { IconId, IconLock, IconMail } from "@tabler/icons-react";
import { useRouter } from "next/router";
import axios from "axios";
import { notifications } from "@mantine/notifications";

import classes from "./login.module.css";

const LoginPage = () => {
  const [userName, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginBackgroundImage, setLoginBackgroundImage] = useState("");
  const [forgotPasswordModalOpened, setForgotPasswordModalOpened] = useState(false); // State for forgot password modal
  const [email, setEmail] = useState(""); // State for email input in forgot password modal
  const router = useRouter();

  const [modalOpened, setModalOpened] = useState(false); // State for modal

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/get_homepage_content");
        setLoginBackgroundImage(response.data.loginBackgroundImage);
      } catch (error) {
        console.error("Error fetching login background image:", error);
      }
    };

    fetchData();
  }, []);

  const handleForgotPassword = async () => {
    try {
      const response = await axios.post("/api/forgot_password", { email });
      if (response.status === 200) {
        notifications.show({
          title: "Success",
          message: "Password reset instructions have been sent to your email.",
          color: "green",
        });
        setForgotPasswordModalOpened(false);
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to send password reset instructions. Please try again.",
        color: "red",
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/api/login", {
        userName,
        passWord: password,
      });

      if (response.status === 200) {
        const { userType } = response.data;

        notifications.show({
          title: "Success",
          message: "Login successful!",
          color: "green",
        });

        setTimeout(() => {
          if (userType === "alumni") {
            router.push("../user_alumni/page");
          } else if (userType === "admin") {
            router.push("../user_admin/page");
          } else if (userType === "partner") {
            router.push("/user_partner/dashboard/page");
          }
        }, 1000);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          notifications.show({
            title: "Error",
            message: "Invalid username or password",
            color: "red",
          });
        } else if (error.response.status === 403) {
          // Show modal for inactive accounts
          setModalOpened(true);
        } else {
          notifications.show({
            title: "Error",
            message: "An error occurred. Please try again later.",
            color: "red",
          });
        } 
      } else {
        notifications.show({
          title: "Error",
          message:
            "An error occurred. Please check your connection and try again.",
          color: "red",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={classes.background}
      style={{ backgroundImage: `url(${loginBackgroundImage})` }}
    >
      <div className={classes.overlay} />

      <Container size="xs" m={"20px"} className={classes.form}>
        <Center>
          <Image
            src="green_icon.png"
            alt="Lasalumni Logo"
            className={classes.image}
          />
        </Center>
        <Text className={classes.dlsudText} mb={40}>
          De La Salle University Dasmariñas Alumni Portal
        </Text>
        <form onSubmit={handleSubmit}>
          <TextInput
            placeholder="Enter your username"
            size="md"
            value={userName}
            onChange={(event) => setUsername(event.currentTarget.value)}
            id="username"
            variant="filled"
            radius="md"
            label="Username"
            withAsterisk
            mt={20}
            leftSection={
              <IconId style={{ width: 20, height: 20 }} stroke={1.5} />
            }
            className={classes.inputs}
            autoComplete="username"
          />
          <PasswordInput
            placeholder="Enter your password"
            value={password}
            size="md"
            onChange={(event) => setPassword(event.currentTarget.value)}
            id="pw"
            variant="filled"
            radius="md"
            label="Password"
            withAsterisk
            mt={20}
            mb={10}
            leftSection={
              <IconLock style={{ width: 20, height: 20 }} stroke={1.5} />
            }
            autoComplete="current-password"
          />
          <Center>
            <Button
              title="Log-in button"
              fullWidth
              color="#285430"
              variant="filled"
              radius="md"
              type="submit"
              mt={"20px"}
              loading={loading}
            >
              Log-in
            </Button>
          </Center>
        </form>
        <Center>
          <Text
            className={classes.forgotPassword}
            mt={10}
            style={{ cursor: "pointer", color: "red" }}
            onClick={() => setForgotPasswordModalOpened(true)}
          >
            Forgot Password?
          </Text>
        </Center>
      </Container>

      {/* Modal for inactive accounts */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Account Inactive"
        centered
      >
        <Text>
          Your account is inactive due to an expired or invalid contract. Please
          coordinate with the DLSU-D Alumni Association to renew your contract.
        </Text>
      </Modal>

      {/* Modal for forgot password */}
      <Modal
        opened={forgotPasswordModalOpened}
        onClose={() => setForgotPasswordModalOpened(false)}
        title="Forgot Password"
        centered
      >
        <TextInput
          placeholder="Enter your email"
          size="md"
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
          id="email"
          variant="filled"
          radius="md"
          label="Email"
          withAsterisk
          mt={20}
          leftSection={
            <IconMail style={{ width: 20, height: 20 }} stroke={1.5} />
          }
        />
        <Button
          fullWidth
          color="#285430"
          variant="filled"
          radius="md"
          mt={20}
          onClick={handleForgotPassword}
        >
          Submit
        </Button>
      </Modal>
    </div>
  );
};

export default LoginPage;

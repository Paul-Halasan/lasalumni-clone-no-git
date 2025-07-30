import React, { useState, useEffect } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Container,
  Title,
  Group,
} from "@mantine/core";
import axios from "axios";
import { showNotification } from "@mantine/notifications";

const AdminAccountManagement = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch admin account details
    const fetchAdminDetails = async () => {
      try {
        const response = await axios.get("/api/fetch_admin_acc");
        const { userName, passWord } = response.data;
        setUsername(userName);
        setPassword(passWord);
      } catch (error) {
        console.error("Error fetching admin details:", error);
        showNotification({
          title: "Error",
          message: "Failed to fetch admin details.",
          color: "red",
        });
      }
    };

    fetchAdminDetails();
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await axios.put("/api/fetch_admin_acc", { userName: username, passWord: password });
      showNotification({
        title: "Success",
        message: "Admin account updated successfully.",
        color: "green",
      });
    } catch (error) {
      console.error("Error updating admin account:", error);
      showNotification({
        title: "Error",
        message: "Failed to update admin account.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" mt="xl">
      <Title>
        Admin Account Management
      </Title>
      <TextInput
        label="Username"
        placeholder="Enter admin username"
        value={username}
        onChange={(e) => setUsername(e.currentTarget.value)}
        required
        mb="md"
      />
      <PasswordInput
        label="Password"
        placeholder="Enter admin password"
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
        required
        mb="md"
      />
      <Group justify="center">
        <Button onClick={handleUpdate} loading={loading}>
          Update Account
        </Button>
      </Group>
    </Container>
  );
};

export default AdminAccountManagement;
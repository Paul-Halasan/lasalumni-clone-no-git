import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  TextInput,
  Textarea,
  FileInput,
  Group,
  Container,
  Title,
  Text,
  Divider,
  Box,
  Stack,
  Tooltip,
  Badge,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import {
  IconX,
  IconCheck,
  IconGift,
  IconTrash,
  IconEdit,
} from "@tabler/icons-react";
// Import the CSS from SearchAlumni component
import classes from "../../../pages/user_admin/search/search_alumni.module.css";

// Define types for our donation drive data
interface DonationDrive {
  dd_listID: string;
  dd_title: string;
  dd_desc: string;
  dd_image?: string;
  created_at?: string;
  isApproved?: number;
}

const ManageDonationDrive: React.FC = () => {
  const [donationDrives, setDonationDrives] = useState<DonationDrive[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<DonationDrive | null>(
    null
  );
  const [modalOpened, setModalOpened] = useState<boolean>(false);
  const [ddTitle, setDdTitle] = useState<string>("");
  const [ddImage, setDdImage] = useState<File | null>(null);
  const [ddDesc, setDdDesc] = useState<string>("");

  const xIcon = <IconX style={{ width: 20, height: 20 }} />;
  const checkIcon = <IconCheck style={{ width: 20, height: 20 }} />;

  useEffect(() => {
    const fetchDonationDrives = async (): Promise<void> => {
      try {
        const response = await axios.get("/api/get_donation_drives");
        setDonationDrives(response.data.donationDrives);
      } catch (error) {
        console.error("Error fetching donation drives:", error);
      }
    };

    fetchDonationDrives();
  }, []);

  const handleEdit = (drive: DonationDrive): void => {
    setSelectedDrive(drive);
    setDdTitle(drive.dd_title);
    setDdDesc(drive.dd_desc);
    setModalOpened(true);
  };

  const handleDelete = async (dd_listID: string): Promise<void> => {
    try {
      await axios.delete(`/api/delete_donationdrive?dd_listID=${dd_listID}`);
      setDonationDrives(
        donationDrives.filter((drive) => drive.dd_listID !== dd_listID)
      );
      notifications.show({
        title: "Donation Drive Deleted",
        message: "The donation drive has been deleted successfully.",
        color: "green",
        icon: checkIcon,
      });
    } catch (error) {
      console.error("Error deleting donation drive:", error);
      notifications.show({
        title: "Error",
        message: "Failed to delete the donation drive.",
        color: "red",
        icon: xIcon,
      });
    }
  };

  const updateDonationDrive = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault(); // Prevent default form submission behavior

    if (!selectedDrive) {
      notifications.show({
        title: "Error",
        message: "No donation drive selected.",
        color: "red",
        icon: xIcon,
      });
      return;
    }

    const payload: {
      dd_listID: string;
      dd_title: string;
      dd_desc: string;
      dd_image?: string;
    } = {
      dd_listID: selectedDrive.dd_listID,
      dd_title: ddTitle,
      dd_desc: ddDesc,
    };

    // If an image is included, upload it first and include its filename in the payload
    if (ddImage) {
      const ddImageFileName = `${Date.now()}-${ddImage.name}`;

      // Get presigned URL
      const {
        data: { url },
      } = await axios.get(
        `/api/generate_presigned_url?fileName=${ddImageFileName}&fileType=${ddImage.type}`
      );

      // Upload the image to S3
      await axios.put(url, ddImage, {
        headers: {
          "Content-Type": ddImage.type,
        },
      });

      payload.dd_image = ddImageFileName;
    }

    try {
      // Use JSON to send the request
      await axios.put("/api/update_donationdrive", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setDonationDrives(
        donationDrives.map((drive) =>
          drive.dd_listID === selectedDrive.dd_listID
            ? { ...drive, ...payload }
            : drive
        )
      );

      setModalOpened(false);
      notifications.show({
        title: "Donation Drive Updated",
        message: "The donation drive has been updated successfully.",
        color: "green",
        icon: checkIcon,
      });
    } catch (error) {
      console.error("Error updating donation drive:", error);
      notifications.show({
        title: "Error",
        message: "Failed to update the donation drive.",
        color: "red",
        icon: xIcon,
      });
    }
  };

  return (
    <Container size="xl" p={15} bg="white" style={{ borderRadius: 15 }}>
      <Group align="center" gap="sm" p="md">
        <IconGift size={24} color="#146a3e" />
        <Title order={3} c="#146a3e">
          Donation Drives Management
        </Title>
      </Group>

      <Container fluid className={classes.tableContainer}>
        <Table className={`${classes.table} responsive-cards`}>
          <thead className={classes.tableHeader}>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Actions</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {donationDrives.map((drive) => (
              <tr key={drive.dd_listID} className={classes.tableRow}>
                <td
                  className={`${classes.tableCell} ${classes.nameCell}`}
                  data-label="Title"
                >
                  {drive.dd_title}
                </td>
                <td className={classes.tableCell} data-label="Description">
                  {drive.dd_desc}
                </td>
                <td className={classes.tableCell} data-label="Actions">
                  <Group
                    gap="xs"
                    wrap="nowrap"
                    className={classes.actionButtons}
                  >
                    <Tooltip label="Edit">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleEdit(drive)}
                      >
                        <IconEdit size={18} />
                      </Button>
                    </Tooltip>
                    <Tooltip label="Delete">
                      <Button
                        color="red"
                        size="xs"
                        variant="outline"
                        onClick={() => handleDelete(drive.dd_listID)}
                      >
                        <IconTrash size={18} />
                      </Button>
                    </Tooltip>
                  </Group>
                </td>
                <td className={classes.tableCell} data-label="Status">
                  {drive.isApproved === 1 ? (
                    <Badge color="green" variant="filled" radius="sm">
                      Approved
                    </Badge>
                  ) : drive.isApproved === 2 ? (
                    <Badge color="orange" variant="filled" radius="sm" style={{ backgroundColor: "#ff7043" }}>
                      Denied
                    </Badge>
                  ) : (
                    <Badge color="yellow" variant="filled" radius="sm" style={{ backgroundColor: "#ffb300", color: "#7a5c00" }}>
                      Pending
                    </Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={
          <Text fw={700} size="lg" c="#146a3e">
            {selectedDrive ? "Edit Donation Drive" : "Add New Donation Drive"}
          </Text>
        }
        size="lg"
        centered
        padding="md"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <Divider mb="md" />

        <form onSubmit={updateDonationDrive}>
          <Stack gap="md">
            <Box>
              <Text fw={500} size="sm" mb={5}>
                Basic Information
              </Text>
              <TextInput
                label="Donation Drive Title"
                placeholder="Enter a clear and descriptive title"
                value={ddTitle}
                onChange={(event) => setDdTitle(event.currentTarget.value)}
                required
                styles={{
                  label: {
                    marginBottom: 6,
                    fontWeight: 500,
                  },
                  input: {
                    borderRadius: 6,
                    fontSize: "0.95rem",
                    padding: "12px 16px",
                    backgroundColor: "#f9fafb",
                  },
                }}
              />
            </Box>

            <Box>
              <Text c="dimmed" size="xs" mb={10}>
                Add a full description to help alumni understand the purpose of
                this donation drive
              </Text>
              <Textarea
                label="Donation Drive Description"
                placeholder="Describe the purpose, goals, and impact of this donation drive"
                value={ddDesc}
                onChange={(event) => setDdDesc(event.currentTarget.value)}
                required
                minRows={4}
                styles={{
                  label: {
                    marginBottom: 6,
                    fontWeight: 500,
                  },
                  input: {
                    borderRadius: 6,
                    fontSize: "0.95rem",
                    padding: "12px 16px",
                    backgroundColor: "#f9fafb",
                    minHeight: "120px",
                  },
                }}
              />
            </Box>

            <Box mt={5}>
              <Text fw={500} size="sm" mb={5}>
                Visual Content
              </Text>
              <FileInput
                label="Featured Image"
                placeholder="Upload an image to represent this drive"
                onChange={(file) => setDdImage(file)}
                accept="image/*"
                clearable
                styles={{
                  label: {
                    marginBottom: 6,
                    fontWeight: 500,
                  },
                  input: {
                    borderRadius: 6,
                    fontSize: "0.95rem",
                    padding: "10px 16px",
                    backgroundColor: "#f9fafb",
                  },
                }}
              />
              <Text c="dimmed" size="xs" mt={5}>
                Recommended: Square image (1:1 ratio), minimum 500x500px
              </Text>
            </Box>

            <Divider my="lg" />

            <Group justify="space-between" mt="md">
              <Button
                variant="subtle"
                color="gray"
                onClick={() => setModalOpened(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                styles={{
                  root: {
                    backgroundColor: "#146a3e",
                    "&:hover": {
                      backgroundColor: "#0d5730",
                    },
                  },
                }}
              >
                {selectedDrive ? "Save Changes" : "Add Donation Drive"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
};

export default ManageDonationDrive;

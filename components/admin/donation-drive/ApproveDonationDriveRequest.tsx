import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Textarea,
  Group,
  Container,
  Title,
  Text,
  Divider,
  Box,
  Stack,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import {
  IconX,
  IconCheck,
  IconGift,
  IconThumbUp,
  IconThumbDown,
} from "@tabler/icons-react";
// Import the CSS from SearchAlumni component
import classes from "../../../pages/user_admin/search/search_alumni.module.css";

interface DonationDrive {
  dd_listID: string;
  dd_title: string;
  dd_image: string;
  dd_desc: string;
  submitted_by: string;
  isApproved: boolean;
}

const ApproveDonationDriveRequest: React.FC = () => {
  const [donationDrives, setDonationDrives] = useState<DonationDrive[]>([]);
  const [modalOpened, setModalOpened] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedDriveID, setSelectedDriveID] = useState<string | null>(null);
  const [selectedDriveTitle, setSelectedDriveTitle] = useState<string | null>(
    null
  );
  const [selectedSubmittedBy, setSelectedSubmittedBy] = useState<string | null>(
    null
  );
  const [userProfiles, setUserProfiles] = useState<{ [key: string]: any }>({});

  const xIcon = <IconX style={{ width: 20, height: 20 }} />;
  const checkIcon = <IconCheck style={{ width: 20, height: 20 }} />;

  const fetchUserProfile = async (userID: string) => {
    try {
      const response = await axios.get(
        `/api/get_user_profile?userID=${userID}`
      );
      return response.data.userProfile;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  // Fetch donation drives from the API
  const fetchDonationDrives = async () => {
    try {
      const response = await axios.get("/api/get_donation_drives");
      setDonationDrives(response.data.donationDrives);

      // Fetch user profiles for each donation drive
      const profiles: { [key: string]: any } = {};
      for (const drive of response.data.donationDrives) {
        if (!profiles[drive.submitted_by]) {
          const profile = await fetchUserProfile(drive.submitted_by);
          if (profile) {
            profiles[drive.submitted_by] = profile;
          }
        }
      }
      setUserProfiles(profiles);
    } catch (error) {
      console.error("Error fetching donation drives:", error);
    }
  };

  useEffect(() => {
    fetchDonationDrives();
  }, []);

  // Approve donation drive
  const approveDonationDrive = async (
    dd_listID: string,
    submitted_by: string,
    dd_title: string
  ) => {
    try {
      const response = await axios.post("/api/approve_donation_drive", {
        dd_listID,
      });
      if (response.status === 200) {
        // Insert notification into the database
        await axios.post("/api/insert_notif", {
          message: `Donation drive "${dd_title}" has been approved. You may check it out now!`,
          directTo: "donation-drives",
          userID: submitted_by,
          isAdmin: true,
        });

        notifications.show({
          title: "Donation Drive Approved",
          message: "The donation drive has been approved successfully.",
          color: "green",
          icon: checkIcon,
        });

        fetchDonationDrives(); // Refresh the donation drives list
      } else {
        notifications.show({
          title: "Error",
          message: "Failed to approve donation drive.",
          color: "red",
          icon: xIcon,
        });
      }
    } catch (error) {
      console.error("Error approving donation drive:", error);
      notifications.show({
        title: "Error",
        message: "An error occurred while approving the donation drive.",
        color: "red",
        icon: xIcon,
      });
    }
  };

  // Deny donation drive
  const denyDonationDrive = async (dd_listID: string) => {
    try {
      const response = await fetch("/api/deny_donation_drive", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dd_listID }),
      });

      if (response.ok) {
        notifications.show({
          title: "Donation Drive Denied",
          message: "The donation drive has been denied successfully.",
          color: "green",
          icon: checkIcon,
        });
        fetchDonationDrives(); // Refresh the donation drives list
      } else {
        const errorData = await response.json();
        notifications.show({
          title: "Error Denying Donation Drive",
          message:
            errorData.error ||
            "An error occurred while denying the donation drive.",
          color: "red",
          icon: xIcon,
        });
      }
    } catch (error) {
      console.error("Error denying donation drive:", error);
      notifications.show({
        title: "Error Denying Donation Drive",
        message: "An error occurred while denying the donation drive.",
        color: "red",
        icon: xIcon,
      });
    }
  };

  // Handle deny button click
  const handleDenyClick = (
    dd_listID: string,
    dd_title: string,
    submitted_by: string
  ) => {
    setSelectedDriveID(dd_listID);
    setSelectedDriveTitle(dd_title);
    setSelectedSubmittedBy(submitted_by);
    setModalOpened(true);
  };

  // Handle modal submit
  const handleModalSubmit = async () => {
    if (selectedDriveID && selectedDriveTitle && selectedSubmittedBy) {
      await denyDonationDrive(selectedDriveID);

      // Insert notification into the database
      await axios.post("/api/insert_notif", {
        message: `Donation drive "${selectedDriveTitle}" has been denied. Reason: ${rejectionReason}`,
        directTo: "donation-drives",
        userID: selectedSubmittedBy,
        isAdmin: true,
      });

      setModalOpened(false);
      setRejectionReason("");
      setSelectedDriveID(null);
      setSelectedDriveTitle(null);
      setSelectedSubmittedBy(null);
    }
  };

  // Filter donation drives to only include those that are not approved
  const unapprovedDonationDrives = donationDrives.filter(
    (drive) => !drive.isApproved
  );

  return (
    <Container size="xl" p={15} bg="white" style={{ borderRadius: 15 }}>
      <Group align="center" gap="sm" p="md">
        <IconGift size={24} color="#146a3e" />
        <Title order={3} c="#146a3e">
          Donation Drive Approval
        </Title>
      </Group>

      <Container fluid className={classes.tableContainer}>
        <Table className={`${classes.table} responsive-cards`}>
          <thead className={classes.tableHeader}>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Image</th>
              <th>Submitted By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {unapprovedDonationDrives.length > 0 ? (
              unapprovedDonationDrives.map((drive) => (
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
                  <td className={classes.tableCell} data-label="Image">
                    <img
                      src={`https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${drive.dd_image}`}
                      alt="Donation Drive"
                      style={{
                        width: "100px",
                        maxHeight: "80px",
                        objectFit: "cover",
                      }}
                    />
                  </td>
                  <td className={classes.tableCell} data-label="Submitted By">
                    {userProfiles[drive.submitted_by]
                      ? `${userProfiles[drive.submitted_by].first_name} ${
                          userProfiles[drive.submitted_by].middle_name || ""
                        } ${userProfiles[drive.submitted_by].last_name}`
                      : "Loading..."}
                  </td>
                  <td className={classes.tableCell} data-label="Actions">
                    <Group
                      gap="xs"
                      wrap="nowrap"
                      className={classes.actionButtons}
                    >
                      <Tooltip label="Approve">
                        <Button
                          size="xs"
                          variant="outline"
                          color="green"
                          onClick={() =>
                            approveDonationDrive(
                              drive.dd_listID,
                              drive.submitted_by,
                              drive.dd_title
                            )
                          }
                        >
                          <IconThumbUp size={18} />
                        </Button>
                      </Tooltip>
                      <Tooltip label="Deny">
                        <Button
                          color="red"
                          size="xs"
                          variant="outline"
                          onClick={() =>
                            handleDenyClick(
                              drive.dd_listID,
                              drive.dd_title,
                              drive.submitted_by
                            )
                          }
                        >
                          <IconThumbDown size={18} />
                        </Button>
                      </Tooltip>
                    </Group>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  <Text c="dimmed">No pending donation drives to approve.</Text>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Container>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={
          <Text fw={700} size="lg" c="#146a3e">
            Reason for Rejection
          </Text>
        }
        size="md"
        centered
        padding="md"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <Divider mb="md" />

        <Stack gap="md">
          <Box>
            <Text fw={500} size="sm" mb={5}>
              Please provide a reason for rejection
            </Text>
            <Text c="dimmed" size="xs" mb={10}>
              This reason will be shared with the user who submitted the
              donation drive
            </Text>
            <Textarea
              placeholder="Type the reason for rejection here..."
              value={rejectionReason}
              onChange={(event) =>
                setRejectionReason(event.currentTarget.value)
              }
              minRows={4}
              required
              styles={{
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
              onClick={handleModalSubmit}
              styles={{
                root: {
                  backgroundColor: "#146a3e",
                  "&:hover": {
                    backgroundColor: "#0d5730",
                  },
                },
              }}
            >
              Confirm Rejection
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default ApproveDonationDriveRequest;

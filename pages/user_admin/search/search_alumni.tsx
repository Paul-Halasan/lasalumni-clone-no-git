import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  TextInput,
  Select,
  Button,
  Container,
  Group,
  Table,
  NumberInput,
  Modal,
  FileInput,
  Title,
  Avatar,
  Pagination,
  Flex,
  Alert,
  Grid,
  Loader,
  Center,
  Text,
  Stack,
  Checkbox,
  Tooltip,
  PasswordInput,
} from "@mantine/core";
import {
  IconSchool,
  IconEdit,
  IconTrash,
  IconAlertCircle,
  IconDownload,
} from "@tabler/icons-react";
import withAuth from "../../../components/withAuth";
import classes from "./search_alumni.module.css";
import axios from "axios";
import { getServerTime } from "../../../utils/getServerTime"; // <-- Add this import

const AdminSearchPage = () => {
  const [username, setUsername] = useState("");
  const [usertype, setUsertype] = useState("");
  const [searchResult, setSearchResult] = useState<User[]>([]);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [batch, setBatch] = useState("");
  const [department, setDepartment] = useState("");
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear()); // <-- Use server year
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportModalOpened, setExportModalOpened] = useState(false);
  const [exportFileUrl, setExportFileUrl] = useState<string | null>(null);

  // Bulk delete states
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkDeleteModalOpened, setBulkDeleteModalOpened] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  interface User {
    userName: string;
    passWord: string;
    userType: string;
    last_login: string;
    userID: string;
    newProfilePicture?: File;
    newResume?: File;
    alumniProfile?: {
      first_name: string;
      last_name: string;
      date_of_birth: string;
      email_address: string;
      telephone_number: string;
      profile_picture?: string;
      batch: string;
      department: string;
      resume?: string;
    };
    
  }

  const paginatedData = searchResult.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const [newPassword, setNewPassword] = useState<string>(""); // Initialize newPassword
  const [confirmPassword, setConfirmPassword] = useState<string>(""); // Initialize confirmPassword

  // Fetch search results
  const fetchSearchResults = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/search_alumni", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, usertype, batch, department }),
      });

      const result = await response.json();
      if (response.ok && result.users) {
        setSearchResult(result.users);
      } else {
        setSearchResult([]);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResult([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all records
  const fetchAllRecords = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/search_alumni", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "",
          usertype: "",
          batch: "",
          department: "",
        }),
      });

      const result = await response.json();
      if (response.ok && result.users) {
        setSearchResult(result.users);
      } else {
        setSearchResult([]);
      }
    } catch (error) {
      console.error("Error fetching all records:", error);
      setSearchResult([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (username || usertype || batch || department) {
      fetchSearchResults();
    } else {
      fetchAllRecords();
    }
  }, [username, usertype, batch, department]);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditModalOpened(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedUser) return;
  
    const profilePictureFileName = selectedUser.newProfilePicture
      ? `${Date.now()}-${selectedUser.newProfilePicture.name}`
      : null;
    const resumeFileName = selectedUser.newResume
      ? `${Date.now()}-${selectedUser.newResume.name}`
      : null;
  
    try {
      // Check if the username has been modified
      const originalUser = searchResult.find((user) => user.userID === selectedUser.userID);
      if (originalUser && originalUser.userName !== selectedUser.userName) {
        // Validate the new username
        const usernameResponse = await fetch("/api/admin_crud/checkusername", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: selectedUser.userName }),
        });
  
        const usernameResult = await usernameResponse.json();
        if (usernameResponse.status === 400) {
          setErrorMessage(usernameResult.error || "Username is already taken.");
          return;
        }
  
        // Call the change_username API to update the username
        const changeUsernameResponse = await fetch("/api/change_username", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: originalUser.userName, // Current username
            newUsername: selectedUser.userName, // New username
          }),
        });
  
        const changeUsernameResult = await changeUsernameResponse.json();
        if (!changeUsernameResponse.ok) {
          setErrorMessage(changeUsernameResult.error || "Failed to update username.");
          return;
        }
      }
  
      // Check if the password has been modified
      if (originalUser && originalUser.passWord !== selectedUser.passWord) {
        const passwordResponse = await fetch("/api/change_password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userID: selectedUser.userID,
            currentPassword: originalUser.passWord, // Pass the original password
            newPassword: selectedUser.passWord, // Pass the updated password
          }),
        });
  
        const passwordResult = await passwordResponse.json();
        if (!passwordResponse.ok) {
          setErrorMessage(passwordResult.message || "Failed to update password.");
          return;
        }
      }
  
      // Upload profile picture to S3 using presigned URL
      if (selectedUser.newProfilePicture) {
        const {
          data: { url: profilePictureUrl },
        } = await axios.get(
          `/api/generate_presigned_url?fileName=${profilePictureFileName}&fileType=${selectedUser.newProfilePicture.type}`
        );
        await axios.put(profilePictureUrl, selectedUser.newProfilePicture, {
          headers: {
            "Content-Type": selectedUser.newProfilePicture.type,
          },
        });
      }
  
      // Upload resume to S3 using presigned URL
      if (selectedUser.newResume) {
        const {
          data: { url: resumeUrl },
        } = await axios.get(
          `/api/generate_presigned_url?fileName=${resumeFileName}&fileType=${selectedUser.newResume.type}`
        );
        await axios.put(resumeUrl, selectedUser.newResume, {
          headers: {
            "Content-Type": selectedUser.newResume.type,
          },
        });
      }
  
      // Update user profile
      const formData = {
        userID: selectedUser.userID,
        userName: selectedUser.userName, // Include the updated username
        first_name: selectedUser.alumniProfile?.first_name,
        last_name: selectedUser.alumniProfile?.last_name,
        email_address: selectedUser.alumniProfile?.email_address,
        telephone_number: selectedUser.alumniProfile?.telephone_number,
        profilePictureFileName,
        resumeFileName,
      };
  
      const response = await fetch("/api/admin_edit_alumni", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      if (response.status === 200) {
        setSuccessMessage("User profile updated successfully");
        setErrorMessage(null);
        setEditModalOpened(false);
        fetchSearchResults();
      } else {
        const result = await response.json();
        setErrorMessage(result.error || "Failed to update user profile.");
        setSuccessMessage(null);
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
      setErrorMessage("An error occurred while updating the user profile.");
      setSuccessMessage(null);
    }
  };

  const handleDelete = async (userID: string) => {
    const confirmed = confirm("Are you sure you want to delete this record?");
    if (confirmed) {
      try {
        const response = await fetch("/api/delete_alumni", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userID }),
        });

        if (response.ok) {
          console.log("User deleted successfully");
          setSuccessMessage("User deleted successfully");
          fetchSearchResults();
        } else {
          console.error("Failed to delete the user:", response.status);
          setErrorMessage("Failed to delete the user");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        setErrorMessage("An error occurred while deleting the user");
      }
    }
  };

  // Handle individual checkbox selection
  const handleCheckboxChange = (userID: string) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userID)) {
        return prev.filter((id) => id !== userID);
      } else {
        return [...prev, userID];
      }
    });
  };

  // Handle "select all" checkbox
  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedData.map((user) => user.userID));
    }
    setSelectAll(!selectAll);
  };

  // Handle bulk delete confirmation
  const handleBulkDeleteConfirm = async () => {
    if (selectedUsers.length === 0) return;

    setIsDeleting(true);
    try {
      const failedDeletions: string[] = [];

      for (const userID of selectedUsers) {
        try {
          const response = await fetch("/api/delete_alumni", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userID }),
          });

          if (!response.ok) {
            failedDeletions.push(userID);
          }
        } catch (error) {
          console.error(`Error deleting user ${userID}:`, error);
          failedDeletions.push(userID);
        }
      }

      if (failedDeletions.length === 0) {
        setSuccessMessage(
          `Successfully deleted ${selectedUsers.length} alumni records`
        );
        setErrorMessage(null);
      } else {
        setErrorMessage(
          `Failed to delete ${failedDeletions.length} out of ${selectedUsers.length} records`
        );
        setSuccessMessage(
          selectedUsers.length > failedDeletions.length
            ? `Successfully deleted ${
                selectedUsers.length - failedDeletions.length
              } alumni records`
            : null
        );
      }

      // Reset selection and close modal
      setSelectedUsers([]);
      setSelectAll(false);
      setBulkDeleteModalOpened(false);
      fetchSearchResults();
    } catch (error) {
      console.error("Error performing bulk deletion:", error);
      setErrorMessage("An error occurred while deleting the selected records");
      setSuccessMessage(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Fetch authoritative server year on mount
  useEffect(() => {
    getServerTime("year")
      .then(setCurrentYear)
      .catch(() => setCurrentYear(new Date().getFullYear()));
  }, []);

  return (
    <Container size="xl" p={15} bg="white" style={{ borderRadius: 15 }}>
      <Group align="center" gap="sm" p="md">
        <IconSchool size={24} color="#146a3e" />
        <Title order={3} c="#146a3e">
          Alumni Catalog
        </Title>
      </Group>

      {/* Search Form */}
      <Container fluid p="xs" mb="xl" className={classes.searchForm}>
        <form onSubmit={(e) => e.preventDefault()}>
          <Grid gutter="md">
            <Grid.Col span={{ lg: 4, md: 12, sm: 12 }}>
              <TextInput
                label="Username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.currentTarget.value)}
              />
            </Grid.Col>

            <Grid.Col span={{ lg: 4, md: 12, sm: 12 }}>
              <NumberInput
                label="Batch"
                placeholder="Enter batch"
                value={batch ? parseInt(batch) : undefined}
                min={1975}
                max={currentYear}
                onChange={(value) => setBatch(value ? value.toString() : "")}
              />
            </Grid.Col>

            <Grid.Col span={{ lg: 4, md: 12, sm: 12 }}>
              <Select
                label="Department"
                placeholder="Select department"
                value={department}
                onChange={(value) => setDepartment(value || "")}
                data={[
                  { value: "CBAA", label: "CBAA" },
                  { value: "CCJE", label: "CCJE" },
                  { value: "COEd", label: "COEd" },
                  { value: "CEAT", label: "CEAT" },
                  { value: "CICS", label: "CICS" },
                  { value: "COL", label: "COL" },
                  { value: "CLAC", label: "CLAC" },
                  { value: "COS", label: "COS" },
                  { value: "CTHM", label: "CTHM" },
                ]}
              />
            </Grid.Col>
          </Grid>
        </form>
      </Container>

      {/* Bulk Action Buttons */}
      {searchResult.length > 0 && (
        <Group justify="flex-end" mb="md">
          <Button
            color="red"
            leftSection={<IconTrash size={16} />}
            disabled={selectedUsers.length === 0}
            onClick={() => setBulkDeleteModalOpened(true)}
          >
            Delete Selected ({selectedUsers.length})
          </Button>
          <Button
            color="blue"
            leftSection={<IconDownload size={16} />}
            onClick={async () => {
              setIsExporting(true);
              try {
                const response = await fetch("/api/export_alumni");
                const result = await response.json();

                if (response.ok && result.fileUrl) {
                  setExportFileUrl(result.fileUrl);
                  setExportModalOpened(true);
                } else {
                  setErrorMessage("Failed to export alumni data");
                }
              } catch (error) {
                console.error("Error exporting alumni data:", error);
                setErrorMessage("An error occurred while exporting alumni data");
              } finally {
                setIsExporting(false);
              }
            }}
            loading={isExporting}
          >
            Export Alumni Data
          </Button>
        </Group>
      )}

      {/* Search Results Table */}
      <Container fluid className={classes.tableContainer} mt={32}>
        {isLoading ? (
          <Center py="xl">
            <Stack align="center" gap="sm">
              <Loader color="#146a3e" size="md" />
              <Text c="dimmed" size="sm">
                Loading alumni records...
              </Text>
            </Stack>
          </Center>
        ) : searchResult.length > 0 ? (
          <>
            <Table className={`${classes.table} responsive-cards`}>
              <thead className={classes.tableHeader}>
                <tr>
                  <th>
                    <Center>
                      <Checkbox
                        checked={selectAll}
                        onChange={handleSelectAllChange}
                        indeterminate={
                          selectedUsers.length > 0 &&
                          selectedUsers.length < paginatedData.length
                        }
                      />
                    </Center>
                  </th>
                  <th>UserID</th>
                  <th></th>
                  <th>Name</th>
                  <th>Email</th>
                  <th className="tablet-hidden">Birth Date</th>
                  <th>Batch</th>
                  <th>Department</th>
                  <th className="tablet-hidden">Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((user: User) => (
                  <tr key={user.userID} className={classes.tableRow}>
                    <td>
                      <Center>
                        <Checkbox
                          checked={selectedUsers.includes(user.userID)}
                          onChange={() => handleCheckboxChange(user.userID)}
                        />
                      </Center>
                    </td>
                    <td
                      className={`${classes.tableCell} ${classes.userIdCell}`}
                      data-label="UserID"
                    >
                      {user.userID}
                    </td>

                    <td
                      className={`${classes.tableCell} profile-cell`}
                      data-label="Profile"
                    >
                      <Avatar
                        src={
                          user.alumniProfile?.profile_picture
                            ? `https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${user.alumniProfile?.profile_picture}`
                            : null
                        }
                        size="md"
                        radius="xl"
                        color="gray"
                        className={classes.profilePicture}
                      >
                        {user.alumniProfile?.first_name
                          ? user.alumniProfile.first_name[0]
                          : ""}
                        {user.alumniProfile?.last_name
                          ? user.alumniProfile.last_name[0]
                          : ""}
                      </Avatar>
                    </td>

                    <td
                      className={`${classes.tableCell} ${classes.nameCell}`}
                      data-label="Name"
                    >
                      {user.alumniProfile?.first_name || "N/A"}{" "}
                      {user.alumniProfile?.last_name || "N/A"}
                    </td>

                    <td
                      className={`${classes.tableCell} ${classes.emailCell}`}
                      data-label="Email"
                    >
                      {user.alumniProfile?.email_address || "N/A"}
                    </td>

                    <td
                      className={`${classes.tableCell} tablet-hidden`}
                      data-label="Birth Date"
                    >
                      {user.alumniProfile?.date_of_birth
                        ? new Date(
                            user.alumniProfile.date_of_birth
                          ).toLocaleDateString()
                        : "N/A"}
                    </td>

                    <td className={classes.tableCell} data-label="Batch">
                      {user.alumniProfile?.batch || "N/A"}
                    </td>

                    <td className={classes.tableCell} data-label="Department">
                      {user.alumniProfile?.department || "N/A"}
                    </td>

                    <td
                      className={`${classes.tableCell} tablet-hidden`}
                      data-label="Last Login"
                    >
                      {user.last_login
                        ? formatDistanceToNow(new Date(user.last_login), {
                            addSuffix: true,
                          })
                        : "N/A"}
                    </td>

                    <td className={classes.tableCell} data-label="Actions">
                      <Group
                        gap="xs"
                        justify="flex-end"
                        wrap="nowrap"
                        className={classes.actionButtons}
                      >
                        <Tooltip label="Edit">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleEdit(user)}
                          >
                            <IconEdit size={18} />
                          </Button>
                        </Tooltip>
                        <Tooltip label="Delete">
                          <Button
                            color="red"
                            size="xs"
                            variant="outline"
                            onClick={() => handleDelete(user.userID)}
                          >
                            <IconTrash size={18} />
                          </Button>
                        </Tooltip>
                      </Group>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        ) : (
          <div className={classes.emptyState}>
            No alumni records found. Try adjusting your search criteria.
          </div>
        )}
      </Container>

      <Flex justify="center" mt="xl" className={classes.paginationContainer}>
        <Pagination
          withEdges
          total={Math.ceil(searchResult.length / itemsPerPage)}
          value={currentPage}
          onChange={setCurrentPage}
          radius="md"
        />
      </Flex>

      {/* Edit User Modal */}
      <Modal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        title="Edit User Information"
        centered
        size="lg"
      >
        {selectedUser && (
          <div>
            {/* Username Field with Validation */}
            <TextInput
              label="Username"
              value={selectedUser.userName || ""}
              onChange={async (e) => {
                const newUsername = e.currentTarget.value;
                setSelectedUser((prev) => {
                  if (!prev) return prev;
                  return { ...prev, userName: newUsername };
                });

                // Check if the username exists
                try {
                  const response = await fetch("/api/admin_crud/checkusername", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ username: newUsername }),
                  });

                  const data = await response.json();
                  if (response.status === 400) {
                    setErrorMessage(data.error); // Show error if username exists
                  } else {
                    setErrorMessage(null); // Clear error if username is available
                  }
                } catch (error) {
                  console.error("Error checking username:", error);
                  setErrorMessage("Error checking username");
                }
              }}
              error={errorMessage && errorMessage.includes("Username") ? errorMessage : undefined}
              mb="md"
            />

            {/* Password Field */}
            <PasswordInput
              label="Password"
              type="password"
              value={selectedUser.passWord || ""}
              onChange={(e) =>
                setSelectedUser((prev) => {
                  if (!prev) return prev;
                  return { ...prev, passWord: e.currentTarget.value };
                })
              }
              mb="md"
            />

            {/* Other Fields */}
            <TextInput
              label="First Name"
              value={selectedUser.alumniProfile?.first_name || ""}
              onChange={(e) =>
                setSelectedUser((prev) => {
                  if (!prev || !prev.alumniProfile) return prev;
                  return {
                    ...prev,
                    alumniProfile: {
                      ...prev.alumniProfile,
                      first_name: e.currentTarget.value,
                    },
                  };
                })
              }
              mb="md"
            />
            <TextInput
              label="Last Name"
              value={selectedUser.alumniProfile?.last_name || ""}
              onChange={(e) =>
                setSelectedUser((prev) => {
                  if (!prev || !prev.alumniProfile) return prev;
                  return {
                    ...prev,
                    alumniProfile: {
                      ...prev.alumniProfile,
                      last_name: e.currentTarget.value,
                    },
                  };
                })
              }
              mb="md"
            />
            <TextInput
              label="Email Address"
              value={selectedUser.alumniProfile?.email_address || ""}
              onChange={(e) =>
                setSelectedUser((prev) => {
                  if (!prev || !prev.alumniProfile) return prev;
                  return {
                    ...prev,
                    alumniProfile: {
                      ...prev.alumniProfile,
                      email_address: e.currentTarget.value,
                    },
                  };
                })
              }
              mb="md"
            />
            <TextInput
              label="Telephone Number"
              value={selectedUser.alumniProfile?.telephone_number || ""}
              onChange={(e) =>
                setSelectedUser((prev) => {
                  if (!prev || !prev.alumniProfile) return prev;
                  return {
                    ...prev,
                    alumniProfile: {
                      ...prev.alumniProfile,
                      telephone_number: e.currentTarget.value,
                    },
                  };
                })
              }
              mb="md"
            />
            <Group align="right" mt="md">
              <Button color="blue" onClick={handleSaveChanges}>
                Save Changes
              </Button>
            </Group>
          </div>
        )}
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        opened={bulkDeleteModalOpened}
        onClose={() => setBulkDeleteModalOpened(false)}
        title={
          <Group align="center">
            <IconAlertCircle size={20} color="red" />
            <Text fw={600}>Confirm Bulk Delete</Text>
          </Group>
        }
        centered
      >
        <Text mb="md">
          Are you sure you want to delete {selectedUsers.length} selected alumni
          records? This action cannot be undone.
        </Text>

        <Alert color="red" icon={<IconAlertCircle size={16} />} mb="md">
          Warning: This will permanently remove all data associated with these
          alumni accounts.
        </Alert>

        <Group justify="flex-end" mt="xl">
          <Button
            variant="outline"
            onClick={() => setBulkDeleteModalOpened(false)}
          >
            Cancel
          </Button>
          <Button
            color="red"
            onClick={handleBulkDeleteConfirm}
            loading={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Records"}
          </Button>
        </Group>
      </Modal>

      {/* Export Modal */}
      <Modal
        opened={exportModalOpened}
        onClose={() => setExportModalOpened(false)}
        title="Download Alumni Data"
        centered
      >
        <Text>Click the button below to download the alumni data:</Text>
        <Group mt="md" justify="center">
          <Button
            component="a"
            href={exportFileUrl || undefined}
            target="_blank"
            rel="noopener noreferrer"
            color="green"
          >
            Download File
          </Button>
        </Group>
      </Modal>

      {errorMessage && (
        <Alert
          title="Error"
          color="red"
          mt="md"
          withCloseButton
          onClose={() => setErrorMessage(null)}
        >
          {errorMessage}
        </Alert>
      )}
      {successMessage && (
        <Alert
          title="Success"
          color="green"
          mt="md"
          withCloseButton
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}
    </Container>
  );
};

export default withAuth(AdminSearchPage, ["admin"]);

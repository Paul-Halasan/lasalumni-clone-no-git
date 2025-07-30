import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Container,
  TextInput,
  Button,
  Group,
  Text,
  Tabs,
  Divider,
  Card,
  Avatar,
  Stack,
  ActionIcon,
  Title,
  SimpleGrid,
  Timeline,
  Select,
  FileInput,
  Input,
  Modal,
} from "@mantine/core";
import {
  IconSettings,
  IconUser,
  IconSchool,
  IconBriefcase2,
  IconPencil,
  IconBuildings,
  IconCalendarEvent,
  IconDeviceFloppy,
  IconArrowLeft,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import CurrentAddress from "../../../components/common/UserAddress";
import DOMPurify from "isomorphic-dompurify";
import RichTextEditorComponent from "../../../components/common/richtextbox";
import PlaceholderNoData from "../../../components/common/PlaceholderNoData";
import { BaseDemo } from "../../../components/common/dropfiles";
import DateSelector from "../../../components/common/DateSelector";
import { showNotification } from "@mantine/notifications";
import { PasswordStrength } from "../../../components/admin/add_alumni/PasswordStrength";

const CustomLabel: React.FC<{ label: string }> = ({ label }) => (
  <Text c="dimmed" fw={700} size="sm">
    {label.replace("_", " ").toUpperCase()}
  </Text>
);

const EditProfile: React.FC = () => {
  const [userID, setUserID] = useState("");
  const [userName, setUserName] = useState("");
  const [passWord, setPassWord] = useState("");

  const [profile, setProfile] = useState({
    last_name: "",
    first_name: "",
    middle_name: "",
    mobile_number: "",
    telephone_number: "",
    email_address: "",
    country: "",
    region: "",
    city: "",
    province: "",
    profile_picture: "",
    date_of_birth: "",
    gender: "",
    civil_status: "",
    nationality: "",
    created_at: "",
    updated_at: "",
    resume: "",
    department: "",
    batch: "",
    program: "",
    job_profession: "",
    job_status: "",
    prof_summary: "",
    fb_link: "", // <-- Add this
    linkedin_link: "", // <-- Add this
  });

  const [country, setCountry] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const [province, setProvince] = useState<string>("");
  const [city, setCity] = useState<string>("");

  const [educ, setEduc] = useState<
    Array<{
      degree: string;
      school: string;
      start_date: string;
      end_date: string;
    }>
  >([]);

  const [tempEduc, setTempEduc] = useState({
    degree: "",
    school: "",
    start_date: "",
    end_date: "",
  });

  const [newEduc, setNewEduc] = useState({
    degree: "",
    school: "",
    start_date: "",
    end_date: "",
  });
  const [isAddingEduc, setIsAddingEduc] = useState(false);

  const [job, setJob] = useState<
    Array<{
      jobtitle: string;
      companyname: string;
      start_date: string;
      end_date: string;
    }>
  >([]);

  const [newJob, setNewJob] = useState({
    jobtitle: "",
    companyname: "",
    start_date: "",
    end_date: "",
  });
  const [isAddingJob, setIsAddingJob] = useState(false);

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const sanitizedProfSummary = DOMPurify.sanitize(profile?.prof_summary || "");

  const [editingEducIndex, setEditingEducIndex] = useState<number | null>(null);
  const [editingJobIndex, setEditingJobIndex] = useState<number | null>(null);

  // profile information
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [isEditingContactInfo, setIsEditingContactInfo] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // job information
  const [isEditingJobInfo, setIsEditingJobInfo] = useState(false);
  const [isEditingProfSummary, setIsEditingProfSummary] = useState(false);
  const [isEditingJobExperience, setIsEditingJobExperience] = useState(false);

  // account information
  const [isEditingAccountInfo, setIsEditingAccountInfo] = useState(false);

  const [emailAddress, setEmailAddress] = useState("");
  const [userEnteredCode, setUserEnteredCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isEmailChanged, setIsEmailChanged] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange("email_address", e.target.value);
    setEmailAddress(e.target.value); // Update emailAddress state
    setIsEmailChanged(true); // Set email changed state to true
  };

  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [originalUserName, setOriginalUserName] = useState(""); // Store the original username
  const [usernameError, setUsernameError] = useState("");
  const [isSavingUsername, setIsSavingUsername] = useState(false);

  const handleUsernameChange = async () => {
    setIsSavingUsername(true);
    setUsernameError("");
  
    try {
      // Call the API to update the username
      const response = await fetch("/api/change_username", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: originalUserName,
          newUsername: userName,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        setUsernameError(data.error || "An error occurred while updating the username.");
        setIsSavingUsername(false);
        return;
      }
  
      console.log("Username updated successfully. Calling /api/update_tokens...");
  
      // Retrieve the token from cookies
      const cookies = document.cookie
        .split("; ")
        .find((row) => row.startsWith("access-token="));
      const token = cookies ? cookies.split("=")[1] : null;
  
      if (!token) {
        console.error("Access token is missing. Falling back to headers.");
      }
  
      // Call the API to update tokens
      const tokenResponse = await fetch("/api/update_tokens", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token || ""}`, // Include the token in the Authorization header
        },
      });
  
      if (!tokenResponse.ok) {
        console.error("Failed to update tokens.");
      } else {
        console.log("Tokens updated successfully.");
      }
  
      // Update the original username after successful change
      setOriginalUserName(userName);
      setIsEditingUsername(false);
    } catch (error) {
      console.error("Error in handleUsernameChange:", error);
      setUsernameError("An unexpected error occurred.");
    } finally {
      setIsSavingUsername(false);
    }
  };

  const handleCancelUsernameEdit = () => {
    // Revert to the original username
    setUserName(originalUserName);
    setIsEditingUsername(false);
    setUsernameError("");
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showNotification({
        title: "Error",
        message: "New password and confirm password do not match.",
        color: "red",
      });
      return;
    }

    try {
      const response = await fetch("/api/change_password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userID,
          currentPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        showNotification({
          title: "Success",
          message: "Password changed successfully.",
          color: "green",
        });
        setIsChangePasswordModalOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const errorData = await response.json();
        showNotification({
          title: "Error",
          message: errorData.message || "Failed to change password.",
          color: "red",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      showNotification({
        title: "Error",
        message: "An error occurred while changing the password.",
        color: "red",
      });
    }
  };

  const sendConfirmationCode = async () => {
    try {
      // Fetch the confirmation code from the API
      const codeResponse = await fetch("/api/generate_confcode");
      const codeData = await codeResponse.json();
      const generatedCode = codeData.confirmationCode;

      // Set the generated confirmation code in the state
      setGeneratedCode(generatedCode);

      // Send the email with the confirmation code
      const response = await fetch("/api/sendmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: emailAddress,
          subject: "Your Confirmation Code (from LASALUMNI CONNECT)",
          text: `Your confirmation code is: ${generatedCode}. Please enter this code in the confirmation code field to verify your email address.`,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setEmailStatus("Email sent successfully");
      } else {
        setEmailStatus(`Failed to send email: ${data.message}`);
      }
    } catch (error) {
      setEmailStatus("Failed to send email");
    }
  };

  const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enteredCode = event.currentTarget.value;
    setUserEnteredCode(enteredCode);
    setIsVerified(enteredCode === generatedCode);
  };

  const defaultProfilePicture =
    "https://i.pinimg.com/474x/f1/da/a7/f1daa70c9e3343cebd66ac2342d5be3f.jpg";

  useEffect(() => {
    setCountry(profile.country);
    setRegion(profile.region);
    setProvince(profile.province);
    setCity(profile.city);
  }, [profile]);

  const [editableProfile, setEditableProfile] = useState({
    ...profile,
    fb_link: profile.fb_link || "",
    linkedin_link: profile.linkedin_link || "",
  });

  const handleInputChange = (field: string, value: string) => {
    setEditableProfile({ ...editableProfile, [field]: value });
  };

  useEffect(() => {
    // Fetch user data
    async function fetchUserData() {
      try {
        const userResponse = await fetch("/api/user");
        const profileResponse = await fetch(
          "/api/alumni_profile/retrieve_alu_profile"
        );

        const educResponse = await fetch(
          "/api/alumni_profile/retrieve_alu_educ"
        );

        const jobResponse = await fetch("/api/alumni_profile/retrieve_alu_job");

        if (
          !userResponse.ok ||
          !profileResponse.ok ||
          !educResponse.ok ||
          !jobResponse.ok
        ) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await userResponse.json();
        const profileData = await profileResponse.json();
        const educData = await educResponse.json();
        const jobData = await jobResponse.json();

        setUserID(userData.userID || profileData.userID);
        setUserName(userData.userName || profileData.userName);
        setPassWord(userData.passWord || profileData.passWord);

        setProfile((prevProfile) => ({
          ...prevProfile,
          ...profileData,
        }));

        setEduc(educData);
        setJob(Array.isArray(jobData) ? jobData : []);

        // Update the username and other user details
        setUserName(userData.userName);
        setUserID(userData.userID);
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    }

    fetchUserData();
  }, []);

  useEffect(() => {
    setCountry(profile.country);
    setRegion(profile.region);
    setProvince(profile.province);
    setCity(profile.city);
    setEditableProfile(profile);
  }, [profile]);

  const uploadFileToS3 = async (
    file: File,
    fieldName: string
  ): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const {
      data: { url: presignedUrl },
    } = await axios.get(
      `/api/generate_presigned_url?fileName=${fileName}&fileType=${file.type}`
    );
    await axios.put(presignedUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
    });
    return `public/${fileName}`;
  };

  const handleAluProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Form submitted");

    const formData = new FormData();
    console.log(userID);
    formData.append("userID", userID);
    formData.append("first_name", editableProfile.first_name);
    formData.append("middle_name", editableProfile.middle_name);
    formData.append("last_name", editableProfile.last_name);
    formData.append("gender", editableProfile.gender);
    formData.append("date_of_birth", editableProfile.date_of_birth);
    formData.append("civil_status", editableProfile.civil_status);
    formData.append("nationality", editableProfile.nationality);
    formData.append("mobile_number", editableProfile.mobile_number);
    formData.append("telephone_number", editableProfile.telephone_number);
    formData.append("email_address", editableProfile.email_address);
    formData.append("country", country);
    formData.append("region", region);
    formData.append("province", province);
    formData.append("city", city);
    formData.append("job_profession", editableProfile.job_profession);
    formData.append("job_status", editableProfile.job_status);
    formData.append("prof_summary", editableProfile.prof_summary);
    formData.append("fb_link", editableProfile.fb_link || "");
    formData.append("linkedin_link", editableProfile.linkedin_link || "");

    try {
      // Handle profile picture upload
      if (profilePicture) {
        const profilePicturePath = await uploadFileToS3(
          profilePicture,
          "profile_picture"
        );
        formData.append("profile_picture", profilePicturePath);
      } else {
        const currentProfilePicture = editableProfile.profile_picture || "";
        formData.append(
          "profile_picture",
          currentProfilePicture.replace(/^public\//, "") // Remove "public/" if it already exists
        );
      }

      // Handle resume upload
      if (resumeFile) {
        const resumeFileName = `${Date.now()}-${resumeFile.name}`;
        const {
          data: { url: resumeUrl },
        } = await axios.get(
          `/api/generate_presigned_url?fileName=${resumeFileName}&fileType=${resumeFile.type}`
        );
        await axios.put(resumeUrl, resumeFile, {
          headers: {
            "Content-Type": resumeFile.type,
          },
        });
        formData.append("resume", `${resumeFileName}`);
      } else {
        const currentResume = editableProfile.resume || "";
        formData.append(
          "resume",
          currentResume.replace(/^public\//, "") // Remove "public/" if it already exists
        );
      }

      // Convert FormData to plain object for logging
      const formDataObj = Object.fromEntries(formData.entries());
      console.log("FormData being sent:", formDataObj);

      const response = await fetch("/api/edit_alumni", {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Profile updated successfully:", data);
        // Update the state with the new profile data
        setProfile((prevProfile) => ({
          ...prevProfile,
          ...editableProfile,
          country,
          region,
          province,
          city,
        }));
        setIsEditingBasicInfo(false);
        setIsEditingContactInfo(false);
        setIsEditingAddress(false);
        setIsEditingJobInfo(false);
        setIsEditingProfSummary(false);
      } else {
        const errorText = await response.text();
        console.error("Error updating profile:", errorText);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleProfilePictureSubmit = async () => {
    try {
      // Upload profile picture to S3 using presigned URL
      if (profilePicture) {
        const profilePictureFileName = `${Date.now()}-${profilePicture.name}`;
        const {
          data: { url: profilePictureUrl },
        } = await axios.get(
          `/api/generate_presigned_url?fileName=${profilePictureFileName}&fileType=${profilePicture.type}`
        );
        await axios.put(profilePictureUrl, profilePicture, {
          headers: {
            "Content-Type": profilePicture.type,
          },
        });
        const formData = new FormData();
        formData.append("userID", userID);
        formData.append("profile_picture", `${profilePictureFileName}`);
        formData.append("userID", userID);
        formData.append("first_name", editableProfile.first_name);
        formData.append("middle_name", editableProfile.middle_name);
        formData.append("last_name", editableProfile.last_name);
        formData.append("gender", editableProfile.gender);
        formData.append("date_of_birth", editableProfile.date_of_birth);
        formData.append("civil_status", editableProfile.civil_status);
        formData.append("nationality", editableProfile.nationality);
        formData.append("mobile_number", editableProfile.mobile_number);
        formData.append("telephone_number", editableProfile.telephone_number);
        formData.append("email_address", editableProfile.email_address);
        formData.append("country", country);
        formData.append("region", region);
        formData.append("province", province);
        formData.append("city", city);
        formData.append("job_profession", editableProfile.job_profession);
        formData.append("job_status", editableProfile.job_status);
        formData.append("prof_summary", editableProfile.prof_summary);
        formData.append("fb_link", editableProfile.fb_link || "");
        formData.append("linkedin_link", editableProfile.linkedin_link || "");

        const response = await fetch("/api/edit_alumni", {
          method: "PUT",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Profile picture updated successfully:", data);
          setProfile((prevProfile) => ({
            ...prevProfile,
            profile_picture: `/${profilePictureFileName}`,
          }));
          setIsModalOpen(false);
        } else {
          const errorText = await response.text();
          console.error("Error updating profile picture:", errorText);
        }
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
    }
  };

  const formatDateOfBirth = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <Container pl={0} p="md" size="md">
        <Button
          variant="transparent"
          size="compact-md"
          leftSection={<IconArrowLeft />}
          color="#146a3e"
          component="a"
          href="?page=user-profile"
        >
          back to Search Alumni
        </Button>
      </Container>
      <Container
        size="md"
        bg={"white"}
        h={"100%"}
        p={15}
        style={{ borderRadius: 8 }}
      >
        <Text fw="500" size="xl" pb="lg">
          Account Settings
        </Text>
        <Divider size="xs" />

        <Tabs color="#146a3e" variant="pills" defaultValue="profile">
          <Tabs.List grow my="md">
            <Tabs.Tab value="profile" leftSection={<IconUser size="1rem" />}>
              Profile Information
            </Tabs.Tab>
            <Tabs.Tab value="educ" leftSection={<IconSchool size="1rem" />}>
              Educational Background
            </Tabs.Tab>
            <Tabs.Tab value="job" leftSection={<IconBriefcase2 size="1rem" />}>
              Job Information
            </Tabs.Tab>
            <Tabs.Tab
              value="account"
              leftSection={<IconSettings size="1rem" />}
            >
              User Information
            </Tabs.Tab>
          </Tabs.List>

          <Divider size="xs" />

          <Tabs.Panel value="account" pt={30}>
            <Card shadow="sm" withBorder>
              <Group justify="space-between">
                <Text c="dimmed" fw={700}>
                  Your Alumni ID:
                </Text>
                <TextInput value={userID} readOnly />
              </Group>
            </Card>

            <Group justify="space-between" mt={50}>
              <Title c="#146a3e" order={5}>
                ACCOUNT CREDENTIALS
              </Title>
            </Group>
            <Divider my="sm" />

            <Card shadow="sm" withBorder mt={15}>
            <Group justify="space-between" mb="md">
              <Text c="dimmed" fw={700}>
                Username:
              </Text>
              <TextInput
                value={userName}
                onChange={(event) => setUserName(event.currentTarget.value)}
                readOnly={!isEditingUsername}
                error={usernameError}
              />
            </Group>

            {isEditingUsername ? (
              <Group justify="flex-end">
                <Button
                  variant="outline"
                  color="red"
                  onClick={handleCancelUsernameEdit} // Cancel editing
                  disabled={isSavingUsername}
                >
                  Cancel
                </Button>
                <Button
                  variant="filled"
                  color="#146a3e"
                  onClick={handleUsernameChange}
                  loading={isSavingUsername}
                >
                  Save Changes
                </Button>
              </Group>
            ) : (
              <Group justify="flex-end">
                <Button
                  variant="light"
                  color="#146a3e"
                  onClick={() => {
                    setOriginalUserName(userName); // Save the current username before editing
                    setIsEditingUsername(true);
                  }}
                >
                  Edit
                </Button>
              </Group>
            )}

              <Group justify="space-between">
                <Text c="dimmed" fw={700}>
                  Password:
                </Text>
                <Button
                  variant="light"
                  color="#146a3e"
                  w="185px"
                  onClick={() => setIsChangePasswordModalOpen(true)}
                >
                  Change Password
                </Button>
              </Group>
            </Card>

            {/* Change Password Modal */}
            <Modal
              opened={isChangePasswordModalOpen}
              onClose={() => setIsChangePasswordModalOpen(false)}
              title="Change Password"
            >
              <Stack>
                <TextInput
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <PasswordStrength
                  value={newPassword}
                  onChange={(value) => setNewPassword(value)}
                />
                <TextInput
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Group justify="flex-end">
                  <Button
                    variant="outline"
                    color="red"
                    onClick={() => setIsChangePasswordModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="filled" color="#146a3e" onClick={handleChangePassword}>
                    Save Changes
                  </Button>
                </Group>
              </Stack>
            </Modal>
          </Tabs.Panel>

          <Tabs.Panel value="profile" pt={30}>
            <Stack align="center" justify="center">
              <div style={{ position: "relative", display: "inline-block" }}>
                <Avatar
                  src={
                    profile?.profile_picture
                      ? `https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${profile.profile_picture}`
                      : "https://i.pinimg.com/474x/f1/da/a7/f1daa70c9e3343cebd66ac2342d5be3f.jpg"
                  }
                  alt="Profile picture"
                  size={150}
                  radius={60}
                  style={{ border: "4px solid white" }}
                />
                <ActionIcon
                  size="lg"
                  radius="xl"
                  variant="filled"
                  color="#146a3e"
                  style={{
                    position: "absolute",
                    bottom: 5,
                    right: 5,
                  }}
                  onClick={() => setIsModalOpen(true)}
                >
                  <IconPencil size={16} color="white" />
                </ActionIcon>
              </div>
              <Title order={2} mt={0} mb={0} ta="center">
                {profile?.first_name} {profile?.last_name}
              </Title>
              <Text style={{ margin: 0, padding: 0, lineHeight: 1 }}>
                Batch {profile.batch} - {profile.department} Graduate
              </Text>
            </Stack>

            {/* Upload/Delete Modal */}

            <Modal
              p={15}
              opened={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Update Profile Picture"
            >
              <Stack align="center">
                <Avatar
                  src={
                    profile?.profile_picture
                      ? `https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${profile.profile_picture}`
                      : "https://i.pinimg.com/474x/f1/da/a7/f1daa70c9e3343cebd66ac2342d5be3f.jpg"
                  }
                  alt="Profile picture"
                  size={150}
                  radius={60}
                  style={{ border: "4px solid white" }}
                />

                <FileInput
                  label="Profile Picture"
                  placeholder="Upload profile picture"
                  accept="image/*"
                  onChange={(file) => {
                    if (file) {
                      setProfilePicture(file);
                    }
                  }}
                  mb="md"
                />

                <Divider my="sm" w={"70%"} />

                <Group pb="sm">
                  <Button
                    color="red"
                    variant="light"
                    type="button"
                    onClick={() => setProfilePicture(null)}
                  >
                    Delete Picture
                  </Button>

                  <Button
                    variant="light"
                    color="#146a3e"
                    type="button"
                    onClick={handleProfilePictureSubmit}
                  >
                    Save Changes
                  </Button>
                </Group>
              </Stack>
            </Modal>

            {/* BASIC INFORMATION */}

            <form onSubmit={handleAluProfileSubmit}>
              <Group justify="space-between" mt={50}>
                <Title c="#146a3e" order={5}>
                  BASIC INFORMATION
                </Title>
                {isEditingBasicInfo ? (
                  <Group>
                    <Button
                      variant="outline"
                      color="red"
                      onClick={() => setIsEditingBasicInfo(false)}
                    >
                      Cancel
                    </Button>

                    <Button
                      leftSection={<IconDeviceFloppy size={14} />}
                      variant="filled"
                      color="#146a3e"
                      type="submit"
                    >
                      Save Changes
                    </Button>
                  </Group>
                ) : (
                  <Button
                    leftSection={<IconPencil size={14} />}
                    variant="light"
                    color="#146a3e"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsEditingBasicInfo(true);
                    }}
                  >
                    Edit
                  </Button>
                )}
              </Group>
              <Divider my="sm" />

              <Card
                shadow="sm"
                withBorder
                mt={15}
                bg={isEditingBasicInfo ? "#eeeeee" : "white"}
              >
                <SimpleGrid cols={1} spacing={15}>
                  {["first_name", "middle_name", "last_name"].map((field) => (
                    <Group grow gap={0} key={field}>
                      <Text c="dimmed" fw={700} size="sm">
                        {field.replace("_", " ").toUpperCase()}
                      </Text>
                      <TextInput
                        value={editableProfile[field as keyof typeof profile]}
                        readOnly={!isEditingBasicInfo}
                        onChange={(e) =>
                          handleInputChange(field, e.target.value)
                        }
                      />
                    </Group>
                  ))}
                </SimpleGrid>
              </Card>

              <Card
                shadow="sm"
                withBorder
                mt={30}
                bg={isEditingBasicInfo ? "#eeeeee" : "white"}
              >
                <SimpleGrid cols={1} spacing={15}>
                  {[
                    "gender",
                    "date_of_birth",
                    "civil_status",
                    "nationality",
                  ].map((field) => (
                    <Group grow gap={0} key={field}>
                      <Text c="dimmed" fw={700} size="sm">
                        {field.replace("_", " ").toUpperCase()}
                      </Text>
                      {field === "civil_status" && isEditingBasicInfo ? (
                        <Select
                          placeholder="Select civil status"
                          value={editableProfile.civil_status}
                          onChange={(value) =>
                            handleInputChange("civil_status", value || "")
                          }
                          data={[
                            { value: "Single", label: "Single" },
                            { value: "Married", label: "Married" },
                            { value: "Widowed", label: "Widowed" },
                            { value: "Separated", label: "Separated" },
                            { value: "Divorced", label: "Divorced" },
                          ]}
                          required
                          clearable
                        />
                      ) : field === "gender" && isEditingBasicInfo ? (
                        <Select
                          placeholder="Select gender"
                          value={editableProfile.gender}
                          onChange={(value) =>
                            handleInputChange("gender", value || "")
                          }
                          data={[
                            { value: "Male", label: "Male" },
                            { value: "Female", label: "Female" },
                          ]}
                          required
                          clearable
                        />
                      ) : field === "date_of_birth" && isEditingBasicInfo ? (
                        <DateSelector
                          date={editableProfile.date_of_birth}
                          onDateChange={(newDate) =>
                            handleInputChange("date_of_birth", newDate)
                          }
                        />
                      ) : field === "date_of_birth" ? (
                        <TextInput
                          value={formatDateOfBirth(
                            editableProfile.date_of_birth
                          )}
                          readOnly
                        />
                      ) : (
                        <TextInput
                          value={editableProfile[field as keyof typeof profile]}
                          readOnly={!isEditingBasicInfo}
                          onChange={(e) =>
                            handleInputChange(field, e.target.value)
                          }
                        />
                      )}
                    </Group>
                  ))}
                </SimpleGrid>
              </Card>

              {/* CONTACT INFORMATION */}

              <Group justify="space-between" mt={50}>
                <Title c="#146a3e" order={5}>
                  CONTACT INFORMATION
                </Title>
                {isEditingContactInfo ? (
                  <Group>
                    <Button
                      variant="outline"
                      color="red"
                      onClick={() => setIsEditingContactInfo(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      leftSection={<IconDeviceFloppy size={14} />}
                      variant="filled"
                      color="#146a3e"
                      type="submit"
                      disabled={isEmailChanged && !isVerified} // Disable button if not verified
                    >
                      Save Changes
                    </Button>
                  </Group>
                ) : (
                  <Button
                    leftSection={<IconPencil size={14} />}
                    variant="light"
                    color="#146a3e"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault(); // Prevent default form submission
                      setIsEditingContactInfo(true);
                    }}
                  >
                    Edit
                  </Button>
                )}
              </Group>
              <Divider my="sm" />

              <Card
                shadow="sm"
                withBorder
                mt={15}
                bg={isEditingContactInfo ? "#eeeeee" : "white"}
              >
                <SimpleGrid cols={1} spacing={15}>
                  <Group grow>
                    <Text c="dimmed" fw={700} size="sm">
                      EMAIL ADDRESS
                    </Text>
                    <TextInput
                      value={editableProfile.email_address}
                      readOnly={!isEditingContactInfo}
                      onChange={handleEmailChange}
                    />
                  </Group>
                  {isEditingContactInfo && isEmailChanged && (
                    <>
                      <Group>
                        <TextInput
                          label="Confirmation Code"
                          placeholder="Enter confirmation code"
                          value={userEnteredCode}
                          onChange={handleCodeChange}
                          required
                        />
                        <Button onClick={sendConfirmationCode}>
                          Send Confirmation Code
                        </Button>
                      </Group>

                      {emailStatus && <Text color="dimmed">{emailStatus}</Text>}
                      {userEnteredCode && (
                        <Text color={isVerified ? "green" : "red"}>
                          {isVerified ? "Code Verified" : "Code Not Verified"}
                        </Text>
                      )}
                    </>
                  )}
                  <Group grow>
                    <Text c="dimmed" fw={700} size="sm">
                      MOBILE NUMBER
                    </Text>
                    <TextInput
                      value={editableProfile.mobile_number}
                      readOnly={!isEditingContactInfo}
                      onChange={(e) =>
                        handleInputChange("mobile_number", e.target.value)
                      }
                    />
                  </Group>
                  <Group grow>
                    <Text c="dimmed" fw={700} size="sm">
                      TELEPHONE NUMBER
                    </Text>
                    <TextInput
                      value={editableProfile.telephone_number}
                      readOnly={!isEditingContactInfo}
                      onChange={(e) =>
                        handleInputChange("telephone_number", e.target.value)
                      }
                    />
                  </Group>
                  {/* --- Add Facebook Link --- */}
                  <Group grow>
                    <Text c="dimmed" fw={700} size="sm">
                      FACEBOOK LINK
                    </Text>
                    <TextInput
                      placeholder="https://facebook.com/yourprofile"
                      value={editableProfile.fb_link || ""}
                      readOnly={!isEditingContactInfo}
                      onChange={(e) =>
                        handleInputChange("fb_link", e.target.value)
                      }
                    />
                  </Group>
                  {/* --- Add LinkedIn Link --- */}
                  <Group grow>
                    <Text c="dimmed" fw={700} size="sm">
                      LINKEDIN LINK
                    </Text>
                    <TextInput
                      placeholder="https://linkedin.com/in/yourprofile"
                      value={editableProfile.linkedin_link || ""}
                      readOnly={!isEditingContactInfo}
                      onChange={(e) =>
                        handleInputChange("linkedin_link", e.target.value)
                      }
                    />
                  </Group>
                </SimpleGrid>
              </Card>

              {/* CURRENT ADDRESS */}

              <Group justify="space-between" mt={50}>
                <Title c="#146a3e" order={5}>
                  CURRENT ADDRESS
                </Title>
                {isEditingAddress ? (
                  <Group>
                    <Button
                      variant="outline"
                      color="red"
                      onClick={() => setIsEditingAddress(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      leftSection={<IconDeviceFloppy size={14} />}
                      variant="filled"
                      color="#146a3e"
                      type="submit"
                    >
                      Save Changes
                    </Button>
                  </Group>
                ) : (
                  <Button
                    leftSection={<IconPencil size={14} />}
                    variant="light"
                    color="#146a3e"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault(); // Prevent default form submission
                      setIsEditingAddress(true);
                    }}
                  >
                    Change Address
                  </Button>
                )}
              </Group>
              <Divider my="sm" />

              <Card
                shadow="sm"
                withBorder
                mt={15}
                bg={isEditingAddress ? "#eeeeee" : "white"}
              >
                {isEditingAddress ? (
                  <>
                    <CurrentAddress
                      country={country}
                      setCountry={setCountry}
                      region={region}
                      setRegion={setRegion}
                      province={province}
                      setProvince={setProvince}
                      city={city}
                      setCity={setCity}
                      clearErrorMessage={() => {}}
                    />
                  </>
                ) : (
                  <>
                    <SimpleGrid cols={1} spacing={15}>
                      {["country", "region", "city", "province"].map(
                        (field) => (
                          <Group grow key={field}>
                            <Text c="dimmed" fw={700} size="sm">
                              {field.replace("_", " ").toUpperCase()}
                            </Text>
                            <TextInput
                              value={profile[field as keyof typeof profile]}
                              readOnly
                            />
                          </Group>
                        )
                      )}
                    </SimpleGrid>
                  </>
                )}
              </Card>
            </form>
          </Tabs.Panel>

          {/* EDUCATION SECTION */}

          <Tabs.Panel value="educ">
            <Group justify="space-between" mt={50}>
              <Title c="#146a3e" order={5}>
                EDUCATION HISTORY
              </Title>

              <Button
                leftSection={<IconPlus size={14} />}
                variant="light"
                color="#146a3e"
                onClick={() => setIsAddingEduc(true)}
              >
                Add
              </Button>
            </Group>

            <Divider my="sm" />

            {isAddingEduc && (
              <Card shadow="sm" withBorder p={30} mt={15}>
                <Stack gap="md">
                  <Group grow>
                    <CustomLabel label="Degree" />
                    <TextInput
                      value={newEduc.degree}
                      onChange={(e) =>
                        setNewEduc({ ...newEduc, degree: e.target.value })
                      }
                    />
                  </Group>
                  <Group grow>
                    <CustomLabel label="School" />
                    <TextInput
                      value={newEduc.school}
                      onChange={(e) =>
                        setNewEduc({ ...newEduc, school: e.target.value })
                      }
                    />
                  </Group>
                  <Group grow>
                    <CustomLabel label="Start Date" />
                    <DateSelector
                      date={newEduc.start_date}
                      onDateChange={(newDate) =>
                        setNewEduc({ ...newEduc, start_date: newDate })
                      }
                    />
                  </Group>
                  <Group grow>
                    <CustomLabel label="End Date" />
                    <DateSelector
                      date={newEduc.end_date}
                      onDateChange={(newDate) =>
                        setNewEduc({ ...newEduc, end_date: newDate })
                      }
                    />
                  </Group>
                  <Group mt={30} justify="flex-end">
                    <Button
                      variant="outline"
                      color="red"
                      onClick={() => setIsAddingEduc(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      leftSection={<IconDeviceFloppy size={14} />}
                      variant="filled"
                      color="#146a3e"
                      onClick={async () => {
                        try {
                          const response = await fetch("/api/add_educ", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              userID,
                              degree: newEduc.degree,
                              school: newEduc.school,
                              start_date: newEduc.start_date,
                              end_date: newEduc.end_date,
                            }),
                          });

                          if (response.ok) {
                            const data = await response.json();
                            console.log("Education history saved:", data);

                            // Update the education state with the new education entry
                            setEduc([...educ, newEduc]);

                            // Reset the form
                            setNewEduc({
                              degree: "",
                              school: "",
                              start_date: "",
                              end_date: "",
                            });
                            setIsAddingEduc(false);
                          } else {
                            const errorData = await response.json();
                            console.error(
                              "Error saving education history:",
                              errorData.error
                            );
                          }
                        } catch (error) {
                          console.error(
                            "Error saving education history:",
                            error
                          );
                        }
                      }}
                    >
                      Save
                    </Button>
                  </Group>
                </Stack>
              </Card>
            )}

            {educ.length === 0 ? (
              <PlaceholderNoData
                message="No educational background found"
                submessage="Please add your educational background to showcase your academic journey."
              />
            ) : (
              educ
                .sort(
                  (a, b) =>
                    new Date(b.end_date).getTime() -
                    new Date(a.end_date).getTime()
                )
                .map((eduItem, index) => (
                  <Card shadow="sm" withBorder p={30} key={index} mt={15}>
                    {editingEducIndex === index ? (
                      <Stack gap="md">
                        <Group grow>
                          <CustomLabel label="Degree" />
                          <TextInput
                            value={tempEduc.degree}
                            onChange={(e) =>
                              setTempEduc({
                                ...tempEduc,
                                degree: e.target.value,
                              })
                            }
                          />
                        </Group>
                        <Group grow>
                          <CustomLabel label="School" />
                          <TextInput
                            value={tempEduc.school}
                            onChange={(e) =>
                              setTempEduc({
                                ...tempEduc,
                                school: e.target.value,
                              })
                            }
                          />
                        </Group>
                        <Group grow>
                          <CustomLabel label="Start Date" />
                          <DateSelector
                            date={tempEduc.start_date}
                            onDateChange={(newDate) =>
                              setTempEduc({ ...tempEduc, start_date: newDate })
                            }
                          />
                        </Group>
                        <Group grow>
                          <CustomLabel label="End Date" />
                          <DateSelector
                            date={tempEduc.end_date}
                            onDateChange={(newDate) =>
                              setTempEduc({ ...tempEduc, end_date: newDate })
                            }
                          />
                        </Group>
                        <Group mt={30} justify="flex-end">
                          <Button
                            variant="outline"
                            color="red"
                            onClick={() => setEditingEducIndex(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            leftSection={<IconDeviceFloppy size={14} />}
                            variant="filled"
                            color="#146a3e"
                            onClick={() => {
                              const newEduc = [...educ];
                              newEduc[editingEducIndex] = tempEduc;
                              setEduc(newEduc);
                              setEditingEducIndex(null);
                            }}
                          >
                            Save Changes
                          </Button>
                        </Group>
                      </Stack>
                    ) : (
                      <Timeline
                        active={0}
                        color="#48a774"
                        mt="10"
                        lineWidth={2}
                        bulletSize={18}
                      >
                        <Group>
                          <Timeline.Item
                            title={eduItem.degree}
                            style={{ fontSize: "1.15rem" }}
                          >
                            <Text c="dimmed" size="md" mt="md">
                              <IconBuildings size={12} /> {eduItem.school}
                            </Text>
                            <Text c="dimmed" size="md">
                              <IconCalendarEvent size={12} /> {eduItem.end_date}{" "}
                              - {eduItem.start_date}
                            </Text>
                          </Timeline.Item>

                          <ActionIcon
                            size="lg"
                            radius="xl"
                            variant="filled"
                            color="red"
                            style={{ position: "absolute", top: 20, right: 60 }}
                            onClick={() => {
                              if (index >= 0 && index < educ.length) {
                                const newEduc = [...educ];
                                newEduc.splice(index, 1);
                                setEduc(newEduc);
                              }
                            }}
                          >
                            <IconTrash size={16} color="white" />
                          </ActionIcon>

                          <ActionIcon
                            size="lg"
                            radius="xl"
                            variant="filled"
                            color="#146a3e"
                            style={{ position: "absolute", top: 20, right: 20 }}
                            onClick={() => {
                              if (index >= 0 && index < educ.length) {
                                setTempEduc(educ[index]);
                                setEditingEducIndex(index);
                              }
                            }}
                          >
                            <IconPencil size={16} color="white" />
                          </ActionIcon>
                        </Group>
                      </Timeline>
                    )}
                  </Card>
                ))
            )}
          </Tabs.Panel>

          {/* CAREER INFORMATION */}

          <Tabs.Panel value="job">
            <form onSubmit={handleAluProfileSubmit}>
              <Group justify="space-between" mt={30}>
                <Title c="#146a3e" order={5}>
                  CAREER INFORMATION
                </Title>

                {isEditingJobInfo ? (
                  <Group>
                    <Button
                      variant="outline"
                      color="red"
                      onClick={() => setIsEditingJobInfo(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      leftSection={<IconDeviceFloppy size={14} />}
                      variant="filled"
                      color="#146a3e"
                      type="submit"
                    >
                      Save Changes
                    </Button>
                  </Group>
                ) : (
                  <Button
                    leftSection={<IconPencil size={14} />}
                    variant="light"
                    color="#146a3e"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault(); // Prevent default form submission
                      setIsEditingJobInfo(true);
                    }}
                  >
                    Edit
                  </Button>
                )}
              </Group>
              <Divider my="sm" />

              <Card
                shadow="sm"
                withBorder
                mt={15}
                bg={isEditingJobInfo ? "#eeeeee" : "white"}
              >
                <SimpleGrid cols={1} spacing={15}>
                  {["job_profession", "job_status", "resume"].map((field) => (
                    <Group grow gap={0} key={field}>
                      <Text c="dimmed" fw={700} size="sm">
                        {field.replace("_", " ").toUpperCase()}
                      </Text>
                      {field === "job_status" && isEditingJobInfo ? (
                        <Select
                          placeholder="Select employment status"
                          value={editableProfile.job_status}
                          onChange={(value) =>
                            handleInputChange(field, value ?? "")
                          }
                          data={[
                            { value: "Employed", label: "Employed" },
                            {
                              value: "Actively Seeking",
                              label: "Actively Seeking",
                            },
                            { value: "Not Looking", label: "Not Looking" },
                          ]}
                          required
                          clearable
                        />
                      ) : (
                        <TextInput
                          value={editableProfile[field as keyof typeof profile]}
                          readOnly={!isEditingJobInfo}
                          onChange={(e) =>
                            handleInputChange(field, e.target.value)
                          }
                          placeholder={
                            field === "resume" && !editableProfile.resume
                              ? "No uploaded resume"
                              : ""
                          }
                        />
                      )}
                    </Group>
                  ))}

                  {isEditingJobInfo && (
                    <>
                      <Divider my="sm" />
                      <Group justify="space-between">
                        <Title c="#146a3e" order={5} ta="right">
                          Upload Resume
                        </Title>
                      </Group>
                      <BaseDemo
                        setResume={(file) => {
                          setResumeFile(file);
                        }}
                      />
                      {resumeFile && (
                        <Text mt="sm" c="dimmed">
                          {resumeFile.name}
                        </Text>
                      )}
                    </>
                  )}
                </SimpleGrid>
              </Card>

              <Group justify="space-between" mt={50}>
                <Title c="#146a3e" order={5}>
                  PROFESSIONAL SUMMARY
                </Title>

                {isEditingProfSummary ? (
                  <Group>
                    <Button
                      variant="outline"
                      color="red"
                      onClick={() => setIsEditingProfSummary(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      leftSection={<IconDeviceFloppy size={14} />}
                      variant="filled"
                      color="#146a3e"
                      type="submit"
                    >
                      Save Changes
                    </Button>
                  </Group>
                ) : (
                  <Button
                    leftSection={<IconPencil size={14} />}
                    variant="light"
                    color="#146a3e"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault(); // Prevent default form submission
                      setIsEditingProfSummary(true);
                    }}
                  >
                    Edit
                  </Button>
                )}
              </Group>
              <Divider my="sm" />

              {isEditingProfSummary ? (
                <RichTextEditorComponent
                  content={editableProfile.prof_summary}
                  setContent={(value) =>
                    handleInputChange("prof_summary", value)
                  }
                />
              ) : sanitizedProfSummary ? (
                <div
                  dangerouslySetInnerHTML={{ __html: sanitizedProfSummary }}
                  style={{
                    border: "1px solid #ced4da",
                    borderRadius: "4px",
                    padding: "10px",
                    minHeight: "100px",
                    marginBottom: "30px",
                    marginTop: "15px",
                  }}
                />
              ) : (
                <>
                  <Card
                    withBorder
                    style={{
                      padding: "10px",
                      margin: "10px 0",
                      textAlign: "center",
                    }}
                  >
                    <PlaceholderNoData
                      message="No professional summary provided."
                      submessage="Please add your professional summary to showcase your career journey."
                    />
                  </Card>
                </>
              )}
            </form>

            <Group justify="space-between" mt={60}>
              <Title c="#146a3e" order={5}>
                JOB EXPERIENCE
              </Title>

              <Button
                leftSection={<IconPlus size={14} />}
                variant="light"
                color="#146a3e"
                onClick={() => setIsAddingJob(true)}
              >
                Add
              </Button>
            </Group>

            <Divider my="sm" />

            {isAddingJob && (
              <Card shadow="sm" withBorder p={30} mt={15} bg="#eeeeee">
                <Stack gap="md">
                  <Group grow>
                    <CustomLabel label="Job Title" />
                    <TextInput
                      value={newJob.jobtitle}
                      onChange={(e) =>
                        setNewJob({ ...newJob, jobtitle: e.target.value })
                      }
                    />
                  </Group>
                  <Group grow>
                    <CustomLabel label="Company Name" />
                    <TextInput
                      value={newJob.companyname}
                      onChange={(e) =>
                        setNewJob({ ...newJob, companyname: e.target.value })
                      }
                    />
                  </Group>
                  <Group grow>
                    <CustomLabel label="Start Date" />
                    <DateSelector
                      date={newJob.start_date}
                      onDateChange={(newDate) =>
                        setNewJob({ ...newJob, start_date: newDate })
                      }
                    />
                  </Group>
                  <Group grow>
                    <CustomLabel label="End Date" />
                    <DateSelector
                      date={newJob.end_date}
                      onDateChange={(newDate) =>
                        setNewJob({ ...newJob, end_date: newDate })
                      }
                    />
                  </Group>
                  <Group mt={30} justify="flex-end">
                    <Button
                      variant="outline"
                      color="red"
                      onClick={() => setIsAddingJob(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      leftSection={<IconDeviceFloppy size={14} />}
                      variant="filled"
                      color="#146a3e"
                      onClick={async () => {
                        try {
                          const response = await fetch(
                            "/api/add_job_experience",
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                userID,
                                jobtitle: newJob.jobtitle,
                                companyname: newJob.companyname,
                                start_date: newJob.start_date,
                                end_date: newJob.end_date,
                              }),
                            }
                          );

                          if (response.ok) {
                            const data = await response.json();
                            console.log("Job experience saved:", data);

                            // Update the job state with the new job experience
                            setJob([...job, newJob]);

                            // Reset the form
                            setNewJob({
                              jobtitle: "",
                              companyname: "",
                              start_date: "",
                              end_date: "",
                            });
                            setIsAddingJob(false);
                          } else {
                            const errorData = await response.json();
                            console.error(
                              "Error saving job experience:",
                              errorData.error
                            );
                          }
                        } catch (error) {
                          console.error("Error saving job experience:", error);
                        }
                      }}
                    >
                      Save
                    </Button>
                  </Group>
                </Stack>
              </Card>
            )}

            {job.length === 0 ? (
              <PlaceholderNoData
                message="No job experience found"
                submessage="Please add your job experience to showcase your career journey."
              />
            ) : (
              job
                .sort(
                  (a, b) =>
                    new Date(b.end_date).getTime() -
                    new Date(a.end_date).getTime()
                )
                .map((jobItem, index) => (
                  <Card shadow="sm" withBorder p={30} key={index} mt={15}>
                    {editingJobIndex === index ? (
                      <Stack gap="md">
                        <Group grow>
                          <CustomLabel label="Job Title" />
                          <TextInput
                            value={jobItem.jobtitle}
                            onChange={(e) => {
                              const newJob = [...job];
                              newJob[index].jobtitle = e.target.value;
                              setJob(newJob);
                            }}
                          />
                        </Group>
                        <Group grow>
                          <CustomLabel label="Company Name" />
                          <TextInput
                            value={jobItem.companyname}
                            onChange={(e) => {
                              const newJob = [...job];
                              newJob[index].companyname = e.target.value;
                              setJob(newJob);
                            }}
                          />
                        </Group>
                        <Group grow>
                          <CustomLabel label="Start Date" />
                          <DateSelector
                            date={jobItem.start_date}
                            onDateChange={(newDate) => {
                              const newJob = [...job];
                              newJob[index].start_date = newDate;
                              setJob(newJob);
                            }}
                          />
                        </Group>
                        <Group grow>
                          <CustomLabel label="End Date" />
                          <DateSelector
                            date={jobItem.end_date}
                            onDateChange={(newDate) => {
                              const newJob = [...job];
                              newJob[index].end_date = newDate;
                              setJob(newJob);
                            }}
                          />
                        </Group>
                        <Group mt={30} justify="flex-end">
                          <Button
                            variant="outline"
                            color="red"
                            onClick={() => setEditingJobIndex(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            leftSection={<IconDeviceFloppy size={14} />}
                            variant="filled"
                            color="#146a3e"
                            onClick={() => setEditingJobIndex(null)}
                          >
                            Save Changes
                          </Button>
                        </Group>
                      </Stack>
                    ) : (
                      <Timeline
                        active={0}
                        color="#48a774"
                        mt="10"
                        lineWidth={2}
                        bulletSize={18}
                      >
                        <Group>
                          <Timeline.Item
                            title={jobItem.jobtitle}
                            style={{ fontSize: "1.15rem" }}
                          >
                            <Text c="dimmed" size="md" mt="md">
                              <IconBuildings size={12} /> {jobItem.companyname}
                            </Text>
                            <Text c="dimmed" size="md">
                              <IconCalendarEvent size={12} /> {jobItem.end_date}{" "}
                              - {jobItem.start_date}
                            </Text>
                          </Timeline.Item>

                          <ActionIcon
                            size="lg"
                            radius="xl"
                            variant="filled"
                            color="red"
                            style={{ position: "absolute", top: 20, right: 60 }}
                            onClick={() => {
                              if (index >= 0 && index < job.length) {
                                const newJob = [...job];
                                newJob.splice(index, 1);
                                setJob(newJob);
                              }
                            }}
                          >
                            <IconTrash size={16} color="white" />
                          </ActionIcon>

                          <ActionIcon
                            size="lg"
                            radius="xl"
                            variant="filled"
                            color="#146a3e"
                            style={{ position: "absolute", top: 20, right: 20 }}
                            onClick={() => {
                              if (index >= 0 && index < job.length) {
                                setEditingJobIndex(index);
                              }
                            }}
                          >
                            <IconPencil size={16} color="white" />
                          </ActionIcon>
                        </Group>
                      </Timeline>
                    )}
                  </Card>
                ))
            )}
          </Tabs.Panel>
        </Tabs>
      </Container>
    </>
  );
};

export default EditProfile;

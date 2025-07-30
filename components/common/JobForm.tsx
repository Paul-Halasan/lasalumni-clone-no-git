// components/forms/JobForm.tsx
import React, { useState, useEffect } from "react";
import {
  TextInput,
  Select,
  Button,
  Container,
  Group,
  NumberInput,
  Box,
  Grid,
  Stack,
  Title,
  Paper,
  Text,
  Divider,
  LoadingOverlay,
  Tooltip,
  Badge
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconBriefcase2,
  IconMapPin,
  IconCalendarDue,
  IconBuilding,
  IconMoneybag,
  IconFileText,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { DateInput } from "@mantine/dates";
import axios from "axios";
import RichTextEditorComponent from "./richtextbox";
import { getServerTime } from "../../utils/getServerTime";
//import { Tooltip } from "recharts";

// Define user roles
export type UserRole = "alumni" | "partner" | "admin";

// Define props for the JobForm component
interface JobFormProps {
  userRole: UserRole;
  title?: string;
  description?: string;
  infoMessage?: string;
  submitButtonText?: string;
  submitEndpoint?: string;
  notificationMessage?: (jobTitle: string) => string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  additionalFields?: React.ReactNode;
  initialValues?: Record<string, any>;
  redirectAfterSubmit?: string;
}

const JobForm: React.FC<JobFormProps> = ({
  userRole,
  title,
  description,
  infoMessage,
  submitButtonText,
  submitEndpoint = "/api/create_job",
  notificationMessage,
  onSuccess,
  onError,
  additionalFields,
  initialValues = {},
  redirectAfterSubmit,
}) => {
  // Default content based on user role
  const getRoleSpecificContent = () => {
    switch (userRole) {
      case "admin":
        return {
          title: "Admin Job Posting Form",
          description:
            "Create and publish job opportunities directly to the platform.",
          infoMessage:
            "As an admin, jobs you submit will be published immediately without review.",
          submitButtonText: "Publish Job Opportunity",
          notificationMessage: (jobTitle: string) =>
            `Job opportunity: "${jobTitle}" has been published to the platform.`,
        };

      case "partner":
        return {
          title: "Partner Job Opportunity Form",
          description: "Share Job Opportunities with the community.",
          infoMessage:
            "Please be advised that all Job Opportunities will be reviewed by an administrator prior to posting. Approval may take two to three business days.",
          submitButtonText: "Submit Job Opportunity",
          notificationMessage: (jobTitle: string) =>
            `Job opportunity: "${jobTitle}" has been submitted. It is now being reviewed. You will be notified once it is accepted.`,
        };
      
      
      case "alumni":
      default:
        return {
          title: "Alumni Job Opportunity Form",
          description: "Share Job Opportunities with the alumni community.",
          infoMessage:
            "Please be advised that all Job Opportunities will be reviewed by an administrator prior to posting. Approval may take two to three business days.",
          submitButtonText: "Submit Job Opportunity",
          notificationMessage: (jobTitle: string) =>
            `Job opportunity: "${jobTitle}" has been submitted. It is now being reviewed. You will be notified once it is accepted.`,
        };
    }
  };

  // Get role-specific content
  const roleContent = getRoleSpecificContent();

  // Form states
  const [companyName, setCompanyName] = useState(
    initialValues.companyName || ""
  );
  const [location, setLocation] = useState(initialValues.location || "");

  const [jobTitle, setJobTitle] = useState(initialValues.jobTitle || "");
  const [jobDescription, setJobDescription] = useState(
    initialValues.jobDescription || ""
  );

  const [deadline, setDeadline] = useState<Date | null>(
    initialValues.deadline ? new Date(initialValues.deadline) : null
  );
  const [salary, setSalary] = useState<number | undefined>(
    initialValues.salary
  );
  const [requirements, setRequirements] = useState(
    initialValues.requirements || ""
  );
  const [industry, setIndustry] = useState(initialValues.industry || "");
  const [selectedCompany, setSelectedCompany] = useState<{ industry: string }>({
    industry: initialValues.industry || "",
  });
  const [jobStatus, setJobStatus] = useState(initialValues.jobStatus || "");
  const [additionalInfo, setAdditionalInfo] = useState(
    initialValues.additionalInfo || ""
  );
  const [userID, setUserID] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverDate, setServerDate] = useState<Date>(new Date());

  const currentDate = new Date();

  // Function to fetch user ID from the API
  const fetchUserID = async () => {
    try {
      const response = await axios.get("/api/get_current_userid");
      if (response.status === 200) {
        setUserID(response.data.userID);
      } else {
        showErrorNotification("Failed to fetch user ID");
      }
    } catch (error) {
      console.error("Error fetching user ID:", error);
      showErrorNotification("Error fetching user ID");
    }
  };

  useEffect(() => {
    getServerTime("datetime")
      .then((datetime) => setServerDate(new Date(datetime)))
      .catch(() => setServerDate(new Date()));
    fetchUserID();
  }, []);

  // Function to show success notification
  const showSuccessNotification = (message: string) => {
    notifications.show({
      title: "Success",
      message,
      color: "green",
      icon: <IconCheck />,
      autoClose: 5000,
    });
  };

  // Function to show error notification
  const showErrorNotification = (message: string) => {
    notifications.show({
      title: "Error",
      message,
      color: "red",
      icon: <IconX />,
      autoClose: 5000,
    });
  };

  // Form submission
  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Check for all required fields before sending the request
    if (
      !companyName ||
      !jobTitle ||
      !jobDescription ||
      !location ||
      !deadline ||
      !salary ||
      !requirements ||
      !industry ||
      !jobStatus
    ) {
      showErrorNotification("All fields are required hehe.");
      return;
    }

    // Set loading state to true
    setIsSubmitting(true);

    try {
      const jobData = {
        companyName,
        jobTitle,
        jobDescription,
        location,
        deadline: deadline ? deadline.toISOString().split("T")[0] : null,
        salary,
        requirements,
        industry,
        jobStatus,
        additionalInfo,
        userID,
        userRole, // Include user role for backend processing
      };

      const response = await axios.post(submitEndpoint, jobData);

      if (response.status === 200) {
        showSuccessNotification("Job submitted successfully");

        // Determine notification message
        const message = notificationMessage
          ? notificationMessage(jobTitle)
          : roleContent.notificationMessage(jobTitle);

        // Insert notification into the database
        try {
          await fetch("/api/insert_notif", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message,
              directTo: "jobs",
            }),
          });
        } catch (notifError) {
          console.error("Error creating notification:", notifError);
        }

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(response.data);
        }

        // Clear fields
        setCompanyName("");
        setJobTitle("");
        setJobDescription("");
        setLocation("");
        setDeadline(null);
        setSalary(undefined);
        setRequirements("");
        setIndustry("");
        setSelectedCompany({ industry: "" });
        setJobStatus("");
        setAdditionalInfo("");

        // Redirect if specified
        if (redirectAfterSubmit) {
          window.location.href = redirectAfterSubmit;
        }
      } else {
        showErrorNotification(response.data.error || "Failed to add job");
        if (onError) {
          onError(response.data);
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error adding job:",
          error.response?.data || error.message
        );
        showErrorNotification(
          error.response?.data?.error ||
            "An error occurred while adding the job"
        );
      } else {
        console.error("Error adding job:", error);
        showErrorNotification("An error occurred while adding the job");
      }

      if (onError) {
        onError(error);
      }
    } finally {
      // Set loading state to false regardless of outcome
      setIsSubmitting(false);
    }
  };

  // Industry options for the dropdown
  const industryOptions = [
    { value: "Technology", label: "Technology" },
    { value: "Finance", label: "Finance" },
    { value: "Healthcare", label: "Healthcare" },
    { value: "Education", label: "Education" },
    { value: "Manufacturing", label: "Manufacturing" },
    { value: "Retail", label: "Retail" },
    { value: "Sports", label: "Sports" },
    { value: "Hospitality & Tourism", label: "Hospitality & Tourism" },
    { value: "Media & Entertainment", label: "Media & Entertainment" },
    { value: "Agriculture & Resources", label: "Agriculture & Resources" },
    {
      value: "Construction & Real Estate",
      label: "Construction & Real Estate",
    },
    { value: "Energy & Utilities", label: "Energy & Utilities" },
    {
      value: "Transportation & Logistics",
      label: "Transportation & Logistics",
    },
    {
      value: "Government & Public Service",
      label: "Government & Public Service",
    },
    { value: "Professional Services", label: "Professional Services" },
    {
      value: "Nonprofit & Social Services",
      label: "Nonprofit & Social Services",
    },
    { value: "Other", label: "Other" },
  ];

  return (
    <Container
      size="lg"
      p="xl"
      pt={10}
      bg={"white"}
      style={{
        borderRadius: 8,
        position: "relative",
      }}
    >
      {/* Loading overlay that appears during form submission */}
      <LoadingOverlay
        visible={isSubmitting}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
        loaderProps={{ color: "#146a3e", type: "bars" }}
      />
      <Box bg="#f1f8e9" p="md" my="lg" style={{ borderRadius: 8 }}>
        <Stack gap={4}>
          <Title order={3} c="#146a3e">
            {title || roleContent.title}
          </Title>
          <Text>{description || roleContent.description}</Text>

          <Paper p="md" mt="md">
            <Text>{infoMessage || roleContent.infoMessage}</Text>
          </Paper>
        </Stack>
      </Box>
      <form onSubmit={handleFormSubmit}>
        <Group align="center" gap="sm" mt="xl">
          <IconBriefcase2 size={20} stroke={2.5} color="#146a3e" />
          <Text size="md" fw={700} c="#146a3e">
            Job Details
          </Text>
        </Group>
        <Divider my="md" />

        <TextInput
          label="Company Name"
          placeholder="Enter company name"
          value={companyName}
          onChange={(event) => setCompanyName(event.currentTarget.value)}
          required
          mt="md"
          leftSection={<IconBuilding size={20} stroke={1.5} color="#cccccc" />}
          readOnly={userRole === "partner"}
        />

        <TextInput
          label="Job Title"
          placeholder="Enter job title"
          value={jobTitle}
          onChange={(event) => setJobTitle(event.currentTarget.value)}
          required
          mt="md"
        />

        <Grid>
          <Grid.Col span={{ lg: 6, md: 12, sm: 12 }}>
            <TextInput
              label="Location"
              placeholder="Enter job location"
              value={location}
              onChange={(event) => setLocation(event.currentTarget.value)}
              required
              mt="md"
              leftSection={
                <IconMapPin size={20} stroke={1.5} color="#cccccc" />
              }
              readOnly={userRole === "partner"}
            />
          </Grid.Col>
          <Grid.Col span={{ lg: 6, md: 12, sm: 12 }}>
            <Select
              label="Industry"
              placeholder="Select industry"
              value={selectedCompany.industry}
              onChange={(value) => {
                setSelectedCompany({
                  ...selectedCompany,
                  industry: value || "",
                });
                setIndustry(value || "");
              }}
              data={industryOptions}
              radius="md"
              searchable
              clearable
              required
              mt="md"
              leftSection={
                <IconBuilding size={20} stroke={1.5} color="#cccccc" />
              }
              readOnly={userRole === "partner"}
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={{ lg: 6, md: 12, sm: 12 }}>
            <DateInput
              label="Application Deadline"
              placeholder="Select deadline"
              value={deadline}
              onChange={setDeadline}
              valueFormat="MMMM D, YYYY"
              required
              minDate={serverDate}
              mt="md"
              leftSection={
                <IconCalendarDue size={20} stroke={1.5} color="#cccccc" />
              }
            />
          </Grid.Col>
          <Grid.Col span={{ lg: 6, md: 12, sm: 12 }}>
            <Tooltip label="Salary range must be in Philippine Pesos (₱) and cannot be changed" withArrow>
              <NumberInput
                label="Salary"
                placeholder="Enter salary"
                value={salary}
                onChange={(value) =>
                  setSalary(typeof value === "number" ? value : parseFloat(value))
                }
                required
                mt="md"
                leftSection={
                  <IconMoneybag size={20} stroke={1.5} color="#cccccc" />
                }
              />
            </Tooltip>
            <Badge color="green" size="md" variant="light">
              PHP ₱
            </Badge>
          </Grid.Col>
        </Grid>

        <Select
          label="Job Type"
          placeholder="Select Job Type"
          value={jobStatus}
          onChange={(value) => setJobStatus(value || "")}
          data={[
            { value: "full-time", label: "Full Time" },
            { value: "part-time", label: "Part Time" },
          ]}
          required
          mt="md"
          leftSection={
            <IconBriefcase2 size={20} stroke={1.5} color="#cccccc" />
          }
        />

        {/* Render additional fields if provided */}
        {additionalFields}

        <Group align="center" gap="sm" mt={60}>
          <IconFileText size={20} stroke={2.5} color="#146a3e" />
          <Text size="md" fw={700} c="#146a3e">
            Detailed Information
          </Text>
        </Group>
        <Divider my="md" />

        <Text fw="700" size="sm" pb="xs">
          Job Description <span style={{ color: "red" }}>*</span>
        </Text>
        <RichTextEditorComponent
          content={jobDescription}
          setContent={setJobDescription}
        />

        <Text fw="700" size="sm" pb="xs" mt="xl">
          Requirements <span style={{ color: "red" }}>*</span>
        </Text>
        <RichTextEditorComponent
          content={requirements}
          setContent={setRequirements}
        />

        <Text fw="700" size="sm" pb="xs" mt="xl">
          Additional Information
        </Text>
        <RichTextEditorComponent
          content={additionalInfo}
          setContent={setAdditionalInfo}
        />

        <Group justify="flex-end" mt="xl">
          <Button
            type="submit"
            color="#146a3e"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Submitting..."
              : submitButtonText || roleContent.submitButtonText}
          </Button>
        </Group>
      </form>
    </Container>
  );
};

export default JobForm;

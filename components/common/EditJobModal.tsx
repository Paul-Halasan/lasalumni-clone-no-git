import React, { useState, useEffect } from "react";
import {
  Modal,
  TextInput,
  Select,
  Button,
  Container,
  Group,
  NumberInput,
  Grid,
  Text,
  Divider,
  LoadingOverlay,
  Alert,
  Tooltip,
  Badge
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconX,
  IconBriefcase2,
  IconMapPin,
  IconBuilding,
  IconCalendarDue,
  IconMoneybag,
  IconFileText,
  IconAlertCircle,
} from "@tabler/icons-react";
import RichTextEditorComponent from "./richtextbox";
import axios from "axios";

// Define the Job interface
interface Job {
  job_id: number;
  job_title: string;
  company_name: string;
  job_description: string;
  location: string;
  deadline: string;
  salary?: string;
  requirements: string;
  industry: string;
  job_status: string;
  additional_info?: string;
  isApproved: "approved" | "pending" | "denied";
  isAccepting: boolean;
  applicant_count: number;
  creatorDetails?: {
    type: "alumni" | "partner";
    name: string;
    profile_picture?: string;
    company_name?: string;
    company_logo?: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
  };
}

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

interface EditJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  onJobUpdated: (updatedJob: Job) => void;
  userRole: "alumni" | "partner" | "admin";
}

const EditJobModal: React.FC<EditJobModalProps> = ({
  isOpen,
  onClose,
  job,
  onJobUpdated,
  userRole,
}) => {
  const [editedJob, setEditedJob] = useState<Partial<Job>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (job) {
      setEditedJob(job);
    }
  }, [job]);

  const handleInputChange = (field: keyof Job, value: any) => {
    setEditedJob((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const jobToSubmit = {
        ...editedJob,
        isApproved: userRole === "admin" ? "approved" : "pending",
      };

      const response = await axios.put("/api/edit_job", jobToSubmit);
      if (response.status === 200) {
        notifications.show({
          title: "Success",
          message:
            userRole === "admin"
              ? "Job updated successfully"
              : "Job edit submitted for review",
          color: "green",
          icon: <IconCheck />,
        });
        onJobUpdated(response.data.job);
        onClose();
      }
    } catch (error) {
      console.error("Error updating job:", error);
      notifications.show({
        title: "Error",
        message: "Failed to update job",
        color: "red",
        icon: <IconX />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Edit Job Details"
      size="70%"
    >
      <Container
        size="xl"
        p="xl"
        pt={10}
        bg="white"
        style={{ borderRadius: 8, position: "relative" }}
      >
        <LoadingOverlay
          visible={isSubmitting}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
          loaderProps={{ color: "#146a3e", type: "bars" }}
        />
        <form onSubmit={handleSubmit}>
          {userRole !== "admin" && (
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              title="Notice"
              color="red"
              mb="md"
            >
              Your edits will be reviewed by an administrator before being
              published.
            </Alert>
          )}

          <TextInput
            label="Company Name"
            value={editedJob.company_name || ""}
            onChange={(e) => handleInputChange("company_name", e.target.value)}
            required
          />

          <TextInput
            label="Job Title"
            value={editedJob.job_title || ""}
            onChange={(e) => handleInputChange("job_title", e.target.value)}
            required
            mt="sm"
          />

          <Grid>
            <Grid.Col span={{ lg: 6, md: 12, sm: 12 }}>
              <TextInput
                label="Location"
                value={editedJob.location || ""}
                onChange={(e) => handleInputChange("location", e.target.value)}
                required
                leftSection={
                  <IconMapPin size={20} stroke={1.5} color="#cccccc" />
                }
                mt="sm"
              />
            </Grid.Col>
            <Grid.Col span={{ lg: 6, md: 12, sm: 12 }}>
              <Select
                label="Industry"
                value={editedJob.industry || ""}
                onChange={(value) => handleInputChange("industry", value)}
                data={industryOptions}
                required
                leftSection={
                  <IconBuilding size={20} stroke={1.5} color="#cccccc" />
                }
                mt="sm"
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={{ lg: 6, md: 12, sm: 12 }}>
              <DateInput
                label="Application Deadline"
                value={editedJob.deadline ? new Date(editedJob.deadline) : null}
                onChange={(date) => handleInputChange("deadline", date)}
                required
                leftSection={
                  <IconCalendarDue size={20} stroke={1.5} color="#cccccc" />
                }
                mt="sm"
              />
            </Grid.Col>
            <Grid.Col span={{ lg: 6, md: 12, sm: 12 }}>
              <Tooltip label="Salary range must be in Philippine Pesos (₱) and cannot be changed" withArrow>
                <NumberInput
                  label="Salary"
                  value={editedJob.salary || 0}
                  onChange={(value) => handleInputChange("salary", value)}
                  required
                  leftSection={
                    <IconMoneybag size={20} stroke={1.5} color="#cccccc" />
                  }
                  mt="sm"
                />
              </Tooltip>
              <Badge color="green" size="md" variant="light">
                PHP ₱
              </Badge>
            </Grid.Col>
          </Grid>

          <Select
            label="Job Type"
            value={editedJob.job_status || ""}
            onChange={(value) => handleInputChange("job_status", value)}
            data={[
              { value: "full-time", label: "Full Time" },
              { value: "part-time", label: "Part Time" },
            ]}
            required
            leftSection={
              <IconBriefcase2 size={20} stroke={1.5} color="#cccccc" />
            }
            mt="sm"
          />

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
            content={editedJob.job_description || ""}
            setContent={(content) =>
              handleInputChange("job_description", content)
            }
          />

          <Text fw="700" size="sm" pb="xs" mt="xl">
            Requirements <span style={{ color: "red" }}>*</span>
          </Text>
          <RichTextEditorComponent
            content={editedJob.requirements || ""}
            setContent={(content) => handleInputChange("requirements", content)}
          />

          <Text fw="700" size="sm" pb="xs" mt="xl">
            Additional Information
          </Text>
          <RichTextEditorComponent
            content={editedJob.additional_info || ""}
            setContent={(content) =>
              handleInputChange("additional_info", content)
            }
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
                : userRole === "admin"
                ? "Update Job"
                : "Submit for Review"}
            </Button>
          </Group>
        </form>
      </Container>
    </Modal>
  );
};

export default EditJobModal;

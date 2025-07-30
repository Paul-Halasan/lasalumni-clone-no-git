import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Container,
  Modal,
  Textarea,
  rem,
  Group,
  Title,
  Divider,
  Checkbox,
  Center,
  ActionIcon,
  Text,
  Image,
  Stack,
  Badge,
  ScrollArea,
  Tooltip,
  Paper,
  Grid,
  Alert,
  TextInput,
  Select,
  Flex,
  Loader,
} from "@mantine/core";
import axios from "axios";
import { notifications } from "@mantine/notifications";
import {
  IconX,
  IconCheck,
  IconEye,
  IconRosetteDiscountCheck,
  IconCircleX,
  IconTrash,
  IconAlertCircle,
  IconBriefcase,
} from "@tabler/icons-react";
import DOMPurify from "dompurify";
import classes from "../../../pages/user_admin/search/search_alumni.module.css";
import withAuth from "../../../components/withAuth";
import EditJobModal from "../../../components/admin/AdminEditJobModal";

interface Job {
  job_id: number;
  company_name: string;
  userID: string;
  job_title: string;
  job_description: string;
  isApproved: "approved" | "pending" | "denied";
  isAccepting: boolean;
  location: string;
  salary: string;
  industry: string;
  job_status: string;
  deadline: string;
  requirements: string;
  additional_info: string;
  created_at: string;
  updated_at: string;
  applicant_count: number;
  userDetails?: {
    type: string;
    company_name: string;
    company_logo: string;
    first_name: string;
    last_name: string;
    profile_picture: string;
    contact_name?: string;
  };
}

interface ApproveJobsProps {
  updateUnapprovedJobsCount: () => void;
  jobs?: Job[];
}

// Utility function to format dates
const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const ApproveJobs: React.FC<ApproveJobsProps> = ({
  updateUnapprovedJobsCount,
  jobs = [],
}) => {
  const [jobList, setJobList] = useState<Job[]>(jobs);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [searchJobTitle, setSearchJobTitle] = useState("");
  const [searchIndustry, setSearchIndustry] = useState("");
  const [searchApprovalStatus, setSearchApprovalStatus] = useState<
    "approved" | "pending" | "denied" | ""
  >("pending");
  const [searchJobStatus, setSearchJobStatus] = useState<"1" | "0" | "">("");

  // Modals and Selected Job
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [detailsModalOpened, setDetailsModalOpened] = useState(false);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "/api/admin_get_jobs",
        {
          jobTitle: searchJobTitle,
          industry: searchIndustry,
          approvalStatus: searchApprovalStatus,
          jobStatus: searchJobStatus,
        },
        {
          withCredentials: true,
        }
      );

      if (Array.isArray(response.data.jobs)) {
        setJobList(response.data.jobs);
      } else {
        setJobList([]);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchJobTitle, searchIndustry, searchApprovalStatus, searchJobStatus]);

  const handleApproveJob = async (job_id: number, userID: string, job_title: string) => {
    try {
      const response = await axios.post("/api/approve_job", { job_id });

      if (response.status === 200) {
        notifications.show({
          title: "Success",
          message: `Job "${job_title}" approved successfully!`,
          color: "green",
        });

        // Notify the job poster
        await axios.post("/api/insert_notif", {
          message: `Job "${job_title}" has been approved.`,
          directTo: "jobs",
          userID,
          isAdmin: true,
        });

        fetchJobs();
      }
    } catch (error) {
      console.error("Error approving job:", error);
      notifications.show({
        title: "Error",
        message: `Failed to approve job "${job_title}".`,
        color: "red",
      });
    }
  };

  const handleDenyJob = async (job_id: number, reason: string, userID: string, job_title: string) => {
    try {
      const response = await axios.post("/api/deny_job", { job_id });

      if (response.status === 200) {
        notifications.show({
          title: "Success",
          message: `Job "${job_title}" denied successfully.`,
          color: "green",
        });

        // Notify the job poster
        await axios.post("/api/insert_notif", {
          message: `Job "${job_title}" has been denied. Reason: ${reason}`,
          directTo: "jobs",
          userID,
          isAdmin: true,
        });

        fetchJobs();
      }
    } catch (error) {
      console.error("Error denying job:", error);
      notifications.show({
        title: "Error",
        message: `Failed to deny job "${job_title}".`,
        color: "red",
      });
    }
  };

  const handleEditClick = (job: Job) => {
    setSelectedJob({
      ...job,
      applicant_count: job.applicant_count || 0, // Ensure applicant_count is included
    });
    setIsEditModalOpen(true);
  };

  const handleViewDetailsClick = async (job: Job) => {
    setSelectedJob(job);
    setDetailsModalOpened(true);
  };

  const handleJobUpdated = (updatedJob: Job) => {
    setJobList((prevJobs) =>
      prevJobs.map((job) =>
        job.job_id === updatedJob.job_id ? updatedJob : job
      )
    );
  };

  return (
    <Container size="xl" p={15} bg="white" style={{ borderRadius: 15 }}>
      <Group align="center" gap="sm" p="md">
        <IconBriefcase size={24} color="#146a3e" />
        <Title order={3} c="#146a3e">
          Approve Job Postings
        </Title>
      </Group>

      <Divider my="md" />

      {/* Filter Section */}
      <form onSubmit={(e) => e.preventDefault()}>
        <Grid gutter="md">
          <Grid.Col span={{ lg: 3, md: 12, sm: 12 }}>
            <TextInput
              label="Job Title"
              placeholder="Search by Job Title"
              value={searchJobTitle}
              onChange={(e) => setSearchJobTitle(e.target.value)}
            />
          </Grid.Col>

          <Grid.Col span={{ lg: 3, md: 12, sm: 12 }}>
            <TextInput
              label="Industry"
              placeholder="Search by Industry"
              value={searchIndustry}
              onChange={(e) => setSearchIndustry(e.target.value)}
            />
          </Grid.Col>

          <Grid.Col span={{ lg: 3, md: 12, sm: 12 }}>
            <Select
              label="Approval Status"
              placeholder="Approval Status"
              value={searchApprovalStatus}
              onChange={(value: string | null) =>
                setSearchApprovalStatus(
                  value as "approved" | "pending" | "denied" | ""
                )
              }
              data={[
                { value: "", label: "All" },
                { value: "approved", label: "Approved" },
                { value: "pending", label: "Pending" },
                { value: "denied", label: "Denied" },
              ]}
            />
          </Grid.Col>

          <Grid.Col span={{ lg: 3, md: 12, sm: 12 }}>
            <Select
              label="Job Status"
              placeholder="Job Status"
              value={searchJobStatus}
              onChange={(value: string | null) =>
                setSearchJobStatus((value as "1" | "0" | "") || "")
              }
              data={[
                { value: "", label: "All" },
                { value: "1", label: "Accepting" },
                { value: "0", label: "Closed" },
              ]}
            />
          </Grid.Col>
        </Grid>
      </form>

      <Container fluid className={classes.tableContainer}>
        {isLoading ? (
          <Center style={{ height: 200 }}>
            <Loader color="#146a3e" size="md" />
          </Center>
        ) : jobList.length === 0 ? (
          <div className={classes.emptyState}>No job postings found.</div>
        ) : (
          <Table className={`${classes.table} responsive-cards`}>
            <thead className={classes.tableHeader}>
              <tr>
                <th>Job Title</th>
                <th>Location</th>
                <th>Industry</th>
                <th>Job Type</th>
                <th>Deadline</th>
                <th>Approval Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobList.map((job) => (
                <tr key={job.job_id} className={classes.tableRow}>
                  <td className={classes.tableCell}>{job.job_title}</td>
                  <td className={classes.tableCell}>{job.location}</td>
                  <td className={classes.tableCell}>{job.industry}</td>
                  <td className={classes.tableCell}>{job.job_status}</td>
                  <td className={classes.tableCell}>
                    {new Date(job.deadline).toLocaleDateString()}
                  </td>
                  <td className={classes.tableCell}>
                    <Badge
                      color={
                        job.isApproved === "approved"
                          ? "green"
                          : job.isApproved === "denied"
                          ? "red"
                          : "yellow"
                      }
                      variant="light"
                    >
                      {job.isApproved === "approved"
                        ? "Approved"
                        : job.isApproved === "denied"
                        ? "Denied"
                        : "Pending"}
                    </Badge>
                  </td>
                  <td className={classes.tableCell}>
                    <Group gap="xs" justify="flex-end" wrap="nowrap">
                      <Button
                        color="blue"
                        onClick={() => handleEditClick(job)}
                      >
                        Edit
                      </Button>
                      <Tooltip label="View Details">
                        <ActionIcon
                          variant="outline"
                          color="blue"
                          onClick={() => handleViewDetailsClick(job)}
                        >
                          <IconEye size={18} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Approve Job">
                        <ActionIcon
                          variant="outline"
                          color="green"
                          onClick={() =>
                            handleApproveJob(job.job_id, job.userID, job.job_title)
                          }
                        >
                          <IconCheck size={18} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Deny Job">
                        <ActionIcon
                          variant="outline"
                          color="red"
                          onClick={() =>
                            handleDenyJob(
                              job.job_id,
                              "Reason for denial",
                              job.userID,
                              job.job_title
                            )
                          }
                        >
                          <IconX size={18} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Container>

      {/* Edit Job Modal */}
      {selectedJob && (
        <EditJobModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          job={selectedJob} // Now includes applicant_count
          onJobUpdated={handleJobUpdated}
          userRole="admin"
        />
      )}

      {/* Job Details Modal */}
      <Modal
        opened={detailsModalOpened}
        onClose={() => setDetailsModalOpened(false)}
        title={
          <Title order={4} fw={600}>
            {selectedJob?.job_title}
          </Title>
        }
        size="lg"
        centered
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        {selectedJob && (
          <ScrollArea h={500} type="auto">
            <Stack gap="md">
              <Group justify="flex-start">
                <Badge
                  color={selectedJob.isAccepting ? "green" : "red"}
                  size="lg"
                  variant="filled"
                >
                  {selectedJob.isAccepting
                    ? "Accepting Applications"
                    : "Not Accepting Applications"}
                </Badge>
                <Badge color="gray" size="lg">
                  {selectedJob.job_status}
                </Badge>
                <Badge color="blue" size="lg">
                  {selectedJob.industry}
                </Badge>
              </Group>

              <Paper withBorder p="md" radius="md" mb="lg">
                <Group mb="md">
                  {selectedJob.userDetails?.company_logo && (
                    <Image
                      src={`https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${selectedJob.userDetails.company_logo}`}
                      alt={`${selectedJob.userDetails.company_name} logo`}
                      width={80}
                      height={80}
                      radius="md"
                    />
                  )}
                  <Stack gap={0}>
                    <Text fw={700} size="lg">
                      {selectedJob.userDetails?.type === "alumni"
                        ? selectedJob.company_name
                        : selectedJob.userDetails?.type === "partner"
                        ? selectedJob.userDetails?.company_name
                        : "N/A"}
                    </Text>
                    <Text c="dimmed">{selectedJob.location}</Text>
                  </Stack>
                </Group>

                <Title order={4} c="#146a3e" pt="md" pb="md">
                  Job Details
                </Title>
                <Divider mb="lg" />
                <Grid>
                  <Grid.Col span={{ lg: 6, md: 12, sm: 12 }}>
                    <Stack gap={0}>
                      <Text fw={700}>Salary</Text>
                      <Text>
                        {selectedJob.salary
                          ? `₱ ${Number(selectedJob.salary).toLocaleString("en-PH")}`
                          : "Not specified"}
                      </Text>
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={{ lg: 6, md: 12, sm: 12 }}>
                    <Stack gap={0}>
                      <Text fw={700}>Deadline</Text>
                      <Text>{formatDate(selectedJob.deadline)}</Text>
                    </Stack>
                  </Grid.Col>
                </Grid>

                <Stack gap="md" mt="lg">
                  <Stack gap={0}>
                    <Text fw={700}>Description</Text>

                    <Text
                      size="sm"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                          selectedJob.job_description || ""
                        ),
                      }}
                    />
                  </Stack>

                  <Stack gap={0}>
                    <Text fw={700}>Requirements</Text>
                    <Text
                      size="sm"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                          selectedJob.requirements || ""
                        ),
                      }}
                    />
                  </Stack>

                  {selectedJob.additional_info && (
                    <Stack gap={0}>
                      <Text fw={700}>Additional Information</Text>
                      <Text
                        size="sm"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(
                            selectedJob.additional_info || ""
                          ),
                        }}
                      />
                    </Stack>
                  )}
                </Stack>
              </Paper>

              <Paper withBorder p="md" radius="md" mb="lg">
                <Title order={4} c="#146a3e" pt="md" pb="md">
                  Posted By
                </Title>
                <Divider mb="lg" />

                <Group align="center" mb="md">
                  {selectedJob.userDetails?.profile_picture && (
                    <Image
                      src={`https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${selectedJob.userDetails.profile_picture}`}
                      alt="User profile"
                      width={60}
                      height={60}
                      radius="xl"
                    />
                  )}
                  <Stack gap={0}>
                    <Text fw={700}>
                      {selectedJob.userDetails ? (
                        selectedJob.userDetails.type === "alumni" ? (
                          `${selectedJob.userDetails.first_name} ${selectedJob.userDetails.last_name}`
                        ) : (
                          <>
                            {selectedJob.userDetails.contact_name},
                            <Text span fw={400} inherit>
                              {" "}
                              <br />
                              Company Representative from{" "}
                            </Text>
                            <Text span fw={700} inherit>
                              {selectedJob.userDetails.company_name}
                            </Text>
                          </>
                        )
                      ) : (
                        "User"
                      )}
                    </Text>
                    <Text c="dimmed">
                      {selectedJob.userDetails?.type === "partner"
                        ? "Partner Company"
                        : "Alumni"}
                    </Text>
                  </Stack>
                </Group>

                <Group grow mb="md">
                  <Stack gap={0}>
                    <Text fw={700}>Posted On</Text>
                    <Text>{formatDate(selectedJob.created_at)}</Text>
                  </Stack>
                  <Stack gap={0}>
                    <Text fw={700}>Last Updated</Text>
                    <Text>{formatDate(selectedJob.updated_at)}</Text>
                  </Stack>
                </Group>
              </Paper>
            </Stack>
          </ScrollArea>
        )}
      </Modal>
    </Container>
  );
};

export default withAuth(ApproveJobs, ["admin"]);

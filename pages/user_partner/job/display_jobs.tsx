import React, { useEffect, useState } from "react";
import {
  Text,
  Title,
  Group,
  Badge,
  Stack,
  TextInput,
  Select,
  ActionIcon,
  Tooltip,
  Container,
  Grid,
  Divider,
  Modal,
  Loader,
  Center,
  Button,
} from "@mantine/core";
import axios from "axios";
import withAuth from "../../../components/withAuth";
import classes from "../../../pages/user_admin/search/search_alumni.module.css";
import {
  IconEdit,
  IconEye,
  IconTrash,
  IconBriefcase,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { JobInfo } from "../../../components/common/JobPostComponent/JobInfo";
import EditJobModal from "../../../components/common/EditJobModal";
import { notifications } from "@mantine/notifications";

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

interface Applicant {
  application_id: number;
  applicant_name: string;
  profile_picture: string;
  resume_path: string;
}

const PartnerCompanyJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobInfoModalOpen, setIsJobInfoModalOpen] = useState(false);

  const [searchJobTitle, setSearchJobTitle] = useState("");
  const [searchIndustry, setSearchIndustry] = useState("");
  const [searchApprovalStatus, setSearchApprovalStatus] = useState<
    "approved" | "pending" | "denied" | ""
  >("");
  const [searchJobStatus, setSearchJobStatus] = useState<"1" | "0" | "">("");

  const [isApplicantsModalOpen, setIsApplicantsModalOpen] = useState(false);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);

  const openJobInfoModal = (job: Job) => {
    setSelectedJob(job);
    setIsJobInfoModalOpen(true);
  };

  const openApplicantsModal = async (job: Job) => {
    setSelectedJob(job);
    setIsApplicantsModalOpen(true);
    setIsLoadingApplicants(true);

    try {
      const response = await axios.post(
        "/api/get_applicants", // API endpoint to fetch applicants
        { job_id: job.job_id },
        { withCredentials: true }
      );

      if (Array.isArray(response.data.applicants)) {
        setApplicants(response.data.applicants);
      } else {
        setApplicants([]);
      }
    } catch (error) {
      console.error("Error fetching applicants:", error);
      setApplicants([]);
    } finally {
      setIsLoadingApplicants(false);
    }
  };

  const closeApplicantsModal = () => {
    setIsApplicantsModalOpen(false);
    setApplicants([]);
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "/api/get_jobs",
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
        setJobs(response.data.jobs);
      } else {
        setJobs([]);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        try {
          const refreshResponse = await axios.post("/api/refresh", {
            withCredentials: true,
          });

          if (refreshResponse.status === 200) {
            console.log("Access token refreshed successfully");
            const retryResponse = await axios.post(
              "/api/get_jobs",
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

            if (Array.isArray(retryResponse.data.jobs)) {
              setJobs(retryResponse.data.jobs);
            } else {
              setJobs([]);
            }
          }
        } catch (refreshError) {
          console.error("Error refreshing the token:", refreshError);
          setJobs([]);
        }
      } else {
        console.error("Error fetching jobs:", error);
        setJobs([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (job: Job) => {
    setJobToEdit(job);
    setIsEditModalOpen(true);
  };

  const handleJobUpdated = (updatedJob: Job) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.job_id === updatedJob.job_id ? updatedJob : job
      )
    );
  };

  const handleDeleteClick = (job: Job) => {
    setJobToDelete(job);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;

    setIsDeleting(true);
    try {
      const response = await axios.delete("/api/delete_job", {
        data: { job_id: jobToDelete.job_id },
        withCredentials: true,
      });

      if (response.status === 200) {
        // Remove the deleted job from the jobs array
        setJobs((prevJobs) =>
          prevJobs.filter((job) => job.job_id !== jobToDelete.job_id)
        );

        // Show success notification
        notifications.show({
          title: "Success",
          message: "Job posting has been deleted successfully",
          color: "green",
        });

        // Close the modal
        setIsDeleteModalOpen(false);
      }
    } catch (error) {
      console.error("Error deleting job:", error);

      // Show error notification
      notifications.show({
        title: "Error",
        message: "Failed to delete job posting. Please try again.",
        color: "red",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchJobTitle, searchIndustry, searchApprovalStatus, searchJobStatus]);

  return (
    <Container size="xl">
      <Container fluid bg="white" p={15} pt={30} mb={15}>
        <Stack align="center">
          <Title ta="center" style={{ fontSize: "1.8rem" }}>
            Manage your <span style={{ color: "#146a3e" }}> Job Listing </span>
          </Title>
          <Text ta="center" maw={1000}>
            View all your shared job opportunities here and manage them
            efficiently. You can edit job details, track application status, and
            remove outdated listings. Keep your job postings up-to-date to
            attract the best talent from our alumni network.
          </Text>

          <Text ta="center" maw={1000}>
            Editing Job Information will automatically go through approval
            process again by the admin.
          </Text>
        </Stack>
        <Divider
          w={"100%"}
          my="lg"
          labelPosition="center"
          label={<IconBriefcase size={25} />}
        />

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
      </Container>

      <div className={classes.tableContainer}>
        {isLoading ? (
          <Center style={{ height: 200 }}>
            <Loader color="#146a3e" size="md" />
          </Center>
        ) : jobs.length === 0 ? (
          <div className={classes.emptyState}>No job listings found.</div>
        ) : (
          <table className={`${classes.table} ${classes["responsive-cards"]}`}>
            <thead className={classes.tableHeader}>
              <tr>
                <th>Job Title</th>
                <th>Location</th>
                <th>Industry</th>
                <th>Job Type</th>
                <th>Deadline</th>
                <th>Application Status</th>
                <th>Approval Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.job_id} className={classes.tableRow}>
                  <td className={classes.tableCell} data-label="Job Title">
                    {job.job_title}
                  </td>
                  <td
                    className={classes.tableCell}
                    style={{ width: "20%" }}
                    data-label="Location"
                  >
                    {job.location}
                  </td>
                  <td className={classes.tableCell} data-label="Industry">
                    {job.industry}
                  </td>
                  <td className={classes.tableCell} data-label="Status">
                    {job.job_status}
                  </td>
                  <td className={classes.tableCell} data-label="Deadline">
                    {new Date(job.deadline).toLocaleDateString()}
                  </td>
                  <td className={classes.tableCell} data-label="Job Visible">
                    <Badge
                      color={job.isAccepting ? "green" : "red"}
                      variant="light"
                    >
                      {job.isAccepting ? "Accepting" : "Closed"}
                    </Badge>
                  </td>
                  <td className={classes.tableCell} data-label="Approval">
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
                  <td className={classes.tableCell} data-label="Actions">
                    <Group gap="xs" justify="flex-end" wrap="nowrap">
                      <Tooltip label="View Job Post">
                        <ActionIcon
                          variant="outline"
                          color="#146a3e"
                          size="lg"
                          title="View Job Details"
                          onClick={() => openJobInfoModal(job)}
                        >
                          <IconEye size={18} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Edit Job Post">
                        <ActionIcon
                          variant="outline"
                          color="blue"
                          size="lg"
                          title="Edit"
                          onClick={() => handleEditClick(job)}
                        >
                          <IconEdit size={18} />
                        </ActionIcon>
                      </Tooltip>

                      <Tooltip label="Delete Job Posting">
                        <ActionIcon
                          variant="outline"
                          color="red"
                          size="lg"
                          title="Delete"
                          onClick={() => handleDeleteClick(job)} // Changed to handleDeleteClick
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        opened={isJobInfoModalOpen}
        onClose={() => setIsJobInfoModalOpen(false)}
        size="70%"
        title="Job Details"
      >
        {selectedJob && (
          <JobInfo
            jobDetails={{
              id: selectedJob.job_id,
              title: selectedJob.job_title,
              company: selectedJob.company_name,
              industry: selectedJob.industry,
              location: selectedJob.location,
              status: selectedJob.job_status,
              description: selectedJob.job_description,
              requirements: selectedJob.requirements,
              additionalInfo: selectedJob.additional_info || "",
              salary: selectedJob.salary || "Not specified",
              applicationDeadline: new Date(
                selectedJob.deadline
              ).toLocaleDateString(),
              postedBy: {
                name:
                  selectedJob.creatorDetails?.contact_name ||
                  selectedJob.creatorDetails?.name ||
                  "Contact Name",
                company: selectedJob.creatorDetails?.company_name || "",
                type:
                  selectedJob.creatorDetails?.type === "partner"
                    ? "Partner Company"
                    : "Alumni",
              },
              contactInfo: {
                name:
                  selectedJob.creatorDetails?.contact_name ||
                  selectedJob.creatorDetails?.name ||
                  "Contact Name",
                phone:
                  selectedJob.creatorDetails?.contact_phone || "Contact Phone",
                email:
                  selectedJob.creatorDetails?.contact_email || "Contact Email",
              },
              companyLocation: selectedJob.location,
              logoUrl: selectedJob.creatorDetails?.company_logo
                ? `https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${selectedJob.creatorDetails.company_logo}`
                : selectedJob.creatorDetails?.profile_picture
                ? `https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${selectedJob.creatorDetails.profile_picture}`
                : "/path/to/default/logo.png",
            }}
            onFavorite={() => {
              /* Implement favorite functionality */
            }}
            showApplicantsTab={true}
            onApply={(jobId) => {
              console.log(`Job with ID ${jobId} applied.`);
              // Implement additional logic if needed
            }}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={
          <Group>
            <IconAlertTriangle size={24} color="red" />
            <Text fw={600}>Delete Job Posting</Text>
          </Group>
        }
        centered
      >
        <Stack>
          <Text>
            Are you sure you want to delete the job posting{" "}
            <strong>&quot;{jobToDelete?.job_title}&quot;</strong>? This action cannot be
            undone.
          </Text>

          <Text size="sm" c="dimmed">
            All associated data, including applicant information, will be
            permanently removed.
          </Text>

          <Group justify="flex-end" mt="md">
            <Button
              variant="default"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button color="red" onClick={handleDeleteJob} loading={isDeleting}>
              Delete Job
            </Button>
          </Group>
        </Stack>
      </Modal>

      <EditJobModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        job={jobToEdit}
        onJobUpdated={handleJobUpdated}
        userRole="partner"
      />
    </Container>
  );
};

export default withAuth(PartnerCompanyJobs, "partner");

import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Stack,
  TextInput,
  Select,
  Button,
  Group,
  ScrollArea,
  Box,
  Text,
  Title,
  Divider,
  Skeleton,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import axios from "axios";
import { notifications } from "@mantine/notifications";
import withAuth from "../../../components/withAuth";
import { JobCard } from "../../../components/common/JobPostComponent/JobCard";
import { IconBriefcase } from "@tabler/icons-react";
import {
  JobInfo,
  JobDetails,
} from "../../../components/common/JobPostComponent/JobInfo";

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
  userDetails?: {
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

const ViewJobs: React.FC = () => {
  const [jobList, setJobList] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<{
    [key: number]: string;
  }>({});
  const [searchJobTitle, setSearchJobTitle] = useState("");
  const [searchIndustry, setSearchIndustry] = useState("");
  const [searchJobStatus, setSearchJobStatus] = useState<
    "full-time" | "part-time" | ""
  >("");
  const [scrollAreaHeight, setScrollAreaHeight] = useState("100vh");
  const [isJobSelected, setIsJobSelected] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/alumni_get_jobs", {
        jobTitle: searchJobTitle,
        industry: searchIndustry,
        jobStatus: searchJobStatus,
      });
      const jobs = response.data.jobs || [];
      setJobList(jobs);

      // Initialize applicationStatus
      const initialStatus: { [key: number]: string } = {};
      jobs.forEach((job: { job_id: number; isApplied: any }) => {
        initialStatus[job.job_id] = job.isApplied ? "applied" : "not_applied";
      });
      setApplicationStatus(initialStatus);

      if (jobs.length > 0) {
        setSelectedJob(jobs[0]);
      }
    } catch (error) {
      handleFetchError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchError = async (error: any) => {
    if (error.response && error.response.status === 401) {
      try {
        const refreshResponse = await axios.post("/api/refresh", {
          withCredentials: true,
        });
        if (refreshResponse.status === 200) {
          console.log("Access token refreshed successfully");
          await fetchJobs();
        }
      } catch (refreshError) {
        console.error("Error refreshing the token:", refreshError);
        notifications.show({
          title: "Error",
          message: "Session expired. Please log in again.",
          color: "red",
        });
      }
    } else {
      console.error("Error fetching jobs:", error);
      notifications.show({
        title: "Error",
        message: error.response?.data?.error || "Failed to fetch jobs.",
        color: "red",
      });
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchJobTitle, searchIndustry, searchJobStatus]);

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    setIsJobSelected(true);
  };

  const handleBackToList = () => {
    setIsJobSelected(false);
  };

  const handleApply = (jobId: number) => {
    setApplicationStatus((prevStatus) => ({
      ...prevStatus,
      [jobId]: "applied",
    }));
  };

  useEffect(() => {
    const updateScrollAreaHeight = () => {
      const viewportHeight = window.innerHeight;
      const topOffset = 100; // Adjust this value based on your layout
      const newHeight = viewportHeight - topOffset;
      setScrollAreaHeight(`${newHeight}px`);
    };

    updateScrollAreaHeight();
    window.addEventListener("resize", updateScrollAreaHeight);

    return () => {
      window.removeEventListener("resize", updateScrollAreaHeight);
    };
  }, []);

  const formatJobDetailsForJobInfo = (job: Job): JobDetails => {
    const defaultUserDetails = {
      name: "Admin",
      company_name: "De La Salle University - Dasmariñas",
      profile_picture: "public/1745831594374-dlsud.png",
      company_logo: "public/1745831594374-dlsud.png", 
      contact_name: "Jose Talent Recruiter",
      contact_email: "admin@dlsud.edu.ph",
      contact_phone: "+63 9472626983",
      type: "admin", // Added type property
    };

    const userDetails = job.userDetails || defaultUserDetails;

    return {
      id: job.job_id,
      title: job.job_title,
      company: job.userDetails?.company_name || job.company_name || "",
      industry: job.industry,
      location: job.location,
      status: job.job_status,
      description: job.job_description,
      requirements: job.requirements,
      additionalInfo: job.additional_info || "",
      salary: job.salary || "",
      applicationDeadline: new Date(job.deadline).toLocaleDateString(),
      postedBy: {
        name: userDetails.name,
        company: userDetails.company_name || "",
        type: userDetails.type,
      },
      contactInfo: {
        name: userDetails.contact_name || "",
        phone: userDetails.contact_phone  || "N/A",
        email: userDetails.contact_email || "",
      },
      companyLocation: job.location,
      logoUrl: userDetails.company_logo
        ? `https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${userDetails.company_logo}`
        : `https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${userDetails.profile_picture}`,
    };
  };

  const JobCardSkeleton = () => (
    <Box mb="md">
      <Skeleton height={50} mb="sm" />
      <Skeleton height={20} width="70%" mb="sm" />
      <Skeleton height={20} width="50%" mb="sm" />
      <Skeleton height={20} width="30%" />
    </Box>
  );

  const JobInfoSkeleton = () => (
    <Box>
      <Skeleton height={50} mb="md" />
      <Skeleton height={200} mb="md" />
      <Skeleton height={30} mb="sm" />
      <Skeleton height={20} width="70%" mb="sm" />
      <Skeleton height={20} width="50%" mb="sm" />
      <Skeleton height={100} mb="md" />
      <Skeleton height={30} mb="sm" />
      <Skeleton height={20} width="60%" mb="sm" />
      <Skeleton height={20} width="40%" />
    </Box>
  );

  return (
    <Container fluid>
      {isMobile ? (
        <Group align="left" mb="md">
          <TextInput
            placeholder="Search jobs"
            value={searchJobTitle}
            onChange={(event) => setSearchJobTitle(event.currentTarget.value)}
            style={{ flex: 1 }}
          />
        </Group>
      ) : (
        <Container fluid bg="white" p={15} pt={30} mb={15}>
          <Stack align="center">
            <Title ta="center" style={{ fontSize: "1.8rem", color: "#146a3e" }}>
              List of Available Jobs
            </Title>
            <Text ta="center" maw={1000}>
              Explore a wide range of job opportunities tailored for De La Salle
              University alumni. Browse through various industries, positions,
              and companies seeking talented Lasallians. Whether you&apos;re looking
              for your next career move or just exploring options, this platform
              connects you with exciting possibilities within our alumni
              network. Use the search filters to find the perfect match for your
              skills and aspirations.
            </Text>
          </Stack>
          <Divider
            w={"100%"}
            my="lg"
            labelPosition="center"
            label={<IconBriefcase size={25} />}
          />
          <Group grow justify="center" mb="md">
            <TextInput
              placeholder="Search by Job Title"
              value={searchJobTitle}
              onChange={(event) => setSearchJobTitle(event.currentTarget.value)}
            />
            <TextInput
              placeholder="Search by Industry"
              value={searchIndustry}
              onChange={(event) => setSearchIndustry(event.currentTarget.value)}
            />
            <Select
              placeholder="Job Status"
              value={searchJobStatus}
              onChange={(value) =>
                setSearchJobStatus(value as "full-time" | "part-time" | "")
              }
              data={[
                { value: "full-time", label: "Full Time" },
                { value: "part-time", label: "Part Time" },
              ]}
            />
          </Group>
        </Container>
      )}

      <Grid>
        <Grid.Col span={{ base: 12, md: 3 }}>
          {(!isMobile || !isJobSelected) && (
            <ScrollArea h={scrollAreaHeight} type="scroll" offsetScrollbars>
              <Stack>
                {loading ? (
                  <>
                    <JobCardSkeleton />
                    <JobCardSkeleton />
                    <JobCardSkeleton />
                  </>
                ) : (
                  jobList.map((job) => (
                    <JobCard
                      key={job.job_id}
                      job_id={job.job_id}
                      jobimage={
                        job.userDetails?.company_logo
                          ? `https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${job.userDetails.company_logo}`
                          : job.userDetails?.profile_picture
                          ? `https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${job.userDetails.profile_picture}`
                          : `https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/public/1745831594374-dlsud.png`
                      }
                      jobtitle={job.job_title}
                      companyname={job.company_name}
                      joblocation={job.location}
                      salary={job.salary}
                      isApplied={applicationStatus[job.job_id] === "applied"}
                      onClick={() => handleJobSelect(job)}
                      onApply={(jobId) => handleApply(jobId)}
                    />
                  ))
                )}
                {jobList.map((job) => (
                  <JobCard
                    key={job.job_id}
                    job_id={job.job_id}
                    jobimage={
                      job.userDetails?.company_logo
                        ? `https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${job.userDetails.company_logo}`
                        : job.userDetails?.profile_picture
                        ? `https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${job.userDetails.profile_picture}`
                        : `https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/public/1745831594374-dlsud.png`
                    }
                    jobtitle={job.job_title}
                    companyname={job.company_name}
                    joblocation={job.location}
                    salary={job.salary}
                    isApplied={applicationStatus[job.job_id] === "applied"}
                    onClick={() => handleJobSelect(job)}
                    onApply={(jobId) => handleApply(jobId)} // Pass the callback
                  />
                ))}
              </Stack>
            </ScrollArea>
          )}
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 9 }}>
          {(!isMobile || isJobSelected) && (
            <ScrollArea h={scrollAreaHeight} type="scroll" offsetScrollbars>
              {loading ? (
                <JobInfoSkeleton />
              ) : (
                selectedJob && (
                  <Box>
                    {isMobile && (
                      <Button onClick={handleBackToList} mb="md">
                        Back to Job List
                      </Button>
                    )}
                    <JobInfo
                      jobDetails={formatJobDetailsForJobInfo(selectedJob)}
                      onFavorite={() => console.log("Favorite clicked")}
                      showApplicantsTab={false}
                      isApplied={
                        applicationStatus[selectedJob.job_id] === "applied"
                      }
                      onApply={handleApply}
                    />
                  </Box>
                )
              )}
            </ScrollArea>
          )}
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default withAuth(ViewJobs, ["alumni"]);

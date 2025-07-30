import {
  Container,
  Title,
  Text,
  Grid,
  Group,
  Stack,
  Image,
  Flex,
  Button,
  ActionIcon,
  Tabs,
  Card,
  Avatar,
} from "@mantine/core";
import {
  IconHeart,
  IconHeartFilled,
  IconPhone,
  IconMail,
  IconUser,
  IconLocation,
  IconBuilding,
  IconClock,
  IconBriefcase,
} from "@tabler/icons-react";
import { useState, ReactNode, useEffect } from "react";
import DOMPurify from "dompurify";
import { notifications } from "@mantine/notifications";
import axios from "axios";

export interface JobDetails {
  id: number;
  title: string;
  company: string;
  industry: string;
  location: string;
  status: string;
  description: string;
  requirements: string;
  additionalInfo: string;
  salary: string;
  applicationDeadline: string;
  postedBy: {
    name: string;
    company: string;
    type: string;
  };
  contactInfo: {
    name: string;
    phone: string;
    email: string;
  };
  companyLocation: string;
  logoUrl: string;
}

interface JobInfoProps {
  jobDetails: JobDetails;
  onFavorite: () => void;
  showApplicantsTab: boolean;
  isApplied?: boolean;
  onApply: (jobId: number) => void;
}

interface Applicant {
  userID: number;
  application_id: number;
  applicant_name: string;
  profile_picture: string;
  resume_path: string;
  status: string;
}

export function JobInfo({
  jobDetails,
  onFavorite,
  showApplicantsTab,
  isApplied = false,
  onApply,
}: JobInfoProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  useEffect(() => {
    setIsFavorited(isApplied); // Sync state with prop
  }, [isApplied]);

  const formatSalary = (salary: string): string => {
    const numericSalary = parseFloat(salary.replace(/[^0-9.-]+/g, ""));
    return numericSalary.toLocaleString("en-US", {
      style: "decimal",
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    });
  };

  const handleTabChange = (value: string | null) => {
    if (value !== null) {
      setActiveTab(value);

      // Fetch applicants when the "applicants" tab is selected
      if (value === "applicants" && showApplicantsTab) {
        fetchApplicants(jobDetails.id);
      }
    }
  };

  const fetchApplicants = async (job_id: number) => {
    setLoadingApplicants(true);
    try {
      const response = await axios.get(`/api/get_applicants?job_id=${job_id}`);
      const applicantsData = response.data.applicants || [];

      if (applicantsData.length === 0) {
        notifications.show({
          title: "No Applicants",
          message: "There are no interested alumni for this job.",
          color: "yellow",
        });
      }

      setApplicants(applicantsData);
    } catch (error) {
      console.error("Error fetching applicants:", error);
      notifications.show({
        title: "Error",
        message: "Failed to fetch applicants.",
        color: "red",
      });
    } finally {
      setLoadingApplicants(false);
    }
  };

  const TabLabel = ({
    value,
    children,
  }: {
    value: string;
    children: ReactNode;
  }) => (
    <Text size="sm" fw={activeTab === value ? 700 : 400}>
      {children}
    </Text>
  );

  const [isFavorited, setIsFavorited] = useState(isApplied); // Initialize with isApplied
  const [loading, setLoading] = useState(false);

  const applyForJob = async (job_id: number) => {
    setLoading(true);
    try {
      await axios.post("/api/alumni_apply_job", { job_id });
      notifications.show({
        title: "Success",
        message: "You have successfully applied for the job!",
        color: "green",
      });
      setIsFavorited(true); // Set isFavorited to true after applying
      onApply(job_id); // Call onApply to update the parent component
    } catch (error) {
      console.error("Error applying for job:", error);
      notifications.show({
        title: "Error",
        message:
          (error as any).response?.data?.error ||
          "Failed to apply for the job.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      fluid
      style={{
        borderRadius: 8,
        padding: 0,
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        backgroundColor: "white",
      }}
    >
      <Tabs value={activeTab} onChange={handleTabChange} color="#285430">
        <Group
          bg="#94AF99"
          style={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
        >
          <Tabs.List>
            <Tabs.Tab value="details" bg="#94AF99">
              <TabLabel value="details">Job Details</TabLabel>
            </Tabs.Tab>
            {showApplicantsTab && (
              <Tabs.Tab value="applicants" bg="#94AF99">
                <TabLabel value="applicants">Interested Alumni</TabLabel>
              </Tabs.Tab>
            )}
          </Tabs.List>
        </Group>

        <Tabs.Panel value="details">
          <Container fluid p="xl">
            <Group justify="space-between">
              <Flex>
                {jobDetails.logoUrl ? (
                  <Image
                    src={jobDetails.logoUrl}
                    radius="md"
                    height={40}
                    width="auto"
                    fit="contain"
                    alt="Job Icon"
                  />
                ) : (
                  <div style={{ width: 40, height: 40 }} /> // Placeholder div to maintain layout
                )}
              </Flex>

              <Group gap="sm">
                <ActionIcon
                  variant="transparent"
                  size="xl"
                  onClick={() => {
                    if (!isFavorited && !isApplied) {
                      applyForJob(jobDetails.id);
                    }
                  }}
                  disabled={isApplied || isFavorited}
                >
                  {isApplied || isFavorited ? (
                    <IconHeartFilled size="1.3rem" color="red" />
                  ) : (
                    <IconHeart size="1.3rem" />
                  )}
                </ActionIcon>
                <Text>
                  {isApplied || isFavorited
                    ? "Already Applied"
                    : "Apply for this Job"}
                </Text>
              </Group>
            </Group>

            <Grid mt="md">
              <Grid.Col span={{ lg: 8, md: 12, sm: 12 }}>
                <Stack gap={0}>
                  <Title order={2} fw={700}>
                    {jobDetails.title}
                  </Title>
                  <Stack gap={5} mt="sm" ml="xs">
                    <Group align="center">
                      <IconBuilding size={16} color="#146a3e" />
                      <Text size="md">{jobDetails.company}</Text>
                    </Group>
                    <Group>
                      <IconBriefcase size={16} color="#146a3e" />
                      <Text size="md">{jobDetails.industry} Industry</Text>
                    </Group>
                    <Group>
                      <IconClock size={16} color="#146a3e" />
                      <Text size="md">{jobDetails.status} job</Text>
                    </Group>
                  </Stack>
                </Stack>

                <Stack mt="xl" gap="xs">
                  <Text size="xl">Job Description</Text>
                  <Text
                    size="sm"
                    maw={500}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(jobDetails.description || ""),
                    }}
                  />
                </Stack>

                <Stack mt="xl" gap="xs">
                  <Text size="xl">Job Requirement</Text>
                  <Text
                    size="sm"
                    maw={500}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(jobDetails.requirements || ""),
                    }}
                  />
                </Stack>

                {jobDetails.additionalInfo &&
                  jobDetails.additionalInfo.trim() !== "" && (
                    <Stack mt="xl" gap="xs">
                      <Text size="xl">Additional Information</Text>
                      <Text
                        maw={500}
                        size="sm"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(
                            jobDetails.additionalInfo || ""
                          ),
                        }}
                      />
                    </Stack>
                  )}
                <Stack gap={0} mt="xl">
                  <Text size="md">Job is accepting applicants until:</Text>
                  <Text size="xl" color="dimmed">
                    <span style={{ fontWeight: 700, color: "#146a3e" }}>
                      {jobDetails.applicationDeadline}
                    </span>
                  </Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ lg: 4, md: 12, sm: 12 }}>
                <Card shadow="sm" withBorder>
                  <Text size="xl" color="dimmed">
                    <span style={{ fontWeight: 700, color: "#146a3e" }}>
                      PHP {formatSalary(jobDetails.salary)}
                    </span>
                  </Text>
                  <Text size="md">Average salary per month</Text>
                </Card>

                <Card shadow="sm" withBorder mt="lg">
                  <Text size="sm" mb="sm">
                    Posted By:
                  </Text>
                  <Group align="flex-start">
                    <Avatar>{jobDetails.postedBy.name.charAt(0)}</Avatar>
                    <Stack gap={0}>
                      <Text maw={200} lh="md" fw={500}>
                        {jobDetails.postedBy.name}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {jobDetails.postedBy.company}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {jobDetails.postedBy.type}
                      </Text>
                    </Stack>
                  </Group>

                  <Stack mt="lg" gap="sm">
                    <Text size="sm">Contact Information</Text>

                    <Group>
                      <ActionIcon
                        variant="transparent"
                        aria-label="name"
                        color="#146a3e"
                      >
                        <IconUser
                          style={{ width: "70%", height: "70%" }}
                          stroke={1.5}
                        />
                      </ActionIcon>
                      <Text>{jobDetails.contactInfo.name}</Text>
                    </Group>

                    <Group>
                      <ActionIcon
                        variant="transparent"
                        aria-label="phoneNumber"
                        color="#146a3e"
                      >
                        <IconPhone
                          style={{ width: "70%", height: "70%" }}
                          stroke={1.5}
                        />
                      </ActionIcon>
                      <Text>{jobDetails.contactInfo.phone}</Text>
                    </Group>

                    <Group>
                      <ActionIcon
                        variant="transparent"
                        aria-label="email"
                        color="#146a3e"
                      >
                        <IconMail
                          style={{ width: "70%", height: "70%" }}
                          stroke={1.5}
                        />
                      </ActionIcon>
                      <Text>{jobDetails.contactInfo.email}</Text>
                    </Group>
                  </Stack>

                  <Stack mt="lg">
                    <Text size="sm">Company Location</Text>
                    <Group align="flex-start">
                      <ActionIcon
                        variant="transparent"
                        aria-label="location"
                        color="#146a3e"
                      >
                        <IconLocation
                          style={{ width: "70%", height: "70%" }}
                          stroke={1.5}
                        />
                      </ActionIcon>
                      <Text maw={200}>{jobDetails.companyLocation}</Text>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>
          </Container>
        </Tabs.Panel>
        {showApplicantsTab && (
          <Tabs.Panel value="applicants" p="md">
            {loadingApplicants ? (
              <Text>Loading applicants...</Text>
            ) : applicants.length === 0 ? (
              <Text>No interested alumni found for this job.</Text>
            ) : (
              applicants.map((applicant) => (
                <Card key={applicant.application_id} shadow="sm" withBorder>
                  <Group justify="space-between">
                    <Group align="flex-start">
                      <Avatar
                        src={`https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${applicant.profile_picture}`}
                      >
                        {applicant.applicant_name.charAt(0)}
                      </Avatar>
                      <Stack gap={0}>
                        <Text>{applicant.applicant_name}</Text>
                        <Text size="sm" c="dimmed">
                          BSIT Graduate{" "}
                          {/* Replace with dynamic data if available */}
                        </Text>
                      </Stack>
                    </Group>
                    <Button
                      component="a"
                      href={`?page=user-profile&userID=${applicant.userID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Profile
                    </Button>
                  </Group>
                </Card>
              ))
            )}
          </Tabs.Panel>
        )}
      </Tabs>
    </Container>
  );
}

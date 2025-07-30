import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import GenericTimeline from "../../../components/alumni/profile/GenericTimeline";
import ResumeTab from "../../../components/alumni/profile/ViewResumeTab";
import {
  Tabs,
  Avatar,
  Button,
  Container,
  Stack,
  Title,
  Text,
  Group,
  Image,
  Box,
  rem,
  Grid,
  Divider,
  Skeleton,
} from "@mantine/core";
import {
  IconPhone,
  IconMapPin,
  IconAt,
  IconDeviceLandlinePhone,
  IconBuildings,
  IconCalendarEvent,
  IconStar,
  IconBriefcase2,
  IconPointFilled,
  IconArrowLeft,
  IconBrandLinkedin,
  IconBrandFacebook
} from "@tabler/icons-react";
import classes from "./profile.module.css";
import withAuth from "../../../components/withAuth";
import DOMPurify from "isomorphic-dompurify";
import useSWR from "swr";

// Constants
const PROFILE_BG_COLOR = "#ffffff";
const PROFILE_BORDER_RADIUS = "10px";
const PROFILE_IMAGE_URL =
  "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-10.png";
const PROFILE_IMAGE_HEIGHT = 200;
const PROFILE_IMAGE_RADIUS = "sm";
const PROFILE_IMAGE_MARGIN_BOTTOM = "md";
const TAB_COLOR = "#146a3e";
const TAB_PADDING = 15;
const TAB_RADIUS = "md";

interface Profile {
  id: string;
  userID: string;
  first_name: string;
  last_name: string;
  profile_picture: string;
  country: string;
  city: string;
  email_address: string;
  mobile_number: string;
  telephone_number: string;
  department: string;
  batch: string;
  resume: string;
  job_profession: string;
  job_status: string;
  prof_summary: string;
  fb_link?: string;
  linkedin_link?: string;
}

interface AlumniEduc {
  degree: string;
  school: string;
  start_date: string;
  end_date: string;
}

interface AlumniJob {
  jobtitle: string;
  companyname: string;
  start_date: string;
  end_date: string;
}

interface ContactIconProps {
  icon: typeof IconPhone;
  title: string;
  description: string;
  isLink?: boolean;
}

function UserProfile() {
  const router = useRouter();
  const activeTab = (router.query.tab as string) || "Overview";
  const { userID, tab } = router.query;

  const defaultAlumniEduc: AlumniEduc[] = [
    {
      degree: "Degree",
      school: "School",
      start_date: "Start Date",
      end_date: "End Date",
    },
  ];

  const defaultAlumniJob: AlumniJob[] = [
    {
      jobtitle: "Job Title",
      companyname: "Company",
      start_date: "Start Date",
      end_date: "End Date",
    },
  ];

  const [profile, setProfile] = useState<Profile | null>(null);
  const [alumniEduc, setAlumniEduc] = useState<AlumniEduc[]>(defaultAlumniEduc);
  const [alumniJob, setAlumniJob] = useState<AlumniJob[]>(defaultAlumniJob);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggedInUserID, setLoggedInUserID] = useState<string | null>(null);

  const fetcher = (url: string) =>
    fetch(url, { credentials: "include" }).then((res) => res.json());

  const { data: profileData, error: profileError } = useSWR<Profile>(
    `/api/alumni_profile/retrieve_alu_profile?userID=${userID || ""}`,
    fetcher
  );

  const { data: alumniEducData, error: alumniEducError } = useSWR<AlumniEduc[]>(
    `/api/alumni_profile/retrieve_alu_educ?userID=${userID || ""}`,
    fetcher
  );

  const { data: jobExperienceData, error: jobExperienceError } = useSWR<
    AlumniJob[]
  >(`/api/alumni_profile/retrieve_alu_job?userID=${userID || ""}`, fetcher);

  const { data: loggedInUserData, error: loggedInUserError } = useSWR(
    "/api/user",
    fetcher
  );

  useEffect(() => {
    if (profileData) setProfile(profileData);
    if (alumniEducData) setAlumniEduc(alumniEducData);
    if (jobExperienceData) setAlumniJob(jobExperienceData);
    if (loggedInUserData) setLoggedInUserID(loggedInUserData.userID);

    setLoading(
      !(profileData && alumniEducData && jobExperienceData && loggedInUserData)
    );

    if (
      profileError ||
      alumniEducError ||
      jobExperienceError ||
      loggedInUserError
    ) {
      setError("An error occurred while fetching data");
    }
  }, [
    profileData,
    alumniEducData,
    jobExperienceData,
    loggedInUserData,
    profileError,
    alumniEducError,
    jobExperienceError,
    loggedInUserError,
  ]);

  const handleTabChange = (value: string | null) => {
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, tab: value },
      },
      undefined,
      { scroll: false }
    );
  };

  const contactInfoData = [
    {
      title: "Address",
      description: `${profile?.city}, ${profile?.country}`,
      icon: IconMapPin,
    },
    { title: "Email", description: `${profile?.email_address}`, icon: IconAt },
    {
      title: "Mobile Number",
      description: `${profile?.mobile_number}`,
      icon: IconPhone,
    },
    {
      title: "Telephone Number",
      description: `${profile?.telephone_number}`,
      icon: IconDeviceLandlinePhone,
    },
    ...(profile?.fb_link && profile.fb_link.trim() !== ""
      ? [
          {
            title: "Facebook",
            description: profile.fb_link.trim(),
            icon: IconBrandFacebook,
            isLink: true,
          },
        ]
      : []),
    ...(profile?.linkedin_link && profile.linkedin_link.trim() !== ""
      ? [
          {
            title: "LinkedIn",
            description: profile.linkedin_link.trim(),
            icon: IconBrandLinkedin,
            isLink: true,
          },
        ]
      : []),
  ];

  if (loading) {
    return (
      <Container
        bg={PROFILE_BG_COLOR}
        p={15}
        size="lg"
        style={{ borderRadius: PROFILE_BORDER_RADIUS }}
      >
        <Skeleton
          height={PROFILE_IMAGE_HEIGHT}
          radius={PROFILE_IMAGE_RADIUS}
          mb={PROFILE_IMAGE_MARGIN_BOTTOM}
        />
        <Group justify="space-between" align="flex-start">
          <Group>
            <Skeleton
              circle
              height={120}
              width={120}
              style={{ marginTop: -50, border: "4px solid white" }}
            />
            <Stack gap={5}>
              <Skeleton height={30} width={200} />
              <Skeleton height={20} width={150} />
              <Skeleton height={20} width={250} />
            </Stack>
          </Group>
          <Group gap={"xs"} justify="flex-end" mt={5}>
            <Skeleton height={36} width={100} />
            <Skeleton height={36} width={100} />
          </Group>
        </Group>
        <Container px={0} pt={20} size="lg">
          <Grid>
            <Grid.Col span={{ lg: 3, md: 12, sm: 12 }}>
              <Box className={classes.contacts}>
                <Skeleton
                  height={30}
                  width={200}
                  mb="md"
                  style={{ backgroundColor: "#e0e0e0" }}
                />
                <Skeleton
                  height={15}
                  width={150}
                  mb="md"
                  style={{ backgroundColor: "#e0e0e0" }}
                />
                <Skeleton
                  height={15}
                  width={150}
                  mb="md"
                  style={{ backgroundColor: "#e0e0e0" }}
                />
                <Skeleton
                  height={15}
                  width={150}
                  mb="md"
                  style={{ backgroundColor: "#e0e0e0" }}
                />
                <Skeleton
                  height={15}
                  width={150}
                  mb="md"
                  style={{ backgroundColor: "#e0e0e0" }}
                />
              </Box>
            </Grid.Col>
            <Grid.Col
              span={{ lg: 9, md: 12, sm: 12 }}
              style={{ borderRadius: 20 }}
            >
              <Tabs
                defaultValue="default"
                color={TAB_COLOR}
                bg="white"
                p={TAB_PADDING}
                radius={TAB_RADIUS}
              >
                <Tabs.List>
                  <Tabs.Tab value="Overview">Overview</Tabs.Tab>
                  <Tabs.Tab value="Education">Education</Tabs.Tab>
                  <Tabs.Tab value="Experience">Experience</Tabs.Tab>
                  <Tabs.Tab value="Resume">Resume</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="Overview">
                  <Stack mt="15" p={15}>
                    <Skeleton height={30} width={200} mb="md" />
                    <Skeleton height={100} mb="md" />
                    <Skeleton height={30} width={200} mb="md" />
                    <Skeleton height={100} mb="md" />
                    <Skeleton height={30} width={200} mb="md" />
                    <Skeleton height={100} mb="md" />
                  </Stack>
                </Tabs.Panel>
                <Tabs.Panel value="Education">
                  <Stack mt="md" p={15}>
                    <Skeleton height={30} width={200} mb="md" />
                    <Skeleton height={100} mb="md" />
                  </Stack>
                </Tabs.Panel>
                <Tabs.Panel value="Experience">
                  <Stack mt="md" p={15}>
                    <Skeleton height={30} width={200} mb="md" />
                    <Skeleton height={100} mb="md" />
                  </Stack>
                </Tabs.Panel>
                <Tabs.Panel value="Resume">
                  <Stack mt="md" p={15}>
                    <Skeleton height={100} mb="md" />
                  </Stack>
                </Tabs.Panel>
              </Tabs>
            </Grid.Col>
          </Grid>
        </Container>
      </Container>
    );
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const sanitizedProfSummary = DOMPurify.sanitize(profile?.prof_summary || "");

  return (
    <>
      {loggedInUserID !== profile?.userID && (
        <Container size="lg" p={15} pl={0}>
          <Button
            variant="transparent"
            size="compact-md"
            leftSection={<IconArrowLeft />}
            color="#146a3e"
            component="a"
            href="?page=search-alumni"
          >
            back to Search Alumni
          </Button>
        </Container>
      )}
      <Container
        bg={PROFILE_BG_COLOR}
        p={15}
        size="lg"
        style={{ borderRadius: PROFILE_BORDER_RADIUS }}
      >
        <Image
          src={PROFILE_IMAGE_URL}
          alt="Cover photo"
          height={PROFILE_IMAGE_HEIGHT}
          radius={PROFILE_IMAGE_RADIUS}
          mb={PROFILE_IMAGE_MARGIN_BOTTOM}
        />
        <Group justify="space-between" align="flex-start">
          <Group>
            <Avatar
              src={
                profile?.profile_picture
                  ? `https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${profile.profile_picture}`
                  : "https://i.pinimg.com/474x/f1/da/a7/f1daa70c9e3343cebd66ac2342d5be3f.jpg"
              }
              alt="Profile picture"
              size={120}
              radius={60}
              style={{ marginTop: -50, border: "4px solid white" }}
            />
            <Stack gap={5}>
              <Title order={2} mt={0} mb={0}>
                {profile?.first_name} {profile?.last_name}
              </Title>

              {profile?.job_profession}

              <Text c="dimmed" mt={-5}>
                Batch {profile?.batch} - {profile?.department} Graduate
              </Text>
            </Stack>
          </Group>
          <Group gap={"xs"} justify="flex-end" mt={5}>
            {loggedInUserID === profile?.userID && (
              <Button variant="default" component="a" href="?page=edit-profile">
                Edit Profile
              </Button>
            )}
            <Button
              leftSection={<IconPointFilled size="1.3rem" stroke="1.5" />}
              variant="light"
              color={
                profile?.job_status === "Employed"
                  ? "green"
                  : profile?.job_status === "Actively Seeking"
                  ? "blue"
                  : profile?.job_status === "Not Looking"
                  ? "gray"
                  : "#146a3e" // default color if status doesn't match
              }
            >
              {profile?.job_status}
            </Button>
          </Group>
        </Group>
      </Container>

      <Container px={0} pt={20} size="lg">
        <Grid>
          <Grid.Col span={{ lg: 3, md: 12, sm: 12 }}>
            <Box className={classes.contacts}>
              <Text fz="lg" fw={700} className={classes.title}>
                Basic Information
              </Text>
              {contactInfoData.map((item, index) => (
                <ContactInfo key={index} {...item} />
              ))}
            </Box>
          </Grid.Col>
          <Grid.Col
            span={{ lg: 9, md: 12, sm: 12 }}
            style={{ borderRadius: 20 }}
          >
            <Tabs
              defaultValue="default"
              color={TAB_COLOR}
              bg="white"
              p={TAB_PADDING}
              radius={TAB_RADIUS}
              value={activeTab}
              onChange={handleTabChange}
            >
              <Tabs.List>
                <Tabs.Tab value="Overview">Overview</Tabs.Tab>
                <Tabs.Tab value="Education">Education</Tabs.Tab>
                <Tabs.Tab value="Experience">Experience</Tabs.Tab>
                <Tabs.Tab value="Resume">Resume</Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel value="Overview">
                <Stack mt="15" p={15}>
                  {sanitizedProfSummary && (
                    <>
                      <Title order={3} c={TAB_COLOR}>
                        Professional Summary
                      </Title>

                      <div
                        dangerouslySetInnerHTML={{
                          __html: sanitizedProfSummary,
                        }}
                        style={{
                          border: "1px solid #ced4da",
                          borderRadius: "4px",
                          padding: "10px",
                          minHeight: "100px",
                          backgroundColor: "#f8f9fa",
                          marginBottom: "30px",
                        }}
                      />
                    </>
                  )}

                  <Title order={3} c={TAB_COLOR}>
                    Educational Background
                  </Title>
                  {alumniEduc.length > 0 ? (
                    <GenericTimeline
                      data={alumniEduc
                        .sort(
                          (a, b) =>
                            new Date(b.start_date).getTime() -
                            new Date(a.start_date).getTime()
                        )
                        .map((edu) => ({
                          title: edu.degree,
                          subtitle: edu.school,
                          dateRange: `${edu.start_date} - ${edu.end_date}`,
                        }))}
                      mainIcon={IconBuildings}
                      dateIcon={IconCalendarEvent}
                      achievementIcon={IconStar}
                    />
                  ) : (
                    <Text>No educational background available.</Text>
                  )}
                  <Title order={3} c={TAB_COLOR} mt={30}>
                    Job Experience
                  </Title>
                  {alumniJob.length > 0 ? (
                    <GenericTimeline
                      data={alumniJob.map((edu) => ({
                        title: edu.jobtitle,
                        subtitle: edu.companyname,
                        dateRange: `${edu.start_date} - ${edu.end_date}`,
                      }))}
                      mainIcon={IconBriefcase2}
                      dateIcon={IconCalendarEvent}
                      achievementIcon={IconStar}
                    />
                  ) : (
                    <Text>No job experience available.</Text>
                  )}
                </Stack>
              </Tabs.Panel>
              <Tabs.Panel value="Education">
                <Stack mt="md" p={15}>
                  <Title order={3} c={TAB_COLOR}>
                    Educational Background
                  </Title>
                  {alumniEduc.length > 0 ? (
                    <GenericTimeline
                      data={alumniEduc
                        .sort(
                          (a, b) =>
                            new Date(b.start_date).getTime() -
                            new Date(a.start_date).getTime()
                        )
                        .map((edu) => ({
                          title: edu.degree,
                          subtitle: edu.school,
                          dateRange: `${edu.start_date} - ${edu.end_date}`,
                        }))}
                      mainIcon={IconBuildings}
                      dateIcon={IconCalendarEvent}
                      achievementIcon={IconStar}
                    />
                  ) : (
                    <Text>No educational background available.</Text>
                  )}
                </Stack>
              </Tabs.Panel>
              <Tabs.Panel value="Experience">
                <Stack mt="md" p={15}>
                  <Title order={3} c={TAB_COLOR}>
                    Job Experience
                  </Title>

                  {alumniJob.length > 0 ? (
                    <GenericTimeline
                      data={alumniJob.map((edu) => ({
                        title: edu.jobtitle,
                        subtitle: edu.companyname,
                        dateRange: `${edu.start_date} - ${edu.end_date}`,
                      }))}
                      mainIcon={IconBriefcase2}
                      dateIcon={IconCalendarEvent}
                      achievementIcon={IconStar}
                    />
                  ) : (
                    <Text>No job experience available.</Text>
                  )}
                </Stack>
              </Tabs.Panel>
              <Tabs.Panel value="Resume">
                <Stack mt="md" p={15}>
                  <ResumeTab
                    resumeUrl={
                      profile?.resume
                        ? `https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${profile.resume}`
                        : ""
                    }
                  />
                </Stack>
              </Tabs.Panel>
            </Tabs>
          </Grid.Col>
        </Grid>
      </Container>
    </>
  );
}

function ContactInfo({ icon: Icon, title, description, isLink }: ContactIconProps) {
  if (!description || description.trim() === "") return null;

  return (
    <Box display="flex" mb="md" style={{
      display: 'flex',
      alignItems: 'center',
    }}>
      <Box mr="md">
        {isLink ? (
          <a
            href={description}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "inherit" }}
            title={title}
          >
            <Icon style={{ width: rem(24), height: rem(24), color: "white" }} />
          </a>
        ) : (
          <Icon style={{ width: rem(24), height: rem(24), color: "white" }} />
        )}
      </Box>
      <div>
        <Text size="xs" w={200} color="white">
          {title}
        </Text>
        {!isLink && (
          <Text size="sm" color="white">
            {description}
          </Text>
        )}
      </div>
      <Divider my="md" />
    </Box>
  );
}

export default withAuth(UserProfile, ["alumni"]);

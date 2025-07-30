import { useState, useEffect } from "react";
import axios from "axios";
import withAuth from "../../../components/withAuth";
import {
  Container,
  Card,
  Group,
  Title,
  Avatar,
  Text,
  Tabs,
  Image,
  Grid,
  Badge,
  Loader,
  Alert,
  Box,
  Stack,
  Anchor,
  ActionIcon,
  Timeline,
  useMantineTheme,
  ThemeIcon,
} from "@mantine/core";

import {
  IconEdit,
  IconAlertCircle,
  IconBuildingSkyscraper,
  IconMail,
  IconPhone,
  IconMapPin,
  IconUser,
  IconWorldWww,
  IconBrandFacebook,
  IconBrandLinkedin,
  IconCalendar,
  IconBriefcase,
  IconCertificate,
  IconBriefcase2,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import DOMPurify from "dompurify";
import ResumeTab from "../../../components/alumni/profile/ViewResumeTab";

interface PartnerCompany {
  company_id: number;
  userID: string;
  name: string;
  website?: string;
  company_logo?: string;
  industry?: string;
  address?: string;
  description?: string;
  contract?: string;
  effective_date?: Date;
  expiry_date?: Date;
  contact_number?: string;
  email?: string;
  contact_name?: string;
  facebook?: string;
  linkedin?: string;
  created_at?: Date;
  updated_at?: Date;
  account_status?: string;
}

function PartnerProfile() {
  const theme = useMantineTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [company, setCompany] = useState<PartnerCompany | null>(null);
  const [formData, setFormData] = useState<Partial<PartnerCompany>>({});
  const [activeTab, setActiveTab] = useState<string | null>("overview");

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "/api/partner_profile/retrieve_par_profile"
        );
        setCompany(response.data);
        setFormData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching company data:", err);
        setError("Failed to load company profile. Please try again later.");
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  if (loading) {
    return (
      <Container size="md" py="xl">
        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "70vh",
          }}
        >
          <Loader size="lg" />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="md" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
          {error}
        </Alert>
      </Container>
    );
  }

  if (!company) {
    return (
      <Container size="md" py="xl">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="No Profile Found"
          color="yellow"
        >
          No company profile found. Please contact an administrator for
          assistance.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
        <Card.Section style={{ position: "relative" }}>
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=400&q=80"
            height={200}
            alt="Company banner"
          />
          <Box
            style={{
              position: "absolute",
              top: 10,
              right: 10,
            }}
          >
            <ActionIcon
              variant="filled"
              color="orange"
              size="lg"
              title="Edit Profile"
              component="a"
              href="?page=edit-partner-profile"
            >
              <IconEdit size={20} />
            </ActionIcon>
          </Box>
        </Card.Section>
        <Avatar
          src={
            company.company_logo
              ? `https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${company.company_logo}`
              : null
          }
          size={120}
          radius={60}
          mx="auto"
          mt={-60}
          style={{ border: "4px solid white" }}
        >
          {!company.company_logo && company.name?.charAt(0)}
        </Avatar>
        <Title order={2} ta="center" mt="sm">
          {company.name}
        </Title>
        <Text ta="center" size="sm" color="dimmed">
          {company.industry || "Industry not specified"}
        </Text>
        <Group justify="center" mt="md">
          <Badge
            color={company.account_status === "active" ? "green" : "orange"}
            variant="light"
          >
            {company.account_status || "Pending"}
          </Badge>
          {company.effective_date && company.expiry_date && (
            <Badge color="blue" variant="light">
              Contract: {new Date(company.effective_date).toLocaleDateString()}{" "}
              - {new Date(company.expiry_date).toLocaleDateString()}
            </Badge>
          )}
        </Group>
        <Group justify="center" mt="md">
          {company.facebook && (
            <ActionIcon
              component="a"
              href={company.facebook}
              target="_blank"
              variant="light"
              color="blue"
            >
              <IconBrandFacebook size={18} />
            </ActionIcon>
          )}
          {company.linkedin && (
            <ActionIcon
              component="a"
              href={company.linkedin}
              target="_blank"
              variant="light"
              color="blue"
            >
              <IconBrandLinkedin size={18} />
            </ActionIcon>
          )}
        </Group>
      </Card>

      <Tabs value={activeTab} onChange={setActiveTab} mb="xl">
        <Tabs.List grow justify="center">
          <Tabs.Tab value="overview" leftSection={<IconBriefcase size={14} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab
            value="contract"
            leftSection={<IconCertificate size={14} />}
          >
            Contract
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {activeTab === "overview" && (
        <Grid gutter="xl">
          <Grid.Col span={8}>
            <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
              <Title order={4} mb="md">
                Company Overview
              </Title>
              <Text
                size="sm"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(company.description || ""),
                }}
              />
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                Partnership Timeline
              </Title>
              <Timeline active={1} bulletSize={24} lineWidth={2}>
                <Timeline.Item
                  bullet={<IconCalendar size={12} />}
                  title="Partnership Started"
                >
                  <Text color="dimmed" size="sm">
                    {company.effective_date
                      ? new Date(company.effective_date).toLocaleDateString()
                      : "Date not specified"}
                  </Text>
                </Timeline.Item>
                <Timeline.Item
                  bullet={<IconCalendar size={12} />}
                  title="Contract Renewal"
                >
                  <Text color="dimmed" size="sm">
                    {company.expiry_date
                      ? new Date(company.expiry_date).toLocaleDateString()
                      : "Date not specified"}
                  </Text>
                </Timeline.Item>
              </Timeline>
            </Card>
          </Grid.Col>

          <Grid.Col span={4}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                Contact Information
              </Title>
              <Stack gap="xs">
                {company.contact_name && (
                  <Group wrap="nowrap" gap="xs">
                    <ThemeIcon variant="light" size="sm">
                      <IconUser size={14} />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" color="dimmed">
                        Contact Person
                      </Text>
                      <Text size="sm">{company.contact_name}</Text>
                    </div>
                  </Group>
                )}
                {company.email && (
                  <Group wrap="nowrap" gap="xs">
                    <ThemeIcon variant="light" size="sm">
                      <IconMail size={14} />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" color="dimmed">
                        Email
                      </Text>
                      <Anchor size="sm" href={`mailto:${company.email}`}>
                        {company.email}
                      </Anchor>
                    </div>
                  </Group>
                )}
                {company.contact_number && (
                  <Group wrap="nowrap" gap="xs">
                    <ThemeIcon variant="light" size="sm">
                      <IconPhone size={14} />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" color="dimmed">
                        Phone
                      </Text>
                      <Text size="sm">{company.contact_number}</Text>
                    </div>
                  </Group>
                )}
                {company.website && (
                  <Group wrap="nowrap" gap="xs">
                    <ThemeIcon variant="light" size="sm">
                      <IconWorldWww size={14} />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" color="dimmed">
                        Website
                      </Text>
                      <Anchor
                        size="sm"
                        href={
                          company.website.startsWith("http")
                            ? company.website
                            : `https://${company.website}`
                        }
                        target="_blank"
                      >
                        {company.website}
                      </Anchor>
                    </div>
                  </Group>
                )}
                {company.address && (
                  <Group wrap="nowrap" gap="xs">
                    <ThemeIcon variant="light" size="sm">
                      <IconMapPin size={14} />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" color="dimmed">
                        Address
                      </Text>
                      <Text size="sm">{company.address}</Text>
                    </div>
                  </Group>
                )}
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      )}

      {activeTab === "contract" && (
        <ResumeTab
          resumeUrl={
            company.contract
              ? `https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${company.contract}`
              : ""
          }
        />
      )}
    </Container>
  );
}

export default withAuth(PartnerProfile, ["partner"]);

import React, { useEffect, useState } from "react";
import {
  TextInput,
  Button,
  Container,
  Group,
  Image,
  FileInput,
  Title,
  Divider,
  SimpleGrid,
  Card,
  Center,
  Textarea,
  Stack,
  Box,
  Text,
  Paper,
  Loader,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
  IconBuildingSkyscraper,
  IconPhotoOff,
  IconBrandFacebook,
  IconBrandLinkedin,
  IconWorld,
  IconMail,
  IconPhone,
  IconUser,
  IconCalendar,
  IconFileDescription,
} from "@tabler/icons-react";
import axios from "axios";

const EditPartnerProfile = () => {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>({});

  // Add state for file upload
  const [logoUploading, setLogoUploading] = useState(false);
  const [contractUploading, setContractUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/partner_profile/retrieve_par_profile", {
          withCredentials: true,
        });
        setCompany(res.data);
        setForm({
          ...res.data,
          effective_date: res.data.effective_date ? new Date(res.data.effective_date) : null,
          expiry_date: res.data.expiry_date ? new Date(res.data.expiry_date) : null,
        });
      } catch (error) {
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoUpload = async (file: File | null) => {
    if (!file) return;
    setLogoUploading(true);
    try {
      const uniqueFileName = `${Date.now()}-${file.name}`;
      const { data } = await axios.get("/api/generate_presigned_url", {
        params: {
          fileName: uniqueFileName,
          fileType: file.type,
        },
      });
      await axios.put(data.url, file, {
        headers: { "Content-Type": file.type },
      });
      // Save as "public/filename"
      handleChange("company_logo", `public/${uniqueFileName}`);
    } catch (error) {
      alert("Failed to upload logo.");
    }
    setLogoUploading(false);
  };

  const handleContractUpload = async (file: File | null) => {
    if (!file) return;
    setContractUploading(true);
    try {
      const uniqueFileName = `${Date.now()}-${file.name}`;
      const { data } = await axios.get("/api/generate_presigned_url", {
        params: {
          fileName: uniqueFileName,
          fileType: file.type,
        },
      });
      await axios.put(data.url, file, {
        headers: { "Content-Type": file.type },
      });
      handleChange("contract", `public/${uniqueFileName}`);
    } catch (error) {
      alert("Failed to upload contract.");
    }
    setContractUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare the data as FormData for multer (since your API expects form-data)
    const formData = new FormData();
    // Add all fields from the form state
    Object.entries(form).forEach(([key, value]) => {
      // Convert dates to ISO string if needed
      if (value instanceof Date) {
        formData.append(key, value.toISOString());
      } else if (typeof value === "string" || value instanceof Blob) {
        formData.append(key, value);
      } else if (typeof value === "number" || typeof value === "boolean") {
        formData.append(key, value.toString());
      } else if (value !== undefined && value !== null && typeof value === "object") {
        // Optionally, stringify objects or skip them
        formData.append(key, JSON.stringify(value));
      }
      // Skip undefined or null values
    });

    try {
      const response = await axios.put("/api/edit_partner", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        alert("Partner company profile updated successfully!");
        // Optionally, refresh data or redirect
      }
    } catch (error: any) {
      alert(
        error?.response?.data?.error ||
          "Failed to update partner company profile."
      );
    }
  };

  if (loading) {
    return (
      <Container size="xl" p={15}>
        <Center>
          <Loader />
        </Center>
      </Container>
    );
  }

  if (!company) {
    return (
      <Container size="xl" p={15}>
        <Text color="red">No company data found.</Text>
      </Container>
    );
  }

  return (
    <Container size="xl" p={15}>
      <Paper shadow="xs" p="md" withBorder>
        <Group justify="space-between" align="center" mb="lg">
          <Group>
            <IconBuildingSkyscraper size={32} color="#146a3e" />
            <Title order={2} c="#146a3e">
              Edit Company Profile
            </Title>
          </Group>
        </Group>

        <form onSubmit={handleSubmit}>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <Stack>
              {/* Company Information */}
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Company Information
                </Title>
                <Stack>
                  <TextInput
                    label="Company Name"
                    placeholder="Enter company name"
                    value={form.name || ""}
                    onChange={(e) => handleChange("name", e.target.value)}
                    leftSection={<IconBuildingSkyscraper size={16} />}
                  />
                  <TextInput
                    label="Industry"
                    placeholder="Enter industry"
                    value={form.industry || ""}
                    onChange={(e) => handleChange("industry", e.target.value)}
                    leftSection={<IconWorld size={16} />}
                  />
                  <TextInput
                    label="Website"
                    placeholder="Enter website URL"
                    value={form.website || ""}
                    onChange={(e) => handleChange("website", e.target.value)}
                    leftSection={<IconWorld size={16} />}
                  />
                  <Textarea
                    label="Address"
                    placeholder="Enter company address"
                    value={form.address || ""}
                    onChange={(e) => handleChange("address", e.target.value)}
                    leftSection={<IconWorld size={16} />}
                  />
                </Stack>
              </Card>

              {/* Contact Information */}
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Contact Information
                </Title>
                <Stack>
                  <TextInput
                    label="Contact Name"
                    placeholder="Enter contact person's name"
                    value={form.contact_name || ""}
                    onChange={(e) => handleChange("contact_name", e.target.value)}
                    leftSection={<IconUser size={16} />}
                  />
                  <TextInput
                    label="Contact Number"
                    placeholder="Enter contact number"
                    value={form.contact_number || ""}
                    onChange={(e) => handleChange("contact_number", e.target.value)}
                    leftSection={<IconPhone size={16} />}
                  />
                  <TextInput
                    label="Email"
                    placeholder="Enter email address"
                    value={form.email || ""}
                    onChange={(e) => handleChange("email", e.target.value)}
                    leftSection={<IconMail size={16} />}
                  />
                </Stack>
              </Card>
            </Stack>

            <Stack>
              {/* Company Logo */}
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Company Logo
                </Title>
                <Center mb="md">
                  {form.company_logo ? (
                    <Image
                      src={`https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${form.company_logo}`}
                      alt="Company Logo"
                      width={150}
                      height={150}
                      fit="contain"
                    />
                  ) : (
                    <Box py="xl">
                      <IconPhotoOff size={80} opacity={0.5} />
                      <Text c="dimmed" size="sm" ta="center" mt="xs">
                        No logo uploaded
                      </Text>
                    </Box>
                  )}
                </Center>
                <FileInput
                  placeholder="Upload new logo"
                  accept="image/*"
                  leftSection={<IconFileDescription size={16} />}
                  onChange={handleLogoUpload}
                  disabled={logoUploading}
                />
              </Card>

              {/* Social Media */}
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Social Media
                </Title>
                <Stack>
                  <TextInput
                    label="Facebook"
                    placeholder="Enter Facebook URL"
                    value={form.facebook || ""}
                    onChange={(e) => handleChange("facebook", e.target.value)}
                    leftSection={<IconBrandFacebook size={16} />}
                  />
                  <TextInput
                    label="LinkedIn"
                    placeholder="Enter LinkedIn URL"
                    value={form.linkedin || ""}
                    onChange={(e) => handleChange("linkedin", e.target.value)}
                    leftSection={<IconBrandLinkedin size={16} />}
                  />
                </Stack>
              </Card>

              {/* Contract Information */}
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Contract Information
                </Title>
                <Stack>
                  <DateInput
                    label="Contract Effective Date"
                    placeholder="Select effective date"
                    value={form.effective_date}
                    onChange={(date) => handleChange("effective_date", date)}
                    leftSection={<IconCalendar size={16} />}
                  />
                  <DateInput
                    label="Contract Expiry Date"
                    placeholder="Select expiry date"
                    value={form.expiry_date}
                    onChange={(date) => handleChange("expiry_date", date)}
                    leftSection={<IconCalendar size={16} />}
                  />
                  <FileInput
                    label="Upload New Contract"
                    placeholder="Select new contract file"
                    accept=".pdf,.doc,.docx"
                    leftSection={<IconFileDescription size={16} />}
                    onChange={handleContractUpload}
                    disabled={contractUploading}
                  />
                </Stack>
              </Card>
            </Stack>
          </SimpleGrid>

          {/* Description */}
          <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
            <Title order={4} mb="md">
              Company Description
            </Title>
            <Textarea
              placeholder="Enter company description"
              value={form.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              minRows={4}
            />
          </Card>

          <Group justify="flex-end" mt="xl">
            <Button type="submit" color="green" size="md">
              Save Changes
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
};

export default EditPartnerProfile;

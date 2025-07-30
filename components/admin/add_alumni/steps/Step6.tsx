import React from "react";
import {
  Grid,
  Group,
  Avatar,
  TextInput,
  Divider,
  PasswordInput,
  Title,
} from "@mantine/core";
import { IconZoomCheck } from "@tabler/icons-react";
import SectionHeader from "../SectionHeader";
import DOMPurify from 'isomorphic-dompurify';

const Step6: React.FC<{
  username: string;
  password: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: Date | null;
  gender: string;
  civilStatus: string;
  nationality: string;
  country: string;
  region: string;
  city: string;
  province: string;
  emailAddress: string;
  mobileNumber: string;
  telephoneNumber: string | null;
  department: string;
  yearStarted: string;
  batch: string;
  program: string;
  profilePicture: File | null;
  resume: File | null;
  selectedStatus: string;
  jobtitle: string;
  profsummary: string;
  errorMessage: string | null;
  successMessage: string | null;
}> = ({
  username,
  password,
  firstName,
  middleName,
  lastName,
  dateOfBirth,
  gender,
  civilStatus,
  nationality,
  country,
  region,
  city,
  province,
  emailAddress,
  mobileNumber,
  telephoneNumber,
  department,
  yearStarted,
  batch,
  program,
  profilePicture,
  resume,
  selectedStatus,
  jobtitle,
  profsummary,
  errorMessage,
  successMessage,
}) => {
  const sanitizedProfSummary = DOMPurify.sanitize(profsummary);

  return (
    <div>
      <SectionHeader
        icon={
          <IconZoomCheck style={{ width: 20, height: 20, marginBottom: 5 }} />
        }
        title="Review Your Information"
        description="Please review your information before submitting."
      />

      <Grid>
        <Grid.Col span={{ lg: 3, md: 12, sm: 12 }}>
          <Group justify="center" align="flex-start">
            <Avatar
              src={profilePicture ? URL.createObjectURL(profilePicture) : null}
              alt="Profile Picture"
              size="calc(100% - 20px)"
              radius="xl"
              style={{
                cursor: "pointer",
                aspectRatio: "2 / 2",
                border: "2px solid #f0f0f0",
              }}
            />
          </Group>
        </Grid.Col>

        <Grid.Col span={{ lg: 9, md: 12, sm: 12 }}>
          <Title c="#146a3e" order={5} style={{ marginBottom: "0.5rem" }}>
            Account Information
          </Title>
          <Divider style={{ marginTop: "0.5rem" }} />
          <TextInput label="Username" value={username} readOnly mt="md" />
          <PasswordInput label="Password" value={password} readOnly mt="md" />

          <Title
            c="#146a3e"
            order={5}
            style={{ marginBottom: "0.5rem", marginTop: "4rem" }}
          >
            Personal Information
          </Title>
          <Divider style={{ marginTop: "0.5rem" }} />
          <Grid>
            <Grid.Col span={4}>
              <TextInput
                label="First Name"
                value={firstName}
                readOnly
                mt="md"
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput
                label="Middle Name"
                value={middleName ? middleName : "N/A"}
                readOnly
                mt="md"
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput label="Last Name" value={lastName} readOnly mt="md" />
            </Grid.Col>
          </Grid>
          <TextInput
            label="Date of Birth"
            value={
              dateOfBirth
                ? dateOfBirth.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "N/A"
            }
            readOnly
            mt="md"
          />
          <TextInput label="Gender" value={gender} readOnly mt="md" />
          <TextInput
            label="Civil Status"
            value={civilStatus}
            readOnly
            mt="md"
          />
          <TextInput label="Nationality" value={nationality} readOnly mt="md" />

          <Title
            c="#146a3e"
            order={5}
            style={{ marginBottom: "0.5rem", marginTop: "4rem" }}
          >
            Current Address
          </Title>
          <Divider style={{ marginTop: "0.5rem" }} />

          <TextInput label="Country" value={country} readOnly mt="md" />
          <TextInput label="Region" value={region} readOnly mt="md" />
          <Group grow>
            <TextInput label="Province" value={province} readOnly mt="md" />
            <TextInput label="City" value={city} readOnly mt="md" />
          </Group>

          <Title
            c="#146a3e"
            order={5}
            style={{ marginBottom: "0.5rem", marginTop: "4rem" }}
          >
            Contact Information
          </Title>
          <Divider style={{ marginTop: "0.5rem" }} />
          <TextInput
            label="Email Address"
            value={emailAddress}
            readOnly
            mt="md"
          />
          <TextInput
            label="Mobile Number"
            value={mobileNumber}
            readOnly
            mt="md"
          />
          <TextInput
            label="Telephone Number"
            value={telephoneNumber ?? ""}
            readOnly
            mt="md"
          />

          <Title
            c="#146a3e"
            order={5}
            style={{ marginBottom: "0.5rem", marginTop: "4rem" }}
          >
            Educational Background
          </Title>
          <Divider style={{ marginTop: "0.5rem" }} />
          <TextInput label="Department" value={department} readOnly mt="md" />
          <Group grow>
            <TextInput
              label="Year Started"
              value={yearStarted}
              readOnly
              mt="md"
            />
            <TextInput label="Year Graduated" value={batch} readOnly mt="md" />
          </Group>
          <TextInput label="Program" value={program} readOnly mt="md" />

          <Title
            c="#146a3e"
            order={5}
            style={{ marginBottom: "0.5rem", marginTop: "4rem" }}
          >
            Additional Information
          </Title>
          <Divider style={{ marginTop: "0.5rem" }} />
          <TextInput label="Status" value={selectedStatus} readOnly mt="md" />
          <TextInput label="Job Title" value={jobtitle} readOnly mt="md" />
          <div style={{ marginTop: "1rem" }}>
            <Title c="#146a3e" order={5} style={{ marginBottom: "0.5rem" }}>
              Professional Summary
            </Title>
            <Divider style={{ marginTop: "0.5rem" }} />
            <div
              dangerouslySetInnerHTML={{ __html: sanitizedProfSummary }}
              style={{
                border: "1px solid #ced4da",
                borderRadius: "4px",
                padding: "10px",
                minHeight: "100px",
                backgroundColor: "#f8f9fa",
              }}
            />
          </div>
          <TextInput
            label="Resume"
            value={resume ? resume.name : "Not uploaded"}
            readOnly
            mt="md"
          />
        </Grid.Col>
      </Grid>
    </div>
  );
};

export default Step6;

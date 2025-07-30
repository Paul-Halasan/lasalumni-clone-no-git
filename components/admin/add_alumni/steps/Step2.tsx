import React, { useEffect, useState, useCallback } from "react";
import {
  Grid,
  Group,
  Avatar,
  Button,
  FileInput,
  TextInput,
  Select,
  Radio,
  Title,
  Divider,
  Text,
} from "@mantine/core";
import { IconUserFilled, IconEdit } from "@tabler/icons-react";
import SectionHeader from "../SectionHeader";
import CurrentAddress from "../../../common/UserAddress";

// Constants
const months = Array.from({ length: 12 }, (_, i) => ({
  value: (i + 1).toString(),
  label: new Date(0, i).toLocaleString("default", { month: "long" }),
}));

const days = Array.from({ length: 31 }, (_, i) => ({
  value: (i + 1).toString(),
  label: (i + 1).toString(),
}));

const generateYears = (currentYear: number) =>
  Array.from({ length: currentYear - 1899 }, (_, i) => ({
    value: (1900 + i).toString(),
    label: (1900 + i).toString(),
  }));

const Step2: React.FC<{
  profilePicture: File | null;
  setProfilePicture: (file: File | null) => void;
  firstName: string;
  setFirstName: (value: string) => void;
  middleName: string;
  setMiddleName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  dateOfBirth: Date | null;
  setDateOfBirth: (value: Date | null) => void;
  gender: string;
  setGender: (value: string) => void;
  civilStatus: string;
  setCivilStatus: (value: string) => void;
  nationality: string;
  setNationality: (value: string) => void;
  country: string;
  setCountry: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  province: string;
  setProvince: (value: string) => void;
  region: string;
  setRegion: (value: string) => void;
  currentDate: Date;
  validationError: string | null;
  clearErrorMessage: () => void;
}> = ({
  profilePicture,
  setProfilePicture,
  firstName,
  setFirstName,
  middleName,
  setMiddleName,
  lastName,
  setLastName,
  dateOfBirth,
  setDateOfBirth,
  gender,
  setGender,
  civilStatus,
  setCivilStatus,
  nationality,
  setNationality,
  country,
  setCountry,
  city,
  setCity,
  province,
  setProvince,
  region,
  setRegion,
  currentDate,
  validationError: errorMessage,
  clearErrorMessage,
}) => {
  const [isLargeDevice, setIsLargeDevice] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  // New states for storing IDs

  const years = generateYears(currentDate.getFullYear());

  useEffect(() => {
    const handleResize = () => {
      setIsLargeDevice(window.innerWidth >= 1200);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (selectedMonth && selectedDay && selectedYear) {
      const date = new Date(
        parseInt(selectedYear),
        parseInt(selectedMonth) - 1,
        parseInt(selectedDay)
      );
      setDateOfBirth(date);
      clearErrorMessage();
    }
  }, [
    selectedMonth,
    selectedDay,
    selectedYear,
    setDateOfBirth,
    clearErrorMessage,
  ]);

  useEffect(() => {
    // If dateOfBirth has a value, initialize the select fields
    if (dateOfBirth) {
      setSelectedMonth((dateOfBirth.getMonth() + 1).toString());
      setSelectedDay(dateOfBirth.getDate().toString());
      setSelectedYear(dateOfBirth.getFullYear().toString());
    }
  }, [dateOfBirth]);

  return (
    <div>
      <SectionHeader
        icon={
          <IconUserFilled style={{ width: 20, height: 20, marginBottom: 5 }} />
        }
        title="Personal Information"
        description="Fill in your personal details to continue."
      />

      <Grid>
        <Grid.Col span={{ lg: 3, md: 12, sm: 12 }}>
          <Group mt="md" justify="center">
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

            <div
              style={{
                position: "relative",
                justifyContent: "center",
                display: "flex",
              }}
            >
              <Button
                variant="outline"
                color="#146a3e"
                leftSection={<IconEdit size={16} />}
                style={{ width: "100%" }}
              >
                {profilePicture ? "Change Picture" : "Upload Picture"}
              </Button>
              <FileInput
                accept="image/*"
                onChange={(file) => setProfilePicture(file)}
                style={{
                  opacity: 0,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  cursor: "pointer",
                }}
              />
            </div>
          </Group>
        </Grid.Col>

        <Grid.Col span={{ lg: 9, md: 12, sm: 12 }}>
          <TextInput
            label="First Name"
            placeholder="Enter first name"
            value={firstName}
            onChange={(event) => {
              setFirstName(event.currentTarget.value);
              clearErrorMessage();
            }}
            error={
              errorMessage && errorMessage.includes("First name")
                ? errorMessage
                : undefined
            }
            required
            mt="md"
          />
          <TextInput
            label="Middle Name"
            placeholder="Enter middle name"
            value={middleName}
            onChange={(event) => setMiddleName(event.currentTarget.value)}
            mt="md"
          />
          <TextInput
            label="Last Name"
            placeholder="Enter last name"
            value={lastName}
            onChange={(event) => {
              setLastName(event.currentTarget.value);
              clearErrorMessage();
            }}
            error={
              errorMessage && errorMessage.includes("Last name")
                ? errorMessage
                : undefined
            }
            required
            mt="md"
          />

          <Title
            c="#146a3e"
            order={5}
            style={{ marginBottom: "0.5rem", marginTop: "4rem" }}
          >
            Basic Information
          </Title>
          <Divider style={{ marginTop: "0.5rem" }} />

          <Grid>
            <Grid.Col span={{ lg: 2, md: 12, sm: 12 }}>
              <Radio.Group
                mt="md"
                label="Gender"
                value={gender}
                onChange={(value) => {
                  setGender(value);
                  // Only clear the error if it's specifically a gender error
                  if (errorMessage && errorMessage.includes("Gender")) {
                    clearErrorMessage();
                  }
                }}
                required
                error={
                  errorMessage && errorMessage.includes("Gender")
                    ? errorMessage
                    : null
                }
              >
                {isLargeDevice ? (
                  <>
                    <Radio value="Male" label="Male" mt="md" />
                    <Radio value="Female" label="Female" mt="sm" />
                  </>
                ) : (
                  <Group>
                    <Radio value="Male" label="Male" mt="md" />
                    <Radio value="Female" label="Female" mt="sm" />
                  </Group>
                )}
              </Radio.Group>
            </Grid.Col>
            <Grid.Col span={{ lg: 10, md: 12, sm: 12 }}>
              <Text mt="md" mb="sm" fw={500} size="sm">
                Date of Birth
              </Text>

              <Group grow>
                <Select
                  label="MM"
                  placeholder="Select month"
                  value={selectedMonth}
                  onChange={(value) => setSelectedMonth(value)}
                  data={months}
                  required
                  error={
                    errorMessage && errorMessage.includes("Date of birth")
                      ? errorMessage
                      : undefined
                  }
                />
                <Select
                  label="DD"
                  placeholder="Select day"
                  value={selectedDay}
                  onChange={(value) => setSelectedDay(value)}
                  data={days}
                  required
                  error={
                    errorMessage && errorMessage.includes("Date of birth")
                      ? errorMessage
                      : undefined
                  }
                />
                <Select
                  label="YYYY"
                  placeholder="Select year"
                  value={selectedYear}
                  onChange={(value) => setSelectedYear(value)}
                  data={years}
                  required
                  error={
                    errorMessage && errorMessage.includes("Date of birth")
                      ? errorMessage
                      : undefined
                  }
                />
              </Group>
              <Divider mb="sm" mt="lg" />
              <Select
                label="Civil Status"
                placeholder="Select civil status"
                value={civilStatus}
                onChange={(value) => {
                  setCivilStatus(value || "");
                  // Only clear civil status errors
                  if (errorMessage && errorMessage.includes("Civil status")) {
                    clearErrorMessage();
                  }
                }}
                data={[
                  { value: "Single", label: "Single" },
                  { value: "Married", label: "Married" },
                  { value: "Widowed", label: "Widowed" },
                  { value: "Separated", label: "Separated" },
                  { value: "Divorced", label: "Divorced" },
                ]}
                required
                mt="md"
                error={
                  errorMessage && errorMessage.includes("Civil status")
                    ? errorMessage
                    : undefined
                }
              />
              <TextInput
                label="Nationality"
                placeholder="Enter nationality"
                value={nationality}
                onChange={(event) => {
                  setNationality(event.currentTarget.value);
                  // Only clear nationality errors
                  if (errorMessage && errorMessage.includes("Nationality")) {
                    clearErrorMessage();
                  }
                }}
                error={
                  errorMessage && errorMessage.includes("Nationality")
                    ? errorMessage
                    : undefined
                }
                required
                mt="md"
              />
            </Grid.Col>
          </Grid>

          <Title
            c="#146a3e"
            order={5}
            style={{ marginBottom: "0.5rem", marginTop: "4rem" }}
          >
            Current Address
          </Title>
          <Divider style={{ marginTop: "0.5rem" }} />

          <CurrentAddress
            country={country}
            setCountry={setCountry}
            region={region}
            setRegion={setRegion}
            province={province}
            setProvince={setProvince}
            city={city}
            setCity={setCity}
            clearErrorMessage={clearErrorMessage}
          />
        </Grid.Col>
      </Grid>
    </div>
  );
};

export default Step2;

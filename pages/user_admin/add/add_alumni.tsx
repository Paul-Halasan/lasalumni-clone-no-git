import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Flex,
  Stack,
  Group,
  Button,
  Alert,
  Stepper,
  Title,
  Text,
  Divider,
  TextInput,
  Modal,
} from "@mantine/core";
import {
  IconKey,
  IconUser,
  IconAddressBook,
  IconSchool,
  IconClipboard,
  IconZoomCheck,
} from "@tabler/icons-react";
import axios from "axios";
import withAuth from "../../../components/withAuth";
import * as XLSX from "xlsx";
import { notifications } from "@mantine/notifications";
import { getServerTime } from "../../../utils/getServerTime";

import Step1 from "../../../components/admin/add_alumni/steps/Step1";
import Step2 from "../../../components/admin/add_alumni/steps/Step2";
import Step3 from "../../../components/admin/add_alumni/steps/Step3";
import Step4 from "../../../components/admin/add_alumni/steps/Step4";
import Step5 from "../../../components/admin/add_alumni/steps/Step5";
import Step6 from "../../../components/admin/add_alumni/steps/Step6";

const AdminHomePage = () => {
  const [opened, setOpened] = useState(false);
  const [active, setActive] = useState(0);
  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  const [validationError, setValidationError] = useState<string | null>(null);

  const [isLargeDevice, setIsLargeDevice] = useState(false);
  const [value, setValue] = useState("");
  const [userID, setUserID] = useState(null);

  // Account Information
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");
  const [usertype, setUsertype] = useState("");

  // Personal Information
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");

  const [country, setCountry] = useState("");
  const [region, setRegion] = useState(""); //new
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [gender, setGender] = useState("");
  const [civilStatus, setCivilStatus] = useState("");
  const [nationality, setNationality] = useState("");

  // Contact Information
  const [mobileNumber, setMobileNumber] = useState("");
  const [telephoneNumber, setTelephoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [fbLink, setFbLink] = useState(""); // <-- Add this
  const [linkedinLink, setLinkedinLink] = useState(""); // <-- Add this
  const [generatedCode, setGeneratedCode] = useState("");
  const [userEnteredCode, setUserEnteredCode] = useState("");

  // Educational Background
  const [yearStarted, setYearStarted] = useState("");
  const [batch, setBatch] = useState("");
  const school = "De La Salle University Dasmariñas";
  const [department, setDepartment] = useState("");
  const [program, setProgram] = useState("");
  const [filteredPrograms, setFilteredPrograms] = useState<string[]>([]);

  // Additional Documents
  const [resume, setResume] = useState<File | null>(null);
  const [selectedStatus, setSelectedStatus] = useState(""); //new
  const [jobtitle, setJobTitle] = useState(""); //new
  const [profsummary, setProfSummary] = useState(""); //new

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [importErrors, setImportErrors] = useState<any[]>([]); // State to hold import errors

  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Updated nextStep function with inline validation
  const nextStep = () => {
    let isValid = false;
    let errorMessage = "";

    switch (active) {
      case 0: // Account Information
        if (!username) {
          errorMessage = "Username is required";
        } else if (!password) {
          errorMessage = "Password is required";
        } else if (!confirmpassword) {
          errorMessage = "Confirm password is required";
        } else if (password !== confirmpassword) {
          errorMessage =
            "The confirmation password does not match the entered password. Please ensure both passwords are identical.";
        } else {
          isValid = true;
        }
        break;

      case 1: // Personal Information
        if (!firstName) {
          errorMessage = "First name is required";
        } else if (!lastName) {
          errorMessage = "Last name is required";
        } else if (!dateOfBirth) {
          errorMessage = "Date of birth is required";
        } else if (!gender) {
          errorMessage = "Gender is required";
        } else if (!civilStatus) {
          errorMessage = "Civil status is required";
        } else if (!nationality) {
          errorMessage = "Nationality is required";
        } else if (!country) {
          errorMessage = "Country is required";
        } else if (!region) {
          errorMessage = "Region is required";
        } else if (!city) {
          errorMessage = "City is required";
        } else if (!province) {
          errorMessage = "Province is required";
        } else {
          isValid = true;
        }
        break;

      case 2: // Contact Information
        if (!emailAddress) {
          errorMessage = "Email address is required";
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(emailAddress)) {
            errorMessage = "Invalid email address format";
          } else if (!mobileNumber) {
            errorMessage = "Mobile number is required";
          } else if (!userEnteredCode) {
            errorMessage = "Confirmation code is required";
          } else if (userEnteredCode !== generatedCode) {
            errorMessage = "Invalid confirmation code";
          } else {
            isValid = true;
          }
        }
        break;

      case 3: // Educational Background
        if (!yearStarted) {
          errorMessage = "Year started is required";
        } else if (!department) {
          errorMessage = "Department is required";
        } else if (!program) {
          errorMessage = "Program is required";
        } else if (!batch) {
          errorMessage = "Batch is required";
        } else {
          isValid = true;
        }
        break;

      case 4: // Additional Documents - no required fields
        isValid = true;
        break;

      default:
        errorMessage = "Invalid step";
    }

    if (isValid) {
      setActive((current) => (current < 5 ? current + 1 : current));
      setValidationError(null);
    } else {
      setValidationError(errorMessage);
    }
  };

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
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue =
        "You have unsaved changes. Are you sure you want to leave?";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    getServerTime("datetime")
      .then((datetime) => setCurrentDate(new Date(datetime)))
      .catch(() => setCurrentDate(new Date()));
  }, []);

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const profilePictureFileName = profilePicture
      ? `${Date.now()}-${profilePicture.name}`
      : null;
    const resumeFileName = resume ? `${Date.now()}-${resume.name}` : null;

    try {
      // Get presigned URL for profile picture
      if (profilePicture) {
        const {
          data: { url: profilePictureUrl },
        } = await axios.get(
          `/api/generate_presigned_url?fileName=${profilePictureFileName}&fileType=${profilePicture.type}`
        );
        await axios.put(profilePictureUrl, profilePicture, {
          headers: {
            "Content-Type": profilePicture.type,
          },
        });
      }

      // Get presigned URL for resume
      if (resume) {
        const {
          data: { url: resumeUrl },
        } = await axios.get(
          `/api/generate_presigned_url?fileName=${resumeFileName}&fileType=${resume.type}`
        );
        await axios.put(resumeUrl, resume, {
          headers: {
            "Content-Type": resume.type,
          },
        });
      }

      // Submit form data to backend
      const formData = {
        username,
        password,
        usertype,
        firstName,
        middleName,
        lastName,
        dateOfBirth: dateOfBirth
          ? new Date(dateOfBirth).toISOString().split("T")[0]
          : "",
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
        yearStarted,
        batch,
        school,
        department,
        program,
        profilePictureFileName,
        resumeFileName,
        selectedStatus,
        jobtitle,
        profsummary,
        fbLink,        // <-- Add this
        linkedinLink,  // <-- Add this
      };

      const response = await axios.post("/api/admin_crud/add_alumni", formData);

      if (response.status === 200) {
        setSuccessMessage("User added successfully");
        setErrorMessage(null);
        setPassword("");
        setConfirmPassword("");
        setYearStarted("");
        setUsertype("");
        setMobileNumber("");
        setTelephoneNumber("");
        setEmailAddress("");
        setCountry("");
        setCity("");
        setProvince("");
        setDateOfBirth(null);
        setGender("");
        setCivilStatus("");
        setNationality("");
        setProfilePicture(null);
        setDepartment("");
        setBatch("");
        setDateOfBirth(null);
        setProgram("");
        setResume(null);
        setUserID(response.data.userID);
        setActive(6);
        setOpened(true);
      } else {
        setErrorMessage(response.data.error);
        setSuccessMessage(null);
      }
    } catch (error) {
      console.error(
        "Error uploading data:",
        (error as any).response?.data || (error as any).message
      );
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.error ||
            "An error occurred while uploading data"
        );
      } else {
        setErrorMessage("An error occurred while uploading data");
      }
      setSuccessMessage(null);
    }
  };

  const clearErrorMessage = () => {
    setValidationError(null);
  };

  const handleCreateAnother = () => {
    setActive(0); // Reset to the first step
    setUserID(null);
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setUsername("");
    setErrorMessage(null);
    setSuccessMessage(null);
    setOpened(false); // Close the modal
  };

  const renderStepContent = () => {
    return (
      <form onSubmit={handleFormSubmit}>
        {(() => {
          switch (active) {
            case 0:
              return (
                <Container size="md">
                  <Step1
                    username={username}
                    setUsername={setUsername}
                    password={password}
                    setPassword={setPassword}
                    confirmpassword={confirmpassword}
                    setConfirmPassword={setConfirmPassword}
                    usertype={usertype}
                    setUsertype={setUsertype}
                    validationError={validationError}
                    clearErrorMessage={clearErrorMessage}
                    setValidationError={setValidationError}
                  />
                </Container>
              );

            case 1:
              return (
                <Container size="md">
                  <Step2
                    profilePicture={profilePicture}
                    setProfilePicture={setProfilePicture}
                    firstName={firstName}
                    setFirstName={setFirstName}
                    middleName={middleName}
                    setMiddleName={setMiddleName}
                    lastName={lastName}
                    setLastName={setLastName}
                    dateOfBirth={dateOfBirth}
                    setDateOfBirth={setDateOfBirth}
                    gender={gender}
                    setGender={setGender}
                    civilStatus={civilStatus}
                    setCivilStatus={setCivilStatus}
                    nationality={nationality}
                    setNationality={setNationality}
                    country={country}
                    setCountry={setCountry}
                    region={region}
                    setRegion={setRegion}
                    city={city}
                    setCity={setCity}
                    province={province}
                    setProvince={setProvince}
                    currentDate={currentDate}
                    validationError={validationError}
                    clearErrorMessage={clearErrorMessage}
                  />
                </Container>
              );

            case 2:
              return (
                <Container size="md">
                  <Step3
                    mobileNumber={mobileNumber}
                    setMobileNumber={setMobileNumber}
                    telephoneNumber={telephoneNumber}
                    setTelephoneNumber={setTelephoneNumber}
                    emailAddress={emailAddress}
                    setEmailAddress={setEmailAddress}
                    fbLink={fbLink} // <-- Add this
                    setFbLink={setFbLink} // <-- Add this
                    linkedinLink={linkedinLink} // <-- Add this
                    setLinkedinLink={setLinkedinLink} // <-- Add this
                    validationError={validationError}
                    clearErrorMessage={clearErrorMessage}
                    generatedCode={generatedCode}
                    setGeneratedCode={setGeneratedCode}
                    userEnteredCode={userEnteredCode}
                    setUserEnteredCode={setUserEnteredCode}
                  />
                </Container>
              );

            case 3:
              return (
                <Container size="md">
                  <Step4
                    yearStarted={yearStarted}
                    setYearStarted={setYearStarted}
                    department={department}
                    setDepartment={setDepartment}
                    program={program}
                    setProgram={setProgram}
                    batch={batch}
                    setBatch={setBatch}
                    filteredPrograms={filteredPrograms}
                    setFilteredPrograms={setFilteredPrograms}
                    validationError={validationError}
                    clearErrorMessage={clearErrorMessage}
                  />
                </Container>
              );

            case 4:
              return (
                <Container size="md">
                  <Step5
                    resume={resume || new File([], "")}
                    setResume={setResume}
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                    jobtitle={jobtitle}
                    setJobtitle={setJobTitle}
                    profsummary={profsummary} // new
                    setProfSummary={setProfSummary} // new
                  />
                </Container>
              );

            case 5:
              return (
                <Container size="md">
                  <Step6
                    username={username}
                    password={password}
                    firstName={firstName}
                    middleName={middleName}
                    lastName={lastName}
                    dateOfBirth={
                      dateOfBirth ? new Date(dateOfBirth) : new Date()
                    }
                    gender={gender}
                    civilStatus={civilStatus}
                    nationality={nationality}
                    country={country}
                    region={region} // new
                    city={city}
                    province={province}
                    emailAddress={emailAddress}
                    mobileNumber={mobileNumber}
                    telephoneNumber={telephoneNumber}
                    department={department}
                    yearStarted={yearStarted}
                    batch={batch}
                    program={program}
                    selectedStatus={selectedStatus} // new
                    jobtitle={jobtitle} // new
                    profsummary={profsummary} // new
                    profilePicture={profilePicture}
                    resume={resume}
                    errorMessage={errorMessage}
                    successMessage={successMessage}
                  />
                </Container>
              );
          }
        })()}
        <Container>
          {" "}
          {active < 6 && (
            <Group justify="flex-end" mt={30}>
              <Button variant="default" onClick={prevStep}>
                Back
              </Button>
              {active < 5 ? (
                <Button onClick={nextStep} color="#146a3e">
                  Next step
                </Button>
              ) : (
                <>
                  <Button type="submit" color="#146a3e">
                    Submit
                  </Button>
                  {errorMessage && (
                    <Alert mt={15} color="red">
                      {errorMessage}
                    </Alert>
                  )}
                  {successMessage && (
                    <Alert mt={15} color="teal">
                      {successMessage}
                    </Alert>
                  )}
                </>
              )}
            </Group>
          )}
        </Container>
      </form>
    );
  };

  return (
    <>
      <Container
        size="xl"
        style={{
          borderRadius: 8,
          display: "flex",
          flexDirection: "column",
        }}
        bg={"white"}
        p={15}
      >
        <Group justify="apart" align="center" mb={15}>
          <Title order={4} c={"#146a3e"} pt={15} pb={25} pl={15}>
            Add New Alumni User
          </Title>
          <Button
            color="blue"
            onClick={() => document.getElementById("xlsx-upload")?.click()}
          >
            Import .xlsx
          </Button>
          <input
            type="file"
            id="xlsx-upload"
            accept=".xlsx"
            style={{ display: "none" }}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (file) {
                try {
                  // Get pre-signed URL from the backend
                  const { data } = await axios.get("/api/generate_presigned_url", {
                    params: {
                      fileName: file.name,
                      fileType: file.type,
                    },
                  });

                  const { url } = data;

                  // Upload the file directly to S3 using the pre-signed URL
                  await axios.put(url, file, {
                    headers: {
                      "Content-Type": file.type,
                    },
                  });

                  // Parse the .xlsx file
                  const reader = new FileReader();
                  reader.onload = async (e) => {
                    try {
                      const data = new Uint8Array(e.target?.result as ArrayBuffer);
                      const workbook = XLSX.read(data, { type: "array" });
                      const sheetName = workbook.SheetNames[0];
                      const sheet = workbook.Sheets[sheetName];
                      const jsonData = XLSX.utils.sheet_to_json(sheet);

                      console.log("Parsed JSON Data:", jsonData); // Debugging: Log parsed data

                      // Send parsed data to the backend for database insertion
                      const response = await axios.post("/api/process_xlsx_data", {
                        fileUrl: url.split("?")[0], // Remove query params to get the S3 file URL
                        data: jsonData,
                      });

                      if (response.status === 200) {
                        notifications.show({
                          title: "Success",
                          message: "Data imported successfully!",
                          color: "green",
                          autoClose: false, // Disable auto-close
                          withCloseButton: true, // Add a close button
                        });
                      }
                    } catch (error) {
                      if (axios.isAxiosError(error) && error.response?.status === 400) {
                        const { errors } = error.response.data;

                        // Format the error details for display
                        const errorDetails = errors
                          .map((err: any) => `Row ${err.row}: ${err.error}`)
                          .join("\n");

                        notifications.show({
                          title: "Error",
                          message: `Failed to process some rows:\n${errorDetails}`,
                          color: "red",
                          autoClose: false, // Disable auto-close
                          withCloseButton: true, // Add a close button
                        });

                        console.error("Errors:", errors);
                        setImportErrors(errors); // Save errors to state for display
                      } else {
                        console.error("Error parsing or sending data:", error);
                        notifications.show({
                          title: "Error",
                          message: "An error occurred while parsing or sending the data.",
                          color: "red",
                          autoClose: false, // Disable auto-close
                          withCloseButton: true, // Add a close button
                        });
                      }
                    }
                  };
                  reader.readAsArrayBuffer(file);
                } catch (error) {
                  console.error("Error uploading or processing file:", error);
                  notifications.show({
                    title: "Error",
                    message: "An error occurred while uploading or processing the file.",
                    color: "red",
                    autoClose: false, // Disable auto-close
                    withCloseButton: true, // Add a close button
                  });
                }
              }
            }}
          />
        </Group>
        <Divider size={"sm"} style={{ width: "100%" }} />
        <Grid
          mt={15}
          style={{
            height: "100%", // Ensures the column takes full height
          }}
        >
          <Grid.Col
            p={15}
            bg="white"
            span={{ lg: 3, md: 12, sm: 12 }}
            style={{
              height: "100%", // Ensures the column takes full height
            }}
          >
            <Stepper
              color="#146a3e"
              size="sm"
              orientation={isLargeDevice ? "vertical" : "horizontal"}
              active={active}
              onStepClick={setActive}
              allowNextStepsSelect={false}
              style={{
                padding: isLargeDevice ? "15px" : "10px",
              }}
            >
              <Stepper.Step
                label={isLargeDevice ? "Account Information" : undefined}
                description={
                  isLargeDevice ? "Enter your username and password" : undefined
                }
                icon={<IconKey style={{ width: 20, height: 20 }} />}
              />
              <Stepper.Step
                label={isLargeDevice ? "Personal Information" : undefined}
                description={
                  isLargeDevice ? "Fill in your personal details" : undefined
                }
                icon={<IconUser style={{ width: 20, height: 20 }} />}
              />
              <Stepper.Step
                label={isLargeDevice ? "Contact Information" : undefined}
                description={
                  isLargeDevice
                    ? "Provide your contact numbers and email"
                    : undefined
                }
                icon={<IconAddressBook style={{ width: 20, height: 20 }} />}
              />
              <Stepper.Step
                label={isLargeDevice ? "Educational Background" : undefined}
                description={
                  isLargeDevice ? "Detail your academic history" : undefined
                }
                icon={<IconSchool style={{ width: 20, height: 20 }} />}
              />
              <Stepper.Step
                label={isLargeDevice ? "Additional Information" : undefined}
                description={
                  isLargeDevice ? "Upload necessary documents" : undefined
                }
                icon={<IconClipboard style={{ width: 20, height: 20 }} />}
              />
              <Stepper.Step
                label={isLargeDevice ? "Review and Submit" : undefined}
                description={
                  isLargeDevice ? "Confirm your details and submit" : undefined
                }
                icon={<IconZoomCheck style={{ width: 20, height: 20 }} />}
              />
            </Stepper>
          </Grid.Col>

          <Grid.Col
            span={{ lg: "auto", md: 12, sm: 12 }}
            bg={"white"}
            style={{
              height: "100%",
              borderLeft: "2px solid #f0f0f0",
            }}
          >
            <Flex
              justify="center"
              align="flex-start"
              style={{
                width: "100%",
                height: "100%",
              }}
            >
              <Stack
                align="stretch"
                justify="space-between"
                style={{
                  padding: isLargeDevice ? "15px" : "10px",
                  width: "100%",
                }}
              >
                {renderStepContent()}
              </Stack>
            </Flex>
          </Grid.Col>
        </Grid>
      </Container>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Alumni Registration Success"
      >
        <Container
          fluid
          size="xs"
          p={30}
          style={{
            borderStyle: "solid",
            borderColor: "Green",
            flex: 1,
            width: "100%",
            borderRadius: 10,
          }}
        >
          <Text ta="center" size="xl" fw={700} c="#146a3e">
            Success!
          </Text>
          <Text ta="center" mt="md" size="md">
            You are now officially a part of the DLSU-D Alumni Community! Thank
            you for signing up. Please take note of your user ID and username
            for future reference.
          </Text>

          <Divider my="lg" />

          <Group justify="center">
            <TextInput
              label="User ID"
              value={userID || ""}
              readOnly
              variant="filled"
              style={{ width: "100%" }}
            />
            <TextInput
              label="Full Name"
              value={`${firstName} ${middleName} ${lastName}`}
              readOnly
              variant="filled"
              style={{ width: "100%" }}
            />
            <TextInput
              label="Username"
              value={username}
              readOnly
              variant="filled"
              style={{ width: "100%" }}
            />
          </Group>

          <Group justify="center" mt="xl">
            <Button color="#146a3e" onClick={handleCreateAnother}>
              Create Another User
            </Button>
          </Group>
        </Container>
      </Modal>
    </>
  );
};

export default withAuth(AdminHomePage, ["admin"]);

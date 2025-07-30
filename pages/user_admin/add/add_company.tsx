import React, { useState, useEffect } from "react";
import {
  TextInput,
  FileInput,
  Button,
  Container,
  Group,
  Alert,
  Title,
  Divider,
  Grid,
  Stepper,
  Text,
  Flex,
  Stack,
  Avatar,
  PasswordInput,
  Center,
  Box,
  Select,
} from "@mantine/core";

import {
  IconBuilding,
  IconKey,
  IconZoomCheck,
  IconEdit,
  IconAddressBook,
  IconCheck,
  IconX,
  IconContract,
  IconBrandFacebook,
  IconBrandLinkedin,
  IconBrowser,
} from "@tabler/icons-react";
import { DateInput } from "@mantine/dates";
import axios from "axios";
import withAuth from "../../../components/withAuth";
import SectionHeader from "../../../components/admin/add_alumni/SectionHeader";
import RichTextEditor from "../../../components/common/richtextbox";
import CurrentAddress from "../../../components/common/UserAddress";
import { BaseDemo } from "../../../components/common/dropfiles";
import { PasswordStrength } from "../../../components/admin/add_alumni/PasswordStrength";

const AddPartnerCompany = () => {
  const [isLargeDevice, setIsLargeDevice] = useState(false);
  const [active, setActive] = useState(0);
  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  const nextStep = () => {
    if (active === 3) {
      // Assuming step 4 is the review step
      const newCombinedAddress = `${address}, ${city}, ${province}, ${region}, ${country}`;
      setAddress(newCombinedAddress); // Update the address state
    }
    setActive((current) => (current < 5 ? current + 1 : current));
  };

  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [industry, setIndustry] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [contract, setContract] = useState<File | null>(null);
  const [effectiveDate, setEffectiveDate] = useState<Date | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [facebook, setFacebook] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [username, setUsername] = useState(""); // Added state for username
  const [password, setPassword] = useState(""); // Added state for password
  const [confirmpassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [country, setCountry] = useState("");
  const [region, setRegion] = useState(""); //new
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");

  const [validationError, setValidationError] = useState<string | null>(null);
  const clearErrorMessage = () => {
    setValidationError(null);
  };

  const checkUsername = async (username: string) => {
    console.log("Checking username:", username); // Log the username being checked
    try {
      const response = await fetch("/api/admin_crud/checkusername", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();
      console.log("Response from server:", data); // Log the response from the server

      if (response.status === 400) {
        console.error("Bad Request:", data); // Log the error details
        setValidationError(data.error);
      } else {
        setValidationError(null);
      }
    } catch (error) {
      console.error("Error checking username:", error); // Log any errors
      setValidationError("Error checking username");
    }
  };

  const PasswordRequirement = ({
    meets,
    label,
  }: {
    meets: boolean;
    label: string;
  }) => {
    return (
      <Text component="div" c={meets ? "teal" : "red"} mt={5} size="sm">
        <Center inline>
          {meets ? (
            <IconCheck size="0.9rem" stroke={1.5} />
          ) : (
            <IconX size="0.9rem" stroke={1.5} />
          )}
          <Box ml={7}>{label}</Box>
        </Center>
      </Text>
    );
  };

  const validatePasswords = () => {
    if (password !== confirmpassword) {
      setValidationError("Passwords do not match");
    } else {
      setValidationError(null);
    }
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const companyLogoFileName = companyLogo
      ? `${Date.now()}-${companyLogo.name}`
      : null;
    const contractFileName = contract ? `${Date.now()}-${contract.name}` : null;

    try {
      // Get presigned URL for company logo
      if (companyLogo) {
        const {
          data: { url: companyLogoUrl },
        } = await axios.get(
          `/api/generate_presigned_url?fileName=${companyLogoFileName}&fileType=${companyLogo.type}`
        );
        await axios.put(companyLogoUrl, companyLogo, {
          headers: {
            "Content-Type": companyLogo.type,
          },
        });
      }

      // Get presigned URL for contract
      if (contract) {
        const {
          data: { url: contractUrl },
        } = await axios.get(
          `/api/generate_presigned_url?fileName=${contractFileName}&fileType=${contract.type}`
        );
        await axios.put(contractUrl, contract, {
          headers: {
            "Content-Type": contract.type,
          },
        });
      }

      // Submit form data to backend
      const formData = {
        name,
        website,
        industry,
        address,
        description,
        contactNumber,
        email,
        contactName,
        facebook,
        linkedin,
        username,
        password,
        effectiveDate: effectiveDate
          ? new Date(effectiveDate).toISOString().split("T")[0]
          : "",
        expiryDate: expiryDate
          ? new Date(expiryDate).toISOString().split("T")[0]
          : "",
        companyLogoFileName,
        contractFileName,
        country,
        region,
        city,
        province,
      };

      const response = await axios.post("/api/add_company", formData);

      if (response.status === 200) {
        setSuccessMessage("Partner company added successfully");
        setErrorMessage(null);
        // Reset fields after success
        setName("");
        setWebsite("");
        setCompanyLogo(null);
        setIndustry("");
        setAddress("");
        setDescription("");
        setContract(null);
        setEffectiveDate(null);
        setExpiryDate(null);
        setContactNumber("");
        setEmail("");
        setContactName("");
        setFacebook("");
        setLinkedin("");
        setUsername(""); // Reset username
        setPassword(""); // Reset password
      } else {
        setErrorMessage(response.data.error);
        setSuccessMessage(null);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error uploading data:",
          error.response?.data || error.message
        );
        setErrorMessage(
          error.response?.data?.error ||
            "An error occurred while uploading data"
        );
      } else {
        console.error("Error uploading data:", error);
        setErrorMessage("An error occurred while uploading data");
      }
      setSuccessMessage(null);
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

  const validateStep = () => {
    switch (active) {
      case 0:
        return name && industry;
      case 1:
        return (
          contactName &&
          contactNumber &&
          address &&
          email &&
          country &&
          region &&
          city &&
          province
        );
      case 2:
        return effectiveDate && expiryDate;
      case 3:
        return (
          username &&
          password &&
          confirmpassword &&
          password === confirmpassword
        );
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    return (
      <form onSubmit={handleFormSubmit}>
        {(() => {
          switch (active) {
            case 0:
              return (
                <Container size="md">
                  <SectionHeader
                    icon={
                      <IconBuilding
                        style={{ width: 20, height: 20, marginBottom: 5 }}
                      />
                    }
                    title="Company Information"
                    description="Please fill in the company information below"
                  />
                  <Grid>
                    <Grid.Col span={{ lg: 3, md: 12, sm: 12 }}>
                      <Group justify="center">
                        <Avatar
                          src={
                            companyLogo
                              ? URL.createObjectURL(companyLogo)
                              : "https://www.diabetes.ie/wp-content/uploads/2021/05/logo-Placeholder.jpg"
                          }
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
                            {companyLogo ? "Change Picture" : "Upload Logo"}
                          </Button>
                          <FileInput
                            accept="image/*"
                            onChange={(file) => setCompanyLogo(file)}
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
                      <Title
                        c="#146a3e"
                        order={5}
                        style={{ marginBottom: "0.5rem" }}
                      >
                        Primary Information
                      </Title>
                      <Divider style={{ marginTop: "0.5rem" }} />

                      <TextInput
                        label="Company Name"
                        placeholder="Enter company name"
                        value={name}
                        onChange={(event) => setName(event.currentTarget.value)}
                        required
                        mt="md"
                      />
                      <Select
                        label="Industry"
                        placeholder="Select industry"
                        value={industry}
                        onChange={(value) => setIndustry(value || "")}
                        required
                        data={[
                          { value: "Technology", label: "Technology" },
                          { value: "Finance", label: "Finance" },
                          { value: "Healthcare", label: "Healthcare" },
                          { value: "Education", label: "Education" },
                          { value: "Manufacturing", label: "Manufacturing" },
                          { value: "Retail", label: "Retail" },
                          { value: "Sports", label: "Sports" },
                          {
                            value: "Hospitality & Tourism",
                            label: "Hospitality & Tourism",
                          },
                          {
                            value: "Media & Entertainment",
                            label: "Media & Entertainment",
                          },
                          {
                            value: "Agriculture & Resources",
                            label: "Agriculture & Resources",
                          },
                          {
                            value: "Construction & Real Estate",
                            label: "Construction & Real Estate",
                          },
                          {
                            value: "Energy & Utilities",
                            label: "Energy & Utilities",
                          },
                          {
                            value: "Transportation & Logistics",
                            label: "Transportation & Logistics",
                          },
                          {
                            value: "Government & Public Service",
                            label: "Government & Public Service",
                          },
                          {
                            value: "Professional Services",
                            label: "Professional Services",
                          },
                          {
                            value: "Nonprofit & Social Services",
                            label: "Nonprofit & Social Services",
                          },
                          { value: "Other", label: "Other" },
                        ]}
                        mt="md"
                      />

                      <TextInput
                        leftSection={<IconBrowser size="1.2rem" />}
                        label="Website"
                        placeholder="Enter company website link"
                        value={website}
                        onChange={(event) =>
                          setWebsite(event.currentTarget.value)
                        }
                        mt="md"
                      />

                      <Group grow>
                        <TextInput
                          leftSection={<IconBrandFacebook size="1.2rem" />}
                          label="Facebook"
                          placeholder="Enter Facebook page"
                          value={facebook}
                          onChange={(event) =>
                            setFacebook(event.currentTarget.value)
                          }
                          mt="md"
                        />
                        <TextInput
                          leftSection={<IconBrandLinkedin size="1.2rem" />}
                          label="LinkedIn"
                          placeholder="Enter LinkedIn profile"
                          value={linkedin}
                          onChange={(event) =>
                            setLinkedin(event.currentTarget.value)
                          }
                          mt="md"
                        />
                      </Group>

                      <Title
                        c="#146a3e"
                        order={5}
                        style={{ marginBottom: "0.5rem", marginTop: "4rem" }}
                      >
                        Company Description
                      </Title>
                      <Divider mb="md" style={{ marginTop: "0.5rem" }} />
                      <RichTextEditor
                        content={description}
                        setContent={setDescription}
                      />
                    </Grid.Col>
                  </Grid>
                </Container>
              );

            case 1:
              return (
                <Container size="md">
                  <SectionHeader
                    icon={
                      <IconAddressBook
                        style={{ width: 20, height: 20, marginBottom: 5 }}
                      />
                    }
                    title="Contact Information"
                    description="Provide the company's contact numbers and contract information"
                  />

                  <Title
                    c="#146a3e"
                    order={5}
                    style={{ marginBottom: "0.5rem" }}
                  >
                    Contact Information
                  </Title>
                  <Divider style={{ marginTop: "0.5rem" }} />

                  <TextInput
                    label="Contact Name"
                    placeholder="Enter contact name"
                    value={contactName}
                    onChange={(event) =>
                      setContactName(event.currentTarget.value)
                    }
                    required
                    mt="md"
                  />

                  <TextInput
                    label="Contact Number"
                    placeholder="Enter contact number"
                    value={contactNumber}
                    onChange={(event) =>
                      setContactNumber(event.currentTarget.value)
                    }
                    required
                    mt="md"
                  />
                  <TextInput
                    label="Email"
                    placeholder="Enter contact email"
                    value={email}
                    onChange={(event) => setEmail(event.currentTarget.value)}
                    required
                    mt="md"
                  />

                  <Text
                    size="sm"
                    fw={600}
                    style={{ marginBottom: "0.5rem", marginTop: "4rem" }}
                  >
                    Company Address <span style={{ color: "red" }}>*</span>
                  </Text>

                  <Divider style={{ marginTop: "0.5rem" }} />

                  <Group grow justify="space-between" align="center">
                    <Text c="dimmed" fw={700} size="sm">
                      {" "}
                      ADDRESS LINE 1
                    </Text>
                    <TextInput
                      placeholder="Enter company address"
                      value={address}
                      onChange={(event) =>
                        setAddress(event.currentTarget.value)
                      }
                      mt="md"
                    />
                  </Group>

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
                </Container>
              );

            case 2:
              return (
                <Container size="md">
                  <SectionHeader
                    icon={
                      <IconContract
                        style={{ width: 20, height: 20, marginBottom: 5 }}
                      />
                    }
                    title="Contract Information"
                    description="Provide the company's contact numbers and contract information"
                  />

                  <Title
                    c="#146a3e"
                    order={5}
                    style={{ marginBottom: "0.5rem" }}
                  >
                    Contract Information
                  </Title>
                  <Divider style={{ marginTop: "0.5rem" }} />

                  <DateInput
                    label="Effective Date"
                    placeholder="Select effective date"
                    value={effectiveDate}
                    onChange={(value) => setEffectiveDate(value)}
                    mt="md"
                    required
                  />
                  <DateInput
                    label="Expiry Date"
                    placeholder="Select expiry date"
                    value={expiryDate}
                    onChange={(value) => setExpiryDate(value)}
                    mt="md"
                  />

                  <Title c="#146a3e" order={5} mt="xl">
                    Upload Contract File
                  </Title>
                  <Divider my="md" />
                  <BaseDemo setResume={setContract} />

                  <FileInput
                    label="Uploaded Contract"
                    placeholder="Your uploaded resume file name will appear here"
                    accept="application/pdf"
                    onChange={(file) => setContract(file)}
                    value={contract}
                    mt="md"
                  />
                </Container>
              );

            case 3:
              return (
                <Container size="md">
                  <SectionHeader
                    icon={
                      <IconKey
                        style={{ width: 20, height: 20, marginBottom: 5 }}
                      />
                    }
                    title="Account Credentials"
                    description="Provide the company's contact numbers and contract information"
                  />

                  <TextInput
                    label="Username"
                    placeholder="Enter username"
                    value={username}
                    required
                    mt="md"
                    onChange={(event) => {
                      setUsername(event.currentTarget.value);
                      clearErrorMessage();
                      checkUsername(event.currentTarget.value);
                    }}
                    error={
                      validationError && validationError.includes("Username")
                        ? validationError
                        : undefined
                    }
                  />

                  <Group mt="md" grow align="flex-start">
                    <PasswordStrength
                      value={password}
                      onChange={(value) => {
                        setPassword(value);
                        clearErrorMessage();
                        validatePasswords();
                      }}
                    />

                    <Stack>
                      <PasswordInput
                        label="Confirm Password"
                        placeholder="Confirm password"
                        value={confirmpassword}
                        required
                        onChange={(event) => {
                          setConfirmPassword(event.currentTarget.value);
                          clearErrorMessage();
                          validatePasswords();
                        }}
                        error={
                          errorMessage &&
                          errorMessage.includes("The confirmation password")
                            ? errorMessage
                            : undefined
                        }
                      />
                      {confirmpassword && (
                        <PasswordRequirement
                          meets={password === confirmpassword}
                          label="Passwords match"
                        />
                      )}
                    </Stack>
                  </Group>
                </Container>
              );

            case 4:
              return (
                <Container size="md">
                  <SectionHeader
                    icon={
                      <IconZoomCheck
                        style={{ width: 20, height: 20, marginBottom: 5 }}
                      />
                    }
                    title="Review and Submit"
                    description="Review all the information before submitting"
                  />
                  <Title
                    c="#146a3e"
                    order={5}
                    style={{ marginBottom: "0.5rem" }}
                  >
                    Company Information
                  </Title>
                  <Divider style={{ marginTop: "0.5rem" }} />
                  <Text>Company Name: {name}</Text>
                  <Text>Industry: {industry}</Text>
                  <Text>Website: {website}</Text>
                  <Text>Facebook: {facebook}</Text>
                  <Text>LinkedIn: {linkedin}</Text>
                  <Text>Description: {description}</Text>

                  <Title
                    c="#146a3e"
                    order={5}
                    style={{ marginBottom: "0.5rem", marginTop: "2rem" }}
                  >
                    Contact Information
                  </Title>
                  <Divider style={{ marginTop: "0.5rem" }} />
                  <Text>Contact Name: {contactName}</Text>
                  <Text>Contact Number: {contactNumber}</Text>
                  <Text>Email: {email}</Text>
                  <Text>Address: {address}</Text>
                  <Text>Country: {country}</Text>
                  <Text>Region: {region}</Text>
                  <Text>City: {city}</Text>
                  <Text>Province: {province}</Text>

                  <Title
                    c="#146a3e"
                    order={5}
                    style={{ marginBottom: "0.5rem", marginTop: "2rem" }}
                  >
                    Contract Information
                  </Title>
                  <Divider style={{ marginTop: "0.5rem" }} />
                  <Text>
                    Effective Date: {effectiveDate?.toLocaleDateString()}
                  </Text>
                  <Text>Expiry Date: {expiryDate?.toLocaleDateString()}</Text>
                  <Text>
                    Contract:{" "}
                    {contract ? contract.name : "No contract uploaded"}
                  </Text>

                  <Title
                    c="#146a3e"
                    order={5}
                    style={{ marginBottom: "0.5rem", marginTop: "2rem" }}
                  >
                    Account Credentials
                  </Title>
                  <Divider style={{ marginTop: "0.5rem" }} />
                  <Text>Username: {username}</Text>
                </Container>
              );
          }
        })()}
        <Container>
          {" "}
          {active < 5 && (
            <Group justify="flex-end" mt={30}>
              <Button variant="default" onClick={prevStep}>
                Back
              </Button>
              {active < 4 ? (
                <Button
                  variant="light"
                  color="#146a3e"
                  onClick={nextStep}
                  disabled={!validateStep()}
                >
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
        }}
        bg={"white"}
        p={15}
      >
        <Title order={4} c={"#146a3e"} pt={15} pb={25} pl={15}>
          Add New Partner Company User
        </Title>

        <Divider size="sm" style={{ width: "100%", marginBottom: "20px" }} />

        <Grid>
          <Grid.Col p={15} span={{ lg: 3, md: 12, sm: 12 }}>
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
                label={isLargeDevice ? "Company Information" : undefined}
                description={
                  isLargeDevice
                    ? "Please fill in the company information below"
                    : undefined
                }
                icon={<IconBuilding style={{ width: 20, height: 20 }} />}
              />

              <Stepper.Step
                label={isLargeDevice ? "Contact Information" : undefined}
                description={
                  isLargeDevice
                    ? "Provide the company's main contact information"
                    : undefined
                }
                icon={<IconAddressBook style={{ width: 20, height: 20 }} />}
              />

              <Stepper.Step
                label={isLargeDevice ? "Contract Information" : undefined}
                description={
                  isLargeDevice
                    ? "Provide the duration of the contract and upload the contract file"
                    : undefined
                }
                icon={<IconContract style={{ width: 20, height: 20 }} />}
              />

              <Stepper.Step
                label={isLargeDevice ? "Account Credentials" : undefined}
                description={
                  isLargeDevice ? "Enter your username and password" : undefined
                }
                icon={<IconKey style={{ width: 20, height: 20 }} />}
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
    </>
  );
};

export default withAuth(AddPartnerCompany, ["admin"]);

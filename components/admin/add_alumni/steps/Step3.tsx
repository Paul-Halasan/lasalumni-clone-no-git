// components/steps/Step3.tsx
// Contact Information
import React, { useState, useEffect } from "react";
import { TextInput, Button, Group, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  IconAddressBook,
  IconCheck,
  IconX,
  IconLockOpen,
  IconBrandFacebook,
  IconBrandLinkedin,
} from "@tabler/icons-react";
import SectionHeader from "../SectionHeader";

const Step3: React.FC<{
  emailAddress: string;
  setEmailAddress: (value: string) => void;
  mobileNumber: string;
  setMobileNumber: (value: string) => void;
  telephoneNumber: string;
  setTelephoneNumber: (value: string) => void;
  fbLink: string;
  setFbLink: (value: string) => void;
  linkedinLink: string;
  setLinkedinLink: (value: string) => void;
  validationError: string | null;
  clearErrorMessage: () => void;
  generatedCode: string;
  setGeneratedCode: (value: string) => void;
  userEnteredCode: string;
  setUserEnteredCode: (value: string) => void;
  isEmailVerified?: boolean;
  setIsEmailVerified?: (value: boolean) => void;
}> = ({
  emailAddress,
  setEmailAddress,
  mobileNumber,
  setMobileNumber,
  telephoneNumber,
  setTelephoneNumber,
  fbLink,
  setFbLink,
  linkedinLink,
  setLinkedinLink,
  validationError: errorMessage,
  clearErrorMessage,
  generatedCode,
  setGeneratedCode,
  userEnteredCode,
  setUserEnteredCode,
  isEmailVerified: propIsEmailVerified,
  setIsEmailVerified: propSetIsEmailVerified,
}) => {
  const [emailStatus, setEmailStatus] = useState("");
  const [isVerified, setIsVerified] = useState(propIsEmailVerified || false);

  // Check localStorage for verification status on component mount
  useEffect(() => {
    const savedVerificationStatus = localStorage.getItem(
      `email_verified_${emailAddress}`
    );
    if (savedVerificationStatus === "true" && !isVerified) {
      setIsVerified(true);
      if (propSetIsEmailVerified) {
        propSetIsEmailVerified(true);
      }
    }
  }, [emailAddress, isVerified, propSetIsEmailVerified]);

  // Update localStorage and parent component state when verification status changes
  useEffect(() => {
    if (isVerified && emailAddress) {
      localStorage.setItem(`email_verified_${emailAddress}`, "true");
      if (propSetIsEmailVerified) {
        propSetIsEmailVerified(true);
      }
    }
  }, [isVerified, emailAddress, propSetIsEmailVerified]);

  const sendConfirmationCode = async () => {
    try {
      // Fetch the confirmation code from the API
      const codeResponse = await fetch("/api/generate_confcode");
      const codeData = await codeResponse.json();
      const generatedCode = codeData.confirmationCode;

      // Set the generated confirmation code in the state
      setGeneratedCode(generatedCode);

      // Send the email with the confirmation code
      const response = await fetch("/api/sendmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: emailAddress,
          subject: "Your Confirmation Code (from LASALUMNI CONNECT)",
          text: `Your confirmation code is: ${generatedCode}. Please enter this code in the confirmation code field to verify your email address.`,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setEmailStatus("Email sent successfully");

        showNotification({
          title: "Code Sent Successfully",
          message: `The confirmation code has been sent to ${emailAddress}. Please check your email.`,
          color: "green",
          icon: <IconCheck size={16} />,
          autoClose: 5000,
        });
      } else {
        setEmailStatus(`Failed to send email: ${data.message}`);

        showNotification({
          title: "Failed to Send Email",
          message: data.message || "An error occurred when sending the email.",
          color: "red",
          icon: <IconX size={16} />,
          autoClose: 5000,
        });
      }
    } catch (error) {
      setEmailStatus("Failed to send email");

      showNotification({
        title: "Error",
        message: "Failed to send the confirmation code. Please try again.",
        color: "red",
        icon: <IconX size={16} />,
        autoClose: 5000,
      });
    }
  };

  const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enteredCode = event.currentTarget.value;
    setUserEnteredCode(enteredCode);

    const codeIsVerified = enteredCode === generatedCode;
    if (codeIsVerified && !isVerified) {
      // Only show notification when verification status changes from false to true
      showNotification({
        title: "Email Verified",
        message: "Your email has been successfully verified!",
        color: "green",
        icon: <IconCheck size={16} />,
        autoClose: 3000,
      });
      setIsVerified(true);
    }
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = event.currentTarget.value;
    setEmailAddress(newEmail);
    clearErrorMessage();

    // If email changes, check if it's already verified
    const savedVerificationStatus = localStorage.getItem(
      `email_verified_${newEmail}`
    );
    if (savedVerificationStatus === "true") {
      setIsVerified(true);
      if (propSetIsEmailVerified) {
        propSetIsEmailVerified(true);
      }
    } else {
      setIsVerified(false);
      if (propSetIsEmailVerified) {
        propSetIsEmailVerified(false);
      }
    }
  };

  return (
    <div>
      <SectionHeader
        icon={
          <IconAddressBook style={{ width: 20, height: 20, marginBottom: 5 }} />
        }
        title="Contact Information"
        description="Please provide your contact numbers and email address."
      />
      <TextInput
        label="Email Address"
        placeholder="Enter email address"
        value={emailAddress}
        onChange={handleEmailChange}
        required
        mt="md"
        disabled={isVerified}
        rightSection={
          isVerified ? <IconLockOpen size={16} color="green" /> : undefined
        }
        error={
          errorMessage &&
          (errorMessage.includes("Invalid email address format") ||
            errorMessage.includes("Email address is required"))
            ? errorMessage
            : undefined
        }
      />

      {!isVerified ? (
        <>
          <Group mt="md" align="flex-end">
            <TextInput
              label="Confirmation Code"
              placeholder="Enter confirmation code"
              value={userEnteredCode}
              onChange={handleCodeChange}
              required
              style={{ flexGrow: 1 }}
            />
            <Button
              variant="light"
              color="#146a3e"
              onClick={sendConfirmationCode}
              style={{ marginBottom: 1 }}
            >
              Send Confirmation Code
            </Button>
          </Group>

          {userEnteredCode && !isVerified && (
            <Text color="red" size="sm" mt={5}>
              Code Not Verified
            </Text>
          )}
        </>
      ) : (
        <Text color="green" size="sm" mt={5} mb={10} w={500}>
          <IconCheck size={16} style={{ marginRight: 5, marginBottom: -2 }} />
          Email Verified
        </Text>
      )}

      {emailStatus && !isVerified && (
        <Text size="sm" mt={5}>
          {emailStatus}
        </Text>
      )}

      <TextInput
        label="Mobile Number"
        placeholder="Enter mobile number"
        value={mobileNumber}
        onChange={(event) => {
          setMobileNumber(event.currentTarget.value);
          clearErrorMessage();
        }}
        required
        mt="md"
        error={
          errorMessage && errorMessage.includes("Mobile number")
            ? errorMessage
            : undefined
        }
      />

      <TextInput
        label="Telephone Number"
        placeholder="Enter telephone number"
        value={telephoneNumber}
        onChange={(event) => setTelephoneNumber(event.currentTarget.value)}
        mt="md"
      />

      <TextInput
        label={
          <span>
            <IconBrandFacebook
              size={16}
              style={{ marginRight: 5, marginBottom: -3 }}
            />
            Facebook Link
          </span>
        }
        placeholder="https://facebook.com/yourprofile"
        value={fbLink}
        onChange={(event) => setFbLink(event.currentTarget.value)}
        mt="md"
        required={false}
      />

      <TextInput
        label={
          <span>
            <IconBrandLinkedin
              size={16}
              style={{ marginRight: 5, marginBottom: -3 }}
            />
            LinkedIn Link
          </span>
        }
        placeholder="https://linkedin.com/in/yourprofile"
        value={linkedinLink}
        onChange={(event) => setLinkedinLink(event.currentTarget.value)}
        mt="md"
        required={false}
      />
    </div>
  );
};

export default Step3;

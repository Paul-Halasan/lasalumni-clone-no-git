import React, { useEffect, useState } from "react";
import {
  TextInput,
  PasswordInput,
  Text,
  Box,
  Center,
  Group,
  Stack,
} from "@mantine/core";
import { IconKeyFilled, IconCheck, IconX } from "@tabler/icons-react";
import SectionHeader from "../SectionHeader";
import { PasswordStrength } from "../PasswordStrength";

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

const Step1: React.FC<{
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmpassword: string;
  setConfirmPassword: (value: string) => void;
  usertype: string;
  setUsertype: (value: string) => void;
  validationError: string | null;
  clearErrorMessage: () => void;
  setValidationError: (value: string | null) => void;
}> = ({
  username,
  setUsername,
  password,
  setPassword,
  confirmpassword,
  setConfirmPassword,
  usertype,
  setUsertype,
  validationError: errorMessage,
  clearErrorMessage,
  setValidationError,
}) => {
  useEffect(() => {
    setUsertype("alumni");
  }, [setUsertype]);

  const validatePasswords = () => {
    if (password !== confirmpassword) {
      setValidationError("Passwords do not match");
    } else {
      setValidationError(null);
    }
  };

  const checkUsername = async (username: string) => {
    try {
      const response = await fetch("/api/admin_crud/checkusername", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();
      if (response.status === 400) {
        setValidationError(data.error);
      } else {
        setValidationError(null);
      }
    } catch (error) {
      setValidationError("Error checking username");
    }
  };

  return (
    <div>
      <SectionHeader
        icon={
          <IconKeyFilled style={{ width: 20, height: 20, marginBottom: 5 }} />
        }
        title="Account Information"
        description="This will serve as your account credentials."
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
          errorMessage && errorMessage.includes("Username")
            ? errorMessage
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
              errorMessage && errorMessage.includes("The confirmation password")
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
    </div>
  );
};

export default Step1;

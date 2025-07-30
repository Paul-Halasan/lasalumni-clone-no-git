// components/steps/Step4.tsx
// Education Background
import React, { useEffect } from "react";
import { NumberInput, Select, Text, Flex } from "@mantine/core";
import { IconSchool } from "@tabler/icons-react";
import SectionHeader from "../SectionHeader";
import { getServerTime } from "../../../../utils/getServerTime";

interface Step4Props {
  yearStarted: string;
  setYearStarted: (value: string) => void;
  batch: string;
  setBatch: (value: string) => void;
  department: string;
  setDepartment: (value: string) => void;
  program: string;
  setProgram: (value: string) => void;
  filteredPrograms: string[];
  setFilteredPrograms: (value: string[]) => void;
  validationError: string | null;
  clearErrorMessage: () => void;
}

const programs: { [key: string]: string[] } = {
  CBAA: [
    "Bachelor of Science in Accountancy",
    "Bachelor of Science in Management Accounting",
    "Bachelor of Science in Entrepreneurship with Specialization in Food Entrepreneurship",
    "Bachelor of Science in Entrepreneurship with Specialization in Agripreneurship",
    "Bachelor of Science in Business Administration Major in Business and Operations Management with Specialization Track in Business Analytics",
    "Bachelor of Science in Business Administration Major in Business Economics",
    "Bachelor of Science in Business Administration Major in Human Resource Development with Specialization Track in Business Analytics",
    "Bachelor of Science in Business Administration Major in Marketing Management with Specialization in Business Analytics",
    "Bachelor of Science in Business Administration major in Marketing Management with Specialization in Integrated Marketing Communications",
  ],
  CCJE: ["BS in Criminology", "Bachelor of Forensic Science"],
  COEd: [
    "Bachelor of Early Childhood Education",
    "Bachelor of Special Needs Education",
    "Bachelor of Secondary Education",
    "Bachelor of Physical Education",
    "Certificate in Teaching Program",
    "Certificate in Teaching Values Education",
    "Certificate in Sign Language",
    "Certificate in Teaching Early Childhood Learners",
  ],
  CEAT: [
    "Bachelor of Science in Architecture",
    "Bachelor of Science in Civil Engineering",
    "Bachelor of Science in Computer Engineering",
    "Bachelor of Science in Electrical Engineering",
    "Bachelor of Science in Electronics Engineering",
    "Bachelor of Science in Industrial Engineering",
    "Bachelor of Science in Mechanical Engineering",
    "Bachelor of Science in Sanitary Engineering",
    "Bachelor of Multimedia Arts",
  ],
  CLAC: [
    "Bachelor of Arts in Communication",
    "Bachelor of Arts in Digital and Multimedia Journalism",
    "Bachelor of Arts in Philosophy",
    "Bachelor of Arts in Political Science",
    "Bachelor of Arts in International Development",
    "Bachelor of Arts in Psychology",
    "Bachelor of Science in Psychology",
  ],
  COS: [
    "Bachelor of Science in Biology with specialization in Medical Biology (3 year compressed program)",
    "Bachelor of Science in Biology with specialization in Medical Biology",
    "Bachelor of Science in Biology with specialization in Microbiology",
    "Bachelor of Science in Biology with specialization in Cell and Molecular Biology",
    "Bachelor of Science in Biology with specialization in Plant Biology",
    "Bachelor of Science in Biology with specialization in Animal Biology",
    "Bachelor of Science in Biology with specialization in Environmental Science",
    "Bachelor of Science in Applied Mathematics"
  ],
  CICS: [
    "Bachelor of Science in Computer Science",
    "Bachelor of Science in Information Technology",
  ],
  CTHM: [
    "Bachelor of Science in Hospitality Management",
    "Bachelor of Science in Tourism Management",
  ],
};

import { useState } from "react";

const Step4: React.FC<Step4Props> = ({
  yearStarted,
  setYearStarted,
  batch,
  setBatch,
  department,
  setDepartment,
  program,
  setProgram,
  filteredPrograms,
  setFilteredPrograms,
  validationError: errorMessage,
  clearErrorMessage,
}) => {
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    getServerTime("year").then(setCurrentYear).catch(() => {});
  }, []);

  useEffect(() => {
    if (department) {
      setFilteredPrograms(programs[department] || []);
    } else {
      setFilteredPrograms([]);
    }
  }, [department, setFilteredPrograms]);

  return (
    <div>
      <SectionHeader
        icon={<IconSchool style={{ width: 20, height: 20, marginBottom: 5 }} />}
        title="Education Background"
        description="Provide your academic history to continue."
      />

      <Flex
        mih={50}
        gap="md"
        justify="flex-start"
        align="center"
        direction="row"
        wrap="wrap"
        style={{ width: "100%" }}
      >
        <NumberInput
          label="Year Started"
          placeholder="Enter batch"
          value={yearStarted ? parseInt(yearStarted, 10) : undefined}
          min={1975}
          max={currentYear}
          onChange={(value) => {
            setYearStarted(value ? value.toString() : "");
            clearErrorMessage();
          }}
          required
          mt="md"
          style={{ flex: 1 }}
          error={
            errorMessage === "Year started is required"
              ? errorMessage
              : undefined
          }
        />

        <Text mt="xl">-</Text>

        <NumberInput
          label="Year Graduated"
          placeholder="Enter batch"
          value={batch ? parseInt(batch, 10) : undefined}
          min={yearStarted ? parseInt(yearStarted, 10) : 1975}
          max={currentYear}
          onChange={(value) => {
            setBatch(value ? value.toString() : "");
            clearErrorMessage();
          }}
          required
          mt="md"
          style={{ flex: 1 }}
          disabled={!yearStarted}
          error={
            errorMessage === "Batch is required" ? errorMessage : undefined
          }
        />
      </Flex>

      <Select
        label="Department"
        placeholder="Select department"
        value={department}
        onChange={(value) => {
          setDepartment(value || "");
          setProgram("");
        }}
        data={[
          {
            value: "CBAA",
            label: "College of Business Administration and Accountancy",
          },
          { value: "CCJE", label: "College of Criminal Justice Education" },
          { value: "COEd", label: "College of Education" },
          {
            value: "CEAT",
            label: "College of Engineering, Architecture and Technology",
          },
          { value: "CLAC", label: "College of Liberal Arts and Communication" },
          { value: "COS", label: "College of Science" },
          {
            value: "CTHM",
            label: "College of Tourism and Hospitality Management",
          },
        ]}
        mt="md"
        required
        error={
          errorMessage === "Department is required" ? errorMessage : undefined
        }
      />

      {department && (
        <Select
          label="Program"
          placeholder="Select program"
          value={program}
          onChange={(value) => {
            setProgram(value || "");
            clearErrorMessage();
          }}
          data={filteredPrograms.map((prog) => ({
            value: prog,
            label: prog,
          }))}
          mt="md"
          required
          error={
            errorMessage === "Program is required" ? errorMessage : undefined
          }
        />
      )}
    </div>
  );
};

export default Step4;

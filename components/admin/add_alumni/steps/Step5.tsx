import React from "react";
import { BaseDemo } from "../../../common/dropfiles";
import {
  FileInput,
  Title,
  Divider,
  Select,
  TextInput,
  Tooltip,
  Group,
  ActionIcon,
} from "@mantine/core";
import SectionHeader from "../SectionHeader";
import { IconScript, IconInfoSmall } from "@tabler/icons-react";
import RichTextEditor from "../../../common/richtextbox";

const Step5: React.FC<{
  resume: File | null;
  setResume: (file: File | null) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  jobtitle: string;
  setJobtitle: (jobtitle: string) => void;
  profsummary: string; // new
  setProfSummary: (summary: string) => void; // new
}> = ({
  resume,
  setResume,
  selectedStatus,
  setSelectedStatus,
  jobtitle,
  setJobtitle,
  profsummary, // new
  setProfSummary, // new
}) => {
  return (
    <div>
      <SectionHeader
        icon={<IconScript style={{ width: 20, height: 20, marginBottom: 5 }} />}
        title="Additional Information"
        description="To improve discoverability for our partner companies, please provide the requested information below."
      />
      <Title c="#146a3e" order={5}>
        Career Information
      </Title>
      <Divider my="sm" />

      <TextInput
        label="Job Profession"
        placeholder="Enter your job profession"
        value={jobtitle}
        onChange={(event) => {
          setJobtitle(event.currentTarget.value);
        }}
        required
        mt="md"
      />

      <Select
        label="Current Job Status"
        placeholder="Select employment status"
        value={selectedStatus}
        onChange={(value) => value && setSelectedStatus(value)}
        data={[
          { value: "Employed", label: "Employed" },
          { value: "Actively Seeking", label: "Actively Seeking" },
          { value: "Not Looking", label: "Not Looking" },
        ]}
        required
        mt="md"
        mb="xl"
      />

      <Group justify="space-between">
        <Title c="#146a3e" order={5}>
          Professional Summary
        </Title>
        <Tooltip
          label="Provide a brief summary of your professional background and experience."
          position="left"
          offset={5}
        >
          <ActionIcon
            variant="outline"
            radius="xl"
            aria-label="prof summary tooltip"
            style={{
              borderColor: "#146a3e",
            }}
            size="md"
          >
            <IconInfoSmall color="#146a3e" stroke={2} size={100} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Divider my="sm" />

      <RichTextEditor content={profsummary} setContent={setProfSummary} />

      <Title c="#146a3e" order={5} mt="xl">
        Resume
      </Title>
      <Divider my="md" />
      <BaseDemo setResume={setResume} />

      <FileInput
        mt={"md"}
        label="Uploaded Resume"
        placeholder="Your uploaded resume file name will appear here"
        accept="application/pdf"
        onChange={(file) => {
          setResume(file);
        }}
        value={resume}
        clearable
        disabled
      />
    </div>
  );
};

export default Step5;

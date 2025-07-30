import {
  Group,
  Stack,
  Flex,
  Card,
  Text,
  CardProps as MantineCardProps,
  Image,
  ActionIcon,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import styles from "./JobCard.module.css";
import { notifications } from "@mantine/notifications";
import axios from "axios";

interface CardProps extends MantineCardProps {
  jobimage?: string;
  companyname?: string;
  joblocation?: string;
  jobtitle?: string;
  salary?: string;
  isApplied?: boolean;
  onClick?: () => void;
  onApply?: (jobId: number) => void; // Pass jobId to parent
  job_id: number; // Add job_id prop
}

export function JobCard({
  jobimage,
  jobtitle,
  companyname,
  joblocation,
  salary,
  isApplied = false,
  onClick,
  onApply,
  job_id,
  ...props
}: CardProps) {
  const [isFavorite, setIsFavorite] = useState(isApplied);

  useEffect(() => {
    setIsFavorite(isApplied); // Sync state with prop
  }, [isApplied]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    if (isApplied || isFavorite) return; // Prevent clicking if already applied
    e.stopPropagation();
    applyForJob(); // Call applyForJob when the heart icon is clicked
  };

  const formatSalary = (salary: string): string => {
    const numericSalary = parseFloat(salary.replace(/[^0-9.-]+/g, ""));
    return numericSalary.toLocaleString("en-US", {
      style: "decimal",
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    });
  };

  const [loading, setLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(isApplied); // Initialize with isApplied


  const applyForJob = async () => {
    setLoading(true);
    try {
      await axios.post("/api/alumni_apply_job", { job_id });
      notifications.show({
        title: "Success",
        message: "You have successfully applied for the job!",
        color: "green",
      });
      setIsFavorite(true); // Update local state
      onApply?.(job_id); // Notify parent component
    } catch (error) {
      console.error("Error applying for job:", error);
      notifications.show({
        title: "Error",
        message:
          (error as any).response?.data?.error ||
          "Failed to apply for the job.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      shadow="xs"
      p="md"
      radius="md"
      withBorder
      className={styles.jobCard}
      onClick={onClick}
      {...props}
    >
      <Group justify="space-between">
        <Flex>
          <Image
            src={jobimage}
            radius="md"
            height={40} // Set height for icon size
            width={40} // Set width for icon size
            fit="contain"
            alt="Job Icon" // Add alt text for accessibility
          />
        </Flex>
        <ActionIcon
          variant="subtle"
          size="md"
          color="#146a3e"
          onClick={handleFavoriteClick}
          disabled={isApplied || isFavorite || loading} // Disable if already applied or loading
        >
          {isFavorite ? (
            <IconHeartFilled size="1.3rem" color="red" />
          ) : (
            <IconHeart size="1.3rem" />
          )}
        </ActionIcon>
      </Group>

      <Stack gap="sm">
        {jobtitle && (
          <Text size="lg" fw="500" mt="lg">
            {jobtitle}
          </Text>
        )}

        <Stack gap={0}>
          {companyname && (
            <Text size="md" lh="xs" maw={250}>
              {companyname}
            </Text>
          )}

          {joblocation && (
            <Text color="dimmed" size="md">
              {joblocation}
            </Text>
          )}
        </Stack>
      </Stack>

      {salary && (
        <Text size="xl" color="dimmed" mt="lg">
          <span style={{ fontWeight: 700, color: "#146a3e" }}>
            PHP {formatSalary(salary)}
          </span>
          <span style={{ fontSize: 16 }}>/month</span>
        </Text>
      )}
    </Card>
  );
}

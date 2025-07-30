import React from "react";
import { Card, Image, Text, Stack, Box, AspectRatio } from "@mantine/core";
import { IconBuilding } from "@tabler/icons-react";
import DOMPurify from "dompurify";

interface CompanyCardProps {
  imageUrl?: string;
  companyName: string;
  description?: string;
  onClick: () => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({
  imageUrl,
  companyName,
  description,
  onClick,
}) => {
  const defaultImageUrl =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/M%C3%BCnster,_LVM,_B%C3%BCrogeb%C3%A4ude_--_2013_--_5149-51.jpg/800px-M%C3%BCnster,_LVM,_B%C3%BCrogeb%C3%A4ude_--_2013_--_5149-51.jpg";
  const sanitizedDescription = description
    ? DOMPurify.sanitize(description)
    : "No description available";

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      h={300}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        },
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      <Box>
        <AspectRatio ratio={16 / 9} maw={200} mx="auto" mb="md">
          <Image
            src={imageUrl || defaultImageUrl}
            alt={companyName}
            fit="contain"
            style={{ backgroundColor: "#f8f9fa" }}
            onError={(e) => {
              e.currentTarget.onerror = null; // prevents looping
              e.currentTarget.src = defaultImageUrl;
            }}
          />
        </AspectRatio>
        <Text size="lg" fw={700} ta="center">
          {companyName}
        </Text>
      </Box>

      <Stack justify="flex-end" style={{ flexGrow: 1 }} mt={0}>
        <Text
          size="sm"
          color="dimmed"
          ta="center"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
        />
      </Stack>
    </Card>
  );
};

export default CompanyCard;

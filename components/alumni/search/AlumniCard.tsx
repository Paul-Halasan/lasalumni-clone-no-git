import { Card, Text, Avatar, Stack, Button } from "@mantine/core";
import PropTypes from "prop-types";

interface AlumniCardProps {
  profilepicture: string;
  name: string;
  batch: string;
  jobProfession: string;
  department: string;
  course: string;
  userID: string;
}

const AlumniCard: React.FC<AlumniCardProps> = ({
  name,
  batch,
  profilepicture,
  jobProfession,
  department,
  course,
  userID,
}) => {
  const coverPhoto =
    "https://saidelicious.wordpress.com/wp-content/uploads/2014/11/10805739_10204969548736453_4863886623279628539_n.jpg"; // Uniform cover photo URL

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{ display: "flex", flexDirection: "column", width: "100%" }}
    >
      {/* Cover Photo */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "120px",
          backgroundImage: `url(${coverPhoto})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "8px 8px 0 0",
        }}
      >
        <Avatar
          size={120}
          radius={120}
          src={profilepicture}
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "50%",
            transform: "translateX(-50%)",
            border: "4px solid white",
          }}
        />
      </div>

      {/* Content */}
      <Stack
        align="center"
        style={{
          flexGrow: 1,
          width: "100%",
          paddingTop: "80px",
          paddingBottom: "20px",
        }}
      >
        {/* Name */}
        <Text
          size="lg"
          ta="center"
          fw="700"
          style={{
            width: "273px",
            maxHeight: "15px", // Set consistent height
            marginBottom: "0", // Remove bottom margin
          }}
        >
          {name}
        </Text>

        {/* Job Profession */}
        <Text
          size="md"
          c="#146a3e"
          fw="500"
          ta="center"
          style={{
            width: "100%",
            maxHeight: "15px", // Set consistent height
            marginTop: "0", // Remove top margin
          }}
        >
          {jobProfession}
        </Text>

        {/* Batch */}
        <Text
          size="sm"
          c="dimmed"
          ta="center"
          mt="sm"
          style={{
            width: "100%",
            maxHeight: "10px", // Set consistent height
          }}
        >
          Class of {batch}
        </Text>

        {/* Department and Course */}
        <Text
          size="sm"
          c="dimmed"
          ta="center"
          style={{
            width: "100%",
            maxHeight: "25px", // Set consistent height
          }}
        >
          {department} | {course}
        </Text>

        {/* View Profile Button */}
        <Button
          component="a"
          href={`?page=user-profile&userID=${userID}`}
          bg="#146a3e"
          c="white"
          style={{
            width: "80%",
            maxHeight: "40px",
            marginTop: "40px",
          }}
        >
          View Profile
        </Button>
      </Stack>
    </Card>
  );
};

AlumniCard.propTypes = {
  name: PropTypes.string.isRequired,
  batch: PropTypes.string.isRequired,
  profilepicture: PropTypes.string.isRequired,
  jobProfession: PropTypes.string.isRequired,
  department: PropTypes.string.isRequired,
  course: PropTypes.string.isRequired,
  userID: PropTypes.string.isRequired,
};

export default AlumniCard;

import React, { useState, useEffect, useMemo } from "react";
import withAuth from "../../../components/withAuth";
import AlumniCard from "../../../components/alumni/search/AlumniCard";
import {
  Container,
  Title,
  Text,
  Divider,
  Stack,
  SimpleGrid,
  Center,
  TextInput,
  Select,
  Grid,
  Skeleton,
  Button,
} from "@mantine/core";
import { IconSchool, IconSearch, IconFilterX } from "@tabler/icons-react";

const SearchAlumniPage = () => {
  interface User {
    userName: string;
    userType: string;
    last_login: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    city: string;
    email_address: string;
    telephone_number: string;
    profile_picture?: string;
    batch: string;
    department: string;
    userID: string;
    resume?: string;
    newProfilePicture?: File | null;
    newResume?: File | null;

    alumniProfile?: {
      first_name: string;
      last_name: string;
      date_of_birth: string;
      city: string;
      email_address: string;
      telephone_number: string;
      profile_picture?: string;
      batch: string;
      department: string;
      resume?: string;
      country: string;
      program: string;
      job_profession: string;
    };
  }

  // State for all alumni data fetched once
  const [allAlumni, setAllAlumni] = useState<User[]>([]);
  // State for search filters
  const [name, setName] = useState("");
  const [batch, setBatch] = useState("");
  const [department, setDepartment] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all alumni data once when component mounts
  useEffect(() => {
    const fetchAllAlumni = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/search_alumni", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            search_term: "",
            batch: "",
            department: "",
          }),
        });

        const result = await response.json();
        if (response.ok && result.users) {
          setAllAlumni(result.users);
        } else {
          setAllAlumni([]);
        }
      } catch (error) {
        console.error("Error fetching alumni data:", error);
        setAllAlumni([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllAlumni();
  }, []); // Empty dependency array means this runs once on mount

  // Filter alumni based on search criteria (client-side filtering)
  const filteredAlumni = useMemo(() => {
    if (!name && !batch && !department) {
      return allAlumni; // Return all alumni if no filters are applied
    }

    return allAlumni.filter((user) => {
      // Filter by name
      const fullName = `${user.alumniProfile?.first_name || ""} ${
        user.alumniProfile?.last_name || ""
      }`.toLowerCase();
      const nameMatch = !name || fullName.includes(name.toLowerCase());

      // Filter by batch
      const batchMatch =
        !batch || (user.alumniProfile?.batch || "").includes(batch);

      // Filter by department
      const departmentMatch =
        !department || (user.alumniProfile?.department || "") === department;

      // Return user if all applied filters match
      return nameMatch && batchMatch && departmentMatch;
    });
  }, [allAlumni, name, batch, department]);

  // Reset all filters
  const resetFilters = () => {
    setName("");
    setBatch("");
    setDepartment("");
  };

  return (
    <>
      <Container size="xl" bg="white" p={15} pt={30} mb={15}>
        <Stack align="center">
          <Title ta="center" style={{ fontSize: "1.8rem" }}>
            Search <span style={{ color: "#146a3e" }}> Alumni </span>
          </Title>
          <Text ta="center" maw={500}>
            Easily find contact information of alumni in our directory.
          </Text>
        </Stack>
        <Divider
          w={"100%"}
          my="xs"
          labelPosition="center"
          label={<IconSchool size={25} />}
        />

        {/* Search Form */}
        <Container fluid bg="#f8f9fa" p="lg" mt="md">
          <Grid gutter="md">
            <Grid.Col span={{ lg: 4, md: 12, sm: 12 }}>
              <TextInput
                label="Name"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftSection={<IconSearch size={14} />}
              />
            </Grid.Col>
            <Grid.Col span={{ lg: 4, md: 12, sm: 12 }}>
              <TextInput
                label="Batch"
                placeholder="e.g., 2020"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                leftSection={<IconSearch size={14} />}
              />
            </Grid.Col>
            <Grid.Col span={{ lg: 4, md: 12, sm: 12 }}>
              <Select
                clearable
                label="Department"
                placeholder="Select department"
                value={department}
                onChange={(value) => setDepartment(value || "")}
                data={[
                  {
                    value: "CBAA",
                    label: "College of Business Administration and Accountancy",
                  },
                  {
                    value: "CCJE",
                    label: "College of Criminal Justice Education",
                  },
                  { value: "COEd", label: "College of Education" },
                  {
                    value: "CEAT",
                    label:
                      "College of Engineering, Architecture and Technology",
                  },
                  {
                    value: "CICS",
                    label: "College of Information and Computer Studies",
                  },
                  { value: "COL", label: "COL" },
                  {
                    value: "CLAC",
                    label: "College of Liberal Arts and Communciation",
                  },
                  { value: "COS", label: "College of Science" },
                  {
                    value: "CTHM",
                    label: "College of Tourism and Hospitality Management",
                  },
                ]}
              />
            </Grid.Col>
          </Grid>
        </Container>
      </Container>

      {/* Search Results */}
      <Container size="xl" pl={0} pr={0} mt="lg">
        <Center>
          {filteredAlumni.length === 0 && !isLoading ? (
            <Text size="lg" c="dimmed">
              No alumni found matching your search criteria.
            </Text>
          ) : (
            <SimpleGrid cols={{ sm: 2, md: 2, lg: 3, xl: 4 }} spacing="lg">
              {isLoading
                ? Array(8)
                    .fill(0)
                    .map((_, index) => (
                      <Skeleton
                        key={index}
                        height={300}
                        width={320}
                        radius="md"
                      />
                    ))
                : filteredAlumni.map((user) => (
                    <AlumniCard
                      key={user.userID}
                      profilepicture={
                        user.alumniProfile?.profile_picture
                          ? `https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${user.alumniProfile?.profile_picture}`
                          : "https://i.pinimg.com/474x/f1/da/a7/f1daa70c9e3343cebd66ac2342d5be3f.jpg"
                      }
                      name={`${user.alumniProfile?.first_name} ${user.alumniProfile?.last_name}`}
                      batch={user.alumniProfile?.batch || ""}
                      jobProfession={user.alumniProfile?.job_profession || ""}
                      department={user.alumniProfile?.department || ""}
                      course={user.alumniProfile?.program || ""}
                      userID={user.userID}
                    />
                  ))}
            </SimpleGrid>
          )}
        </Center>
      </Container>
    </>
  );
};

export default withAuth(SearchAlumniPage, ["alumni"]);

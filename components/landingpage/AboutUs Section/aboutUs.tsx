import React from "react";
import {
  Container,
  Grid,
  Stack,
  Title,
  Text,
  Paper,
  Image,
} from "@mantine/core";

// List of partner companies
const companies = [
  { name: "Company A", logo: "/logos/companyA.png" },
  { name: "Company B", logo: "/logos/companyB.png" },
  { name: "Company C", logo: "/logos/companyC.png" },
  { name: "Company D", logo: "/logos/companyD.png" },
  { name: "Company E", logo: "/logos/companyE.png" },
];

const OurPartnerSection = () => {
  return (
    <Container size="lg" py={80}>
      <Title order={2} ta="center" mb={40}>
        Our Partner Companies
      </Title>
      <Grid gutter="md">
        {companies.map((company, index) => (
          <Grid.Col span={4} key={index}>
            <Paper shadow="md" p="xl" radius="md" withBorder>
              <Stack align="center">
                <Image
                  src={company.logo}
                  alt={company.name}
                  width={100}
                  height={100}
                />
                <Text ta="center" mt={10} w={500}>
                  {company.name}
                </Text>
              </Stack>
            </Paper>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
};

export default OurPartnerSection;

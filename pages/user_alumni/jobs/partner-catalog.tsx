import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Text,
  Loader,
  Title,
  Paper,
  Stack,
  Divider,
  Box,
  Select,
  TextInput,
  Button,
  Pagination,
  Center,
  Skeleton,
} from "@mantine/core";
import CompanyCard from "../../../components/common/PartnerCompanyCard";
import withAuth from "../../../components/withAuth";
import axios from "axios";
import { IconBuilding, IconSearch } from "@tabler/icons-react";
import { useRouter } from "next/router";

interface PartnerCompany {
  company_id: number;
  name: string;
  website: string;
  company_logo: string;
  industry: string;
  description: string;
}

interface GroupedCompanies {
  [industry: string]: PartnerCompany[];
}

const CompaniesPage: React.FC = () => {
  const [groupedCompanies, setGroupedCompanies] = useState<GroupedCompanies>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPages, setCurrentPages] = useState<{ [key: string]: number }>(
    {}
  );
  const itemsPerPage = 8;
  const router = useRouter();

  useEffect(() => {
    const fetchPartnerCompanies = async () => {
      try {
        const response = await axios.get("/api/get_partner_companies");
        const companies = response.data.partnerCompanies;

        // Group companies by industry
        const grouped = companies.reduce(
          (acc: GroupedCompanies, company: PartnerCompany) => {
            const industry = company.industry || "Other";
            if (!acc[industry]) {
              acc[industry] = [];
            }
            acc[industry].push(company);
            return acc;
          },
          {}
        );

        setGroupedCompanies(grouped);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching partner companies:", err);
        setError("Failed to load partner companies");
        setIsLoading(false);
      }
    };

    fetchPartnerCompanies();
  }, []);

  const SkeletonLoader = () => (
    <Paper shadow="xs" p="md" withBorder mb="xl">
      <Skeleton height={30} width="30%" mb="xl" />
      <Grid>
        {[...Array(4)].map((_, index) => (
          <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
            <Skeleton height={200} mb="sm" />
            <Skeleton height={20} width="70%" mb="sm" />
            <Skeleton height={40} />
          </Grid.Col>
        ))}
      </Grid>
    </Paper>
  );

  if (isLoading)
    return (
      <Container size="xl">
        <SkeletonLoader />
        <SkeletonLoader />
        <SkeletonLoader />
      </Container>
    );

  if (error) return <Text color="red">{error}</Text>;
  const handlePageChange = (industry: string, page: number) => {
    setCurrentPages((prev) => ({ ...prev, [industry]: page }));
  };

  const handleCompanyClick = (companyId: number) => {
    router.push(
      `/user_partner/partner-profile/profile-page?companyId=${companyId}`
    );
  };

  return (
    <>
      <Container size="xl" bg="white" p={15} pt={30} mb={15}>
        <Stack align="center">
          <Title ta="center" style={{ fontSize: "1.8rem", color: "#146a3e" }}>
            Explore the Vast Catalog of our Partner Companies
          </Title>
          <Text ta="center" maw={1000}>
            Explore our diverse network of partner companies across various
            industries. This catalog showcases organizations connected with De
            La Salle University, offering valuable insights for alumni seeking
            career opportunities or professional connections. Discover potential
            employers and expand your professional horizons within the Lasallian
            community.
          </Text>
        </Stack>
        <Divider
          w={"100%"}
          my="lg"
          labelPosition="center"
          label={<IconBuilding size={25} />}
        />
      </Container>

      <Container bg="#e6f0e9" size="xl" p={0} mb={15}>
        <Box
          bg="#e6f0e9"
          style={{
            padding: "24px",
            borderRadius: "8px",
            marginTop: "24px",
          }}
        >
          <Grid gutter="md">
            <Grid.Col span={{ lg: 5, md: 5, sm: 12 }}>
              <TextInput
                placeholder="Search by company name"
                leftSection={<IconSearch size={14} />}
                size="md"
              />
            </Grid.Col>
            <Grid.Col span={{ lg: 5, md: 5, sm: 12 }}>
              <Select
                placeholder="Select industry"
                data={[
                  { value: "all", label: "All Industries" },
                  { value: "tech", label: "Technology" },
                  { value: "finance", label: "Finance" },
                ]}
                size="md"
              />
            </Grid.Col>
            <Grid.Col span={{ lg: 2, md: 12, sm: 12 }}>
              <Button fullWidth size="md" color="#146a3e" variant="light">
                Search
              </Button>
            </Grid.Col>
          </Grid>
        </Box>
      </Container>
      <Container size="xl" p={0}>
        {Object.entries(groupedCompanies).map(([industry, companies]) => {
          const currentPage = currentPages[industry] || 1;
          const totalPages = Math.ceil(companies.length / itemsPerPage);
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const paginatedCompanies = companies.slice(startIndex, endIndex);

          return (
            <Paper key={industry} shadow="xs" p="md" withBorder mb="xl">
              <Title order={3} mb="md">
                {industry}
              </Title>
              <Grid>
                {paginatedCompanies.map((company) => (
                  <Grid.Col
                    key={company.company_id}
                    span={{ base: 12, sm: 6, md: 4, lg: 3 }}
                  >
                    <CompanyCard
                      imageUrl={`https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${company.company_logo}`}
                      companyName={company.name}
                      description={company.description}
                      onClick={() => handleCompanyClick(company.company_id)}
                    />
                  </Grid.Col>
                ))}
              </Grid>
              {totalPages > 1 && (
                <Center>
                  <Pagination
                    total={totalPages}
                    value={currentPage}
                    onChange={(page) => handlePageChange(industry, page)}
                    mt="xl"
                    color="#146a3e"
                  />
                </Center>
              )}
            </Paper>
          );
        })}
      </Container>
    </>
  );
};

export default withAuth(CompaniesPage, ["alumni"]);

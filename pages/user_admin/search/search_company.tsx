import React, { useState, useEffect } from "react";
import {
  TextInput,
  Select,
  Button,
  Container,
  Group,
  Table,
  Modal,
  Image,
  FileInput,
  Title,
  Divider,
  Grid,
  Flex,
  Alert,
  Pagination,
  Loader,
  Center,
  Text,
  Stack,
  Checkbox,
  Badge,
  Box,
  Paper,
  SimpleGrid,
  Card,
  ThemeIcon,
  Textarea,
  Tooltip,
  Switch,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import {
  IconBuildingSkyscraper,
  IconSearch,
  IconEdit,
  IconTrash,
  IconPhotoOff,
  IconInfoCircle,
  IconAddressBook,
  IconContract,
  IconFile,
  IconX,
  IconDeviceFloppy,
  IconClock,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import withAuth from "../../../components/withAuth";
import classes from "./search_alumni.module.css"; // Using the alumni CSS module
import axios from "axios";
import { getServerTime } from "../../../utils/getServerTime";

const SearchPartnerCompany = () => {
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [searchResult, setSearchResult] = useState<Company[]>([]);
  const [filteredResults, setFilteredResults] = useState<Company[]>([]);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bulk Delete related states
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkDeleteConfirmOpened, setBulkDeleteConfirmOpened] = useState(false);

  // Contract Soon to Expire filter
  const [showSoonToExpire, setShowSoonToExpire] = useState(false);

  const [remindModalOpened, setRemindModalOpened] = useState(false);
  const [companyToRemind, setCompanyToRemind] = useState<Company | null>(null);

  const [isSendingEmail, setIsSendingEmail] = useState(false);

  interface Company {
    company_id: string;
    name: string;
    industry: string;
    website: string;
    address: string;
    contact_name: string;
    contact_number: string;
    company_logo: string;
    contract?: string;
    newCompanyLogo?: File;
    newContract?: File;
    effective_date: Date;
    expiry_date: Date;
    email: string;
    description?: string;
    facebook?: string;
    linkedin?: string;
    account_status: string;
  }

  const uploadToS3 = async (file: File) => {
    const uniqueFileName = `${Date.now()}-${file.name}`;
    const { data } = await axios.get("/api/generate_presigned_url", {
      params: {
        fileName: uniqueFileName,
        fileType: file.type,
      },
    });
    await axios.put(data.url, file, {
      headers: { "Content-Type": file.type },
    });
    return `public/${uniqueFileName}`;
  };

  const [serverNow, setServerNow] = useState<Date>(new Date());

  useEffect(() => {
    getServerTime("datetime")
      .then((datetime) => setServerNow(new Date(datetime)))
      .catch(() => setServerNow(new Date()));
  }, []);

  const isContractSoonToExpire = (expiryDate: Date) => {
    if (!expiryDate) return false;
    const today = serverNow;
    const oneMonthFromNow = new Date(today);
    oneMonthFromNow.setMonth(today.getMonth() + 1);
    return (
      new Date(expiryDate) < oneMonthFromNow && new Date(expiryDate) > today
    );
  };

  const isContractExpired = (expiryDate: Date) => {
    if (!expiryDate) return true;
    return new Date(expiryDate) < serverNow;
  };

  const handleRemindCompany = async (company: Company) => {
    try {
      const response = await fetch("/api/sendmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: company.email,
          subject: isContractExpired(company.expiry_date)
            ? "Contract Expired - DLSU-D Alumni Association"
            : "Contract Nearing Expiration - DLSU-D Alumni Association",
          text: isContractExpired(company.expiry_date)
            ? `Dear ${company.name},\n\nYour contract has expired. Please coordinate with the DLSU-D Alumni Association to renew your contract.\n\nThank you.`
            : `Dear ${company.name},\n\nYour contract is set to expire in ${Math.ceil(
                (new Date(company.expiry_date).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              )} day(s). Please coordinate with the DLSU-D Alumni Association to renew your contract.\n\nThank you.`,
        }),
      });
  
      if (response.ok) {
        notifications.show({
          title: "Email Sent",
          message: `A reminder email has been successfully sent to ${company.name}.`,
          color: "green",
          icon: <IconCheck size={16} />,
        });
      } else {
        notifications.show({
          title: "Email Failed",
          message: `Failed to send a reminder email to ${company.name}.`,
          color: "red",
          icon: <IconX size={16} />,
        });
      }
    } catch (error) {
      console.error("Error sending reminder email:", error);
      notifications.show({
        title: "Error",
        message: "An error occurred while sending the reminder email.",
        color: "red",
        icon: <IconX size={16} />,
      });
    }
  };

  // Apply soon to expire filter to search results
  useEffect(() => {
    if (showSoonToExpire) {
      setFilteredResults(
        searchResult.filter((company) =>
          isContractExpired(company.expiry_date) ||
          isContractSoonToExpire(company.expiry_date)
        )
      );
    } else {
      setFilteredResults(searchResult);
    }
    // Reset to first page when filter changes
    setCurrentPage(1);
    // Reset selections when filter changes
    setSelectedCompanies([]);
    setSelectAll(false);
  }, [showSoonToExpire, searchResult]);

  const paginatedData = filteredResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle checkbox selection for a single company
  const handleSelectCompany = (companyId: string) => {
    setSelectedCompanies((prev) => {
      if (prev.includes(companyId)) {
        return prev.filter((id) => id !== companyId);
      } else {
        return [...prev, companyId];
      }
    });
  };

  // Handle select all checkboxes
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    if (newSelectAll) {
      // Select all companies on the current page
      setSelectedCompanies(paginatedData.map((company) => company.company_id));
    } else {
      // Deselect all companies
      setSelectedCompanies([]);
    }
  };

  // Perform bulk delete operation
  const handleBulkDelete = async () => {
    if (selectedCompanies.length === 0) {
      setErrorMessage("Please select at least one company to delete");
      return;
    }

    setBulkDeleteConfirmOpened(true);
  };

  const confirmBulkDelete = async () => {
    setIsLoading(true);
    try {
      const failedDeletions: string[] = [];

      for (const company_id of selectedCompanies) {
        try {
          const response = await fetch("/api/delete_company", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ company_id }),
          });

          if (!response.ok) {
            failedDeletions.push(company_id);
          }
        } catch (error) {
          console.error(`Error deleting company ${company_id}:`, error);
          failedDeletions.push(company_id);
        }
      }

      if (failedDeletions.length === 0) {
        notifications.show({
          title: "Success",
          message: `Successfully deleted ${selectedCompanies.length} companies`,
          color: "green",
          icon: <IconCheck size={16} />,
        });
      } else {
        notifications.show({
          title: "Warning",
          message: `Failed to delete ${failedDeletions.length} out of ${selectedCompanies.length} companies`,
          color: "orange",
          icon: <IconAlertCircle size={16} />,
        });

        // If some deletions were successful
        if (selectedCompanies.length > failedDeletions.length) {
          notifications.show({
            title: "Partial Success",
            message: `Successfully deleted ${
              selectedCompanies.length - failedDeletions.length
            } companies`,
            color: "green",
            icon: <IconCheck size={16} />,
          });
        }
      }

      // Reset selection
      setSelectedCompanies([]);
      setSelectAll(false);

      // Refresh the data
      if (companyName || industry) {
        fetchSearchResults();
      } else {
        fetchAllRecords();
      }
    } catch (error) {
      console.error("Error during bulk delete:", error);
      notifications.show({
        title: "Error",
        message: "An error occurred during bulk delete operation",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setIsLoading(false);
      setBulkDeleteConfirmOpened(false);
    }
  };
  // Fetch search results
  const fetchSearchResults = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/search_company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company_name: companyName, industry }),
      });

      const result = await response.json();
      if (response.ok && result.users) {
        const companies = result.users.map(
          (user: { partnerCompany?: Company }) => ({
            company_id: user.partnerCompany?.company_id || "",
            name: user.partnerCompany?.name || "",
            industry: user.partnerCompany?.industry || "",
            website: user.partnerCompany?.website || "",
            address: user.partnerCompany?.address || "",
            description: user.partnerCompany?.description || "",
            contact_name: user.partnerCompany?.contact_name || "",
            contact_number: user.partnerCompany?.contact_number || "",
            company_logo: user.partnerCompany?.company_logo || "",
            contract: user.partnerCompany?.contract || "",
            effective_date: user.partnerCompany?.effective_date || "",
            expiry_date: user.partnerCompany?.expiry_date || "",
            email: user.partnerCompany?.email || "",
            facebook: user.partnerCompany?.facebook || "",
            linkedin: user.partnerCompany?.linkedin || "",
            account_status: user.partnerCompany?.account_status || "",
          })
        );

        setSearchResult(companies);
        // Reset selections when search results change
        setSelectedCompanies([]);
        setSelectAll(false);
      } else {
        setSearchResult([]);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResult([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all records
  const fetchAllRecords = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/search_company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyName: "", industry: "" }),
      });

      const result = await response.json();
      if (response.ok && result.users) {
        const companies = result.users.map(
          (user: { partnerCompany?: Company }) => ({
            company_id: user.partnerCompany?.company_id || "",
            name: user.partnerCompany?.name || "",
            industry: user.partnerCompany?.industry || "",
            website: user.partnerCompany?.website || "",
            address: user.partnerCompany?.address || "",
            description: user.partnerCompany?.description || "",
            contact_name: user.partnerCompany?.contact_name || "",
            contact_number: user.partnerCompany?.contact_number || "",
            company_logo: user.partnerCompany?.company_logo || "",
            contract: user.partnerCompany?.contract || "",
            effective_date: user.partnerCompany?.effective_date || "",
            expiry_date: user.partnerCompany?.expiry_date || "",
            email: user.partnerCompany?.email || "",
            facebook: user.partnerCompany?.facebook || "",
            linkedin: user.partnerCompany?.linkedin || "",
            account_status: user.partnerCompany?.account_status || "",
          })
        );
        setSearchResult(companies);

        companies.forEach((company: Company) => {
          console.log(
            "Account status for",
            company.name,
            ":",
            company.account_status
          );
        });

        console.log("API Response:", JSON.stringify(result, null, 2));
        // Reset selections when results change
        setSelectedCompanies([]);
        setSelectAll(false);
      } else {
        setSearchResult([]);
      }
    } catch (error) {
      console.error("Error fetching all records:", error);
      setSearchResult([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (companyName || industry) {
      fetchSearchResults();
    } else {
      fetchAllRecords();
    }
  }, [companyName, industry]);

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setEditModalOpened(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedCompany) return;

    try {
      setIsLoading(true);
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("company_id", selectedCompany.company_id);
      formData.append("name", selectedCompany.name || "");
      formData.append("website", selectedCompany.website || "");
      formData.append("industry", selectedCompany.industry || "");
      formData.append("address", selectedCompany.address || "");
      formData.append("description", selectedCompany.description || "");
      formData.append("account_status", selectedCompany.account_status || "");
      formData.append("contact_name", selectedCompany.contact_name || "");
      formData.append("contact_number", selectedCompany.contact_number || "");
      formData.append("email", selectedCompany.email || "");
      formData.append("facebook", selectedCompany.facebook || "");
      formData.append("linkedin", selectedCompany.linkedin || "");

      if (selectedCompany.effective_date) {
        const effectiveDate = new Date(selectedCompany.effective_date);
        if (!isNaN(effectiveDate.getTime())) {
          formData.append("effective_date", effectiveDate.toISOString());
        }
      }
      if (selectedCompany.expiry_date) {
        const expiryDate = new Date(selectedCompany.expiry_date);
        if (!isNaN(expiryDate.getTime())) {
          formData.append("expiry_date", expiryDate.toISOString());
        }
      }

      // Only append the S3 path string, not the File object
      if (selectedCompany.company_logo) {
        formData.append("company_logo", selectedCompany.company_logo);
      }
      if (selectedCompany.contract) {
        formData.append("contract", selectedCompany.contract);
      }

      const response = await fetch("/api/edit_company", {
        method: "PUT",
        body: formData,
      });

      const responseData = await response.json();

      if (response.ok) {
        setSuccessMessage("Company updated successfully");
        setErrorMessage(null);
        setEditModalOpened(false);
        if (companyName || industry) {
          fetchSearchResults();
        } else {
          fetchAllRecords();
        }
      } else {
        setErrorMessage(responseData.error || "Failed to update company");
        setSuccessMessage(null);
      }
    } catch (error) {
      console.error("Error updating company:", error);
      setErrorMessage("An error occurred while updating the company");
      setSuccessMessage(null);
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (company_id: string) => {
    const confirmed = confirm("Are you sure you want to delete this record?");
    if (confirmed) {
      try {
        const response = await fetch("/api/delete_company", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ company_id }),
        });

        if (response.ok) {
          notifications.show({
            title: "Success",
            message: "Company deleted successfully",
            color: "green",
            icon: <IconCheck size={16} />,
          });
          fetchSearchResults();
        } else {
          notifications.show({
            title: "Error",
            message: "Failed to delete the company",
            color: "red",
            icon: <IconX size={16} />,
          });
        }
      } catch (error) {
        console.error("Error deleting company:", error);
        notifications.show({
          title: "Error",
          message: "An error occurred while deleting the company",
          color: "red",
          icon: <IconX size={16} />,
        });
      }
    }
  };

  return (
    <Container size="xl" p={15} bg="white">
      <Group justify="space-between" align="center" gap="sm" p="md">
        <Group>
          <IconBuildingSkyscraper size={24} color="#146a3e" />
          <Title order={3} c="#146a3e">
            Partner Companies
          </Title>
        </Group>
      </Group>

      {/* <Divider my="md" /> */}

      {/* Search Form */}
      <Container fluid p="md" mb="xl" className={classes.searchForm}>
        <form onSubmit={(e) => e.preventDefault()}>
          <Grid gutter="md">
            <Grid.Col span={{ lg: 6, md: 12, sm: 12 }}>
              <TextInput
                leftSection={<IconSearch size={16} />}
                placeholder="Search Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.currentTarget.value)}
              />
            </Grid.Col>

            <Grid.Col span={{ lg: 6, md: 12, sm: 12 }}>
              <Select
                leftSection={<IconSearch size={16} />}
                placeholder="Select industry"
                value={industry}
                onChange={(value) => setIndustry(value || "")}
                data={[
                  { value: "Technology", label: "Technology" },
                  { value: "Finance", label: "Finance" },
                  { value: "Healthcare", label: "Healthcare" },
                  { value: "Education", label: "Education" },
                  { value: "Manufacturing", label: "Manufacturing" },
                  { value: "Retail", label: "Retail" },
                  { value: "Sports", label: "Sports" },
                  {
                    value: "Hospitality & Tourism",
                    label: "Hospitality & Tourism",
                  },
                  {
                    value: "Media & Entertainment",
                    label: "Media & Entertainment",
                  },
                  {
                    value: "Agriculture & Resources",
                    label: "Agriculture & Resources",
                  },
                  {
                    value: "Construction & Real Estate",
                    label: "Construction & Real Estate",
                  },
                  { value: "Energy & Utilities", label: "Energy & Utilities" },
                  {
                    value: "Transportation & Logistics",
                    label: "Transportation & Logistics",
                  },
                  {
                    value: "Government & Public Service",
                    label: "Government & Public Service",
                  },
                  {
                    value: "Professional Services",
                    label: "Professional Services",
                  },
                  {
                    value: "Nonprofit & Social Services",
                    label: "Nonprofit & Social Services",
                  },
                  { value: "Other", label: "Other" },
                ]}
              />
            </Grid.Col>
          </Grid>
        </form>
      </Container>

      {/* Contract filter and bulk delete controls */}
      <Container fluid mb="md">
        <Grid justify="center" align="center">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Group>
              <Switch
                checked={showSoonToExpire}
                onChange={(event) =>
                  setShowSoonToExpire(event.currentTarget.checked)
                }
                label={
                  <Group gap={5}>
                    <Tooltip
                      label="Contracts with 1 month or less remaining, as well as expired contracts, will appear in this list."
                      position="top"
                      withArrow
                    >
                      <IconInfoCircle size={16} color="orange" />
                    </Tooltip>
                    <Text>Show companies with expired / soon to expire contracts</Text>
                  </Group>
                }
                size="md"
                color="orange"
              />
            </Group>
          </Grid.Col>
          <Grid.Col
            span={{ base: 12, md: 6 }}
            className={classes.bulkActionCol}
          >
            <Flex justify="flex-end" align="center" h="100%">
              <Button
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={handleBulkDelete}
                disabled={selectedCompanies.length === 0}
              >
                Delete Selected{" "}
                {selectedCompanies.length > 0
                  ? `(${selectedCompanies.length})`
                  : ""}
              </Button>
            </Flex>
          </Grid.Col>
        </Grid>
      </Container>

      {showSoonToExpire && (
        <Container fluid mb="md">
          <Alert color="yellow" radius="md">
            <Group>
              <IconClock size={18} />
              <Text>
                Showing <strong>{filteredResults.length}</strong> companies with
                expired / soon to expire contracts.
              </Text>
            </Group>
          </Alert>
        </Container>
      )}

      {/* Search Results Table */}
      <Container fluid className={classes.tableContainer} mt={32}>
        {isLoading ? (
          <Center py="xl">
            <Stack align="center" gap="sm">
              <Loader color="#146a3e" size="md" />
              <Text c="dimmed" size="sm">
                Loading company records...
              </Text>
            </Stack>
          </Center>
        ) : searchResult.length > 0 ? (
          <>
            {/* Bulk delete button - always visible */}
            <Table className={`${classes.table} responsive-cards`}>
              <thead className={classes.tableHeader}>
                <tr>
                  <th>
                    <Center>
                      <Checkbox
                        checked={selectAll}
                        onChange={handleSelectAll}
                        aria-label="Select all companies"
                      />
                    </Center>
                  </th>
                  <th>ID</th>
                  <th></th> {/* For logo */}
                  <th>Company Name</th>
                  <th>Industry</th>
                  <th>Contact Name</th>
                  <th>Email</th>
                  <th>Contract Effective Date</th>
                  <th>
                    <Center>Actions</Center>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((company, index) => (
                  <tr key={index} className={classes.tableRow}>
                    <td>
                      <Center>
                        <Checkbox
                          checked={selectedCompanies.includes(
                            company.company_id
                          )}
                          onChange={() =>
                            handleSelectCompany(company.company_id)
                          }
                          aria-label={`Select ${company.name}`}
                        />
                      </Center>
                    </td>
                    <td
                      className={`${classes.tableCell} ${classes.userIdCell}`}
                      data-label="ID"
                    >
                      {company.company_id}
                    </td>
                    <td
                      className={`${classes.tableCell} profile-cell`}
                      data-label="Logo"
                    >
                      {company.company_logo ? (
                        <Image
                          src={`https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${company.company_logo}`}
                          alt={`${company.name} Logo`}
                          width={40}
                          height={40}
                          fit="contain"
                          radius="md"
                          className={classes.profilePicture}
                        />
                      ) : (
                        <div className={classes.profilePicture}>
                          {company.name ? company.name[0].toUpperCase() : "C"}
                        </div>
                      )}
                    </td>
                    <td
                      className={`${classes.tableCell} ${classes.nameCell}`}
                      data-label="Company Name"
                    >
                      <div>
                        {company.name || "N/A"}
                        <div>
                          <Badge
                            color={
                              (company.account_status || "").trim() === "Active"
                                ? "green"
                                : "red"
                            }
                            variant="filled"
                            size="sm"
                          >
                            {(company.account_status || "").trim() === "Active"
                              ? "Active"
                              : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className={classes.tableCell} data-label="Industry">
                      {company.industry || "N/A"}
                    </td>
                    <td className={classes.tableCell} data-label="Contact Name">
                      {company.contact_name || "N/A"}
                    </td>
                    <td className={classes.tableCell} data-label="Email">
                      {company.email || "N/A"}
                    </td>
                    <td className={classes.tableCell}>
                      <div>
                        {new Date(company.effective_date).toLocaleDateString()}{" "}
                        - {new Date(company.expiry_date).toLocaleDateString()}
                        <div style={{ marginTop: "5px" }}>
                        <Badge
                          color={
                            isContractExpired(company.expiry_date)
                              ? "red"
                              : isContractSoonToExpire(company.expiry_date)
                              ? "yellow"
                              : "green"
                          }
                          variant="filled"
                          size="sm"
                        >
                          {isContractExpired(company.expiry_date)
                            ? "Expired"
                            : isContractSoonToExpire(company.expiry_date)
                            ? "Soon to Expire"
                            : "Valid"}
                        </Badge>
                        </div>
                      </div>
                    </td>

                    <td className={classes.tableCell} data-label="Actions">
                      <Group
                        gap="xs"
                        justify="flex-end"
                        wrap="nowrap"
                        className={classes.actionButtons}
                      >
                        <Tooltip label="Edit">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleEdit(company)}
                          >
                            <IconEdit size={18} />
                          </Button>
                        </Tooltip>
                        <Tooltip label="Delete">
                          <Button
                            color="red"
                            size="xs"
                            variant="outline"
                            onClick={() => handleDelete(company.company_id)}
                          >
                            <IconTrash size={18} />
                          </Button>
                        </Tooltip>
                        <Tooltip label="Send an E-mail Reminder about the contract expiry">
                          <Button
                            color="blue"
                            size="xs"
                            variant="outline"
                            onClick={() => {
                              setCompanyToRemind(company);
                              setRemindModalOpened(true);
                            }}
                            disabled={
                              !isContractExpired(company.expiry_date) &&
                              !isContractSoonToExpire(company.expiry_date)
                            }
                          >
                            <IconInfoCircle size={18} />
                          </Button>
                        </Tooltip>
                      </Group>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        ) : (
          <div className={classes.emptyState}>
            No partner companies found. Try adjusting your search criteria.
          </div>
        )}
      </Container>

      <Flex justify="center" mt="xl" className={classes.paginationContainer}>
        <Pagination
          withEdges
          total={Math.ceil(searchResult.length / itemsPerPage)}
          value={currentPage}
          onChange={setCurrentPage}
          radius="md"
        />
      </Flex>

      {/* Edit Company Modal */}
      <Modal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        title={
          <Text fw={700} size="lg">
            Edit Partner Company Information
          </Text>
        }
        centered
        size="xl"
        padding="lg"
        radius="md"
        shadow="sm"
        overlayProps={{
          blur: 3,
          opacity: 0.55,
        }}
      >
        {selectedCompany && (
          <Box>
            {/* Company Profile Section */}
            <Paper withBorder p="md" radius="md" mb="lg">
              <Group justify="space-between" mb="xs">
                <Title order={4} c="#146a3e">
                  Company Profile
                </Title>
                <ThemeIcon
                  variant="light"
                  color="#146a3e"
                  size="md"
                  radius="xl"
                >
                  <IconBuildingSkyscraper size={18} />
                </ThemeIcon>
              </Group>
              <Divider mb="md" />

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                {/* Left Column */}
                <Stack>
                  {/* Logo Section with Card */}
                  <Card shadow="sm" p="sm" radius="md" withBorder mb="md">
                    <Card.Section p="xs">
                      <Text fw={600} size="sm" mb="xs" c="dimmed">
                        Company Logo
                      </Text>
                    </Card.Section>
                    <Center mb="sm">
                      {selectedCompany.company_logo ? (
                        <Image
                          src={`https://lasalumni-bucket.s3.ap-southeast-2.amazonaws.com/${selectedCompany.company_logo}`}
                          alt="Company Logo"
                          width={120}
                          height={120}
                          radius="md"
                          fit="contain"
                        />
                      ) : (
                        <Box py="md">
                          <IconPhotoOff size={60} opacity={0.5} />
                          <Text c="dimmed" size="sm" ta="center" mt="xs">
                            No logo uploaded
                          </Text>
                        </Box>
                      )}
                    </Center>
                    <FileInput
                      placeholder="Upload new logo"
                      accept="image/*"
                      onChange={async (file) => {
                        if (file) {
                          const s3Path = await uploadToS3(file);
                          setSelectedCompany((prev) =>
                            prev ? { ...prev, company_logo: s3Path } : prev
                          );
                        }
                      }}
                    />
                  </Card>

                  <TextInput
                    label="Company Name"
                    placeholder="Enter company name"
                    value={selectedCompany.name || ""}
                    onChange={(e) =>
                      setSelectedCompany({
                        ...selectedCompany,
                        name: e.currentTarget.value,
                      })
                    }
                    radius="md"
                  />

                  <Select
                    label="Industry"
                    placeholder="Select industry"
                    value={selectedCompany.industry || ""}
                    onChange={(value) =>
                      setSelectedCompany({
                        ...selectedCompany,
                        industry: value || "",
                      })
                    }
                    data={[
                      { value: "Technology", label: "Technology" },
                      { value: "Finance", label: "Finance" },
                      { value: "Healthcare", label: "Healthcare" },
                      { value: "Education", label: "Education" },
                      { value: "Manufacturing", label: "Manufacturing" },
                      { value: "Retail", label: "Retail" },
                      { value: "Sports", label: "Sports" },
                      {
                        value: "Hospitality & Tourism",
                        label: "Hospitality & Tourism",
                      },
                      {
                        value: "Media & Entertainment",
                        label: "Media & Entertainment",
                      },
                      {
                        value: "Agriculture & Resources",
                        label: "Agriculture & Resources",
                      },
                      {
                        value: "Construction & Real Estate",
                        label: "Construction & Real Estate",
                      },
                      {
                        value: "Energy & Utilities",
                        label: "Energy & Utilities",
                      },
                      {
                        value: "Transportation & Logistics",
                        label: "Transportation & Logistics",
                      },
                      {
                        value: "Government & Public Service",
                        label: "Government & Public Service",
                      },
                      {
                        value: "Professional Services",
                        label: "Professional Services",
                      },
                      {
                        value: "Nonprofit & Social Services",
                        label: "Nonprofit & Social Services",
                      },
                      { value: "Other", label: "Other" },
                    ]}
                    radius="md"
                    searchable
                    clearable
                  />
                </Stack>

                {/* Right Column */}
                <Stack>
                  <TextInput
                    label="Website"
                    placeholder="https://example.com"
                    value={selectedCompany.website || ""}
                    onChange={(e) =>
                      setSelectedCompany({
                        ...selectedCompany,
                        website: e.currentTarget.value,
                      })
                    }
                    radius="md"
                  />

                  <TextInput
                    label="Address"
                    placeholder="Enter company address"
                    value={selectedCompany.address || ""}
                    onChange={(e) =>
                      setSelectedCompany({
                        ...selectedCompany,
                        address: e.currentTarget.value,
                      })
                    }
                    radius="md"
                  />

                  <Select
                    label="Account Status"
                    placeholder="Select status"
                    value={selectedCompany.account_status || "Active"}
                    onChange={(value) =>
                      setSelectedCompany({
                        ...selectedCompany,
                        account_status: value || "Active",
                      })
                    }
                    data={[
                      { value: "Active", label: "Active" },
                      { value: "Inactive", label: "Inactive" },
                    ]}
                    radius="md"
                    searchable
                  />

                  <Textarea
                    label="Description"
                    placeholder="Enter company description"
                    minRows={3}
                    maxRows={5}
                    autosize
                    value={selectedCompany.description || ""}
                    onChange={(e) =>
                      setSelectedCompany({
                        ...selectedCompany,
                        description: e.currentTarget.value,
                      })
                    }
                    radius="md"
                  />
                </Stack>
              </SimpleGrid>
            </Paper>

            {/* Contact Information Section */}
            <Paper withBorder p="md" radius="md" mb="lg">
              <Group justify="space-between" mb="xs">
                <Title order={4} c="#146a3e">
                  Contact Information
                </Title>
                <ThemeIcon
                  variant="light"
                  color="#146a3e"
                  size="md"
                  radius="xl"
                >
                  <IconAddressBook size={18} />
                </ThemeIcon>
              </Group>
              <Divider mb="md" />

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                <TextInput
                  label="Contact Name"
                  placeholder="Enter contact person name"
                  value={selectedCompany.contact_name || ""}
                  onChange={(e) =>
                    setSelectedCompany({
                      ...selectedCompany,
                      contact_name: e.currentTarget.value,
                    })
                  }
                  radius="md"
                />

                <TextInput
                  label="Contact Number"
                  placeholder="Enter phone number"
                  value={selectedCompany.contact_number || ""}
                  onChange={(e) =>
                    setSelectedCompany({
                      ...selectedCompany,
                      contact_number: e.currentTarget.value,
                    })
                  }
                  radius="md"
                />

                <TextInput
                  label="Email"
                  placeholder="contact@example.com"
                  value={selectedCompany.email || ""}
                  onChange={(e) =>
                    setSelectedCompany({
                      ...selectedCompany,
                      email: e.currentTarget.value,
                    })
                  }
                  radius="md"
                />

                <TextInput
                  label="Facebook"
                  placeholder="Facebook profile URL"
                  value={selectedCompany.facebook || ""}
                  onChange={(e) =>
                    setSelectedCompany({
                      ...selectedCompany,
                      facebook: e.currentTarget.value,
                    })
                  }
                  radius="md"
                />

                <TextInput
                  label="LinkedIn"
                  placeholder="LinkedIn profile URL"
                  value={selectedCompany.linkedin || ""}
                  onChange={(e) =>
                    setSelectedCompany({
                      ...selectedCompany,
                      linkedin: e.currentTarget.value,
                    })
                  }
                  radius="md"
                />
              </SimpleGrid>
            </Paper>

            {/* Contract Information Section */}
            <Paper withBorder p="md" radius="md" mb="lg">
              <Group justify="space-between" mb="xs">
                <Title order={4} c="#146a3e">
                  Contract Information
                </Title>
                <ThemeIcon
                  variant="light"
                  color="#146a3e"
                  size="md"
                  radius="xl"
                >
                  <IconContract size={18} />
                </ThemeIcon>
              </Group>
              <Divider mb="md" />

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                <DateInput
                  label="Effective Date"
                  placeholder="Select date"
                  value={
                    selectedCompany.effective_date
                      ? new Date(selectedCompany.effective_date)
                      : null
                  }
                  onChange={(date: Date | null) =>
                    setSelectedCompany({
                      ...selectedCompany,
                      effective_date: date
                        ? date
                        : selectedCompany.effective_date,
                    })
                  }
                  radius="md"
                  clearable
                />

                <DateInput
                  label="Expiry Date"
                  placeholder="Select date"
                  value={
                    selectedCompany.expiry_date
                      ? new Date(selectedCompany.expiry_date)
                      : null
                  }
                  onChange={(date: Date | null) =>
                    setSelectedCompany({
                      ...selectedCompany,
                      expiry_date: date ? date : selectedCompany.expiry_date,
                    })
                  }
                  radius="md"
                  clearable
                />
              </SimpleGrid>

              {/* Contract File Section */}
              <Card shadow="sm" p="sm" mt="md" radius="md" withBorder>
                <Card.Section p="xs">
                  <Text fw={600} size="sm" mb="xs" c="dimmed">
                    Contract Document
                  </Text>
                </Card.Section>

                {selectedCompany.contract ? (
                  <Group mb="md">
                    <ThemeIcon
                      variant="light"
                      color="blue"
                      size="lg"
                      radius="xl"
                    >
                      <IconFile size={20} />
                    </ThemeIcon>
                    <Box>
                      <Text size="sm" fw={500}>
                        {selectedCompany.contract.split("/").pop()}
                      </Text>
                      <Text size="xs" c="dimmed">
                        Current contract document
                      </Text>
                    </Box>
                  </Group>
                ) : (
                  <Alert
                    icon={<IconInfoCircle size={16} />}
                    color="blue"
                    variant="light"
                    mb="md"
                  >
                    <Text size="sm">No contract document uploaded yet</Text>
                  </Alert>
                )}

                <FileInput
                  placeholder="Upload new contract"
                  label="Upload New Contract"
                  accept=".pdf"
                  onChange={async (file) => {
                    if (file) {
                      const s3Path = await uploadToS3(file);
                      setSelectedCompany((prev) =>
                        prev ? { ...prev, contract: s3Path } : prev
                      );
                    }
                  }}
                  radius="md"
                />
              </Card>
            </Paper>

            {/* Action Buttons */}
            <Group justify="space-between" mt="xl">
              <Button
                variant="subtle"
                color="gray"
                onClick={() => setEditModalOpened(false)}
                leftSection={<IconX size={18} />}
                radius="md"
              >
                Cancel
              </Button>
              <Button
                color="#146a3e"
                onClick={handleSaveChanges}
                loading={isSubmitting}
                leftSection={<IconDeviceFloppy size={18} />}
                radius="md"
              >
                Save Changes
              </Button>
            </Group>
          </Box>
        )}
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        opened={bulkDeleteConfirmOpened}
        onClose={() => setBulkDeleteConfirmOpened(false)}
        title="Confirm Bulk Delete"
        centered
      >
        <Text mb="md">
          Are you sure you want to delete {selectedCompanies.length} selected
          companies? This action cannot be undone.
        </Text>
        <Group justify="flex-end" mt="md">
          <Button
            variant="outline"
            onClick={() => setBulkDeleteConfirmOpened(false)}
          >
            Cancel
          </Button>
          <Button color="red" onClick={confirmBulkDelete} loading={isLoading}>
            Delete
          </Button>
        </Group>
      </Modal>

      {errorMessage && (
        <Alert title="Error" color="red" mt="md">
          {errorMessage}
        </Alert>
      )}
      {successMessage && (
        <Alert title="Success" color="green" mt="md">
          {successMessage}
        </Alert>
      )}

      <Modal
        opened={remindModalOpened}
        onClose={() => setRemindModalOpened(false)}
        title="Confirm Reminder Email"
        centered
      >
        <Text mb="md">
          Are you sure you want to send a reminder email to{" "}
          <strong>{companyToRemind?.name}</strong>?
        </Text>
        <Group justify="flex-end" mt="md">
          <Button
            variant="outline"
            onClick={() => setRemindModalOpened(false)}
          >
            Cancel
          </Button>
          <Button
            color="blue"
            loading={isSendingEmail} // Add loading state
            onClick={async () => {
              if (companyToRemind) {
                setIsSendingEmail(true); // Set loading state to true
                await handleRemindCompany(companyToRemind);
                setIsSendingEmail(false); // Reset loading state
              }
              setRemindModalOpened(false); // Close the modal
            }}
          >
            Confirm
          </Button>
        </Group>
      </Modal>
      
    </Container>
  );
};

export default withAuth(SearchPartnerCompany, ["admin"]);

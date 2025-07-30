import React, { useState, useEffect } from "react";
import JobForm from "../../../components/common/JobForm";
import withAuth from "../../../components/withAuth";
import axios from "axios";

const PartnerJobForm = () => {
  interface PartnerInfo {
    companyName: string;
    location: string;
    industry: string;
  }

  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPartnerInfo = async () => {
      try {
        const response = await axios.get("/api/get_partner_info");
        console.log("Partner info response:", response.data);
        setPartnerInfo(response.data);
      } catch (error: any) {
        console.error(
          "Error fetching partner information:",
          error.response?.data || error.message
        );
        setError("Failed to fetch partner information");
      }
    };

    fetchPartnerInfo();
  }, []);

  const handleSuccess = (data: any) => {
    console.log("Partner job submission successful:", data);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!partnerInfo) {
    return <div>Loading partner information...</div>;
  }

  return (
    <JobForm
      userRole="partner"
      title="Partner Job Posting"
      description="Share job opportunities with our community as a partner organization."
      redirectAfterSubmit="/partner/dashboard"
      onSuccess={handleSuccess}
      initialValues={{
        companyName: partnerInfo.companyName || "",
        location: partnerInfo.location || "",
        industry: partnerInfo.industry || "",
      }}
    />
  );
};

export default withAuth(PartnerJobForm, ["partner"]);

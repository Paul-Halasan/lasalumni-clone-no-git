// pages/admin/jobs/add.tsx
import React from "react";
import JobForm from "../../../components/common/JobForm";
import withAuth from "../../../components/withAuth";

const AdminJobForm = () => {
  const handleSuccess = (data: any) => {
    // Partner-specific success handler
    console.log("Admin job submission successful:", data);
  };

  return (
    <JobForm
      userRole="admin"
      title="Admin Job Posting"
      description="Share job opportunities with our community as a admin organization."
      redirectAfterSubmit="/partner/dashboard"
      onSuccess={handleSuccess}
    />
  );
};

export default withAuth(AdminJobForm, ["admin"]);

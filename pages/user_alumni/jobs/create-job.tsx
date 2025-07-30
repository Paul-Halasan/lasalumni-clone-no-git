import React from "react";
import JobForm from "../../../components/common/JobForm";
import withAuth from "../../../components/withAuth";

const AlumniJobForm = () => {
  const handleSuccess = (data: any) => {
    console.log("Alumni job submission successful:", data);
    // You can add alumni-specific success logic here
  };

  return <JobForm userRole="alumni" onSuccess={handleSuccess} />;
};

export default withAuth(AlumniJobForm, ["alumni"]);

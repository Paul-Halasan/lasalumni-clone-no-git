import React from "react";
import withAuth from "../../../components/withAuth";
import ApproveDonationDriveRequest from "../../../components/admin/donation-drive/ApproveDonationDriveRequest";

const ApproveDonationDriveRequestPage = () => {
  return (
    <div>
        <ApproveDonationDriveRequest />
    </div>
  );
};

export default withAuth(ApproveDonationDriveRequestPage, ["admin"]);
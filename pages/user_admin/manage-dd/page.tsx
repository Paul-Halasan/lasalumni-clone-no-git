import React from "react";
import withAuth from "../../../components/withAuth";
import ManageDonationDrive from "../../../components/admin/donation-drive/ManageDonationDrive"; // Adjust the path as necessary

const ManageDonationDrivePage = () => {
  return (
    <div>
      <ManageDonationDrive />
    </div>
  );
};

export default withAuth(ManageDonationDrivePage, ["admin"]);

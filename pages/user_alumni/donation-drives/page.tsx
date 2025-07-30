import React from "react";
import withAuth from "../../../components/withAuth";
import DonationDrive from "../../../components/alumni/donation-drive/DonationDrive";

const DonationDrivePage = () => {
  return (
    <div>
        <DonationDrive />
    </div>
  );
};

export default withAuth(DonationDrivePage, ["alumni"]);
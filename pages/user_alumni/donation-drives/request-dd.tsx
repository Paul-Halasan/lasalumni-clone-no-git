import React from "react";
import withAuth from "../../../components/withAuth";
import DonationDriveRequest from "../../../components/alumni/donation-drive/DonationDriveRequest";

const DonationDriveRequestPage = () => {
  return (
    <div>
        <DonationDriveRequest />
    </div>
  );
};

export default withAuth(DonationDriveRequestPage, ["alumni"]);
  // pages/user_alumni/animo-feed/page.tsx

import React from "react";
import PartnerLayout from "../../../components/partner/PartnerLayout";
import withAuth from "../../../components/withAuth";

const PartnerAppshell = () => {
  return <PartnerLayout></PartnerLayout>;
};

export default withAuth(PartnerAppshell, ["partner"]);

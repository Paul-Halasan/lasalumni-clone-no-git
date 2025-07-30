// pages/user_alumni/animo-feed/page.tsx

import React from "react";
import AlumniLayout from "../../components/alumni/AlumniLayout";
import withAuth from "../../components/withAuth";

const AlumniAppshell = () => {
  return <AlumniLayout></AlumniLayout>;
};

export default withAuth(AlumniAppshell, ["alumni"]);

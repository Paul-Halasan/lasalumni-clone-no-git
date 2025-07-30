import React from 'react';
import withAuth from '../../../components/withAuth';
import EditHomePage from '../../../components/admin/edit-homepage/EditHomePage'; // Adjust the path as necessary

const EditHomePagePage = () => {
  return (
    <div>
      <h1>Edit Home Page</h1>
      <EditHomePage />
    </div>
  );
};

export default withAuth(EditHomePagePage, ["admin"]);
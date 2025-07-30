// pages/user_admin/page.tsx
import React from 'react';
import withAuth from '../../components/withAuth';
import AdminLayout from "../../components/admin/AdminLayout";
const AdminHomePage = () => {
return <AdminLayout><div>meow</div></AdminLayout>;

};

export default withAuth(AdminHomePage, ['admin']);
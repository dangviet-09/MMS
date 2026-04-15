import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminRoute } from "../../components/molecules/AdminRoute";
import { AdminDashboard } from "../../components/pages/Admin";
import { StudentManagement } from "../../components/pages/Admin/StudentManagement";
import { CompanyManagement } from "../../components/pages/Admin/CompanyManagement";

const AdminRoutesExample: React.FC = () => {
  return (
    <Routes>
      {/* Admin Routes with Protection */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<StudentManagement />} />
        <Route path="companies" element={<CompanyManagement />} />
      </Route>

      {/* Unauthorized Page */}
      {/* <Route path="/unauthorized" element={<Unauthorized />} /> */}
    </Routes>
  );
};

export default AdminRoutesExample;

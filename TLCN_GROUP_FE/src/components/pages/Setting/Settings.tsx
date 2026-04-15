import React from 'react';
import MainTemplate from '../../templates/MainTemplate/MainTemplate';
import StudentSettingsForm from '../../molecules/StudentSettingsForm';
import CompanySettingsForm from '../../molecules/CompanySettingsForm';
import { useAuth } from '../../../contexts/AuthContext';
import { ProtectedRoute } from '../../ProtectedRoute';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <MainTemplate>
      <div className="max-w-4xl mx-auto p-6">

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-50">
          {user?.role === 'COMPANY' ? <CompanySettingsForm /> : <StudentSettingsForm />}
        </div>
      </div>
    </MainTemplate>
  );
};

export default () => (
  <ProtectedRoute>
    <SettingsPage />
  </ProtectedRoute>
);

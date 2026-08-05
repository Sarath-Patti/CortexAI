import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { WorkspaceList } from '../pages/WorkspaceList';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/workspaces"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <WorkspaceList />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Default Fallback Redirect */}
        <Route path="*" element={<Navigate to="/workspaces" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

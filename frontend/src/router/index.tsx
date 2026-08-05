import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Dashboard } from '../pages/Dashboard';
import { WorkspaceList } from '../pages/WorkspaceList';
import { Playground } from '../pages/Playground';
import { Knowledge } from '../pages/Knowledge';
import { Workflows } from '../pages/Workflows';
import { Settings } from '../pages/Settings';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

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

        <Route
          path="/playground"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Playground />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/knowledge"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Knowledge />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/workflows"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Workflows />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

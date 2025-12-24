import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import MainLayout from '../components/layout/MainLayout';
import AppLoader from '../components/AppLoader';
import routes from './routes';

const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const DependentList = lazy(() => import('../pages/dependents/DependentList'));
const MedicalRecords = lazy(() => import('../pages/records/MedicalRecords'));
const Profile = lazy(() => import('../pages/profile/Profile'));

export default function AppRouter() {
  return (
    <Suspense fallback={<AppLoader />}>
      <Routes>

        {/* Public routes */}
        <Route path={routes.LOGIN} element={<Login />} />
        <Route path={routes.REGISTER} element={<Register />} />

        {/* Private layout */}
        <Route element={<MainLayout />}>
          <Route path={routes.DASHBOARD} element={<Dashboard />} />
          <Route path={routes.DEPENDENTS} element={<DependentList />} />
          <Route path={routes.RECORDS} element={<MedicalRecords />} />
          <Route path={routes.PROFILE} element={<Profile />} />
        </Route>

        {/* Desconocido */}
        <Route path="*" element={<Navigate to={routes.DASHBOARD} replace />} />

      </Routes>
    </Suspense>
  );
}

import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { Toaster } from '@/components/ui/Toaster';
import { AchievementCelebration } from '@/components/AchievementCelebration';

import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { TopicsPage } from '@/pages/TopicsPage';
import { LessonPage } from '@/pages/LessonPage';
import { LabsPage } from '@/pages/LabsPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AchievementsPage } from '@/pages/AchievementsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminTopicsPage } from '@/pages/admin/AdminTopicsPage';
import { AdminTopicEditPage } from '@/pages/admin/AdminTopicEditPage';
import { AdminStudentsPage } from '@/pages/admin/AdminStudentsPage';
import { AdminStudentDetailPage } from '@/pages/admin/AdminStudentDetailPage';

export default function App() {
  return (
    <>
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/topics" element={<TopicsPage />} />
          <Route path="/topics/:slug" element={<LessonPage />} />
          <Route path="/labs" element={<LabsPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Student area */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
          </Route>
        </Route>

        {/* Admin area */}
        <Route element={<ProtectedRoute role="ADMIN" />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/topics" element={<AdminTopicsPage />} />
            <Route path="/admin/topics/new" element={<AdminTopicEditPage />} />
            <Route path="/admin/topics/:id" element={<AdminTopicEditPage />} />
            <Route path="/admin/students" element={<AdminStudentsPage />} />
            <Route path="/admin/students/:id" element={<AdminStudentDetailPage />} />
          </Route>
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>

      <Toaster />
      <AchievementCelebration />
    </>
  );
}

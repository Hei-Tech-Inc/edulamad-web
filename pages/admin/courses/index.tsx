'use client';

import ProtectedRoute from '../../../components/ProtectedRoute';
import { AdminPortalShell } from '@/components/admin/AdminPortalShell';
import { CoursesAdminPage } from '@/components/admin/CoursesAdminPage';

export default function AdminCoursesIndexPage() {
  return (
    <ProtectedRoute>
      <AdminPortalShell title="Courses">
        <CoursesAdminPage />
      </AdminPortalShell>
    </ProtectedRoute>
  );
}

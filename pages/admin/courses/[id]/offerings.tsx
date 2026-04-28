'use client';

import ProtectedRoute from '../../../../components/ProtectedRoute';
import { AdminPortalShell } from '@/components/admin/AdminPortalShell';
import { CourseOfferingsAdminPage } from '@/components/admin/CourseOfferingsAdminPage';

export default function CourseOfferingsPage() {
  return (
    <ProtectedRoute>
      <AdminPortalShell title="Course offerings">
        <CourseOfferingsAdminPage />
      </AdminPortalShell>
    </ProtectedRoute>
  );
}

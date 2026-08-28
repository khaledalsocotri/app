import { Slot } from "expo-router";
import AdminShell from "@/src/admin/AdminShell";

// The Web Admin Dashboard shell wraps every /admin route with a secure gate
// (admin-only) and the sidebar/topbar navigation. It shares the same backend
// and database as the mobile app.
export default function AdminLayout() {
  return (
    <AdminShell>
      <Slot />
    </AdminShell>
  );
}

import type { Metadata } from "next";
import { AdminLogin } from "@/components/admin/admin-login";

export const metadata: Metadata = {
  title: "Ingreso",
  robots: { index: false },
};

export default function AdminLoginPage() {
  return <AdminLogin />;
}

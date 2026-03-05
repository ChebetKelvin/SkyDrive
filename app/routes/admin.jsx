// routes/admin.jsx
import { redirect, Outlet, useLoaderData } from "react-router";
import { getSession } from "../.server/session.js";
import { isAdmin } from "../.server/admin.js";
import AdminSidebar from "../components/Sidebar";
import { motion } from "framer-motion";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");

  if (!user) {
    return redirect("/login");
  }

  const admin = await isAdmin(user.id);
  if (!admin) {
    return redirect("/dashboard");
  }

  return { user };
}

export default function AdminLayout() {
  const { user } = useLoaderData();

  return (
    <div className="min-h-screen bg-gray-50 flex pt-15">
      <AdminSidebar user={user} />

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 ml-64"
      >
        <div className="p-8">
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
}

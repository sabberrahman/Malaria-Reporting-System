import { useAuth } from "@/contexts/AuthContext";
import { FileText, MapPin, LayoutDashboard, Users, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";

import AdminDashboard from "@/components/AdminDashboard";
import UserManagement from "@/components/UserManagement";
import VillageAssignment from "@/components/VillageAssignment";
import AdminRecordReview from "@/components/AdminRecordReview";
import MasterDataManager from "@/components/MasterDataManager";
import AppHeader from "@/components/AppHeader";

type SectionKey = "overview" | "records" | "assignments" | "users" | "masterData";

const Admin = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionKey>("overview");

  if (role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive text-lg font-medium">Access Denied</p>
      </div>
    );
  }

  const sectionMeta = useMemo(() => ({
    overview:    { title: "Overview",             subtitle: "Summary of system activity and pending actions." },
    records:     { title: "Submitted Records",    subtitle: "Review SK submissions and approve monthly reporting." },
    assignments: { title: "Village Assignments",  subtitle: "Assign villages to SKs and manage existing assignments." },
    users:       { title: "User Management",      subtitle: "Add users and view their assigned villages." },
    masterData:  { title: "Master Data",          subtitle: "Manage districts, upazilas, unions, and villages." },
  }), []);

  const SectionCard = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
    <section className="rounded-xl border bg-white shadow-sm">
      <div className="p-4 md:p-6 border-b">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs md:text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className="p-4 md:p-6">{children}</div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      <AppHeader
        title="Admin Panel"
        subtitle="Manage records, assignments, users, and master data from one responsive admin workspace."
        backLabel="Back to Reporting"
        onBack={() => navigate("/")}
        navItems={[
          { id: "overview", label: "Overview", icon: <LayoutDashboard className="mr-2 h-4 w-4" />, active: activeSection === "overview", onClick: () => setActiveSection("overview") },
          { id: "records", label: "Records", icon: <FileText className="mr-2 h-4 w-4" />, active: activeSection === "records", onClick: () => setActiveSection("records") },
          { id: "assignments", label: "Assignments", icon: <MapPin className="mr-2 h-4 w-4" />, active: activeSection === "assignments", onClick: () => setActiveSection("assignments") },
          { id: "users", label: "Users", icon: <Users className="mr-2 h-4 w-4" />, active: activeSection === "users", onClick: () => setActiveSection("users") },
          { id: "masterData", label: "Master Data", icon: <Database className="mr-2 h-4 w-4" />, active: activeSection === "masterData", onClick: () => setActiveSection("masterData") },
        ]}
      />

      <main className="mx-auto w-full max-w-[1800px] space-y-6 p-3 sm:p-4 md:p-6">
        {activeSection === "overview" && (
          <>
            <SectionCard title={sectionMeta.overview.title} subtitle={sectionMeta.overview.subtitle}>
              <AdminDashboard />
            </SectionCard>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {([
                { id: "records",     icon: <FileText className="h-5 w-5" />,     label: "Review Records",  color: "text-blue-600 bg-blue-50" },
                { id: "assignments", icon: <MapPin className="h-5 w-5" />,       label: "Assign Villages", color: "text-violet-600 bg-violet-50" },
                { id: "users",       icon: <Users className="h-5 w-5" />,        label: "Manage Users",    color: "text-green-600 bg-green-50" },
                { id: "masterData",  icon: <Database className="h-5 w-5" />,     label: "Master Data",     color: "text-amber-600 bg-amber-50" },
              ] as { id: SectionKey; icon: React.ReactNode; label: string; color: string }[]).map((item) => (
                <button key={item.id} onClick={() => setActiveSection(item.id)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border bg-white hover:bg-gray-50 shadow-sm transition-all hover:shadow-md text-center">
                  <div className={`p-2 rounded-lg ${item.color}`}>{item.icon}</div>
                  <span className="text-xs font-medium text-gray-700">{item.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {activeSection === "records" && (
          <SectionCard title={sectionMeta.records.title} subtitle={sectionMeta.records.subtitle}>
            <AdminRecordReview />
          </SectionCard>
        )}
        {activeSection === "assignments" && (
          <SectionCard title={sectionMeta.assignments.title} subtitle={sectionMeta.assignments.subtitle}>
            <VillageAssignment />
          </SectionCard>
        )}
        {activeSection === "users" && (
          <SectionCard title={sectionMeta.users.title} subtitle={sectionMeta.users.subtitle}>
            <UserManagement />
          </SectionCard>
        )}
        {activeSection === "masterData" && (
          <SectionCard title={sectionMeta.masterData.title} subtitle={sectionMeta.masterData.subtitle}>
            <MasterDataManager />
          </SectionCard>
        )}
      </main>
    </div>
  );
};

export default Admin;

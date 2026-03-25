import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import LocalRecordsGrid from "@/components/LocalRecordsGrid";
import NonLocalRecordsGrid from "@/components/NonLocalRecordsGrid";
import { LogOut, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";

const Dashboard = () => {
  const { profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const isAdmin = role === "admin";

  return (
    <Tabs defaultValue="local" className="min-h-screen bg-gray-50">
      <AppHeader
        title="Malaria Reporting System"
        subtitle="Review and update local and non-local reporting data from one workspace."
        actions={
          <>
            <div className="order-2 flex min-w-0 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 sm:order-1">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">{profile?.full_name || profile?.email}</p>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">{role}</p>
              </div>
            </div>

            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin")}
                className="order-1 h-9 rounded-xl border-gray-200 px-3 text-gray-800 shadow-sm hover:border-gray-300 hover:bg-gray-50 sm:order-2"
              >
                <Shield className="mr-2 h-4 w-4" /> Admin
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="order-3 h-9 rounded-xl border-gray-200 px-3 text-gray-700 shadow-sm hover:border-gray-300 hover:bg-gray-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </>
        }
      />

      <main className="mx-auto w-full max-w-[1800px] p-3 sm:p-4 md:p-6">
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-3 py-3 sm:px-4 md:px-6">
            <TabsList className="grid h-auto w-full grid-cols-2 rounded-xl bg-gray-100 p-1 sm:w-fit">
              <TabsTrigger value="local" className="px-4 py-2">
                Local
              </TabsTrigger>
              <TabsTrigger value="non-local" className="px-4 py-2">
                Non-Local
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="px-3 py-3 sm:px-4 md:px-6 md:py-5">
            <TabsContent value="local" className="m-0">
              <LocalRecordsGrid />
            </TabsContent>

            <TabsContent value="non-local" className="m-0">
              <NonLocalRecordsGrid />
            </TabsContent>
          </div>
        </div>
      </main>
    </Tabs>
  );
};

export default Dashboard;

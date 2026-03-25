import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LocalRecordsGrid from "@/components/LocalRecordsGrid";
import NonLocalRecordsGrid from "@/components/NonLocalRecordsGrid";
import { LogOut, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Dashboard = () => {
  const { profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const isAdmin = role === "admin";
  const [activeTab, setActiveTab] = useState("local");
  const userLabel = profile?.full_name || profile?.email || "User";
  const initials = userLabel
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="min-h-screen bg-gray-50">
      <AppHeader
        title="Malaria Reporting System"
        subtitle="Review and update local and non-local reporting data from one workspace."
        actions={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center rounded-full border border-gray-200 bg-white p-1 shadow-sm transition hover:border-gray-300 hover:bg-gray-50">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-sky-100 text-xs font-semibold text-sky-700">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                <DropdownMenuLabel className="rounded-xl px-3 py-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-sky-100 text-sm font-semibold text-sky-700">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{userLabel}</p>
                      <p className="truncate text-xs text-slate-500">{profile?.email}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">{role}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem className="rounded-xl px-3 py-2.5" onClick={() => navigate("/admin")}>
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-xl px-3 py-2.5 text-red-600 focus:text-red-600" onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

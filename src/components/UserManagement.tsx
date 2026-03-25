import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, ChevronDown, ChevronUp, UserPlus } from "lucide-react";

interface Assignment { id: string; village_name: string; district_name: string; reporting_year: number; }

interface SKUser {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  assignments: Assignment[];
}

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers]           = useState<SKUser[]>([]);
  const [loading, setLoading]       = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm]     = useState(false);
  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [role, setRole]             = useState("sk");
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, full_name, email");
      if (profileError) throw profileError;

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("user_id, role");
      if (roleError) throw roleError;

      const { data: assignData } = await supabase
        .from("local_records")
        .select(`id, sk_user_id, reporting_year, villages ( name, unions ( upazilas ( districts ( name ) ) ) )`);

      const roleMap = new Map<string, string>();
      (roleData || []).forEach((entry) => {
        roleMap.set(entry.user_id, entry.role);
      });

      const assignMap: Record<string, Assignment[]> = {};
      (assignData || []).forEach((r: any) => {
        const a: Assignment = {
          id: r.id,
          village_name:  r.villages?.name ?? "—",
          district_name: r.villages?.unions?.upazilas?.districts?.name ?? "—",
          reporting_year: r.reporting_year,
        };
        if (!assignMap[r.sk_user_id]) assignMap[r.sk_user_id] = [];
        assignMap[r.sk_user_id].push(a);
      });

      setUsers(
        (profileData || []).map((p: any) => ({
          user_id: p.user_id,
          full_name: p.full_name,
          email: p.email,
          role: roleMap.get(p.user_id) ?? "sk",
          assignments: assignMap[p.user_id] || [],
        }))
      );
    } catch (err: any) {
      toast({ title: "Load error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email, password, options: { data: { full_name: name } },
      });
      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error("No user returned");

      const { error: roleError } = await supabase
        .from("user_roles")
        .upsert({ user_id: signUpData.user.id, role }, { onConflict: "user_id" });
      if (roleError) throw roleError;

      toast({ title: `User ${email} created` });
      setName(""); setEmail(""); setPassword(""); setRole("sk");
      setShowForm(false);
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Create error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{users.length} users total</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>
            <UserPlus className="h-3.5 w-3.5 mr-1" />
            {showForm ? "Cancel" : "Add User"}
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-lg border p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Create New User</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                placeholder="SK Rahim Uddin"
                className="w-full p-2 border rounded-md text-xs focus:ring-2 focus:ring-gray-400 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                placeholder="sk2@test.com"
                className="w-full p-2 border rounded-md text-xs focus:ring-2 focus:ring-gray-400 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                placeholder="Min 6 characters"
                className="w-full p-2 border rounded-md text-xs focus:ring-2 focus:ring-gray-400 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}
                className="w-full p-2 border rounded-md text-xs focus:ring-2 focus:ring-gray-400 focus:outline-none">
                <option value="sk">SK</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {submitting ? "Creating…" : "Create User"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="border rounded-md overflow-hidden divide-y">
        {loading && <div className="px-4 py-8 text-center text-xs text-muted-foreground">Loading…</div>}
        {!loading && users.length === 0 && <div className="px-4 py-8 text-center text-xs text-muted-foreground">No users found</div>}

        {users.map((u) => {
          const isExpanded = expandedId === u.user_id;
          return (
            <div key={u.user_id} className="bg-white">
              <div
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : u.user_id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    u.role === "admin" ? "bg-gray-900 text-white" : "bg-blue-100 text-blue-700"
                  }`}>
                    {(u.full_name || u.email || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900">{u.full_name || "—"}</p>
                    <p className="text-[11px] text-gray-400">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    u.role === "admin" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 border border-gray-200"
                  }`}>{u.role}</span>
                  {u.role === "sk" && (
                    <>
                      <span className="text-[11px] text-gray-400">{u.assignments.length} village{u.assignments.length !== 1 ? "s" : ""}</span>
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-gray-400" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400" />}
                    </>
                  )}
                </div>
              </div>

              {isExpanded && u.role === "sk" && (
                <div className="bg-gray-50 border-t px-4 py-3">
                  {u.assignments.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No villages assigned. Go to Assign Villages to add.</p>
                  ) : (
                    <>
                      <p className="text-[11px] font-semibold text-gray-500 mb-2 uppercase tracking-wide">Assigned Villages</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                        {u.assignments.map((a) => (
                          <div key={a.id} className="flex items-center justify-between bg-white border rounded-md px-3 py-1.5 text-xs">
                            <div>
                              <span className="font-medium text-gray-800">{a.village_name}</span>
                              <span className="text-gray-400 ml-1.5">— {a.district_name}</span>
                            </div>
                            <span className="text-[10px] text-gray-400 ml-2">{a.reporting_year}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserManagement;

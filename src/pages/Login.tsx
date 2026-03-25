import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Login = () => {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err: unknown) {
      toast({
        title: "Login failed",
        description:
          err instanceof Error
            ? err.message
            : "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell relative flex min-h-screen items-center justify-center p-4">
      <div className="pointer-events-none absolute -top-24 left-[10%] h-64 w-64 rounded-full bg-sky-200/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-[10%] h-72 w-72 rounded-full bg-blue-100/35 blur-3xl" />

      <Card className="glass-panel w-full max-w-lg rounded-[30px] border shadow-[0_24px_80px_rgba(148,163,184,0.22)]">
        <CardHeader className="space-y-2 pb-5 pt-7 text-center sm:pb-6 sm:pt-8">
          <CardTitle className="text-2xl tracking-tight text-slate-900 sm:text-[1.5rem]">
            Malaria Annual Reporting
          </CardTitle>
          <p className="text-sm text-slate-500 sm:text-base">Sign in to continue</p>
        </CardHeader>

        <CardContent className="space-y-5 sm:space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 rounded-xl bg-white/70 border-black/10 px-4 text-base text-slate-900 placeholder:text-slate-400 focus-visible:ring-sky-200 sm:h-11 sm:text-base"
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 rounded-xl bg-white/70 border-black/10 px-4 text-base text-slate-900 placeholder:text-slate-400 focus-visible:ring-sky-200 sm:h-11 sm:text-base"
            />

            <Button
              type="submit"
              className="h-11 w-full rounded-xl bg-slate-900 text-base text-white shadow-sm hover:bg-slate-800 sm:h-11 sm:text-base"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="rounded-2xl border border-black/20 bg-white/72 p-4  backdrop-blur sm:p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 sm:text-sm">
              Demo credentials
            </p>
            <div className="mt-2 space-y-1 text-xs text-slate-500 sm:text-sm">
              <p>
                <span className="font-semibold text-slate-900">Admin:</span>{" "}
                admin@test.com / 123456
              </p>
              <p>
                <span className="font-semibold text-slate-900">SK:</span>{" "}
                sk1@test.com / 123456
              </p>
            </div>
          </div>

          <p className="text-center text-[11px] text-slate-400 sm:text-xs">
            Authorized access only. Contact Admin for account support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

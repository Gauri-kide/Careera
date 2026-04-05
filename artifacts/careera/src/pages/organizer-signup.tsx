import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useOrganizerSignup } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

export default function OrganizerSignup() {
  const [, setLocation] = useLocation();
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    organizationName: "",
    collegeName: "",
    location: "",
    role: "Member" as "President" | "Member" | "Coordinator"
  });

  const mutation = useOrganizerSignup({
    mutation: {
      onSuccess: () => {
        setSuccessMsg("Application submitted! Your organizer account is pending admin approval. You will be notified once approved.");
        setErrorMsg("");
      },
      onError: (err: any) => {
        const msg = err?.data?.error || err?.message || "Signup failed. Please check your details and try again.";
        setErrorMsg(msg);
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!formData.name.trim()) { setErrorMsg("Please enter your full name."); return; }
    if (!formData.email.trim()) { setErrorMsg("Please enter your email address."); return; }
    if (formData.password.length < 6) { setErrorMsg("Password must be at least 6 characters."); return; }
    if (!formData.organizationName.trim()) { setErrorMsg("Please enter your organization or club name."); return; }
    if (!formData.collegeName.trim()) { setErrorMsg("Please enter your college name."); return; }
    if (!formData.location.trim()) { setErrorMsg("Please enter your location (city/state)."); return; }
    mutation.mutate({ data: formData });
  };

  if (successMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="p-10 max-w-md w-full text-center rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-foreground">Application Submitted!</h2>
          <p className="text-muted-foreground mb-6">{successMsg}</p>
          <Link href="/login">
            <Button className="w-full h-11 rounded-xl">Go to Login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto w-full">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="font-bold text-white text-sm">C</span>
          </div>
          <span className="font-bold text-2xl text-primary">Careera</span>
        </Link>

        <Card className="p-8 shadow-xl border-border/50 rounded-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Organizer Registration</h2>
            <p className="text-muted-foreground">Host events, manage attendees, and grow your community.</p>
            <div className="mt-3 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl px-4 py-2">
              <span>⏳</span> Account requires admin approval before access
            </div>
          </div>

          {errorMsg && (
            <div className="mb-6 flex items-start gap-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>Your Name *</Label>
                <Input required className="h-11 rounded-xl" placeholder="Priya Patel" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input required type="email" className="h-11 rounded-xl" placeholder="you@college.edu" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Password *</Label>
                <Input required type="password" className="h-11 rounded-xl" placeholder="Min. 6 characters" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Organization / Club Name *</Label>
                <Input required className="h-11 rounded-xl" placeholder="Tech Club BITS" value={formData.organizationName} onChange={e => setFormData({ ...formData, organizationName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>College Name *</Label>
                <Input required className="h-11 rounded-xl" placeholder="BITS Pilani / IIT Delhi..." value={formData.collegeName} onChange={e => setFormData({ ...formData, collegeName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Location (City / State) *</Label>
                <Input required className="h-11 rounded-xl" placeholder="Mumbai, Maharashtra" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Your Role in Organization</Label>
              <Select value={formData.role} onValueChange={(v: any) => setFormData({ ...formData, role: v })}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="President">President</SelectItem>
                  <SelectItem value="Coordinator">Coordinator</SelectItem>
                  <SelectItem value="Member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" variant="secondary" className="w-full h-12 rounded-xl text-base font-semibold shadow-md" disabled={mutation.isPending}>
              {mutation.isPending ? "Submitting Application..." : "Apply as Organizer"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">Log in</Link>
          </div>
          <div className="mt-2 text-center text-sm text-muted-foreground">
            Registering as a student?{" "}
            <Link href="/signup" className="text-primary font-medium hover:underline">Student signup</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

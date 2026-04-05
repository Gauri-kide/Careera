import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useSignup } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { INTEREST_OPTIONS, cn } from "@/lib/utils";
import { X, Plus, AlertCircle } from "lucide-react";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    collegeName: "",
    pastExperience: "",
    referralCode: ""
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInterestInput, setCustomInterestInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const signupMutation = useSignup({
    mutation: {
      onSuccess: () => {
        toast({ title: "Welcome to Careera!", description: "Your account has been created." });
        setLocation("/dashboard");
      },
      onError: (err: any) => {
        const msg = err?.data?.error || err?.message || "Signup failed. Please try again.";
        setErrorMsg(msg);
      }
    }
  });

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const addCustomInterest = () => {
    const trimmed = customInterestInput.trim();
    if (trimmed && !selectedInterests.includes(trimmed)) {
      setSelectedInterests(prev => [...prev, trimmed]);
    }
    setCustomInterestInput("");
  };

  const removeInterest = (interest: string) => {
    setSelectedInterests(prev => prev.filter(i => i !== interest));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!formData.fullName.trim()) { setErrorMsg("Please enter your full name."); return; }
    if (!formData.email.trim()) { setErrorMsg("Please enter your email address."); return; }
    if (formData.password.length < 6) { setErrorMsg("Password must be at least 6 characters."); return; }
    if (!formData.collegeName.trim()) { setErrorMsg("Please enter your college name."); return; }
    if (selectedInterests.length === 0) { setErrorMsg("Please add at least one interest."); return; }
    
    signupMutation.mutate({
      data: { ...formData, interests: selectedInterests }
    });
  };

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
            <h2 className="text-3xl font-bold mb-2">Student Registration</h2>
            <p className="text-muted-foreground">Join to discover events tailored to your goals.</p>
          </div>

          {errorMsg && (
            <div className="mb-6 flex items-start gap-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input id="fullName" required className="h-11 rounded-xl" placeholder="Aarav Sharma" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" required type="email" className="h-11 rounded-xl" placeholder="you@college.edu" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input id="password" required type="password" className="h-11 rounded-xl" placeholder="Min. 6 characters" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="college">College Name *</Label>
                <Input id="college" required className="h-11 rounded-xl" placeholder="BITS Pilani / IIT Delhi..." value={formData.collegeName} onChange={e => setFormData({ ...formData, collegeName: e.target.value })} />
              </div>
            </div>

            {/* Interests Section */}
            <div className="space-y-3">
              <Label>Interests * <span className="text-muted-foreground font-normal text-xs ml-1">(select or type your own)</span></Label>

              {/* Quick select chips */}
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150",
                      selectedInterests.includes(interest)
                        ? "bg-secondary text-white border-secondary shadow-sm"
                        : "bg-background text-muted-foreground border-border hover:border-secondary/60 hover:text-foreground"
                    )}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              {/* Custom interest input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Type your own interest (e.g. Robotics, Photography...)"
                  className="h-10 rounded-xl flex-1"
                  value={customInterestInput}
                  onChange={e => setCustomInterestInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomInterest(); } }}
                />
                <Button type="button" variant="outline" className="h-10 px-4 rounded-xl" onClick={addCustomInterest}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Selected interests display */}
              {selectedInterests.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedInterests.map(interest => (
                    <span key={interest} className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/15 text-secondary border border-secondary/30 rounded-full text-sm font-medium">
                      {interest}
                      <button type="button" onClick={() => removeInterest(interest)} className="hover:text-destructive transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Past Experience <span className="text-muted-foreground font-normal text-xs">(Optional)</span></Label>
              <Textarea
                id="experience"
                placeholder="Briefly describe your skills, hackathons you've participated in, projects..."
                className="resize-none h-24 rounded-xl"
                value={formData.pastExperience}
                onChange={e => setFormData({ ...formData, pastExperience: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referral">Referral Code <span className="text-muted-foreground font-normal text-xs">(Optional)</span></Label>
              <Input id="referral" className="h-11 rounded-xl" placeholder="Enter referral code if you have one" value={formData.referralCode} onChange={e => setFormData({ ...formData, referralCode: e.target.value })} />
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold shadow-md shadow-primary/20" disabled={signupMutation.isPending}>
              {signupMutation.isPending ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">Log in</Link>
          </div>
          <div className="mt-2 text-center text-sm text-muted-foreground">
            Registering as an organizer?{" "}
            <Link href="/organizer-signup" className="text-secondary font-medium hover:underline">Organizer signup</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

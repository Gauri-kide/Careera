import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogin, useGetMe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        toast({ title: "Welcome back!", description: data.message });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        
        if (data.user.role === "admin") setLocation("/admin");
        else if (data.user.role === "organizer") setLocation(data.user.isApproved ? "/organizer" : "/pending-approval");
        else setLocation("/dashboard");
      },
      onError: (error) => {
        toast({ title: "Login failed", description: error.error || "Invalid credentials", variant: "destructive" });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { email, password } });
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex flex-1 relative items-center justify-center bg-primary overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/auth-bg.png`}
            alt="Auth background" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/90 to-primary/40" />
        </div>
        <div className="relative z-10 text-white max-w-lg px-12">
          <h1 className="font-display text-5xl font-bold mb-6">Welcome Back to Careera</h1>
          <p className="text-xl text-primary-foreground/80 leading-relaxed">
            Your personalized dashboard awaits. Discover the next event that will boost your career journey.
          </p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-12 lg:px-24">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <span className="font-display font-bold text-white">C</span>
            </div>
            <span className="font-display font-bold text-2xl text-foreground">Careera</span>
          </Link>
          
          <Card className="p-8 shadow-2xl border-border/50 rounded-2xl">
            <h2 className="text-2xl font-bold mb-2">Log In</h2>
            <p className="text-muted-foreground mb-8">Enter your credentials to access your account.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl text-md font-semibold"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Logging in..." : "Log In"}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary font-medium hover:underline">
                Sign up as Student
              </Link>
              {" or "}
              <Link href="/organizer-signup" className="text-secondary font-medium hover:underline">
                Organizer
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

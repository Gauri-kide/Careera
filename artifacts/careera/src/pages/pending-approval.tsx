import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLogout } from "@workspace/api-client-react";
import { Clock } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function PendingApproval() {
  const queryClient = useQueryClient();
  const logoutMut = useLogout({
    mutation: {
      onSuccess: () => {
        queryClient.clear();
        window.location.href = "/login";
      }
    }
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center shadow-2xl border-border/50 rounded-3xl">
        <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-4">Application Pending</h1>
        <p className="text-muted-foreground leading-relaxed mb-8">
          Your organizer account has been created and is currently awaiting admin approval. 
          We'll notify you once your account is ready to use.
        </p>
        <Button variant="outline" className="w-full h-12 rounded-xl" onClick={() => logoutMut.mutate()}>
          Log out
        </Button>
      </Card>
    </div>
  );
}

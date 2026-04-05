import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { INTEREST_OPTIONS, cn } from "@/lib/utils";
import { X, Plus, ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface ProfileEditFormProps {
  user: any;
  onDone: () => void;
}

export function ProfileEditForm({ user, onDone }: ProfileEditFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [collegeName, setCollegeName] = useState(user?.collegeName || "");
  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  const [customInput, setCustomInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const addCustom = () => {
    const t = customInput.trim();
    if (t && !interests.includes(t)) setInterests(prev => [...prev, t]);
    setCustomInput("");
  };

  const removeInterest = (i: string) => setInterests(prev => prev.filter(x => x !== i));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { toast({ title: "Name is required", variant: "destructive" }); return; }
    setIsSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, collegeName, interests }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save");
      }
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Profile updated!", description: "Your changes have been saved." });
      onDone();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="p-6 border-border/50">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" className="rounded-xl" onClick={onDone}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h3 className="text-xl font-bold">Edit Profile</h3>
          <p className="text-sm text-muted-foreground">Update your personal information</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input
              className="h-11 rounded-xl"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              className="h-11 rounded-xl bg-muted/30"
              value={user?.email || ""}
              disabled
              title="Email cannot be changed"
            />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label>College Name</Label>
            <Input
              className="h-11 rounded-xl"
              value={collegeName}
              onChange={e => setCollegeName(e.target.value)}
              placeholder="Your college name"
            />
          </div>
        </div>

        {/* Interests */}
        <div className="space-y-3">
          <Label>Interests <span className="text-muted-foreground font-normal text-xs">(select or type your own)</span></Label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => toggleInterest(opt)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                  interests.includes(opt)
                    ? "bg-secondary text-white border-secondary"
                    : "bg-background text-muted-foreground border-border hover:border-secondary/60"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add custom interest (e.g. Robotics)..."
              className="h-10 rounded-xl flex-1"
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
            />
            <Button type="button" variant="outline" className="h-10 px-4 rounded-xl" onClick={addCustom}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {interests.map(i => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-sm font-medium">
                  {i}
                  <button type="button" onClick={() => removeInterest(i)} className="hover:text-destructive transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onDone} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1 rounded-xl font-semibold" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

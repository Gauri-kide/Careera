import { useState } from "react";
import { useRoute } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetEvent, useRegisterForEvent, useGetMe } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar, MapPin, Building, Tag, CheckCircle2, Clock, IndianRupee, Users } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function EventDetail() {
  const [, params] = useRoute("/events/:id");
  const eventId = params?.id ? parseInt(params.id) : 0;
  const { data: event, isLoading } = useGetEvent(eventId);
  const { data: user } = useGetMe();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    yearOfStudy: "",
    department: "",
    experience: "",
  });

  const registerMut = useRegisterForEvent({
    mutation: {
      onSuccess: () => {
        toast({ title: "Registration Successful! 🎉", description: "You are now registered for this event. Check your Registered Events tab." });
        queryClient.invalidateQueries({ queryKey: ["/api/events"] });
        queryClient.invalidateQueries({ queryKey: ["/api/users/registrations"] });
        setShowForm(false);
      },
      onError: (err: any) => {
        const msg = err?.data?.error || err?.message || "Registration failed";
        toast({ title: "Registration Failed", description: msg, variant: "destructive" });
      }
    }
  });

  // Pre-fill form with user data
  const openForm = () => {
    setFormData({
      name: user?.fullName || "",
      email: user?.email || "",
      phone: "",
      college: user?.collegeName || "",
      yearOfStudy: "",
      department: "",
      experience: "",
    });
    setShowForm(true);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.yearOfStudy) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    registerMut.mutate({ id: eventId });
  };

  if (isLoading) {
    return (
      <DashboardLayout role="user">
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!event) return <DashboardLayout role="user"><p className="text-muted-foreground">Event not found.</p></DashboardLayout>;

  const isClosed = event.status === "closed" || event.status === "cancelled" || new Date() > new Date(event.registrationDeadline);

  const statusColors: Record<string, string> = {
    upcoming: "bg-emerald-100 text-emerald-700 border-emerald-200",
    deadline_soon: "bg-amber-100 text-amber-700 border-amber-200",
    closed: "bg-slate-100 text-slate-600 border-slate-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <DashboardLayout role="user">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Banner */}
        <div className="w-full h-48 md:h-60 rounded-2xl bg-gradient-to-tr from-primary via-primary/80 to-secondary relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-0 inset-x-0 p-8 text-white">
            <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border mb-3 ${statusColors[event.status] || ""}`}>
              {event.status.replace("_", " ").toUpperCase()}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{event.name}</h1>
            <p className="mt-1 text-white/80 text-sm">{event.organizationName || event.organizerName}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-5">
            <Card className="p-7 border-border/50 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-foreground">About this Event</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{event.description}</p>

              {event.tags && event.tags.length > 0 && (
                <div className="mt-6 pt-5 border-t border-border/50">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Event Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
                        <Tag className="w-3 h-3 mr-1" /> {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Organizer Info */}
            <Card className="p-7 border-border/50 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-foreground">Organizer Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="text-muted-foreground">Organization: </span>
                    <span className="font-medium">{event.organizationName || "—"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="text-muted-foreground">Organizer: </span>
                    <span className="font-medium">{event.organizerName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-secondary shrink-0" />
                  <div>
                    <span className="text-muted-foreground">College: </span>
                    <span className="font-medium">{event.collegeName}</span>
                  </div>
                </div>
              </div>
              {event.registrationCount !== undefined && (
                <div className="mt-5 pt-4 border-t border-border/50 flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground"><span className="font-semibold text-foreground">{event.registrationCount}</span> student{event.registrationCount !== 1 ? "s" : ""} registered</span>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <Card className="p-6 border-border/50 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Event Info</h3>
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Event Date</p>
                    <p className="font-semibold text-sm">{format(new Date(event.eventDate), "EEEE, MMM d, yyyy")}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(event.eventDate), "h:mm a")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Location</p>
                    <p className="font-semibold text-sm">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Registration Deadline</p>
                    <p className="font-semibold text-sm text-amber-600">{format(new Date(event.registrationDeadline), "MMM d, yyyy · h:mm a")}</p>
                  </div>
                </div>

                {event.registrationStartDate && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Registration Opens</p>
                      <p className="font-semibold text-sm">{format(new Date(event.registrationStartDate), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <IndianRupee className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Registration Fee</p>
                    <p className="font-bold text-lg text-primary">
                      {event.fees && event.fees > 0 ? `₹${event.fees}` : "Free"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-border/50">
                {event.isRegistered ? (
                  <Button disabled className="w-full h-11 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 opacity-100">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> You're Registered
                  </Button>
                ) : (
                  <Button
                    className="w-full h-11 font-semibold shadow-md shadow-primary/20"
                    onClick={openForm}
                    disabled={isClosed || registerMut.isPending}
                  >
                    {isClosed ? "Registration Closed" : "Register Now →"}
                  </Button>
                )}
                {isClosed && !event.isRegistered && (
                  <p className="text-xs text-muted-foreground text-center mt-2">The registration deadline has passed.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Registration Form Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register for {event.name}</DialogTitle>
            <DialogDescription>Fill in your details to complete registration. Fields marked * are required.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegisterSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name *</Label>
                <Input className="rounded-lg" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Your full name" required />
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input className="rounded-lg" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="you@college.edu" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Phone Number *</Label>
                <Input className="rounded-lg" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 98765 43210" required />
              </div>
              <div className="space-y-1.5">
                <Label>Year of Study *</Label>
                <Select value={formData.yearOfStudy} onValueChange={v => setFormData({ ...formData, yearOfStudy: v })}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st Year">1st Year</SelectItem>
                    <SelectItem value="2nd Year">2nd Year</SelectItem>
                    <SelectItem value="3rd Year">3rd Year</SelectItem>
                    <SelectItem value="4th Year">4th Year</SelectItem>
                    <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>College Name</Label>
              <Input className="rounded-lg" value={formData.college} onChange={e => setFormData({ ...formData, college: e.target.value })} placeholder="Your college" />
            </div>
            <div className="space-y-1.5">
              <Label>Department / Branch</Label>
              <Input className="rounded-lg" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} placeholder="e.g. Computer Science, Electronics..." />
            </div>
            <div className="space-y-1.5">
              <Label>Relevant Experience <span className="text-muted-foreground font-normal text-xs">(Optional)</span></Label>
              <Input className="rounded-lg" value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })} placeholder="Any relevant skills or past experience..." />
            </div>

            {event.fees && event.fees > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
                <p className="font-semibold text-amber-700">Registration Fee: ₹{event.fees}</p>
                <p className="text-amber-600 mt-0.5">Payment details will be shared after registration confirmation.</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" className="flex-1 rounded-xl font-semibold" disabled={registerMut.isPending}>
                {registerMut.isPending ? "Registering..." : "Confirm Registration"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

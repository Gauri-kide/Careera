import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetEvents, useGetMe, useGetNotifications, useGetReferrals, useGetUserRegistrations, useMarkNotificationRead } from "@workspace/api-client-react";
import { EventCard } from "@/components/shared/event-card";
import { Card } from "@/components/ui/card";
import { Bell, Copy, Sparkles, User, Link as LinkIcon, CalendarCheck, AlignLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ProfileEditForm } from "@/components/shared/profile-edit-form";

export default function StudentDashboard() {
  const { data: user } = useGetMe();
  const { data: events, isLoading } = useGetEvents();
  const { data: notifications } = useGetNotifications();
  const { data: referrals } = useGetReferrals();
  const { data: registrations, isLoading: regsLoading } = useGetUserRegistrations();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const markRead = useMarkNotificationRead();

  const [regSubTab, setRegSubTab] = useState<"upcoming" | "past">("upcoming");
  const [editingProfile, setEditingProfile] = useState(false);

  const now = new Date();

  // Events For You: match by interest tags
  const eventsForYou = (events || []).filter(e =>
    e.status !== "closed" && e.status !== "cancelled" &&
    e.tags?.some(tag => user?.interests?.some((i: string) =>
      i.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(i.toLowerCase())
    ))
  );
  const allActiveEvents = (events || []).filter(e => e.status !== "cancelled");

  // Registered events split
  const upcomingRegs = (registrations || []).filter(r => r.event && new Date(r.event.eventDate) >= now);
  const pastRegs = (registrations || []).filter(r => r.event && new Date(r.event.eventDate) < now);

  const unreadCount = (notifications || []).filter(n => !n.isRead).length;

  const copyReferral = () => {
    if (referrals?.referralCode) {
      navigator.clipboard.writeText(referrals.referralCode);
      toast({ title: "Copied!", description: "Referral code copied to clipboard." });
    }
  };

  const handleMarkRead = (id: number) => {
    markRead.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] })
    });
  };

  return (
    <DashboardLayout role="user">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.fullName?.split(" ")[0]}!</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">Here's what's happening around you.</p>
      </div>

      <Tabs defaultValue="recommended" className="w-full">
        <TabsList className="bg-card border border-border/50 h-auto p-1 rounded-xl shadow-sm mb-6 flex flex-wrap gap-1 w-full">
          <TabsTrigger value="recommended" className="rounded-lg py-2 px-3 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Events For You
          </TabsTrigger>
          <TabsTrigger value="all" className="rounded-lg py-2 px-3 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5" /> All Events
          </TabsTrigger>
          <TabsTrigger value="registered" className="rounded-lg py-2 px-3 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5">
            <CalendarCheck className="w-3.5 h-3.5" /> Registered Events
            {(registrations?.length ?? 0) > 0 && (
              <span className="ml-1 bg-secondary text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
                {registrations!.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg py-2 px-3 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5" /> Notifications
            {unreadCount > 0 && (
              <span className="ml-1 bg-destructive text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="profile" className="rounded-lg py-2 px-3 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Profile
          </TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Events For You */}
            <TabsContent value="recommended" className="mt-0">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground">Events For You</h2>
                <p className="text-sm text-muted-foreground">Personalized based on your interests: {user?.interests?.join(", ")}</p>
              </div>
              {eventsForYou.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {eventsForYou.map(event => <EventCard key={event.id} event={event} />)}
                </div>
              ) : (
                <Card className="py-20 text-center text-muted-foreground border-dashed">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="font-medium">No personalized recommendations yet.</p>
                  <p className="text-sm mt-1">Update your interests in Profile to see tailored events!</p>
                </Card>
              )}
            </TabsContent>

            {/* All Events */}
            <TabsContent value="all" className="mt-0">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground">All Events</h2>
                <p className="text-sm text-muted-foreground">{allActiveEvents.length} event{allActiveEvents.length !== 1 ? "s" : ""} available</p>
              </div>
              {allActiveEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {allActiveEvents.map(event => <EventCard key={event.id} event={event} />)}
                </div>
              ) : (
                <Card className="py-20 text-center text-muted-foreground border-dashed">
                  <p>No events available right now. Check back soon!</p>
                </Card>
              )}
            </TabsContent>

            {/* Registered Events */}
            <TabsContent value="registered" className="mt-0">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground">Registered Events</h2>
                <p className="text-sm text-muted-foreground">Events you've signed up for</p>
              </div>

              {/* Sub-tab toggle */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setRegSubTab("upcoming")}
                  className={`px-5 py-2 rounded-full text-sm font-medium border transition-all ${regSubTab === "upcoming" ? "bg-secondary text-white border-secondary" : "bg-card border-border text-muted-foreground hover:border-secondary/50"}`}
                >
                  Upcoming ({upcomingRegs.length})
                </button>
                <button
                  onClick={() => setRegSubTab("past")}
                  className={`px-5 py-2 rounded-full text-sm font-medium border transition-all ${regSubTab === "past" ? "bg-primary text-white border-primary" : "bg-card border-border text-muted-foreground hover:border-primary/50"}`}
                >
                  Past ({pastRegs.length})
                </button>
              </div>

              {regsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : regSubTab === "upcoming" ? (
                upcomingRegs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {upcomingRegs.map(reg => reg.event && <EventCard key={reg.id} event={reg.event} showRegisteredBadge />)}
                  </div>
                ) : (
                  <Card className="py-16 text-center text-muted-foreground border-dashed">
                    <CalendarCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No upcoming registered events.</p>
                    <p className="text-sm mt-1">Browse All Events to find and register for events!</p>
                  </Card>
                )
              ) : (
                pastRegs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {pastRegs.map(reg => reg.event && <EventCard key={reg.id} event={reg.event} showRegisteredBadge showStatus={false} />)}
                  </div>
                ) : (
                  <Card className="py-16 text-center text-muted-foreground border-dashed">
                    <p className="font-medium">No past events yet.</p>
                    <p className="text-sm mt-1">Events you've attended will appear here.</p>
                  </Card>
                )
              )}
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications" className="mt-0">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
                {unreadCount > 0 && <p className="text-sm text-muted-foreground">{unreadCount} unread notification{unreadCount > 1 ? "s" : ""}</p>}
              </div>
              <div className="space-y-3">
                {notifications && notifications.length > 0 ? (
                  notifications.map(note => (
                    <div
                      key={note.id}
                      className={`p-4 rounded-xl border flex gap-4 items-start transition-colors ${note.isRead ? "bg-card border-border/50" : "bg-primary/5 border-primary/20"}`}
                    >
                      <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${note.isRead ? "bg-muted" : "bg-primary"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h4 className="font-semibold text-foreground text-sm">{note.title}</h4>
                          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{new Date(note.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{note.message}</p>
                      </div>
                      {!note.isRead && (
                        <Button variant="ghost" size="sm" className="text-xs h-7 shrink-0" onClick={() => handleMarkRead(note.id)}>
                          <Check className="w-3 h-3 mr-1" /> Mark read
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <Card className="py-16 text-center text-muted-foreground border-dashed">
                    <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p>No notifications yet.</p>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Profile */}
            <TabsContent value="profile" className="mt-0 space-y-5">
              {editingProfile ? (
                <ProfileEditForm user={user} onDone={() => setEditingProfile(false)} />
              ) : (
                <Card className="p-6 border-border/50">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold">Profile Details</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">Your account information</p>
                    </div>
                    <Button variant="outline" className="rounded-xl" onClick={() => setEditingProfile(true)}>Edit Profile</Button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5 text-sm">
                    <div>
                      <span className="text-muted-foreground block mb-1">Full Name</span>
                      <span className="font-semibold text-foreground">{user?.fullName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Email</span>
                      <span className="font-semibold text-foreground">{user?.email}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-muted-foreground block mb-1">College</span>
                      <span className="font-semibold text-foreground">{user?.collegeName || "—"}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-muted-foreground block mb-2">Interests</span>
                      <div className="flex flex-wrap gap-2">
                        {user?.interests?.length ? user.interests.map((i: string) => (
                          <span key={i} className="px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-xs font-medium">{i}</span>
                        )) : <span className="text-muted-foreground">None selected. Edit profile to add interests.</span>}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Referral */}
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg"><LinkIcon className="w-5 h-5" /></div>
                  <div>
                    <h3 className="text-lg font-bold">Referral Program</h3>
                    <p className="text-sm text-muted-foreground">Invite friends to Careera</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between">
                  <div className="flex-1 w-full bg-white rounded-xl border border-border p-4 flex justify-between items-center shadow-sm">
                    <span className="font-mono text-lg tracking-widest font-bold text-primary">{referrals?.referralCode || "—"}</span>
                    <Button variant="ghost" size="icon" onClick={copyReferral}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="bg-primary text-white px-6 py-4 rounded-xl text-center shadow-lg w-full sm:w-auto">
                    <div className="text-2xl font-bold">{referrals?.referralCount || 0}</div>
                    <div className="text-xs uppercase tracking-wider opacity-80">Referrals</div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </DashboardLayout>
  );
}

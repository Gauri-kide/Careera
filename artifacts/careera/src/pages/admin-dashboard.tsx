import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminGetStats, useAdminGetUsers, useAdminGetOrganizers, useApproveOrganizer, useRejectOrganizer, useAdminGetEvents, useAdminCreateAnnouncement, useAdminGetAnnouncements, useAdminDeleteAnnouncement } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Users, Building, Calendar as CalendarIcon, CheckCircle, XCircle, Megaphone, Activity, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function AdminDashboard() {
  const { data: stats } = useAdminGetStats();
  const { data: users } = useAdminGetUsers();
  const { data: organizers } = useAdminGetOrganizers();
  const { data: events } = useAdminGetEvents();
  const { data: announcements } = useAdminGetAnnouncements();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const approveMut = useApproveOrganizer({
    mutation: { onSuccess: () => { toast({ title: "Organizer approved!" }); queryClient.invalidateQueries({ queryKey: ["/api/admin/organizers"] }); queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] }); } }
  });
  const rejectMut = useRejectOrganizer({
    mutation: { onSuccess: () => { toast({ title: "Organizer rejected." }); queryClient.invalidateQueries({ queryKey: ["/api/admin/organizers"] }); queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] }); } }
  });
  const announceMut = useAdminCreateAnnouncement({
    mutation: {
      onSuccess: () => {
        toast({ title: "Announcement sent to all users!" });
        setAnn({ title: "", message: "", targetRole: "all" });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      },
      onError: (err: any) => {
        toast({ title: "Failed", description: err?.data?.error || err?.message, variant: "destructive" });
      }
    }
  });
  const deleteMut = useAdminDeleteAnnouncement({
    mutation: {
      onSuccess: () => {
        toast({ title: "Announcement deleted" });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      }
    }
  });

  const [ann, setAnn] = useState({ title: "", message: "", targetRole: "all" });

  const chartData = [
    { name: "Users", value: stats?.totalUsers || 0 },
    { name: "Organizers", value: stats?.totalOrganizers || 0 },
    { name: "Events", value: stats?.totalEvents || 0 },
    { name: "Regs", value: stats?.totalRegistrations || 0 },
  ];

  const pendingOrgs = (organizers || []).filter(o => !o.isApproved && !o.isRejected);
  const approvedOrgs = (organizers || []).filter(o => o.isApproved);

  return (
    <DashboardLayout role="admin">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Admin Control Panel</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">Platform overview and management.</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-card border border-border/50 h-auto p-1 rounded-xl shadow-sm mb-6 flex flex-wrap gap-1">
          <TabsTrigger value="overview" className="rounded-lg py-2 px-3 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="organizers" className="rounded-lg py-2 px-3 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5" /> Organizers
            {pendingOrgs.length > 0 && (
              <span className="ml-1 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full leading-none">{pendingOrgs.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-lg py-2 px-3 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Users
          </TabsTrigger>
          <TabsTrigger value="events" className="rounded-lg py-2 px-3 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5" /> Events
          </TabsTrigger>
          <TabsTrigger value="announcements" className="rounded-lg py-2 px-3 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5">
            <Megaphone className="w-3.5 h-3.5" /> Broadcasts
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-0 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Students", val: stats?.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Organizers", val: stats?.totalOrganizers, icon: Building, color: "text-cyan-600", bg: "bg-cyan-50" },
              { label: "Pending Approvals", val: stats?.pendingOrganizers, icon: CheckCircle, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Active Events", val: stats?.activeEvents, icon: CalendarIcon, color: "text-emerald-600", bg: "bg-emerald-50" },
            ].map((s, i) => (
              <Card key={i} className="p-5 border-border/50 shadow-sm flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.bg} ${s.color} shrink-0`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                  <h3 className="text-2xl font-bold">{s.val ?? 0}</h3>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-6 border-border/50 shadow-sm" style={{ height: 320 }}>
            <h3 className="text-base font-bold mb-4">Platform Metrics</h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {pendingOrgs.length > 0 && (
            <Card className="p-5 border-amber-200 bg-amber-50">
              <h3 className="font-semibold text-amber-800 mb-3">⏳ Pending Organizer Approvals ({pendingOrgs.length})</h3>
              <div className="space-y-2">
                {pendingOrgs.map(o => (
                  <div key={o.id} className="flex items-center justify-between bg-white rounded-xl p-3 border border-amber-200">
                    <div>
                      <p className="font-medium text-sm">{o.organizationName}</p>
                      <p className="text-xs text-muted-foreground">{o.name} · {o.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 h-8 text-xs" onClick={() => approveMut.mutate({ id: o.id })}>
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => rejectMut.mutate({ id: o.id })}>
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Organizers */}
        <TabsContent value="organizers" className="mt-0 space-y-4">
          {pendingOrgs.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-2">
                <span className="inline-flex w-5 h-5 bg-amber-500 text-white text-xs rounded-full items-center justify-center">{pendingOrgs.length}</span>
                Pending Approval
              </h3>
              <Card className="overflow-hidden border-amber-200">
                <table className="w-full text-sm text-left">
                  <thead className="bg-amber-50 text-amber-800">
                    <tr>
                      <th className="px-5 py-3">Organization</th>
                      <th className="px-5 py-3">Contact</th>
                      <th className="px-5 py-3">College</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {pendingOrgs.map(o => (
                      <tr key={o.id} className="hover:bg-muted/20">
                        <td className="px-5 py-4 font-medium">{o.organizationName}</td>
                        <td className="px-5 py-4">{o.name}<br /><span className="text-xs text-muted-foreground">{o.email}</span></td>
                        <td className="px-5 py-4">{o.collegeName}</td>
                        <td className="px-5 py-4 text-right space-x-2">
                          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 h-8" onClick={() => approveMut.mutate({ id: o.id })}>
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" className="h-8" onClick={() => rejectMut.mutate({ id: o.id })}>
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">All Organizers ({(organizers || []).length})</h3>
            <Card className="overflow-hidden border-border/50 shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3">Organization</th>
                    <th className="px-5 py-3">Contact</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {organizers?.map(o => (
                    <tr key={o.id} className="hover:bg-muted/20">
                      <td className="px-5 py-4 font-medium">{o.organizationName}</td>
                      <td className="px-5 py-4">{o.name}<br /><span className="text-xs text-muted-foreground">{o.email}</span></td>
                      <td className="px-5 py-4">
                        {o.isApproved ? <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">Approved</span> :
                          o.isRejected ? <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Rejected</span> :
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">Pending</span>}
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        {!o.isApproved && !o.isRejected && (
                          <>
                            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 h-8" onClick={() => approveMut.mutate({ id: o.id })}>Approve</Button>
                            <Button size="sm" variant="destructive" className="h-8" onClick={() => rejectMut.mutate({ id: o.id })}>Reject</Button>
                          </>
                        )}
                        {o.isRejected && (
                          <Button size="sm" variant="outline" className="h-8" onClick={() => approveMut.mutate({ id: o.id })}>Approve</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users" className="mt-0">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground">All Students ({(users || []).length})</h3>
          </div>
          <Card className="overflow-hidden border-border/50 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">College</th>
                    <th className="px-5 py-3">Interests</th>
                    <th className="px-5 py-3 text-right">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {users?.map(u => (
                    <tr key={u.id} className="hover:bg-muted/20">
                      <td className="px-5 py-4 font-medium">{u.fullName}</td>
                      <td className="px-5 py-4">{u.email}</td>
                      <td className="px-5 py-4">{u.collegeName || "—"}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(u.interests || []).slice(0, 3).map(i => (
                            <span key={i} className="px-2 py-0.5 bg-secondary/10 text-secondary rounded-full text-xs">{i}</span>
                          ))}
                          {(u.interests || []).length > 3 && <span className="text-xs text-muted-foreground">+{u.interests!.length - 3}</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right text-muted-foreground">{format(new Date(u.createdAt), "MMM d, yyyy")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Events */}
        <TabsContent value="events" className="mt-0">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground">All Events ({(events || []).length})</h3>
          </div>
          <Card className="overflow-hidden border-border/50 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3">Event Name</th>
                    <th className="px-5 py-3">Organizer</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3 text-center">Registrations</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {events?.map(e => (
                    <tr key={e.id} className="hover:bg-muted/20">
                      <td className="px-5 py-4 font-medium">{e.name}</td>
                      <td className="px-5 py-4">{e.organizationName || e.organizerName}</td>
                      <td className="px-5 py-4">{format(new Date(e.eventDate), "MMM d, yyyy")}</td>
                      <td className="px-5 py-4 text-center font-mono">{(e as any).registrationCount || 0}</td>
                      <td className="px-5 py-4 capitalize">
                        <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">{e.status.replace("_", " ")}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Broadcasts / Announcements */}
        <TabsContent value="announcements" className="mt-0">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Create form */}
            <Card className="p-6 border-border/50 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">New Broadcast</h3>
                  <p className="text-xs text-muted-foreground">Send platform-wide announcement</p>
                </div>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); announceMut.mutate({ data: ann as any }); }} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input required value={ann.title} onChange={e => setAnn({ ...ann, title: e.target.value })} placeholder="Announcement title" className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Message *</Label>
                  <Textarea required value={ann.message} onChange={e => setAnn({ ...ann, message: e.target.value })} className="h-28 rounded-xl resize-none" placeholder="Your message..." />
                </div>
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select value={ann.targetRole} onValueChange={v => setAnn({ ...ann, targetRole: v })}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Everyone</SelectItem>
                      <SelectItem value="user">Students Only</SelectItem>
                      <SelectItem value="organizer">Organizers Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="h-11 w-full rounded-xl" disabled={announceMut.isPending}>
                  {announceMut.isPending ? "Sending..." : "Send Announcement"}
                </Button>
              </form>
            </Card>

            {/* History */}
            <Card className="p-6 border-border/50 shadow-sm">
              <h3 className="font-bold mb-4">Announcement History ({(announcements || []).length})</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {(announcements || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No announcements sent yet.</p>
                ) : (
                  (announcements || []).map(a => (
                    <div key={a.id} className="p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/20 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">{a.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(a.createdAt), "MMM d, yyyy · h:mm a")}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {(a as any).targetRole && (a as any).targetRole !== "all" && (
                            <span className="px-2 py-0.5 bg-secondary/10 text-secondary rounded-full text-xs capitalize">{(a as any).targetRole}s</span>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => { if (confirm("Delete this announcement?")) deleteMut.mutate({ id: a.id }); }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{a.message}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

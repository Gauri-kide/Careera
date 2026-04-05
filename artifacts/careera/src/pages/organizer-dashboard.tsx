import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetOrganizerEvents, useCreateEvent, useDeleteEvent, useCreateAnnouncement, useUpdateEvent, useGetEventRegistrations, useGetAnnouncements, useUpdateAnnouncement, useDeleteAnnouncement } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Plus, Trash2, Edit, Megaphone, Calendar, Users, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { INTEREST_OPTIONS, cn } from "@/lib/utils";

const EMPTY_EVENT = {
  name: "", description: "", collegeName: "", location: "", fees: 0,
  registrationDeadline: "", eventDate: "", registrationStartDate: ""
};

export default function OrganizerDashboard() {
  const { data: events, isLoading } = useGetOrganizerEvents();
  const { data: announcements } = useGetAnnouncements();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Dialogs
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [regModalEvent, setRegModalEvent] = useState<{ id: number; name: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Announcement dialogs
  const [editAnnounceOpen, setEditAnnounceOpen] = useState(false);
  const [editingAnnounce, setEditingAnnounce] = useState<any>(null);
  const [deleteAnnounceConfirmId, setDeleteAnnounceConfirmId] = useState<number | null>(null);

  // Form state
  const [eventData, setEventData] = useState({ ...EMPTY_EVENT });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [announceData, setAnnounceData] = useState({ title: "", message: "" });

  const createEventMut = useCreateEvent({
    mutation: {
      onSuccess: () => {
        toast({ title: "Event created successfully!" });
        queryClient.invalidateQueries({ queryKey: ["/api/organizers/events"] });
        setAddOpen(false);
        setEventData({ ...EMPTY_EVENT });
        setSelectedTags([]);
      },
      onError: (err: any) => {
        toast({ title: "Failed", description: err?.data?.error || err?.message, variant: "destructive" });
      }
    }
  });

  const updateEventMut = useUpdateEvent({
    mutation: {
      onSuccess: () => {
        toast({ title: "Event updated!" });
        queryClient.invalidateQueries({ queryKey: ["/api/organizers/events"] });
        setEditOpen(false);
        setEditingEvent(null);
      },
      onError: (err: any) => {
        toast({ title: "Failed", description: err?.data?.error || err?.message, variant: "destructive" });
      }
    }
  });

  const deleteEventMut = useDeleteEvent({
    mutation: {
      onSuccess: () => {
        toast({ title: "Event deleted" });
        queryClient.invalidateQueries({ queryKey: ["/api/organizers/events"] });
        setDeleteConfirmId(null);
      }
    }
  });

  const announcementMut = useCreateAnnouncement({
    mutation: {
      onSuccess: () => {
        toast({ title: "Announcement sent to all users!" });
        setAnnounceData({ title: "", message: "" });
        queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      },
      onError: (err: any) => {
        toast({ title: "Failed", description: err?.data?.error || err?.message, variant: "destructive" });
      }
    }
  });

  const updateAnnounceMut = useUpdateAnnouncement({
    mutation: {
      onSuccess: () => {
        toast({ title: "Announcement updated!" });
        queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
        setEditAnnounceOpen(false);
        setEditingAnnounce(null);
      },
      onError: (err: any) => {
        toast({ title: "Failed", description: err?.data?.error || err?.message, variant: "destructive" });
      }
    }
  });

  const deleteAnnounceMut = useDeleteAnnouncement({
    mutation: {
      onSuccess: () => {
        toast({ title: "Announcement deleted" });
        queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
        setDeleteAnnounceConfirmId(null);
      }
    }
  });

  const openEdit = (event: any) => {
    setEditingEvent(event);
    setEventData({
      name: event.name,
      description: event.description,
      collegeName: event.collegeName,
      location: event.location,
      fees: event.fees || 0,
      eventDate: event.eventDate ? new Date(event.eventDate).toISOString().slice(0, 16) : "",
      registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().slice(0, 16) : "",
      registrationStartDate: event.registrationStartDate ? new Date(event.registrationStartDate).toISOString().slice(0, 16) : "",
    });
    setSelectedTags(event.tags || []);
    setEditOpen(true);
  };

  const openEditAnnounce = (announce: any) => {
    setEditingAnnounce(announce);
    setAnnounceData({
      title: announce.title,
      message: announce.message,
    });
    setEditAnnounceOpen(true);
  };

  const handleSubmitEditAnnounce = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnounce) return;
    updateAnnounceMut.mutate({
      id: editingAnnounce.id,
      data: announceData
    });
  };

  const handleSubmitCreate = (e: React.FormEvent) => {

    e.preventDefault();
    createEventMut.mutate({
      data: {
        ...eventData,
        tags: selectedTags,
        registrationDeadline: new Date(eventData.registrationDeadline).toISOString(),
        eventDate: new Date(eventData.eventDate).toISOString(),
        registrationStartDate: eventData.registrationStartDate ? new Date(eventData.registrationStartDate).toISOString() : undefined,
      }
    });
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    updateEventMut.mutate({
      id: editingEvent.id,
      data: {
        ...eventData,
        tags: selectedTags,
        registrationDeadline: new Date(eventData.registrationDeadline).toISOString(),
        eventDate: new Date(eventData.eventDate).toISOString(),
        registrationStartDate: eventData.registrationStartDate ? new Date(eventData.registrationStartDate).toISOString() : undefined,
      }
    });
  };

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !selectedTags.includes(t)) setSelectedTags(p => [...p, t]);
  };

  const EventForm = ({ onSubmit, isPending, submitLabel }: { onSubmit: (e: React.FormEvent) => void; isPending: boolean; submitLabel: string }) => (
    <form onSubmit={onSubmit} className="space-y-4 mt-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5 col-span-2">
          <Label>Event Name *</Label>
          <Input required className="rounded-lg" value={eventData.name} onChange={e => setEventData({ ...eventData, name: e.target.value })} placeholder="e.g. National Hackathon 2025" />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label>Description *</Label>
          <Textarea required className="h-20 rounded-lg resize-none" value={eventData.description} onChange={e => setEventData({ ...eventData, description: e.target.value })} placeholder="Describe the event..." />
        </div>
        <div className="space-y-1.5">
          <Label>College / Venue *</Label>
          <Input required className="rounded-lg" value={eventData.collegeName} onChange={e => setEventData({ ...eventData, collegeName: e.target.value })} placeholder="BITS Pilani" />
        </div>
        <div className="space-y-1.5">
          <Label>City / Location *</Label>
          <Input required className="rounded-lg" value={eventData.location} onChange={e => setEventData({ ...eventData, location: e.target.value })} placeholder="Pilani, Rajasthan" />
        </div>
        <div className="space-y-1.5">
          <Label>Event Date & Time *</Label>
          <Input type="datetime-local" required className="rounded-lg" value={eventData.eventDate} onChange={e => setEventData({ ...eventData, eventDate: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Registration Deadline *</Label>
          <Input type="datetime-local" required className="rounded-lg" value={eventData.registrationDeadline} onChange={e => setEventData({ ...eventData, registrationDeadline: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Entry Fees (₹)</Label>
          <Input type="number" min="0" className="rounded-lg" value={eventData.fees} onChange={e => setEventData({ ...eventData, fees: Number(e.target.value) })} />
        </div>
        <div className="space-y-1.5">
          <Label>Registration Opens</Label>
          <Input type="datetime-local" className="rounded-lg" value={eventData.registrationStartDate} onChange={e => setEventData({ ...eventData, registrationStartDate: e.target.value })} />
        </div>
        <div className="space-y-2 col-span-2">
          <Label>Tags <span className="text-xs text-muted-foreground font-normal">(click to toggle, or type custom)</span></Label>
          <div className="flex flex-wrap gap-1.5">
            {INTEREST_OPTIONS.map(tag => (
              <button type="button" key={tag} onClick={() => selectedTags.includes(tag) ? setSelectedTags(p => p.filter(t => t !== tag)) : addTag(tag)}
                className={cn("px-3 py-1 text-xs rounded-full border transition-all", selectedTags.includes(tag) ? "bg-primary text-white border-primary" : "bg-card text-foreground border-border hover:border-primary/50")}
              >{tag}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input className="h-9 rounded-lg flex-1 text-sm" value={customTagInput} onChange={e => setCustomTagInput(e.target.value)} placeholder="Custom tag..." onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(customTagInput); setCustomTagInput(""); } }} />
            <Button type="button" variant="outline" className="h-9 px-3 rounded-lg text-sm" onClick={() => { addTag(customTagInput); setCustomTagInput(""); }}>Add</Button>
          </div>
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedTags.map(t => (
                <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-xs font-medium">
                  {t}
                  <button type="button" onClick={() => setSelectedTags(p => p.filter(x => x !== t))}><X className="w-3 h-3 hover:text-destructive" /></button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <Button type="submit" className="w-full h-11 rounded-xl font-semibold" disabled={isPending}>
        {isPending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );

  return (
    <DashboardLayout role="organizer">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Organizer Dashboard</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Manage your events and community.</p>
        </div>
        <Button className="shadow-md shadow-primary/20 rounded-xl px-5 h-10 text-sm" onClick={() => { setEventData({ ...EMPTY_EVENT }); setSelectedTags([]); setAddOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> New Event
        </Button>
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="bg-card border border-border/50 h-auto p-1 rounded-xl shadow-sm mb-6 flex flex-wrap gap-1">
          <TabsTrigger value="events" className="rounded-lg py-2 px-3 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Manage Events
          </TabsTrigger>
          <TabsTrigger value="announcements" className="rounded-lg py-2 px-3 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5">
            <Megaphone className="w-3.5 h-3.5" /> Announcements
          </TabsTrigger>
        </TabsList>

        {/* Manage Events */}
        <TabsContent value="events" className="mt-0">
          <Card className="overflow-hidden border-border/50 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="px-5 py-3.5 font-medium">Event Name</th>
                    <th className="px-5 py-3.5 font-medium">Date</th>
                    <th className="px-5 py-3.5 font-medium">Status</th>
                    <th className="px-5 py-3.5 font-medium text-center">Registered</th>
                    <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {isLoading ? (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">Loading events...</td></tr>
                  ) : !events?.length ? (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                      <Calendar className="w-10 h-10 mx-auto mb-3 opacity-20" />
                      <p>You haven't created any events yet.</p>
                      <Button className="mt-3 h-9 text-sm" onClick={() => { setEventData({ ...EMPTY_EVENT }); setSelectedTags([]); setAddOpen(true); }}>
                        <Plus className="w-4 h-4 mr-1" /> Create your first event
                      </Button>
                    </td></tr>
                  ) : (
                    events.map(event => (
                      <tr key={event.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-medium text-foreground">{event.name}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(event.tags || []).slice(0, 3).map(t => (
                              <span key={t} className="px-2 py-0.5 bg-secondary/10 text-secondary rounded-full text-xs">{t}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">{format(new Date(event.eventDate), "MMM d, yyyy")}</td>
                        <td className="px-5 py-4">
                          <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                            event.status === "upcoming" ? "bg-emerald-100 text-emerald-700" :
                              event.status === "deadline_soon" ? "bg-amber-100 text-amber-700" :
                                "bg-slate-100 text-slate-600"
                          )}>{event.status.replace("_", " ")}</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <Button variant="ghost" size="sm" className="h-8 text-sm font-semibold text-primary hover:bg-primary/5"
                            onClick={() => setRegModalEvent({ id: event.id, name: event.name })}>
                            <Users className="w-3.5 h-3.5 mr-1.5" /> {event.registrationCount || 0}
                          </Button>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5" onClick={() => openEdit(event)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5" onClick={() => setDeleteConfirmId(event.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Announcements */}
        <TabsContent value="announcements" className="mt-0">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 border-border/50 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">Send Announcement</h3>
                  <p className="text-xs text-muted-foreground">Broadcast to all Careera users</p>
                </div>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); announcementMut.mutate({ data: announceData }); }} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input required placeholder="e.g. Venue changed for Hackathon" className="h-11 rounded-xl" value={announceData.title} onChange={e => setAnnounceData({ ...announceData, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Message *</Label>
                  <Textarea required placeholder="Type your announcement..." className="h-28 rounded-xl resize-none" value={announceData.message} onChange={e => setAnnounceData({ ...announceData, message: e.target.value })} />
                </div>
                <Button type="submit" className="h-11 w-full rounded-xl" disabled={announcementMut.isPending}>
                  {announcementMut.isPending ? "Sending..." : "Send Announcement"}
                </Button>
              </form>
            </Card>

            <Card className="p-6 border-border/50 shadow-sm">
              <h3 className="font-bold mb-4">Recent Announcements</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {(announcements || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No announcements yet.</p>
                ) : (
                  (announcements || []).slice(0, 10).map(a => (
                    <div key={a.id} className="p-3.5 rounded-xl border border-border/60 bg-card group relative">
                      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/5" onClick={() => openEditAnnounce(a)}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/5" onClick={() => setDeleteAnnounceConfirmId(a.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <p className="font-semibold text-sm pr-16">{a.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(a.createdAt), "MMM d, yyyy · h:mm a")}</p>
                      <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{a.message}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Announcement Dialog */}
      <Dialog open={editAnnounceOpen} onOpenChange={setEditAnnounceOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Announcement</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmitEditAnnounce} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input required className="h-11 rounded-xl" value={announceData.title} onChange={e => setAnnounceData({ ...announceData, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea required className="h-32 rounded-xl resize-none" value={announceData.message} onChange={e => setAnnounceData({ ...announceData, message: e.target.value })} />
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl" disabled={updateAnnounceMut.isPending}>
              {updateAnnounceMut.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Announcement Confirmation */}
      <Dialog open={deleteAnnounceConfirmId !== null} onOpenChange={() => setDeleteAnnounceConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Announcement?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This announcement will be removed from your history. This action cannot be undone.</p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setDeleteAnnounceConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" className="flex-1 rounded-xl" disabled={deleteAnnounceMut.isPending}
              onClick={() => { if (deleteAnnounceConfirmId) deleteAnnounceMut.mutate({ id: deleteAnnounceConfirmId }); }}>
              {deleteAnnounceMut.isPending ? "Deleting..." : "Yes, Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Event Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create New Event</DialogTitle></DialogHeader>
          <EventForm onSubmit={handleSubmitCreate} isPending={createEventMut.isPending} submitLabel="Create Event" />
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Event: {editingEvent?.name}</DialogTitle></DialogHeader>
          <EventForm onSubmit={handleSubmitEdit} isPending={updateEventMut.isPending} submitLabel="Save Changes" />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Event?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will permanently delete the event and remove all registrations. This action cannot be undone.</p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" className="flex-1 rounded-xl" disabled={deleteEventMut.isPending}
              onClick={() => { if (deleteConfirmId) deleteEventMut.mutate({ id: deleteConfirmId }); }}>
              {deleteEventMut.isPending ? "Deleting..." : "Yes, Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Registrations Modal */}
      {regModalEvent && (
        <RegistrationsModal eventId={regModalEvent.id} eventName={regModalEvent.name} onClose={() => setRegModalEvent(null)} />
      )}
    </DashboardLayout>
  );
}

function RegistrationsModal({ eventId, eventName, onClose }: { eventId: number; eventName: string; onClose: () => void }) {
  const { data: registrants, isLoading } = useGetEventRegistrations(eventId);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrations — {eventName}</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !registrants?.length ? (
            <div className="py-12 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No registrations yet for this event.</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-4">{registrants.length} student{registrants.length !== 1 ? "s" : ""} registered</p>
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">College</th>
                      <th className="px-4 py-3">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {registrants.map((r, i) => (
                      <tr key={r.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                        <td className="px-4 py-3 font-medium">{r.fullName}</td>
                        <td className="px-4 py-3">{r.email}</td>
                        <td className="px-4 py-3">{r.collegeName || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{format(new Date(r.registeredAt), "MMM d, yyyy")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

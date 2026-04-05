import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Trophy, Zap, Users, Target, Star, Calendar, MapPin, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useGetPublicEvents } from "@workspace/api-client-react";
import { format } from "date-fns";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 bg-white/90 backdrop-blur-md border-b border-border/40 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
              <span className="font-bold text-white text-sm">C</span>
            </div>
            <span className="font-bold text-xl text-primary">Careera</span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 ml-10">
            <Link href="/" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">Home</Link>
            <a href="#events" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Events</a>
          </nav>

          <div className="flex items-center gap-3 ml-auto">
            <Link href="/login">

              <Button variant="ghost" className="font-semibold text-foreground">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button className="font-semibold shadow-md shadow-primary/20 bg-primary hover:bg-primary/90">Sign up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 pt-16">
        <section className="min-h-[88vh] flex items-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20 relative overflow-hidden">
          {/* Background decorative circles */}
          <div className="absolute top-20 right-0 w-96 h-96 rounded-full bg-secondary/8 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-primary/6 blur-3xl" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Text Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                {/* Pill badge */}
                <div className="inline-flex items-center gap-2 bg-white border border-border/60 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm">
                  <Trophy className="w-4 h-4 text-secondary" />
                  Discover the best college events
                </div>

                {/* Main heading */}
                <div>
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground leading-[1.1] tracking-tight">
                    Connect,
                  </h1>
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground leading-[1.1] tracking-tight">
                    Compete, and
                  </h1>
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight">
                    <span className="text-primary">Conquer</span>
                    <span className="text-secondary">.</span>
                  </h1>
                </div>

                {/* Subtitle */}
                <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                  Careera brings together students from all over to compete in tech, arts, sports, and more. 
                  Find your next big opportunity today.
                </p>

                {/* Divider */}
                <div className="w-16 h-1 bg-secondary rounded-full" />

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/signup">
                    <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 rounded-xl shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90 font-semibold hover:-translate-y-0.5 transition-all duration-200">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link href="/organizer-signup">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 rounded-xl border-2 border-border hover:border-secondary/50 hover:bg-secondary/5 font-semibold transition-all duration-200">
                      Host an Event
                    </Button>
                  </Link>
                </div>

                {/* Social proof mini */}
                <div className="flex items-center gap-6 pt-2">
                  <div className="flex -space-x-2">
                    {["bg-primary", "bg-secondary", "bg-amber-400", "bg-emerald-500"].map((c, i) => (
                      <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-white flex items-center justify-center`}>
                        <span className="text-white text-xs font-bold">{String.fromCharCode(65 + i)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">500+</span> students joined this month
                  </p>
                </div>
              </motion.div>

              {/* Right: Trophy Illustration */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, x: 30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="flex items-center justify-center relative"
              >
                <div className="relative">
                  {/* Glow effect behind illustration */}
                  <div className="absolute inset-10 bg-secondary/20 rounded-full blur-2xl" />
                  <img
                    src={`${import.meta.env.BASE_URL}images/trophy.png`}
                    alt="Student winning a trophy"
                    className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl drop-shadow-2xl"
                  />
                </div>

                {/* Floating stat cards */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute top-8 left-0 bg-white rounded-2xl shadow-xl border border-border/50 px-4 py-3 hidden md:flex items-center gap-3"
                >
                  <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Star className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">200+</div>
                    <div className="text-xs text-muted-foreground">Events hosted</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                  className="absolute bottom-8 right-0 bg-white rounded-2xl shadow-xl border border-border/50 px-4 py-3 hidden md:flex items-center gap-3"
                >
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">5,000+</div>
                    <div className="text-xs text-muted-foreground">Active students</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Featured Events Section */}
        <section id="events" className="py-24 bg-background overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-4">
                  Upcoming <span className="text-primary italic">Events</span>
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl">
                  Explore top-tier competitions and workshops hosted by colleges nationwide. 
                  Your next big breakthrough is just one event away.
                </p>
              </div>
              <Link href="/signup">
                <Button variant="outline" className="rounded-xl border-2 font-semibold hover:bg-primary hover:text-white hover:border-primary transition-all">
                  View All Events <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <FeaturedEventsList />
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-white border-t border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-foreground mb-4">Why students choose Careera</h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">Everything you need to find opportunities and grow your career while in college.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Zap, title: "AI Recommendations", desc: "Smart event matching based on your interests, skills, and past experience.", color: "text-amber-500", bg: "bg-amber-50" },
                { icon: Target, title: "Campus Focused", desc: "Discover events at your college and nearby universities tailored just for you.", color: "text-secondary", bg: "bg-cyan-50" },
                { icon: Users, title: "Network & Grow", desc: "Connect with peers, organizers, and mentors. Build your professional network.", color: "text-primary", bg: "bg-blue-50" },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-background rounded-2xl p-8 border border-border/60 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-5 ${f.color}`}>
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-16 bg-primary">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to find your next opportunity?</h2>
            <p className="text-primary-foreground/80 mb-8 text-lg">Join thousands of students already discovering amazing events on Careera.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-6 rounded-xl shadow-lg">
                  Sign Up as Student
                </Button>
              </Link>
              <Link href="/organizer-signup">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-6 rounded-xl">
                  Register as Organizer
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-foreground text-background py-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center">
            <span className="font-bold text-white text-xs">C</span>
          </div>
          <span className="font-bold text-lg">Careera</span>
        </div>
        <p className="text-muted-foreground text-sm">&copy; {new Date().getFullYear()} Careera Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeaturedEventsList() {
  const { data: events, isLoading } = useGetPublicEvents();

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[400px] rounded-2xl bg-muted/50 animate-pulse border border-border/50" />
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border/60">
        <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-foreground">No upcoming events found</h3>
        <p className="text-muted-foreground mt-2">Check back later for new opportunities.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {events.map((event, i) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          viewport={{ once: true }}
          className="group"
        >
          <div className="bg-white rounded-3xl overflow-hidden border border-border/50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full ring-1 ring-black/5">
            {/* Event Poster / Thumbnail */}
            <div className="relative aspect-[16/10] bg-muted overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="absolute top-4 right-4 z-20">
                <div className="bg-white/95 backdrop-blur-sm shadow-lg px-3 py-1.5 rounded-xl text-xs font-bold text-primary uppercase tracking-wider border border-white/20">
                  {event.tags?.[0] || 'College Event'}
                </div>
              </div>
              <img 
                src={(event as any).posterUrl || `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80`} 
                alt={event.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute bottom-4 left-4 right-4 z-20 text-white translate-y-1 group-hover:translate-y-0 transition-transform">
                <div className="text-sm font-medium flex items-center gap-1.5 opacity-90">
                  <MapPin className="w-3.5 h-3.5 text-secondary" /> {event.collegeName}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold text-secondary uppercase tracking-widest">
                  {format(new Date(event.eventDate), 'MMM dd, yyyy')}
                </div>
                <div className="text-sm font-bold text-muted-foreground">
                  {event.fees === 0 ? "FREE" : `₹${event.fees}`}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-1 group-hover:text-primary transition-colors">
                {event.name}
              </h3>
              <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
                {event.description}
              </p>

              <Link href={`/login?redirect=/events/${event.id}`}>
                <Button className="w-full rounded-xl font-bold shadow-md shadow-primary/10 transition-all hover:bg-secondary group-hover:scale-[1.02]">
                  Join Competition
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

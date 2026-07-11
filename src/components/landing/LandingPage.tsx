import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy, Zap, Users, Calendar, ShieldCheck, Search, ArrowRight,
  Star, Target, Award, TrendingUp, Globe, ChevronRight, Play,
  CheckCircle, User,
} from 'lucide-react';

// ── Animated Counter ──
const Counter: React.FC<{ end: number; suffix?: string; duration?: number }> = ({
  end, suffix = '', duration = 2000,
}) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const steps = 60;
    const inc = end / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += inc;
      if (current >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <>{count.toLocaleString()}{suffix}</>;
};

// ── Feature Card ──
const FeatureCard: React.FC<{
  icon: React.ElementType; title: string; desc: string;
  gradient: string; delay?: string;
}> = ({ icon: Icon, title, desc, gradient, delay = '0s' }) => (
  <div
    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group"
    style={{ animationDelay: delay }}
  >
    <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

// ── Role Card ──
const RoleCard: React.FC<{
  icon: React.ElementType; role: string; gradient: string;
  perks: string[]; cta: string; onSignup: () => void;
}> = ({ icon: Icon, role, gradient, perks, cta, onSignup }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/8 transition-all duration-300 hover:-translate-y-1 flex flex-col">
    <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mb-5 shadow-xl`}>
      <Icon className="w-8 h-8 text-white" />
    </div>
    <h3 className="text-2xl font-black text-white mb-4">{role}</h3>
    <ul className="space-y-2.5 flex-1 mb-6">
      {perks.map((perk, i) => (
        <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
          {perk}
        </li>
      ))}
    </ul>
    <button
      onClick={onSignup}
      className={`w-full py-3 bg-gradient-to-r ${gradient} text-white font-bold rounded-xl hover:opacity-90 transition-all hover:scale-105 shadow-lg`}
    >
      {cta}
    </button>
  </div>
);

// ── Main Landing Page ──
const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const goToSignup = () => navigate('/auth');
  const goToLogin = () => navigate('/auth');

  const features = [
    { icon: User, title: 'Dynamic Profiles', desc: 'Showcase your sports identity — achievements, stats, videos, and certifications in one premium profile.', gradient: 'from-blue-500 to-cyan-500' },
    { icon: Calendar, title: 'Tournament Events', desc: 'Discover and register for tournaments, tryouts, and scouting events near you or anywhere.', gradient: 'from-purple-500 to-violet-500' },
    { icon: Users, title: 'Smart Connections', desc: 'Connect with coaches, discover athletes. Build your professional sports network.', gradient: 'from-emerald-500 to-teal-500' },
    { icon: Zap, title: 'Sports Feed', desc: 'Share achievements, training updates, and tournament results. Stay connected with your network.', gradient: 'from-orange-500 to-amber-500' },
    { icon: ShieldCheck, title: 'AI Verification', desc: 'Get your athlete profile verified through document uploads, increasing trust and visibility.', gradient: 'from-green-500 to-emerald-500' },
    { icon: Search, title: 'Global Search', desc: 'Find players, coaches, organizations, and events. Filter by sport, location, and certification.', gradient: 'from-pink-500 to-rose-500' },
  ];

  const stats = [
    { label: 'Athletes', value: 10000, suffix: '+' },
    { label: 'Coaches', value: 2500, suffix: '+' },
    { label: 'Organizations', value: 300, suffix: '+' },
    { label: 'Events Monthly', value: 150, suffix: '+' },
  ];

  const steps = [
    { num: '01', title: 'Create Your Profile', desc: 'Sign up as a Player, Coach, or Organization in under 2 minutes.', icon: User },
    { num: '02', title: 'Connect & Discover', desc: 'Find coaches matching your sport, connect, and build your network.', icon: Users },
    { num: '03', title: 'Compete & Grow', desc: 'Register for tournaments, share updates, and grow your sports identity.', icon: Trophy },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0f172a 50%, #0d1117 100%)' }}>

      {/* ── TOP NAV BAR ── */}
      <nav className="sticky top-0 z-50 border-b border-white/5 nav-blur" style={{ background: 'rgba(10,15,30,0.85)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="bg-gradient-to-br from-blue-500 to-teal-400 p-2 rounded-xl shadow-lg">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                SportiZen
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={goToLogin}
                className="text-gray-300 hover:text-white font-bold px-4 py-2 rounded-xl hover:bg-white/5 transition-all text-sm"
              >
                Log In
              </button>
              <button
                onClick={goToSignup}
                className="bg-gradient-to-r from-blue-600 to-teal-500 text-white font-bold px-5 py-2 rounded-xl hover:opacity-90 transition-all text-sm shadow-lg shadow-blue-500/25 hover:scale-105"
              >
                Join Free
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="hero-text-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
            <Zap className="w-3.5 h-3.5" />
            The #1 Sports Networking Platform
          </div>

          <h1 className="hero-text-2 text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
            Your Sports Identity.{' '}
            <span className="bg-gradient-to-r from-blue-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
              Amplified.
            </span>
          </h1>

          <p className="hero-text-3 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Build your sports profile, connect with elite coaches, discover tournaments, 
            and take your athletic career to the next level.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 hero-btn-1">
            <button
              onClick={goToSignup}
              className="group w-full sm:w-auto bg-gradient-to-r from-blue-600 to-teal-500 text-white font-black px-8 py-4 rounded-2xl hover:opacity-95 transition-all shadow-2xl shadow-blue-500/30 hover:scale-105 flex items-center justify-center gap-2 text-lg"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={goToLogin}
              className="w-full sm:w-auto border border-white/20 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-lg"
            >
              <Play className="w-5 h-5" />
              Log In
            </button>
          </div>

          <div className="hero-btn-2 flex flex-wrap items-center justify-center gap-6 mt-10 text-gray-500 text-sm">
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              Free to Join
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              Verified Profiles
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-blue-400" />
              Global Network
            </span>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-white/5 py-12" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-black text-white mb-1">
                  <Counter end={stat.value} suffix={stat.suffix} duration={2500} />
                </div>
                <div className="text-gray-400 text-sm font-bold uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-4">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Dominate</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            A complete platform built for athletes who are serious about their career.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} delay={`${i * 0.1}s`} />
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg">Get started in 3 simple steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl gradient-sports flex items-center justify-center shadow-xl shadow-blue-500/20">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-5xl font-black text-white/5 mb-2">{step.num}</div>
                <h3 className="text-xl font-black text-white mb-2 -mt-4">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLE CARDS ── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-4">Built for Everyone in Sports</h2>
          <p className="text-gray-400 text-lg">Whether you play, coach, or organize — SportiZen is your platform.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <RoleCard
            icon={Target}
            role="Players"
            gradient="from-blue-600 to-cyan-500"
            perks={[
              'Build a verified sports profile',
              'Connect with certified coaches',
              'Register for tournaments',
              'Showcase achievements & stats',
              'AI talent analysis',
            ]}
            cta="Join as Player"
            onSignup={goToSignup}
          />
          <RoleCard
            icon={Award}
            role="Coaches"
            gradient="from-emerald-600 to-teal-500"
            perks={[
              'Discover talented athletes',
              'Accept connection requests',
              'Share coaching updates',
              'Build your coaching profile',
              'Manage client roster',
            ]}
            cta="Join as Coach"
            onSignup={goToSignup}
          />
          <RoleCard
            icon={TrendingUp}
            role="Organizations"
            gradient="from-orange-500 to-amber-500"
            perks={[
              'Create & manage events',
              'Verify athlete profiles',
              'Publish announcements',
              'Track registrations',
              'Build your academy brand',
            ]}
            cta="Join as Organization"
            onSignup={goToSignup}
          />
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="bg-gradient-to-br from-blue-600/20 to-teal-600/20 border border-blue-500/20 rounded-3xl p-12">
            <Trophy className="w-16 h-16 mx-auto mb-6 text-yellow-400 animate-float" />
            <h2 className="text-4xl font-black text-white mb-4">
              Ready to Write Your Sports Story?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of athletes, coaches, and organizations already building their sports identity on SportiZen.
            </p>
            <button
              onClick={goToSignup}
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-black px-10 py-4 rounded-2xl hover:opacity-95 transition-all shadow-2xl shadow-blue-500/30 hover:scale-105 text-lg"
            >
              Get Started Free
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-gradient-to-br from-blue-500 to-teal-400 p-1.5 rounded-xl">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-white">SportiZen</span>
            </div>
            <p className="text-gray-500 text-sm text-center">
              © 2026 SportiZen. Built for athletes who dream big.
            </p>
            <div className="flex items-center gap-4 text-gray-500 text-sm">
              <button onClick={goToLogin} className="hover:text-white transition-colors font-medium">Login</button>
              <button onClick={goToSignup} className="hover:text-white transition-colors font-medium">Sign Up</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

import React from 'react';
import { 
  UserCheck, Building2, HeartPulse, Compass, 
  Sparkles, CheckCircle2, Heart, GraduationCap, ArrowUpRight 
} from 'lucide-react';

const OFFERINGS = [
  {
    icon: UserCheck,
    title: "One-on-One Mentorship",
    desc: "Personalized coaching sessions connecting academic milestones directly with student aspirations."
  },
  {
    icon: Building2,
    title: "School Counselling Programs",
    desc: "Integrating psychological and career developmental modules straight into high school spaces."
  },
  {
    icon: HeartPulse,
    title: "Psychological Support",
    desc: "doorstep and online counselling addressing test anxiety, focus issues, and emotional regulation."
  },
  {
    icon: Compass,
    title: "Career Roadmaps",
    desc: "Rigorous stream mapping and entrance guidelines matching university pathways with talents."
  },
  {
    icon: Sparkles,
    title: "Personality Development",
    desc: "Milestone-driven workshops to build presentation skills, communication flow, and leadership."
  },
  {
    icon: CheckCircle2,
    title: "Goal Tracking",
    desc: "Continuous checks ensuring students stay oriented toward their long-term developmental milestones."
  },
  {
    icon: Heart,
    title: "Parent Guidance Sessions",
    desc: "Aligning family environments to reduce high school academic friction and stream-selection stress."
  },
  {
    icon: GraduationCap,
    title: "Future Planning Workshops",
    desc: "Seminars on CUET, JEE, NEET, global scholarship guidelines, and upcoming industry roadmaps."
  }
];

export default function Process() {
  return (
    <section id="process" className="py-24 md:py-32 px-6 text-black text-left grid-bg relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-brand/10 rounded-full glow-glow pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 md:space-y-24">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-black/[0.05] pb-8">
          <div className="space-y-4">
            <span className="text-[10px] bg-black text-white px-3.5 py-1 rounded-full uppercase tracking-wider font-extrabold w-fit block">
              our framework
            </span>
            <h2 className="text-4xl md:text-5xl font-header font-black tracking-tight text-gray-900 leading-tight uppercase">
              What We Offer
            </h2>
            <p className="text-black/50 font-sans text-sm md:text-base font-light max-w-xl">
              A comprehensive grid of personal, academic, and psychological developmental modules.
            </p>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {OFFERINGS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="bg-white hover:bg-white/90 border border-black/5 rounded-[32px] p-8 shadow-xs hover:shadow-lg transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between group"
              >
                <div className="space-y-6">
                  <div className="w-10 h-10 rounded-full bg-black/5 text-black flex items-center justify-center transition-colors group-hover:bg-black group-hover:text-brand">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-header font-bold text-xs uppercase tracking-wider text-black">{item.title}</h4>
                    <p className="text-black/55 font-sans text-[11px] font-light leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                
                <div className="pt-6 flex justify-end">
                  <ArrowUpRight className="w-4 h-4 text-black/20 group-hover:text-black transition-colors" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Premium Counters / Statistics Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
          
          {/* Card 1 */}
          <div className="bg-black text-white rounded-[32px] p-8 md:p-12 space-y-4 shadow-xl flex flex-col justify-between border border-zinc-900">
            <span className="text-[9px] text-brand font-black uppercase tracking-widest font-mono">
              milestones hit
            </span>
            <div>
              <p className="text-5xl md:text-6xl font-header font-black tracking-tight text-white uppercase leading-none">
                5000+
              </p>
              <p className="text-xs text-zinc-400 mt-3 font-light leading-relaxed">
                Students Guided successfully with career maps, doorstep check-ins, and personal psychological mentorship.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-black/5 rounded-[32px] p-8 md:p-12 space-y-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] text-black/50 font-black uppercase tracking-widest font-mono">
              partnerships active
            </span>
            <div>
              <p className="text-5xl md:text-6xl font-header font-black tracking-tight text-black uppercase leading-none">
                100+
              </p>
              <p className="text-xs text-black/50 mt-3 font-light leading-relaxed">
                Schools Connected across Kerala, incorporating CDAC profiling methods and parent alignment seminars.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-black/5 rounded-[32px] p-8 md:p-12 space-y-4 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] text-black/50 font-black uppercase tracking-widest font-mono">
              verified standard
            </span>
            <div>
              <p className="text-5xl md:text-6xl font-header font-black tracking-tight text-black uppercase leading-none">
                95%
              </p>
              <p className="text-xs text-black/50 mt-3 font-light leading-relaxed">
                Student Satisfaction based on quarter-on-quarter feedback forms and long-term parent alignments.
              </p>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}

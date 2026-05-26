import React from 'react';
import { Star, Quote } from 'lucide-react';

const REVIEWS = [
  {
    author: "Shaji PK",
    role: "Parent, Calicut",
    text: "BEHOLD helped my daughter choose the right humanities stream after Class 10. Their psychological approach and structured tracking maps are truly exceptional.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80"
  },
  {
    author: "Anjana S.",
    role: "Student, Ernakulam",
    text: "I was deeply confused between Design and Computer Science. The CIGI-aligned aptitude test and follow-up guidance cleared my doubts, leaving me with a clear roadmap.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80"
  },
  {
    author: "Dr. Rajesh Kumar",
    role: "Parent, Kochi",
    text: "The doorstep psychology scaffolding helped our son manage board exam stress, keeping him motivated and aligned during crucial admission rounds.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
  },
  {
    author: "Faisal T.",
    role: "Student, Trivandrum",
    text: "The continuous mentorship check-ins gave me the confidence to prepare for national university entries. The BEHOLD team is always there to guide.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
  },
  {
    author: "Merlin Davis",
    role: "Parent, Thrissur",
    text: "The emotional and career counselling alignment prevented so much friction at home. My son felt heard, supported, and guided. Highly recommend BEHOLD.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534751516642-a131ffd107fd?auto=format&fit=crop&w=100&q=80"
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-white/40 backdrop-blur-xs border-y border-black/[0.04] text-left relative select-none">
      
      {/* Background radial glow */}
      <div className="absolute top-1/4 right-1/3 w-[300px] h-[300px] bg-brand/10 rounded-full glow-glow pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 mb-16 space-y-4">
        <span className="text-[10px] bg-black text-white px-3.5 py-1 rounded-full uppercase tracking-wider font-extrabold w-fit block">
          success stories
        </span>
        <h2 className="text-4xl md:text-5xl font-header font-black tracking-tight text-gray-900 leading-tight uppercase">
          Loved by Families
        </h2>
        <p className="text-black/50 font-sans text-sm md:text-base font-light max-w-xl">
          Hear from students and parents who found clarity, confidence, and direction through our mentorship.
        </p>
      </div>

      {/* Static Testimonials Grid */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {REVIEWS.map((review, idx) => (
          <div 
            key={idx}
            className="bg-white border border-black/5 rounded-[32px] p-8 shadow-xs flex flex-col justify-between space-y-6 hover:border-brand/40 duration-300 hover:shadow-md transition-all"
          >
            <div className="space-y-4">
              {/* Rating stars */}
              <div className="flex gap-1 text-black">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              
              {/* Review text */}
              <p className="text-black/70 font-sans text-xs md:text-sm font-light leading-relaxed italic">
                "{review.text}"
              </p>
            </div>

            {/* Author Info */}
            <div className="flex items-center justify-between border-t border-black/[0.04] pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-black/5 bg-zinc-100 shrink-0">
                  <img src={review.avatar} alt={review.author} className="w-full h-full object-cover grayscale" />
                </div>
                <div>
                  <h4 className="font-header font-bold text-xs uppercase tracking-wider text-black">{review.author}</h4>
                  <p className="text-black/40 text-[9px] font-bold uppercase tracking-wider">{review.role}</p>
                </div>
              </div>
              
              <Quote className="w-5 h-5 text-black/10 shrink-0" />
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}

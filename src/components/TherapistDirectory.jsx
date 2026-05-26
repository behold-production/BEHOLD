import React, { useState } from 'react';
import { Search, Star, CheckCircle, Shield, Languages, X } from 'lucide-react';

const THERAPISTS = [
  {
    id: 'c3', // maps to Siddharth/Psychologist slot in booking
    name: 'Muhsina P R',
    designation: 'Consultant Psychologist',
    categories: ['Consultant Psychologist', 'Clinical Psychologist'],
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    tags: ['Relationship & Marital Issues', 'Depression & Mood Concerns'],
    hours: '250+',
    languages: ['Malayalam', 'English'],
    fee: 1000,
    availability: 'Next available in 33 mins',
    action: 'BOOK NOW',
    rating: 4.8,
    reviews: 42,
    details: 'Postgraduate in Counselling Psychology. Specializes in adolescent relationship advice, peer group adjustment coaching, and stress coping matrices.'
  },
  {
    id: 'c1', // maps to Dr. Anjali
    name: 'Merin Susan',
    designation: 'Consultant Psychologist',
    categories: ['Consultant Psychologist', 'Clinical Psychologist'],
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=300&q=80',
    tags: ['Lifestyle Concerns', 'Pregnancy & Maternal Mental Health'],
    hours: '4500+',
    languages: ['English', 'Malayalam'],
    fee: 2000,
    availability: 'Next available in 48 mins',
    action: 'FOLLOW UP ONLY',
    rating: 4.9,
    reviews: 312,
    details: 'Licensed Clinical Psychologist with 8+ years of post-qualification practice. Specializes in lifestyle guidance, maternal wellness, and cognitive behavioral therapy (CBT).'
  },
  {
    id: 'c3_leena',
    name: 'Leena Mary Mathew',
    designation: 'Consultant Psychologist',
    categories: ['Consultant Psychologist'],
    image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=300&q=80',
    tags: ['Depression & Mood Concerns', 'Self-Esteem & Personal Growth'],
    hours: '600+',
    languages: ['Malayalam', 'English'],
    fee: 1000,
    availability: 'Next available Today at 12:15 PM',
    action: 'BOOK NOW',
    rating: 4.7,
    reviews: 78,
    details: 'Focuses on building student self-esteem, handling exam anxieties, emotional regulation, and parent-student alignment workshops.'
  },
  {
    id: 'c1_ahlam',
    name: 'Ahlam Naseer',
    designation: 'Consultant Psychologist',
    categories: ['Consultant Psychologist', 'Clinical Psychologist'],
    image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=300&q=80',
    tags: ['Depression & Mood Concerns', 'Self-Esteem & Personal Growth'],
    hours: '600+',
    languages: ['English', 'Malayalam'],
    fee: 1000,
    availability: 'Next available Today at 1:30 PM',
    action: 'BOOK NOW',
    rating: 4.8,
    reviews: 59,
    details: 'Specializes in behavioral therapy, mood stabilization, focus-building techniques, and self-confidence alignment strategies.'
  },
  {
    id: 'c2_gayathri',
    name: 'Gayathri S',
    designation: 'Consultant Psychologist',
    categories: ['Consultant Psychologist', 'Sexual Health'],
    image: 'https://images.unsplash.com/photo-1534751516642-a131ffd107fd?auto=format&fit=crop&w=300&q=80',
    tags: ['Trauma Abuse & PTSD', 'Depression & Mood Concerns', 'Anxiety'],
    hours: '1500++',
    languages: ['Malayalam', 'English', 'Hindi'],
    fee: 1000,
    availability: 'Next available Today at 2:15 PM',
    action: 'BOOK NOW',
    rating: 4.9,
    reviews: 146,
    details: 'Trauma-informed practitioner specializing in developmental delays, anxiety coping mechanisms, and student-parent relationship issues.'
  },
  {
    id: 'c2', // maps to Mathew slot in booking
    name: 'Rahan Ajith',
    designation: 'Consultant Psychologist',
    categories: ['Consultant Psychologist', 'Psychiatrist'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    tags: ['Anxiety Stress & Panic', 'Family & Parenting Concerns'],
    hours: '500+',
    languages: ['Malayalam', 'English'],
    fee: 1000,
    availability: 'Next available Today at 2:35 PM',
    action: 'BOOK NOW',
    rating: 4.6,
    reviews: 38,
    details: 'Specializes in exam stress management, attention deficit coaching (ADHD management), and sibling friction resolution.'
  }
];

const CATEGORIES = [
  'Consultant Psychologist',
  'Clinical Psychologist',
  'Sexual Health',
  'Psychiatrist'
];

export default function TherapistDirectory({ onBookTherapist }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Consultant Psychologist');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedTherapist, setSelectedTherapist] = useState(null); // For detailed profile modal

  // Filter therapists
  const filteredTherapists = THERAPISTS.filter(t => {
    const matchesCategory = t.categories.includes(activeCategory);
    const matchesLanguage = selectedLanguage === 'All' || t.languages.includes(selectedLanguage);
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesLanguage && matchesSearch;
  });

  return (
    <section className="bg-white text-black py-20 px-6 border-t border-gray-150 select-none text-left max-w-7xl mx-auto">
      
      {/* TRUST REVIEW STATUS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        
        {/* Status Card 1 */}
        <div className="p-5 border border-brand bg-brand/5 flex items-center gap-4 hover:shadow-md transition-all duration-300">
          <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-wider text-xs text-gray-900">RCI Registered Only</h4>
            <p className="text-[10px] text-gray-500 font-light mt-0.5">100% verified clinical psychologist board.</p>
          </div>
        </div>

        {/* Status Card 2 */}
        <div className="p-5 border border-brand bg-brand/5 flex items-center gap-4 hover:shadow-md transition-all duration-300">
          <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white">
            <Star className="w-5 h-5 fill-white text-brand" />
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-wider text-xs text-gray-900">Average Rating 4.9</h4>
            <p className="text-[10px] text-gray-500 font-light mt-0.5">Based on 1,200+ verified student feedbacks.</p>
          </div>
        </div>

        {/* Status Card 3 */}
        <div className="p-5 border border-brand bg-brand/5 flex items-center gap-4 hover:shadow-md transition-all duration-300">
          <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-wider text-xs text-gray-900">100% Confidential</h4>
            <p className="text-[10px] text-gray-500 font-light mt-0.5">Secure, end-to-end encrypted session notes.</p>
          </div>
        </div>

      </div>

      {/* SECTION HEADER */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-header font-black tracking-tight uppercase text-gray-900 mb-2">
          How can we help you?
        </h2>
        <p className="text-gray-500 font-light text-sm max-w-lg mx-auto">
          Explore our certified psychological counselors, listen to their intros, and configure direct doorstep booking.
        </p>
      </div>

      {/* FILTER SEARCH PANEL */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-10 bg-gray-50 p-4 border border-gray-200">
        
        {/* Search & Language Select */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-stretch sm:items-center">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search by therapist name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 text-xs text-gray-950 rounded-md outline-none focus:border-brand transition"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-2 border border-gray-300 rounded-md">
            <Languages className="w-4 h-4 text-brand" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-transparent text-xs text-gray-950 font-bold uppercase cursor-pointer outline-none"
            >
              <option value="All">All Languages</option>
              <option value="Malayalam">മലയാളം (Mal)</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>
        </div>

        {/* Specialization Category Tabs */}
        <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-start lg:justify-end">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition duration-200 cursor-pointer border ${
                activeCategory === category
                  ? 'bg-brand text-white border-brand shadow-xs'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-brand hover:text-brand'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

      </div>

      {/* THERAPIST CARD GRID */}
      {filteredTherapists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTherapists.map((therapist) => {
            return (
              <div 
                key={therapist.name}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-brand/40 transition-all duration-300 flex flex-col justify-between"
              >
                
                {/* 1. Header with soft brand teal accent */}
                <div className="bg-brand/5 p-5 flex justify-between items-center relative border-b border-gray-150">
                  <div className="space-y-1 max-w-[65%]">
                    <h3 className="font-bold text-gray-900 text-base leading-tight">{therapist.name}</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">{therapist.designation}</p>
                  </div>
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-white bg-white shrink-0 shadow-sm">
                    <img src={therapist.image} alt={therapist.name} className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* 2. Focus Tags */}
                <div className="p-4 flex flex-wrap gap-1.5 border-b border-gray-100 min-h-[64px] items-center">
                  {therapist.tags.map(tag => (
                    <span key={tag} className="text-[9px] font-bold text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded uppercase">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 3. Trust stats row */}
                <div className="p-4 bg-gray-50/50 border-b border-gray-100 grid grid-cols-3 gap-2 text-center">
                  <div className="space-y-0.5">
                    <p className="text-[14px] font-black text-gray-900">{therapist.hours}</p>
                    <p className="text-[8px] text-gray-400 uppercase tracking-wider">Therapy hrs</p>
                  </div>
                  <div className="space-y-0.5 border-x border-gray-200">
                    <p className="text-[11px] font-black text-gray-900 truncate max-w-full px-1">{therapist.languages[0]}</p>
                    <p className="text-[8px] text-gray-400 uppercase tracking-wider">Languages</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[14px] font-black text-gray-900">₹{therapist.fee}</p>
                    <p className="text-[8px] text-gray-400 uppercase tracking-wider">Per session</p>
                  </div>
                </div>

                {/* 4. Next available alert and action buttons */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-50/30 border-t border-gray-100">
                  <div className="space-y-0.5">
                    <p className="text-[8px] text-gray-400 uppercase tracking-wider">Next available</p>
                    <p className="text-[10px] font-bold text-gray-900">{therapist.availability.replace('Next available in', '').replace('Next available Today at', '')}</p>
                  </div>
                  
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedTherapist(therapist)}
                      className="border border-brand hover:bg-brand/5 text-brand px-3.5 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
                    >
                      View Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => onBookTherapist(therapist.id)}
                      className={`px-4 py-2 text-[10px] font-extrabold uppercase tracking-wider transition cursor-pointer rounded-md shadow-xs ${
                        therapist.action === 'FOLLOW UP ONLY'
                          ? 'bg-gray-600 hover:bg-gray-700 text-white'
                          : 'bg-brand hover:bg-brand-dark text-white border border-brand/50'
                      }`}
                    >
                      {therapist.action}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center text-gray-400 italic text-xs border border-dashed border-gray-250">
          No therapists found matching your search. Select 'All Languages' or change query terms.
        </div>
      )}

      {/* VIEW MORE THERAPIST BUTTON */}
      <div className="mt-12 text-center">
        <button className="px-6 py-2.5 bg-black hover:bg-brand text-white font-bold text-[10px] uppercase tracking-widest rounded-full transition cursor-pointer">
          View more therapist
        </button>
      </div>

      {/* DETAILED PROFILE MODAL */}
      {selectedTherapist && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-6 animate-in fade-in duration-200">
          <div className="bg-white border border-brand max-w-lg w-full p-8 rounded-xl shadow-2xl relative space-y-6 text-left">
            <button
              onClick={() => setSelectedTherapist(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-black transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 bg-gray-50">
                <img src={selectedTherapist.image} alt={selectedTherapist.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedTherapist.name}</h3>
                <p className="text-xs text-brand font-semibold uppercase">{selectedTherapist.designation}</p>
                <div className="flex items-center gap-1 mt-1 text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-gray-800">{selectedTherapist.rating}</span>
                  <span className="text-gray-400 font-light">({selectedTherapist.reviews} reviews)</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-gray-100 pt-4">
              <span className="text-[10px] text-gray-450 uppercase font-bold tracking-widest block">About Therapist</span>
              <p className="text-gray-600 text-xs font-light leading-relaxed">
                {selectedTherapist.details}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 text-xs font-medium">
              <div className="space-y-1">
                <span className="text-gray-400 uppercase tracking-wider block">Languages</span>
                <span className="text-gray-900 font-bold block">{selectedTherapist.languages.join(', ')}</span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 uppercase tracking-wider block">Consultation Fee</span>
                <span className="text-gray-900 font-bold block">₹{selectedTherapist.fee} / Session</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  onBookTherapist(selectedTherapist.id);
                  setSelectedTherapist(null);
                }}
                className="flex-1 py-3 bg-brand hover:bg-brand-dark text-white font-bold text-xs uppercase tracking-wider rounded-md text-center transition cursor-pointer shadow-sm"
              >
                Book Session Now
              </button>
              <button
                type="button"
                onClick={() => setSelectedTherapist(null)}
                className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 hover:border-black font-bold text-xs uppercase tracking-wider rounded-md text-center transition cursor-pointer"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}

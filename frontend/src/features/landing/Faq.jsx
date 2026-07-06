import React, { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import SectionHeader from '../../shared/components/SectionHeader';
import ApiService from '../../shared/services/api';

export default function Faq() {
 const [openIndex, setOpenIndex] = useState(null);
 const [faqs, setFaqs] = useState([]);

 useEffect(() => {
 const fetchFaqs = async () => {
 try {
 const res = await ApiService.getFaqs();
 if (res.success && res.data) {
 setFaqs(res.data);
 }
 } catch (err) {
 console.error("Failed to load FAQs", err);
 }
 };

 fetchFaqs();

 const handleUpdate = () => {
 fetchFaqs();
 };

 window.addEventListener('behold_faqs_updated', handleUpdate);
 return () => {
 window.removeEventListener('behold_faqs_updated', handleUpdate);
 };
 }, []);

 const toggleFaq = (index) => {
 setOpenIndex(openIndex === index ? null : index);
 };

 return (
 <motion.section 
 id="faqs"
 initial={{ opacity: 0, y: 30 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin:"-100px"}}
 transition={{ duration: 0.6 }}
 className="py-10 md:py-20 px-6 bg-white"
 >
 <div className="max-w-4xl mx-auto">
 <div className="mb-12 border-b border-surface-200 pb-8">
 <SectionHeader
 subtitle="Clarity Desk"
 title="Frequently Asked"
 description="Explore key information about the BEHOLD mentorship model, deliverables, and student tracking scopes."
 align="responsive"
 />
 </div>

 <div className="space-y-4">
 {faqs.map((faq, idx) => {
 const isOpen = openIndex === idx;
 return (
 <div 
 key={idx} 
 className={`square-card p-0 transition-all duration-300 ${isOpen ? 'shadow-square-hover border-brand bg-brand/5' : 'shadow-square-light bg-white border-surface-200'}`}
 >
 <button
 type="button"
 onClick={() => toggleFaq(idx)}
 className="w-full p-6 text-left flex items-center justify-between cursor-pointer focus:outline-none"
 aria-expanded={isOpen}
 >
 <div className="flex items-center gap-4">
 <div className={`w-8 h-8 flex items-center justify-center shrink-0 border ${isOpen ? 'bg-brand text-surface-900 border-brand' : 'bg-surface-50 text-slate-500 border-surface-200'}`}>
 <HelpCircle className="w-4 h-4"/>
 </div>
 <span className={`font-heading font-bold text-lg transition-colors ${isOpen ? 'text-brand-dark' : 'text-surface-900'}`}>
 {faq.question}
 </span>
 </div>
 <div className={`w-8 h-8 flex items-center justify-center shrink-0 border transition-transform duration-300 ${isOpen ? 'rotate-180 bg-surface-900 text-brand border-surface-900' : 'bg-white text-slate-400 border-surface-200'}`}>
 <ChevronDown className="w-4 h-4"/>
 </div>
 </button>
 
 <div 
 className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100 border-t border-brand/20' : 'max-h-0 opacity-0'}`}
 >
 <p className="text-slate-600 font-light leading-relaxed p-6 pt-4 ml-12">
 {faq.answer}
 </p>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </motion.section>
 );
}

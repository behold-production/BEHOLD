import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Minus, Plus } from 'lucide-react';
import ApiService from '../../services/api';

export default function Faq({ siteSettings }) {
  const navigate = useNavigate();
  const settings = siteSettings || {};
  const showFaqs = settings.enableFaq !== false;
  const [openIndex, setOpenIndex] = useState(0);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (showFaqs) {
      ApiService.getFaqs()
        .then((res) => {
          if (!isMounted) return;
          if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
            setFaqs(res.data);
          } else {
            setFaqs([]);
          }
        })
        .catch(() => { if (isMounted) setFaqs([]); })
        .finally(() => { if (isMounted) setLoading(false); });
    } else {
      setLoading(false);
    }
    return () => { isMounted = false; };
  }, [showFaqs]);

  if (!showFaqs) return null;

  const toggleIndex = (index) => setOpenIndex(openIndex === index ? null : index);

  return (
    <section
      id="faqs"
      aria-labelledby="bh-faq-heading"
      className="relative w-full overflow-hidden bg-white py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="reveal-on-scroll grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          {/* Intro */}
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0E7490]">
              <span aria-hidden="true" className="h-[1px] w-6 bg-[#0E7490]/40" />
              {settings.faqSectionSub || 'FAQ'}
            </span>

            <h2
              id="bh-faq-heading"
              className="mt-3 text-[24px] font-semibold leading-[1.18] tracking-tight text-[#0E1111] sm:text-[30px] md:text-[34px]"
            >
              {settings.faqSectionTitle || 'Frequently Asked Questions'}
            </h2>

            {settings.faqSectionDesc && (
              <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-[#55605F] sm:text-sm">
                {settings.faqSectionDesc}
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                navigate('/faqs');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E7490] transition-colors hover:text-[#0B5C73] cursor-pointer bg-transparent border-none p-0"
            >
              Browse all FAQs
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Accordion */}
          <div className="flex flex-col gap-2.5">
            {loading
              ? [1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="rounded-xl border border-[#E6DFD0] bg-[#FBF8F1] px-5 py-4">
                  <div className="h-3.5 w-2/3 animate-pulse rounded bg-[#EFE8DB]" />
                </div>
              ))
              : faqs.slice(0, 8).map((item, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div
                    key={item._id || item.id || idx}
                    className={`overflow-hidden rounded-xl border transition-colors duration-200 ${
                      isOpen
                        ? 'border-[#0E7490]/45 bg-[#FBF8F1]'
                        : 'border-[#E6DFD0] bg-white hover:border-[#0E7490]/30'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleIndex(idx)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 bg-transparent px-4 py-3.5 text-left cursor-pointer border-none sm:px-5"
                    >
                      <span className="text-[12.5px] font-semibold leading-snug text-[#0E1111] sm:text-[13.5px]">
                        {item.question}
                      </span>
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${
                          isOpen ? 'bg-[#0E7490] text-white' : 'bg-[#EAF4F7] text-[#0E7490]'
                        }`}
                      >
                        {isOpen ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                      </span>
                    </button>

                    {isOpen && item.answer && (
                      <div className="border-t border-[#EDE6D7] px-4 pb-4 pt-3 text-[12px] leading-relaxed text-[#55605F] sm:px-5 sm:text-[12.5px]">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}

            {!loading && faqs.length === 0 && (
              <div className="rounded-xl border border-[#E6DFD0] bg-[#FBF8F1] px-5 py-8 text-center text-xs leading-relaxed text-[#55605F]">
                Questions added from the admin panel will appear here.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

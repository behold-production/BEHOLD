import React from 'react';
import { ArrowRight, CheckCircle2, Sun } from 'lucide-react';

const DEFAULT_VALUES_IMAGE = 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1100&q=85';

export default function HomeValuesSection({ siteSettings, navigateToSection }) {
  const settings = siteSettings || {};
  const eyebrow = settings.aboutEyebrow || 'Care that feels human';
  const title = settings.aboutTitle || "Feeling better isn't a straight line.";
  const description = settings.aboutSub || "Some days you have the words. Some days you don't. Good support makes room for both. Find a professional who can help you make sense of what you're carrying, without rushing you toward a quick fix.";
  const image = settings.whyChooseUsImage || DEFAULT_VALUES_IMAGE;
  const imageCaption = settings.aboutImageCaption || 'Your pace. Your space.';
  const buttonText = settings.aboutBtnText || 'Meet the psychologists';

  const scrollToExperts = () => {
    if (navigateToSection) navigateToSection('experts');
    else document.getElementById('experts')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="bh-values" id="why-behold" aria-labelledby="bh-values-title">
      <div className="bh-section-shell bh-values-grid">
        <div className="bh-values-art">
          <img src={image} alt="A peaceful, sunlit therapy space" loading="lazy" />
          <span className="bh-values-art-label">
            <Sun size={15} className="text-amber-500" aria-hidden="true" />
            {imageCaption}
          </span>
        </div>
        <div className="bh-values-copy">
          <span className="bh-eyebrow">
            <span className="bh-eyebrow-dot" />
            {eyebrow}
          </span>
          <h2 id="bh-values-title">
            Feeling better isn't<br /><em>a straight line.</em>
          </h2>
          <p>{description}</p>

          <div className="bh-value-points">
            <div>
              <CheckCircle2 size={18} className="text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong>Come as you are</strong>
                <small>No perfect words or big explanations needed.</small>
              </div>
            </div>
            <div>
              <CheckCircle2 size={18} className="text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong>Choose what feels right</strong>
                <small>Online or in person, with a professional who fits.</small>
              </div>
            </div>
          </div>

          <button type="button" className="bh-text-button cursor-pointer" onClick={scrollToExperts}>
            {buttonText} <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

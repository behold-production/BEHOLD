import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function HomeClosingSection({ navigateToSection }) {
  const scrollToExperts = () => {
    if (navigateToSection) navigateToSection('experts');
    else document.getElementById('experts')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="bh-closing" aria-labelledby="bh-closing-title">
      <div className="bh-closing-inner">
        <span className="bh-closing-spark" aria-hidden="true">✳</span>
        <span className="bh-eyebrow bh-eyebrow-light"><span className="bh-eyebrow-dot" />Whenever you’re ready</span>
        <h2 id="bh-closing-title">There is room for<br /><em>how you feel.</em></h2>
        <button type="button" className="bh-button bh-button-cream" onClick={scrollToExperts}>
          Take the first step <ArrowRight size={16} aria-hidden="true" />
        </button>
        <p>No pressure. Just a place to begin.</p>
      </div>
    </section>
  );
}

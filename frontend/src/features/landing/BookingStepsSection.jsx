import React from 'react';
import { ArrowDown, CalendarDays, HeartHandshake, Sparkles } from 'lucide-react';

const bookingSteps = [
  {
    number: '01',
    title: 'Find your person',
    description: 'Browse psychologists by focus area, session style, and the kind of support you’re looking for.',
    Icon: HeartHandshake,
  },
  {
    number: '02',
    title: 'Choose your time',
    description: 'Pick a day, a time, and a way to meet that fits into your real everyday life.',
    Icon: CalendarDays,
  },
  {
    number: '03',
    title: 'Take it one step',
    description: 'Show up as you are. This is your space, and your journey moves at your pace.',
    Icon: Sparkles,
  },
];

export default function BookingStepsSection({ navigateToSection }) {
  return (
    <section id="how-it-works" className="bh-steps-section" aria-labelledby="bh-steps-title">
      <div className="bh-steps-inner bh-section-shell">
        <div className="bh-steps-heading">
          <span className="bh-eyebrow"><span className="bh-eyebrow-dot" />Simple by design</span>
          <h2 id="bh-steps-title">Starting can be<br /><em>the hardest part.</em></h2>
          <p>We’ll make the next steps feel a little lighter.</p>
        </div>
        <div className="bh-steps-grid">
          {bookingSteps.map(({ number, title, description, Icon }) => (
            <article className="bh-step-card" key={number}>
              <div className="bh-step-card-top">
                <span className="bh-step-number">{number}</span>
                <span className="bh-step-icon" aria-hidden="true"><Icon size={21} strokeWidth={1.7} /></span>
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
        <button
          className="bh-steps-link cursor-pointer"
          type="button"
          onClick={() => {
            if (navigateToSection) navigateToSection('experts');
            else document.getElementById('experts')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Explore psychologists <ArrowDown size={16} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

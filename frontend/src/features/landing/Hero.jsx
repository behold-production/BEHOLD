import React from 'react';
import { ArrowRight, MessageCircleHeart, ShieldCheck } from 'lucide-react';
import SEO from '../../components/common/SEO';

const getFirstText = (...values) => values.find((value) => typeof value === 'string' && value.trim())?.trim() || '';

const DEFAULT_HERO_PHOTO = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=85';

const CONCERN_TAGS = ['Anxiety', 'Relationships', 'Stress', 'Self-esteem', 'Life changes'];

export default function Hero({ siteSettings, navigateToSection, onOpenBooking }) {
  const settings = siteSettings || {};
  const eyebrow = getFirstText(settings.heroEyebrow, 'A softer place to begin');
  const title = getFirstText(settings.heroTitle, 'You don’t have to figure it all out on your own.');
  const description = getFirstText(
    settings.heroSub,
    'Meet a psychologist who listens without judgment and helps you find your way forward, one conversation at a time.'
  );
  const buttonText = getFirstText(settings.heroBtnText, 'Find your psychologist');
  const heroImage = getFirstText(settings.heroArtImage, settings.heroBgImage) || DEFAULT_HERO_PHOTO;

  const scrollToExperts = (concern) => {
    if (concern && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('behold:filter_specialty', { detail: { specialty: concern } }));
    }
    if (navigateToSection) navigateToSection('experts');
    else document.getElementById('experts')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <SEO
        title={`${settings.siteName || 'BEHOLD'} | ${title}`}
        description={description}
        canonicalUrl="https://www.behold.co.in/"
      />
      <section className="bh-hero" id="home" aria-labelledby="bh-hero-title">
        <div className="bh-hero-content bh-section-shell">
          {/* Left Column: Copy & Actions */}
          <div className="bh-hero-copy">
            <span className="bh-eyebrow bh-hero-eyebrow">
              <span className="bh-eyebrow-dot" aria-hidden="true" />
              {eyebrow}
            </span>

            <h1 id="bh-hero-title">
              {settings.heroTitle ? (
                settings.heroTitle.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < settings.heroTitle.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))
              ) : (
                <>
                  You don’t have<br />
                  to figure it all <em>out</em><br />
                  on your own.
                </>
              )}
            </h1>

            <p className="bh-hero-description">{description}</p>

            <div className="bh-hero-actions">
              <button
                type="button"
                className="bh-button bh-button-primary"
                onClick={() => scrollToExperts()}
              >
                {buttonText} <ArrowRight size={16} aria-hidden="true" />
              </button>

              <div className="bh-hero-trust">
                <span className="bh-trust-mark" aria-hidden="true">
                  <MessageCircleHeart size={18} />
                </span>
                <span>
                  Care that meets you<br />where you are
                </span>
              </div>
            </div>

            <div className="bh-hero-assurance">
              <span>
                <ShieldCheck size={15} aria-hidden="true" />
                Private, thoughtful, and always at your pace
              </span>
            </div>
          </div>

          {/* Right Column: Visual Frame & Stamps */}
          <div className="bh-hero-art" aria-hidden="true">
            <div className="bh-hero-photo-wrap">
              <img
                src={heroImage}
                alt="A warm, sunlit, supportive therapy space"
                className="bh-hero-photo"
                loading="eager"
              />
              <div className="bh-photo-wash" />
              <div className="bh-photo-caption">
                <span className="bh-caption-icon">
                  <MessageCircleHeart size={18} />
                </span>
                <div>
                  <strong>A little more understood.</strong>
                  <small>It starts with one conversation.</small>
                </div>
              </div>
              <span className="bh-floating-leaf bh-leaf-one">✳</span>
              <span className="bh-floating-leaf bh-leaf-two">✳</span>
            </div>

            <div className="bh-hero-side-note">
              <span />
              <span>MADE FOR YOUR<br />REAL, EVERYDAY LIFE</span>
            </div>

            <div className="bh-hero-stamp">
              <span>ROOM<br />TO GROW</span>
              <i>🌸</i>
            </div>
          </div>
        </div>

        {/* Bottom Line: Emotional Concern Tags */}
        <div className="bh-hero-bottomline bh-section-shell">
          <span>Support for the things that feel heavy</span>
          <div className="bh-concern-tags">
            {CONCERN_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => scrollToExperts(tag)}
                className="cursor-pointer transition-all hover:border-[#315c4e] hover:text-[#315c4e]"
                title={`Find psychologists specializing in ${tag}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

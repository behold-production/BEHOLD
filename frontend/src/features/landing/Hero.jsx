import React from "react";
import luxuryHeroBg from "../../assets/luxury_hero_bg.png";
import climateCrisisFont from "../../assets/Climate-Crisis.ttf";

export default function Hero({ siteSettings }) {
  const settings = siteSettings || {};

  const heroBg =
    settings.heroBgImage ||
    settings.heroSlides?.[0]?.image ||
    luxuryHeroBg;

  const rawTitle = settings.heroTitle || "EVERY MIND\nMATTERS";
  const displayEyebrow = settings.heroEyebrow || "Whatever you feel,";
  const displaySubtitle =
    settings.heroSub ||
    "A personal development and mentoring ecosystem — combining psychological care, self-discovery, and career guidance to help you grow with confidence and peace of mind.";

  const displayBtnText =
    settings.heroBtnText || "BOOK CONSULTATION";

  const renderTitle = (titleText) => {
    if (!titleText) return null;

    const lines = titleText.split("\n");

    return lines.map((line, lineIndex) => {
      const parts = line.split(/(\{[^}]+\})/g);

      return (
        <React.Fragment key={lineIndex}>
          {parts.map((part, partIndex) => {
            if (part.startsWith("{") && part.endsWith("}")) {
              return (
                <span
                  key={partIndex}
                  style={{ fontFamily: "'Climate Crisis', sans-serif" }}
                  className="text-[#00e5ff]"
                >
                  {part.slice(1, -1).toLowerCase()}
                </span>
              );
            }

            return (
              <span
                key={partIndex}
                style={{ fontFamily: "'Climate Crisis', sans-serif" }}
              >
                {part.toLowerCase()}
              </span>
            );
          })}

          {lineIndex !== lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  const handleBook = () => {
    window.spaNavigate?.("/book-session");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden bg-[#0f172a] text-white"
    >
      <style>{`
        @font-face {
          font-family: 'Climate Crisis';
          src: url('${climateCrisisFont}') format('truetype');
          font-display: swap;
        }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Hero Background"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/75 via-[#0f172a]/45 to-[#0f172a]/65" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen w-full">
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 sm:px-10 lg:px-16">

          {/* Center Left Heading */}
          <div className="flex flex-1 items-center">
            <div className="max-w-3xl">

              <span className="mb-5 block font-['Cormorant_Garamond'] italic font-medium text-[#00e5ff] text-lg sm:text-xl md:text-2xl lg:text-3xl">
                {displayEyebrow}
              </span>

              <h1
                style={{ fontFamily: "'Climate Crisis', sans-serif" }}
                className="font-climate text-white leading-[1] tracking-tight drop-shadow-xl text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
              >
                {renderTitle(rawTitle.toLowerCase())}
              </h1>

            </div>
          </div>

          {/* Bottom Fixed Content */}
          <div className="pb-10 sm:pb-14">
            <div className="max-w-xl">

              <p className="text-sm sm:text-base md:text-lg leading-relaxed text-white/90">
                {displaySubtitle}
              </p>

              <button
                onClick={handleBook}
                className="mt-8 inline-flex items-center rounded-full bg-[#00e5ff] px-8 py-3.5 text-xs sm:text-sm font-bold tracking-[0.2em] text-[#0f172a] transition-all duration-300 hover:bg-[#00cce6] hover:scale-105"
              >
                {displayBtnText}
              </button>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
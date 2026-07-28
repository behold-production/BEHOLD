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

  const displayEyebrow =
    settings.heroEyebrow || "Whatever you feel,";

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
                  style={{
                    fontFamily: "'Climate Crisis', sans-serif",
                  }}
                  className="text-[#00e5ff]"
                >
                  {part.slice(1, -1).toLowerCase()}
                </span>
              );
            }

            return (
              <span
                key={partIndex}
                style={{
                  fontFamily: "'Climate Crisis', sans-serif",
                }}
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
          className="
    h-full
    w-full
    object-cover

    object-right
    md:object-center
  "
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/75 via-[#0f172a]/45 to-[#0f172a]/65" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        <div
          className="
            mx-auto
            flex
            min-h-screen
            w-full
            max-w-7xl
            flex-col

            justify-end
            md:justify-between

            px-5
            sm:px-8
            md:px-10
            lg:px-12
            xl:px-16

            pb-8
            sm:pb-10
            md:pb-0
          "
        >
          {/* ========================= */}
          {/* Hero Heading */}
          {/* ========================= */}
          <div
            className="
              flex
              flex-1
              flex-col
              justify-end
              md:justify-center
            "
          >
            <div className="max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl">

              {/* Eyebrow */}
              <span
                className="
                  block
                  mb-3
                  sm:mb-4
                  lg:mb-5

                  font-['Cormorant_Garamond']
                  italic
                  font-medium

                  text-[#00e5ff]

                  text-lg
                  sm:text-xl
                  md:text-2xl
                  lg:text-[30px]
                  xl:text-[34px]

                  leading-none
                "
              >
                {displayEyebrow}
              </span>

              {/* Hero Title */}
              <h1
                style={{
                  fontFamily: "'Climate Crisis', sans-serif",
                  fontSize: "clamp(2.7rem, 7vw, 6.8rem)",
                }}
                className="
                  font-climate
                  text-left
                  text-white

                  leading-[0.94]
                  tracking-tight

                  drop-shadow-xl

                  max-w-xs
                  sm:max-w-md
                  md:max-w-xl
                  lg:max-w-2xl
                "
              >
                {renderTitle(rawTitle.toLowerCase())}
              </h1>

            </div>
          </div>
          {/* ========================= */}
          {/* Bottom Content */}
          {/* ========================= */}
          <div
            className="
              mt-8
              md:mt-0

              pb-4
              sm:pb-6
              md:pb-10
              lg:pb-12
              xl:pb-16
            "
          >
            <div className="max-w-sm sm:max-w-md md:max-w-lg">

              {/* Subtitle */}
              <p
                style={{
                  fontSize: "clamp(0.95rem, 1.3vw, 1.1rem)",
                }}
                className="
                  text-left
                  text-white/90
                  leading-7
                "
              >
                {displaySubtitle}
              </p>

              {/* CTA Button */}
              <button
                onClick={handleBook}
                className="
                  mt-6
                  inline-flex
                  items-center
                  justify-center

                  rounded-full

                  bg-[#00e5ff]
                  hover:bg-[#00cce6]

                  px-6
                  sm:px-7
                  lg:px-8

                  py-3
                  lg:py-3.5

                  text-[11px]
                  sm:text-xs
                  lg:text-sm

                  font-bold
                  tracking-[0.18em]

                  text-[#0f172a]

                  transition-all
                  duration-300

                  hover:scale-105
                  active:scale-95
                "
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
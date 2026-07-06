import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Brain,
  Puzzle,
  BookOpen,
  UserCheck,
  RotateCcw,
  Award,
  ArrowUpRight,
  Lightbulb,
  Heart,
  Loader2
} from 'lucide-react';

import ApiService from '../../shared/services/api';

const DOMAIN_DETAILS = {
  Aptitude: {
    title: "General Cognitive Aptitude",
    icon: <Brain className="w-8 h-8 text-brand-dark" />,
    desc: "You have a strong capacity for general cognitive problem-solving, mathematical tracking, and deductive reasoning under time-bounded scenarios."
  },
  Logical: {
    title: "Logical & Pattern Reasoning",
    icon: <Puzzle className="w-8 h-8 text-brand-dark" />,
    desc: "You possess a powerful ability to analyze sequential data, identify underlying formulas, and evaluate structured arguments objectively."
  },
  Emotional: {
    title: "Emotional & Intrapersonal Intelligence",
    icon: <Heart className="w-8 h-8 text-brand-dark" />,
    desc: "You possess high self-awareness, active empathy, emotional regulation, and deep understanding of human psychological motivation models."
  },
  Career: {
    title: "Career Interests & Direction",
    icon: <BookOpen className="w-8 h-8 text-brand-dark" />,
    desc: "You have a highly defined interest profile in modern industrial and operational sectors, showing clear paths towards system planning and coaching."
  },
  Personality: {
    title: "Self-Direction & Personality Alignment",
    icon: <UserCheck className="w-8 h-8 text-brand-dark" />,
    desc: "You excel at identifying personal values, managing focus quarters, and establishing productive study environments with high self-discipline."
  },
  Communication: {
    title: "Verbal & Communication Flow",
    icon: <BookOpen className="w-8 h-8 text-brand-dark" />,
    desc: "You possess strong skills in speech articulation, conflict mediation, and clarifying complex technical systems for diverse audiences."
  },
  Creativity: {
    title: "Lateral & Creative Thinking",
    icon: <Lightbulb className="w-8 h-8 text-brand-dark" />,
    desc: "You excel at visual layouts, abstract brainstorming, and finding multiple alternative uses for ordinary systems. You reject copy-paste designs."
  },
  Leadership: {
    title: "Leadership & Milestones Direction",
    icon: <Award className="w-8 h-8 text-brand-dark" />,
    desc: "You naturally coordinate group roles, structure consensus votes, establish milestone tracking, and maintain motivational energy for team delivery."
  }
};

const CATEGORIES = [
  { key: 'Aptitude', label: 'Cognitive Aptitude' },
  { key: 'Logical', label: 'Logical Reasoning' },
  { key: 'Emotional', label: 'Emotional Intelligence' },
  { key: 'Career', label: 'Career Interests' },
  { key: 'Personality', label: 'Personality Align' },
  { key: 'Communication', label: 'Communication Flow' },
  { key: 'Creativity', label: 'Creativity & Design' },
  { key: 'Leadership', label: 'Leadership Skills' }
];

export default function AptitudeTest({ onFinishTest }) {
  const [dbQuestions, setDbQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [testFinished, setTestFinished] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  
  const [testScores, setTestScores] = useState({
    Aptitude: 0,
    Logical: 0,
    Emotional: 0,
    Career: 0,
    Personality: 0,
    Communication: 0,
    Creativity: 0,
    Leadership: 0
  });

  useEffect(() => {
    async function loadQuestions() {
      try {
        const res = await ApiService.getPublicAptitudeQuestions();
        if (res.success && res.data) {
          setDbQuestions(res.data);
          const shuffled = [...res.data].sort(() => 0.5 - Math.random());
          setShuffledQuestions(shuffled);
        }
      } catch (error) {
        console.error("Failed to load aptitude questions:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadQuestions();
  }, []);

  const handleAnswer = (category, weight) => {
    if (isAnimating) return;
    setIsAnimating(true);

    setTimeout(() => {
      setTestScores(prev => ({
        ...prev,
        [category]: (prev[category] || 0) + weight
      }));

      if (currentQuestion < shuffledQuestions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        setTestFinished(true);
      }
      setIsAnimating(false);
    }, 200);
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setTestScores({
      Aptitude: 0,
      Logical: 0,
      Emotional: 0,
      Career: 0,
      Personality: 0,
      Communication: 0,
      Creativity: 0,
      Leadership: 0
    });
    const reshuffled = [...dbQuestions].sort(() => Math.random() - 0.5);
    setShuffledQuestions(reshuffled);
    setTestFinished(false);
    setIsAnimating(false);
  };

  const handleClaimMentoring = async () => {
    if (isClaiming) return;
    setIsClaiming(true);
    try {
      await onFinishTest(dominantDomain, scorePercentages);
    } catch (error) {
      console.error("Error claiming mentoring:", error);
    } finally {
      setIsClaiming(false);
    }
  };

  // Calculations for results panel (max score is 10 per category)
  const scorePercentages = {
    Aptitude: Math.min(Math.round(((testScores.Aptitude || 0) / 10) * 100), 100),
    Logical: Math.min(Math.round(((testScores.Logical || 0) / 10) * 100), 100),
    Emotional: Math.min(Math.round(((testScores.Emotional || 0) / 10) * 100), 100),
    Career: Math.min(Math.round(((testScores.Career || 0) / 10) * 100), 100),
    Personality: Math.min(Math.round(((testScores.Personality || 0) / 10) * 100), 100),
    Communication: Math.min(Math.round(((testScores.Communication || 0) / 10) * 100), 100),
    Creativity: Math.min(Math.round(((testScores.Creativity || 0) / 10) * 100), 100),
    Leadership: Math.min(Math.round(((testScores.Leadership || 0) / 10) * 100), 100)
  };

  // Find dominant domain
  const dominantDomain = Object.keys(scorePercentages).reduce((a, b) =>
    scorePercentages[a] > scorePercentages[b] ? a : b
  , 'Aptitude');

  const dominantInfo = DOMAIN_DETAILS[dominantDomain] || DOMAIN_DETAILS.Aptitude;

  // Generate dynamic careers recommendations based on score thresholds
  const generateCareers = (pct) => {
    const list = [];
    if (pct.Logical >= 80) list.push({ career: "Software Engineer", reason: "Excellent logical reasoning & data synthesis scores" });
    if (pct.Creativity >= 80) list.push({ career: "UI/UX Designer", reason: "High lateral thinking and abstract layout affinity" });
    if (pct.Leadership >= 80) list.push({ career: "Product Manager / Director", reason: "Strong alignment, milestones coordination & vote mediation" });
    if (pct.Emotional >= 80) list.push({ career: "Clinical Psychologist", reason: "Exceptional self-reflection, empathy & therapeutic listening" });
    if (pct.Communication >= 80) list.push({ career: "Corporate Consultant", reason: "Articulate explanation & multi-stakeholder mediation" });
    if (pct.Aptitude >= 80) list.push({ career: "Quantitative Analyst", reason: "Rapid deductive sorting & general intelligence" });
    if (pct.Career >= 80) list.push({ career: "Systems Architect", reason: "Strategic organization, prototyping & roadmapping" });
    if (pct.Personality >= 80) list.push({ career: "HR Director / Talent Advisor", reason: "Strong evaluation of personal goals and growth drivers" });

    // Fallbacks if scores are lower or balanced
    if (list.length < 3) {
      const sorted = Object.entries(pct).sort((a, b) => b[1] - a[1]);
      const fallbacks = {
        Logical: { career: "Data Scientist", reason: "Excellent numerical sequencing & logical patterns score" },
        Creativity: { career: "Creative Director", reason: "Top scores in lateral brainstorming and layout design" },
        Leadership: { career: "Project Lead / Consultant", reason: "Capable of milestone tracking and coordinate roles" },
        Emotional: { career: "Educational Counselor", reason: "Shows warmth, active conflict mediation & self-reflection" },
        Communication: { career: "Technical Writer / Educator", reason: "Excellent verbal explanation and analogical speech" },
        Aptitude: { career: "Academic Researcher", reason: "Robust cognitive problem-solving metrics" },
        Career: { career: "Strategic Planner", reason: "Highly structured milestone planning and roadmap outline" },
        Personality: { career: "Performance Coach", reason: "Deep comprehension of personal focus milestones" }
      };
      
      sorted.forEach(([cat]) => {
        if (list.length < 3 && !list.some(item => item.career === fallbacks[cat].career)) {
          list.push(fallbacks[cat]);
        }
      });
    }

    return list.slice(0, 4); // Limit to top 4 recommendations
  };

  const recommendedCareers = generateCareers(scorePercentages);

  if (isLoading || shuffledQuestions.length === 0) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-surface-50 text-surface-900 flex items-center justify-center font-sans">
        <p className="text-[10px] font-black capitalize tracking-widest text-surface-500 animate-pulse">Initializing quiz console...</p>
      </div>
    );
  }

  const currentQObj = shuffledQuestions[currentQuestion];
  if (!currentQObj) return null;

  return (
    <div className="pt-20 sm:pt-24 pb-12 sm:pb-16 min-h-screen bg-surface-50 text-surface-900 relative overflow-hidden font-sans border-b border-surface-200 text-left">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">

        {!testFinished ? (
          /* Quiz Interface Card */
          <div
            className={`bg-white border border-surface-200 rounded-[10px] shadow-square-light p-5 sm:p-8 md:p-14 select-none transition-all duration-300 ${
              isAnimating ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'
            }`}
            id="quiz-card"
          >
            {/* Header / Progress bar */}
            <div className="mb-8 sm:mb-12">
              <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-surface-900 capitalize tracking-widest leading-none">
                    Aptitude Profiling
                  </h2>
                  <p className="text-[10px] font-bold capitalize tracking-widest text-surface-500 mt-2">
                    Discover your core cognitive affinities across 8 dimensions.
                  </p>
                </div>
                <span className="text-surface-900 font-black text-sm sm:text-lg self-start sm:self-auto">
                  {currentQuestion + 1} <span className="text-surface-300">/</span> {shuffledQuestions.length}
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="h-1.5 w-full bg-surface-100 rounded-[10px] overflow-hidden">
                <div
                  className="h-full bg-surface-900 transition-all duration-500 ease-out"
                  style={{ width: `${((currentQuestion + 1) / dbQuestions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question Text */}
            <div className="mb-6 sm:mb-10">
              <div className="flex gap-4 items-start mb-6">
                <span className="flex items-center justify-center w-7 h-7 rounded-[10px] bg-surface-100 text-surface-900 font-black text-[10px] capitalize tracking-widest shrink-0 mt-0.5 ">
                  Q
                </span>
                <h3 className="text-base sm:text-lg md:text-xl font-black text-surface-900 capitalize tracking-widest leading-snug">
                  {currentQObj.question}
                </h3>
              </div>

              {/* Options Grid */}
              <div className="grid gap-3 sm:gap-4 mt-6 sm:mt-8">
                {currentQObj.options.map((opt, i) => (
                  <button
                    key={i}
                    id={`opt-btn-${i}`}
                    onClick={() => handleAnswer(currentQObj.category, opt.weight)}
                    className="w-full text-left p-4 sm:p-5 rounded-[10px] border border-surface-200 bg-surface-50 hover:bg-surface-100 hover:border-surface-300 transition-all duration-200 flex items-center justify-between group cursor-pointer text-surface-900 shadow-none"
                  >
                    <span className="text-[10px] sm:text-xs font-black capitalize tracking-widest text-surface-600 group-hover:text-surface-900 transition-colors pr-4">
                      {opt.text}
                    </span>
                    <div className="w-4 h-4 rounded-[10px] border border-surface-300 group-hover:border-surface-900 group-hover:bg-surface-900 transition-all duration-200 flex items-center justify-center shrink-0 ml-4">
                      <div className="w-1.5 h-1.5 rounded-[10px] bg-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Results Panel */
          <div
            className="bg-white border border-surface-200 rounded-[10px] shadow-square-light p-5 sm:p-8 md:p-14 relative overflow-hidden animate-in zoom-in-95 duration-500 text-left"
            id="results-panel"
          >
            {/* Header Shield */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 sm:pb-8 border-b border-surface-100 mb-6 sm:mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface-900 text-white rounded-[10px] flex items-center justify-center shadow-square-light shrink-0">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] bg-surface-50 border border-surface-200 text-surface-900 text-[10px] capitalize tracking-widest font-black mb-1">
                    <Award className="w-3.5 h-3.5 text-surface-900" /> CIGI Framework Certified
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-surface-900 capitalize tracking-widest leading-none">
                    Assessment Completed
                  </h2>
                </div>
              </div>
              <button
                id="btn-restart-test"
                onClick={handleRestart}
                className="px-5 py-2.5 bg-white border border-surface-200 hover:border-surface-900 hover:bg-surface-50 text-surface-900 rounded-full font-black text-[10px] capitalize tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-none w-full md:w-auto justify-center"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Test</span>
              </button>
            </div>

            {/* Main Strength Indicator */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">

              {/* Dominant Affinity Profile Card */}
              <div className="lg:col-span-7 space-y-6">
                <h3 className="text-[10px] font-bold text-surface-500 capitalize tracking-widest">
                  Your Dominant Affinity Profile
                </h3>

                <div className="p-5 sm:p-6 rounded-[10px] border border-surface-200 bg-surface-50 flex gap-4 text-surface-900 shadow-square-light">
                  <div className="shrink-0 mt-1">{dominantInfo.icon}</div>
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-surface-900 capitalize tracking-widest leading-tight mb-2">
                      {dominantInfo.title}
                    </h4>
                    <p className="text-surface-600 text-[10px] font-bold capitalize tracking-widest leading-relaxed">
                      {dominantInfo.desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendations and Call-to-Action */}
              <div className="lg:col-span-5 lg:row-span-2 space-y-6">
                <div className="p-5 sm:p-6 bg-surface-50 border border-surface-200 rounded-[10px] space-y-6 shadow-square-light">
                  <h4 className="font-black text-surface-900 text-[10px] capitalize tracking-widest border-b border-surface-200 pb-3">
                    Recommended Pathways
                  </h4>
                  <ul className="space-y-3">
                    {recommendedCareers.map((item, cIdx) => (
                      <li
                        key={cIdx}
                        className="flex flex-col bg-white p-3 sm:p-4 rounded-[10px] border border-surface-200 hover:border-surface-400 transition-all duration-200 group text-left"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-surface-900 capitalize tracking-widest">
                            {item.career}
                          </span>
                        </div>
                        <span className="text-[10px] text-surface-500 font-bold capitalize tracking-widest mt-1 leading-relaxed">
                          {item.reason}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Action link */}
                  <div className="pt-2">
                    <button
                      id="btn-results-consult"
                      onClick={handleClaimMentoring}
                      disabled={isClaiming}
                      className="w-full py-3.5 sm:py-4 bg-surface-900 hover:bg-surface-800 text-white font-black text-[10px] capitalize tracking-widest rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-none border-none disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
                    >
                      {isClaiming ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Claiming...</span>
                        </>
                      ) : (
                        <span>Claim Free Mentoring</span>
                      )}
                    </button>
                    <p className="text-[10px] font-bold capitalize tracking-widest text-surface-500 text-center mt-3 flex items-center justify-center gap-1">
                      Schedules with a State Coordinator.
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Metrics Breakdown */}
              <div className="lg:col-span-7 space-y-4">
                <h4 className="font-black text-surface-900 text-[10px] capitalize tracking-widest">
                  Cognitive Distribution Metrics
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {CATEGORIES.map(({ key, label }) => {
                    const pct = scorePercentages[key];
                    return (
                      <div key={key} className="space-y-1 bg-white p-3 rounded-[10px] border border-surface-200" id={`score-metric-${key.toLowerCase()}`}>
                        <div className="flex justify-between text-[10px] font-bold text-surface-500 capitalize tracking-widest">
                          <span>{label}</span>
                          <span className="font-black text-surface-900">{pct}%</span>
                        </div>
                        <div className="h-2 w-full bg-surface-100 rounded-[10px] overflow-hidden">
                          <div
                            className="h-full bg-surface-900 rounded-[10px] transition-all duration-1000 ease-out"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

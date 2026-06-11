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
  Heart
} from 'lucide-react';

const TEST_QUESTIONS = [
  {
    id: 1,
    question: "How do you prefer to solve a complex puzzle?",
    category: "Logical",
    options: [
      { text: "Analyzing patterns and breaking them down systematically", weight: 5 },
      { text: "Visualizing the completed picture in my mind's eye", weight: 3 },
      { text: "Talking it through with someone else to generate ideas", weight: 2 },
      { text: "Trial and error until the pieces fit together", weight: 1 }
    ]
  },
  {
    id: 2,
    question: "Which of these activities sounds most exciting to you?",
    category: "Career",
    options: [
      { text: "Coding a logic-based math game or grid puzzle", weight: 5 },
      { text: "Writing a persuasive short story, essay, or poem", weight: 4 },
      { text: "Designing an architectural or interior floor plan", weight: 3 },
      { text: "Leading a lively group debate on social issues", weight: 2 }
    ]
  },
  {
    id: 3,
    question: "When learning something new, you prefer:",
    category: "Personality",
    options: [
      { text: "Reflecting in private on how it applies to your personal goals", weight: 5 },
      { text: "Drawing visual diagrams, color-coded mindmaps, or charts", weight: 4 },
      { text: "Following a structured, step-by-step programming manual", weight: 3 },
      { text: "Practicing the skill immediately in a collaborative group", weight: 2 }
    ]
  },
  {
    id: 4,
    question: "Which of the following describes your ideal workspace?",
    category: "Personality",
    options: [
      { text: "A quiet, private study where I can concentrate deeply alone", weight: 5 },
      { text: "A structured office with checklists, files, and project trackers", weight: 4 },
      { text: "A collaborative workspace with boards for group debate", weight: 3 },
      { text: "An artistic studio surrounded by draft papers and sketches", weight: 2 }
    ]
  },
  {
    id: 5,
    question: "If you were to write a blog post, what would it be about?",
    category: "Communication",
    options: [
      { text: "A personal reflection on lessons learned from failure", weight: 5 },
      { text: "A fictional story filled with rich dialogue and wordplay", weight: 4 },
      { text: "A commentary on a recent public debate or speech", weight: 3 },
      { text: "A guide explaining how a complex logic formula works", weight: 2 }
    ]
  },
  {
    id: 6,
    question: "When presented with a debate, what is your first reaction?",
    category: "Communication",
    options: [
      { text: "To mediate the conversation and write down points of agreement", weight: 5 },
      { text: "To reflect on my own internal feelings and moral stand first", weight: 4 },
      { text: "To analyze the persuasive power, vocabulary, and flow of speech", weight: 3 },
      { text: "To construct structured logical counter-arguments to disprove errors", weight: 2 }
    ]
  },
  {
    id: 7,
    question: "How do you keep track of your daily tasks and homework?",
    category: "Logical",
    options: [
      { text: "A highly structured, color-coded spreadsheet or calendar app", weight: 5 },
      { text: "A reflective personal journal or diary describing my feelings", weight: 4 },
      { text: "A simple note containing a narrative description of the day", weight: 3 },
      { text: "I go with the flow and address issues as they arise in groups", weight: 1 }
    ]
  },
  {
    id: 9,
    question: "When resolving an argument with a friend, you tend to:",
    category: "Emotional",
    options: [
      { text: "Reflect privately on my own behavior and hidden biases first", weight: 5 },
      { text: "Analyze the facts and chronology objectively to find the root cause", weight: 4 },
      { text: "Sit down and explain my feelings clearly using precise words", weight: 3 },
      { text: "Let it cool down naturally without overthinking it", weight: 2 }
    ]
  },
  {
    id: 10,
    question: "You have 3 boxes: one contains only apples, one contains oranges, and one both. All labels are incorrect. How many fruits must you draw to label all boxes correctly?",
    category: "Aptitude",
    options: [
      { text: "Only 1 fruit from the box labeled 'Apples & Oranges'", weight: 5 },
      { text: "At least 2 fruits from different boxes", weight: 3 },
      { text: "It is mathematically impossible without opening all", weight: 1 },
      { text: "Draw 1 from each box", weight: 2 }
    ]
  },
  {
    id: 11,
    question: "A group member is quiet and seems frustrated during a session. How do you handle this?",
    category: "Emotional",
    options: [
      { text: "Speak with them privately after the meeting to see if they want to share", weight: 5 },
      { text: "Ask them directly in front of the group to share what is bothering them", weight: 2 },
      { text: "Ignore it and focus on completing the task with active members", weight: 1 },
      { text: "Assign them a direct task so they are forced to participate", weight: 3 }
    ]
  },
  {
    id: 12,
    question: "What kind of project would you find most satisfying to deliver?",
    category: "Career",
    options: [
      { text: "A successful community drive or charity event that helps people", weight: 5 },
      { text: "A functional, well-designed application or physical prototype", weight: 4 },
      { text: "A detailed research report analyzing future trends and data", weight: 4 },
      { text: "An organized project roadmap and budget sheet for a client", weight: 3 }
    ]
  },
  {
    id: 13,
    question: "You are given a brick. How many alternative uses can you brainstorm for it in 1 minute?",
    category: "Creativity",
    options: [
      { text: "10+ creative uses (e.g., paperweight, doorstop, artistic sculpture, paint grinding)", weight: 5 },
      { text: "5-9 functional uses (e.g., support block, garden border)", weight: 4 },
      { text: "2-4 standard uses (e.g., building a wall, throwing)", weight: 2 },
      { text: "I only see it as a construction material", weight: 1 }
    ]
  },
  {
    id: 14,
    question: "When designing the visual layout of a page or poster, you start by:",
    category: "Creativity",
    options: [
      { text: "Sketching multiple abstract layouts to see what feels most unique", weight: 5 },
      { text: "Aligning components systematically using a strict grid layout", weight: 4 },
      { text: "Copying an existing design that I know works well", weight: 2 },
      { text: "Focusing on the text first and adding colors at the end", weight: 3 }
    ]
  },
  {
    id: 15,
    question: "Your team is divided between two approaches for a project. How do you lead them to a decision?",
    category: "Leadership",
    options: [
      { text: "Facilitate a structured vote after evaluating the pros and cons of both", weight: 5 },
      { text: "Choose the option that I personally believe is best to keep moving forward", weight: 2 },
      { text: "Let the group continue debating until a consensus emerges naturally", weight: 2 },
      { text: "Divide the project into two parts so both groups do it their way", weight: 1 }
    ]
  },
  {
    id: 16,
    question: "When taking on a group assignment, you naturally tend to:",
    category: "Leadership",
    options: [
      { text: "Coordinate milestones, assign roles, and keep everyone aligned on the goal", weight: 5 },
      { text: "Focus deeply on completing my own assigned tasks to high standards", weight: 3 },
      { text: "Support others by offering help and resolving conflicts", weight: 4 },
      { text: "Follow instructions and let others set the direction", weight: 2 }
    ]
  }
];

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
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [testFinished, setTestFinished] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
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

  // Randomize questions order on initial load
  useEffect(() => {
    const shuffled = [...TEST_QUESTIONS].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
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
    const reshuffled = [...TEST_QUESTIONS].sort(() => Math.random() - 0.5);
    setShuffledQuestions(reshuffled);
    setTestFinished(false);
    setIsAnimating(false);
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

  if (shuffledQuestions.length === 0) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-zinc-50 text-zinc-900 flex items-center justify-center font-sans">
        <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400 animate-pulse">Initializing quiz console...</p>
      </div>
    );
  }

  const currentQObj = shuffledQuestions[currentQuestion];

  return (
    <div className="pt-20 sm:pt-32 pb-12 sm:pb-20 min-h-screen bg-zinc-50 text-zinc-900 relative overflow-hidden font-sans border-b border-zinc-200 text-left">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">

        {!testFinished ? (
          /* Quiz Interface Card */
          <div
            className={`card-luxury p-5 sm:p-8 md:p-14 select-none border border-zinc-200 bg-white rounded-lg transition-all duration-300 ${
              isAnimating ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'
            }`}
            id="quiz-card"
          >
            {/* Header / Progress bar */}
            <div className="mb-8 sm:mb-12">
              <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-header font-black text-zinc-900 uppercase tracking-wide">
                    Aptitude Profiling
                  </h2>
                  <p className="text-zinc-550 font-sans text-xs font-light mt-1">
                    Discover your core cognitive affinities across 8 dimensions.
                  </p>
                </div>
                <span className="text-zinc-900 font-header font-black text-sm sm:text-lg self-start sm:self-auto">
                  {currentQuestion + 1} <span className="text-zinc-300">/</span> {shuffledQuestions.length}
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="h-1.5 w-full bg-zinc-100 rounded-md overflow-hidden">
                <div
                  className="h-full bg-gradient-brand transition-all duration-500 ease-out"
                  style={{ width: `${((currentQuestion + 1) / shuffledQuestions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question Text */}
            <div className="mb-6 sm:mb-10">
              <div className="flex gap-4 items-start mb-6">
                <span className="flex items-center justify-center w-7 h-7 rounded-md bg-zinc-100 text-zinc-900 font-bold text-xs shrink-0 mt-0.5 font-mono">
                  Q
                </span>
                <h3 className="text-base sm:text-lg md:text-xl font-header font-bold text-zinc-900 leading-snug">
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
                    className="w-full text-left p-4 sm:p-5 rounded-lg border border-zinc-200 bg-white/50 hover:bg-white hover:border-brand transition-all duration-200 flex items-center justify-between group cursor-pointer text-zinc-900"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-zinc-700 group-hover:text-zinc-900 transition-colors">
                      {opt.text}
                    </span>
                    <div className="w-4 h-4 rounded-md border border-zinc-200 group-hover:border-brand group-hover:bg-brand transition-all duration-200 flex items-center justify-center shrink-0 ml-4">
                      <div className="w-1.5 h-1.5 rounded-sm bg-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Results Panel */
          <div
            className="card-luxury p-5 sm:p-8 md:p-14 border border-zinc-200 bg-white rounded-lg relative overflow-hidden animate-in zoom-in-95 duration-500"
            id="results-panel"
          >
            {/* Header Shield */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 sm:pb-8 border-b border-zinc-100 mb-6 sm:mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-950 text-brand rounded-xl flex items-center justify-center shadow-md shrink-0">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-900 text-[9px] font-extrabold uppercase tracking-wider mb-1">
                    <Award className="w-3.5 h-3.5 text-zinc-900" /> CIGI Framework Certified
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-header font-black text-zinc-900 leading-none">
                    Assessment Completed
                  </h2>
                </div>
              </div>
              <button
                id="btn-restart-test"
                onClick={handleRestart}
                className="px-5 py-2.5 bg-white border border-zinc-200 hover:border-zinc-900 text-zinc-900 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-xs w-full md:w-auto justify-center"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Test</span>
              </button>
            </div>

            {/* Main Strength Indicator */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">

              {/* Left Column: Dominant Domain */}
              <div className="lg:col-span-7 space-y-6">
                <h3 className="text-[10px] font-extrabold text-zinc-400 tracking-wider uppercase">
                  Your Dominant Affinity Profile
                </h3>

                <div className="p-5 sm:p-6 rounded-lg border border-zinc-200 bg-zinc-50/50 flex gap-4 text-zinc-900 shadow-xs">
                  <div className="shrink-0 mt-1">{dominantInfo.icon}</div>
                  <div>
                    <h4 className="text-base sm:text-lg font-header font-black text-zinc-900 leading-tight mb-2 uppercase">
                      {dominantInfo.title}
                    </h4>
                    <p className="text-zinc-650 text-xs font-light leading-relaxed">
                      {dominantInfo.desc}
                    </p>
                  </div>
                </div>

                {/* Score breakdown charts */}
                <div className="space-y-4 pt-2 sm:pt-4">
                  <h4 className="font-header font-extrabold text-zinc-900 text-xs uppercase tracking-wider">
                    Cognitive Distribution Metrics
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {CATEGORIES.map(({ key, label }) => {
                      const pct = scorePercentages[key];
                      return (
                        <div key={key} className="space-y-1 bg-white p-3 rounded-lg border border-zinc-200" id={`score-metric-${key.toLowerCase()}`}>
                          <div className="flex justify-between text-[11px] font-bold text-zinc-550">
                            <span>{label}</span>
                            <span className="font-extrabold text-zinc-900">{pct}%</span>
                          </div>
                          <div className="h-2 w-full bg-zinc-100 rounded-md overflow-hidden">
                            <div
                              className="h-full bg-gradient-brand rounded-md transition-all duration-1000 ease-out"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Recommendations */}
              <div className="lg:col-span-5 space-y-6">
                <div className="p-5 sm:p-6 bg-zinc-50/50 border border-zinc-200 rounded-lg space-y-6 shadow-xs">
                  <h4 className="font-header font-extrabold text-zinc-900 text-xs uppercase tracking-wider border-b border-zinc-200 pb-3">
                    Recommended Pathways
                  </h4>
                  <ul className="space-y-3">
                    {recommendedCareers.map((item, cIdx) => (
                      <li
                        key={cIdx}
                        className="flex flex-col bg-white p-3 sm:p-4 rounded-lg border border-zinc-200 hover:border-zinc-400 hover:scale-[1.01] transition-all duration-200 group text-left"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-extrabold text-zinc-900">
                            {item.career}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-light mt-1 leading-relaxed">
                          {item.reason}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Action link */}
                  <div className="pt-2">
                    <button
                      id="btn-results-consult"
                      onClick={() => onFinishTest(dominantDomain, scorePercentages)}
                      className="w-full py-3.5 sm:py-4 bg-brand hover:bg-brand-dark text-zinc-955 font-extrabold text-xs uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98] border-none"
                    >
                      <span>Claim Free Mentoring</span>
                    </button>
                    <p className="text-[9px] text-zinc-450 text-center mt-3 font-semibold flex items-center justify-center gap-1">
                      Schedules with a State Coordinator.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

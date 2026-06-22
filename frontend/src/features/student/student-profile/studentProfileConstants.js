export const INITIAL_STATE = {
  name: '', email: '', phone: '', schoolName: '', grade: '',
  guardianName: '', guardianPhone: '', groupCode: ''
};

export const TABS = [
  // using string identifiers for icons to avoid importing Lucide here, or we can import them in the index.jsx
  // Actually, importing Lucide icons here is fine, but to keep constants pure, we'll import them where needed.
  { id: 'overview', label: 'Overview', short: 'Home', iconName: 'LayoutDashboard' },
  { id: 'details', label: 'My Profile', short: 'Profile', iconName: 'User' },
  { id: 'booked', label: 'My Sessions', short: 'Sessions', iconName: 'Calendar' },
  { id: 'results', label: 'C-DAT Results', short: 'Results', iconName: 'BarChart3' },
];

export const CAREER_SUGGESTIONS = {
  'Logical Reasoning': ['Engineering', 'Data Science', 'Computer Science', 'Mathematics'],
  'Verbal Ability': ['Law', 'Journalism', 'Content Writing', 'Mass Communication'],
  'Numerical Ability': ['Finance', 'Accounting', 'Statistics', 'Actuarial Science'],
  'Spatial Reasoning': ['Architecture', 'Graphic Design', 'UI/UX', 'Game Design'],
  'Mechanical Reasoning': ['Mechanical Engineering', 'Robotics', 'Automotive', 'Aerospace'],
  'Abstract Reasoning': ['Research', 'Philosophy', 'Psychology', 'Innovation Management'],
  'Clerical Speed': ['Administration', 'Banking', 'Government Services', 'Operations'],
};

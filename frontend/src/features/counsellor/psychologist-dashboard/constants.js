export const DAYS_OF_WEEK = [
  { label: 'Monday', index: 1 },
  { label: 'Tuesday', index: 2 },
  { label: 'Wednesday', index: 3 },
  { label: 'Thursday', index: 4 },
  { label: 'Friday', index: 5 },
  { label: 'Saturday', index: 6 },
  { label: 'Sunday', index: 0 }
];

export const INITIAL_PROFILE_STATE = {
  name: '',
  role: 'Consultant Psychologist',
  education: '',
  specialties: '',
  price: '',
  lang: '',
  bio: '',
  defaultMeetLink: '',
  hours: 0,
  modes: ['ONLINE', 'OFFLINE', 'DOOR_STEP']
};

export const INITIAL_AVAILABILITY_STATE = {
  1: true, // Monday
  2: true, // Tuesday
  3: true, // Wednesday
  4: true, // Thursday
  5: true, // Friday
  6: false, // Saturday
  0: false // Sunday
};

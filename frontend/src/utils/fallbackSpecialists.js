/**
 * Default verified fallback specialists for Behold platform.
 * Ensures the application is resilient against cold starts, network interruptions,
 * or temporary database unavailability.
 */

export const DEFAULT_FALLBACK_COUNSELLORS = [
  {
    _id: "psy_amitha_khan",
    id: "psy_amitha_khan",
    name: "Amitha Fathima khan",
    title: "Consultant Psychologist",
    role: "Consultant Psychologist",
    designation: "Consultant Psychologist",
    rating: 5.0,
    reviews: 28,
    reviewCount: 28,
    reviewsCount: 28,
    price: 899,
    halfSessionPrice: 499,
    hours: 850,
    experience: "8+ Years",
    experienceYears: "8+",
    locationName: "Behold mind space, (calicut, kochi) DySp office, ponkunnam",
    city: "Kochi, Kerala",
    modes: ["ONLINE", "OFFLINE"],
    specialties: [
      "Individual CBT",
      "Anxiety & Stress Management",
      "Couples Counseling",
      "Child Care",
      "Emotional Healing"
    ],
    bio: "Compassionate licensed clinical psychologist specializing in cognitive behavioral therapy, anxiety management, interpersonal relationship counseling, and personal growth therapy.",
    about: "Compassionate licensed clinical psychologist specializing in cognitive behavioral therapy, anxiety management, interpersonal relationship counseling, and personal growth therapy.",
    education: "M.Sc Clinical Psychology, RCI Certified Specialist",
    lang: "Malayalam, English, Hindi",
    profilePic: "",
    photo: "",
    isActive: true,
    isVerified: true,
    status: "ACTIVE",
    availability: {
      monday: [{ start: "10:00", end: "19:00" }],
      tuesday: [{ start: "10:00", end: "19:00" }],
      wednesday: [{ start: "10:00", end: "19:00" }],
      thursday: [{ start: "10:00", end: "19:00" }],
      friday: [{ start: "10:00", end: "19:00" }],
      saturday: [{ start: "10:00", end: "18:00" }],
      sunday: []
    },
    bookedSlots: []
  },
  {
    _id: "psy_ginya_p",
    id: "psy_ginya_p",
    name: "Ginya P",
    title: "Consultant Psychologist",
    role: "Consultant Psychologist",
    designation: "Consultant Psychologist",
    rating: 5.0,
    reviews: 28,
    reviewCount: 28,
    reviewsCount: 28,
    price: 899,
    halfSessionPrice: 499,
    hours: 720,
    experience: "7+ Years",
    experienceYears: "7+",
    locationName: "Kochi, Kerala",
    city: "Kochi, Kerala",
    modes: ["ONLINE", "OFFLINE"],
    specialties: [
      "Anxiety & Stress",
      "Child Care",
      "Individual CBT",
      "Couples Counseling",
      "Emotional Healing"
    ],
    bio: "Experienced clinical psychologist with deep expertise in adolescent counseling, anxiety reduction, and evidence-based mental wellness therapy.",
    about: "Experienced clinical psychologist with deep expertise in adolescent counseling, anxiety reduction, and evidence-based mental wellness therapy.",
    education: "M.Sc Psychology, Certified Cognitive Therapist",
    lang: "Malayalam, English",
    profilePic: "",
    photo: "",
    isActive: true,
    isVerified: true,
    status: "ACTIVE",
    availability: {
      monday: [{ start: "10:00", end: "19:00" }],
      tuesday: [{ start: "10:00", end: "19:00" }],
      wednesday: [{ start: "10:00", end: "19:00" }],
      thursday: [{ start: "10:00", end: "19:00" }],
      friday: [{ start: "10:00", end: "19:00" }],
      saturday: [{ start: "10:00", end: "18:00" }],
      sunday: []
    },
    bookedSlots: []
  }
];

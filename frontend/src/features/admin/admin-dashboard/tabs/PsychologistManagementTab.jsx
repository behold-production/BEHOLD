import React, { useState, useRef } from "react";
import ApiService from "../../../../shared/services/api";
import {
  User,
  ShieldAlert,
  Award,
  Trash,
  Check,
  Plus,
  Lock,
  Settings,
  KeyRound,
  BarChart3,
  LogOut,
  Search,
  ShieldCheck,
  Calendar,
  Clock,
  Link,
  AlertCircle,
  Edit,
  Video,
  UserPlus,
  MessageSquare,
  FileSpreadsheet,
  HelpCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Mail,
  Shield,
  Menu,
  Brain,
  Download,
  FileText,
  Eye,
  EyeOff,
  Bell,
  Send,
  Loader2,
} from "lucide-react";
import { SkeletonTableRows, PaginationBar } from "../components/SharedAdminUI";

export default function PsychologistManagementTab(props) {
  const {
    usersDb,
    reloadData,
    isSuperAdmin,
    hasPsyPermission,
    getInitials,
    showAlert,
    showConfirm,
    showPrompt,
    handleExportPDF,
    handleExportImage,
    canAddPsy,
    canEditPsy,
    canDeletePsy,
    isDbLoading,
  } = props;

  const [searchPsy, setSearchPsy] = useState("");
  const [psyFilter, setPsyFilter] = useState("ALL");
  const [psyPage, setPsyPage] = useState(1);
  const [psyLimit, setPsyLimit] = useState(10);

  const [isAddPsyOpen, setIsAddPsyOpen] = useState(false);
  const [isEditPsyOpen, setIsEditPsyOpen] = useState(false);
  const [psyForm, setPsyForm] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    experience: "",
    qualifications: "",
    location: "",
    biography: "",
    registrationNumber: "",
    profilePic: "",
    activeDays: [],
    availableSlots: [],
    commissionSplitPercent: 50,
    locationName: "",
    latitude: 0,
    longitude: 0,
    isTopFive: false,
    defaultMeetLink: "",
  });
  const [psyFormError, setPsyFormError] = useState("");
  const [psyFormSuccess, setPsyFormSuccess] = useState("");
  const [psyProfilePicFile, setPsyProfilePicFile] = useState(null);
  const [isPsyPicUploading, setIsPsyPicUploading] = useState(false);
  const [isSavingForm, setIsSavingForm] = useState(false);

  const [adminActiveDays, setAdminActiveDays] = useState({
    0: false,
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: false,
  });
  const [adminAvailableSlots, setAdminAvailableSlots] = useState([]);
  const [adminAllSlots, setAdminAllSlots] = useState([]);
  const [adminFromHour, setAdminFromHour] = useState("09");
  const [adminFromMinute, setAdminFromMinute] = useState("00");
  const [adminFromPeriod, setAdminFromPeriod] = useState("AM");
  const [adminToHour, setAdminToHour] = useState("05");
  const [adminToMinute, setAdminToMinute] = useState("00");
  const [adminToPeriod, setAdminToPeriod] = useState("PM");
  const [adminCustomHour, setAdminCustomHour] = useState("09");
  const [adminCustomMinute, setAdminCustomMinute] = useState("00");
  const [adminCustomPeriod, setAdminCustomPeriod] = useState("AM");

  const [viewingPsychologist, setViewingPsychologist] = useState(null);
  const psyProfilePicRef = useRef(null);
  const [isAdminUserLocating, setIsAdminUserLocating] = useState(false);

  
  const { bookingsDb, handleTogglePsyActiveStatus, updatingPsyIds, handleGenerateResetToken } = props;

  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [isAdminSearching, setIsAdminSearching] = useState(false);
  const [adminSearchResults, setAdminSearchResults] = useState([]);
  const [isAdminLocating, setIsAdminLocating] = useState(false);

  const handleAdminAddressSearch = async () => {
    if (!adminSearchQuery.trim()) return;
    setIsAdminSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adminSearchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setAdminSearchResults(data);
      } else {
        setAdminSearchResults([]);
      }
    } catch (err) {
      console.error(err);
      setAdminSearchResults([]);
    } finally {
      setIsAdminSearching(false);
    }
  };

  const handleAdminDetectLocation = () => {
    if (!navigator.geolocation) {
      import('react-hot-toast').then(m => m.toast.error("Geolocation not supported."));
      return;
    }
    setIsAdminLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setPsyForm(prev => ({ ...prev, latitude: lat, longitude: lon }));
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data = await res.json();
            const locName = data.display_name || "Detected Location";
            setPsyForm(prev => ({ ...prev, locationName: locName }));
            setAdminSearchQuery(locName);
          }
        } catch (err) {
          console.error(err);
        }
        setIsAdminLocating(false);
        import('react-hot-toast').then(m => m.toast.success("Location updated."));
      },
      (err) => {
        console.error(err);
        setIsAdminLocating(false);
        import('react-hot-toast').then(m => m.toast.error("Failed to detect location."));
      },
      { timeout: 10000 }
    );
  };


  const psychologistsList = usersDb.filter((u) => {
    if (u.role !== "PSYCHOLOGIST") return false;
    if (psyFilter === "VERIFIED" && !u.isVerified) return false;
    if (psyFilter === "UNVERIFIED" && u.isVerified) return false;
    const matchesSearch =
      !searchPsy ||
      (u.name && u.name.toLowerCase().includes(searchPsy.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchPsy.toLowerCase())) ||
      (u.id && u.id.toLowerCase().includes(searchPsy.toLowerCase()));
    return matchesSearch;
  });

  const parseAdminTimeToMinutes = (timeStr) => {
    const [time, period] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const formatAdminMinutesToTime = (minutes) => {
    let hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    const hourStr = String(hours).padStart(2, "0");
    const minStr = String(mins).padStart(2, "0");
    return `${hourStr}:${minStr} ${period}`;
  };

  const addAdminTimeRangeSlots = (fromStr, toStr) => {
    const fromMins = parseAdminTimeToMinutes(fromStr);
    const toMins = parseAdminTimeToMinutes(toStr);
    if (fromMins >= toMins) {
      setPsyFormError("Start time must be before end time.");
      return;
    }

    const generated = [];
    // Generate every 60 minutes (1 hour)
    for (let m = fromMins; m <= toMins; m += 60) {
      generated.push(formatAdminMinutesToTime(m));
    }

    setAdminAllSlots((prev) => {
      const merged = [...prev];
      generated.forEach((slot) => {
        if (!merged.includes(slot)) merged.push(slot);
      });
      return merged;
    });
    setAdminAvailableSlots((prev) => {
      const merged = [...prev];
      generated.forEach((slot) => {
        if (!merged.includes(slot)) merged.push(slot);
      });
      return merged;
    });
  };

  const handleAddAdminCustomSlot = () => {
    setPsyFormError("");
    const slotStr = `${adminCustomHour}:${adminCustomMinute} ${adminCustomPeriod}`;
    if (adminAllSlots.includes(slotStr)) {
      setPsyFormError("This slot already exists.");
      return;
    }
    setAdminAllSlots((prev) => [...prev, slotStr]);
    setAdminAvailableSlots((prev) => [...prev, slotStr]);
  };

  const handleRemoveAdminSlot = (slot) => {
    setAdminAllSlots((prev) => prev.filter((s) => s !== slot));
    setAdminAvailableSlots((prev) => prev.filter((s) => s !== slot));
  };

  const toggleAdminDay = (dayIndex) => {
    setAdminActiveDays((prev) => ({ ...prev, [dayIndex]: !prev[dayIndex] }));
  };

  const handleCreatePsy = async (e) => {
    e.preventDefault();
    if (!hasPsyPermission) {
      setPsyFormError(
        "Access Denied: You do not have permission to manage psychologists.",
      );
      return;
    }
    setPsyFormError("");
    setPsyFormSuccess("");

    if (!psyForm.name.trim() || !psyForm.email.trim() || !psyForm.password) {
      setPsyFormError("Name, Email, and Password are required.");
      return;
    }

    if (
      psyForm.defaultMeetLink &&
      !psyForm.defaultMeetLink.trim().startsWith("https://")
    ) {
      setPsyFormError(
        "Please enter a valid Google Meet link beginning with https://",
      );
      return;
    }

    setIsSavingForm(true);
    try {
      const res = await ApiService.createAdminCounsellor({
        name: psyForm.name.trim(),
        email: psyForm.email.trim(),
        password: psyForm.password,
        education: psyForm.education,
        specialties: psyForm.specialties,
        price: psyForm.price,
        lang: psyForm.lang,
        bio: psyForm.bio,
        defaultMeetLink: psyForm.defaultMeetLink,
        hours: psyForm.hours,
        modes: psyForm.modes,
        title: psyForm.title,
        isTopFive: psyForm.isTopFive,
        isActive: psyForm.isActive !== false,
        locationName: psyForm.locationName,
        latitude: Number(psyForm.latitude) || 0,
        longitude: Number(psyForm.longitude) || 0,
        availability: {
          activeDays: adminActiveDays,
          availableSlots: adminAvailableSlots,
        },
      });
      if (res.success && res.data && psyProfilePicFile) {
        setIsPsyPicUploading(true);
        const fd = new FormData();
        fd.append("profilePic", psyProfilePicFile);
        await ApiService.adminUpdateCounsellorProfilePic(res.data.id, fd);
        setIsPsyPicUploading(false);
      }
      setPsyFormSuccess("Psychologist added successfully!");
      setPsyForm({
        id: "",
        name: "",
        email: "",
        password: "",
        education: "",
        specialties: "",
        price: "",
        lang: "",
        bio: "",
        defaultMeetLink: "",
        phone: "",
        hours: 0,
        modes: ["ONLINE", "OFFLINE", "DOOR_STEP"],
        title: "Consultant Psychologist",
        profilePic: "",
        isTopFive: false,
        isActive: true,
        locationName: "",
        latitude: 0,
        longitude: 0,
      });
      setAdminActiveDays({
        1: true,
        2: true,
        3: true,
        4: true,
        5: true,
        6: false,
        0: false,
      });
      setAdminAvailableSlots([]);
      setAdminAllSlots([]);
      reloadData();
      setTimeout(() => {
        setIsAddPsyOpen(false);
        setPsyFormSuccess("");
      }, 1500);
    } catch (err) {
      setPsyFormError(err.message || "Failed to add psychologist.");
    } finally {
      setIsSavingForm(false);
    }
  };

  const handleOpenEditPsy = (psy) => {
    setPsyForm({
      id: psy.id,
      name: psy.name,
      email: psy.email,
      password: "",
      education: psy.education || "",
      specialties: Array.isArray(psy.specialties)
        ? psy.specialties.join(", ")
        : psy.specialties || "",
      price: psy.price || 1200,
      lang: psy.lang || "",
      bio: psy.bio || psy.experience || "",
      defaultMeetLink: psy.defaultMeetLink || "",
      phone: psy.phone || "",
      hours: psy.hours !== undefined ? psy.hours : 0,
      title: psy.title || "Consultant Psychologist",
      profilePic: psy.profilePic || psy.image || "",
      isTopFive: psy.isTopFive || false,
      isActive: psy.isActive !== false,
      locationName: psy.locationName || "",
      latitude: psy.latitude || 0,
      longitude: psy.longitude || 0,
      commissionPercent:
        psy.commissionPercent !== undefined ? psy.commissionPercent : 50,
    });
    setAdminSearchQuery(psy.locationName || "");
    setAdminSearchResults([]);
    setPsyProfilePicFile(null);

    // Load availability
    if (psy.availability) {
      const avail = psy.availability;
      if (avail.activeDays) setAdminActiveDays(avail.activeDays);
      if (avail.availableSlots) {
        setAdminAvailableSlots(avail.availableSlots);
        setAdminAllSlots(avail.availableSlots);
      } else {
        setAdminAvailableSlots([]);
        setAdminAllSlots([]);
      }
    } else {
      setAdminActiveDays({
        1: true,
        2: true,
        3: true,
        4: true,
        5: true,
        6: false,
        0: false,
      });
      setAdminAvailableSlots([]);
      setAdminAllSlots([]);
    }

    setPsyFormError("");
    setPsyFormSuccess("");
    setIsEditPsyOpen(true);
  };

  const handleUpdatePsy = async (e) => {
    e.preventDefault();
    if (!hasPsyPermission) {
      setPsyFormError(
        "Access Denied: You do not have permission to manage psychologists.",
      );
      return;
    }
    setPsyFormError("");
    setPsyFormSuccess("");

    if (!psyForm.name.trim() || !psyForm.email.trim()) {
      setPsyFormError("Name and Email are required.");
      return;
    }

    if (
      psyForm.defaultMeetLink &&
      !psyForm.defaultMeetLink.trim().startsWith("https://")
    ) {
      setPsyFormError(
        "Please enter a valid Google Meet link beginning with https://",
      );
      return;
    }

    setIsSavingForm(true);
    try {
      if (psyProfilePicFile) {
        setIsPsyPicUploading(true);
        const fd = new FormData();
        fd.append("profilePic", psyProfilePicFile);
        await ApiService.adminUpdateCounsellorProfilePic(psyForm.id, fd);
        setIsPsyPicUploading(false);
      }
      await ApiService.updateAdminCounsellor(psyForm.id, {
        name: psyForm.name.trim(),
        email: psyForm.email.trim(),
        password: psyForm.password || undefined,
        education: psyForm.education,
        specialties: psyForm.specialties,
        price: psyForm.price,
        text: undefined,
        lang: psyForm.lang,
        bio: psyForm.bio,
        defaultMeetLink: psyForm.defaultMeetLink,
        phone: psyForm.phone,
        modes: psyForm.modes,
        title: psyForm.title,
        isTopFive: psyForm.isTopFive,
        isActive: psyForm.isActive,
        locationName: psyForm.locationName,
        latitude: Number(psyForm.latitude) || 0,
        longitude: Number(psyForm.longitude) || 0,
        commissionPercent: Number(psyForm.commissionPercent) || 50,
        availability: {
          activeDays: adminActiveDays,
          availableSlots: adminAvailableSlots,
        },
      });
      setPsyFormSuccess("Psychologist details updated!");
      setPsyProfilePicFile(null);
      reloadData();
      setTimeout(() => {
        setIsEditPsyOpen(false);
        setPsyFormSuccess("");
      }, 1500);
    } catch (err) {
      setIsPsyPicUploading(false);
      setPsyFormError(err.message || "Failed to update psychologist.");
    } finally {
      setIsSavingForm(false);
    }
  };

  const handleDeletePsy = async (psyId) => {
    if (!hasPsyPermission) {
      await showAlert(
        "Access Denied: You do not have permission to manage psychologists.",
      );
      return;
    }
    if (
      !(await showConfirm("Are you sure you want to remove this psychologist?"))
    )
      return;
    try {
      await ApiService.deleteAdminCounsellor(psyId);
      reloadData();
    } catch (err) {
      await showAlert(err.message || "Failed to delete psychologist.");
    }
  };

  const handleRejectPsy = async (psyId) => {
    if (!hasPsyPermission) {
      await showAlert(
        "Access Denied: You do not have permission to manage psychologists.",
      );
      return;
    }
    const reason = await showPrompt("Enter reason for rejection:");
    if (reason === null) return; // User cancelled

    try {
      await ApiService.rejectCounsellor(psyId, reason);
      reloadData();
    } catch (err) {
      await showAlert(err.message || "Failed to reject psychologist.");
    }
  };
  // Psychologist verification toggle
  const handleTogglePsyVerification = async (psyId, currentVerified) => {
    if (!hasPsyPermission) {
      await showAlert(
        "Access Denied: You do not have permission to verify/unverify psychologists.",
      );
      return;
    }
    try {
      await ApiService.verifyCounsellor(psyId, !currentVerified);
      reloadData();
    } catch (err) {
      await showAlert(err.message || "Failed to toggle verification.");
    }
  };

  // Toggle Featured status directly from list
  const handleTogglePsyTopFive = async (psy) => {
    if (!hasPsyPermission) {
      await showAlert(
        "Access Denied: You do not have permission to modify psychologists.",
      );
      return;
    }
    try {
      const nextValue = !psy.isTopFive;
      const specialtiesStr = Array.isArray(psy.specialties)
        ? psy.specialties.join(", ")
        : psy.specialties || "";

      await ApiService.updateAdminCounsellor(psy.id, {
        name: psy.name,
        email: psy.email,
        education: psy.education || "",
        specialties: specialtiesStr,
        price: psy.price || 1200,
        isTopFive: nextValue,
      });
      reloadData();
    } catch (err) {
      await showAlert(err.message || "Failed to toggle top five status.");
    }
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-200 text-sm">
        <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white font-header">
              Psychologists Directory
            </h3>
            <p className="text-sm text-zinc-500 font-medium pt-1">
              Register psychologist staff, update clinic credentials, or remove
              accounts
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:max-w-[200px]">
              <input
                type="text"
                placeholder="Search advisors..."
                value={searchPsy}
                onChange={(e) => setSearchPsy(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm font-semibold focus:border-brand text-white outline-none"
              />
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
            </div>
            <button
              onClick={() =>
                handleExportPDF("counsellors-table", "Psychologists_Directory")
              }
              className="px-3 py-2 border border-zinc-800 hover:bg-zinc-850 hover:text-white text-zinc-400 text-sm font-bold rounded-lg transition-colors cursor-pointer shrink-0"
            >
              Export PDF
            </button>
            <button
              onClick={() =>
                handleExportImage(
                  "counsellors-table",
                  "Psychologists_Directory",
                )
              }
              className="px-3 py-2 border border-zinc-800 hover:bg-zinc-850 hover:text-white text-zinc-400 text-sm font-bold rounded-lg transition-colors cursor-pointer shrink-0"
            >
              Export Image
            </button>
            {canAddPsy && (
              <button
                onClick={() => {
                  setPsyForm({
                    id: "",
                    name: "",
                    email: "",
                    password: "",
                    education: "MPhil Clinical Psychology",
                    specialties:
                      "Anxiety Stress & Panic, Depression & Mood Concerns, Relationship",
                    price: 1250,
                    lang: "Malayalam, English",
                    bio: "",
                    isTopFive: false,
                    isActive: true,
                    locationName: "",
                    latitude: 0,
                    longitude: 0,
                    modes: ["ONLINE", "OFFLINE", "DOOR_STEP"],
                  });
                  setAdminActiveDays({
                    1: true,
                    2: true,
                    3: true,
                    4: true,
                    5: true,
                    6: false,
                    0: false,
                  });
                  setAdminAvailableSlots([]);
                  setAdminAllSlots([]);
                  setPsyFormError("");
                  setPsyFormSuccess("");
                  setIsAddPsyOpen(true);
                }}
                className="px-4 py-2 bg-brand hover:bg-brand-dark text-zinc-955 text-sm font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-zinc-955" /> Add Psychologist
              </button>
            )}
          </div>
        </div>

        {/* Psychologist filter sub-tabs */}
        <div className="flex flex-wrap gap-2 pb-4">
          {[
            {
              id: "all",
              label: "All Psychologists",
              count: usersDb.filter((u) => u.role === "PSYCHOLOGIST").length,
            },
            {
              id: "pending",
              label: "Pending Verification",
              count: usersDb.filter(
                (u) =>
                  u.role === "PSYCHOLOGIST" &&
                  u.status !== "APPROVED" &&
                  u.status !== "ACTIVE" &&
                  u.status !== "REJECTED",
              ).length,
            },
            {
              id: "approved",
              label: "Approved",
              count: usersDb.filter(
                (u) =>
                  u.role === "PSYCHOLOGIST" &&
                  (u.status === "APPROVED" || u.status === "ACTIVE"),
              ).length,
            },
            {
              id: "rejected",
              label: "Rejected",
              count: usersDb.filter(
                (u) => u.role === "PSYCHOLOGIST" && u.status === "REJECTED",
              ).length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setPsyFilter(tab.id);
                setPsyPage(1);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition duration-200 cursor-pointer flex items-center gap-1.5 ${
                psyFilter === tab.id
                  ? "bg-brand text-zinc-955"
                  : "bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  psyFilter === tab.id
                    ? "bg-zinc-955/20 text-zinc-955"
                    : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="border-0 sm:border border-zinc-850 rounded-none sm:rounded-lg overflow-hidden bg-transparent sm:bg-zinc-950">
          <div className="overflow-x-auto w-full">
            <table
              id="counsellors-table"
              className="w-full text-sm border-collapse min-w-[700px]"
            >
              <thead>
                <tr className="bg-zinc-900 text-zinc-400 font-bold border-b border-zinc-850 text-left">
                  <th className="p-3 whitespace-nowrap">Psychologist Name</th>
                  <th className="p-3 whitespace-nowrap">Email Address</th>
                  <th className="p-3 text-center whitespace-nowrap">
                    Featured (Top 5)
                  </th>
                  <th className="p-3 text-center whitespace-nowrap">
                    Clearance Status
                  </th>
                  <th className="p-3 text-center font-bold whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isDbLoading ? (
                  <SkeletonTableRows cols={5} />
                ) : psychologistsList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-zinc-500 italic whitespace-nowrap"
                    >
                      No psychologist registries match the active query.
                    </td>
                  </tr>
                ) : (
                  psychologistsList
                    .slice((psyPage - 1) * psyLimit, psyPage * psyLimit)
                    .map((psy) => (
                      <tr
                        key={psy.id}
                        className="border-b border-zinc-900 hover:bg-zinc-900/50"
                      >
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] text-brand flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                              {psy.profilePic || psy.image ? (
                                <img
                                  src={psy.profilePic || psy.image}
                                  alt={psy.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                getInitials(psy.name)
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-white block leading-tight">
                                {psy.name}
                              </span>
                              <span className="text-sm text-zinc-505 break-all">
                                ID: {psy.id} •{" "}
                                {psy.isActive !== false ? (
                                  <span className="text-emerald-400 font-semibold">
                                    Active
                                  </span>
                                ) : (
                                  <span className="text-rose-400 font-semibold">
                                    Paused
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-zinc-350 font-medium whitespace-nowrap">
                          {psy.email}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleTogglePsyTopFive(psy)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer border ${
                              psy.isTopFive
                                ? "bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-amber-500/30"
                                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-850"
                            }`}
                            title="Toggle Top 5 featured status"
                          >
                            {psy.isTopFive ? "★ Featured" : "☆ Feature"}
                          </button>
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          {psy.status === "APPROVED" ||
                          psy.status === "ACTIVE" ? (
                            <div className="flex items-center justify-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-955/20 border border-emerald-900/40 text-emerald-450 text-sm font-bold ">
                                <Check className="w-3.5 h-3.5 text-emerald-450" />{" "}
                                Approved
                              </span>
                              <button
                                onClick={() =>
                                  handleTogglePsyVerification(psy.id, true)
                                }
                                className="text-sm text-zinc-500 hover:text-rose-500 underline cursor-pointer bg-transparent border-none p-0 animate-in fade-in duration-200"
                                title="Revoke acceptance"
                              >
                                Revoke
                              </button>
                            </div>
                          ) : psy.status === "REJECTED" ? (
                            <div className="flex items-center justify-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-955/20 border border-rose-900/40 text-rose-450 text-sm font-bold ">
                                Rejected
                              </span>
                              <button
                                onClick={() =>
                                  handleTogglePsyVerification(psy.id, false)
                                }
                                className="text-sm text-zinc-500 hover:text-emerald-500 underline cursor-pointer bg-transparent border-none p-0 animate-in fade-in duration-200"
                                title="Accept counselor"
                              >
                                Accept
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() =>
                                  handleTogglePsyVerification(psy.id, false)
                                }
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-750 text-white rounded text-sm font-bold cursor-pointer border-none shadow-sm transition-colors"
                                title="Accept and verify counselor"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleRejectPsy(psy.id)}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-sm font-bold cursor-pointer border-none shadow-sm transition-colors"
                                title="Reject counselor request"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setViewingPsychologist(psy)}
                              className="px-2.5 py-1 bg-zinc-900 text-brand hover:text-white rounded border border-zinc-800 hover:bg-zinc-850 transition cursor-pointer text-sm font-bold "
                            >
                              Details
                            </button>
                            {canEditPsy && (
                              <button
                                onClick={() =>
                                  handleGenerateResetToken(psy.email)
                                }
                                className="px-2.5 py-1 bg-zinc-900 text-amber-500 hover:text-amber-400 rounded border border-zinc-800 hover:bg-amber-900/30 transition cursor-pointer text-sm font-bold "
                                title="Generate Password Reset Link"
                              >
                                <KeyRound className="w-4 h-4 inline-block" />
                              </button>
                            )}
                            {canEditPsy && (
                              <button
                                disabled={
                                  updatingPsyIds && updatingPsyIds[psy.id]
                                }
                                onClick={() => handleTogglePsyActiveStatus(psy)}
                                className={`px-2.5 py-1 rounded border text-xs font-bold transition cursor-pointer select-none flex items-center gap-1.5 justify-center min-w-[70px] ${
                                  psy.isActive !== false
                                    ? "bg-zinc-900 border-emerald-900/60 text-emerald-450 hover:bg-emerald-950/20"
                                    : "bg-zinc-900 border-rose-900/60 text-rose-450 hover:bg-rose-955/20"
                                } ${updatingPsyIds && updatingPsyIds[psy.id] ? "opacity-40 cursor-not-allowed" : ""}`}
                                title={
                                  psy.isActive !== false
                                    ? "Pause Profile"
                                    : "Activate Profile"
                                }
                              >
                                {updatingPsyIds && updatingPsyIds[psy.id] ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                                    <span>...</span>
                                  </>
                                ) : psy.isActive !== false ? (
                                  "Pause"
                                ) : (
                                  "Resume"
                                )}
                              </button>
                            )}
                            {canEditPsy && (
                              <button
                                onClick={() => handleOpenEditPsy(psy)}
                                className="p-1.5 bg-zinc-900 text-zinc-400 hover:text-white rounded border border-zinc-800 transition cursor-pointer"
                                title="Edit Psychologist"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {canDeletePsy && (
                              <button
                                onClick={() => handleDeletePsy(psy.id)}
                                className="p-1.5 bg-rose-955/20 text-rose-500 hover:bg-rose-900 hover:text-white rounded border border-rose-900/30 transition cursor-pointer"
                                title="Remove Psychologist"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <PaginationBar
          total={psychologistsList.length}
          page={psyPage}
          limit={psyLimit}
          onPageChange={setPsyPage}
          onLimitChange={setPsyLimit}
        />
      </div>

      {/* TAB 4: SUB-ADMIN CREATOR & ROLES */}

      {(isAddPsyOpen || isEditPsyOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-955/80 backdrop-blur-xs animate-in fade-in duration-300"
            onClick={() => {
              setIsAddPsyOpen(false);
              setIsEditPsyOpen(false);
            }}
          />
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-lg p-6 sm:p-8 shadow-2xl space-y-5 text-left text-white z-10 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div>
              <h3 className="text-base font-bold text-white font-header">
                {isAddPsyOpen
                  ? "Register Psychologist"
                  : "Edit Psychologist details"}
              </h3>
              <p className="text-sm text-zinc-500 leading-none mt-1">
                {isAddPsyOpen
                  ? "Register a clinical professional profile."
                  : "Modify credentials, rates, and bios."}
              </p>
            </div>

            <form
              onSubmit={isAddPsyOpen ? handleCreatePsy : handleUpdatePsy}
              className="space-y-4 font-medium"
            >
              {(isEditPsyOpen || isAddPsyOpen) && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 tracking-wide">
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center text-brand font-bold text-lg">
                      {psyProfilePicFile ? (
                        <img
                          src={URL.createObjectURL(psyProfilePicFile)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : psyForm.profilePic ? (
                        <img
                          src={psyForm.profilePic}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getInitials(psyForm.name)
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <input
                        ref={psyProfilePicRef}
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setPsyProfilePicFile(file);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => psyProfilePicRef.current?.click()}
                        className="px-3 py-2 text-xs font-bold bg-zinc-955 border border-zinc-800 hover:border-brand text-zinc-300 hover:text-white rounded-lg cursor-pointer transition bg-transparent"
                      >
                        {psyProfilePicFile ? "Change Image" : "Upload Photo"}
                      </button>
                      {psyProfilePicFile && (
                        <p className="text-xs text-zinc-500 truncate max-w-[180px]">
                          {psyProfilePicFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-zinc-400">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Sandra Tomy"
                    value={psyForm.name}
                    onChange={(e) =>
                      setPsyForm({ ...psyForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-zinc-400">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="counsellor@example.com"
                    value={psyForm.email}
                    onChange={(e) =>
                      setPsyForm({ ...psyForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-zinc-400">
                    Password{" "}
                    {isEditPsyOpen && (
                      <span className="text-zinc-500 lowercase font-normal">
                        (blank keeps same)
                      </span>
                    )}
                  </label>
                  <input
                    type="password"
                    required={isAddPsyOpen}
                    placeholder={isEditPsyOpen ? "••••••••" : "Enter password"}
                    value={psyForm.password}
                    onChange={(e) =>
                      setPsyForm({ ...psyForm, password: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-zinc-400">
                    Education qualifications
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MPhil Clinical Psychology"
                    value={psyForm.education}
                    onChange={(e) =>
                      setPsyForm({ ...psyForm, education: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-zinc-400">
                    Professional Title
                  </label>
                  <select
                    value={psyForm.title}
                    onChange={(e) =>
                      setPsyForm({ ...psyForm, title: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none cursor-pointer"
                  >
                    <option value="Consultant Psychologist">
                      Consultant Psychologist
                    </option>
                    <option value="Clinical Psychologist">
                      Clinical Psychologist
                    </option>
                    <option value="Psychiatrist">Psychiatrist</option>
                    <option value="Career Mentor">Career Mentor</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-zinc-400">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 94971 74011"
                    value={psyForm.phone}
                    onChange={(e) =>
                      setPsyForm({ ...psyForm, phone: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-zinc-400">
                    Hourly price (INR)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1250"
                    value={psyForm.price}
                    onChange={(e) =>
                      setPsyForm({ ...psyForm, price: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-zinc-400">
                    Commission Split (%)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    value={psyForm.commissionPercent ?? 50}
                    onChange={(e) =>
                      setPsyForm({ ...psyForm, commissionPercent: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
                  />
                </div>


                <div className="space-y-1">
                  <label className="text-sm font-bold text-zinc-400">
                    Languages Spoken
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Malayalam, English"
                    value={psyForm.lang}
                    onChange={(e) =>
                      setPsyForm({ ...psyForm, lang: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-zinc-400">
                    Experience Hours
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 150"
                    value={psyForm.hours}
                    onChange={(e) =>
                      setPsyForm({
                        ...psyForm,
                        hours: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-sm font-bold text-zinc-400">
                    Default Google Meet Link (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="https://meet.google.com/abc-defg-hij"
                    value={psyForm.defaultMeetLink}
                    onChange={(e) =>
                      setPsyForm({
                        ...psyForm,
                        defaultMeetLink: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-zinc-955 border border-zinc-855 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
                  />
                </div>

                <div className="sm:col-span-2 space-y-3.5 p-4 bg-zinc-950 border border-zinc-800 rounded-lg mt-2 text-left">
                  <h4 className="text-xs font-bold text-brand tracking-wider">
                    Practice / Geographic Location
                  </h4>

                  {/* Address search field */}
                  <div className="space-y-1.5 relative">
                    <label className="text-zinc-400 font-bold text-xs tracking-wide block">
                      Search Location Address
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Type an address to search..."
                        value={adminSearchQuery}
                        onChange={(e) => setAdminSearchQuery(e.target.value)}
                        className="flex-1 min-w-0 px-3 py-2 bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg outline-none focus:border-brand transition-all"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAdminAddressSearch();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAdminAddressSearch}
                        disabled={isAdminSearching}
                        className="w-full sm:w-auto px-4 py-2 bg-brand text-zinc-955 text-xs font-bold rounded-full hover:bg-brand-dark transition cursor-pointer shrink-0 flex items-center justify-center"
                      >
                        {isAdminSearching ? "Searching..." : "Search"}
                      </button>
                    </div>

                    {/* Autocomplete Dropdown */}
                    {adminSearchResults.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg max-h-40 overflow-y-auto z-50 shadow-xl divide-y divide-zinc-800">
                        {adminSearchResults.map((res, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setPsyForm({
                                ...psyForm,
                                locationName: res.display_name,
                                latitude: parseFloat(res.lat) || 0,
                                longitude: parseFloat(res.lon) || 0,
                              });
                              setAdminSearchQuery(res.display_name);
                              setAdminSearchResults([]);
                            }}
                            className="w-full text-left px-3.5 py-2.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors block truncate"
                          >
                            {res.display_name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-zinc-400 font-bold text-xs tracking-wide">
                      Clinic / Center Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 123 Main St, Calicut, Kerala"
                      value={psyForm.locationName || ""}
                      onChange={(e) => {
                        setPsyForm({
                          ...psyForm,
                          locationName: e.target.value,
                        });
                        setAdminSearchQuery(e.target.value);
                      }}
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg outline-none focus:border-brand transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-zinc-400 font-bold text-xs tracking-wide">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 11.2588"
                        value={psyForm.latitude || ""}
                        onChange={(e) =>
                          setPsyForm({
                            ...psyForm,
                            latitude: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg outline-none focus:border-brand transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-zinc-400 font-bold text-xs tracking-wide">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 75.7804"
                        value={psyForm.longitude || ""}
                        onChange={(e) =>
                          setPsyForm({
                            ...psyForm,
                            longitude: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg outline-none focus:border-brand transition-all"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isAdminLocating}
                    onClick={handleAdminDetectLocation}
                    className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 text-xs font-bold rounded-full transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isAdminLocating ? (
                      <>
                        <div className="w-3 h-3 border border-zinc-400 border-t-brand rounded-full animate-spin" />
                        Locating...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-3.5 h-3.5 text-brand"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Detect Location & Address
                      </>
                    )}
                  </button>
                </div>

                <div className="sm:col-span-2 space-y-1.5 pt-1">
                  <label className="text-sm font-bold text-zinc-400 block mb-1">
                    Supported Session Modes
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {["ONLINE", "OFFLINE", "DOOR_STEP"].map((mode) => (
                      <label
                        key={mode}
                        className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300 select-none font-semibold"
                      >
                        <input
                          type="checkbox"
                          checked={
                            psyForm.modes ? psyForm.modes.includes(mode) : false
                          }
                          onChange={() => {
                            const currentModes = psyForm.modes || [];
                            const nextModes = currentModes.includes(mode)
                              ? currentModes.filter((m) => m !== mode)
                              : [...currentModes, mode];
                            setPsyForm({ ...psyForm, modes: nextModes });
                          }}
                          className="w-4 h-4 rounded border-zinc-805 bg-zinc-955 text-brand focus:ring-0 focus:ring-offset-0 cursor-pointer accent-brand"
                        />
                        <span>
                          {mode === "DOOR_STEP"
                            ? "Doorstep"
                            : mode.charAt(0) + mode.slice(1).toLowerCase()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1.5 pt-2">
                  <label className="text-sm font-bold text-zinc-400 block mb-1">
                    Account & Feature Status
                  </label>
                  <div className="flex flex-wrap gap-5">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300 select-none font-semibold">
                      <input
                        type="checkbox"
                        checked={psyForm.isActive !== false}
                        onChange={(e) =>
                          setPsyForm({ ...psyForm, isActive: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-zinc-805 bg-zinc-955 text-brand focus:ring-0 focus:ring-offset-0 cursor-pointer accent-brand"
                      />
                      <span>Active Profile (Accept Bookings)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300 select-none font-semibold">
                      <input
                        type="checkbox"
                        checked={psyForm.isTopFive || false}
                        onChange={(e) =>
                          setPsyForm({
                            ...psyForm,
                            isTopFive: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded border-zinc-805 bg-zinc-955 text-brand focus:ring-0 focus:ring-offset-0 cursor-pointer accent-brand"
                      />
                      <span>Featured Psychologist (Top 5)</span>
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-sm font-bold text-zinc-400">
                    Specialties (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Anxiety, Stress Management, Mood Disorders"
                    value={psyForm.specialties}
                    onChange={(e) =>
                      setPsyForm({ ...psyForm, specialties: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-zinc-955 border border-zinc-855 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-sm font-bold text-zinc-400">
                    Professional Bio
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Write clinical experience details..."
                    value={psyForm.bio}
                    onChange={(e) =>
                      setPsyForm({ ...psyForm, bio: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-zinc-955 border border-zinc-855 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors resize-none"
                  />
                </div>

                {/* Availability Timings */}
                <div className="sm:col-span-2 border-t border-zinc-800 pt-4 space-y-4">
                  <h4 className="text-sm font-bold text-zinc-300 font-header">
                    Availability Timings
                  </h4>

                  {/* Operational Days */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400 block">
                      Operational Days
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: "Mon", index: 1 },
                        { label: "Tue", index: 2 },
                        { label: "Wed", index: 3 },
                        { label: "Thu", index: 4 },
                        { label: "Fri", index: 5 },
                        { label: "Sat", index: 6 },
                        { label: "Sun", index: 0 },
                      ].map((day) => {
                        const active = adminActiveDays[day.index];
                        return (
                          <button
                            key={day.index}
                            type="button"
                            onClick={() => toggleAdminDay(day.index)}
                            className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                              active
                                ? "bg-brand text-zinc-955 font-bold border-none"
                                : "bg-zinc-955 border-zinc-850 text-zinc-500 hover:border-zinc-750"
                            }`}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Timing Slots */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400 block">
                      Timing Slots (Active)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
                      {adminAllSlots.map((slot) => {
                        const exists = adminAvailableSlots.includes(slot);
                        return (
                          <div
                            key={slot}
                            className="flex items-center gap-1.5 w-full"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                if (exists) {
                                  setAdminAvailableSlots((prev) =>
                                    prev.filter((s) => s !== slot),
                                  );
                                } else {
                                  setAdminAvailableSlots((prev) => [
                                    ...prev,
                                    slot,
                                  ]);
                                }
                              }}
                              className={`flex-1 py-2 border rounded-lg font-bold transition cursor-pointer text-xs ${
                                exists
                                  ? "bg-brand/10 border-brand text-brand"
                                  : "bg-zinc-955 border-zinc-850 text-zinc-400 hover:border-zinc-750"
                              }`}
                            >
                              {slot}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveAdminSlot(slot)}
                              className="px-2 py-2 bg-zinc-950 border border-zinc-850 hover:bg-rose-955/40 hover:border-rose-900 text-zinc-500 hover:text-rose-400 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 font-header"
                              title="Remove Slot"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                      {adminAllSlots.length === 0 && (
                        <div className="col-span-2 py-4 bg-zinc-955/40 border border-dashed border-zinc-850 rounded-lg text-zinc-550 italic text-xs text-center w-full">
                          No timing slots configured. Use the controls below to
                          add custom slots or generate from a time range.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add Custom Timing Slot */}
                  <div className="space-y-1.5 bg-zinc-955/50 border border-zinc-850/60 p-3.5 rounded-lg">
                    <label className="text-xs font-bold text-zinc-350 block">
                      Add Custom Timing Slot
                    </label>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1 space-y-0.5">
                        <label className="text-[10px] text-zinc-500 font-bold block">
                          Hour
                        </label>
                        <select
                          value={adminCustomHour}
                          onChange={(e) => setAdminCustomHour(e.target.value)}
                          className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-white outline-none focus:border-brand cursor-pointer"
                        >
                          {[
                            "01",
                            "02",
                            "03",
                            "04",
                            "05",
                            "06",
                            "07",
                            "08",
                            "09",
                            "10",
                            "11",
                            "12",
                          ].map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <label className="text-[10px] text-zinc-500 font-bold block">
                          Minute
                        </label>
                        <select
                          value={adminCustomMinute}
                          onChange={(e) => setAdminCustomMinute(e.target.value)}
                          className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-855 rounded-lg text-xs text-white outline-none focus:border-brand cursor-pointer"
                        >
                          {[
                            "00",
                            "05",
                            "10",
                            "15",
                            "20",
                            "25",
                            "30",
                            "35",
                            "40",
                            "45",
                            "50",
                            "55",
                          ].map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <label className="text-[10px] text-zinc-500 font-bold block">
                          AM/PM
                        </label>
                        <select
                          value={adminCustomPeriod}
                          onChange={(e) => setAdminCustomPeriod(e.target.value)}
                          className="w-full px-2 py-1.5 bg-zinc-955 border border-zinc-855 rounded-lg text-xs text-white outline-none focus:border-brand cursor-pointer"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddAdminCustomSlot}
                        className="bg-brand/10 hover:bg-brand text-brand hover:text-zinc-955 px-3 py-1.5 text-xs font-bold rounded-full transition-colors border border-brand/30 hover:border-brand cursor-pointer shrink-0 h-[30px] flex items-center justify-center font-header"
                      >
                        Add Slot
                      </button>
                    </div>
                  </div>

                  {/* Add Custom Time Range */}
                  <div className="space-y-1.5 bg-zinc-955/50 border border-zinc-850/60 p-3.5 rounded-lg">
                    <label className="text-xs font-bold text-zinc-350 block">
                      Generate Timing Slots from Range
                    </label>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-1.5 items-end">
                        <span className="text-xs text-zinc-500 font-bold pb-1.5 tracking-wide w-10 text-left">
                          From:
                        </span>
                        <div className="flex-1 space-y-0.5">
                          <select
                            value={adminFromHour}
                            onChange={(e) => setAdminFromHour(e.target.value)}
                            className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-white outline-none focus:border-brand cursor-pointer"
                          >
                            {[
                              "01",
                              "02",
                              "03",
                              "04",
                              "05",
                              "06",
                              "07",
                              "08",
                              "09",
                              "10",
                              "11",
                              "12",
                            ].map((h) => (
                              <option key={h} value={h}>
                                {h}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <select
                            value={adminFromMinute}
                            onChange={(e) => setAdminFromMinute(e.target.value)}
                            className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-white outline-none focus:border-brand cursor-pointer"
                          >
                            {["00", "15", "30", "45"].map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <select
                            value={adminFromPeriod}
                            onChange={(e) => setAdminFromPeriod(e.target.value)}
                            className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-855 rounded-lg text-xs text-white outline-none focus:border-brand cursor-pointer"
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-1.5 items-end">
                        <span className="text-xs text-zinc-500 font-bold pb-1.5 tracking-wide w-10 text-left">
                          To:
                        </span>
                        <div className="flex-1 space-y-0.5">
                          <select
                            value={adminToHour}
                            onChange={(e) => setAdminToHour(e.target.value)}
                            className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-white outline-none focus:border-brand cursor-pointer"
                          >
                            {[
                              "01",
                              "02",
                              "03",
                              "04",
                              "05",
                              "06",
                              "07",
                              "08",
                              "09",
                              "10",
                              "11",
                              "12",
                            ].map((h) => (
                              <option key={h} value={h}>
                                {h}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <select
                            value={adminToMinute}
                            onChange={(e) => setAdminToMinute(e.target.value)}
                            className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-white outline-none focus:border-brand cursor-pointer"
                          >
                            {["00", "15", "30", "45"].map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <select
                            value={adminToPeriod}
                            onChange={(e) => setAdminToPeriod(e.target.value)}
                            className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-855 rounded-lg text-xs text-white outline-none focus:border-brand cursor-pointer"
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const fromStr = `${adminFromHour}:${adminFromMinute} ${adminFromPeriod}`;
                          const toStr = `${adminToHour}:${adminToMinute} ${adminToPeriod}`;
                          addAdminTimeRangeSlots(fromStr, toStr);
                        }}
                        className="w-full mt-1 bg-brand/10 hover:bg-brand text-brand hover:text-zinc-955 py-2 text-xs font-bold rounded-lg transition-colors border border-brand/30 hover:border-brand cursor-pointer flex items-center justify-center font-header"
                      >
                        Generate Hourly Slots from Range
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {psyFormError && (
                <p className="text-sm text-rose-500 font-bold tracking-wide">
                  {psyFormError}
                </p>
              )}

              {psyFormSuccess && (
                <p className="text-sm text-emerald-500 font-bold tracking-wide">
                  {psyFormSuccess}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddPsyOpen(false);
                    setIsEditPsyOpen(false);
                  }}
                  className="flex-1 py-3 border border-zinc-800 hover:bg-zinc-850 text-white font-bold text-sm rounded-lg cursor-pointer transition text-center bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingForm}
                  className="flex-1 py-3 bg-brand hover:bg-brand-dark text-zinc-955 font-bold text-sm rounded-full cursor-pointer transition border-none shadow-md flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingForm && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isAddPsyOpen ? "Save Psychologist" : "Update Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingPsychologist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-955/80 backdrop-blur-xs animate-in fade-in duration-300"
            onClick={() => setViewingPsychologist(null)}
          />
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-lg p-6 sm:p-8 shadow-2xl space-y-6 text-left text-white z-10 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[85vh]">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-brand/10 border border-brand/20 text-brand flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden">
                  {viewingPsychologist.profilePic ||
                  viewingPsychologist.image ? (
                    <img
                      src={
                        viewingPsychologist.profilePic ||
                        viewingPsychologist.image
                      }
                      alt={viewingPsychologist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(viewingPsychologist.name)
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-header flex items-center gap-2">
                    <Award className="w-5 h-5 text-brand" /> Psychologist
                    Profile Details
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    Credentials, availability, rates, and booking history logs.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingPsychologist(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(() => {
              const title =
                viewingPsychologist.title || "Consultant Psychologist";
              const phone = viewingPsychologist.phone || "N/A";
              const hours =
                viewingPsychologist.hours !== undefined
                  ? viewingPsychologist.hours
                  : 0;
              const rawModes = viewingPsychologist.modes || [
                "ONLINE",
                "OFFLINE",
                "DOOR_STEP",
              ];
              const modes = Array.isArray(rawModes)
                ? rawModes
                : typeof rawModes === "string"
                  ? rawModes.split(",").map((m) => m.trim())
                  : [];
              const education =
                viewingPsychologist.education || "MPhil Clinical Psychology";
              const rawSpecialties =
                viewingPsychologist.specialties ||
                "Anxiety, Stress Management, Mood Disorders";
              const specialtiesList = Array.isArray(rawSpecialties)
                ? rawSpecialties
                : typeof rawSpecialties === "string"
                  ? rawSpecialties.split(",").map((s) => s.trim())
                  : [];
              const price = viewingPsychologist.price || 1200;
              const lang = viewingPsychologist.lang || "English, Malayalam";
              const bio =
                viewingPsychologist.bio ||
                viewingPsychologist.experience ||
                "Professional clinical therapist committed to student wellbeing.";

              return (
                <div className="space-y-6">
                  {/* Grid details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Professional Info */}
                    <div className="bg-zinc-955 border border-zinc-850 rounded-lg p-4 space-y-3.5 text-sm">
                      <span className="text-sm font-bold text-zinc-500 block">
                        Advisor Credentials
                      </span>
                      <div className="space-y-2.5">
                        <div>
                          <span className="text-zinc-500 block text-xs ">
                            Professional Title
                          </span>
                          <span className="font-bold text-white">{title}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-sm ">
                            Full Name
                          </span>
                          <span className="font-bold text-white">
                            {viewingPsychologist.name}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-sm ">
                            Email Address
                          </span>
                          <span className="font-semibold text-zinc-300">
                            {viewingPsychologist.email}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-xs ">
                            Phone Number
                          </span>
                          <span className="font-semibold text-zinc-300">
                            {phone}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-550 block text-sm ">
                            Education Qualification
                          </span>
                          <span className="font-bold text-zinc-350">
                            {education}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-xs ">
                            Experience Hours
                          </span>
                          <span className="font-bold text-zinc-300">
                            {hours} hours
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-sm ">
                            Consultation Fee
                          </span>
                          <span className="font-bold text-brand">
                            ₹{price} / hour
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-sm ">
                            Languages Spoken
                          </span>
                          <span className="font-medium text-zinc-300">
                            {lang}
                          </span>
                        </div>
                        <div className="flex gap-2 items-center pt-1">
                          <span
                            className={`px-2.5 py-0.5 rounded text-sm font-bold ${
                              viewingPsychologist.status === "ACTIVE"
                                ? "bg-emerald-955/20 border border-emerald-900/30 text-emerald-450"
                                : viewingPsychologist.status === "REJECTED"
                                  ? "bg-rose-955/20 border border-rose-900/30 text-rose-455"
                                  : "bg-amber-955/20 border border-amber-900/30 text-amber-500"
                            }`}
                          >
                            {viewingPsychologist.status === "ACTIVE"
                              ? "Verified"
                              : viewingPsychologist.status === "REJECTED"
                                ? "Rejected"
                                : "Pending Verification"}
                          </span>
                          <a
                            href={`#/advisor/${viewingPsychologist.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-0.5 bg-zinc-900 border border-zinc-800 hover:text-brand rounded text-sm font-bold transition"
                          >
                            Preview Profile
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Bio & Availability */}
                    <div className="space-y-4">
                      {/* Bio */}
                      <div className="bg-zinc-955 border border-zinc-850 rounded-lg p-4 space-y-2 text-sm">
                        <span className="text-sm font-bold text-zinc-500 block">
                          Therapist Bio
                        </span>
                        <p className="text-zinc-300 leading-relaxed italic text-[12.5px]">
                          "{bio}"
                        </p>
                      </div>

                      {/* Specialties List */}
                      <div className="bg-zinc-955 border border-zinc-850 rounded-lg p-4 space-y-2">
                        <span className="text-sm font-bold text-zinc-500 block">
                          Areas of Expertise
                        </span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {specialtiesList.map((spec) => (
                            <span
                              key={spec}
                              className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-sm font-bold text-zinc-400 tracking-wide"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Supported Session Modes */}
                      <div className="bg-zinc-955 border border-zinc-850 rounded-lg p-4 space-y-2">
                        <span className="text-sm font-bold text-zinc-500 block">
                          Supported Session Modes
                        </span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {modes.map((mode) => (
                            <span
                              key={mode}
                              className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400 tracking-wide"
                            >
                              {mode === "DOOR_STEP"
                                ? "Doorstep"
                                : mode.charAt(0) + mode.slice(1).toLowerCase()}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Active Availability Timings */}
                      <div className="bg-zinc-955 border border-zinc-850 rounded-lg p-4 space-y-2.5 text-sm">
                        <span className="text-sm font-bold text-zinc-500 block">
                          Active Availability Timings
                        </span>
                        <div>
                          <span className="text-zinc-500 block text-xs ">
                            Operational Days
                          </span>
                          <span className="font-semibold text-zinc-300">
                            {viewingPsychologist.availability?.activeDays
                              ? Object.entries(
                                  viewingPsychologist.availability.activeDays,
                                )
                                  .filter(([_, active]) => active)
                                  .map(([dayIndex]) => {
                                    const days = [
                                      "Sunday",
                                      "Monday",
                                      "Tuesday",
                                      "Wednesday",
                                      "Thursday",
                                      "Friday",
                                      "Saturday",
                                    ];
                                    return days[Number(dayIndex)];
                                  })
                                  .join(", ") || "None"
                              : "Monday, Tuesday, Wednesday, Thursday, Friday"}
                          </span>
                        </div>
                        <div className="pt-1.5">
                          <span className="text-zinc-500 block text-xs ">
                            Available Time Slots
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1.5 max-h-[100px] overflow-y-auto pr-1">
                            {viewingPsychologist.availability?.availableSlots
                              ?.length > 0 ? (
                              viewingPsychologist.availability.availableSlots.map(
                                (slot) => (
                                  <span
                                    key={slot}
                                    className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400"
                                  >
                                    {slot}
                                  </span>
                                ),
                              )
                            ) : (
                              <span className="text-zinc-550 italic text-xs">
                                No timing slots configured.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Consult bookings count */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-zinc-500 block">
                        Consultation Schedule History
                      </span>
                      <span className="text-sm text-brand font-bold ">
                        {
                          bookingsDb.filter(
                            (b) =>
                              b.advisorId === viewingPsychologist.id ||
                              (b.advisorName &&
                                b.advisorName.toLowerCase() ===
                                  viewingPsychologist.name.toLowerCase()),
                          ).length
                        }{" "}
                        consultations booked
                      </span>
                    </div>

                    <div className="border border-zinc-850 rounded-lg overflow-hidden bg-zinc-955 max-h-[160px] overflow-y-auto">
                      <div className="overflow-x-auto w-full">
                        <table className="w-full text-sm border-collapse text-left min-w-[420px]">
                          <thead>
                            <tr className="bg-zinc-900/50 text-zinc-500 font-bold border-b border-zinc-855">
                              <th className="p-2.5">Client Student</th>
                              <th className="p-2.5">Date & Time</th>
                              <th className="p-2.5">Type & Mode</th>
                              <th className="p-2.5 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const psyBookings = bookingsDb.filter(
                                (b) =>
                                  b.advisorId === viewingPsychologist.id ||
                                  (b.advisorName &&
                                    b.advisorName.toLowerCase() ===
                                      viewingPsychologist.name.toLowerCase()),
                              );
                              if (psyBookings.length === 0) {
                                return (
                                  <tr>
                                    <td
                                      colSpan={4}
                                      className="p-4 text-center text-zinc-650 italic"
                                    >
                                      No scheduled slot logs.
                                    </td>
                                  </tr>
                                );
                              }
                              return psyBookings.map((b) => {
                                const student = usersDb.find(
                                  (u) => u.id === b.userId,
                                );
                                return (
                                  <tr
                                    key={b.id}
                                    className="border-b border-zinc-900/60 hover:bg-zinc-900/30"
                                  >
                                    <td className="p-2.5">
                                      <span className="text-white block font-semibold">
                                        {student
                                          ? student.name
                                          : "Unknown Student"}
                                      </span>
                                      <span className="text-zinc-500 text-sm truncate block max-w-[150px]">
                                        {student ? student.email : ""}
                                      </span>
                                    </td>
                                    <td className="p-2.5">
                                      <span className="text-zinc-300 block font-semibold">
                                        {b.date}
                                      </span>
                                      <span className="text-zinc-500 text-sm">
                                        {b.time}
                                      </span>
                                    </td>
                                    <td className="p-2.5 text-zinc-400 font-medium">
                                      {b.service === "counselling"
                                        ? "Wellbeing"
                                        : "Career"}{" "}
                                      ({b.mode})
                                    </td>
                                    <td className="p-2.5 text-center">
                                      <span
                                        className={`px-2 py-0.5 rounded text-sm font-bold ${
                                          b.status === "CONFIRMED"
                                            ? "bg-indigo-950/20 border border-indigo-900/30 text-indigo-400"
                                            : b.status === "COMPLETED"
                                              ? "bg-emerald-955/20 border border-emerald-900/30 text-emerald-450"
                                              : b.status === "CANCELLED"
                                                ? "bg-rose-955/20 border border-rose-900/30 text-rose-500"
                                                : "bg-zinc-800 border border-zinc-700 text-zinc-400"
                                        }`}
                                      >
                                        {b.status}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              });
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingPsychologist(null)}
                className="px-6 py-2.5 border border-zinc-800 hover:bg-zinc-855 text-white font-bold text-sm rounded-lg cursor-pointer transition text-center border-none bg-transparent"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

{(isAddPsyOpen || isEditPsyOpen) && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <div
 className="absolute inset-0 bg-zinc-955/80 backdrop-blur-xs animate-in fade-in duration-300"
 onClick={() => { setIsAddPsyOpen(false); setIsEditPsyOpen(false); }}
 />
 <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-lg p-6 sm:p-8 shadow-2xl space-y-5 text-left text-white z-10 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
 <div>
 <h3 className="text-base font-bold text-white font-header">
 {isAddPsyOpen ? 'Register Psychologist' : 'Edit Psychologist details'}
 </h3>
 <p className="text-sm text-zinc-500 leading-none mt-1">
 {isAddPsyOpen ? 'Register a clinical professional profile.' : 'Modify credentials, rates, and bios.'}
 </p>
 </div>

 <form onSubmit={isAddPsyOpen ? handleCreatePsy : handleUpdatePsy} className="space-y-4 font-medium">
 {(isEditPsyOpen || isAddPsyOpen) && (
 <div className="space-y-2">
 <label className="text-xs font-bold text-zinc-400 tracking-wide">Profile Picture</label>
 <div className="flex items-center gap-3">
 <div className="w-14 h-14 rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center text-brand font-bold text-lg">
 {psyProfilePicFile ? (
 <img src={URL.createObjectURL(psyProfilePicFile)} alt="Preview" className="w-full h-full object-cover" />
 ) : psyForm.profilePic ? (
 <img src={psyForm.profilePic} alt="Profile" className="w-full h-full object-cover" />
 ) : (
 getInitials(psyForm.name)
 )}
 </div>
 <div className="flex-1 space-y-1">
 <input ref={psyProfilePicRef} type="file" accept="image/jpeg,image/png,image/jpg" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) setPsyProfilePicFile(file); }} />
 <button type="button" onClick={() => psyProfilePicRef.current?.click()} className="px-3 py-2 text-xs font-bold bg-zinc-955 border border-zinc-800 hover:border-brand text-zinc-300 hover:text-white rounded-lg cursor-pointer transition bg-transparent">
 {psyProfilePicFile ? 'Change Image' : 'Upload Photo'}
 </button>
 {psyProfilePicFile && (<p className="text-xs text-zinc-500 truncate max-w-[180px]">{psyProfilePicFile.name}</p>)}
 </div>
 </div>
 </div>
 )}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
 <div className="space-y-1">
 <label className="text-sm font-bold text-zinc-400">Full Name</label>
 <input
 type="text"
 required
 placeholder="e.g. Dr. Sandra Tomy"
 value={psyForm.name}
 onChange={(e) => setPsyForm({ ...psyForm, name: e.target.value })}
 className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
 />
 </div>

 <div className="space-y-1">
 <label className="text-sm font-bold text-zinc-400">Email Address</label>
 <input
 type="email"
 required
 placeholder="counsellor@example.com"
 value={psyForm.email}
 onChange={(e) => setPsyForm({ ...psyForm, email: e.target.value })}
 className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
 />
 </div>

 <div className="space-y-1">
 <label className="text-sm font-bold text-zinc-400">
 Password {isEditPsyOpen && <span className="text-zinc-500 lowercase font-normal">(blank keeps same)</span>}
 </label>
 <input
 type="password"
 required={isAddPsyOpen}
 placeholder={isEditPsyOpen ? "••••••••" : "Enter password"}
 value={psyForm.password}
 onChange={(e) => setPsyForm({ ...psyForm, password: e.target.value })}
 className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
 />
 </div>

 <div className="space-y-1">
 <label className="text-sm font-bold text-zinc-400">Education qualifications</label>
 <input
 type="text"
 placeholder="e.g. MPhil Clinical Psychology"
 value={psyForm.education}
 onChange={(e) => setPsyForm({ ...psyForm, education: e.target.value })}
 className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
 />
 </div>

 <div className="space-y-1">
 <label className="text-sm font-bold text-zinc-400">Professional Title</label>
 <select
 value={psyForm.title}
 onChange={(e) => setPsyForm({ ...psyForm, title: e.target.value })}
 className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none cursor-pointer"
 >
 <option value="Consultant Psychologist">Consultant Psychologist</option>
 <option value="Clinical Psychologist">Clinical Psychologist</option>
 <option value="Psychiatrist">Psychiatrist</option>
 <option value="Career Mentor">Career Mentor</option>
 </select>
 </div>

 <div className="space-y-1">
 <label className="text-sm font-bold text-zinc-400">Phone Number</label>
 <input
 type="text"
 placeholder="e.g. +91 94971 74011"
 value={psyForm.phone}
 onChange={(e) => setPsyForm({ ...psyForm, phone: e.target.value })}
 className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
 />
 </div>

 <div className="space-y-1">
 <label className="text-sm font-bold text-zinc-400">Hourly price (INR)</label>
 <input
 type="number"
 placeholder="e.g. 1250"
 value={psyForm.price}
 onChange={(e) => setPsyForm({ ...psyForm, price: e.target.value })}
 className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
 />
 </div>

 <div className="space-y-1">
 <label className="text-sm font-bold text-zinc-400">Languages Spoken</label>
 <input
 type="text"
 placeholder="e.g. Malayalam, English"
 value={psyForm.lang}
 onChange={(e) => setPsyForm({ ...psyForm, lang: e.target.value })}
 className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
 />
 </div>

 <div className="space-y-1">
 <label className="text-sm font-bold text-zinc-400">Experience Hours</label>
 <input
 type="number"
 placeholder="e.g. 150"
 value={psyForm.hours}
 onChange={(e) => setPsyForm({ ...psyForm, hours: Number(e.target.value) || 0 })}
 className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
 />
 </div>

 <div className="sm:col-span-2 space-y-1">
 <label className="text-sm font-bold text-zinc-400">Default Google Meet Link (optional)</label>
 <input
 type="text"
 placeholder="https://meet.google.com/abc-defg-hij"
 value={psyForm.defaultMeetLink}
 onChange={(e) => setPsyForm({ ...psyForm, defaultMeetLink: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-zinc-955 border border-zinc-855 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
 />
 </div>

 <div className="sm:col-span-2 space-y-3.5 p-4 bg-zinc-950 border border-zinc-800 rounded-lg mt-2 text-left">
 <h4 className="text-xs font-bold text-brand tracking-wider">Practice / Geographic Location</h4>
 
 {/* Address search field */}
 <div className="space-y-1.5 relative">
 <label className="text-zinc-400 font-bold text-xs tracking-wide block">Search Location Address</label>
 <div className="flex flex-col sm:flex-row gap-2">
 <input
 type="text"
 placeholder="Type an address to search..."
 value={adminSearchQuery}
 onChange={(e) => setAdminSearchQuery(e.target.value)}
 className="flex-1 min-w-0 px-3 py-2 bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg outline-none focus:border-brand transition-all"
 onKeyDown={(e) => {
 if (e.key === 'Enter') {
 e.preventDefault();
 handleAdminAddressSearch();
 }
 }}
 />
 <button
 type="button"
 onClick={handleAdminAddressSearch}
 disabled={isAdminSearching}
 className="w-full sm:w-auto px-4 py-2 bg-brand text-zinc-955 text-xs font-bold rounded-full hover:bg-brand-dark transition cursor-pointer shrink-0 flex items-center justify-center"
 >
 {isAdminSearching ? 'Searching...' : 'Search'}
 </button>
 </div>

 {/* Autocomplete Dropdown */}
 {adminSearchResults.length > 0 && (
 <div className="absolute left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg max-h-40 overflow-y-auto z-50 shadow-xl divide-y divide-zinc-800">
 {adminSearchResults.map((res, index) => (
 <button
 key={index}
 type="button"
 onClick={() => {
 setPsyForm({
 ...psyForm,
 locationName: res.display_name,
 latitude: parseFloat(res.lat) || 0,
 longitude: parseFloat(res.lon) || 0
 });
 setAdminSearchQuery(res.display_name);
 setAdminSearchResults([]);
 }}
 className="w-full text-left px-3.5 py-2.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors block truncate"
 >
 {res.display_name}
 </button>
 ))}
 </div>
 )}
 </div>

 <div className="space-y-1.5">
 <label className="text-zinc-400 font-bold text-xs tracking-wide">Clinic / Center Address</label>
 <input
 type="text"
 placeholder="e.g. 123 Main St, Calicut, Kerala"
 value={psyForm.locationName || ''}
 onChange={(e) => {
 setPsyForm({ ...psyForm, locationName: e.target.value });
 setAdminSearchQuery(e.target.value);
 }}
 className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg outline-none focus:border-brand transition-all"
 />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-zinc-400 font-bold text-xs tracking-wide">Latitude</label>
 <input
 type="number"
 step="any"
 placeholder="e.g. 11.2588"
 value={psyForm.latitude || ''}
 onChange={(e) => setPsyForm({ ...psyForm, latitude: parseFloat(e.target.value) || 0 })}
 className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg outline-none focus:border-brand transition-all"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-zinc-400 font-bold text-xs tracking-wide">Longitude</label>
 <input
 type="number"
 step="any"
 placeholder="e.g. 75.7804"
 value={psyForm.longitude || ''}
 onChange={(e) => setPsyForm({ ...psyForm, longitude: parseFloat(e.target.value) || 0 })}
 className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg outline-none focus:border-brand transition-all"
 />
 </div>
 </div>
 <button
 type="button"
 disabled={isAdminLocating}
 onClick={handleAdminDetectLocation}
 className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 text-xs font-bold rounded-full transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
 >
 {isAdminLocating ? (
 <>
 <div className="w-3 h-3 border border-zinc-400 border-t-brand rounded-full animate-spin" />
 Locating...
 </>
 ) : (
 <>
 <svg className="w-3.5 h-3.5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
 </svg>
 Detect Location & Address
 </>
 )}
 </button>
 </div>

 <div className="sm:col-span-2 space-y-1.5 pt-1">
 <label className="text-sm font-bold text-zinc-400 block mb-1">Supported Session Modes</label>
 <div className="flex flex-wrap gap-4">
 {['ONLINE', 'OFFLINE', 'DOOR_STEP'].map(mode => (
 <label key={mode} className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300 select-none font-semibold">
 <input
 type="checkbox"
 checked={psyForm.modes ? psyForm.modes.includes(mode) : false}
 onChange={() => {
 const currentModes = psyForm.modes || [];
 const nextModes = currentModes.includes(mode)
 ? currentModes.filter(m => m !== mode)
 : [...currentModes, mode];
 setPsyForm({ ...psyForm, modes: nextModes });
 }}
 className="w-4 h-4 rounded border-zinc-805 bg-zinc-955 text-brand focus:ring-0 focus:ring-offset-0 cursor-pointer accent-brand"
 />
 <span>{mode === 'DOOR_STEP' ? 'Doorstep' : mode.charAt(0) + mode.slice(1).toLowerCase()}</span>
 </label>
 ))}
 </div>
 </div>

 <div className="sm:col-span-2 space-y-1.5 pt-2">
 <label className="text-sm font-bold text-zinc-400 block mb-1">Account & Feature Status</label>
 <div className="flex flex-wrap gap-5">
 <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300 select-none font-semibold">
 <input
 type="checkbox"
 checked={psyForm.isActive !== false}
 onChange={(e) => setPsyForm({ ...psyForm, isActive: e.target.checked })}
 className="w-4 h-4 rounded border-zinc-805 bg-zinc-955 text-brand focus:ring-0 focus:ring-offset-0 cursor-pointer accent-brand"
 />
 <span>Active Profile (Accept Bookings)</span>
 </label>

 <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300 select-none font-semibold">
 <input
 type="checkbox"
 checked={psyForm.isTopFive || false}
 onChange={(e) => setPsyForm({ ...psyForm, isTopFive: e.target.checked })}
 className="w-4 h-4 rounded border-zinc-805 bg-zinc-955 text-brand focus:ring-0 focus:ring-offset-0 cursor-pointer accent-brand"
 />
 <span>Featured Psychologist (Top 5)</span>
 </label>
 </div>
 </div>

 <div className="sm:col-span-2 space-y-1">
 <label className="text-sm font-bold text-zinc-400">Specialties (comma-separated)</label>
 <input
 type="text"
 placeholder="Anxiety, Stress Management, Mood Disorders"
 value={psyForm.specialties}
 onChange={(e) => setPsyForm({ ...psyForm, specialties: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-zinc-955 border border-zinc-855 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
 />
 </div>

 <div className="sm:col-span-2 space-y-1">
 <label className="text-sm font-bold text-zinc-400">Professional Bio</label>
 <textarea
 rows={4}
 placeholder="Write clinical experience details..."
 value={psyForm.bio}
 onChange={(e) => setPsyForm({ ...psyForm, bio: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-zinc-955 border border-zinc-855 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors resize-none"
 />
 </div>

 {/* Availability Timings */}
 <div className="sm:col-span-2 border-t border-zinc-800 pt-4 space-y-4">
 <h4 className="text-sm font-bold text-zinc-300 font-header">Availability Timings</h4>

 {/* Operational Days */}
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-zinc-400 block">Operational Days</label>
 <div className="flex flex-wrap gap-1.5">
 {[
 { label: 'Mon', index: 1 },
 { label: 'Tue', index: 2 },
 { label: 'Wed', index: 3 },
 { label: 'Thu', index: 4 },
 { label: 'Fri', index: 5 },
 { label: 'Sat', index: 6 },
 { label: 'Sun', index: 0 }
 ].map(day => {
 const active = adminActiveDays[day.index];
 return (
 <button
 key={day.index}
 type="button"
 onClick={() => toggleAdminDay(day.index)}
 className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${active
 ? 'bg-brand text-zinc-955 font-bold border-none'
 : 'bg-zinc-955 border-zinc-850 text-zinc-500 hover:border-zinc-750'
 }`}
 >
 {day.label}
 </button>
 );
 })}
 </div>
 </div>

 {/* Active Timing Slots */}
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-zinc-400 block">Timing Slots (Active)</label>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
 {adminAllSlots.map(slot => {
 const exists = adminAvailableSlots.includes(slot);
 return (
 <div key={slot} className="flex items-center gap-1.5 w-full">
 <button
 type="button"
 onClick={() => {
 if (exists) {
 setAdminAvailableSlots(prev => prev.filter(s => s !== slot));
 } else {
 setAdminAvailableSlots(prev => [...prev, slot]);
 }
 }}
 className={`flex-1 py-2 border rounded-lg font-bold transition cursor-pointer text-xs ${exists
 ? 'bg-brand/10 border-brand text-brand'
 : 'bg-zinc-955 border-zinc-850 text-zinc-400 hover:border-zinc-750'
 }`}
 >
 {slot}
 </button>
 <button
 type="button"
 onClick={() => handleRemoveAdminSlot(slot)}
 className="px-2 py-2 bg-zinc-950 border border-zinc-850 hover:bg-rose-955/40 hover:border-rose-900 text-zinc-500 hover:text-rose-400 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 font-header"
 title="Remove Slot"
 >
 Remove
 </button>
 </div>
 );
 })}
 {adminAllSlots.length === 0 && (
 <div className="col-span-2 py-4 bg-zinc-955/40 border border-dashed border-zinc-850 rounded-lg text-zinc-550 italic text-xs text-center w-full">
 No timing slots configured. Use the controls below to add custom slots or generate from a time range.
 </div>
 )}
 </div>
 </div>

 {/* Add Custom Timing Slot */}
 <div className="space-y-1.5 bg-zinc-955/50 border border-zinc-850/60 p-3.5 rounded-lg">
 <label className="text-xs font-bold text-zinc-350 block">Add Custom Timing Slot</label>
 <div className="flex gap-2 items-end">
 <div className="flex-1 space-y-0.5">
 <label className="text-[10px] text-zinc-500 font-bold block">Hour</label>
 <select
 value={adminCustomHour}
 onChange={(e) => setAdminCustomHour(e.target.value)}
 className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-white outline-none focus:border-brand cursor-pointer"
 >
 {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(h => (
 <option key={h} value={h}>{h}</option>
 ))}
 </select>
 </div>
 <div className="flex-1 space-y-0.5">
 <label className="text-[10px] text-zinc-500 font-bold block">Minute</label>
 <select
 value={adminCustomMinute}
 onChange={(e) => setAdminCustomMinute(e.target.value)}
 className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-855 rounded-lg text-xs text-white outline-none focus:border-brand cursor-pointer"
 >
 {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
 <option key={m} value={m}>{m}</option>
 ))}
 </select>
 </div>
 <div className="flex-1 space-y-0.5">
 <label className="text-[10px] text-zinc-500 font-bold block">AM/PM</label>
 <select
 value={adminCustomPeriod}
 onChange={(e) => setAdminCustomPeriod(e.target.value)}
 className="w-full px-2 py-1.5 bg-zinc-955 border border-zinc-855 rounded-lg text-xs text-white outline-none focus:border-brand cursor-pointer"
 >
 <option value="AM">AM</option>
 <option value="PM">PM</option>
 </select>
 </div>
 <button
 type="button"
 onClick={handleAddAdminCustomSlot}
 className="bg-brand/10 hover:bg-brand text-brand hover:text-zinc-955 px-3 py-1.5 text-xs font-bold rounded-full transition-colors border border-brand/30 hover:border-brand cursor-pointer shrink-0 h-[30px] flex items-center justify-center font-header"
 >
 Add Slot
 </button>
 </div>
 </div>

 {/* Add Custom Time Range */}
 <div className="space-y-1.5 bg-zinc-955/50 border border-zinc-850/60 p-3.5 rounded-lg">
 <label className="text-xs font-bold text-zinc-350 block">Generate Timing Slots from Range</label>
 <div className="flex flex-col gap-2">
 <div className="flex gap-1.5 items-end">
 <span className="text-xs text-zinc-500 font-bold pb-1.5 tracking-wide w-10 text-left">From:</span>
 <div className="flex-1 space-y-0.5">
 <select
 value={adminFromHour}
 onChange={(e) => setAdminFromHour(e.target.value)}
 className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-white outline-none focus:border-brand cursor-pointer"
 >
 {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(h => (
 <option key={h} value={h}>{h}</option>
 ))}
 </select>
 </div>
 <div className="flex-1 space-y-0.5">
 <select
 value={adminFromMinute}
 onChange={(e) => setAdminFromMinute(e.target.value)}
 className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-white outline-none focus:border-brand cursor-pointer"
 >
 {['00', '15', '30', '45'].map(m => (
 <option key={m} value={m}>{m}</option>
 ))}
 </select>
 </div>
 <div className="flex-1 space-y-0.5">
 <select
 value={adminFromPeriod}
 onChange={(e) => setAdminFromPeriod(e.target.value)}
 className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-855 rounded-lg text-xs text-white outline-none focus:border-brand cursor-pointer"
 >
 <option value="AM">AM</option>
 <option value="PM">PM</option>
 </select>
 </div>
 </div>

 <div className="flex gap-1.5 items-end">
 <span className="text-xs text-zinc-500 font-bold pb-1.5 tracking-wide w-10 text-left">To:</span>
 <div className="flex-1 space-y-0.5">
 <select
 value={adminToHour}
 onChange={(e) => setAdminToHour(e.target.value)}
 className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-white outline-none focus:border-brand cursor-pointer"
 >
 {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(h => (
 <option key={h} value={h}>{h}</option>
 ))}
 </select>
 </div>
 <div className="flex-1 space-y-0.5">
 <select
 value={adminToMinute}
 onChange={(e) => setAdminToMinute(e.target.value)}
 className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-white outline-none focus:border-brand cursor-pointer"
 >
 {['00', '15', '30', '45'].map(m => (
 <option key={m} value={m}>{m}</option>
 ))}
 </select>
 </div>
 <div className="flex-1 space-y-0.5">
 <select
 value={adminToPeriod}
 onChange={(e) => setAdminToPeriod(e.target.value)}
 className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-855 rounded-lg text-xs text-white outline-none focus:border-brand cursor-pointer"
 >
 <option value="AM">AM</option>
 <option value="PM">PM</option>
 </select>
 </div>
 </div>

 <button
 type="button"
 onClick={() => {
 const fromStr = `${adminFromHour}:${adminFromMinute} ${adminFromPeriod}`;
 const toStr = `${adminToHour}:${adminToMinute} ${adminToPeriod}`;
 addAdminTimeRangeSlots(fromStr, toStr);
 }}
 className="w-full mt-1 bg-brand/10 hover:bg-brand text-brand hover:text-zinc-955 py-2 text-xs font-bold rounded-lg transition-colors border border-brand/30 hover:border-brand cursor-pointer flex items-center justify-center font-header"
 >
 Generate Hourly Slots from Range
 </button>
 </div>
 </div>
 </div>
 </div>

 {psyFormError && (
 <p className="text-sm text-rose-500 font-bold tracking-wide">{psyFormError}</p>
 )}

 {psyFormSuccess && (
 <p className="text-sm text-emerald-500 font-bold tracking-wide">{psyFormSuccess}</p>
 )}

 <div className="flex gap-3 pt-2">
 <button
 type="button"
 onClick={() => { setIsAddPsyOpen(false); setIsEditPsyOpen(false); }}
 className="flex-1 py-3 border border-zinc-800 hover:bg-zinc-850 text-white font-bold text-sm rounded-lg cursor-pointer transition text-center bg-transparent"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={isSavingForm}
 className="flex-1 py-3 bg-brand hover:bg-brand-dark text-zinc-955 font-bold text-sm rounded-full cursor-pointer transition border-none shadow-md flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {isSavingForm && <Loader2 className="w-4 h-4 animate-spin" />}
 {isAddPsyOpen ? 'Save Psychologist' : 'Update Details'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

{viewingPsychologist && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <div
 className="absolute inset-0 bg-zinc-955/80 backdrop-blur-xs animate-in fade-in duration-300"
 onClick={() => setViewingPsychologist(null)}
 />
 <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-lg p-6 sm:p-8 shadow-2xl space-y-6 text-left text-white z-10 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[85vh]">
 <div className="flex justify-between items-start">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 rounded-lg bg-brand/10 border border-brand/20 text-brand flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden">
 {viewingPsychologist.profilePic || viewingPsychologist.image ? (
 <img src={viewingPsychologist.profilePic || viewingPsychologist.image} alt={viewingPsychologist.name} className="w-full h-full object-cover" />
 ) : (
 getInitials(viewingPsychologist.name)
 )}
 </div>
 <div>
 <h3 className="text-base font-bold text-white font-header flex items-center gap-2">
 <Award className="w-5 h-5 text-brand" /> Psychologist Profile Details
 </h3>
 <p className="text-sm text-zinc-500 mt-1">Credentials, availability, rates, and booking history logs.</p>
 </div>
 </div>
 <button
 onClick={() => setViewingPsychologist(null)}
 className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer border-none bg-transparent"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {(() => {
 const title = viewingPsychologist.title || 'Consultant Psychologist';
 const phone = viewingPsychologist.phone || 'N/A';
 const hours = viewingPsychologist.hours !== undefined ? viewingPsychologist.hours : 0;
 const rawModes = viewingPsychologist.modes || ['ONLINE', 'OFFLINE', 'DOOR_STEP'];
 const modes = Array.isArray(rawModes) ? rawModes : (typeof rawModes === 'string' ? rawModes.split(',').map(m => m.trim()) : []);
 const education = viewingPsychologist.education || 'MPhil Clinical Psychology';
 const rawSpecialties = viewingPsychologist.specialties || 'Anxiety, Stress Management, Mood Disorders';
 const specialtiesList = Array.isArray(rawSpecialties) ? rawSpecialties : (typeof rawSpecialties === 'string' ? rawSpecialties.split(',').map(s => s.trim()) : []);
 const price = viewingPsychologist.price || 1200;
 const lang = viewingPsychologist.lang || 'English, Malayalam';
 const bio = viewingPsychologist.bio || viewingPsychologist.experience || 'Professional clinical therapist committed to student wellbeing.';

 return (
 <div className="space-y-6">
 {/* Grid details */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Professional Info */}
 <div className="bg-zinc-955 border border-zinc-850 rounded-lg p-4 space-y-3.5 text-sm">
 <span className="text-sm font-bold text-zinc-500 block">Advisor Credentials</span>
 <div className="space-y-2.5">
 <div>
 <span className="text-zinc-500 block text-xs ">Professional Title</span>
 <span className="font-bold text-white">{title}</span>
 </div>
 <div>
 <span className="text-zinc-500 block text-sm ">Full Name</span>
 <span className="font-bold text-white">{viewingPsychologist.name}</span>
 </div>
 <div>
 <span className="text-zinc-500 block text-sm ">Email Address</span>
 <span className="font-semibold text-zinc-300">{viewingPsychologist.email}</span>
 </div>
 <div>
 <span className="text-zinc-500 block text-xs ">Phone Number</span>
 <span className="font-semibold text-zinc-300">{phone}</span>
 </div>
 <div>
 <span className="text-zinc-550 block text-sm ">Education Qualification</span>
 <span className="font-bold text-zinc-350">{education}</span>
 </div>
 <div>
 <span className="text-zinc-500 block text-xs ">Experience Hours</span>
 <span className="font-bold text-zinc-300">{hours} hours</span>
 </div>
 <div>
 <span className="text-zinc-500 block text-sm ">Consultation Fee</span>
 <span className="font-bold text-brand">₹{price} / hour</span>
 </div>
 <div>
 <span className="text-zinc-500 block text-sm ">Languages Spoken</span>
 <span className="font-medium text-zinc-300">{lang}</span>
 </div>
 <div className="flex gap-2 items-center pt-1">
 <span className={`px-2.5 py-0.5 rounded text-sm font-bold ${viewingPsychologist.status === 'ACTIVE'
 ? 'bg-emerald-955/20 border border-emerald-900/30 text-emerald-450'
 : viewingPsychologist.status === 'REJECTED'
 ? 'bg-rose-955/20 border border-rose-900/30 text-rose-455'
 : 'bg-amber-955/20 border border-amber-900/30 text-amber-500'
 }`}>
 {viewingPsychologist.status === 'ACTIVE' ? 'Verified' : viewingPsychologist.status === 'REJECTED' ? 'Rejected' : 'Pending Verification'}
 </span>
 <a
 href={`#/advisor/${viewingPsychologist.id}`}
 target="_blank"
 rel="noopener noreferrer"
 className="px-2.5 py-0.5 bg-zinc-900 border border-zinc-800 hover:text-brand rounded text-sm font-bold transition"
 >
 Preview Profile
 </a>
 </div>
 </div>
 </div>

 {/* Bio & Availability */}
 <div className="space-y-4">
 {/* Bio */}
 <div className="bg-zinc-955 border border-zinc-850 rounded-lg p-4 space-y-2 text-sm">
 <span className="text-sm font-bold text-zinc-500 block">Therapist Bio</span>
 <p className="text-zinc-300 leading-relaxed italic text-[12.5px]">
 "{bio}"
 </p>
 </div>

 {/* Specialties List */}
 <div className="bg-zinc-955 border border-zinc-850 rounded-lg p-4 space-y-2">
 <span className="text-sm font-bold text-zinc-500 block">Areas of Expertise</span>
 <div className="flex flex-wrap gap-1.5 pt-1">
 {specialtiesList.map(spec => (
 <span
 key={spec}
 className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-sm font-bold text-zinc-400 tracking-wide"
 >
 {spec}
 </span>
 ))}
 </div>
 </div>

 {/* Supported Session Modes */}
 <div className="bg-zinc-955 border border-zinc-850 rounded-lg p-4 space-y-2">
 <span className="text-sm font-bold text-zinc-500 block">Supported Session Modes</span>
 <div className="flex flex-wrap gap-1.5 pt-1">
 {modes.map(mode => (
 <span
 key={mode}
 className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400 tracking-wide"
 >
 {mode === 'DOOR_STEP' ? 'Doorstep' : mode.charAt(0) + mode.slice(1).toLowerCase()}
 </span>
 ))}
 </div>
 </div>

 {/* Active Availability Timings */}
 <div className="bg-zinc-955 border border-zinc-850 rounded-lg p-4 space-y-2.5 text-sm">
 <span className="text-sm font-bold text-zinc-500 block">Active Availability Timings</span>
 <div>
 <span className="text-zinc-500 block text-xs ">Operational Days</span>
 <span className="font-semibold text-zinc-300">
 {viewingPsychologist.availability?.activeDays
 ? Object.entries(viewingPsychologist.availability.activeDays)
 .filter(([_, active]) => active)
 .map(([dayIndex]) => {
 const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
 return days[Number(dayIndex)];
 })
 .join(', ') || 'None'
 : 'Monday, Tuesday, Wednesday, Thursday, Friday'}
 </span>
 </div>
 <div className="pt-1.5">
 <span className="text-zinc-500 block text-xs ">Available Time Slots</span>
 <div className="flex flex-wrap gap-1 mt-1.5 max-h-[100px] overflow-y-auto pr-1">
 {viewingPsychologist.availability?.availableSlots?.length > 0 ? (
 viewingPsychologist.availability.availableSlots.map(slot => (
 <span key={slot} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400">
 {slot}
 </span>
 ))
 ) : (
 <span className="text-zinc-550 italic text-xs">No timing slots configured.</span>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Consult bookings count */}
 <div className="space-y-2">
 <div className="flex justify-between items-center">
 <span className="text-sm font-bold text-zinc-500 block">Consultation Schedule History</span>
 <span className="text-sm text-brand font-bold ">
 {bookingsDb.filter(b => b.advisorId === viewingPsychologist.id || (b.advisorName && b.advisorName.toLowerCase() === viewingPsychologist.name.toLowerCase())).length} consultations booked
 </span>
 </div>

 <div className="border border-zinc-850 rounded-lg overflow-hidden bg-zinc-955 max-h-[160px] overflow-y-auto">
 <div className="overflow-x-auto w-full">
 <table className="w-full text-sm border-collapse text-left min-w-[420px]">
 <thead>
 <tr className="bg-zinc-900/50 text-zinc-500 font-bold border-b border-zinc-855">
 <th className="p-2.5">Client Student</th>
 <th className="p-2.5">Date & Time</th>
 <th className="p-2.5">Type & Mode</th>
 <th className="p-2.5 text-center">Status</th>
 </tr>
 </thead>
 <tbody>
 {(() => {
 const psyBookings = bookingsDb.filter(b => b.advisorId === viewingPsychologist.id || (b.advisorName && b.advisorName.toLowerCase() === viewingPsychologist.name.toLowerCase()));
 if (psyBookings.length === 0) {
 return (
 <tr>
 <td colSpan={4} className="p-4 text-center text-zinc-650 italic">No scheduled slot logs.</td>
 </tr>
 );
 }
 return psyBookings.map(b => {
 const student = usersDb.find(u => u.id === b.userId);
 return (
 <tr key={b.id} className="border-b border-zinc-900/60 hover:bg-zinc-900/30">
 <td className="p-2.5">
 <span className="text-white block font-semibold">{student ? student.name : 'Unknown Student'}</span>
 <span className="text-zinc-500 text-sm truncate block max-w-[150px]">{student ? student.email : ''}</span>
 </td>
 <td className="p-2.5">
 <span className="text-zinc-300 block font-semibold">{b.date}</span>
 <span className="text-zinc-500 text-sm">{b.time}</span>
 </td>
 <td className="p-2.5 text-zinc-400 font-medium">
 {b.service === 'counselling' ? 'Wellbeing' : 'Career'} ({b.mode})
 </td>
 <td className="p-2.5 text-center">
 <span className={`px-2 py-0.5 rounded text-sm font-bold ${b.status === 'CONFIRMED' ? 'bg-indigo-950/20 border border-indigo-900/30 text-indigo-400' :
 b.status === 'COMPLETED' ? 'bg-emerald-955/20 border border-emerald-900/30 text-emerald-450' :
 b.status === 'CANCELLED' ? 'bg-rose-955/20 border border-rose-900/30 text-rose-500' :
 'bg-zinc-800 border border-zinc-700 text-zinc-400'
 }`}>
 {b.status}
 </span>
 </td>
 </tr>
 );
 });
 })()}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </div>
 );
 })()}

 <div className="pt-2 flex justify-end">
 <button
 onClick={() => setViewingPsychologist(null)}
 className="px-6 py-2.5 border border-zinc-800 hover:bg-zinc-855 text-white font-bold text-sm rounded-lg cursor-pointer transition text-center border-none bg-transparent"
 >
 Close Profile
 </button>
 </div>
 </div>
 </div>
 )}

</>
  );
}
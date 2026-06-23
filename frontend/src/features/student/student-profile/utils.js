import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import { formatDateString } from '../../../shared/utils/dateFormatter';

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function calculateCompletion(profile) {
  const fields = ['name', 'email', 'phone', 'schoolName', 'grade', 'guardianName', 'guardianPhone'];
  const filled = fields.filter(f => profile[f] && String(profile[f]).trim().length > 0).length;
  return Math.round((filled / fields.length) * 100);
}

export function getInitials(name, fallback) {
  const clean = (name || fallback || 'ST').trim();
  if (clean.length === 0) return 'ST';
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  if (words[0].length >= 2) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return words[0].toUpperCase();
}

export function formatCountdown(dateStr, timeStr) {
  try {
    const [time, modifier] = (timeStr || '').split(' ');
    let [hours, minutes] = (time || '0:00').split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    const [year, month, day] = dateStr.split('-').map(Number);
    const target = new Date(year, month - 1, day, hours, minutes);
    const diff = target - new Date();
    if (diff <= 0) return { text: 'Starting now', urgent: true };
    const days = Math.floor(diff / 86400000);
    const hrs = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (days > 0) return { text: `${days}d ${hrs}h`, urgent: days < 1 };
    if (hrs > 0) return { text: `${hrs}h ${mins}m`, urgent: hrs < 1 };
    return { text: `${mins}m`, urgent: true };
  } catch {
    return { text: '—', urgent: false };
  }
}

export const isSessionCompleted = (booking) => {
  if (booking.status === 'CANCELLED') return false;
  if (booking.status === 'COMPLETED' || booking.status === 'EXPIRED') return true;
  if (booking.status === 'CONFIRMED') {
    try {
      const [year, month, day] = booking.date.split('-').map(Number);
      const timeParts = booking.time.split(' ');
      let [hours, minutes] = timeParts[0].split(':').map(Number);
      const meridiem = timeParts[1];
      if (meridiem === 'PM' && hours < 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;
      const sessionEnd = new Date(year, month - 1, day, hours + 1, minutes);
      return new Date() > sessionEnd;
    } catch { return false; }
  }
  return false;
};

export const getMeetLinkStatus = (session) => {
  if (!session.meetLink) return { status: 'NO_LINK', label: 'Awaiting Link', color: 'amber' };
  if (session.mode !== 'ONLINE') return { status: 'OFFLINE', label: 'In-Person', color: 'zinc' };
  try {
    const [time, modifier] = session.time.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    const [year, month, day] = session.date.split('-').map(Number);
    const sessionTime = new Date(year, month - 1, day, hours, minutes);
    const diffMinutes = (sessionTime - new Date()) / 60000;
    if (diffMinutes <= 10 && diffMinutes >= -60) {
      return { status: 'AVAILABLE', label: 'Join Now', link: session.meetLink, color: 'emerald' };
    } else if (diffMinutes > 10) {
      const mins = Math.round(diffMinutes);
      return { status: 'LOCKED', label: mins > 60 ? `Opens in ${Math.round(mins / 60)}h` : `Opens in ${mins}m`, color: 'zinc' };
    }
    return { status: 'EXPIRED', label: 'Session Ended', color: 'zinc' };
  } catch {
    return { status: 'AVAILABLE', label: 'Join Now', link: session.meetLink, color: 'emerald' };
  }
};

export const generateReceiptPDFDoc = async (bookingDetails, showAlert) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Top Banner Accent Bar (Teal brand color #06b6d4)
    doc.setFillColor(6, 182, 212);
    doc.rect(0, 0, 210, 8, 'F');

    // Header Brand Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(9, 9, 11); // zinc-900
    doc.text('BEHOLD.', 20, 25);
    
    doc.setFontSize(9);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(113, 113, 122); // zinc-500
    doc.text('Premium Career Guidance & Mental Health Platform', 20, 30);

    // Status Badge
    doc.setFillColor(240, 253, 250); // light teal background
    doc.roundedRect(142, 18, 48, 10, 2, 2, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(13, 148, 136); // Teal text
    doc.text('CONFIRMED & PAID', 147, 24.5);

    // Divider Line
    doc.setDrawColor(228, 228, 231); // zinc-200
    doc.line(20, 36, 190, 36);

    // Client & Billing Info Grid
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(39, 39, 42); // zinc-800
    doc.text('CLIENT DETAILS', 20, 46);
    doc.text('RECEIPT METADATA', 120, 46);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(82, 82, 91); // zinc-600
    
    // Client info
    doc.text(`Name: ${bookingDetails.clientName}`, 20, 52);
    doc.text(`Email: ${bookingDetails.clientEmail || 'N/A'}`, 20, 58);
    doc.text(`Phone: ${bookingDetails.clientPhone || 'N/A'}`, 20, 64);

    // Receipt Metadata info
    const displayId = bookingDetails.id ? bookingDetails.id.toString().substring(Math.max(0, bookingDetails.id.toString().length - 6)) : 'N/A';
    doc.text(`Receipt ID: REC-${displayId}`, 120, 52);
    doc.text(`Booking ID: SB-${bookingDetails.id || 'N/A'}`, 120, 58);
    doc.text(`Date of Issue: ${formatDateString(new Date())}`, 120, 64);

    // Divider Line
    doc.line(20, 70, 190, 70);

    // Booking Specifics
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(39, 39, 42);
    doc.text('SESSION DETAILS', 20, 80);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(82, 82, 91);
    doc.text(`Service Type: ${bookingDetails.service}`, 20, 86);
    doc.text(`Advisor Assigned: ${bookingDetails.advisorName} (${bookingDetails.advisorRole})`, 20, 92);
    doc.text(`Session Schedule: ${formatDateString(bookingDetails.date)} at ${bookingDetails.time}`, 20, 98);
    doc.text(`Session Mode: ${bookingDetails.mode}`, 20, 104);

    // Divider Line
    doc.line(20, 110, 190, 110);

    // Pricing Breakdown Table
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(39, 39, 42);
    doc.text('CHARGES BREAKDOWN', 20, 120);

    // Table Header Background
    doc.setFillColor(244, 244, 245); // zinc-100
    doc.rect(20, 124, 170, 8, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(63, 63, 70); // zinc-700
    doc.text('Description', 24, 129.5);
    doc.text('Amount', 160, 129.5);

    // Table Rows
    let tableY = 138;
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(82, 82, 91);

    // Resolve breakdown metrics dynamically
    const detailsBaseFee = bookingDetails.baseFee || 0;
    const detailsGstPercent = bookingDetails.gstPercent || 0;
    const detailsGstAmount = bookingDetails.gstAmount || 0;
    const detailsDiscount = bookingDetails.appliedDiscount || 0;
    const detailsNetTotal = bookingDetails.amount || 0;

    // 1. Base fee
    doc.text(`${bookingDetails.service} Session Booking Fee`, 24, tableY);
    doc.text(`Rs. ${detailsBaseFee.toFixed(2)}`, 160, tableY);
    tableY += 8;

    // 2. GST (if enabled)
    if (detailsGstAmount > 0) {
      doc.text(`GST (${detailsGstPercent}%)`, 24, tableY);
      doc.text(`Rs. ${detailsGstAmount.toFixed(2)}`, 160, tableY);
      tableY += 8;
    }

    // 3. Discount (if applied)
    if (detailsDiscount > 0) {
      doc.setTextColor(22, 163, 74); // green
      doc.text(`Promo Discount Code`, 24, tableY);
      doc.text(`-Rs. ${detailsDiscount.toFixed(2)}`, 160, tableY);
      tableY += 8;
      doc.setTextColor(82, 82, 91); // reset to zinc-600
    }

    // Border line for total
    doc.setDrawColor(228, 228, 231);
    doc.line(20, tableY - 4, 190, tableY - 4);

    // Total Row
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(9, 9, 11); // zinc-900
    doc.text('Net Total Paid', 24, tableY + 2);
    doc.setTextColor(13, 148, 136); // Teal color for total price
    doc.setFontSize(10.5);
    doc.text(`INR ${detailsNetTotal.toFixed(2)}`, 160, tableY + 2);
    
    tableY += 16;

    // Google Meet Session Link if Online
    if (bookingDetails.meetLink) {
      doc.setFillColor(240, 253, 250); // Light teal bg
      doc.roundedRect(20, tableY, 170, 18, 2, 2, 'F');
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(13, 148, 136);
      doc.text('Google Meet Session Link (Online Video Call):', 25, tableY + 6);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(6, 182, 212); // blue-link
      doc.text(bookingDetails.meetLink, 25, tableY + 12);
      
      tableY += 28;
    } else {
      tableY += 10;
    }

    // Footer Notes
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(161, 161, 170); // zinc-400
    doc.text('This is a secure computer-generated booking receipt. No physical signature is required.', 20, tableY);
    doc.text('For rescheduling queries, cancellations, or support, please reply to your coordinator on WhatsApp.', 20, tableY + 5);

    // Save document
    doc.save(`Behold_Session_Receipt_${bookingDetails.id}.pdf`);
  } catch (e) {
    console.error(e);
    if (showAlert) await showAlert("Failed to generate PDF receipt. Please contact platform support.", "Export Error");
  }
};

export const downloadPDFReceiptForSession = async (session, profile, user, showAlert) => {
  const toastId = toast.loading('Generating receipt PDF...');
  try {
    let gstEnabled = false;
    let gstPercent = 0;
    try {
      const stored = localStorage.getItem('behold_site_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        gstEnabled = parsed.gstEnabled === true;
        gstPercent = typeof parsed.gstPercent === 'number' ? parsed.gstPercent : 0;
      }
    } catch (e) {}

    const amountPaid = session.amountPaid || 1200;
    const appliedDiscount = session.appliedDiscount || 0;
    const totalBeforeDiscount = amountPaid + appliedDiscount;

    let baseFeeVal = totalBeforeDiscount;
    let gstAmountVal = 0;
    if (gstEnabled && gstPercent > 0) {
      baseFeeVal = Math.round(totalBeforeDiscount / (1 + gstPercent / 100));
      gstAmountVal = totalBeforeDiscount - baseFeeVal;
    }

    const clientName = profile.name || user?.name || 'Student';
    const clientEmail = profile.email || user?.email || '';
    const clientPhone = profile.phone || user?.phone || '';

    const service = session.service === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring';
    const mode = session.mode === 'ONLINE' ? 'Video Call' : session.mode === 'DOOR_STEP' ? 'Home Visit' : 'At Center';

    const details = {
      id: session.appointmentId || session.id,
      service,
      mode,
      advisorName: session.advisorName || 'Advisor',
      advisorRole: session.advisorRole || (session.service === 'counselling' ? 'Consultant Psychologist' : 'Career Advisor'),
      date: session.date,
      time: session.time,
      clientName,
      clientEmail,
      clientPhone,
      meetLink: session.meetLink && session.meetLink !== 'LOCKED' ? session.meetLink : null,
      amount: amountPaid,
      baseFee: baseFeeVal,
      gstPercent: gstEnabled ? gstPercent : 0,
      gstAmount: gstAmountVal,
      appliedDiscount: appliedDiscount
    };

    await generateReceiptPDFDoc(details, showAlert);
    toast.success('Receipt downloaded successfully!', { id: toastId });
  } catch (err) {
    console.error(err);
    toast.error('Failed to generate PDF receipt', { id: toastId });
  }
};

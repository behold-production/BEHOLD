import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import { formatDateString } from "../../../utils/dateFormatter";

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
    const cName = bookingDetails.student?.name || bookingDetails.clientName || bookingDetails.userName || bookingDetails.studentName || 'Student';
    const cEmail = bookingDetails.student?.email || bookingDetails.clientEmail || 'N/A';
    const cPhone = bookingDetails.student?.phone || bookingDetails.clientPhone || 'N/A';
    
    doc.text(`Name: ${cName}`, 20, 52);
    doc.text(`Email: ${cEmail}`, 20, 58);
    doc.text(`Phone: ${cPhone}`, 20, 64);

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
    doc.text(`Consultant Assigned: ${bookingDetails.advisorName} (${bookingDetails.advisorRole})`, 20, 92);
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
      doc.setTextColor(0, 229, 255); // neon blue
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
    const _isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      if (_isIOS) {
        window.open(doc.output('bloburl'), '_blank');
      } else {
        doc.save(`Behold_Session_Receipt_${bookingDetails.id}.pdf`);
      }
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

export const downloadCertificatePDF = async (session, profile = {}, user = {}) => {
  const toastId = toast.loading('Generating certificate PDF...');
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Outer Dark Border Frame
    doc.setLineWidth(1.5);
    doc.setDrawColor(9, 9, 11);
    doc.rect(10, 10, 277, 190);

    // Inner Teal Accent Frame
    doc.setLineWidth(0.5);
    doc.setDrawColor(6, 182, 212);
    doc.rect(13, 13, 271, 184);

    // Header Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(9, 9, 11);
    doc.text('BEHOLD.', 148.5, 38, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(6, 182, 212);
    doc.text('CERTIFICATE OF COMPLETION', 148.5, 48, { align: 'center' });

    // Decorative Line
    doc.setDrawColor(228, 228, 231);
    doc.line(80, 54, 217, 54);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(113, 113, 122);
    doc.text('This is to certify that', 148.5, 68, { align: 'center' });

    // Recipient Name
    const recipientName = profile?.name || user?.name || session?.clientName || 'Participant';
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(9, 9, 11);
    doc.text(recipientName.toUpperCase(), 148.5, 84, { align: 'center' });

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(113, 113, 122);
    doc.text('has successfully completed a professional consultation session for', 148.5, 98, { align: 'center' });

    // Service Name
    const serviceName = session?.service === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring';
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(6, 182, 212);
    doc.text(serviceName, 148.5, 110, { align: 'center' });

    // Session Advisor & Date
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(82, 82, 91);
    doc.text(`Guided by ${session?.advisorName || 'Consultant Psychologist'} on ${formatDateString(session?.date || new Date())}`, 148.5, 122, { align: 'center' });

    // Footer Signatures & Certificate ID
    doc.line(40, 160, 95, 160);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(39, 39, 42);
    doc.text('Authorized Signature', 67.5, 166, { align: 'center' });
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(113, 113, 122);
    doc.text('BEHOLD Aspire Platform', 67.5, 171, { align: 'center' });

    const certId = `CERT-${(session?.appointmentId || session?.id || Date.now()).toString().slice(-8)}`;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(113, 113, 122);
    doc.text(`ID: ${certId}`, 148.5, 166, { align: 'center' });

    doc.line(202, 160, 257, 160);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(39, 39, 42);
    doc.text('Lead Psychologist', 229.5, 166, { align: 'center' });
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(113, 113, 122);
    doc.text('BEHOLD Academic Board', 229.5, 171, { align: 'center' });

    const _isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      if (_isIOS) {
        window.open(doc.output('bloburl'), '_blank');
      } else {
        doc.save(`Behold_Certificate_${certId}.pdf`);
      }
    toast.success('Certificate downloaded successfully!', { id: toastId });
  } catch (err) {
    console.error(err);
    toast.error('Failed to generate Certificate PDF', { id: toastId });
  }
};

export const downloadConsultationReportPDF = async (session, profile = {}, user = {}) => {
  const toastId = toast.loading('Generating Consultation Report PDF...');
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const displayId = (session?.appointmentId || session?.id || Date.now()).toString().slice(-8);
    const clientName = profile?.name || user?.name || session?.clientName || 'Student';
    const advisorName = session?.advisorName || 'Consultant Psychologist';
    const dateStr = formatDateString(session?.date || new Date());
    const timeStr = session?.time || 'N/A';
    const serviceStr = session?.service === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring';

    // Header Accent Line
    doc.setFillColor(6, 182, 212); // Teal
    doc.rect(0, 0, 210, 8, 'F');

    // Title & Branding
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(9, 9, 11);
    doc.text('BEHOLD.', 20, 24);

    doc.setFontSize(9);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(6, 182, 212);
    doc.text('PSYCHOLOGIST CONSULTATION & GUIDANCE REPORT', 20, 30);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(113, 113, 122);
    doc.text('BEHOLD Aspire Platform — Official Confidential Document', 20, 35);

    // Meta Box
    doc.setFillColor(248, 250, 252);
    doc.rect(20, 42, 170, 28, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(20, 42, 170, 28, 'S');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('STUDENT NAME:', 24, 49);
    doc.text('PSYCHOLOGIST:', 110, 49);
    doc.text('SERVICE & MODE:', 24, 58);
    doc.text('SESSION SCHEDULE:', 110, 58);

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(clientName, 55, 49);
    doc.text(advisorName, 140, 49);
    doc.text(`${serviceStr} (${session?.mode || 'ONLINE'})`, 55, 58);
    doc.text(`${dateStr} at ${timeStr}`, 145, 58);

    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(`REPORT ID: CL-REP-${displayId}`, 24, 66);

    let y = 78;
    const printSection = (title, content) => {
      if (!content || !content.trim()) return;
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(6, 182, 212);
      doc.text(title, 20, y);
      y += 6;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const lines = doc.splitTextToSize(content, 170);
      lines.forEach(line => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 20, y);
        y += 5;
      });
      y += 6;
    };

    const studentReportText = session?.feedback || session?.notes || 'Your psychologist has not entered specific feedback notes for this session yet.';
    printSection('Psychologist Guidance & Assessment Observations:', studentReportText);

    if (session?.nextSession) {
      printSection('Recommended Next Session:', session.nextSession);
    }

    // Footer Stamp
    if (y < 250) {
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 260, 190, 260);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Verified & Issued by BEHOLD Psychological Guidance Board', 105, 266, { align: 'center' });
    }

    const _isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      if (_isIOS) {
        window.open(doc.output('bloburl'), '_blank');
      } else {
        doc.save(`Consultation_Report_${clientName.replace(/\s+/g, '_')}_${displayId}.pdf`);
      }
    toast.success('Consultation Report downloaded successfully!', { id: toastId });
  } catch (err) {
    console.error(err);
    toast.error('Failed to generate Consultation Report PDF', { id: toastId });
  }
};


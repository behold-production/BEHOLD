import jsPDF from 'jspdf';
import { formatDateString } from '../../../shared/utils/dateFormatter';
import toast from 'react-hot-toast';

export const isSessionCompleted = (booking) => {
  if (booking.status === 'CANCELLED') return false;
  if (booking.status === 'COMPLETED' || booking.status === 'EXPIRED') return true;

  if (booking.status === 'CONFIRMED' || booking.status === 'APPROVED' || booking.status === 'PENDING') {
    try {
      const [year, month, day] = booking.date.split('-').map(Number);
      const timeParts = booking.time.split(' ');
      const [hoursStr, minutesStr] = timeParts[0].split(':');
      let hours = Number(hoursStr);
      const minutes = Number(minutesStr);
      const meridiem = timeParts[1];

      if (meridiem === 'PM' && hours < 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;

      const sessionEnd = new Date(year, month - 1, day, hours + 1, minutes);
      return new Date() > sessionEnd;
    } catch (e) {
      console.error("Error checking session completion", e);
    }
  }
  return false;
};

export const parseTimeToMinutes = (timeStr) => {
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

export const formatMinutesToTime = (minutes) => {
  let hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  const hourStr = String(hours).padStart(2, '0');
  const minStr = String(mins).padStart(2, '0');
  return `${hourStr}:${minStr} ${period}`;
};

export const downloadDiagnosticPDF = async (booking) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Top Accent Line
    doc.setFillColor(13, 148, 136); // Teal
    doc.rect(0, 0, 210, 10, 'F');

    // Clinical Header Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text('BEHOLD.', 20, 25);

    doc.setFontSize(9);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('A Personal Development and Mentoring Ecosystem', 20, 30);

    // Document Type Tag
    doc.setFillColor(240, 253, 250); // Light teal bg
    doc.roundedRect(138, 18, 52, 11, 2, 2, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(13, 148, 136); // Teal text
    doc.text('CLINICAL REPORT', 144, 25);

    // Divider
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(20, 36, 190, 36);

    // 1. Counsellor (Practitioner) Details
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('PRACTITIONER DETAILS', 20, 45);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);

    const cName = booking.counsellorName || (booking.counsellor && booking.counsellor.name) || 'Consultant Psychologist';
    const cTitle = (booking.counsellor && booking.counsellor.title) || 'Consultant Psychologist';
    const cEdu = (booking.counsellor && booking.counsellor.education) || 'Professional Degree';
    const cPhone = (booking.counsellor && booking.counsellor.phone) || 'N/A';
    const cEmail = (booking.counsellor && booking.counsellor.email) || 'N/A';

    doc.text(`Name: ${cName}`, 20, 51);
    doc.text(`Title: ${cTitle}`, 20, 56);
    doc.text(`Education: ${cEdu}`, 20, 61);
    doc.text(`Contact: ${cPhone} | ${cEmail}`, 20, 66);

    // 2. Student (Client) Details
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('STUDENT DETAILS', 115, 45);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);

    const sName = booking.studentName || (booking.student && booking.student.name) || 'N/A';
    const sSchool = (booking.student && booking.student.schoolName) || 'N/A';
    const sGrade = (booking.student && booking.student.grade) || 'N/A';
    const sGName = (booking.student && booking.student.guardianName) || 'N/A';
    const sGPhone = (booking.student && booking.student.guardianPhone) || 'N/A';

    doc.text(`Name: ${sName}`, 115, 51);
    doc.text(`School: ${sSchool}`, 115, 56);
    doc.text(`Grade: ${sGrade}`, 115, 61);
    doc.text(`Guardian: ${sGName} (${sGPhone})`, 115, 66);

    // Divider
    doc.line(20, 72, 190, 72);

    // Metadata Info Box
    doc.setFillColor(248, 250, 252);
    doc.rect(20, 77, 170, 15, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.rect(20, 77, 170, 15, 'S');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('REPORT ID:', 24, 82);
    doc.text('SESSION SCHEDULE:', 80, 82);
    doc.text('DATE GENERATED:', 145, 82);

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    const displayId = booking.id ? booking.id.toString().substring(Math.max(0, booking.id.toString().length - 6)) : 'N/A';
    doc.text(`CL-REP-${displayId}`, 24, 88);
    doc.text(`${formatDateString(booking.date)} at ${booking.time}`, 80, 88);
    doc.text(`${formatDateString(new Date())}`, 145, 88);

    // Clinical Notes / Diagnostics Header
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(13, 148, 136); // Teal Rx symbol
    doc.text('Rx', 20, 103);

    doc.setFontSize(11);
    doc.text('CLINICAL ASSESSMENT & DIAGNOSTICS', 27, 103);

    doc.setDrawColor(13, 148, 136);
    doc.setLineWidth(0.3);
    doc.line(20, 105, 190, 105);

    // Auto-pagebreak system
    let y = 112;
    const bottomLimit = 265;

    const printTextSection = (titleText, bodyText, gapBeforeTitle = 10) => {
      if (y + gapBeforeTitle > bottomLimit) {
        doc.addPage();
        doc.setFillColor(13, 148, 136);
        doc.rect(0, 0, 210, 8, 'F');
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(`Clinical Report ID: CL-REP-${displayId} | Continuation Page`, 20, 15);
        doc.line(20, 17, 190, 17);
        y = 25;
      } else {
        y += gapBeforeTitle;
      }
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(titleText, 20, y);
      y += 6;
      
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(8.5);
      
      const lines = doc.splitTextToSize(bodyText, 170);
      for (let i = 0; i < lines.length; i++) {
        if (y > bottomLimit) {
          doc.addPage();
          doc.setFillColor(13, 148, 136);
          doc.rect(0, 0, 210, 8, 'F');
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(148, 163, 184);
          doc.text(`Clinical Report ID: CL-REP-${displayId} | Continuation Page`, 20, 15);
          doc.line(20, 17, 190, 17);
          y = 25;
        }
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.setFontSize(8.5);
        doc.text(lines[i], 20, y);
        y += 4.5;
      }
    };

    const clinicalNotes = booking.notes || 'No clinical/diagnostic notes recorded for this session.';
    printTextSection('Clinical Assessment & Observation Notes:', clinicalNotes, 8);

    const feedbackText = booking.feedback || 'No student-facing feedback or recommendations recorded.';
    printTextSection('Recommendations & Feedback:', feedbackText, 10);

    const hasNextSession = booking.nextSession && 
                           booking.nextSession.trim() !== '' && 
                           booking.nextSession.trim().toLowerCase() !== 'n/a' && 
                           booking.nextSession.trim().toLowerCase() !== 'none' && 
                           booking.nextSession.trim().toLowerCase() !== 'no' && 
                           booking.nextSession.trim().toLowerCase() !== 'null';

    if (hasNextSession) {
      if (y + 12 > bottomLimit) {
        doc.addPage();
        doc.setFillColor(13, 148, 136);
        doc.rect(0, 0, 210, 8, 'F');
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(`Clinical Report ID: CL-REP-${displayId} | Continuation Page`, 20, 15);
        doc.line(20, 17, 190, 17);
        y = 25;
      } else {
        y += 10;
      }
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text('Next Session Approximate Time:', 20, y);
      y += 5.5;

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(8.5);
      doc.text(booking.nextSession.trim(), 20, y);
      y += 5;
    }

    let sigY = y + 18;
    if (sigY > 250) {
      doc.addPage();
      doc.setFillColor(13, 148, 136);
      doc.rect(0, 0, 210, 8, 'F');
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Clinical Report ID: CL-REP-${displayId} | Continuation Page`, 20, 15);
      doc.line(20, 17, 190, 17);
      sigY = 35;
    }

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(130, sigY, 190, sigY);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Authorized Signature', 142, sigY + 5);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`${cName}, ${cTitle}`, 130, sigY + 9, { maxWidth: 60 });

    doc.setFontSize(7.5);
    doc.text('This is a confidential medical-styled diagnostic document issued by the consultant psychologist.', 20, sigY + 18);
    doc.text('Please secure this document. For inquiries, reach out to contact@beholdaspire.com.', 20, sigY + 22);

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Page ${i} of ${totalPages}`, 105, 288, { align: 'center' });
    }

    doc.save(`Clinical_Report_${sName.replace(/\s+/g, '_')}_${displayId}.pdf`);
  } catch (e) {
    console.error(e);
    toast.error("Failed to generate Clinical Diagnostic PDF: " + e.message);
  }
};

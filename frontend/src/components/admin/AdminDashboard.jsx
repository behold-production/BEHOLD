import React, { useState, useEffect } from 'react';
import {
  User, ShieldAlert, Award, Trash, Check, Plus, Lock,
  Settings, KeyRound, BarChart3, LogOut, Search, ShieldCheck,
  Calendar, Clock, Link, AlertCircle, Edit, Video, UserPlus,
  MessageSquare, FileSpreadsheet, HelpCircle, X, ChevronRight, ChevronLeft, Mail, Shield, Menu, Brain, Download, FileText,
  Eye, EyeOff
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { useCustomDialog } from '../../context/CustomDialogContext';
import { formatDateString } from '../../utils/dateFormatter';

function getInitials(name) {
  if (!name) return 'EX';
  const clean = name.trim();
  if (clean.length === 0) return 'EX';
  if (clean.length === 1) return clean.toUpperCase();
  const first = clean[0];
  const last = clean[clean.length - 1];
  return (first + last).toUpperCase();
}

function SkeletonTableRows({ cols }) {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-zinc-900">
          <td colSpan={cols} className="p-4 whitespace-nowrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-800 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-zinc-800 rounded w-1/4" />
                <div className="h-3 bg-zinc-855 rounded w-1/2" />
              </div>
              <div className="h-4 bg-zinc-855 rounded w-20 justify-self-end hidden sm:block" />
              <div className="h-8 bg-zinc-855 rounded w-24 justify-self-end" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

// ─── Reusable Pagination Bar ───────────────────────────────────────────────
function PaginationBar({ total, page, limit, onPageChange, onLimitChange }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safeCurrentPage = Math.min(page, totalPages);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, safeCurrentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const from = total === 0 ? 0 : (safeCurrentPage - 1) * limit + 1;
  const to = Math.min(safeCurrentPage * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 px-1 border-t border-zinc-850 mt-1">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-zinc-500 capitalize ">
          Showing <span className="text-zinc-300 font-bold">{from}–{to}</span> of <span className="text-zinc-300 font-bold">{total}</span>
        </span>
        <select
          value={limit}
          onChange={(e) => { onLimitChange(Number(e.target.value)); onPageChange(1); }}
          className="ml-2 bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm font-bold rounded px-2 py-1 cursor-pointer outline-none focus:border-brand"
        >
          {[5, 10, 25, 50].map(n => (
            <option key={n} value={n}>{n} / page</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage === 1}
          className="px-2 py-1.5 rounded border border-zinc-800 bg-zinc-900 text-xs font-bold capitalize  text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
        >
          Prev
        </button>
        {getPageNumbers().map(n => (
          <button
            key={n}
            onClick={() => onPageChange(n)}
            className={`w-7 h-7 rounded border text-sm font-bold transition cursor-pointer ${n === safeCurrentPage
              ? 'bg-brand border-brand text-zinc-950'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850'
              }`}
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= totalPages}
          className="px-2 py-1.5 rounded border border-zinc-800 bg-zinc-900 text-xs font-bold capitalize  text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
}
import { useAuth } from '../../context/AuthContext';
import LogoutConfirmModal from '../LogoutConfirmModal';
import ApiService from '../../services/api';

const PRIVILEGE_MODULES = [
  {
    id: 'manage_users',
    name: 'Student Management',
    actions: [
      { id: 'view_students', name: 'View Students' },
      { id: 'add_students', name: 'Add Student' },
      { id: 'edit_students', name: 'Edit Student' },
      { id: 'delete_students', name: 'Delete Student' },
      { id: 'verify_students', name: 'Verify Student' }
    ]
  },
  {
    id: 'manage_psychologists',
    name: 'Psychologist Management',
    actions: [
      { id: 'view_psychologists', name: 'View Psychologists' },
      { id: 'add_psychologists', name: 'Add Psychologist' },
      { id: 'edit_psychologists', name: 'Edit Psychologist' },
      { id: 'delete_psychologists', name: 'Delete Psychologist' },
      { id: 'verify_psychologists', name: 'Verify Psychologist' }
    ]
  },
  {
    id: 'manage_bookings',
    name: 'Booking Management',
    actions: [
      { id: 'view_bookings', name: 'View Bookings' },
      { id: 'add_bookings', name: 'Add Booking' },
      { id: 'edit_bookings', name: 'Edit Booking' },
      { id: 'delete_bookings', name: 'Delete Booking' },
      { id: 'verify_bookings', name: 'Verify Booking' }
    ]
  },
  {
    id: 'manage_aptitude',
    name: 'Aptitude Questions',
    actions: [
      { id: 'view_aptitude', name: 'View Questions' },
      { id: 'add_aptitude', name: 'Add Question' },
      { id: 'edit_aptitude', name: 'Edit Question' },
      { id: 'delete_aptitude', name: 'Delete Question' },
      { id: 'verify_aptitude', name: 'Verify Question' }
    ]
  },
  {
    id: 'manage_inquiries',
    name: 'Inquiries & Leads',
    actions: [
      { id: 'view_inquiries', name: 'View Inquiries' },
      { id: 'add_inquiries', name: 'Add Inquiry' },
      { id: 'edit_inquiries', name: 'Edit Inquiry' },
      { id: 'delete_inquiries', name: 'Delete Inquiry' },
      { id: 'verify_inquiries', name: 'Verify Inquiry' }
    ]
  },
  {
    id: 'manage_faqs',
    name: 'FAQ Management',
    actions: [
      { id: 'view_faqs', name: 'View FAQs' },
      { id: 'add_faqs', name: 'Add FAQ' },
      { id: 'edit_faqs', name: 'Edit FAQ' },
      { id: 'delete_faqs', name: 'Delete FAQ' },
      { id: 'verify_faqs', name: 'Verify FAQ' }
    ]
  },
  {
    id: 'manage_settings',
    name: 'System Settings',
    actions: [
      { id: 'view_settings', name: 'View Settings' },
      { id: 'add_settings', name: 'Add Setting' },
      { id: 'edit_settings', name: 'Edit Setting' },
      { id: 'delete_settings', name: 'Delete Setting' },
      { id: 'verify_settings', name: 'Verify Setting' }
    ]
  },
  {
    id: 'manage_testresults',
    name: 'Test Results',
    actions: [
      { id: 'view_testresults', name: 'View Results' },
      { id: 'add_testresults', name: 'Add Result' },
      { id: 'edit_testresults', name: 'Edit Result' },
      { id: 'delete_testresults', name: 'Delete Result' },
      { id: 'verify_testresults', name: 'Verify Result' }
    ]
  },
  {
    id: 'manage_staff',
    name: 'Staff & Roles',
    actions: [
      { id: 'view_staff', name: 'View Staff' },
      { id: 'add_staff', name: 'Add Staff' },
      { id: 'edit_staff', name: 'Edit Staff' },
      { id: 'delete_staff', name: 'Delete Staff' },
      { id: 'verify_staff', name: 'Verify Staff' }
    ]
  }
];

export default function AdminDashboard({ setView }) {
  const { showAlert, showConfirm, showPrompt } = useCustomDialog();
  const getLocalTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleExportPDF = async (tableId, title) => {
    try {
      const element = document.getElementById(tableId);
      if (!element) {
        await showAlert("Table not found for export.");
        return;
      }
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#18181b' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${title.replace(/\s+/g, '_')}_${getLocalTodayString()}.pdf`);
    } catch (err) {
      await showAlert("Failed to export PDF: " + err.message);
    }
  };

  const handleExportImage = async (tableId, title) => {
    try {
      const element = document.getElementById(tableId);
      if (!element) {
        await showAlert("Table not found for export.");
        return;
      }
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#18181b' });
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '_')}_${getLocalTodayString()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      await showAlert("Failed to export Image: " + err.message);
    }
  };

  const downloadPDFReceipt = async (booking) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Find student details from usersDb
      const student = usersDb.find(u => u.id === booking.userId);
      const clientName = booking.userName || (student ? student.name : 'Student');
      const clientEmail = student ? student.email : 'N/A';
      const clientPhone = student ? student.phone : 'N/A';

      const service = booking.service === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring';
      const mode = booking.mode === 'ONLINE' ? 'Video Call' : booking.mode === 'DOOR_STEP' ? 'Home Visit' : 'At Center';

      // GST and Amount Math
      const amountPaid = typeof booking.amountPaid === 'number' ? booking.amountPaid : 1200;
      const appliedDiscount = booking.appliedDiscount || 0;
      const totalBeforeDiscount = amountPaid + appliedDiscount;
      const gstEnabled = settingsForm.gstEnabled === true;
      const gstPercent = gstEnabled ? (Number(settingsForm.gstPercent) || 0) : 0;
      
      let baseFeeVal = totalBeforeDiscount;
      let gstAmountVal = 0;
      if (gstEnabled && gstPercent > 0) {
        baseFeeVal = Math.round(totalBeforeDiscount / (1 + gstPercent / 100));
        gstAmountVal = totalBeforeDiscount - baseFeeVal;
      }

      // Draw PDF Receipt
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
      doc.text(`Name: ${clientName}`, 20, 52);
      doc.text(`Email: ${clientEmail}`, 20, 58);
      doc.text(`Phone: ${clientPhone}`, 20, 64);

      // Receipt Metadata info
      const displayId = booking.id ? booking.id.toString().substring(Math.max(0, booking.id.toString().length - 6)) : 'N/A';
      doc.text(`Receipt ID: REC-${displayId}`, 120, 52);
      doc.text(`Booking ID: SB-${booking.id || 'N/A'}`, 120, 58);
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
      doc.text(`Service Type: ${service}`, 20, 86);
      doc.text(`Advisor Assigned: ${booking.advisorName || 'Advisor'} (${booking.advisorRole || 'Consultant'})`, 20, 92);
      doc.text(`Session Schedule: ${formatDateString(booking.date)} at ${booking.time}`, 20, 98);
      doc.text(`Session Mode: ${mode}`, 20, 104);

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

      // 1. Base fee
      doc.text(`${service} Session Booking Fee`, 24, tableY);
      doc.text(`Rs. ${baseFeeVal.toFixed(2)}`, 160, tableY);
      tableY += 8;

      // 2. GST (if enabled)
      if (gstAmountVal > 0) {
        doc.text(`GST (${gstPercent}%)`, 24, tableY);
        doc.text(`Rs. ${gstAmountVal.toFixed(2)}`, 160, tableY);
        tableY += 8;
      }

      // 3. Discount (if applied)
      if (appliedDiscount > 0) {
        doc.setTextColor(22, 163, 74); // green
        doc.text(`Promo Discount Code`, 24, tableY);
        doc.text(`-Rs. ${appliedDiscount.toFixed(2)}`, 160, tableY);
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
      doc.text(`INR ${amountPaid.toFixed(2)}`, 160, tableY + 2);
      
      tableY += 16;

      // Google Meet Session Link if Online
      if (booking.meetLink && booking.meetLink !== 'LOCKED') {
        doc.setFillColor(240, 253, 250); // Light teal bg
        doc.roundedRect(20, tableY, 170, 18, 2, 2, 'F');
        
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(13, 148, 136);
        doc.text('Google Meet Session Link (Online Video Call):', 25, tableY + 6);
        
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(6, 182, 212); // blue-link
        doc.text(booking.meetLink, 25, tableY + 12);
        
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
      doc.save(`Behold_Session_Receipt_${booking.id}.pdf`);
    } catch (e) {
      console.error(e);
      await showAlert("Failed to generate PDF receipt: " + e.message);
    }
  };

  const downloadDiagnosticPDF = async (booking) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Colors
      const brandDark = '#0f172a'; // slate-900
      const brandTeal = '#0d9488'; // teal-600
      const textGray = '#4b5563'; // gray-600

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

      // 1. Counsellor (Practitioner) Details - Left side
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('PRACTITIONER DETAILS', 20, 45);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105); // slate-600

      const cName = booking.counsellorName || (booking.counsellor && booking.counsellor.name) || 'Consultant Psychologist';
      const cTitle = (booking.counsellor && booking.counsellor.title) || 'Consultant Psychologist';
      const cEdu = (booking.counsellor && booking.counsellor.education) || 'Professional Degree';
      const cPhone = (booking.counsellor && booking.counsellor.phone) || 'N/A';
      const cEmail = (booking.counsellor && booking.counsellor.email) || 'N/A';

      doc.text(`Name: ${cName}`, 20, 51);
      doc.text(`Title: ${cTitle}`, 20, 56);
      doc.text(`Education: ${cEdu}`, 20, 61);
      doc.text(`Contact: ${cPhone} | ${cEmail}`, 20, 66);

      // 2. Student (Client) Details - Right side
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
      doc.setFillColor(248, 250, 252); // slate-50 bg
      doc.rect(20, 77, 170, 15, 'F');
      doc.setDrawColor(241, 245, 249);
      doc.rect(20, 77, 170, 15, 'S');

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // slate-500
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

      // Section Content Auto-Pagebreak System
      let y = 112;
      const bottomLimit = 265;

      const printTextSection = (titleText, bodyText, gapBeforeTitle = 10) => {
        // Check if title fits on current page
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
          // Restore font style for text lines after page break
          doc.setFont('Helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
          doc.setFontSize(8.5);

          doc.text(lines[i], 20, y);
          y += 4.5;
        }
      };

      // 1. Clinical Assessment Notes
      const clinicalNotes = booking.notes || 'No clinical/diagnostic notes recorded for this session.';
      printTextSection('Clinical Assessment & Observation Notes:', clinicalNotes, 8);

      // 2. Recommendations & Feedback
      const feedbackText = booking.feedback || 'No student-facing feedback or recommendations recorded.';
      printTextSection('Recommendations & Feedback:', feedbackText, 10);

      // 3. Next Session (Optional)
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

      // Footer / Prescription style signature line
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

      doc.setDrawColor(203, 213, 225); // slate-300
      doc.setLineWidth(0.3);
      doc.line(130, sigY, 190, sigY);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text('Authorized Signature', 142, sigY + 5);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`${cName}, ${cTitle}`, 130, sigY + 9, { maxWidth: 60 });

      // Footer Notice
      doc.setFontSize(7.5);
      doc.text('This is a confidential medical-styled diagnostic document issued by the consultant psychologist.', 20, sigY + 18);
      doc.text('Please secure this document. For inquiries, reach out to contact@beholdaspire.com.', 20, sigY + 22);

      // Post-process: Add centered page numbers on all pages
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
      await showAlert("Failed to generate Clinical Diagnostic PDF: " + e.message);
    }
  };

  const { user, login, register, logout, isLoading } = useAuth();

  // Tab Section: default to overview or users if sub-admin
  const [currentSection, setCurrentSection] = useState('overview');
  const [activeStatHighlight, setActiveStatHighlight] = useState(null);
  const [overviewActivityTab, setOverviewActivityTab] = useState('bookings');
  const [selectedOverviewBooking, setSelectedOverviewBooking] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState(null);

  // List states
  const [usersDb, setUsersDb] = useState([]);
  const [bookingsDb, setBookingsDb] = useState([]);
  const [inquiriesDb, setInquiriesDb] = useState([]);
  const [testResultsDb, setTestResultsDb] = useState([]);
  const [faqsDb, setFaqsDb] = useState([]);
  const [aptitudeQuestionsDb, setAptitudeQuestionsDb] = useState([]);
  const [rolesDb, setRolesDb] = useState([]);
  const [isDbLoading, setIsDbLoading] = useState(true);

  // Custom role title manager states
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [activeRoleTab, setActiveRoleTab] = useState('roles');

  const [newRolePermissions, setNewRolePermissions] = useState({});
  const [roleError, setRoleError] = useState('');
  const [roleSuccess, setRoleSuccess] = useState('');
  const [roleToDelete, setRoleToDelete] = useState(null);

  // Search terms
  const [searchUser, setSearchUser] = useState('');
  const [searchPsy, setSearchPsy] = useState('');
  const [psyFilter, setPsyFilter] = useState('all');
  const [searchInquiry, setSearchInquiry] = useState('');
  const [searchTestResult, setSearchTestResult] = useState('');
  const [searchBooking, setSearchBooking] = useState('');
  const [searchAptitude, setSearchAptitude] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');

  // Pagination & Lazy Loading States
  const [studentPage, setStudentPage] = useState(1);
  const [studentLimit, setStudentLimit] = useState(10);

  const [psyPage, setPsyPage] = useState(1);
  const [psyLimit, setPsyLimit] = useState(10);

  const [bookingPage, setBookingPage] = useState(1);
  const [bookingLimit, setBookingLimit] = useState(10);

  const [inquiryPage, setInquiryPage] = useState(1);
  const [inquiryLimit, setInquiryLimit] = useState(10);

  const [aptitudePage, setAptitudePage] = useState(1);
  const [aptitudeLimit, setAptitudeLimit] = useState(10);

  // Reset page pagination on search/filter mutations
  useEffect(() => {
    setTimeout(() => setStudentPage(1), 0);
  }, [searchUser]);

  useEffect(() => {
    setTimeout(() => setPsyPage(1), 0);
  }, [searchPsy]);

  useEffect(() => {
    setTimeout(() => setBookingPage(1), 0);
  }, [searchBooking, bookingStatusFilter]);

  useEffect(() => {
    setTimeout(() => setInquiryPage(1), 0);
  }, [searchInquiry]);

  useEffect(() => {
    setTimeout(() => setAptitudePage(1), 0);
  }, [searchAptitude]);

  // FAQ Modal/Form states
  const [isAddFaqOpen, setIsAddFaqOpen] = useState(false);
  const [isEditFaqOpen, setIsEditFaqOpen] = useState(false);
  const [faqForm, setFaqForm] = useState({ index: -1, question: '', answer: '' });
  const [faqFormError, setFaqFormError] = useState('');
  const [faqFormSuccess, setFaqFormSuccess] = useState('');

  // Aptitude Form states
  const [isAddAptitudeOpen, setIsAddAptitudeOpen] = useState(false);
  const [isEditAptitudeOpen, setIsEditAptitudeOpen] = useState(false);
  const [aptitudeForm, setAptitudeForm] = useState({
    id: '',
    question: '',
    category: 'Logical',
    options: [
      { text: '', weight: 1 },
      { text: '', weight: 1 },
      { text: '', weight: 1 },
      { text: '', weight: 1 }
    ],
    isActive: true
  });
  const [aptitudeFormError, setAptitudeFormError] = useState('');
  const [aptitudeFormSuccess, setAptitudeFormSuccess] = useState('');

  // Login Gate form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Sub-admin creation state
  const [subAdminForm, setSubAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    roleName: ''
  });
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [subAdminError, setSubAdminError] = useState('');
  const [subAdminSuccess, setSubAdminSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Modals / Add / Edit states
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [userForm, setUserForm] = useState({ id: '', name: '', email: '', password: '', phone: '', schoolName: '', grade: '', guardianName: '', guardianPhone: '', groupCode: '', profilePic: '' });
  const [userFormError, setUserFormError] = useState('');
  const [userFormSuccess, setUserFormSuccess] = useState('');
  const [userProfilePicFile, setUserProfilePicFile] = useState(null);
  const [isUserPicUploading, setIsUserPicUploading] = useState(false);
  const userProfilePicRef = React.useRef(null);

  const [isAddPsyOpen, setIsAddPsyOpen] = useState(false);
  const [isEditPsyOpen, setIsEditPsyOpen] = useState(false);
  const [psyForm, setPsyForm] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    education: '',
    specialties: '',
    price: '',
    lang: '',
    bio: '',
    defaultMeetLink: '',
    phone: '',
    hours: 0,
    modes: ['ONLINE', 'OFFLINE', 'DOOR_STEP'],
    title: 'Consultant Psychologist',
    profilePic: '',
    isTopFive: false
  });
  const [psyFormError, setPsyFormError] = useState('');
  const [psyFormSuccess, setPsyFormSuccess] = useState('');
  const [psyProfilePicFile, setPsyProfilePicFile] = useState(null);
  const [isPsyPicUploading, setIsPsyPicUploading] = useState(false);
  const psyProfilePicRef = React.useRef(null);

  // Admin Availability state declarations
  const [adminActiveDays, setAdminActiveDays] = useState({
    1: true, 2: true, 3: true, 4: true, 5: true, 6: false, 0: false
  });
  const [adminAvailableSlots, setAdminAvailableSlots] = useState([]);
  const [adminAllSlots, setAdminAllSlots] = useState([]);
  const [adminCustomHour, setAdminCustomHour] = useState('09');
  const [adminCustomMinute, setAdminCustomMinute] = useState('00');
  const [adminCustomPeriod, setAdminCustomPeriod] = useState('AM');
  const [adminFromHour, setAdminFromHour] = useState('09');
  const [adminFromMinute, setAdminFromMinute] = useState('00');
  const [adminFromPeriod, setAdminFromPeriod] = useState('AM');
  const [adminToHour, setAdminToHour] = useState('05');
  const [adminToMinute, setAdminToMinute] = useState('00');
  const [adminToPeriod, setAdminToPeriod] = useState('PM');

  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);
  const [isEditBookingOpen, setIsEditBookingOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    id: '',
    userId: '',
    advisorId: '',
    service: 'counselling',
    mode: 'ONLINE',
    date: getLocalTodayString(),
    time: '',
    meetLink: '',
    status: 'CONFIRMED'
  });
  const [bookingFormError, setBookingFormError] = useState('');
  const [bookingFormSuccess, setBookingFormSuccess] = useState('');

  // View modals states
  const [viewingStudent, setViewingStudent] = useState(null);
  const [viewingPsychologist, setViewingPsychologist] = useState(null);
  const [editingSubAdmin, setEditingSubAdmin] = useState(null);

  // Admin CIGI management state
  const [adminCigiFile, setAdminCigiFile] = useState(null);
  const [adminCigiDate, setAdminCigiDate] = useState('');
  const [adminCigiTime, setAdminCigiTime] = useState('');
  const [adminCigiNote, setAdminCigiNote] = useState('');
  const [adminCigiEditingId, setAdminCigiEditingId] = useState(null);
  const [isAdminCigiUploading, setIsAdminCigiUploading] = useState(false);
  const adminCigiFileInputRef = React.useRef(null);

  const handleAdminCigiUpload = async (e) => {
    e.preventDefault();
    if (!viewingStudent) return;
    if (!adminCigiFile && !adminCigiEditingId) {
      await showAlert('Please select a file to upload');
      return;
    }

    if (adminCigiFile) {
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
      const fileExt = adminCigiFile.name.split('.').pop().toLowerCase();
      if (!allowedExtensions.includes(fileExt)) {
        await showAlert('Only JPG, JPEG, PNG, and PDF files are allowed.');
        return;
      }
    }

    setIsAdminCigiUploading(true);
    try {
      const formData = new FormData();
      if (adminCigiFile) {
        formData.append('file', adminCigiFile);
      }
      formData.append('testDate', adminCigiDate);
      formData.append('testTime', adminCigiTime);
      formData.append('note', adminCigiNote);

      let res;
      if (adminCigiEditingId) {
        res = await ApiService.adminUpdateCigiResult(viewingStudent.id, adminCigiEditingId, formData);
      } else {
        res = await ApiService.adminUploadCigiResult(viewingStudent.id, formData);
      }

      if (res.success) {
        await showAlert(adminCigiEditingId ? 'CIGI result updated successfully' : 'CIGI result uploaded successfully');

        // Update local database list
        const updatedUser = res.data;
        setUsersDb(prev => prev.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u));

        // Update modal state
        setViewingStudent(prev => prev && prev.id === updatedUser.id ? { ...prev, ...updatedUser } : prev);

        // Reset inputs
        setAdminCigiFile(null);
        setAdminCigiDate('');
        setAdminCigiTime('');
        setAdminCigiNote('');
        setAdminCigiEditingId(null);
        if (adminCigiFileInputRef.current) adminCigiFileInputRef.current.value = '';
      }
    } catch (err) {
      await showAlert(err.message || 'Failed to manage CIGI result');
    } finally {
      setIsAdminCigiUploading(false);
    }
  };

  const handleAdminCigiDelete = async (resultId) => {
    if (!viewingStudent) return;
    if (!await showConfirm('Are you sure you want to delete this CIGI result?')) return;
    try {
      const res = await ApiService.adminDeleteCigiResult(viewingStudent.id, resultId);
      if (res.success) {
        await showAlert('CIGI result deleted successfully');
        const updatedUser = res.data;
        setUsersDb(prev => prev.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u));
        setViewingStudent(prev => prev && prev.id === updatedUser.id ? { ...prev, ...updatedUser } : prev);
      }
    } catch (err) {
      await showAlert(err.message || 'Failed to delete CIGI result');
    }
  };

  const handleAdminStartEditCigi = (result) => {
    setAdminCigiEditingId(result.id);
    setAdminCigiDate(result.testDate || '');
    setAdminCigiTime(result.testTime || '');
    setAdminCigiNote(result.note || '');
    setAdminCigiFile(null);
    if (adminCigiFileInputRef.current) adminCigiFileInputRef.current.value = '';
  };

  const handleAdminCancelEditCigi = () => {
    setAdminCigiEditingId(null);
    setAdminCigiDate('');
    setAdminCigiTime('');
    setAdminCigiNote('');
    setAdminCigiFile(null);
    if (adminCigiFileInputRef.current) adminCigiFileInputRef.current.value = '';
  };


  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Edit sub-admin: uses the new role-based permission system
  const [editSubAdminRoleName, setEditSubAdminRoleName] = useState('');
  const [editSubAdminPermissionsObj, setEditSubAdminPermissionsObj] = useState({});
  const [editSubAdminError, setEditSubAdminError] = useState('');
  const [editSubAdminSuccess, setEditSubAdminSuccess] = useState('');

  // Bookings enhancements
  const [selectedBookingIds, setSelectedBookingIds] = useState([]);

  // Site Settings state
  const [settingsForm, setSettingsForm] = useState({
    heroTitle: '',
    heroSub: '',
    whatsapp: '',
    contactEmail: '',
    siteName: '',
    siteCopyright: '',
    showBanner: false,
    bannerNotice: '',
    termsOfUse: '',
    privacyPolicy: '',
    cdatGroupCode: '',
    gstEnabled: false,
    gstPercent: 0,
    promoCodes: []
  });
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Inquiry notes temporary state
  const [inquiryNotesText, setInquiryNotesText] = useState({});

  // Profile drawer + logout confirmation
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const reloadData = async () => {
    if (!user || user?.role?.toUpperCase() !== 'ADMIN') return;
    const hasCache = ApiService.hasCachedData && ApiService.hasCachedData('/admin/users');
    if (usersDb.length === 0 && !hasCache) {
      setIsDbLoading(true);
    }
    try {
      const [
        usersRes,
        counsellorsRes,
        bookingsRes,
        inquiriesRes,
        testResultsRes,
        faqsRes,
        rolesRes,
        settingsRes,
        aptitudeRes
      ] = await Promise.all([
        ApiService.getAdminUsers(),
        ApiService.getAdminCounsellors(),
        ApiService.getAdminAppointments(),
        ApiService.getAdminInquiries(),
        ApiService.getTestResults(),
        ApiService.getAdminFaqs(),
        ApiService.getRoles(),
        ApiService.getAdminSettings(),
        ApiService.getAdminAptitudeQuestions()
      ]);

      if (usersRes.success && counsellorsRes.success) {
        const cleanCounsellors = (counsellorsRes.data || []).map(c => ({
          ...c,
          role: 'PSYCHOLOGIST',
          verified: c.isVerified
        }));
        const combinedUsers = [
          ...(usersRes.data || []).map(u => ({ ...u, role: u.role ? u.role.toUpperCase() : 'USER' })),
          ...cleanCounsellors
        ];
        setUsersDb(combinedUsers);
      }

      if (bookingsRes.success && bookingsRes.data) {
        const cleanBookings = bookingsRes.data.map(b => ({
          ...b,
          userName: b.studentName,
          advisorId: b.counsellorId || b.advisorId,
          advisorName: b.counsellorName || b.advisorName,
          advisorRole: b.advisorRole || 'Consultant Psychologist'
        }));
        setBookingsDb(cleanBookings);
      }

      if (inquiriesRes.success && inquiriesRes.data) {
        setInquiriesDb(inquiriesRes.data);
      }

      if (testResultsRes.success && testResultsRes.data) {
        setTestResultsDb(testResultsRes.data);
      }

      if (faqsRes.success && faqsRes.data) {
        setFaqsDb(faqsRes.data);
      }

      if (aptitudeRes && aptitudeRes.success && aptitudeRes.data) {
        setAptitudeQuestionsDb(aptitudeRes.data);
      }

      if (rolesRes.success && rolesRes.data) {
        const roles = rolesRes.data;
        setRolesDb(roles);
        if (roles.length > 0) {
          setSubAdminForm(prev => {
            const currentRoleExists = roles.some(r => r.name === prev.roleName);
            if (!prev.roleName || !currentRoleExists) {
              const defaultRole = roles[0];
              const nextPerms = defaultRole.permissions || [];
              setTimeout(() => setSelectedPermissions(nextPerms), 0);
              return { ...prev, roleName: defaultRole.name };
            } else {
              const currentRole = roles.find(r => r.name === prev.roleName);
              if (currentRole) {
                setTimeout(() => setSelectedPermissions(currentRole.permissions || []), 0);
              }
            }
            return prev;
          });
        } else {
          setSubAdminForm(prev => ({ ...prev, roleName: '' }));
          setTimeout(() => setSelectedPermissions([]), 0);
        }
      }

      if (settingsRes.success && settingsRes.data) {
        const settings = settingsRes.data;
        setSettingsForm({
          heroTitle: settings.heroTitle || 'Bridging You \nTo Your {True Growth.}',
          heroSub: settings.heroSub || 'Professional psychological counseling, aptitude assessment, and career mentorship designed to help individuals thrive with confidence and purpose.',
          whatsapp: settings.whatsapp || 'https://wa.me/919497174011',
          contactEmail: settings.contactEmail || 'support@behold.com',
          siteName: settings.siteName || 'BEHOLD',
          siteCopyright: settings.siteCopyright || '© BEHOLD Ltd., 2026. All rights reserved.',
          showBanner: settings.showBanner !== undefined ? settings.showBanner : false,
          bannerNotice: settings.bannerNotice || '🚨 Maintenance Notice: Schedulers undergoing maintenance tonight between 12:00 AM - 02:00 AM IST.',
          termsOfUse: settings.termsOfUse || '',
          privacyPolicy: settings.privacyPolicy || '',
          cdatGroupCode: settings.cdatGroupCode || 'cdat@behold',
          enablePsychology: settings.enablePsychology !== undefined ? settings.enablePsychology : true,
          gstEnabled: settings.gstEnabled !== undefined ? settings.gstEnabled : false,
          gstPercent: settings.gstPercent !== undefined ? settings.gstPercent : 0,
          promoCodes: settings.promoCodes || []
        });
      }
    } catch (error) {
      console.error("Error reloading admin dashboard data:", error);
    } finally {
      setIsDbLoading(false);
    }
  };

  const getAdvisorSlotsForBookingForm = () => {
    let slots = [];
    if (bookingForm.advisorId) {
      const psy = usersDb.find(u => u.id === bookingForm.advisorId);
      if (psy && psy.availability) {
        if (psy.availability.availableSlots) {
          slots = psy.availability.availableSlots;
        } else if (Array.isArray(psy.availability)) {
          slots = psy.availability;
        } else {
          const bookingDate = new Date(bookingForm.date);
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const dayName = bookingDate.getDay();
          slots = psy.availability[dayName] || [];
        }
      }
    }

    if (slots.length > 0) {
      slots = slots.filter(slot => {
        const isAlreadyBooked = bookingsDb.some(b =>
          b.advisorId === bookingForm.advisorId &&
          b.date === bookingForm.date &&
          b.time === slot &&
          (b.status === 'CONFIRMED' || b.status === 'PENDING')
        );
        return !isAlreadyBooked;
      });
    }

    if (bookingForm.time && !slots.includes(bookingForm.time)) {
      slots.push(bookingForm.time);
    }
    return slots;
  };

  useEffect(() => {
    setTimeout(() => {
      reloadData();
    }, 0);
  }, [user]);

  // Determine sub-admin permissions
  const isSuperAdmin = user?.role?.toUpperCase() === 'ADMIN' && !user?.permissions;
  const _p = user?.permissions || [];

  // Module-level access (broad) — legacy keys OR any action key in that module
  const hasUserPermission = isSuperAdmin || _p.includes('MANAGE_USERS') || _p.includes('manage_users') ||
    ['view_students','add_students','edit_students','delete_students','verify_students'].some(k => _p.includes(k));
  const hasPsyPermission = isSuperAdmin || _p.includes('MANAGE_PSYCHOLOGISTS') || _p.includes('manage_psychologists') ||
    ['view_psychologists','add_psychologists','edit_psychologists','delete_psychologists','verify_psychologists'].some(k => _p.includes(k));
  const hasBookingPermission = isSuperAdmin || _p.includes('MANAGE_BOOKINGS') || _p.includes('manage_bookings') ||
    ['view_bookings','add_bookings','edit_bookings','delete_bookings','verify_bookings'].some(k => _p.includes(k));

  // Granular per-action permission helpers
  const _hasModuleOrAction = (legacyKey, actionKey) =>
    isSuperAdmin || _p.includes(legacyKey) || _p.includes(legacyKey.toLowerCase().replace('manage_', 'manage_')) || _p.includes(actionKey);

  const canAddStudents    = isSuperAdmin || _p.includes('MANAGE_USERS') || _p.includes('manage_users') || _p.includes('add_students');
  const canEditStudents   = isSuperAdmin || _p.includes('MANAGE_USERS') || _p.includes('manage_users') || _p.includes('edit_students');
  const canDeleteStudents = isSuperAdmin || _p.includes('MANAGE_USERS') || _p.includes('manage_users') || _p.includes('delete_students');
  const canVerifyStudents = isSuperAdmin || _p.includes('MANAGE_USERS') || _p.includes('manage_users') || _p.includes('verify_students');

  const canAddPsy    = isSuperAdmin || _p.includes('MANAGE_PSYCHOLOGISTS') || _p.includes('manage_psychologists') || _p.includes('add_psychologists');
  const canEditPsy   = isSuperAdmin || _p.includes('MANAGE_PSYCHOLOGISTS') || _p.includes('manage_psychologists') || _p.includes('edit_psychologists');
  const canDeletePsy = isSuperAdmin || _p.includes('MANAGE_PSYCHOLOGISTS') || _p.includes('manage_psychologists') || _p.includes('delete_psychologists');
  const canVerifyPsy = isSuperAdmin || _p.includes('MANAGE_PSYCHOLOGISTS') || _p.includes('manage_psychologists') || _p.includes('verify_psychologists');

  const canAddBookings    = isSuperAdmin || _p.includes('MANAGE_BOOKINGS') || _p.includes('manage_bookings') || _p.includes('add_bookings');
  const canEditBookings   = isSuperAdmin || _p.includes('MANAGE_BOOKINGS') || _p.includes('manage_bookings') || _p.includes('edit_bookings');
  const canDeleteBookings = isSuperAdmin || _p.includes('MANAGE_BOOKINGS') || _p.includes('manage_bookings') || _p.includes('delete_bookings');

  // Automatically switch tab if sub-admin doesn't have permission for Overview
  useEffect(() => {
    if (user && user?.role?.toUpperCase() === 'ADMIN') {
      if (!isSuperAdmin) {
        if (hasUserPermission) {
          setTimeout(() => setCurrentSection('users'), 0);
        } else if (hasPsyPermission) {
          setTimeout(() => setCurrentSection('psychologists'), 0);
        } else if (hasBookingPermission) {
          setTimeout(() => setCurrentSection('bookings'), 0);
        } else {
          setTimeout(() => setCurrentSection('users'), 0);
        }
      } else {
        setTimeout(() => setCurrentSection('overview'), 0);
      }
    }
  }, [user, isSuperAdmin, hasUserPermission, hasPsyPermission, hasBookingPermission]);

  const handleNavClick = (section) => {
    setCurrentSection(section);
    setIsMobileMenuOpen(false);
  };

  // Admin login handler
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const loggedInUser = await login(loginEmail, loginPassword);
      if (loggedInUser?.role?.toUpperCase() !== 'ADMIN') {
        logout();
        setLoginError('Access Denied: Account does not have Administrator privileges.');
      }
    } catch (err) {
      setLoginError(err.message || 'Invalid administrator credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Student Actions
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!hasUserPermission) {
      setUserFormError("Access Denied: You do not have permission to manage students.");
      return;
    }
    setUserFormError('');
    setUserFormSuccess('');

    if (!userForm.name.trim() || !userForm.email.trim() || !userForm.password) {
      setUserFormError("All fields are required.");
      return;
    }

    try {
      await ApiService.createAdminUser(
        userForm.name.trim(),
        userForm.email.trim(),
        userForm.password
      );
      setUserFormSuccess("Student created successfully!");
      setUserForm({ id: '', name: '', email: '', password: '', phone: '', schoolName: '', grade: '', guardianName: '', guardianPhone: '', groupCode: '', profilePic: '' });
      setUserProfilePicFile(null);
      reloadData();
      setTimeout(() => {
        setIsAddUserOpen(false);
        setUserFormSuccess('');
      }, 1500);
    } catch (err) {
      setUserFormError(err.message || "Failed to create user.");
    }
  };

  const handleOpenEditUser = (student) => {
    setUserForm({
      id: student.id,
      name: student.name,
      email: student.email,
      password: student.password || '',
      phone: student.phone || '',
      schoolName: student.schoolName || '',
      grade: student.grade || '',
      guardianName: student.guardianName || '',
      guardianPhone: student.guardianPhone || '',
      groupCode: student.groupCode || '',
      profilePic: student.profilePic || student.image || ''
    });
    setUserProfilePicFile(null);
    setUserFormError('');
    setUserFormSuccess('');
    setIsEditUserOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!hasUserPermission) {
      setUserFormError("Access Denied: You do not have permission to manage students.");
      return;
    }
    setUserFormError('');
    setUserFormSuccess('');

    if (!userForm.name.trim() || !userForm.email.trim()) {
      setUserFormError("Name and Email are required.");
      return;
    }

    try {
      await ApiService.updateAdminUser(
        userForm.id,
        userForm.name.trim(),
        userForm.email.trim(),
        userForm.password || undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        {
          phone: userForm.phone,
          schoolName: userForm.schoolName,
          grade: userForm.grade,
          guardianName: userForm.guardianName,
          guardianPhone: userForm.guardianPhone,
          groupCode: userForm.groupCode
        }
      );
      if (userProfilePicFile) {
        setIsUserPicUploading(true);
        const fd = new FormData();
        fd.append('profilePic', userProfilePicFile);
        await ApiService.adminUpdateUserProfilePic(userForm.id, fd);
        setIsUserPicUploading(false);
      }
      setUserFormSuccess("Student details updated!");
      setUserProfilePicFile(null);
      reloadData();
      setTimeout(() => {
        setIsEditUserOpen(false);
        setUserFormSuccess('');
      }, 1500);
    } catch (err) {
      setIsUserPicUploading(false);
      setUserFormError(err.message || "Failed to update user.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!hasUserPermission) {
      await showAlert("Access Denied: You do not have permission to manage students.");
      return;
    }
    if (!await showConfirm("Are you sure you want to delete this account?")) return;
    try {
      await ApiService.deleteAdminUser(userId);
      reloadData();
    } catch (err) {
      await showAlert(err.message || "Failed to delete user.");
    }
  };

  const handleGenerateResetToken = async (email) => {
    try {
      const res = await ApiService.request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      if (res.success && res.resetToken) {
        const link = window.location.origin + '/reset-password?token=' + res.resetToken;
        await showPrompt("Password reset link generated. Copy it below to share:", link);
      } else {
        await showAlert(res.message || "Failed to generate token.");
      }
    } catch (err) {
      await showAlert(err.message || "An error occurred.");
    }
  };

  // Aptitude Questions Actions
  const handleCreateAptitudeQuestion = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      setAptitudeFormError("Access Denied: Only super admins can manage tests.");
      return;
    }
    setAptitudeFormError('');
    setAptitudeFormSuccess('');

    if (!aptitudeForm.question.trim() || !aptitudeForm.category) {
      setAptitudeFormError("Question and category are required.");
      return;
    }

    try {
      await ApiService.createAptitudeQuestion({
        question: aptitudeForm.question,
        category: aptitudeForm.category,
        options: aptitudeForm.options,
        isActive: aptitudeForm.isActive
      });
      setAptitudeFormSuccess("Question created successfully!");
      reloadData();
      setTimeout(() => {
        setIsAddAptitudeOpen(false);
        setAptitudeFormSuccess('');
      }, 1500);
    } catch (err) {
      setAptitudeFormError(err.message || "Failed to create question.");
    }
  };

  const handleOpenEditAptitudeQuestion = (q) => {
    setAptitudeForm({
      id: q.id,
      question: q.question,
      category: q.category,
      options: q.options || [
        { text: '', weight: 1 },
        { text: '', weight: 1 },
        { text: '', weight: 1 },
        { text: '', weight: 1 }
      ],
      isActive: q.isActive !== undefined ? q.isActive : true
    });
    setAptitudeFormError('');
    setAptitudeFormSuccess('');
    setIsEditAptitudeOpen(true);
  };

  const handleUpdateAptitudeQuestion = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      setAptitudeFormError("Access Denied: Only super admins can manage tests.");
      return;
    }
    setAptitudeFormError('');
    setAptitudeFormSuccess('');

    if (!aptitudeForm.question.trim() || !aptitudeForm.category) {
      setAptitudeFormError("Question and category are required.");
      return;
    }

    try {
      await ApiService.updateAptitudeQuestion(aptitudeForm.id, {
        question: aptitudeForm.question,
        category: aptitudeForm.category,
        options: aptitudeForm.options,
        isActive: aptitudeForm.isActive
      });
      setAptitudeFormSuccess("Question updated!");
      reloadData();
      setTimeout(() => {
        setIsEditAptitudeOpen(false);
        setAptitudeFormSuccess('');
      }, 1500);
    } catch (err) {
      setAptitudeFormError(err.message || "Failed to update question.");
    }
  };

  const handleDeleteAptitudeQuestion = async (id) => {
    if (!isSuperAdmin) {
      await showAlert("Access Denied: Only super admins can manage tests.");
      return;
    }
    if (!await showConfirm("Delete this question?")) return;
    try {
      await ApiService.deleteAptitudeQuestion(id);
      reloadData();
    } catch (err) {
      await showAlert(err.message || "Failed to delete question.");
    }
  };

  // Psychologist Actions
  const parseAdminTimeToMinutes = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const formatAdminMinutesToTime = (minutes) => {
    let hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    const hourStr = String(hours).padStart(2, '0');
    const minStr = String(mins).padStart(2, '0');
    return `${hourStr}:${minStr} ${period}`;
  };

  const addAdminTimeRangeSlots = (fromStr, toStr) => {
    const fromMins = parseAdminTimeToMinutes(fromStr);
    const toMins = parseAdminTimeToMinutes(toStr);
    if (fromMins >= toMins) {
      setPsyFormError('Start time must be before end time.');
      return;
    }

    const generated = [];
    // Generate every 60 minutes (1 hour)
    for (let m = fromMins; m <= toMins; m += 60) {
      generated.push(formatAdminMinutesToTime(m));
    }

    setAdminAllSlots(prev => {
      const merged = [...prev];
      generated.forEach(slot => {
        if (!merged.includes(slot)) merged.push(slot);
      });
      return merged;
    });
    setAdminAvailableSlots(prev => {
      const merged = [...prev];
      generated.forEach(slot => {
        if (!merged.includes(slot)) merged.push(slot);
      });
      return merged;
    });
  };

  const handleAddAdminCustomSlot = () => {
    setPsyFormError('');
    const slotStr = `${adminCustomHour}:${adminCustomMinute} ${adminCustomPeriod}`;
    if (adminAllSlots.includes(slotStr)) {
      setPsyFormError('This slot already exists.');
      return;
    }
    setAdminAllSlots(prev => [...prev, slotStr]);
    setAdminAvailableSlots(prev => [...prev, slotStr]);
  };

  const handleRemoveAdminSlot = (slot) => {
    setAdminAllSlots(prev => prev.filter(s => s !== slot));
    setAdminAvailableSlots(prev => prev.filter(s => s !== slot));
  };

  const toggleAdminDay = (dayIndex) => {
    setAdminActiveDays(prev => ({ ...prev, [dayIndex]: !prev[dayIndex] }));
  };

  const handleCreatePsy = async (e) => {
    e.preventDefault();
    if (!hasPsyPermission) {
      setPsyFormError("Access Denied: You do not have permission to manage psychologists.");
      return;
    }
    setPsyFormError('');
    setPsyFormSuccess('');

    if (!psyForm.name.trim() || !psyForm.email.trim() || !psyForm.password) {
      setPsyFormError("Name, Email, and Password are required.");
      return;
    }

    if (psyForm.defaultMeetLink && !psyForm.defaultMeetLink.trim().startsWith('https://')) {
      setPsyFormError("Please enter a valid Google Meet link beginning with https://");
      return;
    }

    try {
      await ApiService.createAdminCounsellor({
        name: psyForm.name.trim(),
        email: psyForm.email.trim(),
        password: psyForm.password,
        education: psyForm.education,
        specialties: psyForm.specialties,
        price: psyForm.price,
        lang: psyForm.lang,
        bio: psyForm.bio,
        defaultMeetLink: psyForm.defaultMeetLink,
        phone: psyForm.phone,
        hours: psyForm.hours,
        modes: psyForm.modes,
        title: psyForm.title,
        isTopFive: psyForm.isTopFive,
        availability: {
          activeDays: adminActiveDays,
          availableSlots: adminAvailableSlots
        }
      });
      setPsyFormSuccess("Psychologist added successfully!");
      setPsyForm({
        id: '',
        name: '',
        email: '',
        password: '',
        education: '',
        specialties: '',
        price: '',
        lang: '',
        bio: '',
        defaultMeetLink: '',
        phone: '',
        hours: 0,
        modes: ['ONLINE', 'OFFLINE', 'DOOR_STEP'],
        title: 'Consultant Psychologist',
        profilePic: '',
        isTopFive: false
      });
      setAdminActiveDays({
        1: true, 2: true, 3: true, 4: true, 5: true, 6: false, 0: false
      });
      setAdminAvailableSlots([]);
      setAdminAllSlots([]);
      reloadData();
      setTimeout(() => {
        setIsAddPsyOpen(false);
        setPsyFormSuccess('');
      }, 1500);
    } catch (err) {
      setPsyFormError(err.message || "Failed to add psychologist.");
    }
  };

  const handleOpenEditPsy = (psy) => {
    setPsyForm({
      id: psy.id,
      name: psy.name,
      email: psy.email,
      password: '',
      education: psy.education || '',
      specialties: Array.isArray(psy.specialties) ? psy.specialties.join(', ') : psy.specialties || '',
      price: psy.price || 1200,
      lang: psy.lang || '',
      bio: psy.bio || psy.experience || '',
      defaultMeetLink: psy.defaultMeetLink || '',
      phone: psy.phone || '',
      hours: psy.hours !== undefined ? psy.hours : 0,
      modes: psy.modes || ['ONLINE', 'OFFLINE', 'DOOR_STEP'],
      title: psy.title || 'Consultant Psychologist',
      profilePic: psy.profilePic || psy.image || '',
      isTopFive: psy.isTopFive || false
    });
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
        1: true, 2: true, 3: true, 4: true, 5: true, 6: false, 0: false
      });
      setAdminAvailableSlots([]);
      setAdminAllSlots([]);
    }

    setPsyFormError('');
    setPsyFormSuccess('');
    setIsEditPsyOpen(true);
  };

  const handleUpdatePsy = async (e) => {
    e.preventDefault();
    if (!hasPsyPermission) {
      setPsyFormError("Access Denied: You do not have permission to manage psychologists.");
      return;
    }
    setPsyFormError('');
    setPsyFormSuccess('');

    if (!psyForm.name.trim() || !psyForm.email.trim()) {
      setPsyFormError("Name and Email are required.");
      return;
    }

    if (psyForm.defaultMeetLink && !psyForm.defaultMeetLink.trim().startsWith('https://')) {
      setPsyFormError("Please enter a valid Google Meet link beginning with https://");
      return;
    }

    try {
      if (psyProfilePicFile) {
        setIsPsyPicUploading(true);
        const fd = new FormData();
        fd.append('profilePic', psyProfilePicFile);
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
        lang: psyForm.lang,
        bio: psyForm.bio,
        defaultMeetLink: psyForm.defaultMeetLink,
        phone: psyForm.phone,
        hours: psyForm.hours,
        modes: psyForm.modes,
        title: psyForm.title,
        isTopFive: psyForm.isTopFive,
        availability: {
          activeDays: adminActiveDays,
          availableSlots: adminAvailableSlots
        }
      });
      setPsyFormSuccess("Psychologist details updated!");
      setPsyProfilePicFile(null);
      reloadData();
      setTimeout(() => {
        setIsEditPsyOpen(false);
        setPsyFormSuccess('');
      }, 1500);
    } catch (err) {
      setIsPsyPicUploading(false);
      setPsyFormError(err.message || "Failed to update psychologist.");
    }
  };

  const handleDeletePsy = async (psyId) => {
    if (!hasPsyPermission) {
      await showAlert("Access Denied: You do not have permission to manage psychologists.");
      return;
    }
    if (!await showConfirm("Are you sure you want to remove this psychologist?")) return;
    try {
      await ApiService.deleteAdminCounsellor(psyId);
      reloadData();
    } catch (err) {
      await showAlert(err.message || "Failed to delete psychologist.");
    }
  };

  const handleRejectPsy = async (psyId) => {
    if (!hasPsyPermission) {
      await showAlert("Access Denied: You do not have permission to manage psychologists.");
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

  // Booking Actions
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!hasBookingPermission) {
      setBookingFormError("Access Denied: You do not have permission to manage bookings.");
      return;
    }
    setBookingFormError('');
    setBookingFormSuccess('');

    if (!bookingForm.userId || !bookingForm.advisorId || !bookingForm.date || !bookingForm.time) {
      setBookingFormError("Student, Psychologist, Date and Time Slot are required.");
      return;
    }

    const localToday = getLocalTodayString();
    if (bookingForm.date < localToday) {
      setBookingFormError("Cannot book a date in the past.");
      return;
    }

    if (bookingForm.date === localToday && bookingForm.time) {
      try {
        const [time, modifier] = bookingForm.time.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        const now = new Date();
        const slotDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
        if (now >= slotDate) {
          setBookingFormError("This time slot has already passed today.");
          return;
        }
      } catch (e) { }
    }

    const isDoubleBooked = bookingsDb.some(b =>
      b.advisorId === bookingForm.advisorId &&
      b.date === bookingForm.date &&
      b.time === bookingForm.time &&
      (b.status === 'CONFIRMED' || b.status === 'PENDING' || b.status === 'APPROVED')
    );
    if (isDoubleBooked) {
      setBookingFormError("This slot is already booked for the selected date.");
      return;
    }

    const student = usersDb.find(u => u.id === bookingForm.userId);
    const psy = usersDb.find(u => u.id === bookingForm.advisorId);

    if (!student || !psy) {
      setBookingFormError("Student or Psychologist record invalid.");
      return;
    }

    try {
      await ApiService.createAdminAppointment({
        userId: bookingForm.userId,
        advisorId: bookingForm.advisorId,
        service: bookingForm.service,
        mode: bookingForm.mode,
        date: bookingForm.date,
        time: bookingForm.time,
        meetLink: bookingForm.meetLink.trim() || psy.defaultMeetLink || '',
        status: bookingForm.status || 'CONFIRMED'
      });

      setBookingFormSuccess("Appointment scheduled successfully!");
      setBookingForm({
        id: '',
        userId: '',
        advisorId: '',
        service: 'counselling',
        mode: 'ONLINE',
        date: getLocalTodayString(),
        time: '',
        meetLink: '',
        status: 'CONFIRMED'
      });
      reloadData();
      setTimeout(() => {
        setIsAddBookingOpen(false);
        setBookingFormSuccess('');
      }, 1500);
    } catch (err) {
      setBookingFormError(err.message || "Failed to create booking.");
    }
  };

  const handleOpenEditBooking = (booking) => {
    const studentUser = usersDb.find(u => u.name === booking.userName && (u.role === 'USER' || !u.role));
    const advisorUser = usersDb.find(u => u.name === booking.advisorName && u.role === 'PSYCHOLOGIST');

    setBookingForm({
      id: booking.id,
      userId: studentUser?.id || booking.userId || '',
      advisorId: booking.advisorId || advisorUser?.id || '',
      service: booking.service || 'counselling',
      mode: booking.mode || 'ONLINE',
      date: booking.date || '',
      time: booking.time || '',
      meetLink: booking.meetLink || '',
      status: booking.status || 'CONFIRMED',
      adminNotes: booking.adminNotes || ''
    });

    setBookingFormError('');
    setBookingFormSuccess('');
    setIsEditBookingOpen(true);
  };

  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    if (!hasBookingPermission) {
      setBookingFormError("Access Denied: You do not have permission to manage bookings.");
      return;
    }
    setBookingFormError('');
    setBookingFormSuccess('');

    if (!bookingForm.date || !bookingForm.time) {
      setBookingFormError("Date and Time Slot are required.");
      return;
    }

    try {
      await ApiService.updateAdminAppointment(bookingForm.id, {
        userId: bookingForm.userId,
        advisorId: bookingForm.advisorId,
        service: bookingForm.service,
        mode: bookingForm.mode,
        date: bookingForm.date,
        time: bookingForm.time,
        meetLink: bookingForm.meetLink.trim(),
        status: bookingForm.status,
        adminNotes: bookingForm.adminNotes ? bookingForm.adminNotes.trim() : ''
      });

      setBookingFormSuccess("Appointment details updated!");
      reloadData();
      setTimeout(() => {
        setIsEditBookingOpen(false);
        setBookingFormSuccess('');
      }, 1500);
    } catch (err) {
      setBookingFormError(err.message || "Failed to update booking.");
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!hasBookingPermission) {
      await showAlert("Access Denied: You do not have permission to manage bookings.");
      return;
    }
    if (!await showConfirm("Are you sure you want to remove this booking?")) return;
    try {
      await ApiService.deleteAdminAppointment(bookingId);
      reloadData();
    } catch (err) {
      await showAlert(err.message || "Failed to delete booking.");
    }
  };

  const handleRoleChangeInForm = (roleName) => {
    setSubAdminForm(prev => ({ ...prev, roleName }));
    const foundRole = rolesDb.find(r => r.name === roleName);
    if (foundRole) {
      setSelectedPermissions(foundRole.permissions || []);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      setRoleError("Access Denied: You do not have permission to manage roles.");
      return;
    }
    setRoleError('');
    setRoleSuccess('');

    const trimmed = newRoleName.trim();
    if (!trimmed) {
      setRoleError("Role Title name is required.");
      return;
    }

    try {
      const permissions = Object.keys(newRolePermissions).filter(p => newRolePermissions[p]);
      let res;
      if (editingRoleId) {
        res = await ApiService.updateRole(editingRoleId, trimmed, permissions, newRoleDescription);
      } else {
        res = await ApiService.createRole(trimmed, permissions, newRoleDescription);
      }

      if (res.success && res.data) {
        if (editingRoleId) {
          setRolesDb(prev => prev.map(r => (r._id === editingRoleId || r.id === editingRoleId) ? res.data : r));
          setRoleSuccess(`Role "${trimmed}" updated successfully!`);
        } else {
          setRolesDb(prev => [...prev, res.data]);
          setRoleSuccess(`Role "${trimmed}" created successfully!`);
        }

        // Auto-select if no role is currently selected
        if (!subAdminForm.roleName) {
          setSubAdminForm(prev => ({ ...prev, roleName: trimmed }));
          setSelectedPermissions(permissions);
        }

        setNewRoleName('');
        setNewRoleDescription('');
        setNewRolePermissions({});
        setEditingRoleId(null);
        setActiveRoleTab('roles');
        setTimeout(() => setRoleSuccess(''), 3000);
      } else {
        setRoleError(res.message || "Failed to save role.");
      }
    } catch (err) {
      setRoleError(err.message || "An error occurred saving the role.");
    }
  };

  const handleDeleteRole = async (role) => {
    if (!isSuperAdmin) {
      await showAlert("Access Denied: You do not have permission to manage roles.");
      return;
    }
    // Safety check: warn if staff members are currently using this role
    const staffUsingRole = subAdminsList.filter(a => a.customRoleTitle === role.name);
    if (staffUsingRole.length > 0) {
      const confirmed = await showConfirm(
        `${staffUsingRole.length} staff member${staffUsingRole.length > 1 ? 's are' : ' is'} currently assigned to "${role.name}". Deleting this role will not revoke their current permissions, but they will lose role association. Continue?`
      );
      if (!confirmed) return;
    }
    setRoleToDelete(role);
  };

  const handleDuplicateRole = (role) => {
    setEditingRoleId(null);
    setNewRoleName(`Copy of ${role.name}`);
    setNewRoleDescription(role.description || '');
    const permsObj = {};
    (role.permissions || []).forEach(p => { permsObj[p] = true; });
    setNewRolePermissions(permsObj);
    setActiveRoleTab('new_role');
  };

  const executeDeleteRole = async (roleId) => {
    if (!isSuperAdmin) {
      await showAlert("Access Denied: You do not have permission to manage roles.");
      return;
    }
    try {
      const res = await ApiService.deleteRole(roleId);
      if (res.success) {
        const deletedRole = rolesDb.find(r => r._id === roleId || r.id === roleId);
        setRolesDb(prev => prev.filter(r => r._id !== roleId && r.id !== roleId));

        if (deletedRole) {
          setRoleSuccess(`Role "${deletedRole.name}" deleted successfully!`);
          setTimeout(() => setRoleSuccess(''), 3000);

          // Reset selection if the deleted role was currently selected
          if (subAdminForm.roleName === deletedRole.name) {
            setSubAdminForm(prev => ({ ...prev, roleName: '' }));
            setSelectedPermissions([]);
          }
        }
      } else {
        await showAlert(res.message || "Failed to delete role.");
      }
    } catch (err) {
      await showAlert(err.message || "An error occurred deleting the role.");
    } finally {
      setRoleToDelete(null);
    }
  };

  // Sub-admin creation handler
  const handleCreateSubAdmin = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      setSubAdminError("Access Denied: You do not have permission to manage sub-admins.");
      return;
    }
    setSubAdminError('');
    setSubAdminSuccess('');
    setIsRegistering(true);

    if (!subAdminForm.name.trim() || !subAdminForm.email.trim() || !subAdminForm.password) {
      setSubAdminError("Please fill in all fields.");
      setIsRegistering(false);
      return;
    }

    if (!subAdminForm.roleName) {
      setSubAdminError("Please select a Role Title. If none exist, please create one above.");
      setIsRegistering(false);
      return;
    }

    const permissionsArray = selectedPermissions;
    if (permissionsArray.length === 0) {
      setSubAdminError("Please select a role title that has at least one permission scope, or configure permissions for this role.");
      setIsRegistering(false);
      return;
    }

    try {
      await ApiService.createAdminUser(
        subAdminForm.name.trim(),
        subAdminForm.email.trim(),
        subAdminForm.password,
        'ADMIN',
        permissionsArray,
        subAdminForm.roleName
      );

      setSubAdminSuccess(`Sub-admin account for ${subAdminForm.name} created successfully!`);

      const defaultRole = rolesDb.length > 0 ? rolesDb[0] : null;
      setSubAdminForm({
        name: '',
        email: '',
        password: '',
        roleName: defaultRole ? defaultRole.name : ''
      });
      if (defaultRole) {
        handleRoleChangeInForm(defaultRole.name);
      } else {
        setSelectedPermissions([]);
      }
      reloadData();
    } catch (err) {
      setSubAdminError(err.message || "Failed to create account.");
    } finally {
      setIsRegistering(false);
    }
  };

  const togglePermission = (perm) => {
    setSelectedPermissions(prev => {
      if (prev.includes(perm)) {
        return prev.filter(p => p !== perm);
      } else {
        return [...prev, perm];
      }
    });
  };

  const toggleNewRolePermission = (perm) => {
    setNewRolePermissions(prev => {
      const next = { ...prev };
      next[perm] = !next[perm];
      
      // If legacy keys are toggled, sync them
      if (perm === 'MANAGE_USERS') next['manage_users'] = next[perm];
      if (perm === 'MANAGE_PSYCHOLOGISTS') next['manage_psychologists'] = next[perm];
      if (perm === 'MANAGE_BOOKINGS') next['manage_bookings'] = next[perm];
      
      if (perm === 'manage_users') next['MANAGE_USERS'] = next[perm];
      if (perm === 'manage_psychologists') next['MANAGE_PSYCHOLOGISTS'] = next[perm];
      if (perm === 'manage_bookings') next['MANAGE_BOOKINGS'] = next[perm];
      
      return next;
    });
  };

  const toggleModuleAllPermissions = (moduleId, actionsList, turnOn) => {
    setNewRolePermissions(prev => {
      const next = { ...prev };
      next[moduleId] = turnOn;
      actionsList.forEach(act => {
        next[act.id] = turnOn;
      });
      // Legacy compatibility keys
      if (moduleId === 'manage_users') next['MANAGE_USERS'] = turnOn;
      if (moduleId === 'manage_psychologists') next['MANAGE_PSYCHOLOGISTS'] = turnOn;
      if (moduleId === 'manage_bookings') next['MANAGE_BOOKINGS'] = turnOn;
      return next;
    });
  };

  const toggleChildAction = (moduleId, actionId, actionsList) => {
    setNewRolePermissions(prev => {
      const next = { ...prev };
      next[actionId] = !next[actionId];
      
      // If the child is checked, the parent should also be checked
      if (next[actionId]) {
        next[moduleId] = true;
      } else {
        // If all children of this module are unchecked, uncheck the parent
        const anyChecked = actionsList.some(act => next[act.id]);
        if (!anyChecked) {
          next[moduleId] = false;
        }
      }
      
      // Legacy compatibility keys
      if (moduleId === 'manage_users') next['MANAGE_USERS'] = next[moduleId];
      if (moduleId === 'manage_psychologists') next['MANAGE_PSYCHOLOGISTS'] = next[moduleId];
      if (moduleId === 'manage_bookings') next['MANAGE_BOOKINGS'] = next[moduleId];
      
      return next;
    });
  };

  const handleEditRoleClick = (role) => {
    setEditingRoleId(role._id || role.id);
    setNewRoleName(role.name);
    setNewRoleDescription(role.description || '');
    const permsObj = {};
    (role.permissions || []).forEach(p => {
      permsObj[p] = true;
    });
    setNewRolePermissions(permsObj);
    setActiveRoleTab('new_role');
  };

  const parseStaffDetails = (admin) => {
    let cleanName = admin.name;
    let roleTitle = admin.customRoleTitle || '';

    if (!roleTitle) {
      // Backwards compatibility for parenthesized formats like "Sandra Tomy (HR Coordinator)"
      const matches = admin.name.match(/^(.*?)\s*\((.*?)\)\s*$/);
      if (matches) {
        cleanName = matches[1];
        roleTitle = matches[2];
      } else {
        roleTitle = 'Sub Admin';
      }
    }
    return { cleanName, roleTitle };
  };

  // Filter listings
  const studentsList = usersDb.filter(u =>
    (u.role === 'USER' || !u.role) &&
    (u.name.toLowerCase().includes(searchUser.toLowerCase()) || u.email.toLowerCase().includes(searchUser.toLowerCase()))
  );
  /* eslint-disable react-hooks/preserve-manual-memoization */
  const psychologistsList = React.useMemo(() => {
    let list = usersDb.filter(u =>
      u.role === 'PSYCHOLOGIST' &&
      (u.name.toLowerCase().includes(searchPsy.toLowerCase()) || u.email.toLowerCase().includes(searchPsy.toLowerCase()))
    );

    if (psyFilter === 'pending') {
      list = list.filter(u => u.status !== 'APPROVED' && u.status !== 'ACTIVE' && u.status !== 'REJECTED');
    } else if (psyFilter === 'approved') {
      list = list.filter(u => u.status === 'APPROVED' || u.status === 'ACTIVE');
    } else if (psyFilter === 'rejected') {
      list = list.filter(u => u.status === 'REJECTED');
    }

    return list.sort((a, b) => {
      const aVer = (a.status === 'APPROVED' || a.status === 'ACTIVE') ? 1 : 0;
      const bVer = (b.status === 'APPROVED' || b.status === 'ACTIVE') ? 1 : 0;
      if (aVer !== bVer) return bVer - aVer;
      return a.name.localeCompare(b.name);
    });
  }, [usersDb, searchPsy, psyFilter]);
  /* eslint-enable react-hooks/preserve-manual-memoization */

  const subAdminsList = usersDb.filter(u =>
    u.role === 'ADMIN' && u.permissions // Only custom sub-admins
  );

  // Inquiries Actions
  const handleResolveInquiry = async (inqId) => {
    if (!isSuperAdmin) {
      await showAlert("Access Denied: You do not have permission to manage inquiries.");
      return;
    }
    try {
      await ApiService.resolveInquiry(inqId);
      reloadData();
    } catch (err) {
      await showAlert(err.message || "Failed to update inquiry.");
    }
  };

  const handleDeleteInquiry = async (inqId) => {
    if (!isSuperAdmin) {
      await showAlert("Access Denied: You do not have permission to manage inquiries.");
      return;
    }
    if (!await showConfirm("Are you sure you want to delete this student inquiry?")) return;
    try {
      await ApiService.deleteInquiry(inqId);
      reloadData();
    } catch (err) {
      await showAlert(err.message || "Failed to delete inquiry.");
    }
  };

  // Student active/suspended status toggle
  const handleToggleStudentStatus = async (studentId, currentStatus) => {
    if (!hasUserPermission) {
      await showAlert("Access Denied: You do not have permission to manage students.");
      return;
    }
    const student = usersDb.find(u => u.id === studentId);
    if (!student) return;
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await ApiService.updateAdminUser(
        studentId,
        student.name,
        student.email,
        undefined,
        student.role,
        student.permissions,
        student.customRoleTitle,
        newStatus
      );
      reloadData();
    } catch (err) {
      await showAlert(err.message || "Failed to update status.");
    }
  };

  // Psychologist verification toggle
  const handleTogglePsyVerification = async (psyId, currentVerified) => {
    if (!hasPsyPermission) {
      await showAlert("Access Denied: You do not have permission to verify/unverify psychologists.");
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
      await showAlert("Access Denied: You do not have permission to modify psychologists.");
      return;
    }
    try {
      const nextValue = !psy.isTopFive;
      const specialtiesStr = Array.isArray(psy.specialties)
        ? psy.specialties.join(', ')
        : (psy.specialties || '');

      await ApiService.updateAdminCounsellor(psy.id, {
        name: psy.name,
        email: psy.email,
        education: psy.education || '',
        specialties: specialtiesStr,
        price: psy.price || 1200,
        lang: psy.lang || 'English, Malayalam',
        bio: psy.bio || '',
        defaultMeetLink: psy.defaultMeetLink || '',
        phone: psy.phone || '',
        hours: psy.hours || 0,
        modes: psy.modes || ['ONLINE', 'OFFLINE', 'DOOR_STEP'],
        title: psy.title || 'Consultant Psychologist',
        profilePic: psy.profilePic || psy.image || '',
        isTopFive: nextValue,
        availability: psy.availability
      });
      reloadData();
    } catch (err) {
      await showAlert(err.message || "Failed to update featured status.");
    }
  };

  // Site Settings save handler
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      await showAlert("Access Denied: You do not have permission to save settings.");
      return;
    }
    setSettingsSuccess('');
    try {
      await ApiService.updateAdminSettings(settingsForm);
      setSettingsSuccess("Site Settings updated successfully!");
      window.dispatchEvent(new Event('behold_faqs_updated'));
      setTimeout(() => setSettingsSuccess(''), 3000);
      reloadData();
    } catch (err) {
      await showAlert(err.message || "Failed to save settings.");
    }
  };

  const handleAddPromoCode = () => {
    setSettingsForm(prev => ({
      ...prev,
      promoCodes: [...(prev.promoCodes || []), { code: '', type: 'PERCENTAGE', value: 0, isActive: true }]
    }));
  };

  const handleUpdatePromoCode = (index, field, value) => {
    setSettingsForm(prev => {
      const newCodes = [...(prev.promoCodes || [])];
      newCodes[index] = { ...newCodes[index], [field]: value };
      return { ...prev, promoCodes: newCodes };
    });
  };

  const handleRemovePromoCode = (index) => {
    setSettingsForm(prev => ({
      ...prev,
      promoCodes: (prev.promoCodes || []).filter((_, i) => i !== index)
    }));
  };

  const handleRunSecurityCheck = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    setScanResults(null);
    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setScanProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        setScanResults({
          status: 'SECURE',
          timestamp: new Date().toLocaleTimeString(),
          issuesFound: 0,
          checks: [
            { name: 'Schema integrity', ok: true },
            { name: 'Index validation', ok: true },
            { name: 'Root security access', ok: true },
            { name: 'Token encryption', ok: true }
          ]
        });
      }
    }, 120);
  };

  // Sub-Admin edit permissions — uses the full role-based granular permission system
  const handleOpenEditSubAdmin = (admin) => {
    setEditingSubAdmin(admin);
    setEditSubAdminError('');
    setEditSubAdminSuccess('');
    // Set role name from the admin's assigned role
    const roleName = admin.customRoleTitle || '';
    setEditSubAdminRoleName(roleName);
    // Build permissions object from the admin's current permissions array
    const permsObj = {};
    (admin.permissions || []).forEach(p => { permsObj[p] = true; });
    setEditSubAdminPermissionsObj(permsObj);
  };

  const handleEditSubAdminRoleChange = (roleName) => {
    setEditSubAdminRoleName(roleName);
    const foundRole = rolesDb.find(r => r.name === roleName);
    if (foundRole) {
      const permsObj = {};
      (foundRole.permissions || []).forEach(p => { permsObj[p] = true; });
      setEditSubAdminPermissionsObj(permsObj);
    } else {
      setEditSubAdminPermissionsObj({});
    }
  };

  const toggleEditSubAdminModuleAll = (moduleId, actionsList, turnOn) => {
    setEditSubAdminPermissionsObj(prev => {
      const next = { ...prev };
      next[moduleId] = turnOn;
      actionsList.forEach(act => { next[act.id] = turnOn; });
      if (moduleId === 'manage_users') next['MANAGE_USERS'] = turnOn;
      if (moduleId === 'manage_psychologists') next['MANAGE_PSYCHOLOGISTS'] = turnOn;
      if (moduleId === 'manage_bookings') next['MANAGE_BOOKINGS'] = turnOn;
      return next;
    });
  };

  const toggleEditSubAdminChildAction = (moduleId, actionId, actionsList) => {
    setEditSubAdminPermissionsObj(prev => {
      const next = { ...prev };
      next[actionId] = !next[actionId];
      if (next[actionId]) {
        next[moduleId] = true;
      } else {
        const anyChecked = actionsList.some(act => next[act.id]);
        if (!anyChecked) next[moduleId] = false;
      }
      if (moduleId === 'manage_users') next['MANAGE_USERS'] = next[moduleId];
      if (moduleId === 'manage_psychologists') next['MANAGE_PSYCHOLOGISTS'] = next[moduleId];
      if (moduleId === 'manage_bookings') next['MANAGE_BOOKINGS'] = next[moduleId];
      return next;
    });
  };

  const handleSaveSubAdminPermissions = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      setEditSubAdminError("Access Denied: You do not have permission to manage sub-admins.");
      return;
    }
    setEditSubAdminError('');
    setEditSubAdminSuccess('');

    const permsArray = Object.keys(editSubAdminPermissionsObj).filter(k => editSubAdminPermissionsObj[k]);

    if (permsArray.length === 0) {
      setEditSubAdminError("Please enable at least one permission for this staff member.");
      return;
    }

    try {
      await ApiService.updateAdminUser(
        editingSubAdmin.id,
        editingSubAdmin.name,
        editingSubAdmin.email,
        undefined,
        'ADMIN',
        permsArray,
        editSubAdminRoleName || editingSubAdmin.customRoleTitle
      );
      setEditSubAdminSuccess('Permissions updated successfully!');
      reloadData();
      setTimeout(() => {
        setEditingSubAdmin(null);
        setEditSubAdminSuccess('');
      }, 1500);
    } catch (err) {
      setEditSubAdminError(err.message || 'Failed to save permissions.');
    }
  };

  // Inquiry Reply/Notes
  const handleSaveInquiryNote = async (inqId, noteText) => {
    if (!isSuperAdmin) {
      await showAlert("Access Denied: You do not have permission to manage inquiries.");
      return;
    }
    try {
      await ApiService.saveInquiryNote(inqId, noteText);
      reloadData();
      await showAlert("Internal note updated!");
    } catch (err) {
      await showAlert(err.message || "Failed to update inquiry note.");
    }
  };

  const handleBulkClearResolvedInquiries = async () => {
    if (!isSuperAdmin) {
      await showAlert("Access Denied: You do not have permission to manage inquiries.");
      return;
    }
    if (!await showConfirm("Are you sure you want to delete all resolved inquiries?")) return;
    try {
      await ApiService.clearResolvedInquiries();
      reloadData();
    } catch (err) {
      await showAlert(err.message || "Failed to clear resolved inquiries.");
    }
  };

  // Aptitude results export
  const handleExportAptitudeResults = async (res) => {
    const breakdown = Object.entries(res.scores || {})
      .map(([key, val]) => ` - ${key.toUpperCase()}: ${val}%`)
      .join('\n');
    const txt = `BEHOLD APTITUDE TEST REPORT\n=========================\nStudent Name: ${res.studentName}\nEmail: ${res.studentEmail}\nDate Completed: ${formatDateString(res.date)}\nDominant Domain: ${res.dominantDomain.toUpperCase()}\n\nCognitive Breakdown:\n${breakdown}\n`;
    navigator.clipboard.writeText(txt);
    await showAlert("Test report copied to clipboard!");
  };

  // Bookings Bulk Actions
  const handleToggleSelectBooking = (bookingId) => {
    setSelectedBookingIds(prev =>
      prev.includes(bookingId)
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const handleBulkBookingStatus = async (status) => {
    if (!hasBookingPermission) {
      await showAlert("Access Denied: You do not have permission to manage bookings.");
      return;
    }
    if (selectedBookingIds.length === 0) return;
    try {
      await Promise.all(
        selectedBookingIds.map(id => ApiService.updateAdminAppointment(id, { status }))
      );
      setSelectedBookingIds([]);
      reloadData();
      await showAlert(`Selected bookings updated to ${status}!`);
    } catch (err) {
      await showAlert(err.message || "Failed to update bookings.");
    }
  };

  const handleBulkDeleteBookings = async () => {
    if (!hasBookingPermission) {
      await showAlert("Access Denied: You do not have permission to manage bookings.");
      return;
    }
    if (selectedBookingIds.length === 0) return;
    if (!await showConfirm(`Are you sure you want to delete ${selectedBookingIds.length} selected bookings?`)) return;
    try {
      await Promise.all(
        selectedBookingIds.map(id => ApiService.deleteAdminAppointment(id))
      );
      setSelectedBookingIds([]);
      reloadData();
      await showAlert("Selected bookings deleted!");
    } catch (err) {
      await showAlert(err.message || "Failed to delete bookings.");
    }
  };

  // Test Results Actions
  const handleDeleteTestResult = async (resId) => {
    if (!isSuperAdmin) {
      await showAlert("Access Denied: You do not have permission to manage test results.");
      return;
    }
    if (!await showConfirm("Are you sure you want to delete this test result?")) return;
    try {
      await ApiService.deleteTestResult(resId);
      reloadData();
    } catch (err) {
      await showAlert(err.message || "Failed to delete test result.");
    }
  };

  // FAQ Desk Actions
  const handleCreateFaq = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      setFaqFormError("Access Denied: You do not have permission to manage FAQs.");
      return;
    }
    setFaqFormError('');
    setFaqFormSuccess('');

    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      setFaqFormError("Both question and answer are required.");
      return;
    }

    try {
      await ApiService.createFaq(faqForm.question.trim(), faqForm.answer.trim());
      setFaqFormSuccess("FAQ added successfully!");
      setFaqForm({ index: -1, question: '', answer: '' });
      reloadData();
      setTimeout(() => {
        setIsAddFaqOpen(false);
        setFaqFormSuccess('');
      }, 1500);
    } catch (err) {
      setFaqFormError(err.message || "Failed to add FAQ.");
    }
  };

  const handleOpenEditFaq = (faq, index) => {
    setFaqForm({
      index,
      question: faq.question,
      answer: faq.answer
    });
    setFaqFormError('');
    setFaqFormSuccess('');
    setIsEditFaqOpen(true);
  };

  const handleUpdateFaq = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      setFaqFormError("Access Denied: You do not have permission to manage FAQs.");
      return;
    }
    setFaqFormError('');
    setFaqFormSuccess('');

    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      setFaqFormError("Both question and answer are required.");
      return;
    }

    try {
      const faqToUpdate = faqsDb[faqForm.index];
      if (!faqToUpdate) {
        setFaqFormError("FAQ record not found.");
        return;
      }
      await ApiService.updateFaq(faqToUpdate.id, faqForm.question.trim(), faqForm.answer.trim());
      setFaqFormSuccess("FAQ updated successfully!");
      reloadData();
      setTimeout(() => {
        setIsEditFaqOpen(false);
        setFaqFormSuccess('');
      }, 1500);
    } catch (err) {
      setFaqFormError(err.message || "Failed to update FAQ.");
    }
  };

  const handleDeleteFaq = async (index) => {
    if (!isSuperAdmin) {
      await showAlert("Access Denied: You do not have permission to manage FAQs.");
      return;
    }
    if (!await showConfirm("Are you sure you want to delete this FAQ question?")) return;
    try {
      const faqToDelete = faqsDb[index];
      if (!faqToDelete) return;
      await ApiService.deleteFaq(faqToDelete.id);
      reloadData();
    } catch (err) {
      await showAlert(err.message || "Failed to delete FAQ.");
    }
  };

  // Filter inquiries
  const filteredInquiries = inquiriesDb.filter(inq =>
    inq.name.toLowerCase().includes(searchInquiry.toLowerCase()) ||
    inq.email.toLowerCase().includes(searchInquiry.toLowerCase()) ||
    inq.message.toLowerCase().includes(searchInquiry.toLowerCase())
  ).sort((a, b) => {
    const aStatus = a.status === 'RESOLVED' ? 1 : 0;
    const bStatus = b.status === 'RESOLVED' ? 1 : 0;
    if (aStatus !== bStatus) return aStatus - bStatus;
    return (b.id || '').localeCompare(a.id || '');
  });

  // Filter test results
  const filteredTestResults = testResultsDb.filter(res =>
    res.studentName.toLowerCase().includes(searchTestResult.toLowerCase()) ||
    res.studentEmail.toLowerCase().includes(searchTestResult.toLowerCase()) ||
    res.dominantDomain.toLowerCase().includes(searchTestResult.toLowerCase())
  ).sort((a, b) => {
    return (b.date || '').localeCompare(a.date || '');
  });

  // --- LOGIN UI GATE ---
  const isUserAdmin = user && user?.role?.toUpperCase() === 'ADMIN';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-brand border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isUserAdmin) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden ">
        {/* Soft glows in background */}
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-brand/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-header font-bold tracking-tighter text-white">
              BEHOLD<span className="text-brand font-bold">.</span>
            </h1>
            <p className="text-sm text-zinc-500 capitalize  font-bold">ADMINISTRATOR CONTROL GATE</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6 text-left">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white capitalize ">Sign In to Dashboard</h2>
              <p className="text-sm text-zinc-500 leading-none">Security clearance required for system administration.</p>
            </div>

            {/* Submit Button */}
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm capitalize  font-bold text-zinc-400">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="Enter Your Email Id"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm capitalize  font-bold text-zinc-400">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-3.5 pr-12 py-3 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 focus:outline-none cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <p className="text-sm text-rose-500 font-bold capitalize tracking-wide ">{loginError}</p>
              )}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-brand hover:bg-brand-dark text-zinc-950 font-bold text-sm capitalize  rounded-lg cursor-pointer transition border-none shadow-md flex items-center justify-center gap-1"
              >
                {isLoggingIn ? 'Verifying Credentials...' : 'Enter Admin Console'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- DEDICATED LOGGED-IN ADMIN DASHBOARD UI ---
  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-zinc-955 text-white text-left flex flex-col lg:flex-row relative overflow-hidden">

      {/* Background Soft Glows */}
      <div className="absolute top-1/4 left-1/3 w-[350px] h-[350px] bg-brand/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Mobile Top Navbar (Visible only on lg:hidden) */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-zinc-900 border-b border-zinc-805 px-5 py-4 w-full">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Icon */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer border-none"
            title={isMobileMenuOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-1.5">
            <span className="font-header font-bold text-base tracking-tighter text-white">
              BEHOLD<span className="text-brand font-bold">.</span>
            </span>
            <span className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-400 px-1 py-0.2 rounded font-bold  capitalize ">
              CONSOLE
            </span>
          </div>
        </div>

        {/* Profile Icon / Trigger */}
        <button
          type="button"
          onClick={() => setIsProfileDrawerOpen(true)}
          className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-white hover:border-brand/30 flex items-center justify-center shadow-md cursor-pointer hover:opacity-90 active:scale-95 transition-all shrink-0"
          title="Open Profile Menu"
        >
          <User className="w-4 h-4 text-brand" />
        </button>
      </div>

      {/* Mobile Sidebar Backdrop (Overlay) */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 1. Left Fixed Sidebar (Drawer on Mobile, static on Desktop) */}
      <div className={`fixed lg:sticky lg:top-0 h-screen lg:h-screen overflow-hidden inset-y-0 left-0 z-50 w-64 lg:w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between shrink-0 p-5 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col flex-1 min-h-0 space-y-6">
          {/* Logo & Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="font-header font-bold text-lg tracking-tighter text-white">
                BEHOLD<span className="text-brand font-bold">.</span>
              </span>
              <span className="text-sm bg-zinc-800 border border-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded font-bold  capitalize">
                CONSOLE
              </span>
            </div>
            {/* Close Button inside Drawer (Mobile Only) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1 bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer border-none"
              title="Close Navigation Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User profile details — click to open drawer */}
          {(() => {
            const { cleanName, roleTitle } = parseStaffDetails(user);
            return (
              <button
                type="button"
                onClick={() => setIsProfileDrawerOpen(true)}
                className="w-full flex items-center gap-3 bg-zinc-955/60 hover:bg-zinc-950 p-3 rounded-xl border border-zinc-850 hover:border-brand/30 transition-all cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand to-brand-accent text-zinc-955 flex items-center justify-center font-header font-bold text-sm shrink-0">
                  {(cleanName || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-white truncate leading-tight capitalize">
                    {cleanName}
                  </h4>
                  <span className="text-sm text-zinc-500 font-bold  capitalize">
                    {isSuperAdmin ? 'SUPER ADMIN' : (roleTitle || 'SUB ADMIN')}
                  </span>
                </div>
              </button>
            );
          })()}

          {/* Nav Links */}
          <nav className="flex flex-col gap-1 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800 hover:scrollbar-thumb-zinc-700">
            {isSuperAdmin && (
              <button
                onClick={() => handleNavClick('overview')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold capitalize  transition-all text-left cursor-pointer border-none ${currentSection === 'overview'
                  ? 'bg-brand text-zinc-955 font-bold'
                  : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-855'
                  }`}
              >
                <BarChart3 className="w-4 h-4 font-bold" />
                <span>Overview</span>
              </button>
            )}

            {hasUserPermission && (
              <button
                onClick={() => handleNavClick('users')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold capitalize  transition-all text-left cursor-pointer border-none ${currentSection === 'users'
                  ? 'bg-brand text-zinc-950 font-bold'
                  : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-855'
                  }`}
              >
                <User className="w-4 h-4" />
                <span>Student Database</span>
              </button>
            )}

            {hasPsyPermission && (
              <button
                onClick={() => handleNavClick('psychologists')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold capitalize  transition-all text-left cursor-pointer border-none ${currentSection === 'psychologists'
                  ? 'bg-brand text-zinc-955 font-bold'
                  : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-855'
                  }`}
              >
                <Award className="w-4 h-4" />
                <span>Psychologists DB</span>
              </button>
            )}

            {hasBookingPermission && (
              <button
                onClick={() => handleNavClick('bookings')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold capitalize  transition-all text-left cursor-pointer border-none ${currentSection === 'bookings'
                  ? 'bg-brand text-zinc-955 font-bold'
                  : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-855'
                  }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Client Bookings</span>
              </button>
            )}

            {isSuperAdmin && (
              <>
                <button
                  onClick={() => handleNavClick('subadmins')}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold capitalize  transition-all text-left cursor-pointer border-none ${currentSection === 'subadmins'
                    ? 'bg-brand text-zinc-955 font-bold'
                    : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-855'
                    }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Roles & Scopes</span>
                </button>

                <button
                  onClick={() => handleNavClick('inquiries')}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold capitalize  transition-all text-left cursor-pointer border-none ${currentSection === 'inquiries'
                    ? 'bg-brand text-zinc-955 font-bold'
                    : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-855'
                    }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Student Inquiries</span>
                </button>

                <button
                  onClick={() => handleNavClick('testresults')}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold capitalize  transition-all text-left cursor-pointer border-none ${currentSection === 'testresults'
                    ? 'bg-brand text-zinc-955 font-bold'
                    : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-855'
                    }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Aptitude Results</span>
                </button>

                <button
                  onClick={() => handleNavClick('aptitude')}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold capitalize  transition-all text-left cursor-pointer border-none ${currentSection === 'aptitude'
                    ? 'bg-brand text-zinc-955 font-bold'
                    : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-855'
                    }`}
                >
                  <Brain className="w-4 h-4" />
                  <span>Aptitude Questions</span>
                </button>

                <button
                  onClick={() => handleNavClick('faqs')}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold capitalize  transition-all text-left cursor-pointer border-none ${currentSection === 'faqs'
                    ? 'bg-brand text-zinc-955 font-bold'
                    : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-855'
                    }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>FAQ Manager</span>
                </button>

                <button
                  onClick={() => handleNavClick('analytics')}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold capitalize  transition-all text-left cursor-pointer border-none ${currentSection === 'analytics'
                    ? 'bg-brand text-zinc-955 font-bold'
                    : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-855'
                    }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics Console</span>
                </button>

                <button
                  onClick={() => handleNavClick('settings')}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold capitalize  transition-all text-left cursor-pointer border-none ${currentSection === 'settings'
                    ? 'bg-brand text-zinc-955 font-bold'
                    : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-855'
                    }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Site Settings</span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-4 pt-4 border-t border-zinc-800 mt-auto shrink-0">
          <button
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="w-full py-2 border border-rose-900/50 hover:border-rose-600 text-rose-500 bg-rose-950/20 hover:bg-rose-900 hover:text-white font-bold text-sm capitalize  rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out Portal
          </button>
        </div>
      </div>

      {/* 2. Main Content Workspace */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 lg:p-10 space-y-6 relative z-10 text-left">

        {/* Workspace Banner */}
        <div className="bg-zinc-900 border border-zinc-850 p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-1 relative z-10 w-full sm:w-auto">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-header font-bold tracking-wide capitalize">
                {user.name}
              </h1>
            </div>
            <p className="text-sm text-zinc-400 break-all">
              Active Console Session: {user.email}
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full sm:w-auto shrink-0 relative z-10 text-center">
            <div className="bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 rounded-xl min-w-[75px]">
              <span className="text-sm text-zinc-500 font-bold capitalize  block">Students</span>
              <p className="text-sm font-bold text-brand mt-0.5">{studentsList.length}</p>
            </div>
            <div className="bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 rounded-xl min-w-[75px]">
              <span className="text-sm text-zinc-500 font-bold capitalize  block">Advisors</span>
              <p className="text-sm font-bold text-brand mt-0.5">{psychologistsList.length}</p>
            </div>
            <div className="bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 rounded-xl min-w-[75px]">
              <span className="text-sm text-zinc-500 font-bold capitalize  block">Bookings</span>
              <p className="text-sm font-bold text-brand mt-0.5">{bookingsDb.length}</p>
            </div>
          </div>
        </div>

        {/* WORKSPACE CONTENT ROUTER */}
        <div className="bg-zinc-900 border border-zinc-855 rounded-2xl p-5 sm:p-8 shadow-md">
          {/* TAB 1: OVERVIEW PANEL */}
          {currentSection === 'overview' && isSuperAdmin && (() => {
            const studentsCount = usersDb.filter(u => u.role === 'USER' || !u.role).length;
            const activeStudentsCount = usersDb.filter(u => (u.role === 'USER' || !u.role) && u.status !== 'SUSPENDED').length;
            const suspendedStudentsCount = usersDb.filter(u => (u.role === 'USER' || !u.role) && u.status === 'SUSPENDED').length;

            const psyCount = usersDb.filter(u => u.role === 'PSYCHOLOGIST').length;
            const approvedPsyCount = usersDb.filter(u => u.role === 'PSYCHOLOGIST' && (u.status === 'APPROVED' || u.status === 'ACTIVE')).length;
            const pendingPsyCount = usersDb.filter(u => u.role === 'PSYCHOLOGIST' && u.status !== 'APPROVED' && u.status !== 'ACTIVE' && u.status !== 'REJECTED').length;
            const rejectedPsyCount = usersDb.filter(u => u.role === 'PSYCHOLOGIST' && u.status === 'REJECTED').length;

            const totalBookingsCount = bookingsDb.length;
            const confirmedBookingsCount = bookingsDb.filter(b => b.status === 'CONFIRMED').length;
            const pendingBookingsCount = bookingsDb.filter(b => b.status === 'PENDING').length;
            const completedBookingsCount = bookingsDb.filter(b => b.status === 'COMPLETED').length;
            const expiredBookingsCount = bookingsDb.filter(b => b.status === 'EXPIRED').length;
            const cancelledBookingsCount = bookingsDb.filter(b => b.status === 'CANCELLED').length;

            const pendingInquiriesCount = inquiriesDb.filter(i => i.status === 'PENDING' || !i.status).length;
            const resolvedInquiriesCount = inquiriesDb.filter(i => i.status === 'RESOLVED').length;
            const totalInquiriesCount = inquiriesDb.length;
            const inquiryResolutionRate = totalInquiriesCount > 0 ? Math.round((resolvedInquiriesCount / totalInquiriesCount) * 100) : 0;

            const totalRevenue = bookingsDb.reduce((acc, b) => {
              if (b.status !== 'COMPLETED' && b.status !== 'EXPIRED') return acc;
              if (b.amountPaid !== undefined && b.amountPaid !== null) {
                return acc + Number(b.amountPaid);
              }
              const advisor = usersDb.find(u => u.id === b.advisorId) || usersDb.find(u => u.name === b.advisorName);
              let price = 1250;
              if (advisor && advisor.price) {
                price = Number(advisor.price);
              }
              return acc + Number(price);
            }, 0);

            const projectedRevenue = bookingsDb.reduce((acc, b) => {
              if (b.status !== 'CONFIRMED' && b.status !== 'PENDING') return acc;
              if (b.amountPaid !== undefined && b.amountPaid !== null) {
                return acc + Number(b.amountPaid);
              }
              const advisor = usersDb.find(u => u.id === b.advisorId) || usersDb.find(u => u.name === b.advisorName);
              let price = 1250;
              if (advisor && advisor.price) {
                price = Number(advisor.price);
              }
              return acc + Number(price);
            }, 0);

            const counsellingCount = bookingsDb.filter(b => b.service === 'counselling').length;
            const aptitudeCount = bookingsDb.filter(b => b.service === 'aptitude').length;
            const onlineCount = bookingsDb.filter(b => b.mode === 'ONLINE').length;
            const offlineCount = bookingsDb.filter(b => b.mode === 'OFFLINE').length;
            const doorstepCount = bookingsDb.filter(b => b.mode === 'DOOR_STEP').length;

            const activeBookings = bookingsDb.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING').length;
            const bookingCompletionRate = totalBookingsCount > 0 ? Math.round((completedBookingsCount / totalBookingsCount) * 100) : 0;

            // Storage usage calculation
            let totalChars = 0;
            for (let key in localStorage) {
              if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
                totalChars += key.length + localStorage[key].length;
              }
            }
            const kbUsed = (totalChars / 1024).toFixed(2);

            return (
              <div className="space-y-6 animate-in fade-in duration-200 text-sm">
                <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
                  <h3 className="text-sm font-bold capitalize  text-zinc-400">Super Admin Command Center</h3>
                </div>

                {/* KPI stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                  {/* Students Card */}
                  <div
                    onClick={() => setActiveStatHighlight(activeStatHighlight === 'students' ? null : 'students')}
                    className={`bg-zinc-950 border p-4 rounded-xl text-center space-y-1.5 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-brand/5 select-none ${activeStatHighlight === 'students'
                      ? 'border-brand bg-brand/5 ring-1 ring-brand/30'
                      : 'border-zinc-850 hover:border-zinc-700'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500 font-bold capitalize  block">Students</span>
                      <User className={`w-3.5 h-3.5 ${activeStatHighlight === 'students' ? 'text-brand' : 'text-zinc-500'}`} />
                    </div>
                    <p className="text-xl font-bold text-white text-left pt-0.5">{studentsCount}</p>
                    <div className="flex flex-wrap justify-between items-center text-xs gap-x-2 text-zinc-500 font-semibold pt-0.5">
                      <span className="capitalize text-emerald-450">{activeStudentsCount} Active</span>
                      <span className=" text-zinc-600">{suspendedStudentsCount} Suspended</span>
                    </div>
                  </div>

                  {/* Psychologists Card */}
                  <div
                    onClick={() => setActiveStatHighlight(activeStatHighlight === 'psychologists' ? null : 'psychologists')}
                    className={`bg-zinc-955 border p-4 rounded-xl text-center space-y-1.5 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-brand/5 select-none ${activeStatHighlight === 'psychologists'
                      ? 'border-brand bg-brand/5 ring-1 ring-brand/30'
                      : 'border-zinc-850 hover:border-zinc-700'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500 font-bold capitalize  block">Psychologists</span>
                      <Award className={`w-3.5 h-3.5 ${activeStatHighlight === 'psychologists' ? 'text-brand' : 'text-zinc-500'}`} />
                    </div>
                    <p className="text-xl font-bold text-white text-left pt-0.5">{psyCount}</p>
                    <div className="flex flex-wrap justify-between items-center text-xs gap-x-2 text-zinc-500 font-semibold pt-0.5">
                      <span className="capitalize text-emerald-450">{approvedPsyCount} Verified</span>
                      <span className=" text-amber-500">{pendingPsyCount} Pending</span>
                    </div>
                  </div>

                  {/* Total Bookings Card */}
                  <div
                    onClick={() => setActiveStatHighlight(activeStatHighlight === 'bookings' ? null : 'bookings')}
                    className={`bg-zinc-955 border p-4 rounded-xl text-center space-y-1.5 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-brand/5 select-none ${activeStatHighlight === 'bookings'
                      ? 'border-brand bg-brand/5 ring-1 ring-brand/30'
                      : 'border-zinc-850 hover:border-zinc-700'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500 font-bold capitalize  block">Total Bookings</span>
                      <Calendar className={`w-3.5 h-3.5 ${activeStatHighlight === 'bookings' ? 'text-brand' : 'text-zinc-500'}`} />
                    </div>
                    <p className="text-xl font-bold text-white text-left pt-0.5">{totalBookingsCount}</p>
                    <div className="flex flex-wrap justify-between items-center text-xs gap-x-2 text-zinc-500 font-semibold pt-0.5">
                      <span className="capitalize text-zinc-400">{confirmedBookingsCount} Confirmed</span>
                      <span className=" text-zinc-650">{pendingBookingsCount} Pending</span>
                    </div>
                  </div>

                  {/* Inquiries Card */}
                  <div
                    onClick={() => setActiveStatHighlight(activeStatHighlight === 'inquiries' ? null : 'inquiries')}
                    className={`bg-zinc-955 border p-4 rounded-xl text-center space-y-1.5 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-brand/5 select-none ${activeStatHighlight === 'inquiries'
                      ? 'border-brand bg-brand/5 ring-1 ring-brand/30'
                      : 'border-zinc-850 hover:border-zinc-700'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500 font-bold capitalize  block">Inquiries</span>
                      <MessageSquare className={`w-3.5 h-3.5 ${activeStatHighlight === 'inquiries' ? 'text-brand' : 'text-zinc-500'}`} />
                    </div>
                    <p className="text-xl font-bold text-amber-500 text-left pt-0.5">{pendingInquiriesCount}</p>
                    <div className="flex flex-wrap justify-between items-center text-xs gap-x-2 text-zinc-550 font-semibold pt-0.5">
                      <span className="capitalize text-amber-900/60 font-bold">Pending</span>
                      <span className=" text-zinc-500">{resolvedInquiriesCount} Solved</span>
                    </div>
                  </div>

                  {/* Completed Card */}
                  <div
                    onClick={() => setActiveStatHighlight(activeStatHighlight === 'completed' ? null : 'completed')}
                    className={`bg-zinc-955 border p-4 rounded-xl text-center space-y-1.5 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-brand/5 select-none ${activeStatHighlight === 'completed'
                      ? 'border-brand bg-brand/5 ring-1 ring-brand/30'
                      : 'border-zinc-850 hover:border-zinc-700'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500 font-bold capitalize  block">Completed</span>
                      <Check className={`w-3.5 h-3.5 ${activeStatHighlight === 'completed' ? 'text-brand' : 'text-zinc-500'}`} />
                    </div>
                    <p className="text-xl font-bold text-brand text-left pt-0.5">{completedBookingsCount}</p>
                    <div className="flex flex-wrap justify-between items-center text-xs gap-x-2 text-zinc-500 font-semibold pt-0.5">
                      <span className="capitalize text-brand/70">{bookingCompletionRate}% rate</span>
                      <span className=" text-zinc-650">{totalBookingsCount} total</span>
                    </div>
                  </div>

                  {/* Revenue Card */}
                  <div
                    onClick={() => setActiveStatHighlight(activeStatHighlight === 'revenue' ? null : 'revenue')}
                    className={`bg-zinc-955 border p-4 rounded-xl text-center space-y-1.5 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-brand/5 select-none ${activeStatHighlight === 'revenue'
                      ? 'border-brand bg-brand/5 ring-1 ring-brand/30'
                      : 'border-zinc-850 hover:border-zinc-700'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500 font-bold capitalize  block">Revenue Est.</span>
                      <span className={`text-sm font-bold ${activeStatHighlight === 'revenue' ? 'text-brand' : 'text-zinc-500'}`}>₹</span>
                    </div>
                    <p className="text-xl font-bold text-emerald-450 text-left pt-0.5">₹{totalRevenue}</p>
                    <div className="flex flex-wrap justify-between items-center text-xs gap-x-2 text-zinc-500 font-semibold pt-0.5">
                      <span className="capitalize text-zinc-400">Completed</span>
                      <span className=" text-zinc-600">₹{projectedRevenue} Proj.</span>
                    </div>
                  </div>
                </div>

                {/* Interactive KPI Detail Drawer/Panel */}
                {activeStatHighlight && (
                  <div className="bg-zinc-950 border border-zinc-850 p-5 rounded-xl space-y-4 animate-in slide-in-from-top-4 duration-300 relative">
                    <button
                      onClick={() => setActiveStatHighlight(null)}
                      className="absolute top-4 right-4 p-1.5 bg-zinc-900 hover:bg-zinc-805 text-zinc-450 hover:text-white rounded border border-zinc-800 cursor-pointer transition border-none"
                      title="Close Details Panel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    {activeStatHighlight === 'students' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                          <User className="w-4 h-4 text-brand" />
                          <h4 className="font-header font-bold text-sm capitalize text-white">Students Registry Breakdown</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="bg-zinc-900/60 p-4 rounded-lg border border-zinc-850 space-y-3">
                            <span className="text-sm capitalize font-bold  text-zinc-500 block">Activity Distribution</span>
                            <div className="flex gap-2">
                              <div className="flex-1 bg-zinc-950 p-2.5 rounded border border-zinc-850 text-center">
                                <span className="text-sm text-emerald-450 font-bold capitalize  block">Active Accounts</span>
                                <p className="text-lg font-bold text-white">{activeStudentsCount}</p>
                              </div>
                              <div className="flex-1 bg-zinc-955 p-2.5 rounded border border-zinc-850 text-center">
                                <span className="text-sm text-rose-500 font-bold capitalize  block">Suspended Accounts</span>
                                <p className="text-lg font-bold text-white">{suspendedStudentsCount}</p>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm text-zinc-500 font-bold capitalize">
                                <span>Active: {studentsCount > 0 ? Math.round((activeStudentsCount / studentsCount) * 100) : 100}%</span>
                                <span>Suspended: {studentsCount > 0 ? Math.round((suspendedStudentsCount / studentsCount) * 100) : 0}%</span>
                              </div>
                              <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-850 flex">
                                <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${studentsCount > 0 ? (activeStudentsCount / studentsCount) * 100 : 100}%` }} />
                                <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: `${studentsCount > 0 ? (suspendedStudentsCount / studentsCount) * 100 : 0}%` }} />
                              </div>
                            </div>
                          </div>

                          <div className="bg-zinc-900/60 p-4 rounded-lg border border-zinc-850 space-y-3">
                            <span className="text-sm capitalize font-bold  text-zinc-500 block">Latest Registrations</span>
                            <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                              {usersDb.filter(u => u.role === 'USER' || !u.role).reverse().slice(0, 3).map(st => (
                                <div key={st.id} className="flex justify-between items-center text-sm bg-zinc-955 p-2 rounded border border-zinc-855">
                                  <div>
                                    <span className="font-bold text-white block truncate max-w-[140px]">{st.name}</span>
                                    <span className="text-sm text-zinc-500  block break-all">{st.email}</span>
                                  </div>
                                  <span className={`text-sm px-1.5 py-0.2 rounded capitalize font-bold ${st.status === 'SUSPENDED' ? 'bg-rose-955/20 text-rose-500 border border-rose-900/30' : 'bg-emerald-955/20 text-emerald-450 border border-emerald-900/30'
                                    }`}>{st.status || 'ACTIVE'}</span>
                                </div>
                              ))}
                              {studentsCount === 0 && <p className="text-zinc-650 italic text-center py-4">No students registered yet.</p>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeStatHighlight === 'psychologists' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                          <Award className="w-4 h-4 text-brand" />
                          <h4 className="font-header font-bold text-sm capitalize text-white">Psychologists Status & Verification</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                          <div className="sm:col-span-4 bg-zinc-900/60 p-4 rounded-lg border border-zinc-850 space-y-3">
                            <span className="text-sm capitalize font-bold  text-zinc-500 block text-center">Verification Ratio</span>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm bg-zinc-950 p-2.5 rounded border border-zinc-850">
                                <span className="text-zinc-400 font-bold capitalize text-sm">Approved Advisors</span>
                                <span className="text-brand font-bold ">{approvedPsyCount}</span>
                              </div>
                              <div className="flex justify-between text-sm bg-zinc-950 p-2.5 rounded border border-zinc-850">
                                <span className="text-zinc-400 font-bold capitalize text-sm">Pending Approval</span>
                                <span className="text-amber-500 font-bold ">{pendingPsyCount}</span>
                              </div>
                            </div>
                          </div>

                          <div className="sm:col-span-8 bg-zinc-900/60 p-4 rounded-lg border border-zinc-850 space-y-3">
                            <span className="text-sm capitalize font-bold  text-zinc-500 block">Pending Acceptance Requests ({pendingPsyCount})</span>
                            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                              {usersDb.filter(u => u.role === 'PSYCHOLOGIST' && u.status === 'PENDING').map(psy => (
                                <div key={psy.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-zinc-955 p-2.5 rounded border border-zinc-850 text-sm">
                                  <div>
                                    <span className="font-bold text-white capitalize block leading-tight">{psy.name}</span>
                                    <span className="text-zinc-500  text-sm break-all">{psy.email}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                                    <button
                                      onClick={() => handleTogglePsyVerification(psy.id, false)}
                                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm font-bold capitalize  cursor-pointer border-none transition"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => handleRejectPsy(psy.id)}
                                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-sm font-bold capitalize  cursor-pointer border-none transition"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </div>
                              ))}
                              {pendingPsyCount === 0 && (
                                <div className="text-zinc-550 italic text-sm py-6 text-center">No pending verification requests. All psychologists are fully approved.</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeStatHighlight === 'bookings' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                          <Calendar className="w-4 h-4 text-brand" />
                          <h4 className="font-header font-bold text-sm capitalize text-white">Consultation Bookings Analytics</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                          <div className="bg-zinc-900/60 p-4 rounded-lg border border-zinc-850 space-y-3">
                            <span className="text-sm capitalize font-bold  text-zinc-500 block">Status Breakdown</span>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between border-b border-zinc-950 pb-1">
                                <span className="text-zinc-400">Confirmed Sessions</span>
                                <span className="text-white font-bold ">{confirmedBookingsCount}</span>
                              </div>
                              <div className="flex justify-between border-b border-zinc-950 pb-1">
                                <span className="text-zinc-400">Pending Requests</span>
                                <span className="text-white font-bold ">{pendingBookingsCount}</span>
                              </div>
                              <div className="flex justify-between border-b border-zinc-950 pb-1">
                                <span className="text-zinc-400">Completed Sessions</span>
                                <span className="text-brand font-bold ">{completedBookingsCount}</span>
                              </div>
                              <div className="flex justify-between border-b border-zinc-950 pb-1">
                                <span className="text-zinc-400">Expired/No-Show</span>
                                <span className="text-rose-500 font-bold ">{expiredBookingsCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Cancelled/Released</span>
                                <span className="text-rose-500 font-bold ">{cancelledBookingsCount}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-zinc-900/60 p-4 rounded-lg border border-zinc-850 space-y-3">
                            <span className="text-sm capitalize font-bold  text-zinc-500 block">Service Breakdown</span>
                            <div className="space-y-2.5 text-sm">
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm font-bold capitalize">
                                  <span className="text-zinc-450">Emotional Wellbeing</span>
                                  <span className="text-white ">{counsellingCount} booked</span>
                                </div>
                                <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-850 flex">
                                  <div className="bg-brand h-full rounded-full" style={{ width: `${totalBookingsCount > 0 ? (counsellingCount / totalBookingsCount) * 100 : 0}%` }} />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm font-bold capitalize">
                                  <span className="text-zinc-450">Career Mapping (Aptitude)</span>
                                  <span className="text-white ">{aptitudeCount} booked</span>
                                </div>
                                <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-850 flex">
                                  <div className="bg-brand h-full rounded-full" style={{ width: `${totalBookingsCount > 0 ? (aptitudeCount / totalBookingsCount) * 100 : 0}%` }} />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-zinc-900/60 p-4 rounded-lg border border-zinc-850 space-y-3">
                            <span className="text-sm capitalize font-bold  text-zinc-500 block">Session Mode Breakdown</span>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between border-b border-zinc-950 pb-1">
                                <span className="text-zinc-400">Online Google Meet</span>
                                <span className="text-white font-bold ">{onlineCount}</span>
                              </div>
                              <div className="flex justify-between border-b border-zinc-950 pb-1">
                                <span className="text-zinc-400">Offline Center Visit</span>
                                <span className="text-white font-bold ">{offlineCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Doorstep Outreach</span>
                                <span className="text-white font-bold ">{doorstepCount}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeStatHighlight === 'inquiries' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                          <MessageSquare className="w-4 h-4 text-brand" />
                          <h4 className="font-header font-bold text-sm capitalize text-white">Student Inquiries Desk</h4>
                        </div>
                        <div className="bg-zinc-900/60 p-4 rounded-lg border border-zinc-850 space-y-3">
                          <span className="text-sm capitalize font-bold  text-zinc-500 block">Pending Inquiries ({pendingInquiriesCount})</span>
                          <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                            {inquiriesDb.filter(i => i.status === 'PENDING' || !i.status).map(inq => (
                              <div key={inq.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-955 p-2.5 rounded border border-zinc-850 text-sm">
                                <div className="min-w-0 flex-1">
                                  <span className="font-bold text-white capitalize block leading-tight break-all">{inq.name} ({inq.email})</span>
                                  <p className="text-zinc-450 font-medium italic mt-1 ">"{inq.message}"</p>
                                </div>
                                <button
                                  onClick={() => handleResolveInquiry(inq.id)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm font-bold capitalize  cursor-pointer border-none transition shrink-0 self-end sm:self-auto"
                                >
                                  Quick Resolve
                                </button>
                              </div>
                            ))}
                            {pendingInquiriesCount === 0 && (
                              <div className="text-zinc-550 italic text-sm py-6 text-center">All inquiries resolved. Excellent response rate!</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeStatHighlight === 'completed' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                          <Check className="w-4 h-4 text-brand" />
                          <h4 className="font-header font-bold text-sm capitalize text-white">Session Fulfilment Rates</h4>
                        </div>
                        <div className="bg-zinc-900/60 p-5 rounded-lg border border-zinc-850 space-y-4 text-center">
                          <span className="text-sm capitalize font-bold  text-zinc-500 block">Session Completion Analysis</span>
                          <div className="max-w-md mx-auto space-y-3">
                            <p className="text-zinc-350 text-sm font-semibold">
                              Overall Completion Rate: <span className="text-brand font-bold ">{bookingCompletionRate}%</span>
                            </p>
                            <div className="w-full bg-zinc-955 h-3 rounded-full overflow-hidden border border-zinc-850 p-0.5">
                              <div className="bg-gradient-to-r from-brand to-brand-accent h-full rounded-full transition-all duration-500" style={{ width: `${bookingCompletionRate}%` }} />
                            </div>
                            <p className="text-sm text-zinc-550 leading-relaxed pt-2">
                              Out of {totalBookingsCount} total scheduled consultations, {completedBookingsCount} sessions have been completed, {expiredBookingsCount} expired, and {cancelledBookingsCount} cancelled. Active/Scheduled sessions total {activeBookings}.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeStatHighlight === 'revenue' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                          <span className="text-brand font-bold text-sm">₹</span>
                          <h4 className="font-header font-bold text-sm capitalize text-white">Revenue Audits</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                          <div className="bg-zinc-900/60 p-4.5 rounded-lg border border-zinc-850 space-y-1">
                            <span className="text-sm text-zinc-500 font-bold capitalize  block">Completed Gross Revenue</span>
                            <p className="text-xl font-bold text-emerald-450 ">₹{totalRevenue}</p>
                            <span className="text-xs text-zinc-650 font-bold block capitalize mt-1">INR Fulfilled</span>
                          </div>
                          <div className="bg-zinc-900/60 p-4.5 rounded-lg border border-zinc-850 space-y-1">
                            <span className="text-sm text-zinc-500 font-bold capitalize  block">Projected Booked Revenue</span>
                            <p className="text-xl font-bold text-white ">₹{projectedRevenue}</p>
                            <span className="text-xs text-zinc-650 font-bold block capitalize mt-1">Scheduled (CONFIRMED/PENDING)</span>
                          </div>
                          <div className="bg-zinc-900/60 p-4.5 rounded-lg border border-zinc-850 space-y-1">
                            <span className="text-sm text-zinc-500 font-bold capitalize  block">Est. Commission & Margins</span>
                            <p className="text-xl font-bold text-brand ">₹{Math.round(totalRevenue * 0.15)}</p>
                            <span className="text-xs text-zinc-650 font-bold block capitalize mt-1">15% Platform service share</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick actions panel */}
                <div className="bg-zinc-955 border border-zinc-855 p-4.5 rounded-xl space-y-3">
                  <span className="text-sm capitalize font-bold  text-zinc-500 block">Quick Action Gateways</span>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        setUserForm({ id: '', name: '', email: '', password: '', phone: '', schoolName: '', grade: '', guardianName: '', guardianPhone: '', groupCode: '' });
                        setUserProfilePicFile(null);
                        setUserFormError('');
                        setUserFormSuccess('');
                        setIsAddUserOpen(true);
                      }}
                      className="px-4.5 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white rounded-lg border border-zinc-800 transition cursor-pointer text-sm font-bold capitalize  flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-brand" /> Provision Student
                    </button>
                    <button
                      onClick={() => {
                        setPsyForm({
                          id: '', name: '', email: '', password: '',
                          education: 'MPhil Clinical Psychology',
                          specialties: 'Anxiety Stress & Panic, Depression & Mood Concerns, Relationship',
                          price: 1250, lang: 'Malayalam, English', bio: ''
                        });
                        setAdminActiveDays({
                          1: true, 2: true, 3: true, 4: true, 5: true, 6: false, 0: false
                        });
                        setAdminAvailableSlots([]);
                        setAdminAllSlots([]);
                        setPsyFormError('');
                        setPsyFormSuccess('');
                        setIsAddPsyOpen(true);
                      }}
                      className="px-4.5 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white rounded-lg border border-zinc-800 transition cursor-pointer text-sm font-bold capitalize  flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-brand" /> Register Psychologist
                    </button>
                    <button
                      onClick={() => {
                        const firstStudent = usersDb.find(u => u.role === 'USER' || !u.role);
                        const firstPsy = usersDb.find(u => u.role === 'PSYCHOLOGIST');
                        let firstSlot = '';
                        if (firstPsy && firstPsy.availability?.availableSlots?.length > 0) {
                          firstSlot = firstPsy.availability.availableSlots[0];
                        }
                        setBookingForm({
                          id: '', userId: firstStudent?.id || '', advisorId: firstPsy?.id || '',
                          service: 'counselling', mode: 'ONLINE',
                          date: getLocalTodayString(), time: firstSlot,
                          meetLink: '', status: 'CONFIRMED'
                        });
                        setBookingFormError('');
                        setBookingFormSuccess('');
                        setIsAddBookingOpen(true);
                      }}
                      className="px-4.5 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white rounded-lg border border-zinc-800 transition cursor-pointer text-sm font-bold capitalize  flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5 text-brand" /> Schedule Booking
                    </button>
                  </div>
                </div>

                {/* Main overview columns */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Live Activity Feed Segmented Panel (Col Span 8) */}
                  <div className="lg:col-span-8 bg-zinc-955 border border-zinc-850 rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                      <span className="text-sm capitalize font-bold  text-zinc-400">Live Activity Feed</span>
                      <span className="text-sm text-zinc-500  capitalize">Sync OK • {formatDateString(new Date())}</span>
                    </div>

                    {/* Tab Segment Controls */}
                    <div className="flex gap-2 bg-zinc-900/60 p-1 rounded-lg border border-zinc-800 overflow-x-auto hide-scrollbar">
                      <button
                        onClick={() => setOverviewActivityTab('bookings')}
                        className={`flex-1 px-4 py-2 whitespace-nowrap rounded-md text-sm font-bold capitalize transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 shrink-0 ${overviewActivityTab === 'bookings'
                          ? 'bg-brand text-zinc-955 font-bold shadow-sm'
                          : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-950'
                          }`}
                      >
                        <Calendar className="w-3.5 h-3.5" /> Bookings
                      </button>
                      <button
                        onClick={() => setOverviewActivityTab('inquiries')}
                        className={`flex-1 px-4 py-2 whitespace-nowrap rounded-md text-sm font-bold capitalize transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 shrink-0 ${overviewActivityTab === 'inquiries'
                          ? 'bg-brand text-zinc-955 font-bold shadow-sm'
                          : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-955'
                          }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Inquiries
                      </button>
                      <button
                        onClick={() => setOverviewActivityTab('results')}
                        className={`flex-1 px-4 py-2 whitespace-nowrap rounded-md text-sm font-bold capitalize transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 shrink-0 ${overviewActivityTab === 'results'
                          ? 'bg-brand text-zinc-955 font-bold shadow-sm'
                          : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-955'
                          }`}
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" /> Aptitude Results
                      </button>
                    </div>

                    {/* Tab Lists */}
                    <div className="space-y-3.5">
                      {overviewActivityTab === 'bookings' && (
                        <div className="space-y-2.5 animate-in fade-in duration-200">
                          {isDbLoading ? (
                            [...Array(3)].map((_, idx) => (
                              <div key={idx} className="animate-pulse bg-zinc-900/40 p-3 rounded-lg border border-zinc-855 flex items-center justify-between h-[64px]">
                                <div className="space-y-2 flex-1">
                                  <div className="h-4 bg-zinc-900 rounded w-1/3" />
                                  <div className="h-3 bg-zinc-900 rounded w-1/2" />
                                </div>
                                <div className="h-8 bg-zinc-900 rounded w-20" />
                              </div>
                            ))
                          ) : (
                            <>
                              {[...bookingsDb].reverse().slice(0, 3).map(b => (
                                <div key={b.id} className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-855 text-sm hover:border-zinc-800 transition-colors">
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-3 flex-1 min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-bold text-white capitalize shrink-0">{b.userName}</span>
                                        <span className="text-zinc-550 text-xs shrink-0">booked with</span>
                                        <span className="font-bold text-brand capitalize shrink-0">{b.advisorName}</span>
                                        <span className="text-xs bg-zinc-950 text-zinc-400 border border-zinc-850 px-2 py-1 rounded font-bold uppercase tracking-wider shrink-0 whitespace-nowrap mt-1 sm:mt-0">
                                          {formatDateString(b.date)} • {b.time}
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[11px] bg-zinc-950 text-zinc-400 border border-zinc-850 px-2 py-1 rounded font-bold uppercase tracking-wider shrink-0 whitespace-nowrap">{b.mode}</span>
                                        <span className="text-[11px] bg-zinc-950 text-zinc-500 border border-zinc-850 px-2 py-1 rounded font-bold uppercase tracking-wider shrink-0 whitespace-nowrap">{b.service}</span>
                                        <span className={`text-[11px] px-2 py-1 rounded uppercase tracking-wider font-bold border shrink-0 whitespace-nowrap ${b.status === 'CONFIRMED' ? 'bg-emerald-955/20 border-emerald-900/40 text-emerald-450' :
                                          b.status === 'PENDING' ? 'bg-amber-955/20 border-amber-900/40 text-amber-500' :
                                          b.status === 'COMPLETED' ? 'bg-brand/10 border-brand/20 text-brand' :
                                          b.status === 'CANCELLED' ? 'bg-rose-955/20 border-rose-900/30 text-rose-500' :
                                          'bg-zinc-800 border-zinc-700 text-zinc-400'
                                        }`}>{b.status}</span>
                                      </div>
                                    </div>
                                    <div className="w-full md:w-auto flex justify-start md:justify-end shrink-0 pt-2 md:pt-0">
                                      <button
                                        onClick={() => setSelectedOverviewBooking(selectedOverviewBooking === b.id ? null : b.id)}
                                        className="px-4 py-2 bg-zinc-955 hover:bg-zinc-900 border border-zinc-850 hover:border-brand/40 text-brand rounded-lg text-sm font-bold capitalize transition-colors cursor-pointer w-full md:w-auto shadow-sm relative z-20"
                                      >
                                        {selectedOverviewBooking === b.id ? 'Hide Details' : 'View Details'}
                                      </button>
                                    </div>
                                  </div>
                                  {selectedOverviewBooking === b.id && (
                                    <div className="w-full mt-3 pt-3 border-t border-zinc-900/60 space-y-2 text-zinc-455 animate-in slide-in-from-top-2 duration-200">
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-zinc-955/60 p-2.5 rounded border border-zinc-900">
                                        <div>
                                          <span className="text-zinc-550 block font-bold capitalize text-xs ">Advisor Designation</span>
                                          <span className="text-white font-medium block mt-0.5">{b.advisorRole || 'Consultant Psychologist'}</span>
                                        </div>
                                        <div>
                                          <span className="text-zinc-550 block font-bold capitalize text-xs ">Appointment ID</span>
                                          <span className="text-zinc-400 block mt-0.5 break-all select-all">{b.id}</span>
                                        </div>
                                      </div>
                                      {b.meetLink ? (
                                        <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded border border-zinc-900 mt-2">
                                          <span className="truncate text-brand  select-all text-sm pr-2">{b.meetLink}</span>
                                          <button
                                            onClick={async () => {
                                              navigator.clipboard.writeText(b.meetLink);
                                              await showAlert("Google Meet Link copied!", "Success");
                                            }}
                                            className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:border-brand/40 text-white rounded text-sm font-bold cursor-pointer transition shrink-0"
                                          >
                                            Copy Link
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="text-sm text-zinc-555 italic mt-1 pb-1">No video meeting link generated for this booking.</div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                              {bookingsDb.length === 0 && <p className="text-zinc-550 italic text-sm text-center py-6">No recent bookings recorded.</p>}
                            </>
                          )}
                        </div>
                      )}

                      {overviewActivityTab === 'inquiries' && (
                        <div className="space-y-2.5 animate-in fade-in duration-200">
                          {isDbLoading ? (
                            [...Array(3)].map((_, idx) => (
                              <div key={idx} className="animate-pulse bg-zinc-900/40 p-3 rounded-lg border border-zinc-855 flex items-center justify-between h-[64px]">
                                <div className="space-y-2 flex-1">
                                  <div className="h-4 bg-zinc-900 rounded w-1/3" />
                                  <div className="h-3 bg-zinc-900 rounded w-1/2" />
                                </div>
                                <div className="h-8 bg-zinc-900 rounded w-20" />
                              </div>
                            ))
                          ) : (
                            <>
                                                            {[...inquiriesDb].reverse().slice(0, 3).map(i => {
                                                              const isResolved = i.status === 'RESOLVED';
                                                              return (
                                                                <div key={i.id} className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-855 text-sm space-y-3.5 hover:border-zinc-800 transition-colors">
                                                                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3.5">
                                                                    <div>
                                                                      <span className="text-white font-bold capitalize block leading-tight">{i.name}</span>
                                                                      <span className="text-zinc-550 text-xs block mt-0.5 break-all">{i.email}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 shrink-0">
                                                                      <span className="text-xs bg-zinc-950 text-zinc-400 border border-zinc-850 px-2 py-0.5 rounded font-bold capitalize">{formatDateString(i.date)}</span>
                                                                      <span className={`text-xs px-2 py-0.5 rounded capitalize font-bold border ${isResolved ? 'bg-emerald-955/20 border-emerald-900/30 text-emerald-455' : 'bg-amber-955/20 border-amber-900/30 text-amber-500'}`}>{i.status || 'PENDING'}</span>
                                                                    </div>
                                                                  </div>
                                                                  <p className="text-zinc-350 font-medium italic border-l-2 border-brand/30 pl-2.5 leading-relaxed bg-zinc-955/20 p-2.5 rounded-r-lg">"{i.message}"</p>
                              
                                                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-900/40">
                                                                    <button
                                                                      onClick={() => handleResolveInquiry(i.id)}
                                                                      className={`px-3 py-1.5 rounded-lg text-sm font-bold capitalize cursor-pointer border transition-colors shrink-0 ${isResolved
                                                                        ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-400 hover:text-white'
                                                                        : 'bg-emerald-600 hover:bg-emerald-700 border-none text-white'
                                                                        }`}
                                                                    >
                                                                      {isResolved ? 'Mark Pending' : 'Mark Resolved'}
                                                                    </button>
                                                                    <div className="flex items-center gap-2 w-full sm:max-w-md shrink-0">
                                                                      <input
                                                                        type="text"
                                                                        placeholder="Add staff summary note..."
                                                                        value={inquiryNotesText[i.id] !== undefined ? inquiryNotesText[i.id] : (i.note || '')}
                                                                        onChange={(e) => setInquiryNotesText({ ...inquiryNotesText, [i.id]: e.target.value })}
                                                                        className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none"
                                                                      />
                                                                      <button
                                                                        onClick={() => handleSaveInquiryNote(i.id, inquiryNotesText[i.id] || '')}
                                                                        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-805 border border-zinc-800 hover:border-brand text-brand font-bold rounded-lg text-sm capitalize cursor-pointer transition shrink-0"
                                                                      >
                                                                        Save
                                                                      </button>
                                                                    </div>
                                                                  </div>
                                                                </div>
                                                              );
                                                            })}
                              {inquiriesDb.length === 0 && <p className="text-zinc-550 italic text-sm text-center py-6">No recent inquiries recorded.</p>}
                            </>
                          )}
                        </div>
                      )}

                      {overviewActivityTab === 'results' && (
                        <div className="space-y-2.5 animate-in fade-in duration-200">
                          {isDbLoading ? (
                            [...Array(3)].map((_, idx) => (
                              <div key={idx} className="animate-pulse bg-zinc-900/40 p-3 rounded-lg border border-zinc-855 flex items-center justify-between h-[64px]">
                                <div className="space-y-2 flex-1">
                                  <div className="h-4 bg-zinc-900 rounded w-1/3" />
                                  <div className="h-3 bg-zinc-900 rounded w-1/2" />
                                </div>
                                <div className="h-8 bg-zinc-900 rounded w-20" />
                              </div>
                            ))
                          ) : (
                            <>
                              {[...testResultsDb].reverse().slice(0, 3).map(res => (
                                <div key={res.id} className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-855 text-sm space-y-3.5 hover:border-zinc-800 transition-colors">
                                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3.5">
                                    <div>
                                      <span className="text-white font-bold capitalize block leading-tight">{res.studentName}</span>
                                      <span className="text-zinc-550 text-xs block mt-0.5">{res.studentEmail}</span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="text-xs bg-zinc-950 text-zinc-400 border border-zinc-850 px-2 py-0.5 rounded font-bold capitalize">{formatDateString(res.date)}</span>
                                      <span className="text-xs bg-brand/10 border border-brand/20 text-brand px-2 py-0.5 rounded font-bold capitalize">
                                        Dominant: {res.dominantDomain.toUpperCase()}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="border-t border-zinc-900/60 pt-3 space-y-2.5">
                                    <span className="text-[11px] font-bold text-zinc-550 uppercase tracking-wider block">Cognitive Domain Breakdown</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                      {Object.entries(res.scores || {}).slice(0, 3).map(([key, val]) => (
                                        <div key={key} className="space-y-1 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-900">
                                          <div className="flex flex-wrap justify-between items-center text-xs gap-x-2 font-bold text-zinc-400 capitalize">
                                            <span>{key}</span>
                                            <span className="text-white">{val}%</span>
                                          </div>
                                          <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden border border-zinc-850">
                                            <div className="bg-brand h-full rounded-full transition-all duration-500" style={{ width: `${val}%` }} />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {testResultsDb.length === 0 && <p className="text-zinc-550 italic text-sm text-center py-6">No recent aptitude results recorded.</p>}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* System health & visual meters (Col Span 4) */}
                  <div className="lg:col-span-4 bg-zinc-955 border border-zinc-850 rounded-xl p-5 space-y-5 text-sm">
                    <div className="border-b border-zinc-900 pb-2 flex items-center justify-between">
                      <span className="text-sm capitalize font-bold  text-zinc-400">Database & System Health</span>
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-sm text-zinc-500 font-bold capitalize ">LIVE SYNC</span>
                      </div>
                    </div>

                    {/* Progress Ratios and Meters */}
                    <div className="space-y-3 pb-3 border-b border-zinc-900">
                      <span className="text-sm capitalize font-bold  text-zinc-550 block">Ratios & Fulfillment</span>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-sm font-bold capitalize">
                          <span className="text-zinc-400">Booking Completion</span>
                          <span className="text-brand  font-bold">{bookingCompletionRate}%</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-850">
                          <div className="bg-gradient-to-r from-brand to-brand-accent h-full rounded-full transition-all duration-500" style={{ width: `${bookingCompletionRate}%` }} />
                        </div>
                        <span className="text-xs text-zinc-500 block text-right font-medium">{completedBookingsCount} of {totalBookingsCount} sessions</span>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between items-center text-sm font-bold capitalize">
                          <span className="text-zinc-400">Inquiry Resolution</span>
                          <span className="text-brand  font-bold">{inquiryResolutionRate}%</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-850">
                          <div className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500" style={{ width: `${inquiryResolutionRate}%` }} />
                        </div>
                        <span className="text-xs text-zinc-500 block text-right font-medium">{resolvedInquiriesCount} of {totalInquiriesCount} queries</span>
                      </div>
                    </div>

                    {/* Storage details */}
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-450 font-bold capitalize text-sm">Sandbox Storage</span>
                        <span className="text-white font-bold ">{kbUsed} KB Used</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-850">
                        <div className="bg-brand h-full rounded-full" style={{ width: `${Math.min(100, Number(kbUsed) * 2)}%` }} />
                      </div>

                      <div className="space-y-2.5 pt-2 font-bold capitalize text-sm tracking-wide">
                        <div className="flex items-center gap-2 text-emerald-450">
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          <span>Seed Accounts Intact</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-450">
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          <span>Local Auth Resolver OK</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-450">
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          <span>Security Gate Active</span>
                        </div>
                      </div>
                    </div>

                    {/* Security scan console */}
                    <div className="pt-3 border-t border-zinc-900 space-y-2">
                      <span className="text-sm capitalize font-bold  text-zinc-550 block">Database Security Check</span>
                      {isScanning ? (
                        <div className="space-y-2 bg-zinc-950 p-2.5 rounded border border-zinc-900">
                          <div className="flex justify-between items-center text-sm  text-zinc-455">
                            <span className="animate-pulse">Scanning database...</span>
                            <span>{scanProgress}%</span>
                          </div>
                          <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden border border-zinc-800">
                            <div className="bg-brand h-full rounded-full transition-all duration-100" style={{ width: `${scanProgress}%` }} />
                          </div>
                        </div>
                      ) : scanResults ? (
                        <div className="bg-zinc-905 p-2.5 rounded border border-zinc-850 space-y-2 animate-in fade-in duration-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm bg-emerald-955/20 border border-emerald-900/40 text-emerald-450 px-2 py-0.5 rounded font-bold  capitalize ">SECURE</span>
                            <span className="text-sm text-zinc-550 ">{scanResults.timestamp}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 text-sm text-zinc-400 font-semibold capitalize">
                            {scanResults.checks.map(chk => (
                              <div key={chk.name} className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-450 shrink-0" />
                                <span className="truncate">{chk.name}</span>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => setScanResults(null)}
                            className="w-full py-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-855 text-zinc-500 hover:text-white rounded text-sm font-bold capitalize  cursor-pointer transition"
                          >
                            Dismiss Report
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleRunSecurityCheck}
                          className="w-full py-2 bg-brand/10 hover:bg-brand text-brand hover:text-zinc-955 border border-brand/20 hover:border-brand rounded text-sm font-bold capitalize  cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-brand hover:text-zinc-955 transition-colors" /> Scan Integrity & Schemas
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sub-admins list table */}
                <div className="pt-4 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
                    <h4 className="font-header font-bold text-zinc-300 text-sm capitalize ">Active Sub-Admin Personnel</h4>
                    <div className="flex gap-2">
                      <button onClick={() => handleExportPDF('subadmins-table', 'SubAdmins_Directory')} className="px-2 py-1 border border-zinc-800 hover:bg-zinc-850 hover:text-white text-zinc-400 text-xs font-bold rounded transition-colors cursor-pointer capitalize">Export PDF</button>
                      <button onClick={() => handleExportImage('subadmins-table', 'SubAdmins_Directory')} className="px-2 py-1 border border-zinc-800 hover:bg-zinc-850 hover:text-white text-zinc-400 text-xs font-bold rounded transition-colors cursor-pointer capitalize">Export Image</button>
                    </div>
                  </div>
                  <div className="border border-zinc-850 rounded-lg overflow-hidden bg-zinc-955">
                    <div className="overflow-x-auto w-full">
                      <table id="subadmins-table" className="w-full text-sm border-collapse min-w-[650px]">
                        <thead>
                          <tr className="bg-zinc-900 text-zinc-400 font-bold capitalize  border-b border-zinc-850 text-left">
                            <th className="p-3 whitespace-nowrap">Staff Name</th>
                            <th className="p-3 whitespace-nowrap">Email Address</th>
                            <th className="p-3 whitespace-nowrap">Scopes Enabled</th>
                            <th className="p-3 text-center whitespace-nowrap">Edit Scopes</th>
                            <th className="p-3 text-center whitespace-nowrap">Delete</th>
                          </tr>
                        </thead>
                         <tbody>
                          {isDbLoading ? (
                            <SkeletonTableRows cols={5} />
                          ) : subAdminsList.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-5 text-center text-zinc-500 italic whitespace-nowrap">No sub-admin accounts registered. Create accounts inside the "Roles & Scopes" tab.</td>
                            </tr>
                          ) : (
                            subAdminsList.map(admin => {
                              const { cleanName, roleTitle } = parseStaffDetails(admin);
                              return (
                                <tr key={admin.id} className="border-b border-zinc-900 hover:bg-zinc-900/50">
                                  <td className="p-3 whitespace-nowrap">
                                    <span className="font-bold text-white block">{cleanName}</span>
                                    {roleTitle && (
                                      <span className="text-sm bg-brand/10 border border-brand/20 text-brand px-1.5 py-0.5 rounded font-bold  capitalize  inline-block mt-1">
                                        {roleTitle}
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 text-zinc-400 whitespace-nowrap">{admin.email}</td>
                                  <td className="p-3 whitespace-nowrap">
                                    <div className="flex flex-wrap gap-1">
                                      {(() => {
                                        const perms = admin.permissions || [];
                                        const activeModules = PRIVILEGE_MODULES.filter(m =>
                                          perms.includes(m.id) ||
                                          m.actions.some(act => perms.includes(act.id)) ||
                                          (m.id === 'manage_users' && perms.includes('MANAGE_USERS')) ||
                                          (m.id === 'manage_psychologists' && perms.includes('MANAGE_PSYCHOLOGISTS')) ||
                                          (m.id === 'manage_bookings' && perms.includes('MANAGE_BOOKINGS'))
                                        );
                                        if (activeModules.length === 0) {
                                          return <span className="text-xs text-zinc-600 italic">No permissions</span>;
                                        }
                                        const visible = activeModules.slice(0, 3);
                                        const hidden = activeModules.length - 3;
                                        return (
                                          <>
                                            {visible.map(m => (
                                              <span key={m.id} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-400 capitalize">
                                                {m.name.replace(' Management', '').replace(' & Leads', '')}
                                              </span>
                                            ))}
                                            {hidden > 0 && (
                                              <span className="px-2 py-0.5 rounded bg-brand/10 border border-brand/20 text-[10px] font-bold text-brand capitalize">
                                                +{hidden} more
                                              </span>
                                            )}
                                          </>
                                        );
                                      })()}
                                    </div>
                                  </td>
                                  <td className="p-3 text-center whitespace-nowrap">
                                    <button
                                      onClick={() => handleOpenEditSubAdmin(admin)}
                                      className="px-2.5 py-1 bg-zinc-900 text-brand hover:text-white rounded border border-zinc-800 hover:bg-zinc-855 transition cursor-pointer text-sm font-bold capitalize "
                                    >
                                      Edit
                                    </button>
                                  </td>
                                  <td className="p-3 text-center space-x-1 whitespace-nowrap">
                                    <button
                                      onClick={() => handleGenerateResetToken(admin.email)}
                                      className="p-1.5 bg-zinc-900 text-amber-500 hover:bg-amber-900/30 hover:text-amber-400 rounded border border-zinc-800 transition cursor-pointer inline-flex"
                                      title="Generate Password Reset Link"
                                    >
                                      <KeyRound className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(admin.id)}
                                      className="p-1.5 bg-rose-955/20 text-rose-500 hover:bg-rose-900 hover:text-white rounded border border-rose-900/30 transition cursor-pointer"
                                      title="Delete sub-admin account"
                                    >
                                      <Trash className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB 2: STUDENTS DIRECTORY */}
          {currentSection === 'users' && hasUserPermission && (() => {
            const handleExportStudentsCSV = async () => {
              const headers = "ID,Name,Email,Status,BookingsCount\n";
              const rows = studentsList.map(s => {
                const count = bookingsDb.filter(b => b.userId === s.id).length;
                return `"${s.id}","${s.name}","${s.email}","${s.status || 'ACTIVE'}",${count}`;
              }).join('\n');
              navigator.clipboard.writeText(headers + rows);
              await showAlert("Student directory CSV copied to clipboard!");
            };

            return (
              <div className="space-y-6 animate-in fade-in duration-200 text-sm">
                <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold capitalize  text-white font-header">Students Directory</h3>
                    <p className="text-sm text-zinc-500 font-medium pt-1">Register new student accounts, edit profiles, suspend/unsuspend access</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:max-w-[200px]">
                      <input
                        type="text"
                        placeholder="Search students..."
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm font-semibold focus:border-brand text-white outline-none"
                      />
                      <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                    </div>
                    <button
                      onClick={handleExportStudentsCSV}
                      className="px-3 py-2 border border-zinc-800 hover:bg-zinc-850 hover:text-white text-zinc-400 text-sm font-bold rounded-lg transition-colors cursor-pointer capitalize shrink-0"
                    >
                      Export CSV
                    </button>
                    <button onClick={() => handleExportPDF('students-table', 'Students_Directory')} className="px-3 py-2 border border-zinc-800 hover:bg-zinc-850 hover:text-white text-zinc-400 text-sm font-bold rounded-lg transition-colors cursor-pointer capitalize shrink-0">
                      Export PDF
                    </button>
                    <button onClick={() => handleExportImage('students-table', 'Students_Directory')} className="px-3 py-2 border border-zinc-800 hover:bg-zinc-850 hover:text-white text-zinc-400 text-sm font-bold rounded-lg transition-colors cursor-pointer capitalize shrink-0">
                      Export Image
                    </button>
                    {canAddStudents && (
                      <button
                        onClick={() => {
                          setUserForm({ id: '', name: '', email: '', password: '', phone: '', schoolName: '', grade: '', guardianName: '', guardianPhone: '', groupCode: '' });
                          setUserProfilePicFile(null);
                          setUserFormError('');
                          setUserFormSuccess('');
                          setIsAddUserOpen(true);
                        }}
                        className="px-4 py-2 bg-brand hover:bg-brand-dark text-zinc-950 text-sm font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 capitalize shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 text-zinc-955" /> Add Student
                      </button>
                    )}
                  </div>
                </div>

                <div className="border border-zinc-850 rounded-lg overflow-hidden bg-zinc-950">
                  <div className="overflow-x-auto w-full">
                    <table id="students-table" className="w-full text-sm border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-zinc-900 text-zinc-400 font-bold capitalize  border-b border-zinc-850 text-left">
                          <th className="p-3 whitespace-nowrap">Student Name</th>
                          <th className="p-3 whitespace-nowrap">Email Address</th>
                          <th className="p-3 text-center whitespace-nowrap">Status</th>
                          <th className="p-3 text-center whitespace-nowrap">Consultations</th>
                          <th className="p-3 text-center font-bold whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isDbLoading ? (
                          <SkeletonTableRows cols={5} />
                        ) : studentsList.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-zinc-500 italic whitespace-nowrap">No student registries match the active query.</td>
                          </tr>
                        ) : (
                          studentsList.slice((studentPage - 1) * studentLimit, studentPage * studentLimit).map(student => (
                            <tr key={student.id} className="border-b border-zinc-900 hover:bg-zinc-900/50">
                              <td className="p-3 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 text-brand flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                                    {student.profilePic || student.image ? (
                                      <img src={student.profilePic || student.image} alt={student.name} className="w-full h-full object-cover" />
                                    ) : (
                                      getInitials(student.name)
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-bold text-white block leading-tight">{student.name}</span>
                                    <span className="text-sm text-zinc-500 break-all">ID: {student.id}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-zinc-350 font-medium whitespace-nowrap">{student.email}</td>
                              <td className="p-3 text-center whitespace-nowrap">
                                <button
                                  onClick={() => handleToggleStudentStatus(student.id, student.status || 'ACTIVE')}
                                  className={`px-2 py-0.5 rounded text-sm font-bold capitalize  transition cursor-pointer border ${(student.status || 'ACTIVE') === 'ACTIVE'
                                    ? 'bg-emerald-955/20 border-emerald-900/40 text-emerald-450 hover:bg-rose-955/20 hover:border-rose-900 hover:text-rose-500'
                                    : 'bg-rose-955/20 border-rose-900/40 text-rose-500 hover:bg-emerald-955/20 hover:border-emerald-900 hover:text-emerald-450'
                                    }`}
                                  title={(student.status || 'ACTIVE') === 'ACTIVE' ? "Click to Suspend Student" : "Click to Unsuspend Student"}
                                >
                                  {student.status || 'ACTIVE'}
                                </button>
                              </td>
                              <td className="p-3 text-center font-bold text-zinc-300 whitespace-nowrap">
                                {bookingsDb.filter(b => b.userId === student.id).length} Booked
                              </td>
                                <td className="p-3 whitespace-nowrap">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => setViewingStudent(student)}
                                  className="px-2.5 py-1 bg-zinc-900 text-brand hover:text-white rounded border border-zinc-800 hover:bg-zinc-850 transition cursor-pointer text-sm font-bold capitalize "
                                >
                                  Details
                                </button>
                                {canEditStudents && (
                                  <button
                                    onClick={() => handleOpenEditUser(student)}
                                    className="p-1.5 bg-zinc-900 text-zinc-400 hover:text-white rounded border border-zinc-800 transition cursor-pointer"
                                    title="Edit Student"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {canEditStudents && (
                                  <button
                                    onClick={() => handleGenerateResetToken(student.email)}
                                    className="p-1.5 bg-zinc-900 text-amber-500 hover:bg-amber-900/30 hover:text-amber-400 rounded border border-zinc-800 transition cursor-pointer"
                                    title="Generate Password Reset Link"
                                  >
                                    <KeyRound className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {canDeleteStudents && (
                                  <button
                                    onClick={() => handleDeleteUser(student.id)}
                                    className="p-1.5 bg-rose-955/20 text-rose-500 hover:bg-rose-900 hover:text-white rounded border border-rose-900/30 transition cursor-pointer"
                                    title="Delete Student"
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
                  total={studentsList.length}
                  page={studentPage}
                  limit={studentLimit}
                  onPageChange={setStudentPage}
                  onLimitChange={setStudentLimit}
                />
              </div>
            );
          })()}

          {/* TAB 3: PSYCHOLOGISTS DIRECTORY */}
          {currentSection === 'psychologists' && hasPsyPermission && (
            <div className="space-y-6 animate-in fade-in duration-200 text-sm">
              <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold capitalize  text-white font-header">Psychologists Directory</h3>
                  <p className="text-sm text-zinc-500 font-medium pt-1">Register psychologist staff, update clinic credentials, or remove accounts</p>
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
                  <button onClick={() => handleExportPDF('counsellors-table', 'Psychologists_Directory')} className="px-3 py-2 border border-zinc-800 hover:bg-zinc-850 hover:text-white text-zinc-400 text-sm font-bold rounded-lg transition-colors cursor-pointer capitalize shrink-0">
                    Export PDF
                  </button>
                  <button onClick={() => handleExportImage('counsellors-table', 'Psychologists_Directory')} className="px-3 py-2 border border-zinc-800 hover:bg-zinc-850 hover:text-white text-zinc-400 text-sm font-bold rounded-lg transition-colors cursor-pointer capitalize shrink-0">
                    Export Image
                  </button>
                  {canAddPsy && (
                    <button
                      onClick={() => {
                        setPsyForm({
                          id: '',
                          name: '',
                          email: '',
                          password: '',
                          education: 'MPhil Clinical Psychology',
                          specialties: 'Anxiety Stress & Panic, Depression & Mood Concerns, Relationship',
                          price: 1250,
                          lang: 'Malayalam, English',
                          bio: ''
                        });
                        setAdminActiveDays({
                          1: true, 2: true, 3: true, 4: true, 5: true, 6: false, 0: false
                        });
                        setAdminAvailableSlots([]);
                        setAdminAllSlots([]);
                        setPsyFormError('');
                        setPsyFormSuccess('');
                        setIsAddPsyOpen(true);
                      }}
                      className="px-4 py-2 bg-brand hover:bg-brand-dark text-zinc-955 text-sm font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 capitalize shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 text-zinc-955" /> Add Psychologist
                    </button>
                  )}
                </div>
              </div>

              {/* Psychologist filter sub-tabs */}
              <div className="flex flex-wrap gap-2 pb-4">
                {[
                  { id: 'all', label: 'All Psychologists', count: usersDb.filter(u => u.role === 'PSYCHOLOGIST').length },
                  { id: 'pending', label: 'Pending Verification', count: usersDb.filter(u => u.role === 'PSYCHOLOGIST' && u.status !== 'APPROVED' && u.status !== 'ACTIVE' && u.status !== 'REJECTED').length },
                  { id: 'approved', label: 'Approved', count: usersDb.filter(u => u.role === 'PSYCHOLOGIST' && (u.status === 'APPROVED' || u.status === 'ACTIVE')).length },
                  { id: 'rejected', label: 'Rejected', count: usersDb.filter(u => u.role === 'PSYCHOLOGIST' && u.status === 'REJECTED').length }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setPsyFilter(tab.id);
                      setPsyPage(1);
                    }}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition duration-200 cursor-pointer flex items-center gap-1.5 ${
                      psyFilter === tab.id
                        ? 'bg-brand text-zinc-955'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      psyFilter === tab.id ? 'bg-zinc-955/20 text-zinc-955' : 'bg-zinc-800 text-zinc-500'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="border border-zinc-850 rounded-lg overflow-hidden bg-zinc-950">
                <div className="overflow-x-auto w-full">
                  <table id="counsellors-table" className="w-full text-sm border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-zinc-900 text-zinc-400 font-bold capitalize  border-b border-zinc-850 text-left">
                        <th className="p-3 whitespace-nowrap">Psychologist Name</th>
                        <th className="p-3 whitespace-nowrap">Email Address</th>
                        <th className="p-3 text-center whitespace-nowrap">Featured (Top 5)</th>
                        <th className="p-3 text-center whitespace-nowrap">Clearance Status</th>
                        <th className="p-3 text-center font-bold whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isDbLoading ? (
                        <SkeletonTableRows cols={5} />
                      ) : psychologistsList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-zinc-500 italic whitespace-nowrap">No psychologist registries match the active query.</td>
                        </tr>
                      ) : (
                        psychologistsList.slice((psyPage - 1) * psyLimit, psyPage * psyLimit).map(psy => (
                          <tr key={psy.id} className="border-b border-zinc-900 hover:bg-zinc-900/50">
                            <td className="p-3 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 text-brand flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                                  {psy.profilePic || psy.image ? (
                                    <img src={psy.profilePic || psy.image} alt={psy.name} className="w-full h-full object-cover" />
                                  ) : (
                                    getInitials(psy.name)
                                  )}
                                </div>
                                <div>
                                  <span className="font-bold text-white block leading-tight">{psy.name}</span>
                                  <span className="text-sm text-zinc-500 break-all">ID: {psy.id} • Active Profile</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-zinc-350 font-medium whitespace-nowrap">{psy.email}</td>
                            <td className="p-3 text-center whitespace-nowrap">
                              <button
                                onClick={() => handleTogglePsyTopFive(psy)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer border ${
                                  psy.isTopFive
                                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-amber-500/30'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-850'
                                }`}
                                title="Toggle Top 5 featured status"
                              >
                                {psy.isTopFive ? '★ Featured' : '☆ Feature'}
                              </button>
                            </td>
                            <td className="p-3 text-center whitespace-nowrap">
                              {(psy.status === 'APPROVED' || psy.status === 'ACTIVE') ? (
                                <div className="flex items-center justify-center gap-2">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-955/20 border border-emerald-900/40 text-emerald-450 text-sm font-bold capitalize ">
                                    <Check className="w-3.5 h-3.5 text-emerald-450" /> Approved
                                  </span>
                                  <button
                                    onClick={() => handleTogglePsyVerification(psy.id, true)}
                                    className="text-sm text-zinc-500 hover:text-rose-500 underline cursor-pointer bg-transparent border-none p-0 animate-in fade-in duration-200"
                                    title="Revoke acceptance"
                                  >
                                    Revoke
                                  </button>
                                </div>
                              ) : psy.status === 'REJECTED' ? (
                                <div className="flex items-center justify-center gap-2">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-955/20 border border-rose-900/40 text-rose-450 text-sm font-bold capitalize ">
                                    Rejected
                                  </span>
                                  <button
                                    onClick={() => handleTogglePsyVerification(psy.id, false)}
                                    className="text-sm text-zinc-500 hover:text-emerald-500 underline cursor-pointer bg-transparent border-none p-0 animate-in fade-in duration-200"
                                    title="Accept counselor"
                                  >
                                    Accept
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => handleTogglePsyVerification(psy.id, false)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-750 text-white rounded text-sm font-bold capitalize  cursor-pointer border-none shadow-sm transition-colors"
                                    title="Accept and verify counselor"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleRejectPsy(psy.id)}
                                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-sm font-bold capitalize  cursor-pointer border-none shadow-sm transition-colors"
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
                                className="px-2.5 py-1 bg-zinc-900 text-brand hover:text-white rounded border border-zinc-800 hover:bg-zinc-850 transition cursor-pointer text-sm font-bold capitalize "
                              >
                                Details
                              </button>
                              {canEditPsy && (
                                <button
                                  onClick={() => handleGenerateResetToken(psy.email)}
                                  className="px-2.5 py-1 bg-zinc-900 text-amber-500 hover:text-amber-400 rounded border border-zinc-800 hover:bg-amber-900/30 transition cursor-pointer text-sm font-bold capitalize "
                                  title="Generate Password Reset Link"
                                >
                                  <KeyRound className="w-4 h-4 inline-block" />
                                </button>
                              )}
                              <a
                                href={`#/advisor/${psy.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 bg-zinc-900 text-brand hover:text-white rounded border border-zinc-800 hover:bg-zinc-850 transition cursor-pointer text-sm font-bold capitalize  inline-block text-center"
                              >
                                Preview
                              </a>
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
          )}

          {/* TAB 4: SUB-ADMIN CREATOR & ROLES */}
          {currentSection === 'subadmins' && isSuperAdmin && (
            <div className="space-y-6 animate-in fade-in duration-200 text-sm">
              <div className="border-b border-zinc-805 pb-3">
                <h3 className="text-sm font-bold capitalize  text-white font-header">Staff Roles & Permissions Scopes</h3>
                <p className="text-sm text-zinc-500 font-medium pt-1">Create sub-admin staff, configure dynamic role titles, and adjust access permissions</p>
              </div>

              {/* Sub-tab navigation */}
              <div className="flex gap-2 border-b border-zinc-800 pb-px">
                <button
                  type="button"
                  onClick={() => {
                    setActiveRoleTab('roles');
                    setEditingRoleId(null);
                    setNewRoleName('');
                    setNewRoleDescription('');
                    setNewRolePermissions({});
                  }}
                  className={`px-4 py-2 border-b-2 text-sm font-bold capitalize transition-all cursor-pointer border-none bg-transparent ${activeRoleTab === 'roles'
                    ? 'border-brand text-brand font-bold'
                    : 'border-transparent text-zinc-400 hover:text-white'
                    }`}
                >
                  Roles & Staff Registry
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveRoleTab('new_role');
                  }}
                  className={`px-4 py-2 border-b-2 text-sm font-bold capitalize transition-all cursor-pointer border-none bg-transparent ${activeRoleTab === 'new_role'
                    ? 'border-brand text-brand font-bold'
                    : 'border-transparent text-zinc-400 hover:text-white'
                    }`}
                >
                  {editingRoleId ? 'Edit Role' : 'Create Custom Role'}
                </button>
              </div>

              {activeRoleTab === 'roles' ? (
                <div className="space-y-6">
                  {/* Roles Registry List (Grid of roles) */}
                  <div className="border border-zinc-850 p-5 rounded-xl bg-zinc-955/40 space-y-4 text-left">
                    <div className="text-sm font-bold capitalize text-zinc-400 pb-1.5 border-b border-zinc-855 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Settings className="w-4 h-4 text-brand" /> Active Custom Roles Registry
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRoleId(null);
                          setNewRoleName('');
                          setNewRoleDescription('');
                          setNewRolePermissions({});
                          setActiveRoleTab('new_role');
                        }}
                        className="text-xs bg-brand/10 hover:bg-brand text-brand hover:text-zinc-955 px-2.5 py-1 rounded border border-brand/20 hover:border-brand font-bold capitalize transition-all cursor-pointer"
                      >
                        + Add Custom Role
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[350px] overflow-y-auto pr-1">
                      {isDbLoading ? (
                        [...Array(6)].map((_, i) => (
                          <div key={i} className="animate-pulse bg-zinc-900 border border-zinc-850 p-4 rounded-lg flex flex-col justify-between space-y-3 h-[110px]">
                            <div className="h-4 bg-zinc-800 rounded w-1/3" />
                            <div className="h-3 bg-zinc-850 rounded w-2/3" />
                            <div className="flex gap-1.5">
                              <div className="h-5 bg-zinc-850 rounded w-16" />
                              <div className="h-5 bg-zinc-850 rounded w-16" />
                            </div>
                          </div>
                        ))
                      ) : rolesDb.length === 0 ? (
                        <div className="col-span-3 text-center text-zinc-550 italic py-6">No custom roles defined yet.</div>
                      ) : (
                        rolesDb.map(role => {
                          const isProtected = ['role_hr', 'role_state', 'role_scheduler', 'role_finance'].includes(role.id);
                          const enabledModules = PRIVILEGE_MODULES.filter(m =>
                            role.permissions.includes(m.id) ||
                            m.actions.some(act => role.permissions.includes(act.id)) ||
                            (m.id === 'manage_users' && role.permissions.includes('MANAGE_USERS')) ||
                            (m.id === 'manage_psychologists' && role.permissions.includes('MANAGE_PSYCHOLOGISTS')) ||
                            (m.id === 'manage_bookings' && role.permissions.includes('MANAGE_BOOKINGS'))
                          );
                          const memberCount = subAdminsList.filter(a => a.customRoleTitle === role.name).length;
                          return (
                            <div key={role.id} className="bg-zinc-900 border border-zinc-850 p-4 rounded-xl flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-colors">
                              <div className="space-y-2">
                                <div className="flex justify-between items-start gap-1">
                                  <div className="min-w-0">
                                    <span className="font-header font-bold text-white capitalize text-sm truncate block">{role.name}</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-block mt-1 ${
                                      memberCount > 0
                                        ? 'bg-brand/10 border-brand/20 text-brand'
                                        : 'bg-zinc-950 border-zinc-800 text-zinc-550'
                                    }`}>
                                      {memberCount} {memberCount === 1 ? 'staff' : 'staff'} assigned
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleEditRoleClick(role)}
                                      className="text-brand hover:underline font-bold text-xs capitalize cursor-pointer border-none bg-transparent"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDuplicateRole(role)}
                                      className="text-zinc-400 hover:text-white font-bold text-xs capitalize cursor-pointer border-none bg-transparent"
                                      title="Duplicate this role"
                                    >
                                      Clone
                                    </button>
                                    {!isProtected && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteRole(role)}
                                        className="text-rose-500 hover:text-rose-455 font-bold text-xs capitalize cursor-pointer border-none bg-transparent"
                                      >
                                        Delete
                                      </button>
                                    )}
                                    {isProtected && (
                                      <span className="text-[10px] text-zinc-550 border border-zinc-800 bg-zinc-950 px-1 py-0.2 rounded capitalize font-bold">System</span>
                                    )}
                                  </div>
                                </div>
                                {role.description ? (
                                  <p className="text-xs text-zinc-400 font-medium leading-normal line-clamp-2">{role.description}</p>
                                ) : (
                                  <p className="text-xs text-zinc-600 font-medium italic">No description provided</p>
                                )}
                              </div>

                              <div className="space-y-1.5 border-t border-zinc-900/60 pt-3">
                                <span className="text-[10px] text-zinc-500 font-bold capitalize block">Modules ({enabledModules.length})</span>
                                <div className="flex flex-wrap gap-1">
                                  {enabledModules.length > 0 ? (
                                    enabledModules.map(m => (
                                      <span key={m.id} className="px-1.5 py-0.5 rounded bg-zinc-955 text-[10px] text-zinc-400 capitalize border border-zinc-850">
                                        {m.name.replace(' Management', '').replace(' & Leads', '')}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-xs text-zinc-650 italic">No access permissions</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Staff Provisioning Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Registration form */}
                    <form onSubmit={handleCreateSubAdmin} className="lg:col-span-7 bg-zinc-950 border border-zinc-850 p-5 rounded-xl space-y-4 text-left">
                      <div className="text-sm font-bold capitalize text-zinc-400 pb-1.5 border-b border-zinc-850 flex items-center gap-1.5">
                        <Settings className="w-4 h-4 text-brand" /> Register Staff Profile
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-zinc-400 font-bold capitalize text-sm ">Staff Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Sandra Tomy"
                            value={subAdminForm.name}
                            onChange={(e) => setSubAdminForm({ ...subAdminForm, name: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-zinc-400 font-bold capitalize text-sm ">Role Title</label>
                          <select
                            value={subAdminForm.roleName}
                            onChange={(e) => handleRoleChangeInForm(e.target.value)}
                            disabled={rolesDb.length === 0}
                            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {rolesDb.length === 0 ? (
                              <option value="">-- No Roles Defined --</option>
                            ) : (
                              rolesDb.map(r => (
                                <option key={r.id} value={r.name}>{r.name}</option>
                              ))
                            )}
                          </select>
                        </div>

                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-zinc-400 font-bold capitalize text-sm ">Email Address</label>
                          <input
                            type="email"
                            required
                            placeholder="staff@example.com"
                            value={subAdminForm.email}
                            onChange={(e) => setSubAdminForm({ ...subAdminForm, email: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-zinc-400 font-bold capitalize text-sm ">Password</label>
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={subAdminForm.password}
                            onChange={(e) => setSubAdminForm({ ...subAdminForm, password: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none"
                          />
                        </div>
                      </div>

                      {subAdminError && (
                        <p className="text-sm text-rose-500 font-bold capitalize ">{subAdminError}</p>
                      )}

                      {subAdminSuccess && (
                        <p className="text-sm text-emerald-500 font-bold capitalize">{subAdminSuccess}</p>
                      )}

                      <button
                        type="submit"
                        disabled={isRegistering}
                        className="w-full py-3 bg-brand hover:bg-brand-dark text-zinc-950 font-bold text-sm capitalize rounded-lg cursor-pointer transition border-none shadow-md flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5 text-zinc-955" /> Register Sub-Admin Profile
                      </button>
                    </form>

                    {/* Role Scopes Viewer */}
                    <div className="lg:col-span-5 border border-zinc-850 p-5 rounded-xl bg-zinc-955/40 space-y-4 text-left">
                      <div className="text-sm font-bold capitalize text-zinc-400 pb-1.5 border-b border-zinc-850 flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-brand" /> Role Scope Permissions
                      </div>

                      {rolesDb.length === 0 ? (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm rounded-xl space-y-2">
                          <p className="font-bold">No Custom Roles Defined</p>
                          <p className="text-sm text-zinc-400 leading-normal">
                            To register sub-admin staff, you must first define a role title and assign its permission scopes using the "Create Custom Role Title" form above.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-sm text-zinc-450 font-bold capitalize">Inherited Scopes for {subAdminForm.roleName}</p>

                          <div className="grid grid-cols-1 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                            {PRIVILEGE_MODULES.map(module => {
                              const isModuleEnabled = selectedPermissions.includes(module.id) ||
                                                     module.actions.some(act => selectedPermissions.includes(act.id)) ||
                                                     (module.id === 'manage_users' && selectedPermissions.includes('MANAGE_USERS')) ||
                                                     (module.id === 'manage_psychologists' && selectedPermissions.includes('MANAGE_PSYCHOLOGISTS')) ||
                                                     (module.id === 'manage_bookings' && selectedPermissions.includes('MANAGE_BOOKINGS'));

                              const activeActions = module.actions.filter(act => selectedPermissions.includes(act.id));

                              return (
                                <div key={module.id} className={`p-3 border rounded-xl flex items-center justify-between transition-colors duration-200 ${isModuleEnabled ? 'border-brand/30 bg-brand/5 text-white' : 'border-zinc-800 bg-zinc-950/20 text-zinc-500'}`}>
                                  <div className="text-sm min-w-0">
                                    <span className={`font-bold block ${isModuleEnabled ? 'text-white' : 'text-zinc-500'}`}>{module.name}</span>
                                    {isModuleEnabled && activeActions.length > 0 ? (
                                      <span className="text-xs text-zinc-400 block mt-0.5 capitalize">
                                        Privileges: {activeActions.map(act => act.name.split(' ')[0]).join(', ')}
                                      </span>
                                    ) : isModuleEnabled ? (
                                      <span className="text-xs text-zinc-400 block mt-0.5 capitalize">
                                        Full Access (All Privileges)
                                      </span>
                                    ) : (
                                      <span className="text-xs text-zinc-600 block mt-0.5">No Access</span>
                                    )}
                                  </div>
                                  <div className={`w-5 h-5 rounded-full border transition flex items-center justify-center shrink-0 ml-2 ${isModuleEnabled ? 'border-brand bg-brand text-zinc-955' : 'border-zinc-800 text-zinc-800'}`}>
                                    {isModuleEnabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* NEW ROLE / EDIT ROLE FORM */
                <form onSubmit={handleCreateRole} className="bg-zinc-950 border border-zinc-850 p-6 rounded-xl space-y-6 text-left">
                  <div className="text-sm font-bold capitalize text-zinc-400 pb-1.5 border-b border-zinc-850 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-brand" /> {editingRoleId ? 'Modify Custom Role details' : 'Define New Custom Role'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-zinc-400 font-bold capitalize text-sm">Role Title Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Admissions Lead"
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-400 font-bold capitalize text-sm">Role Description</label>
                      <input
                        type="text"
                        placeholder="Provide a brief summary description of this role's access area..."
                        value={newRoleDescription}
                        onChange={(e) => setNewRoleDescription(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-zinc-400 font-bold capitalize text-sm block">All Privileges & Scope Toggles</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {PRIVILEGE_MODULES.map(module => {
                        const isParentChecked = !!newRolePermissions[module.id] ||
                                               (module.id === 'manage_users' && !!newRolePermissions['MANAGE_USERS']) ||
                                               (module.id === 'manage_psychologists' && !!newRolePermissions['MANAGE_PSYCHOLOGISTS']) ||
                                               (module.id === 'manage_bookings' && !!newRolePermissions['MANAGE_BOOKINGS']);
                        return (
                          <div key={module.id} className={`bg-zinc-950 border rounded-xl overflow-hidden shadow-md text-left transition-colors duration-200 ${isParentChecked ? 'border-brand/40 bg-brand/5' : 'border-zinc-850 bg-zinc-950'}`}>
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-zinc-900/60 bg-zinc-900/40">
                              <span className="font-header font-bold text-sm text-white capitalize">{module.name}</span>
                              {/* Parent Toggle Switch */}
                              <label className="relative inline-flex items-center cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={isParentChecked}
                                  onChange={(e) => toggleModuleAllPermissions(module.id, module.actions, e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand peer-checked:after:bg-zinc-950 peer-checked:after:border-zinc-955"></div>
                              </label>
                            </div>

                            {/* Body (granular checkboxes) */}
                            <div className="p-4 space-y-2">
                              {module.actions.map(action => {
                                const isChecked = !!newRolePermissions[action.id];
                                return (
                                  <label key={action.id} className="flex items-center justify-between cursor-pointer text-sm select-none hover:text-white text-zinc-400 transition-colors">
                                    <span className="capitalize">{action.name.split(' ')[0]}</span>
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleChildAction(module.id, action.id, module.actions)}
                                      className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-brand focus:ring-0 focus:ring-offset-0 cursor-pointer accent-brand"
                                    />
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {roleError && (
                    <p className="text-sm text-rose-500 font-bold capitalize">{roleError}</p>
                  )}
                  {roleSuccess && (
                    <p className="text-sm text-emerald-500 font-bold capitalize">{roleSuccess}</p>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRoleId(null);
                        setNewRoleName('');
                        setNewRoleDescription('');
                        setNewRolePermissions({});
                        setActiveRoleTab('roles');
                      }}
                      className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-lg border border-zinc-800 text-sm font-bold capitalize transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-brand hover:bg-brand-dark text-zinc-950 font-bold text-sm capitalize rounded-lg cursor-pointer transition shadow-md flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4 text-zinc-955" /> {editingRoleId ? 'Update Role' : 'Save Custom Role'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {currentSection === 'bookings' && hasBookingPermission && (() => {
            const filteredBookings = bookingsDb.filter(b => {
              const matchesSearch = (b.userName && b.userName.toLowerCase().includes(searchBooking.toLowerCase())) ||
                (b.advisorName && b.advisorName.toLowerCase().includes(searchBooking.toLowerCase())) ||
                (b.status && b.status.toLowerCase().includes(searchBooking.toLowerCase()));
              if (bookingStatusFilter === 'ALL') return matchesSearch;
              return matchesSearch && b.status === bookingStatusFilter;
            }).sort((a, b) => {
              if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
              if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
              if (a.status === 'CONFIRMED' && b.status !== 'CONFIRMED' && b.status !== 'PENDING') return -1;
              if (b.status === 'CONFIRMED' && a.status !== 'CONFIRMED' && a.status !== 'PENDING') return 1;
              return (b.date || '').localeCompare(a.date || '');
            });

            return (
              <div className="space-y-6 animate-in fade-in duration-200 text-sm">
                <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold capitalize  text-white font-header">Consultation Bookings</h3>
                    <p className="text-sm text-zinc-500 font-medium pt-1">Schedule new consultations, manage session statuses, and meeting links</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:max-w-[200px]">
                      <input
                        type="text"
                        placeholder="Search bookings..."
                        value={searchBooking}
                        onChange={(e) => setSearchBooking(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm font-semibold focus:border-brand text-white outline-none"
                      />
                      <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                    </div>
                    {canAddBookings && (
                      <button
                        onClick={() => {
                          const firstStudent = usersDb.find(u => u.role === 'USER' || !u.role);
                          const firstPsy = usersDb.find(u => u.role === 'PSYCHOLOGIST');
                          let firstSlot = '';
                          if (firstPsy && firstPsy.availability?.availableSlots?.length > 0) {
                            firstSlot = firstPsy.availability.availableSlots[0];
                          }
                          setBookingForm({
                            id: '',
                            userId: firstStudent?.id || '',
                            advisorId: firstPsy?.id || '',
                            service: 'counselling',
                            mode: 'ONLINE',
                            date: getLocalTodayString(),
                            time: firstSlot,
                            meetLink: '',
                            status: 'CONFIRMED'
                          });
                          setBookingFormError('');
                          setBookingFormSuccess('');
                          setIsAddBookingOpen(true);
                        }}
                        className="px-4 py-2 bg-brand hover:bg-brand-dark text-zinc-950 text-sm font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 capitalize shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 text-zinc-955" /> Schedule Booking
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Filter Tabs & Revenue Estimate */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                  <div className="flex flex-wrap gap-1.5">
                    {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'EXPIRED', 'CANCELLED'].map(status => (
                      <button
                        key={status}
                        onClick={() => { setBookingStatusFilter(status); setSelectedBookingIds([]); }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold capitalize  transition cursor-pointer border ${bookingStatusFilter === status
                          ? 'bg-brand text-zinc-955 border-brand font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                      >
                        {status} ({
                          status === 'ALL'
                            ? bookingsDb.length
                            : bookingsDb.filter(b => b.status === status).length
                        })
                      </button>
                    ))}
                  </div>

                  <div className="bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800 text-right">
                    <span className="text-sm text-zinc-500 font-bold capitalize  block">Estimated Revenue</span>
                    <span className="text-sm font-bold text-emerald-450">₹{
                      filteredBookings.reduce((acc, b) => {
                        if (b.status !== 'COMPLETED' && b.status !== 'EXPIRED') return acc;
                        if (b.amountPaid !== undefined && b.amountPaid !== null) {
                          return acc + Number(b.amountPaid);
                        }
                        const advisor = usersDb.find(u => u.id === b.advisorId) || usersDb.find(u => u.name === b.advisorName);
                        let price = 1250;
                        if (advisor && advisor.price) {
                          price = Number(advisor.price);
                        }
                        return acc + Number(price);
                      }, 0)
                    } Completed</span>
                  </div>
                </div>

                {/* Bulk Actions Panel */}
                {selectedBookingIds.length > 0 && (
                  <div className="flex items-center gap-3 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800 animate-in slide-in-from-top duration-200">
                    <span className="text-sm font-bold capitalize  text-brand ">{selectedBookingIds.length} Selected</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleBulkBookingStatus('CONFIRMED')}
                        className="px-2.5 py-1 bg-emerald-955/20 text-emerald-400 hover:bg-emerald-900 hover:text-white rounded border border-emerald-900/30 transition text-sm font-bold capitalize cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleBulkBookingStatus('COMPLETED')}
                        className="px-2.5 py-1 bg-indigo-955/20 text-indigo-400 hover:bg-indigo-900 hover:text-white rounded border border-indigo-900/30 transition text-sm font-bold capitalize cursor-pointer"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleBulkBookingStatus('CANCELLED')}
                        className="px-2.5 py-1 bg-rose-955/20 text-rose-500 hover:bg-rose-900 hover:text-white rounded border border-rose-900/30 transition text-sm font-bold capitalize cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleBulkDeleteBookings}
                        className="px-2.5 py-1 bg-rose-950/40 text-rose-500 hover:bg-rose-900 hover:text-white rounded border border-rose-900/50 transition text-sm font-bold capitalize cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}

                <div className="border border-zinc-850 rounded-lg overflow-hidden bg-zinc-950">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-sm border-collapse min-w-[850px]">
                      <thead>
                        <tr className="bg-zinc-900 text-zinc-400 font-bold capitalize  border-b border-zinc-850 text-left">
                          <th className="p-3 text-center w-10 whitespace-nowrap">
                            {(() => {
                              const pagedBookings = filteredBookings.slice((bookingPage - 1) * bookingLimit, bookingPage * bookingLimit);
                              return (
                                <input
                                  type="checkbox"
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedBookingIds(pagedBookings.map(b => b.id));
                                    } else {
                                      setSelectedBookingIds([]);
                                    }
                                  }}
                                  checked={pagedBookings.length > 0 && pagedBookings.every(b => selectedBookingIds.includes(b.id))}
                                  className="cursor-pointer"
                                />
                              );
                            })()}
                          </th>
                          <th className="p-3 whitespace-nowrap">Student</th>
                          <th className="p-3 whitespace-nowrap">Psychologist</th>
                          <th className="p-3 whitespace-nowrap">Service / Mode</th>
                          <th className="p-3 whitespace-nowrap">Schedule</th>
                          <th className="p-3 whitespace-nowrap">Meeting Room</th>
                          <th className="p-3 text-center whitespace-nowrap">Status</th>
                          <th className="p-3 text-center font-bold whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isDbLoading ? (
                          <SkeletonTableRows cols={8} />
                        ) : filteredBookings.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-zinc-500 italic whitespace-nowrap">No bookings scheduled in the system matching the active filters.</td>
                          </tr>
                        ) : (
                          filteredBookings.slice((bookingPage - 1) * bookingLimit, bookingPage * bookingLimit).map(booking => (
                            <tr key={booking.id} className="border-b border-zinc-900 hover:bg-zinc-900/50">
                              <td className="p-3 text-center whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedBookingIds.includes(booking.id)}
                                  onChange={() => handleToggleSelectBooking(booking.id)}
                                  className="cursor-pointer"
                                />
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span className="font-bold text-white block leading-tight">{booking.userName}</span>
                                <span className="text-sm text-zinc-500">ID: {booking.userId}</span>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span className="font-bold text-white block leading-tight">{booking.advisorName}</span>
                                <span className="text-sm text-zinc-500">{booking.advisorRole}</span>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span className="font-semibold block capitalize text-white leading-tight">
                                  {booking.service === 'counselling' ? 'Emotional Wellbeing' : 'Career Mapping'}
                                </span>
                                <span className="text-sm text-zinc-555 font-bold capitalize">{booking.mode}</span>
                              </td>
                              <td className="p-3 font-semibold text-zinc-300 whitespace-nowrap">
                                <span className="block">{formatDateString(booking.date)}</span>
                                <span className="text-sm text-zinc-500 font-bold">{booking.time}</span>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                {booking.meetLink ? (
                                  <a
                                    href={booking.meetLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-brand hover:underline font-bold inline-flex items-center gap-1 text-sm"
                                  >
                                    <Link className="w-3 h-3" /> Virtual Room
                                  </a>
                                ) : (
                                  <span className="text-zinc-555 italic text-sm">No Link Set</span>
                                )}
                              </td>
                              <td className="p-3 text-center whitespace-nowrap">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-sm font-bold capitalize   ${booking.status === 'CONFIRMED'
                                  ? 'bg-emerald-955/30 border border-emerald-900/40 text-emerald-450'
                                  : booking.status === 'COMPLETED'
                                    ? 'bg-indigo-955/30 border border-indigo-900/40 text-indigo-400'
                                    : booking.status === 'EXPIRED'
                                      ? 'bg-rose-955/30 border border-rose-900/40 text-rose-400'
                                      : booking.status === 'CANCELLED'
                                        ? 'bg-rose-955/20 border border-rose-900/30 text-rose-500'
                                        : 'bg-zinc-900 border border-zinc-800 text-zinc-455'
                                  }`}>
                                  {booking.status}
                                </span>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <div className="flex items-center justify-center gap-2">
                                  {booking.status !== 'CANCELLED' && (
                                  <button
                                    onClick={() => downloadPDFReceipt(booking)}
                                    className="p-1.5 bg-zinc-900 text-zinc-400 hover:text-white rounded border border-zinc-800 transition cursor-pointer"
                                    title="Download Receipt PDF"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {booking.status === 'COMPLETED' && (
                                  <button
                                    onClick={() => downloadDiagnosticPDF(booking)}
                                    className="p-1.5 bg-zinc-900 text-emerald-500 hover:text-white hover:bg-emerald-900 rounded border border-zinc-800 transition cursor-pointer"
                                    title="Download Clinical Report PDF"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {canEditBookings && (
                                <button
                                  onClick={() => handleOpenEditBooking(booking)}
                                  className="p-1.5 bg-zinc-900 text-zinc-400 hover:text-white rounded border border-zinc-800 transition cursor-pointer"
                                  title="Edit / Reschedule"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                )}
                                {canDeleteBookings && (
                                <button
                                  onClick={() => handleDeleteBooking(booking.id)}
                                  className="p-1.5 bg-rose-955/20 text-rose-500 hover:bg-rose-900 hover:text-white rounded border border-rose-900/30 transition cursor-pointer"
                                  title="Cancel Booking"
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
                  total={filteredBookings.length}
                  page={bookingPage}
                  limit={bookingLimit}
                  onPageChange={setBookingPage}
                  onLimitChange={setBookingLimit}
                />
              </div>
            );
          })()}

          {/* TAB: STUDENT INQUIRIES & LEADS */}
          {currentSection === 'inquiries' && isSuperAdmin && (
            <div className="space-y-6 animate-in fade-in duration-200 text-sm">
              <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold capitalize  text-white font-header">Student Inquiries & Leads</h3>
                  <p className="text-sm text-zinc-500 font-medium pt-1">Review contact requests submitted from the landing page</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {inquiriesDb.some(i => i.status === 'RESOLVED') && (
                    <button
                      onClick={handleBulkClearResolvedInquiries}
                      className="px-3.5 py-2 bg-rose-955/20 hover:bg-rose-900 hover:text-white text-rose-500 rounded-lg border border-rose-900/30 transition cursor-pointer text-sm font-bold capitalize  shrink-0"
                    >
                      Clear Resolved
                    </button>
                  )}
                  <div className="relative w-full sm:max-w-[200px]">
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={searchInquiry}
                      onChange={(e) => setSearchInquiry(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-zinc-955 border border-zinc-800 rounded-lg text-sm font-semibold focus:border-brand text-white outline-none"
                    />
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {isDbLoading ? (
                  [...Array(3)].map((_, idx) => (
                    <div key={idx} className="animate-pulse bg-zinc-955 border border-zinc-850 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
                      <div className="space-y-2 flex-1">
                        <div className="flex gap-2">
                          <div className="h-4 bg-zinc-900 rounded w-16" />
                          <div className="h-4 bg-zinc-900 rounded w-24" />
                        </div>
                        <div className="h-5 bg-zinc-900 rounded w-1/4" />
                        <div className="h-4 bg-zinc-900 rounded w-1/3" />
                        <div className="h-16 bg-zinc-900 rounded w-full mt-2" />
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    {filteredInquiries.slice((inquiryPage - 1) * inquiryLimit, inquiryPage * inquiryLimit).map((inq) => (
                      <div
                        key={inq.id}
                        className="bg-zinc-955 border border-zinc-850 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden"
                      >
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-sm font-bold capitalize  ${inq.status === 'RESOLVED'
                              ? 'bg-emerald-955/20 border border-emerald-900/40 text-emerald-450'
                              : 'bg-amber-955/20 border border-amber-900/40 text-amber-500'
                              }`}>
                              {inq.status || 'PENDING'}
                            </span>
                            <span className="text-sm text-zinc-500 font-bold capitalize ">{formatDateString(inq.date)}</span>
                          </div>

                          <div className="space-y-0.5">
                            <h4 className="font-header font-bold text-sm capitalize text-white truncate">{inq.name}</h4>
                            <p className="text-sm text-brand font-semibold  break-all">{inq.email}</p>
                          </div>

                          <p className="text-[12.5px] text-zinc-400 font-medium leading-relaxed bg-zinc-900/50 p-3 rounded-lg border border-zinc-850 whitespace-pre-wrap">
                            {inq.message}
                          </p>

                          {/* Internal Notes field */}
                          <div className="pt-3 border-t border-zinc-900 mt-2 space-y-2">
                            <span className="text-sm capitalize  font-bold text-zinc-500 block">Internal Staff Notes</span>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Add diagnostic notes or followup details..."
                                defaultValue={inq.note || ''}
                                id={`note-${inq.id}`}
                                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-850 focus:border-brand rounded text-[12.5px] text-white outline-none font-semibold"
                              />
                              <button
                                onClick={() => {
                                  const noteVal = document.getElementById(`note-${inq.id}`).value;
                                  handleSaveInquiryNote(inq.id, noteVal);
                                }}
                                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 hover:text-brand hover:border-brand rounded font-bold capitalize transition cursor-pointer"
                              >
                                Save Note
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                          <button
                            onClick={() => handleResolveInquiry(inq.id)}
                            className={`px-4.5 py-2.5 rounded-lg text-sm font-bold capitalize  transition cursor-pointer flex items-center gap-1 border border-zinc-800 ${inq.status === 'RESOLVED'
                              ? 'bg-zinc-900 text-zinc-400 hover:text-white'
                              : 'bg-brand hover:bg-brand-dark text-zinc-955'
                              }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{inq.status === 'RESOLVED' ? 'Re-open' : 'Mark Resolved'}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteInquiry(inq.id)}
                            className="px-3 py-2.5 bg-rose-955/20 hover:bg-rose-900 hover:text-white text-rose-500 rounded-lg border border-rose-900/30 transition cursor-pointer text-sm font-bold capitalize "
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {filteredInquiries.length === 0 && (
                      <div className="text-center py-10 bg-zinc-955 border border-zinc-850 rounded-xl space-y-3">
                        <MessageSquare className="w-8 h-8 text-zinc-650 mx-auto" />
                        <p className="text-zinc-500 font-bold text-sm capitalize ">No student inquiries submitted yet.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              <PaginationBar
                total={filteredInquiries.length}
                page={inquiryPage}
                limit={inquiryLimit}
                onPageChange={setInquiryPage}
                onLimitChange={setInquiryLimit}
              />
            </div>
          )}

          {/* TAB: APTITUDE TEST RESULTS */}
          {currentSection === 'testresults' && isSuperAdmin && (
            <div className="space-y-6 animate-in fade-in duration-200 text-sm">
              <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold capitalize  text-white font-header">Aptitude Test Results</h3>
                  <p className="text-sm text-zinc-500 font-medium pt-1">Monitor student diagnostic assessment outcomes and profiles</p>
                </div>
                <div className="relative w-full sm:max-w-[240px]">
                  <input
                    type="text"
                    placeholder="Search results..."
                    value={searchTestResult}
                    onChange={(e) => setSearchTestResult(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-zinc-955 border border-zinc-800 rounded-lg text-sm font-semibold focus:border-brand text-white outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {isDbLoading ? (
                  [...Array(4)].map((_, idx) => (
                    <div key={idx} className="animate-pulse bg-zinc-950 border border-zinc-850 rounded-xl p-5 space-y-4 flex flex-col justify-between h-[300px]">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <div className="h-5 bg-zinc-900 rounded w-1/3" />
                            <div className="h-4 bg-zinc-900 rounded w-1/2" />
                            <div className="h-3 bg-zinc-900 rounded w-2/3" />
                          </div>
                        </div>
                        <div className="space-y-3 border-t border-zinc-850 pt-3">
                          <div className="h-4 bg-zinc-900 rounded w-1/4" />
                          <div className="space-y-2">
                            <div className="h-5 bg-zinc-900 rounded w-full" />
                            <div className="h-5 bg-zinc-900 rounded w-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    {filteredTestResults.map((res) => (
                      <div
                        key={res.id}
                        className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 space-y-4 relative overflow-hidden flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <span className="text-sm bg-brand text-zinc-955 px-2 py-0.5 rounded font-bold capitalize  ">
                                Dominant: {res.dominantDomain}
                              </span>
                              <h4 className="font-header font-bold text-sm capitalize text-white truncate pt-1">{res.studentName}</h4>
                              <span className="text-sm text-zinc-550 block font-medium truncate leading-none">{res.studentEmail}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleExportAptitudeResults(res)}
                                className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:text-brand rounded font-bold capitalize transition text-sm  shrink-0 cursor-pointer"
                                title="Export Diagnostic Log"
                              >
                                Copy Report
                              </button>
                              <span className="text-sm text-zinc-500 font-bold capitalize">{formatDateString(res.date)}</span>
                              <button
                                onClick={() => handleDeleteTestResult(res.id)}
                                className="p-1.5 bg-rose-955/20 text-rose-500 hover:bg-rose-900 hover:text-white rounded border border-rose-900/30 transition cursor-pointer"
                                title="Delete Result Log"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-3.5 border-t border-zinc-850 pt-3">
                            <span className="text-sm capitalize  font-bold text-zinc-500 block">Cognitive Profile Breakdown</span>
                            <div className="space-y-2 text-sm">
                              {Object.entries(res.scores || {}).map(([key, val]) => (
                                <div key={key} className="space-y-1">
                                  <div className="flex justify-between items-center font-bold">
                                    <span className="text-zinc-400 capitalize">{key}</span>
                                    <span className="text-brand ">{val}%</span>
                                  </div>
                                  <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-850">
                                    <div
                                      className="bg-brand h-full rounded-full transition-all duration-500"
                                      style={{ width: `${val}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredTestResults.length === 0 && (
                      <div className="col-span-2 text-center py-10 bg-zinc-955 border border-zinc-850 rounded-xl space-y-3">
                        <FileSpreadsheet className="w-8 h-8 text-zinc-655 mx-auto" />
                        <p className="text-zinc-500 font-bold text-sm capitalize ">No aptitude tests completed yet.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB: APTITUDE QUESTIONS MANAGER */}
          {currentSection === 'aptitude' && isSuperAdmin && (
            <div className="space-y-6 animate-in fade-in duration-200 text-sm">
              <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold capitalize  text-white font-header">Aptitude Questions</h3>
                  <p className="text-sm text-zinc-500 font-medium pt-1">Manage assessment questions and cognitive profiles</p>
                </div>
                <button
                  onClick={() => {
                    setAptitudeForm({
                      id: '',
                      question: '',
                      category: 'Logical',
                      options: [
                        { text: '', weight: 1 },
                        { text: '', weight: 1 },
                        { text: '', weight: 1 },
                        { text: '', weight: 1 }
                      ],
                      isActive: true
                    });
                    setAptitudeFormError('');
                    setAptitudeFormSuccess('');
                    setIsAddAptitudeOpen(true);
                  }}
                  className="px-4 py-2 bg-brand hover:bg-brand-dark text-zinc-955 text-sm font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 capitalize shrink-0 border-none"
                >
                  <Plus className="w-3.5 h-3.5 text-zinc-955" /> Add Question
                </button>
              </div>

              <div className="bg-zinc-955 border border-zinc-850 p-4 rounded-xl flex items-center gap-3">
                <Search className="w-4 h-4 text-zinc-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Search questions by text or category..."
                  value={searchAptitude}
                  onChange={(e) => setSearchAptitude(e.target.value)}
                  className="w-full bg-transparent border-none text-sm text-white outline-none placeholder-zinc-550"
                />
              </div>

              <div className="space-y-4">
                {isDbLoading ? (
                  [...Array(3)].map((_, idx) => (
                    <div key={idx} className="animate-pulse bg-zinc-950 border border-zinc-850 rounded-xl p-5 flex flex-col gap-4">
                      <div className="flex gap-2">
                        <div className="h-5 bg-zinc-900 border border-zinc-800 rounded w-8" />
                        <div className="h-5 bg-zinc-900 border border-zinc-800 rounded w-16" />
                      </div>
                      <div className="h-5 bg-zinc-900 rounded w-3/4" />
                      <div className="space-y-2 mt-2">
                        <div className="h-3 bg-zinc-900 rounded w-1/2" />
                        <div className="h-3 bg-zinc-900 rounded w-1/3" />
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    {aptitudeQuestionsDb
                      .filter(q => (q.question + q.category).toLowerCase().includes(searchAptitude.toLowerCase()))
                      .slice((aptitudePage - 1) * aptitudeLimit, aptitudePage * aptitudeLimit)
                      .map((q, index) => (
                        <div
                          key={q.id || index}
                          className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-5"
                        >
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="w-5 h-5 rounded bg-zinc-900 border border-zinc-800 text-sm text-brand flex items-center justify-center font-bold shrink-0">{((aptitudePage - 1) * aptitudeLimit) + index + 1}</span>
                              <span className="text-xs font-bold capitalize  text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">{q.category}</span>
                              {!q.isActive && <span className="text-xs font-bold capitalize  text-rose-500 bg-rose-955/20 px-2 py-0.5 rounded border border-rose-900/30">Disabled</span>}
                            </div>
                            <h4 className="font-header font-bold text-sm capitalize text-white mb-3">
                              {q.question}
                            </h4>
                            <ul className="space-y-1.5 pl-2 mt-2 border-l border-zinc-850">
                              {q.options?.map((opt, oIdx) => (
                                <li key={oIdx} className="text-xs text-zinc-400 font-medium leading-relaxed pl-3 flex items-center justify-between group">
                                  <span>{opt.text}</span>
                                  <span className="text-xs  text-zinc-600 bg-zinc-900 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Weight: {opt.weight}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="shrink-0 flex items-center gap-2 self-end sm:self-start">
                            <button
                              onClick={() => handleOpenEditAptitudeQuestion(q)}
                              className="p-2 bg-zinc-900 text-zinc-400 hover:text-white rounded border border-zinc-800 transition cursor-pointer"
                              title="Edit Question"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAptitudeQuestion(q.id)}
                              className="p-2 bg-rose-955/20 text-rose-500 hover:bg-rose-900 hover:text-white rounded border border-rose-900/30 transition cursor-pointer"
                              title="Delete Question"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                    {aptitudeQuestionsDb.filter(q => (q.question + q.category).toLowerCase().includes(searchAptitude.toLowerCase())).length === 0 && (
                      <div className="text-center py-10 bg-zinc-955 border border-zinc-850 rounded-xl space-y-3">
                        <Brain className="w-8 h-8 text-zinc-650 mx-auto" />
                        <p className="text-zinc-500 font-bold text-sm capitalize ">No Questions Found.</p>
                      </div>
                    )}

                    {aptitudeQuestionsDb.filter(q => (q.question + q.category).toLowerCase().includes(searchAptitude.toLowerCase())).length > 0 && (
                      <PaginationBar
                        total={aptitudeQuestionsDb.filter(q => (q.question + q.category).toLowerCase().includes(searchAptitude.toLowerCase())).length}
                        page={aptitudePage}
                        limit={aptitudeLimit}
                        onPageChange={setAptitudePage}
                        onLimitChange={setAptitudeLimit}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB: FAQ DESK MANAGER */}
          {currentSection === 'faqs' && isSuperAdmin && (
            <div className="space-y-6 animate-in fade-in duration-200 text-sm">
              <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold capitalize  text-white font-header">Frequently Asked Questions (FAQ)</h3>
                  <p className="text-sm text-zinc-500 font-medium pt-1">Manage standard questions displayed on the landing page</p>
                </div>
                <button
                  onClick={() => {
                    setFaqForm({ index: -1, question: '', answer: '' });
                    setFaqFormError('');
                    setFaqFormSuccess('');
                    setIsAddFaqOpen(true);
                  }}
                  className="px-4 py-2 bg-brand hover:bg-brand-dark text-zinc-955 text-sm font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 capitalize shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 text-zinc-955" /> Add FAQ Item
                </button>
              </div>

              <div className="space-y-4">
                {isDbLoading ? (
                  [...Array(3)].map((_, idx) => (
                    <div key={idx} className="animate-pulse bg-zinc-955 border border-zinc-850 rounded-xl p-5 flex flex-col gap-3">
                      <div className="flex gap-2 items-center">
                        <div className="h-5 bg-zinc-900 border border-zinc-800 rounded w-5" />
                        <div className="h-5 bg-zinc-900 rounded w-1/2" />
                      </div>
                      <div className="h-4 bg-zinc-900 rounded w-3/4 pl-7" />
                    </div>
                  ))
                ) : (
                  <>
                    {faqsDb.map((faq, index) => (
                      <div
                        key={index}
                        className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-5"
                      >
                        <div className="space-y-2 flex-1 min-w-0">
                          <h4 className="font-header font-bold text-sm capitalize text-white flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-zinc-900 border border-zinc-800 text-sm text-brand flex items-center justify-center font-bold shrink-0">{index + 1}</span>
                            <span>{faq.question}</span>
                          </h4>
                          <p className="text-[12.5px] text-zinc-400 font-medium leading-relaxed pl-7 ">
                            {faq.answer}
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center gap-2 self-end sm:self-start">
                          <button
                            onClick={() => handleOpenEditFaq(faq, index)}
                            className="p-2 bg-zinc-900 text-zinc-400 hover:text-white rounded border border-zinc-800 transition cursor-pointer"
                            title="Edit FAQ"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFaq(index)}
                            className="p-2 bg-rose-955/20 text-rose-500 hover:bg-rose-900 hover:text-white rounded border border-rose-900/30 transition cursor-pointer"
                            title="Delete FAQ"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {faqsDb.length === 0 && (
                      <div className="text-center py-10 bg-zinc-955 border border-zinc-850 rounded-xl space-y-3">
                        <HelpCircle className="w-8 h-8 text-zinc-650 mx-auto" />
                        <p className="text-zinc-500 font-bold text-sm capitalize ">No FAQs defined.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB: SITE SETTINGS */}
          {currentSection === 'settings' && isSuperAdmin && (
            <div className="space-y-6 animate-in fade-in duration-200 text-sm">
              <div className="border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold capitalize  text-white font-header">Site Configuration Panel</h3>
                <p className="text-sm text-zinc-500 font-medium pt-1">Manage global landing page titles, subheadings, and contact support endpoints</p>
              </div>

              <form onSubmit={handleSaveSettings} className="bg-zinc-955 border border-zinc-850 p-6 rounded-xl space-y-5">
                <div className="space-y-1">
                  <label className="text-sm capitalize  font-bold text-zinc-400">Hero Section Heading</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.heroTitle}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                    className="w-full px-3.5 py-3 bg-zinc-900 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none"
                    placeholder="e.g. Bridging You To Your {True Growth.}"
                  />
                  <span className="text-sm text-zinc-550 block font-medium">Use curly braces `{ }` around words you want highlighted with the neon gradient.</span>
                </div>

                <div className="space-y-1">
                  <label className="text-sm capitalize  font-bold text-zinc-400">Hero Section Subtitle</label>
                  <textarea
                    rows={3}
                    required
                    value={settingsForm.heroSub}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroSub: e.target.value })}
                    className="w-full px-3.5 py-3 bg-zinc-900 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none resize-none font-semibold"
                    placeholder="Write a compelling landing subheading..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm capitalize  font-bold text-zinc-400">Custom Site Brand Name</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.siteName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, siteName: e.target.value })}
                      className="w-full px-3.5 py-3 bg-zinc-900 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none font-semibold"
                      placeholder="e.g. BEHOLD"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm capitalize  font-bold text-zinc-400">Footer Copyright Text</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.siteCopyright}
                      onChange={(e) => setSettingsForm({ ...settingsForm, siteCopyright: e.target.value })}
                      className="w-full px-3.5 py-3 bg-zinc-900 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none font-semibold"
                      placeholder="e.g. © BEHOLD Ltd., 2026. All rights reserved."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm capitalize  font-bold text-zinc-400">WhatsApp Support Endpoint Link</label>
                    <input
                      type="url"
                      required
                      value={settingsForm.whatsapp}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                      className="w-full px-3.5 py-3 bg-zinc-900 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none  font-semibold"
                      placeholder="e.g. https://wa.me/919497174011"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm capitalize  font-bold text-zinc-400">Contact Support Email Address</label>
                    <input
                      type="email"
                      required
                      value={settingsForm.contactEmail}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                      className="w-full px-3.5 py-3 bg-zinc-900 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none  font-semibold"
                      placeholder="e.g. support@behold.com"
                    />
                  </div>
                </div>

                {/* Top Alert Banner Notice */}
                <div className="border border-zinc-850 p-4 rounded-xl space-y-4 bg-zinc-900/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm capitalize  font-bold text-zinc-400 block">System Banner Notification Bar</span>
                      <span className="text-sm text-zinc-550 block font-medium">Display an alert message at the very top of all student-facing views.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.showBanner}
                        onChange={(e) => setSettingsForm({ ...settingsForm, showBanner: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand peer-checked:after:bg-zinc-955 peer-checked:after:border-none" />
                    </label>
                  </div>

                  {settingsForm.showBanner && (
                    <div className="space-y-1 animate-in slide-in-from-top duration-200">
                      <label className="text-sm capitalize  font-bold text-zinc-500">Alert Message Text</label>
                      <input
                        type="text"
                        value={settingsForm.bannerNotice}
                        onChange={(e) => setSettingsForm({ ...settingsForm, bannerNotice: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none font-semibold"
                        placeholder="Write dynamic alert banner message..."
                      />
                    </div>
                  )}
                </div>

                {/* Feature Toggles */}
                <div className="border border-zinc-850 p-4 rounded-xl space-y-4 bg-zinc-900/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm capitalize  font-bold text-brand block">Enable Psychology & Booking Services</span>
                      <span className="text-sm text-zinc-550 block font-medium mt-1">If disabled, the site will only display Aptitude Test features. Psychologists and booking sections will be hidden from the public website.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.enablePsychology}
                        onChange={(e) => setSettingsForm({ ...settingsForm, enablePsychology: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand peer-checked:after:bg-zinc-955 peer-checked:after:border-none" />
                    </label>
                  </div>
                </div>

                {/* GST / Tax Configuration */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-4">
                  <h4 className="text-sm font-bold text-zinc-300 capitalize tracking-wide flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Tax / GST Configuration
                  </h4>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="text-sm capitalize font-bold text-brand block">Enable GST on Bookings</span>
                      <span className="text-sm text-zinc-550 block font-medium mt-1">When enabled, GST will be applied to the session fee on the booking checkout page.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.gstEnabled}
                        onChange={(e) => setSettingsForm({ ...settingsForm, gstEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand peer-checked:after:bg-zinc-955 peer-checked:after:border-none" />
                    </label>
                  </div>

                  {settingsForm.gstEnabled && (
                    <div className="space-y-1 max-w-xs animate-in slide-in-from-top-2 duration-200">
                      <label className="text-sm capitalize font-bold text-zinc-400">GST Percentage (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={settingsForm.gstPercent}
                        onChange={(e) => {
                          let val = parseFloat(e.target.value);
                          if (isNaN(val)) val = 0;
                          if (val < 0) val = 0;
                          if (val > 100) val = 100;
                          setSettingsForm({ ...settingsForm, gstPercent: val });
                        }}
                        className="w-full px-3.5 py-3 bg-zinc-900 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none font-semibold"
                        placeholder="e.g. 18"
                      />
                      <p className="text-xs text-zinc-550 font-medium">Set to 0 to show ₹0 for GST. Common values: 5%, 12%, 18%, 28%</p>
                    </div>
                  )}
                </div>

                {/* Policies & Documents */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm capitalize  font-bold text-zinc-400">Terms of Use Document</label>
                    <textarea
                      rows={6}
                      required
                      value={settingsForm.termsOfUse}
                      onChange={(e) => setSettingsForm({ ...settingsForm, termsOfUse: e.target.value })}
                      className="w-full px-3.5 py-3 bg-zinc-900 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none font-semibold "
                      placeholder="Write Platform Terms & Conditions..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm capitalize  font-bold text-zinc-400">Privacy Policy Document</label>
                    <textarea
                      rows={6}
                      required
                      value={settingsForm.privacyPolicy}
                      onChange={(e) => setSettingsForm({ ...settingsForm, privacyPolicy: e.target.value })}
                      className="w-full px-3.5 py-3 bg-zinc-900 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none font-semibold "
                      placeholder="Write Platform Privacy Policy..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm capitalize font-bold text-zinc-400">C-DAT Default Group Code</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.cdatGroupCode}
                      onChange={(e) => setSettingsForm({ ...settingsForm, cdatGroupCode: e.target.value })}
                      className="w-full px-3.5 py-3 bg-zinc-900 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none font-semibold"
                      placeholder="e.g. cdat@behold"
                    />
                  </div>
                </div>

                {/* Promotional Codes */}
                <div className="pt-4 border-t border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white capitalize ">Promotional Codes</h4>
                      <p className="text-xs text-zinc-500 font-medium">Manage discount codes for service bookings</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPromoCode}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs font-bold capitalize transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Code
                    </button>
                  </div>
                  
                  {settingsForm.promoCodes && settingsForm.promoCodes.length > 0 ? (
                    <div className="space-y-3">
                      {settingsForm.promoCodes.map((promo, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-zinc-900 border border-zinc-850 rounded-xl relative group">
                          <button
                            type="button"
                            onClick={() => handleRemovePromoCode(idx)}
                            className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition cursor-pointer shadow-md"
                            title="Remove Promo Code"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          
                          <div className="flex-1 w-full space-y-1">
                            <label className="text-xs font-bold text-zinc-500">Code (e.g. SAVE20)</label>
                            <input
                              type="text"
                              required
                              value={promo.code}
                              onChange={(e) => handleUpdatePromoCode(idx, 'code', e.target.value.toUpperCase())}
                              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none font-semibold uppercase"
                              placeholder="CODE"
                            />
                          </div>
                          
                          <div className="w-full sm:w-32 space-y-1">
                            <label className="text-xs font-bold text-zinc-500">Type</label>
                            <select
                              value={promo.type}
                              onChange={(e) => handleUpdatePromoCode(idx, 'type', e.target.value)}
                              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none font-semibold cursor-pointer"
                            >
                              <option value="PERCENTAGE">Percentage (%)</option>
                              <option value="FLAT">Flat (₹)</option>
                            </select>
                          </div>
                          
                          <div className="w-full sm:w-24 space-y-1">
                            <label className="text-xs font-bold text-zinc-500">Value</label>
                            <input
                              type="number"
                              required
                              min={0}
                              value={promo.value}
                              onChange={(e) => handleUpdatePromoCode(idx, 'value', Number(e.target.value))}
                              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none font-semibold"
                            />
                          </div>
                          
                          <div className="flex items-center gap-2 mt-4 sm:mt-0 pt-2 sm:pt-4 justify-center sm:w-20">
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-zinc-300 select-none">
                              <input
                                type="checkbox"
                                checked={promo.isActive !== false}
                                onChange={(e) => handleUpdatePromoCode(idx, 'isActive', e.target.checked)}
                                className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-brand focus:ring-0 focus:ring-offset-0 cursor-pointer accent-brand"
                              />
                              <span className={promo.isActive !== false ? "text-emerald-400" : "text-zinc-500"}>Active</span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/50 text-center">
                      <p className="text-sm text-zinc-500 font-medium">No promotional codes configured.</p>
                    </div>
                  )}
                </div>

                {settingsSuccess && (
                  <p className="text-sm text-emerald-500 font-bold capitalize tracking-wide">{settingsSuccess}</p>
                )}

                <button
                  type="submit"
                  className="px-6 py-3 bg-brand hover:bg-brand-dark text-zinc-955 font-bold text-sm capitalize  rounded-lg cursor-pointer transition border-none shadow-md animate-in fade-in duration-300"
                >
                  Save Global Configurations
                </button>
              </form>
            </div>
          )}

          {/* TAB: ANALYTICS COMMAND CENTER */}
          {currentSection === 'analytics' && isSuperAdmin && (() => {
            const monthlyCounts = bookingsDb.reduce((acc, b) => {
              if (!b.date) return acc;
              const month = b.date.substring(0, 7); // YYYY-MM
              acc[month] = (acc[month] || 0) + 1;
              return acc;
            }, {});
            const sortedMonths = Object.entries(monthlyCounts).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);

            const advisorCounts = bookingsDb.reduce((acc, b) => {
              if (b.status !== 'COMPLETED') return acc;
              acc[b.advisorName] = (acc[b.advisorName] || 0) + 1;
              return acc;
            }, {});
            const sortedAdvisors = Object.entries(advisorCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

            const serviceCounts = bookingsDb.reduce((acc, b) => {
              acc[b.service] = (acc[b.service] || 0) + 1;
              return acc;
            }, { counselling: 0, career: 0 });

            const maxBookings = sortedMonths.length > 0 ? Math.max(...sortedMonths.map(m => m[1])) : 1;

            return (
              <div className="space-y-6 animate-in fade-in duration-200 text-sm">
                <div className="border-b border-zinc-800 pb-3">
                  <h3 className="text-sm font-bold capitalize  text-white font-header">Platform Analytics & Insights</h3>
                  <p className="text-sm text-zinc-500 font-medium pt-1">Analyze platform booking volume, consultant loads, and product performance</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Monthly bookings vertical chart */}
                  <div className="lg:col-span-8 bg-zinc-955 border border-zinc-850 rounded-xl p-5 space-y-4">
                    <span className="text-sm capitalize font-bold  text-zinc-400 block border-b border-zinc-900 pb-2">Monthly Booking Volumes</span>
                    <div className="h-48 flex items-end justify-between gap-4 pt-6 px-4">
                      {sortedMonths.map(([month, count]) => {
                        const pct = ((count / maxBookings) * 100).toFixed(0);
                        return (
                          <div key={month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                            <span className="text-sm text-brand font-bold opacity-0 group-hover:opacity-100 transition-opacity ">{count} Booking(s)</span>
                            <div
                              className="w-full bg-brand/15 hover:bg-brand border border-brand/30 hover:border-brand rounded-t transition-all duration-500 relative"
                              style={{ height: `${pct}%`, minHeight: '6%' }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 pointer-events-none" />
                            </div>
                            <span className="text-sm text-zinc-500 font-bold capitalize ">{month}</span>
                          </div>
                        );
                      })}
                      {sortedMonths.length === 0 && (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600 italic">No bookings registered for monthly logging.</div>
                      )}
                    </div>
                  </div>

                  {/* Right: Service and psychologist breakdown */}
                  <div className="lg:col-span-4 space-y-4">
                    {/* Service Type Breakdown */}
                    <div className="bg-zinc-955 border border-zinc-850 rounded-xl p-5 space-y-3">
                      <span className="text-sm capitalize font-bold  text-zinc-400 block border-b border-zinc-900 pb-2">Service Breakdown</span>
                      <div className="space-y-3 text-sm">
                        <div className="space-y-1">
                          <div className="flex justify-between font-bold">
                            <span className="text-zinc-400">Emotional Wellbeing</span>
                            <span className="text-white ">{serviceCounts.counselling} booked</span>
                          </div>
                          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-850">
                            <div className="bg-brand h-full rounded-full" style={{ width: `${(serviceCounts.counselling / (bookingsDb.length || 1)) * 100}%` }} />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between font-bold">
                            <span className="text-zinc-400">Career Mapping</span>
                            <span className="text-white ">{serviceCounts.career} booked</span>
                          </div>
                          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-850">
                            <div className="bg-brand h-full rounded-full" style={{ width: `${(serviceCounts.career / (bookingsDb.length || 1)) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Top psychologist list */}
                    <div className="bg-zinc-955 border border-zinc-850 rounded-xl p-5 space-y-3">
                      <span className="text-sm capitalize font-bold  text-zinc-400 block border-b border-zinc-900 pb-2">Top Performers (Completed)</span>
                      <div className="space-y-2 text-sm">
                        {sortedAdvisors.map(([name, count], idx) => (
                          <div key={name} className="flex items-center justify-between p-2 bg-zinc-900/40 rounded border border-zinc-855">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded bg-zinc-900 border border-zinc-800 text-brand text-sm font-bold flex items-center justify-center ">#{idx + 1}</span>
                              <span className="font-bold text-white capitalize truncate max-w-[120px]">{name}</span>
                            </div>
                            <span className="text-brand font-bold capitalize  text-sm">{count} Sessions</span>
                          </div>
                        ))}
                        {sortedAdvisors.length === 0 && (
                          <div className="text-zinc-650 italic text-center py-4">No completed consultations.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>
      </div>

      {/* 1. STUDENT ADD / EDIT MODAL */}
      {(isAddUserOpen || isEditUserOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-955/80 backdrop-blur-xs animate-in fade-in duration-300"
            onClick={() => { setIsAddUserOpen(false); setIsEditUserOpen(false); }}
          />
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 text-left text-white z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-base font-bold text-white capitalize  font-header">
                {isAddUserOpen ? 'Register Student' : 'Edit Student Details'}
              </h3>
              <p className="text-sm text-zinc-500 leading-none mt-1">
                {isAddUserOpen ? 'Provision a new student account.' : 'Modify account registry records.'}
              </p>
            </div>
            <form onSubmit={isAddUserOpen ? handleCreateUser : handleUpdateUser} className="space-y-4 font-medium">
              {isEditUserOpen && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Profile Picture</label>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center text-brand font-bold text-lg">
                      {userProfilePicFile ? (
                        <img src={URL.createObjectURL(userProfilePicFile)} alt="Preview" className="w-full h-full object-cover" />
                      ) : userForm.profilePic ? (
                        <img src={userForm.profilePic} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        getInitials(userForm.name)
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <input ref={userProfilePicRef} type="file" accept="image/jpeg,image/png,image/jpg" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) setUserProfilePicFile(file); }} />
                      <button type="button" onClick={() => userProfilePicRef.current?.click()} className="px-3 py-2 text-xs font-bold bg-zinc-950 border border-zinc-800 hover:border-brand text-zinc-300 hover:text-white rounded-lg cursor-pointer transition">
                        {userProfilePicFile ? 'Change Image' : 'Upload Photo'}
                      </button>
                      {userProfilePicFile && (<p className="text-xs text-zinc-500 truncate max-w-[180px]">{userProfilePicFile.name}</p>)}
                    </div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Full Name</label>
                  <input type="text" required placeholder="e.g. John Doe" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Email Address</label>
                  <input type="email" required placeholder="john@example.com" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm capitalize  font-bold text-zinc-400">
                  Password {isEditUserOpen && <span className="text-zinc-500 lowercase font-normal">(leave blank to keep unchanged)</span>}
                </label>
                <input type="password" required={isAddUserOpen} placeholder={isEditUserOpen ? "••••••••" : "Enter password"} value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} className="w-full px-3.5 py-3 bg-zinc-950 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors" />
              </div>
              {isEditUserOpen && (
                <>
                  <div className="border-t border-zinc-800 pt-3">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Student Information</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Phone Number</label>
                        <input type="tel" placeholder="e.g. 9876543210" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Grade / Class</label>
                        <input type="text" placeholder="e.g. Grade 10" value={userForm.grade} onChange={(e) => setUserForm({ ...userForm, grade: e.target.value })} className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors" />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">School Name</label>
                        <input type="text" placeholder="e.g. St. Mary's Higher Secondary School" value={userForm.schoolName} onChange={(e) => setUserForm({ ...userForm, schoolName: e.target.value })} className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors" />
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-zinc-800 pt-3">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Guardian Information</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Guardian Name</label>
                        <input type="text" placeholder="e.g. Mary Doe" value={userForm.guardianName} onChange={(e) => setUserForm({ ...userForm, guardianName: e.target.value })} className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Guardian Phone</label>
                        <input type="tel" placeholder="e.g. 9876543211" value={userForm.guardianPhone} onChange={(e) => setUserForm({ ...userForm, guardianPhone: e.target.value })} className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Group / Batch Code</label>
                        <input type="text" placeholder="e.g. CIGI-2024-A" value={userForm.groupCode} onChange={(e) => setUserForm({ ...userForm, groupCode: e.target.value })} className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors" />
                      </div>
                    </div>
                  </div>
                </>
              )}
              {userFormError && (<p className="text-sm text-rose-500 font-bold capitalize tracking-wide ">{userFormError}</p>)}
              {userFormSuccess && (<p className="text-sm text-emerald-500 font-bold capitalize tracking-wide">{userFormSuccess}</p>)}
              {isUserPicUploading && (<p className="text-xs text-brand font-bold animate-pulse">Uploading profile picture...</p>)}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setIsAddUserOpen(false); setIsEditUserOpen(false); }} className="flex-1 py-3 border border-zinc-800 hover:bg-zinc-850 text-white font-bold text-sm capitalize  rounded-lg cursor-pointer transition text-center">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-brand hover:bg-brand-dark text-zinc-950 font-bold text-sm capitalize  rounded-lg cursor-pointer transition border-none shadow-md">{isAddUserOpen ? 'Create Account' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. PSYCHOLOGIST ADD / EDIT MODAL */}
      {(isAddPsyOpen || isEditPsyOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-955/80 backdrop-blur-xs animate-in fade-in duration-300"
            onClick={() => { setIsAddPsyOpen(false); setIsEditPsyOpen(false); }}
          />
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 text-left text-white z-10 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div>
              <h3 className="text-base font-bold text-white capitalize  font-header">
                {isAddPsyOpen ? 'Register Psychologist' : 'Edit Psychologist details'}
              </h3>
              <p className="text-sm text-zinc-500 leading-none mt-1">
                {isAddPsyOpen ? 'Register a clinical professional profile.' : 'Modify credentials, rates, and bios.'}
              </p>
            </div>

            <form onSubmit={isAddPsyOpen ? handleCreatePsy : handleUpdatePsy} className="space-y-4 font-medium">
              {isEditPsyOpen && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Profile Picture</label>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center text-brand font-bold text-lg">
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
                      <button type="button" onClick={() => psyProfilePicRef.current?.click()} className="px-3 py-2 text-xs font-bold bg-zinc-950 border border-zinc-800 hover:border-brand text-zinc-300 hover:text-white rounded-lg cursor-pointer transition">
                        {psyProfilePicFile ? 'Change Image' : 'Upload Photo'}
                      </button>
                      {psyProfilePicFile && (<p className="text-xs text-zinc-500 truncate max-w-[180px]">{psyProfilePicFile.name}</p>)}
                    </div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-sm capitalize  font-bold text-zinc-400">Full Name</label>
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
                  <label className="text-sm capitalize  font-bold text-zinc-400">Email Address</label>
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
                  <label className="text-sm capitalize  font-bold text-zinc-400">
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
                  <label className="text-sm capitalize  font-bold text-zinc-400">Education qualifications</label>
                  <input
                    type="text"
                    placeholder="e.g. MPhil Clinical Psychology"
                    value={psyForm.education}
                    onChange={(e) => setPsyForm({ ...psyForm, education: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm capitalize  font-bold text-zinc-400">Professional Title</label>
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
                  <label className="text-sm capitalize  font-bold text-zinc-400">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 94971 74011"
                    value={psyForm.phone}
                    onChange={(e) => setPsyForm({ ...psyForm, phone: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm capitalize  font-bold text-zinc-400">Hourly price (INR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1250"
                    value={psyForm.price}
                    onChange={(e) => setPsyForm({ ...psyForm, price: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm capitalize  font-bold text-zinc-400">Languages Spoken</label>
                  <input
                    type="text"
                    placeholder="e.g. Malayalam, English"
                    value={psyForm.lang}
                    onChange={(e) => setPsyForm({ ...psyForm, lang: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm capitalize  font-bold text-zinc-400">Experience Hours</label>
                  <input
                    type="number"
                    placeholder="e.g. 150"
                    value={psyForm.hours}
                    onChange={(e) => setPsyForm({ ...psyForm, hours: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-sm capitalize  font-bold text-zinc-400">Default Google Meet Link (optional)</label>
                  <input
                    type="text"
                    placeholder="https://meet.google.com/abc-defg-hij"
                    value={psyForm.defaultMeetLink}
                    onChange={(e) => setPsyForm({ ...psyForm, defaultMeetLink: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-955 border border-zinc-855 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5 pt-1">
                  <label className="text-sm capitalize  font-bold text-zinc-400 block mb-1">Supported Session Modes</label>
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

                <div className="sm:col-span-2 space-y-1.5 pt-1">
                  <label className="text-sm capitalize  font-bold text-zinc-400 block mb-1">Featured Psychologist (Top 5)</label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300 select-none font-semibold">
                    <input
                      type="checkbox"
                      checked={psyForm.isTopFive || false}
                      onChange={(e) => setPsyForm({ ...psyForm, isTopFive: e.target.checked })}
                      className="w-4 h-4 rounded border-zinc-805 bg-zinc-955 text-brand focus:ring-0 focus:ring-offset-0 cursor-pointer accent-brand"
                    />
                    <span>Show as Top 5 Featured Counselor on Landing Page</span>
                  </label>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-sm capitalize  font-bold text-zinc-400">Specialties (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Anxiety, Stress Management, Mood Disorders"
                    value={psyForm.specialties}
                    onChange={(e) => setPsyForm({ ...psyForm, specialties: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-955 border border-zinc-855 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-sm capitalize  font-bold text-zinc-400">Professional Bio</label>
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
                  <h4 className="text-sm font-bold text-zinc-300 capitalize font-header">Availability Timings</h4>

                  {/* Operational Days */}
                  <div className="space-y-1.5">
                    <label className="text-xs capitalize font-bold text-zinc-400 block">Operational Days</label>
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
                            className={`px-3 py-1.5 border rounded-lg text-xs font-bold capitalize transition-all duration-200 cursor-pointer ${active
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
                    <label className="text-xs capitalize font-bold text-zinc-400 block">Timing Slots (Active)</label>
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
                        <div className="col-span-2 py-4 bg-zinc-955/40 border border-dashed border-zinc-850 rounded-xl text-zinc-550 italic text-xs text-center w-full">
                          No timing slots configured. Use the controls below to add custom slots or generate from a time range.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add Custom Timing Slot */}
                  <div className="space-y-1.5 bg-zinc-955/50 border border-zinc-850/60 p-3.5 rounded-xl">
                    <label className="text-xs capitalize font-bold text-zinc-350 block">Add Custom Timing Slot</label>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1 space-y-0.5">
                        <label className="text-[10px] text-zinc-500 capitalize font-bold block">Hour</label>
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
                        <label className="text-[10px] text-zinc-500 capitalize font-bold block">Minute</label>
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
                        <label className="text-[10px] text-zinc-500 capitalize font-bold block">AM/PM</label>
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
                        className="bg-brand/10 hover:bg-brand text-brand hover:text-zinc-955 px-3 py-1.5 text-xs font-bold capitalize rounded-lg transition-colors border border-brand/30 hover:border-brand cursor-pointer shrink-0 h-[30px] flex items-center justify-center font-header"
                      >
                        Add Slot
                      </button>
                    </div>
                  </div>

                  {/* Add Custom Time Range */}
                  <div className="space-y-1.5 bg-zinc-955/50 border border-zinc-850/60 p-3.5 rounded-xl">
                    <label className="text-xs capitalize font-bold text-zinc-350 block">Generate Timing Slots from Range</label>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-1.5 items-end">
                        <span className="text-xs text-zinc-500 font-bold pb-1.5 capitalize tracking-wide w-10 text-left">From:</span>
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
                        <span className="text-xs text-zinc-500 font-bold pb-1.5 capitalize tracking-wide w-10 text-left">To:</span>
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
                        className="w-full mt-1 bg-brand/10 hover:bg-brand text-brand hover:text-zinc-955 py-2 text-xs font-bold capitalize rounded-lg transition-colors border border-brand/30 hover:border-brand cursor-pointer flex items-center justify-center font-header"
                      >
                        Generate Hourly Slots from Range
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {psyFormError && (
                <p className="text-sm text-rose-500 font-bold capitalize tracking-wide ">{psyFormError}</p>
              )}

              {psyFormSuccess && (
                <p className="text-sm text-emerald-500 font-bold capitalize tracking-wide">{psyFormSuccess}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsAddPsyOpen(false); setIsEditPsyOpen(false); }}
                  className="flex-1 py-3 border border-zinc-800 hover:bg-zinc-850 text-white font-bold text-sm capitalize  rounded-lg cursor-pointer transition text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand hover:bg-brand-dark text-zinc-955 font-bold text-sm capitalize  rounded-lg cursor-pointer transition border-none shadow-md"
                >
                  {isAddPsyOpen ? 'Save Psychologist' : 'Update Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. BOOKING ADD / EDIT MODAL */}
      {(isAddBookingOpen || isEditBookingOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-955/80 backdrop-blur-xs animate-in fade-in duration-300"
            onClick={() => { setIsAddBookingOpen(false); setIsEditBookingOpen(false); }}
          />
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 text-left text-white z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-base font-bold text-white capitalize  font-header">
                {isAddBookingOpen ? 'Schedule Consultation' : 'Update Appointment'}
              </h3>
              <p className="text-sm text-zinc-500 leading-none mt-1">
                {isAddBookingOpen ? 'Configure slot details and associate clients.' : 'Edit scheduled date, time slot, and meeting link.'}
              </p>
            </div>

            <form onSubmit={isAddBookingOpen ? handleCreateBooking : handleUpdateBooking} className="space-y-4 font-medium">
              <div className="space-y-1">
                <label className="text-sm capitalize  font-bold text-zinc-400">Select Student</label>
                <select
                  required
                  disabled={isEditBookingOpen}
                  value={bookingForm.userId}
                  onChange={(e) => setBookingForm({ ...bookingForm, userId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none cursor-pointer"
                >
                  <option value="" disabled>-- Select a student --</option>
                  {usersDb.filter(u => u.role === 'USER' || !u.role).map(student => (
                    <option key={student.id} value={student.id}>{student.name} ({student.email})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm capitalize  font-bold text-zinc-400">Select Psychologist</label>
                <select
                  required
                  disabled={isEditBookingOpen}
                  value={bookingForm.advisorId}
                  onChange={(e) => {
                    const nextAdvisorId = e.target.value;
                    const nextPsy = usersDb.find(u => u.id === nextAdvisorId);
                    let firstSlot = '';
                    if (nextPsy && nextPsy.availability?.availableSlots?.length > 0) {
                      firstSlot = nextPsy.availability.availableSlots[0];
                    }
                    setBookingForm({ ...bookingForm, advisorId: nextAdvisorId, time: firstSlot });
                  }}
                  className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none cursor-pointer"
                >
                  <option value="" disabled>-- Select psychologist --</option>
                  {usersDb.filter(u => u.role === 'PSYCHOLOGIST').map(psy => (
                    <option key={psy.id} value={psy.id}>{psy.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm capitalize  font-bold text-zinc-400">Service Category</label>
                  <select
                    value={bookingForm.service}
                    onChange={(e) => setBookingForm({ ...bookingForm, service: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none cursor-pointer"
                  >
                    <option value="counselling">Emotional Wellbeing</option>
                    <option value="career">Career Mapping</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm capitalize  font-bold text-zinc-400">Mode</label>
                  <select
                    value={bookingForm.mode}
                    onChange={(e) => setBookingForm({ ...bookingForm, mode: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none cursor-pointer"
                  >
                    <option value="ONLINE">ONLINE</option>
                    <option value="OFFLINE">OFFLINE</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm capitalize  font-bold text-zinc-400">Booking Date</label>
                  <input
                    type="date"
                    required
                    min={getLocalTodayString()}
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm capitalize  font-bold text-zinc-400">Time Slot</label>
                  <select
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none cursor-pointer"
                  >
                    <option value="" disabled>-- Select time slot --</option>
                    {getAdvisorSlotsForBookingForm().map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <label className="text-sm capitalize  font-bold text-zinc-400">Meeting Room URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="https://meet.google.com/abc-def-ghi"
                    value={bookingForm.meetLink}
                    onChange={(e) => setBookingForm({ ...bookingForm, meetLink: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none"
                  />
                </div>

                 <div className="space-y-1">
                  <label className="text-sm capitalize  font-bold text-zinc-400">Booking Status</label>
                  <select
                    value={bookingForm.status}
                    onChange={(e) => setBookingForm({ ...bookingForm, status: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-855 focus:border-brand rounded-lg text-sm text-white outline-none cursor-pointer"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="EXPIRED">EXPIRED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm capitalize  font-bold text-zinc-400">Office / Admin Internal Notes</label>
                  <textarea
                    placeholder="Enter internal staff/followup notes (only visible to admin staff)..."
                    value={bookingForm.adminNotes || ''}
                    onChange={(e) => setBookingForm({ ...bookingForm, adminNotes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none resize-none font-semibold"
                  />
                </div>
              </div>

              {bookingFormError && (
                <p className="text-sm text-rose-500 font-bold capitalize tracking-wide ">{bookingFormError}</p>
              )}

              {bookingFormSuccess && (
                <p className="text-sm text-emerald-500 font-bold capitalize tracking-wide">{bookingFormSuccess}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsAddBookingOpen(false); setIsEditBookingOpen(false); }}
                  className="flex-1 py-3 border border-zinc-800 hover:bg-zinc-850 text-white font-bold text-sm capitalize  rounded-lg cursor-pointer transition text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand hover:bg-brand-dark text-zinc-955 font-bold text-sm capitalize  rounded-lg cursor-pointer transition border-none shadow-md"
                >
                  {isAddBookingOpen ? 'Confirm Slot' : 'Update Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. FAQ ADD / EDIT MODAL */}
      {(isAddFaqOpen || isEditFaqOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-955/80 backdrop-blur-xs animate-in fade-in duration-300"
            onClick={() => { setIsAddFaqOpen(false); setIsEditFaqOpen(false); }}
          />
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 text-left text-white z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-base font-bold text-white capitalize  font-header">
                {isAddFaqOpen ? 'Create FAQ Record' : 'Update FAQ Record'}
              </h3>
              <p className="text-sm text-zinc-500 leading-none mt-1">
                {isAddFaqOpen ? 'Publish a new question and answer to the public landing page.' : 'Modify the existing question or answer detail.'}
              </p>
            </div>

            <form onSubmit={isAddFaqOpen ? handleCreateFaq : handleUpdateFaq} className="space-y-4 font-medium">
              <div className="space-y-1">
                <label className="text-sm capitalize  font-bold text-zinc-400">FAQ Question</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How does the aptitude assessment work?"
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm capitalize  font-bold text-zinc-400">Detailed Answer</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Provide a detailed, helpful answer..."
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors resize-none"
                />
              </div>

              {faqFormError && (
                <p className="text-sm text-rose-500 font-bold capitalize tracking-wide ">{faqFormError}</p>
              )}

              {faqFormSuccess && (
                <p className="text-sm text-emerald-500 font-bold capitalize tracking-wide">{faqFormSuccess}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsAddFaqOpen(false); setIsEditFaqOpen(false); }}
                  className="flex-1 py-3 border border-zinc-800 hover:bg-zinc-850 text-white font-bold text-sm capitalize  rounded-lg cursor-pointer transition text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand hover:bg-brand-dark text-zinc-955 font-bold text-sm capitalize  rounded-lg cursor-pointer transition border-none shadow-md"
                >
                  {isAddFaqOpen ? 'Create FAQ' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4.5 APTITUDE QUESTION ADD / EDIT MODAL */}
      {(isAddAptitudeOpen || isEditAptitudeOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-955/80 backdrop-blur-xs animate-in fade-in duration-300"
            onClick={() => { setIsAddAptitudeOpen(false); setIsEditAptitudeOpen(false); }}
          />
          <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 text-left text-white z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-base font-bold text-white capitalize  font-header flex items-center gap-2">
                <Brain className="w-5 h-5 text-brand" />
                {isAddAptitudeOpen ? 'Create Aptitude Question' : 'Update Aptitude Question'}
              </h3>
              <p className="text-sm text-zinc-500 leading-none mt-1">
                {isAddAptitudeOpen ? 'Add a new question to the assessment database.' : 'Modify the selected question details.'}
              </p>
            </div>

            <form onSubmit={isAddAptitudeOpen ? handleCreateAptitudeQuestion : handleUpdateAptitudeQuestion} className="space-y-5 font-medium">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm capitalize  font-bold text-zinc-400">Category / Domain</label>
                  <select
                    value={aptitudeForm.category}
                    onChange={(e) => setAptitudeForm({ ...aptitudeForm, category: e.target.value })}
                    className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
                  >
                    <option value="Logical">Logical</option>
                    <option value="Verbal">Verbal</option>
                    <option value="Numerical">Numerical</option>
                    <option value="Spatial">Spatial</option>
                    <option value="Abstract">Abstract</option>
                  </select>
                </div>
                <div className="space-y-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer bg-zinc-955 border border-zinc-850 p-3 rounded-lg">
                    <input
                      type="checkbox"
                      checked={aptitudeForm.isActive}
                      onChange={(e) => setAptitudeForm({ ...aptitudeForm, isActive: e.target.checked })}
                      className="w-4 h-4 text-brand bg-zinc-900 border-zinc-800 rounded focus:ring-brand focus:ring-2"
                    />
                    <span className="text-sm capitalize  font-bold text-zinc-400">Active</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm capitalize  font-bold text-zinc-400">Question Text</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Which number comes next in the sequence?"
                  value={aptitudeForm.question}
                  onChange={(e) => setAptitudeForm({ ...aptitudeForm, question: e.target.value })}
                  className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors resize-none"
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-sm capitalize  font-bold text-zinc-400 flex items-center justify-between">
                  <span>Answer Options</span>
                  <span className="text-xs text-zinc-500 font-normal normal-case">Assign higher weights to correct answers.</span>
                </label>

                {aptitudeForm.options.map((opt, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-8 h-10 shrink-0 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-center font-bold text-zinc-500 text-sm">
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <input
                      type="text"
                      required
                      placeholder={`Option ${idx + 1}`}
                      value={opt.text}
                      onChange={(e) => {
                        const newOpts = [...aptitudeForm.options];
                        newOpts[idx].text = e.target.value;
                        setAptitudeForm({ ...aptitudeForm, options: newOpts });
                      }}
                      className="flex-1 px-3.5 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
                    />
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      placeholder="Weight"
                      value={opt.weight}
                      onChange={(e) => {
                        const newOpts = [...aptitudeForm.options];
                        newOpts[idx].weight = Number(e.target.value) || 0;
                        setAptitudeForm({ ...aptitudeForm, options: newOpts });
                      }}
                      className="w-20 px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors "
                      title="Weight (Score value)"
                    />
                  </div>
                ))}
              </div>

              {aptitudeFormError && (
                <p className="text-sm text-rose-500 font-bold capitalize tracking-wide ">{aptitudeFormError}</p>
              )}

              {aptitudeFormSuccess && (
                <p className="text-sm text-emerald-500 font-bold capitalize tracking-wide">{aptitudeFormSuccess}</p>
              )}

              <div className="flex gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => { setIsAddAptitudeOpen(false); setIsEditAptitudeOpen(false); }}
                  className="flex-1 py-3 border border-zinc-800 hover:bg-zinc-850 text-white font-bold text-sm capitalize  rounded-lg cursor-pointer transition text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand hover:bg-brand-dark text-zinc-955 font-bold text-sm capitalize  rounded-lg cursor-pointer transition border-none shadow-md"
                >
                  {isAddAptitudeOpen ? 'Create Question' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. STUDENT VIEW DETAILS MODAL */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-955/80 backdrop-blur-xs animate-in fade-in duration-300"
            onClick={() => setViewingStudent(null)}
          />
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-left text-white z-10 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[85vh]">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 text-brand flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden">
                  {viewingStudent.profilePic || viewingStudent.image ? (
                    <img src={viewingStudent.profilePic || viewingStudent.image} alt={viewingStudent.name} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(viewingStudent.name)
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white capitalize  font-header flex items-center gap-2">
                    <User className="w-5 h-5 text-brand" /> Student Profile Details
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1">Registry records, booking history, and diagnostic aptitude profiles.</p>
                </div>
              </div>
              <button
                onClick={() => setViewingStudent(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer border-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Account details */}
              <div className="bg-zinc-955 border border-zinc-850 rounded-xl p-4 space-y-3">
                <span className="text-sm capitalize  font-bold text-zinc-500 block">Registry Metadata</span>
                <div className="space-y-2.5 text-sm">
                  <div>
                    <span className="text-zinc-500 block text-sm capitalize">Account ID</span>
                    <span className=" text-zinc-300 break-all">{viewingStudent.id}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-sm capitalize">Full Name</span>
                    <span className="font-bold text-white">{viewingStudent.name}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-sm capitalize">Email Address</span>
                    <span className="font-bold text-zinc-350 break-all">{viewingStudent.email}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-sm capitalize">Account Status</span>
                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-sm font-bold capitalize  ${(viewingStudent.status || 'ACTIVE') === 'ACTIVE'
                      ? 'bg-emerald-955/20 border border-emerald-900/30 text-emerald-450'
                      : 'bg-rose-955/20 border border-rose-900/30 text-rose-500'
                      }`}>
                      {viewingStudent.status || 'ACTIVE'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Consultation Stats */}
              <div className="bg-zinc-955 border border-zinc-850 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <span className="text-sm capitalize  font-bold text-zinc-500 block mb-3">Consultation Summary</span>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-850">
                      <p className="text-xl font-bold text-brand">
                        {bookingsDb.filter(b => b.userId === viewingStudent.id).length}
                      </p>
                      <p className="text-sm text-zinc-500 font-bold capitalize  mt-0.5">Total Bookings</p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-850">
                      <p className="text-xl font-bold text-emerald-400">
                        {bookingsDb.filter(b => b.userId === viewingStudent.id && b.status === 'COMPLETED').length}
                      </p>
                      <p className="text-sm text-zinc-500 font-bold capitalize  mt-0.5">Completed</p>
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t border-zinc-900 text-sm text-zinc-400">
                  {(() => {
                    const pendingBookings = bookingsDb.filter(b => b.userId === viewingStudent.id && b.status === 'PENDING').length;
                    const confirmedBookings = bookingsDb.filter(b => b.userId === viewingStudent.id && b.status === 'CONFIRMED').length;
                    return `Scheduled slots: ${confirmedBookings} active, ${pendingBookings} awaiting approval`;
                  })()}
                </div>
              </div>
            </div>

            {/* Booking History List */}
            <div className="space-y-2">
              <span className="text-sm capitalize  font-bold text-zinc-500 block">Consultation History Log</span>
              <div className="border border-zinc-850 rounded-xl overflow-hidden bg-zinc-955 max-h-[160px] overflow-y-auto">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-sm border-collapse text-left min-w-[420px]">
                    <thead>
                      <tr className="bg-zinc-900/50 text-zinc-500 font-bold capitalize  border-b border-zinc-855">
                        <th className="p-2.5 whitespace-nowrap">Date & Time</th>
                        <th className="p-2.5 whitespace-nowrap">Advisor</th>
                        <th className="p-2.5 whitespace-nowrap">Service Type</th>
                        <th className="p-2.5 text-center whitespace-nowrap">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const studentBookings = bookingsDb.filter(b => b.userId === viewingStudent.id);
                        if (studentBookings.length === 0) {
                          return (
                            <tr>
                              <td colSpan={4} className="p-4 text-center text-zinc-600 italic whitespace-nowrap">No consult history for this student.</td>
                            </tr>
                          );
                        }
                        return studentBookings.map(b => {
                          const psychologist = usersDb.find(u => u.id === b.advisorId);
                          return (
                            <tr key={b.id} className="border-b border-zinc-900/60 hover:bg-zinc-900/30">
                              <td className="p-2.5 whitespace-nowrap">
                                <span className="text-white block font-semibold">{formatDateString(b.date)}</span>
                                <span className="text-zinc-500 text-sm">{b.time}</span>
                              </td>
                              <td className="p-2.5 text-zinc-300 font-medium whitespace-nowrap">
                                {psychologist ? psychologist.name : 'Unknown Advisor'}
                              </td>
                              <td className="p-2.5 text-zinc-400 capitalize font-medium whitespace-nowrap">
                                {b.service === 'counselling' ? 'Wellbeing' : 'Career Mapping'} ({b.mode})
                              </td>
                              <td className="p-2.5 text-center whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded text-sm font-bold capitalize  ${b.status === 'CONFIRMED' ? 'bg-indigo-950/20 border border-indigo-900/30 text-indigo-400' :
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

            {/* Aptitude Results Details */}
            <div className="space-y-3">
              <span className="text-sm capitalize  font-bold text-zinc-500 block">Diagnostic Aptitude Reports</span>
              {(() => {
                const studentTests = testResultsDb.filter(res => res.studentEmail?.toLowerCase() === viewingStudent.email?.toLowerCase());
                if (studentTests.length === 0) {
                  return (
                    <div className="p-5 bg-zinc-950/30 border border-zinc-850/60 rounded-xl text-center text-zinc-650 italic text-sm">
                      No aptitude assessment reports logged.
                    </div>
                  );
                }
                return (
                  <div className="space-y-4">
                    {studentTests.map(res => (
                      <div key={res.id} className="bg-zinc-955 border border-zinc-850 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                          <div>
                            <span className="text-sm bg-brand text-zinc-955 px-2 py-0.5 rounded font-bold capitalize  ">
                              Dominant: {res.dominantDomain}
                            </span>
                            <span className="text-zinc-500 text-sm font-bold block mt-1 capitalize ">Date Completed: {formatDateString(res.date)}</span>
                          </div>
                          <button
                            onClick={() => handleExportAptitudeResults(res)}
                            className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:text-brand rounded font-bold capitalize text-sm  cursor-pointer border-none"
                          >
                            Copy Report
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          {Object.entries(res.scores || {}).map(([key, val]) => (
                            <div key={key} className="space-y-1">
                              <div className="flex justify-between items-center font-bold">
                                <span className="text-zinc-400 capitalize">{key}</span>
                                <span className="text-brand ">{val}%</span>
                              </div>
                              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-850">
                                <div
                                  className="bg-brand h-full rounded-full transition-all duration-500"
                                  style={{ width: `${val}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="pt-2 flex justify-end">

              {/* CIGI Differential Aptitude Test Results Management */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <span className="text-sm capitalize font-bold text-zinc-550 block">CIGI Differential Aptitude Test (C-DAT) Results</span>

                {/* Existing uploads */}
                <div className="space-y-2">
                  {(!viewingStudent.cigiResults || viewingStudent.cigiResults.length === 0) ? (
                    <div className="p-4 bg-zinc-950/30 border border-zinc-850/60 rounded-xl text-center text-zinc-650 italic text-xs">
                      No CIGI results uploaded for this student yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2.5 max-h-[200px] overflow-y-auto pr-1">
                      {viewingStudent.cigiResults.map(res => (
                        <div key={res.id} className="p-3 bg-zinc-955 border border-zinc-850 rounded-xl flex items-center justify-between gap-3 text-sm">
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${res.fileType === 'pdf' ? 'bg-rose-955/40 border border-rose-900/30 text-rose-450' : 'bg-blue-955/40 border border-blue-900/30 text-blue-400'}`}>
                                {res.fileType}
                              </span>
                              {(res.testDate || res.testTime) && (
                                <span className="text-xs text-zinc-400 font-medium">
                                  Date: {formatDateString(res.testDate)} {res.testTime}
                                </span>
                              )}
                            </div>
                            {res.note && (
                              <p className="text-xs text-zinc-400 italic truncate" title={res.note}>
                                "{res.note}"
                              </p>
                            )}
                            <span className="text-[10px] text-zinc-500 block">
                              Uploaded at: {formatDateString(res.uploadedAt)} {new Date(res.uploadedAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <a
                              href={res.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-300 hover:text-white transition"
                              title="View File"
                            >
                              <Link className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleAdminStartEditCigi(res)}
                              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-brand hover:text-brand-light transition cursor-pointer border-none"
                              title="Edit Result Info"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdminCigiDelete(res.id)}
                              className="p-1.5 bg-zinc-900 hover:bg-rose-955/20 border border-zinc-800 hover:border-rose-900/30 rounded-lg text-rose-500 hover:text-rose-450 transition cursor-pointer border-none"
                              title="Delete Result"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Form to Add/Edit Result */}
                <form onSubmit={handleAdminCigiUpload} className="bg-zinc-955 border border-zinc-850 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-bold text-zinc-405 block">
                    {adminCigiEditingId ? '📝 Edit CIGI Result Metadata / Replace File' : '➕ Add CIGI Result Record'}
                  </span>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-zinc-550 block mb-1">
                          Result File {adminCigiEditingId ? '(Optional)' : '(Required)'}
                        </label>
                        <input
                          type="file"
                          ref={adminCigiFileInputRef}
                          onChange={(e) => setAdminCigiFile(e.target.files[0])}
                          accept="image/*,application/pdf"
                          required={!adminCigiEditingId}
                          className="w-full text-xs text-zinc-400 file:mr-2.5 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 file:cursor-pointer p-1.5 border border-zinc-805 rounded bg-zinc-900 focus:outline-none"
                        />
                        <p className="text-[9px] text-zinc-500 mt-0.5">Images and PDFs up to 5MB</p>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-zinc-555 block mb-1">Remarks / Notes</label>
                        <input
                          type="text"
                          placeholder="e.g. Scored 85% logical"
                          value={adminCigiNote}
                          onChange={(e) => setAdminCigiNote(e.target.value)}
                          className="w-full p-2 bg-zinc-900 border border-zinc-800 focus:border-brand rounded text-xs text-white outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-zinc-550 block mb-1">Date Taken</label>
                        <input
                          type="date"
                          value={adminCigiDate}
                          onChange={(e) => setAdminCigiDate(e.target.value)}
                          className="w-full p-2 bg-zinc-900 border border-zinc-800 focus:border-brand rounded text-xs text-white outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-zinc-550 block mb-1">Time Taken</label>
                        <input
                          type="time"
                          value={adminCigiTime}
                          onChange={(e) => setAdminCigiTime(e.target.value)}
                          className="w-full p-2 bg-zinc-900 border border-zinc-800 focus:border-brand rounded text-xs text-white outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1.5 justify-end">
                      {adminCigiEditingId && (
                        <button
                          type="button"
                          onClick={handleAdminCancelEditCigi}
                          className="px-3.5 py-1.5 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded text-xs font-semibold cursor-pointer border-none"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={isAdminCigiUploading}
                        className="px-4 py-1.5 bg-brand hover:bg-brand-dark disabled:bg-zinc-700 text-zinc-955 font-bold rounded text-xs cursor-pointer border-none flex items-center gap-1 shadow"
                      >
                        {isAdminCigiUploading ? (
                          <><span className="w-3 h-3 border-2 border-zinc-955/30 border-t-zinc-955 rounded-full animate-spin" /> Saving...</>
                        ) : (
                          <>{adminCigiEditingId ? 'Update Result' : 'Upload Result'}</>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <button
                onClick={() => setViewingStudent(null)}
                className="px-6 py-2.5 border border-zinc-800 hover:bg-zinc-855 text-white font-bold text-sm capitalize  rounded-lg cursor-pointer transition text-center border-none"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. PSYCHOLOGIST VIEW DETAILS MODAL */}
      {viewingPsychologist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-955/80 backdrop-blur-xs animate-in fade-in duration-300"
            onClick={() => setViewingPsychologist(null)}
          />
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-left text-white z-10 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[85vh]">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 text-brand flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden">
                  {viewingPsychologist.profilePic || viewingPsychologist.image ? (
                    <img src={viewingPsychologist.profilePic || viewingPsychologist.image} alt={viewingPsychologist.name} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(viewingPsychologist.name)
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white capitalize  font-header flex items-center gap-2">
                    <Award className="w-5 h-5 text-brand" /> Psychologist Profile Details
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1">Credentials, availability, rates, and booking history logs.</p>
                </div>
              </div>
              <button
                onClick={() => setViewingPsychologist(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer border-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(() => {
              const title = viewingPsychologist.title || 'Consultant Psychologist';
              const phone = viewingPsychologist.phone || 'N/A';
              const hours = viewingPsychologist.hours !== undefined ? viewingPsychologist.hours : 0;
              const modes = viewingPsychologist.modes || ['ONLINE', 'OFFLINE', 'DOOR_STEP'];
              const education = viewingPsychologist.education || 'MPhil Clinical Psychology';
              const specialties = viewingPsychologist.specialties || 'Anxiety, Stress Management, Mood Disorders';
              const price = viewingPsychologist.price || 1200;
              const lang = viewingPsychologist.lang || 'English, Malayalam';
              const bio = viewingPsychologist.bio || viewingPsychologist.experience || 'Professional clinical therapist committed to student wellbeing.';

              return (
                <div className="space-y-6">
                  {/* Grid details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Professional Info */}
                    <div className="bg-zinc-955 border border-zinc-850 rounded-xl p-4 space-y-3.5 text-sm">
                      <span className="text-sm capitalize  font-bold text-zinc-500 block ">Advisor Credentials</span>
                      <div className="space-y-2.5">
                        <div>
                          <span className="text-zinc-500 block text-xs capitalize">Professional Title</span>
                          <span className="font-bold text-white">{title}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-sm capitalize">Full Name</span>
                          <span className="font-bold text-white">{viewingPsychologist.name}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-sm capitalize">Email Address</span>
                          <span className="font-semibold text-zinc-300 break-all">{viewingPsychologist.email}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-xs capitalize">Phone Number</span>
                          <span className="font-semibold text-zinc-300">{phone}</span>
                        </div>
                        <div>
                          <span className="text-zinc-550 block text-sm capitalize">Education Qualification</span>
                          <span className="font-bold text-zinc-350">{education}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-xs capitalize">Experience Hours</span>
                          <span className="font-bold text-zinc-300">{hours} hours</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-sm capitalize">Consultation Fee</span>
                          <span className="font-bold text-brand">₹{price} / hour</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-sm capitalize">Languages Spoken</span>
                          <span className="font-medium text-zinc-300">{lang}</span>
                        </div>
                        <div className="flex gap-2 items-center pt-1">
                          <span className={`px-2.5 py-0.5 rounded text-sm font-bold capitalize  ${(viewingPsychologist.status === 'APPROVED' || viewingPsychologist.status === 'ACTIVE')
                            ? 'bg-emerald-955/20 border border-emerald-900/30 text-emerald-450'
                            : viewingPsychologist.status === 'REJECTED'
                              ? 'bg-rose-955/20 border border-rose-900/30 text-rose-450'
                              : 'bg-amber-955/20 border border-amber-900/30 text-amber-500'
                            }`}>
                            {(viewingPsychologist.status === 'APPROVED' || viewingPsychologist.status === 'ACTIVE') ? 'Verified' : viewingPsychologist.status === 'REJECTED' ? 'Rejected' : 'Pending Verification'}
                          </span>
                          <a
                            href={`#/advisor/${viewingPsychologist.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-0.5 bg-zinc-900 border border-zinc-800 hover:text-brand rounded text-sm font-bold capitalize  transition"
                          >
                            Preview Profile
                          </a>
                        </div>
                        {viewingPsychologist.status === 'REJECTED' && viewingPsychologist.rejectionReason && (
                          <div className="mt-3 p-3 bg-rose-955/20 border border-rose-900/30 rounded-xl text-rose-300 text-xs text-left">
                            <span className="font-bold block text-rose-450 capitalize mb-0.5">Rejection Reason:</span>
                            {viewingPsychologist.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bio & Availability */}
                    <div className="space-y-4">
                      {/* Bio */}
                      <div className="bg-zinc-955 border border-zinc-850 rounded-xl p-4 space-y-2 text-sm">
                        <span className="text-sm capitalize  font-bold text-zinc-500 block ">Therapist Bio</span>
                        <p className="text-zinc-300 leading-relaxed italic text-[12.5px]">
                          "{bio}"
                        </p>
                      </div>

                      {/* Specialties List */}
                      <div className="bg-zinc-955 border border-zinc-850 rounded-xl p-4 space-y-2">
                        <span className="text-sm capitalize  font-bold text-zinc-500 block ">Areas of Expertise</span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {specialties.split(',').map(spec => (
                            <span
                              key={spec.trim()}
                              className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-sm font-bold text-zinc-400 capitalize tracking-wide"
                            >
                              {spec.trim()}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Supported Session Modes */}
                      <div className="bg-zinc-955 border border-zinc-850 rounded-xl p-4 space-y-2">
                        <span className="text-sm capitalize  font-bold text-zinc-500 block ">Supported Session Modes</span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {modes.map(mode => (
                            <span
                              key={mode}
                              className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400 capitalize tracking-wide"
                            >
                              {mode === 'DOOR_STEP' ? 'Doorstep' : mode.charAt(0) + mode.slice(1).toLowerCase()}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Active Availability Timings */}
                      <div className="bg-zinc-955 border border-zinc-850 rounded-xl p-4 space-y-2.5 text-sm">
                        <span className="text-sm capitalize font-bold text-zinc-500 block ">Active Availability Timings</span>
                        <div>
                          <span className="text-zinc-500 block text-xs capitalize">Operational Days</span>
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
                          <span className="text-zinc-500 block text-xs capitalize">Available Time Slots</span>
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
                      <span className="text-sm capitalize  font-bold text-zinc-500 block ">Consultation Schedule History</span>
                      <span className="text-sm text-brand font-bold capitalize  ">
                        {bookingsDb.filter(b => b.advisorId === viewingPsychologist.id || (b.advisorName && b.advisorName.toLowerCase() === viewingPsychologist.name.toLowerCase())).length} consultations booked
                      </span>
                    </div>

                    <div className="border border-zinc-850 rounded-xl overflow-hidden bg-zinc-955 max-h-[160px] overflow-y-auto">
                      <div className="overflow-x-auto w-full">
                        <table className="w-full text-sm border-collapse text-left min-w-[420px]">
                          <thead>
                            <tr className="bg-zinc-900/50 text-zinc-500 font-bold capitalize  border-b border-zinc-855">
                              <th className="p-2.5 whitespace-nowrap">Client Student</th>
                              <th className="p-2.5 whitespace-nowrap">Date & Time</th>
                              <th className="p-2.5 whitespace-nowrap">Type & Mode</th>
                              <th className="p-2.5 text-center whitespace-nowrap">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const psyBookings = bookingsDb.filter(b => b.advisorId === viewingPsychologist.id || (b.advisorName && b.advisorName.toLowerCase() === viewingPsychologist.name.toLowerCase()));
                              if (psyBookings.length === 0) {
                                return (
                                  <tr>
                                    <td colSpan={4} className="p-4 text-center text-zinc-650 italic whitespace-nowrap">No scheduled slot logs.</td>
                                  </tr>
                                );
                              }
                              return psyBookings.map(b => {
                                const student = usersDb.find(u => u.id === b.userId);
                                return (
                                  <tr key={b.id} className="border-b border-zinc-900/60 hover:bg-zinc-900/30">
                                    <td className="p-2.5 whitespace-nowrap">
                                      <span className="text-white block font-semibold">{student ? student.name : 'Unknown Student'}</span>
                                      <span className="text-zinc-500 text-sm truncate block max-w-[150px]">{student ? student.email : ''}</span>
                                    </td>
                                    <td className="p-2.5 whitespace-nowrap">
                                      <span className="text-zinc-300 block font-semibold">{formatDateString(b.date)}</span>
                                      <span className="text-zinc-500 text-sm">{b.time}</span>
                                    </td>
                                    <td className="p-2.5 text-zinc-400 capitalize font-medium whitespace-nowrap">
                                      {b.service === 'counselling' ? 'Wellbeing' : 'Career'} ({b.mode})
                                    </td>
                                    <td className="p-2.5 text-center whitespace-nowrap">
                                      <span className={`px-2 py-0.5 rounded text-sm font-bold capitalize  ${b.status === 'CONFIRMED' ? 'bg-indigo-950/20 border border-indigo-900/30 text-indigo-400' :
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
                className="px-6 py-2.5 border border-zinc-800 hover:bg-zinc-855 text-white font-bold text-sm capitalize  rounded-lg cursor-pointer transition text-center border-none"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. SUB-ADMIN EDIT PERMISSIONS MODAL */}
      {editingSubAdmin && (() => {
        const { cleanName } = parseStaffDetails(editingSubAdmin);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-zinc-955/80 backdrop-blur-xs animate-in fade-in duration-300"
              onClick={() => setEditingSubAdmin(null)}
            />
            <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 text-left text-white z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <div>
                <h3 className="text-base font-bold text-white capitalize font-header flex items-center gap-2">
                  <Lock className="w-4 h-4 text-brand" /> Edit Staff Permissions
                </h3>
                <p className="text-sm text-zinc-500 leading-none mt-1">
                  Editing access for <span className="text-zinc-300 font-bold">{cleanName}</span>
                </p>
              </div>

              <form onSubmit={handleSaveSubAdminPermissions} className="space-y-5 font-medium">

                {/* Role Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 capitalize">Assigned Role</label>
                  {rolesDb.length === 0 ? (
                    <p className="text-xs text-zinc-550 italic">No roles created yet. Create a role in the Roles & Scopes tab first.</p>
                  ) : (
                    <select
                      value={editSubAdminRoleName}
                      onChange={(e) => handleEditSubAdminRoleChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none cursor-pointer"
                    >
                      <option value="">— Select a role —</option>
                      {rolesDb.map(r => (
                        <option key={r.id || r._id} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Permission Modules Builder */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-400 capitalize">Granular Permissions</label>
                    <span className="text-[10px] text-zinc-550">Toggle modules or individual actions</span>
                  </div>
                  <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                    {PRIVILEGE_MODULES.map(module => {
                      const isModuleOn = !!editSubAdminPermissionsObj[module.id];
                      const enabledCount = module.actions.filter(a => editSubAdminPermissionsObj[a.id]).length;
                      return (
                        <div key={module.id} className="bg-zinc-950 border border-zinc-850 rounded-xl overflow-hidden">
                          {/* Module Header */}
                          <div
                            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-900/60 transition-colors"
                            onClick={() => toggleEditSubAdminModuleAll(module.id, module.actions, !isModuleOn)}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-brand text-base">{module.icon}</span>
                              <div>
                                <span className="text-sm font-bold text-white capitalize">{module.name}</span>
                                <span className="text-[10px] text-zinc-550 block leading-none">{enabledCount}/{module.actions.length} actions</span>
                              </div>
                            </div>
                            {/* Toggle switch */}
                            <div
                              className={`w-9 h-5 rounded-full transition-colors cursor-pointer flex items-center px-0.5 shrink-0 ${isModuleOn ? 'bg-brand' : 'bg-zinc-700'}`}
                              onClick={(e) => { e.stopPropagation(); toggleEditSubAdminModuleAll(module.id, module.actions, !isModuleOn); }}
                            >
                              <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${isModuleOn ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                          </div>
                          {/* Action Checkboxes */}
                          {isModuleOn && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 px-4 pb-3 pt-1 border-t border-zinc-850">
                              {module.actions.map(action => (
                                <label
                                  key={action.id}
                                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-900 cursor-pointer select-none"
                                >
                                  <input
                                    type="checkbox"
                                    checked={!!editSubAdminPermissionsObj[action.id]}
                                    onChange={() => toggleEditSubAdminChildAction(module.id, action.id, module.actions)}
                                    className="accent-brand rounded cursor-pointer w-3.5 h-3.5 shrink-0"
                                  />
                                  <span className="text-xs text-zinc-350 font-medium capitalize">{action.name}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {editSubAdminError && (
                  <p className="text-sm text-rose-500 font-bold capitalize tracking-wide">{editSubAdminError}</p>
                )}

                {editSubAdminSuccess && (
                  <p className="text-sm text-emerald-500 font-bold capitalize tracking-wide">{editSubAdminSuccess}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingSubAdmin(null)}
                    className="flex-1 py-3 border border-zinc-800 hover:bg-zinc-855 text-white font-bold text-sm capitalize rounded-lg cursor-pointer transition text-center border-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-brand hover:bg-brand-dark text-zinc-955 font-bold text-sm capitalize rounded-lg cursor-pointer transition border-none shadow-md"
                  >
                    Save Permissions
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ── PROFILE DRAWER ──────────────────────────────────────────── */}
      {isProfileDrawerOpen && (
        <div className="fixed inset-0 z-[60] flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsProfileDrawerOpen(false)}
          />
          {/* Drawer panel */}
          <div className="w-80 bg-zinc-900 border-l border-zinc-800 h-full overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-white capitalize  font-header">My Profile</h3>
                <p className="text-sm text-zinc-500 mt-0.5">Administrator Account</p>
              </div>
              <button
                onClick={() => setIsProfileDrawerOpen(false)}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer border-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Avatar + Name */}
            {(() => {
              const { cleanName, roleTitle } = parseStaffDetails(user);
              return (
                <div className="px-6 py-6 flex flex-col items-center text-center space-y-3 border-b border-zinc-800">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand to-brand-accent text-zinc-955 flex items-center justify-center font-header font-bold text-2xl shadow-xl">
                    {(cleanName || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white capitalize tracking-wide font-header">{cleanName}</h2>
                    <span className={`inline-block mt-1 text-sm px-2.5 py-1 rounded-full font-bold capitalize  ${isSuperAdmin
                      ? 'bg-brand/15 border border-brand/30 text-brand'
                      : 'bg-zinc-800 border border-zinc-700 text-zinc-400'
                      }`}>
                      {isSuperAdmin ? '⭐ Super Admin' : `🔐 ${roleTitle || 'Sub Admin'}`}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Profile Details */}
            <div className="px-6 py-5 space-y-4 flex-1">
              <div className="space-y-3">
                <p className="text-sm font-bold capitalize  text-zinc-500">Account Information</p>

                <div className="bg-zinc-950/60 rounded-xl p-4 space-y-3 border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                      <Mail className="w-3.5 h-3.5 text-brand" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold capitalize  text-zinc-500">Email</p>
                      <p className="text-sm text-white font-semibold truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                      <Shield className="w-3.5 h-3.5 text-brand" />
                    </div>
                    <div>
                      <p className="text-sm font-bold capitalize  text-zinc-500">Security Level</p>
                      <p className="text-sm text-white font-semibold">{isSuperAdmin ? 'Root Administrator' : 'Scoped Staff Member'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-brand" />
                    </div>
                    <div>
                      <p className="text-sm font-bold capitalize  text-zinc-500">Account ID</p>
                      <p className="text-sm text-zinc-400  truncate">{user.id}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Permissions (sub-admin) */}
              {!isSuperAdmin && user.permissions && (
                <div className="space-y-2">
                  <p className="text-sm font-bold capitalize  text-zinc-500">Assigned Permissions</p>
                  <div className="space-y-2">
                    {user.permissions.map(p => (
                      <div key={p} className="flex items-center gap-2 bg-zinc-950/60 rounded-lg px-3 py-2 border border-zinc-800">
                        <Check className="w-3 h-3 text-brand shrink-0" />
                        <span className="text-sm font-bold text-zinc-300 capitalize ">
                          {p.replace('MANAGE_', '')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats (super admin) */}
              {isSuperAdmin && (
                <div className="space-y-2">
                  <p className="text-sm font-bold capitalize  text-zinc-500">System Overview</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-800 text-center">
                      <p className="text-lg font-bold text-brand">{usersDb.filter(u => u.role === 'USER' || !u.role).length}</p>
                      <p className="text-sm text-zinc-500 font-bold capitalize ">Students</p>
                    </div>
                    <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-800 text-center">
                      <p className="text-lg font-bold text-brand">{usersDb.filter(u => u.role === 'PSYCHOLOGIST').length}</p>
                      <p className="text-sm text-zinc-500 font-bold capitalize ">Advisors</p>
                    </div>
                    <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-800 text-center">
                      <p className="text-lg font-bold text-brand">{bookingsDb.length}</p>
                      <p className="text-sm text-zinc-500 font-bold capitalize ">Bookings</p>
                    </div>
                    <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-800 text-center">
                      <p className="text-lg font-bold text-brand">{inquiriesDb.filter(i => i.status === 'PENDING' || !i.status).length}</p>
                      <p className="text-sm text-zinc-500 font-bold capitalize ">Pending</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-5 border-t border-zinc-800 space-y-2">
              <button
                onClick={() => { setIsProfileDrawerOpen(false); setIsLogoutConfirmOpen(true); }}
                className="w-full py-2.5 border border-rose-900/50 hover:border-rose-600 text-rose-500 bg-rose-950/20 hover:bg-rose-900 hover:text-white font-bold text-sm capitalize  rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ROLE DELETION CONFIRMATION ──────────────────────────────── */}
      {roleToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-955/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setRoleToDelete(null)}
          />
          <div className="relative w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 text-left text-white z-10 animate-in zoom-in-95 duration-200 backdrop-blur-md">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-rose-500" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h3 className="text-base font-bold text-white capitalize  font-header">
                  Delete Role Title?
                </h3>
                <p className="text-[12.5px] text-zinc-350 leading-relaxed">
                  Are you sure you want to delete the role <span className="text-white font-bold ">"{roleToDelete.name}"</span>?
                </p>
                <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                  Existing sub-admins assigned to this role will keep their current permissions, but the role option will be removed from registration and cannot be selected anymore.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRoleToDelete(null)}
                className="flex-1 py-2.5 border border-zinc-800 hover:bg-zinc-850 text-white font-bold text-sm capitalize  rounded-lg cursor-pointer transition text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeDeleteRole(roleToDelete.id)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm capitalize  rounded-lg cursor-pointer transition border-none shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LOGOUT CONFIRMATION ─────────────────────────────────────── */}
      <LogoutConfirmModal
        isOpen={isLogoutConfirmOpen}
        onConfirm={() => {
          setIsLogoutConfirmOpen(false);
          logout();
          window.spaNavigate('/');
        }}
        onCancel={() => setIsLogoutConfirmOpen(false)}
        theme="dark"
      />

    </div>
  );
}

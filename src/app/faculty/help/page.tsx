'use client';

import React, { useState } from 'react';
import {
  Camera, ClipboardList, Users, BarChart2, PlusCircle,
  Video, FileText, MessageSquare, ChevronDown, ChevronRight,
  LifeBuoy, CheckCircle2, AlertCircle, Globe,
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import { useLang } from '@/lib/i18n';

const SECTIONS = [
  {
    id: 'attendance',
    icon: Camera,
    color: 'emerald',
    title: 'Live Biometric Attendance',
    subtitle: 'Face-recognition attendance for your class',
    steps: [
      { heading: 'Start a session', body: 'Go to Attendance → select your section and subject → click "Start Attendance Session". The camera activates and begins scanning faces.' },
      { heading: 'How recognition works', body: 'The system compares each detected face against registered student embeddings. Matched students are marked Present; unmatched are marked Absent.' },
      { heading: 'Liveness challenge', body: 'Students may be prompted to blink, smile, or turn their head to prevent photo spoofing. This is configurable per session.' },
      { heading: 'Ending the session', body: 'Click "End Session" to finalise. Records are saved to the database and immediately visible on student dashboards.' },
      { heading: 'Reviewing records', body: 'Past sessions appear in the Attendance history table. You can filter by date and section.' },
    ],
    tips: ['Ensure good lighting in the classroom.', 'Students must register their face before the first session.'],
  },
  {
    id: 'manual',
    icon: ClipboardList,
    color: 'indigo',
    title: 'Manual Attendance',
    subtitle: 'Mark attendance without the camera',
    steps: [
      { heading: 'Select section & date', body: 'Go to Manual Attendance → choose the section from the dropdown → pick the date. The student roster loads automatically.' },
      { heading: 'Mark students', body: 'Click Present / Absent / Late for each student. Use "Mark All" buttons to set a default status for the whole class quickly.' },
      { heading: 'Save', body: 'Click "Save Attendance". Records are written to the database and synced to student dashboards and the admin panel instantly.' },
      { heading: 'Subject auto-fill', body: 'The subject field is auto-filled from the Subject Assignments set by the admin. If it is wrong, ask the admin to update it.' },
    ],
    tips: ['Manual attendance overrides biometric records for the same date.', 'Past sessions are shown at the bottom of the page.'],
  },
  {
    id: 'students',
    icon: Users,
    color: 'violet',
    title: 'Student Management',
    subtitle: 'View and monitor your students',
    steps: [
      { heading: 'Student list', body: 'Go to Students to see all students assigned to your sections with their attendance %, quiz scores, risk tier, and success score.' },
      { heading: 'Risk tiers', body: 'High (red) = immediate intervention needed. Medium (amber) = monitor closely. Low (green) = on track. Hover the risk badge for the specific reason.' },
      { heading: 'Student drilldown', body: 'Click any student row to open their 360° profile — full attendance history, quiz attempts, weak topics, streak, and AI study plan.' },
      { heading: 'Sending notices', body: 'From the drilldown modal you can send a personalised notice (urgent / warning / appreciation) directly to the student.' },
    ],
  },
  {
    id: 'analytics',
    icon: BarChart2,
    color: 'cyan',
    title: 'Class Analytics',
    subtitle: 'Attendance patterns and risk insights',
    steps: [
      { heading: 'Section selector', body: 'Use the dropdown at the top to switch between sections. All charts and the roster table update instantly.' },
      { heading: '7-day attendance trend', body: 'Line chart showing daily present/absent/late counts and overall % for the selected section over the past week.' },
      { heading: 'Attendance distribution', body: 'Bar chart grouping students into ≥90%, 75–89%, and <75% buckets so you can see at a glance how many are at risk.' },
      { heading: 'Risk factor chart', body: 'Horizontal bar chart showing the most common risk reasons across your students (e.g. "Attendance below 75%", "Quiz scores declining").' },
      { heading: 'LMS Sync', body: 'Click "Sync LMS" to pull course enrolments from Moodle or Google Classroom. Requires LMS credentials in the admin .env settings.' },
    ],
    tips: ['Click "Refresh" to get the latest data without reloading the page.'],
  },
  {
    id: 'quiz',
    icon: PlusCircle,
    color: 'rose',
    title: 'Create Quiz',
    subtitle: 'Author assessments for your students',
    steps: [
      { heading: 'Manual quiz', body: 'Go to Create Quiz → enter the subject → add questions one by one with 4 options and mark the correct answer → Publish.' },
      { heading: 'AI-generated quiz', body: 'Click "Generate with AI" → enter a topic and difficulty → the Gemini AI creates questions automatically. Review and edit before publishing.' },
      { heading: 'Targeting weak topics', body: 'From Class Analytics → Recommended Action → click "Author Remediation Quiz" to pre-fill the topic with the most common weak area in your class.' },
      { heading: 'Quiz visibility', body: 'Published quizzes are visible to all students in the subject. Students see them in their Quizzes page immediately.' },
    ],
  },
  {
    id: 'videos',
    icon: Video,
    color: 'amber',
    title: 'Video Lectures',
    subtitle: 'Upload and manage recorded lectures',
    steps: [
      { heading: 'Uploading a video', body: 'Go to Video Lectures → Upload → enter title, subject, section, and paste a YouTube/embed URL → Save. The video appears in student dashboards immediately.' },
      { heading: 'Attaching notes', body: 'You can attach a resource URL (PDF, Google Doc, etc.) to each video. Students see a clickable "Open Resource" link below the video.' },
      { heading: 'Managing uploads', body: 'Your uploaded videos are listed with view counts. You can edit the title/description or delete a video at any time.' },
    ],
  },
  {
    id: 'notes',
    icon: FileText,
    color: 'teal',
    title: 'Notes & Resources',
    subtitle: 'Share study materials with students',
    steps: [
      { heading: 'Creating a note', body: 'Go to Notes & Resources → New → choose type (Note / Resource / Announcement) → enter title, content, subject, section → Save.' },
      { heading: 'Announcements', body: 'Announcements appear highlighted in amber on student dashboards. Use them for exam schedules, syllabus changes, or urgent notices.' },
      { heading: 'Resource links', body: 'Paste any URL (textbook, YouTube, Google Drive) as a Resource. Students see a direct "Open Resource" button.' },
    ],
    tips: ['Notes are filtered by section — students only see notes for their section.'],
  },
  {
    id: 'feedback',
    icon: MessageSquare,
    color: 'slate',
    title: 'Feedback Review',
    subtitle: 'See what students think of your lectures',
    steps: [
      { heading: 'Viewing ratings', body: 'Go to Feedback Review to see your average star rating, total responses, and a breakdown by star count.' },
      { heading: 'Reading comments', body: 'Anonymous student comments are listed below the rating summary. Identities are never revealed.' },
      { heading: 'Acting on feedback', body: 'Use low-rated topics to prioritise remedial sessions or additional resources. High ratings confirm what is working well.' },
    ],
    tips: ['Feedback is completely anonymous — you cannot identify which student left a comment.'],
  },
];

const COLOR_MAP: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  violet: 'bg-violet-100 text-violet-700 border-violet-200',
  cyan: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  rose: 'bg-rose-100 text-rose-700 border-rose-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
  teal: 'bg-teal-100 text-teal-700 border-teal-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function FacultyHelpPage() {
  const { lang } = useLang();
  const [open, setOpen] = useState<string | null>('attendance');
  const [query, setQuery] = useState('');

  const filtered = SECTIONS.filter(s =>
    !query || s.title.toLowerCase().includes(query.toLowerCase()) ||
    s.steps.some(st => st.heading.toLowerCase().includes(query.toLowerCase()))
  );

  const labels = {
    en: { title: 'Faculty Help & Guide', subtitle: 'Complete guide to every feature in the Faculty portal.', search: 'Search help topics…', steps: 'Steps', tips: 'Tips', qs: 'Quick Start Checklist', items: ['Start a biometric attendance session for your class', 'Try manual attendance for a past date', 'Review at-risk students in Class Analytics', 'Create a quiz for your subject', 'Upload a video lecture or resource note', 'Check student feedback ratings'] },
    te: { title: 'ఫ్యాకల్టీ సహాయం & గైడ్', subtitle: 'ఫ్యాకల్టీ పోర్టల్లో ప్రతి ఫీచర్కు పూర్తి గైడ్.', search: 'సహాయ విషయాలు వెతకండి…', steps: 'దశలు', tips: 'చిట్కాలు', qs: 'త్వరిత ప్రారంభ చెక్లిస్ట్', items: ['మీ తరగతికి బయోమెట్రిక్ హాజరు సెషన్ ప్రారంభించండి', 'గత తేదీకి మాన్యువల్ హాజరు ప్రయత్నించండి', 'క్లాస్ అనాలిటిక్స్లో రిస్క్ విద్యార్థులను సమీక్షించండి', 'మీ విషయానికి క్విజ్ సృష్టించండి', 'వీడియో లెక్చర్ లేదా రిసోర్స్ నోట్ అప్లోడ్ చేయండి', 'విద్యార్థి అభిప్రాయ రేటింగ్లు తనిఖీ చేయండి'] },
    hi: { title: 'फैकल्टी सहायता और गाइड', subtitle: 'फैकल्टी पोर्टल की हर सुविधा के लिए पूरी गाइड।', search: 'सहायता विषय खोजें…', steps: 'चरण', tips: 'सुझाव', qs: 'त्वरित शुरुआत चेकलिस्ट', items: ['अपनी कक्षा के लिए बायोमेट्रिक उपस्थिति सत्र शुरू करें', 'पिछली तारीख के लिए मैनुअल उपस्थिति आज़माएं', 'क्लास एनालिटिक्स में जोखिम वाले छात्रों की समीक्षा करें', 'अपने विषय के लिए क्विज़ बनाएं', 'वीडियो व्याख्यान या संसाधन नोट अपलोड करें', 'छात्र प्रतिक्रिया रेटिंग जांचें'] },
  };
  const L = labels[lang as keyof typeof labels] || labels.en;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900">
      <Sidebar role="faculty" />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={L.title} roleBadge="FACULTY" />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto max-w-4xl">

          <div className="pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <LifeBuoy className="w-5 h-5 text-indigo-600" />
              <h1 className="text-2xl font-bold text-slate-900">{L.title}</h1>
            </div>
            <p className="text-sm text-slate-500">{L.subtitle}</p>
          </div>

          {/* Quick start */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-indigo-900 flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />{L.qs}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {L.items.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-indigo-800">
                  <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center font-bold shrink-0 mt-0.5">{i + 1}</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <input
            type="text"
            placeholder={L.search}
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-white border border-slate-300 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm outline-none"
          />

          <div className="space-y-3">
            {filtered.map(section => {
              const Icon = section.icon;
              const isOpen = open === section.id;
              const colorCls = COLOR_MAP[section.color] || COLOR_MAP.slate;
              return (
                <div key={section.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <button
                    onClick={() => setOpen(isOpen ? null : section.id)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`p-2 rounded-xl border ${colorCls}`}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{section.title}</p>
                        <p className="text-xs text-slate-500">{section.subtitle}</p>
                      </div>
                    </div>
                    {isOpen
                      ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 space-y-4 border-t border-slate-100">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-4">{L.steps}</p>
                      <ol className="space-y-3">
                        {section.steps.map((step, i) => (
                          <li key={i} className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{step.heading}</p>
                              <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{step.body}</p>
                            </div>
                          </li>
                        ))}
                      </ol>
                      {section.tips && (
                        <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                          <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />{L.tips}
                          </p>
                          {section.tips.map((tip, i) => (
                            <p key={i} className="text-xs text-amber-700">• {tip}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

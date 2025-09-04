"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { ConsultationModal } from "@/components/ui/consultation-modal";
import type { Doctor } from "@/components/ui/consultation-modal";

// Import Vapi Web SDK
import Vapi from "@vapi-ai/web";

// Report type
interface Report {
  sessionld: string;
  agent: string;
  user: string;
  timestamp: string;
  chiefComplaint: string;
  summary: string;
  symptoms: string[];
  duration: string;
  severity: string;
  medicationsMentioned?: string[];
  recommendations: string[];
  description?: string;
}

// Report modal component
function ReportModal({ open, onClose, report }: { open: boolean; onClose: () => void; report: Report | null }) {
  if (!open || !report) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl relative">
        <button className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2 mb-4">
          <span role="img" aria-label="stethoscope">🩺</span> Medical AI Voice Agent Report
        </h2>
        <div className="border border-blue-300 rounded-lg p-4 mb-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div><span className="font-bold">Doctor:</span> {report.agent}</div>
            <div><span className="font-bold">User:</span> {report.user}</div>
            <div><span className="font-bold">Consulted On:</span> {new Date(report.timestamp).toLocaleString()}</div>
            <div><span className="font-bold">Agent:</span> {report.agent}</div>
          </div>
        </div>
        <div className="mb-2 mt-2 text-lg font-semibold text-blue-700">Chief Complaint</div>
        <div className="mb-4 text-gray-700">{report.chiefComplaint}</div>
        <div className="mb-2 text-lg font-semibold text-blue-700">Summary</div>
        <div className="mb-4 text-gray-700">{report.summary}</div>
        <div className="mb-2 text-lg font-semibold text-blue-700">Symptoms</div>
        <ul className="mb-4 text-gray-700 list-disc list-inside">
          {report.symptoms?.map((s: string, i: number) => <li key={i}>{s}</li>)}
        </ul>
        <div className="mb-2 text-lg font-semibold text-blue-700">Duration & Severity</div>
        <div className="mb-4 text-gray-700 flex flex-wrap gap-8">
          <span><span className="font-bold">Duration:</span> {report.duration}</span>
          <span><span className="font-bold">Severity:</span> {report.severity}</span>
        </div>
        {Array.isArray(report.medicationsMentioned) && report.medicationsMentioned.length > 0 && <>
          <div className="mb-2 text-lg font-semibold text-blue-700">Medications Mentioned</div>
          <ul className="mb-4 text-gray-700 list-disc list-inside">
            {report.medicationsMentioned.map((m: string, i: number) => <li key={i}>{m}</li>)}
          </ul>
        </>}
        <div className="mb-2 text-lg font-semibold text-blue-700">Recommendations</div>
        <ul className="mb-4 text-gray-700 list-disc list-inside">
          {report.recommendations?.map((r: string, i: number) => <li key={i}>{r}</li>)}
        </ul>
      </div>
    </div>
  );
}

const doctors = [
  {
    title: "General Physician",
    desc: "Helps with everyday health concerns and common symptoms.",
    img: "/doctor1.png",
  },
  {
    title: "Pediatrician",
    desc: "Expert in children's health, from babies to teens.",
    img: "/doctor2.png",
  },
  {
    title: "Dermatologist",
    desc: "Handles skin issues like rashes, acne, or infections.",
    img: "/doctor3.png",
  },
  {
    title: "Nutritionist",
    desc: "Provides advice on healthy eating and weight management.",
    img: "/doctor4.png",
  },
];

export default function DashboardPage() {
  const doctorsRef = useRef<HTMLDivElement>(null);
  const handleScrollToDoctors = () => {
    doctorsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [inCall, setInCall] = useState(false);
  const conversationRef = useRef<string[]>([]);
  const [conversation, setConversation] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [timer, setTimer] = useState("00:00");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const secondsRef = useRef(0);
  const [reports, setReports] = useState<Report[]>([]);

  // Load previous reports on initial mount
  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch(`/api/session-chats?user=${encodeURIComponent('Anonymous')}`);
        if (!res.ok) {
          console.error('Failed to fetch past reports', await res.text());
          return;
        }
        const rows = await res.json();
        // Each row has a `report` JSON column and optional `notes`
        const mapped = rows.map((row: any) => ({
          ...row.report,
          description: row.notes || 'Previous Consultation',
        }));
        setReports(mapped);
      } catch (err) {
        console.error('Error loading past reports', err);
      }
    }
    loadReports();
  }, []);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Vapi Web SDK instance
  const vapiRef = useRef<any>(null);

  // Use your PUBLIC API key and assistant ID
  const VAPI_PUBLIC_API_KEY = "0bbd18e4-fb51-4b1b-b461-47b9d8cbb01b";
  const VAPI_ASSISTANT_ID = "c7229383-d565-4d3f-9c6c-59b8d71c619c";

  // Timer logic
  useEffect(() => {
    if (inCall) {
      timerRef.current = setInterval(() => {
        secondsRef.current += 1;
        const min = String(Math.floor(secondsRef.current / 60)).padStart(2, "0");
        const sec = String(secondsRef.current % 60).padStart(2, "0");
        setTimer(`${min}:${sec}`);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      secondsRef.current = 0;
      setTimer("00:00");
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [inCall]);

  // Start Vapi call
  const handleStartCall = () => {
    setInCall(true);
    setConversation([]);
    conversationRef.current = [];
    setConnected(false);
    // Initialize Vapi SDK
    if (!vapiRef.current) {
      vapiRef.current = new Vapi(VAPI_PUBLIC_API_KEY);
    }
    // Remove previous listeners if any
    vapiRef.current.removeAllListeners && vapiRef.current.removeAllListeners();
    // Start the call
    vapiRef.current.start(VAPI_ASSISTANT_ID);
    // Listen for events
    vapiRef.current.on("call-start", () => setConnected(true));
    vapiRef.current.on("call-end", () => {
      setConnected(false);
      setInCall(false);
    });
    vapiRef.current.on("message", (message: any) => {
      console.log('VAPI Message received:', message); // Log all incoming messages
      
      // Handle different message types
      if (message.type === "transcript") {
        console.log('Transcript update:', {
          text: message.transcript,
          isFinal: message.isFinal,
          role: message.role
        });
        
        const final = message.isFinal ?? message.transcriptType === 'final';
        if (final) {
          const newMessage = `${message.role}: ${message.transcript}`;
          console.log('Adding to conversation:', newMessage);
          conversationRef.current = [...conversationRef.current, newMessage];
          setConversation(prev => [...prev, newMessage]);
        }
      } 
      else if (message.type === "response") {
        const newMessage = `Assistant: ${message.text || message.content || ''}`;
        console.log('Adding assistant response:', newMessage);
        conversationRef.current = [...conversationRef.current, newMessage];
        setConversation(prev => [...prev, newMessage]);
      }
      // Add other message types if needed
      else {
        console.log('Unhandled message type:', message.type, message);
      }
    });
    vapiRef.current.on("connection-error", () => setConnected(false));
  };

  // End Vapi call
  const handleEndCall = () => {
    if (!inCall) return; // Prevent multiple calls
    
    setInCall(false);
    setConnected(false);
    
    // End the call if Vapi instance exists
    if (vapiRef.current) {
      if (typeof vapiRef.current.end === "function") {
        vapiRef.current.end();
      }
      // Clean up Vapi instance
      vapiRef.current = null;
    }
    
    // Wait 1 second to allow final transcripts to be processed
    setTimeout(() => {
      handleAfterEndCall();
    }, 1000);
  };

  // Clean up Vapi instance on modal close
  useEffect(() => {
    if (!modalOpen) {
      if (inCall) {
        handleEndCall();
      } else if (vapiRef.current) {
        // Ensure any remaining Vapi resources are cleaned up
        if (typeof vapiRef.current.end === "function") {
          vapiRef.current.end();
        }
        vapiRef.current = null;
      }
    }
  }, [modalOpen]);

  // After call ends, generate and save report
  const handleAfterEndCall = async () => {
    const convo = [...conversationRef.current];
    console.log('handleAfterEndCall called', { 
      conversation: convo, 
      selectedDoctor,
      convoLength: convo.length,
      convoSample: convo.slice(0, 2) // Show first 2 messages for debugging
    });
    
    setModalOpen(false);
    setInCall(false);
    setConnected(false);
    
    if (selectedDoctor) {
      try {
        const requestBody = {
          conversation: convo,
          doctor: selectedDoctor.title,
          user: "Anonymous",
        };
        
        console.log('Sending to /api/generate-report:', JSON.stringify(requestBody, null, 2));
        
        const res = await fetch('/api/generate-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
        
        if (!res.ok) {
          const errorData = await res.text();
          console.error('API Error Response:', errorData);
          throw new Error(`API Error: ${res.status} ${res.statusText}`);
        }
        
        const report = await res.json();
        console.log('Received report:', report);
        
        setReports((prev) => [{ ...report, description: 'New Query' }, ...prev]);
        setSelectedReport(report);
      } catch (error) {
        console.error('Error in handleAfterEndCall:', error);
        // Create a fallback report if API fails
        const fallbackReport = {
          sessionld: Math.random().toString(36).substring(2, 9),
          agent: selectedDoctor.title,
          user: "Anonymous",
          timestamp: new Date().toISOString(),
          chiefComplaint: "Error generating report",
          summary: "There was an error generating the report. Please check the console for details.",
          symptoms: [],
          duration: "N/A",
          severity: "unknown",
          recommendations: ["Please try the call again."]
        };
        setReports((prev) => [{ ...fallbackReport, description: 'Error Report' }, ...prev]);
        setSelectedReport(fallbackReport);
      }
    }
    setConversation([]);
    conversationRef.current = [];
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 border-b">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-20 w-25" />
          <span className="text-2xl font-bold text-primary"><span className="text-black"></span></span>
        </div>
        <nav className="flex gap-8 items-center">
          <Link href="#" className="text-base font-medium text-black hover:text-primary">Home</Link>
          <Link href="#" className="text-base font-medium text-black hover:text-primary">History</Link>
          <Link href="#" className="text-base font-medium text-black hover:text-primary">Pricing</Link>
          <Link href="#" className="text-base font-medium text-black hover:text-primary">Profile</Link>
          <div className="ml-4">
            <div className="rounded-full bg-purple-100 p-2">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><circle cx="12" cy="8" r="4"/><path d="M16 16a4 4 0 0 0-8 0"/></svg>
            </div>
          </div>
        </nav>
      </header>
      {/* Dashboard Section */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">My Dashboard</h2>
        <div className="flex items-center justify-between mb-6">
          <Button onClick={handleScrollToDoctors}>+ Start a Consultation</Button>
        </div>
        {/* Reports Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 mb-8">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="border-b">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Medical Specialist</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-gray-400 py-8">No previous consultation reports</td>
                </tr>
              ) : (
                reports.map((r: Report, i: number) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{r.agent}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{r.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(r.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-blue-600 hover:underline" onClick={() => setSelectedReport(r)}>View Report</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* AI Specialist Doctors Agent */}
        <h3 ref={doctorsRef} className="text-xl font-bold mb-4">AI Specialist Doctors Agent</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map((doc, i) => (
            <div key={doc.title} className="bg-white rounded-2xl shadow-sm border flex flex-col items-center p-4 relative">
              <img src={doc.img} alt={doc.title} className="w-36 h-36 rounded-xl object-cover mb-3" />
              <div className="text-base font-semibold mb-1">{doc.title}</div>
              <div className="text-sm text-gray-500 mb-4 text-center">{doc.desc}</div>
              <Button className="w-full py-2 text-sm" onClick={() => { setSelectedDoctor(doc); setModalOpen(true); }}>Start Consultation &rarr;</Button>
            </div>
          ))}
        </div>
        <ConsultationModal
          open={modalOpen}
          onClose={() => {
            // Just set modalOpen to false, the cleanup effect will handle the rest
            setModalOpen(false);
          }}
          doctor={selectedDoctor}
          onStartCall={handleStartCall}
          onEndCall={handleEndCall}
          inCall={inCall}
          conversation={conversation}
          connected={connected}
          timer={timer}
          onAfterEndCall={handleAfterEndCall}
        />
        <ReportModal open={!!selectedReport} onClose={() => setSelectedReport(null)} report={selectedReport} />
      </main>
    </div>
  );
} 
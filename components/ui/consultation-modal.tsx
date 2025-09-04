import React from "react";

export interface Doctor {
  title: string;
  img: string;
}

interface ConsultationModalProps {
  open: boolean;
  onClose: () => void;
  doctor: Doctor | null;
  onStartCall: () => void;
  onEndCall: () => void;
  inCall: boolean;
  conversation: string[];
  connected: boolean;
  timer: string;
  onAfterEndCall?: () => void;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  open,
  onClose,
  doctor,
  onStartCall,
  onEndCall,
  inCall,
  connected,
  timer,
  onAfterEndCall,
}) => {
  if (!open || !doctor) return null;

  const handleEndCall = () => {
    onEndCall();
    if (onAfterEndCall) onAfterEndCall();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="relative w-full max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl h-auto bg-[#f7f8fa] border border-gray-200 rounded-2xl flex flex-col shadow-xl overflow-hidden">
        {/* Top bar */}
        <div className="w-full flex justify-between items-center px-4 md:px-8 py-3 md:py-4 border-b border-gray-200 rounded-t-2xl bg-white">
          <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${connected ? "bg-green-500" : "bg-red-500"} border border-gray-300`}></span>
            <span className={`text-sm font-medium ${connected ? "text-green-600" : "text-red-600"}`}>{connected ? "Connected" : "Not Connected"}</span>
          </div>
          <div className="text-gray-400 text-lg font-mono min-w-[60px] text-right">{timer}</div>
        </div>
        {/* Responsive doctor image and info */}
        <div className="flex flex-col md:flex-row items-center justify-center w-full bg-gradient-to-t from-emerald-200/60 to-transparent p-6 gap-8">
          <div className="flex-shrink-0 flex items-center justify-center w-full md:w-auto">
            <img
              src={doctor.img}
              alt={doctor.title}
              className="w-40 h-40 md:w-64 md:h-64 rounded-2xl object-cover object-center shadow-lg"
            />
          </div>
          <div className="flex flex-col items-center justify-center flex-1 text-center px-2">
            <div className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2 break-words">{doctor.title}</div>
            <div className="text-gray-500 text-base md:text-lg mb-2">AI Medical Voice Agent</div>
            <div className="text-gray-400 text-sm md:text-base">{timer}</div>
          </div>
        </div>
        {/* Call control and close button at the bottom right */}
        <div className="w-full flex justify-end items-center gap-2 md:gap-4 py-4 md:py-6 px-4 md:px-8 border-t border-gray-200 bg-white rounded-b-2xl">
          {!inCall ? (
            <button
              className="flex items-center gap-2 px-6 md:px-8 py-2 bg-gray-900 text-white rounded-md text-base md:text-lg font-medium hover:bg-gray-800 transition"
              onClick={onStartCall}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v-1.5A2.25 2.25 0 0013.5 1.5h-3A2.25 2.25 0 008.25 3.75v1.5m7.5 0h-7.5m7.5 0a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25V7.5a2.25 2.25 0 012.25-2.25m7.5 0v0z" />
              </svg>
              Start Call
            </button>
          ) : (
            <button
              className="flex items-center gap-2 px-6 md:px-8 py-2 bg-red-600 text-white rounded-md text-base md:text-lg font-medium hover:bg-red-700 transition"
              onClick={handleEndCall}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 18.75v-1.5A2.25 2.25 0 019 15h6a2.25 2.25 0 012.25 2.25v1.5m-10.5 0h10.5" />
              </svg>
              End Call
            </button>
          )}
          {/* Close button next to call control */}
          <button
            className="flex items-center gap-2 px-4 md:px-6 py-2 bg-gray-200 text-gray-700 rounded-md text-base md:text-lg font-medium hover:bg-gray-300 transition"
            onClick={onClose}
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}; 
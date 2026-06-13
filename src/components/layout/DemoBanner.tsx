import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface DemoBannerProps {
  onDismiss?: () => void;
}

export default function DemoBanner({ onDismiss }: DemoBannerProps) {
  return (
    <div className="h-7 bg-[#c5a059]/10 border-b border-[#c5a059]/20 flex items-center justify-center relative select-none shrink-0 px-8">
      <span className="text-[9px] uppercase tracking-[0.25em] text-[#c5a059] font-bold text-center truncate">
        Demo Mode — Synthetic Ecosystem Data — Human Review Required
      </span>
      {onDismiss && (
        <button 
          onClick={onDismiss} 
          className="absolute right-3 text-[#c5a059]/60 hover:text-[#c5a059] transition-colors p-0.5 rounded"
          title="Dismiss advisory"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

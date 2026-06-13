import React from "react";
import { 
  Compass, 
  Map, 
  Activity, 
  Layers, 
  FileText, 
  MessageSquare, 
  Play, 
  Share2, 
  Download, 
  Combine, 
  Sparkles,
  UserCircle,
  LogOut 
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface TopNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onEnterDemoMode?: () => void;
}

export default function TopNav({ activeTab, setActiveTab, onEnterDemoMode }: TopNavProps) {
  const { user, login, logout } = useAuth();
  const tabs = [
    { id: "command", name: "Hub Command", icon: Compass },
    { id: "review", name: "Engagement Review", icon: Activity },
    { id: "map", name: "Ecosystem Map", icon: Map },
    { id: "pipeline", name: "Pipeline", icon: Layers },
    { id: "briefings", name: "Briefings", icon: FileText },
    { id: "chat", name: "AI Chat", icon: MessageSquare }
  ];

  return (
    <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0c] sticky top-0 z-50 select-none">
      {/* Left: Brand Identity / Rotated insignia badge */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#c5a059] rotate-45 flex items-center justify-center">
          <span className="-rotate-45 font-bold text-[#c5a059] text-xl font-display">CH</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-sm font-semibold tracking-tight uppercase leading-none text-white">Canada Hub Demo</h1>
            <span className="text-[8px] bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/30 px-1 py-0.5 rounded font-mono uppercase tracking-widest leading-none">PROTOTYPE</span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#c5a059] leading-tight mt-0.5">Engagement Intelligence</p>
        </div>
      </div>

      {/* Center Tabs: Operating Views */}
      <nav className="flex items-center gap-6 text-[11px] uppercase tracking-widest font-medium">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 pb-1.5 transition-all cursor-pointer relative ${
                isActive 
                  ? "text-white border-b-2 border-[#3b82f6]" 
                  : "text-white/50 hover:text-white"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#3b82f6]" : "opacity-60"}`} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onEnterDemoMode}
          className="px-3 py-1 border border-[#c5a059]/40 bg-[#c5a059]/10 text-[#c5a059] rounded text-[10px] uppercase tracking-wider font-semibold transition-all hover:bg-[#c5a059]/20 cursor-pointer"
          title="Re-seed demo state query parameters"
        >
          <span>Demo Reset</span>
        </button>

        {user ? (
          <div className="flex items-center gap-3 ml-2 border-l border-white/10 pl-3">
            <span className="text-[10px] text-emerald-400 font-mono font-bold">{user.email}</span>
            <button 
              onClick={logout}
              className="px-3 py-1 border border-white/20 rounded text-[10px] uppercase tracking-wider bg-white/5 text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center space-x-1"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <button 
            onClick={login}
            className="px-3 py-1 border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 rounded text-[10px] uppercase tracking-wider font-semibold hover:bg-emerald-500/20 transition-all cursor-pointer flex items-center space-x-1 ml-2"
          >
            <UserCircle className="w-4 h-4" />
            <span>Connect Demo Auth</span>
          </button>
        )}
      </div>
    </header>
  );
}

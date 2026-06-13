import React, { useState, useRef, useEffect } from "react";
import { EcosystemEntity } from "../../types";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  HelpCircle, 
  Clock, 
  RotateCcw, 
  Building,
  Terminal,
  FileText
} from "lucide-react";

interface AIChatViewProps {
  entities: EcosystemEntity[];
  onSelectEntity: (entity: EcosystemEntity) => void;
  onSelectTab: (tab: string) => void;
}

interface Message {
  sender: "user" | "assistant";
  content: string | React.ReactNode;
  timestamp: string;
}

export default function AIChatView({
  entities,
  onSelectEntity,
  onSelectTab
}: AIChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "assistant",
      content: (
        <div className="space-y-2 font-sans">
          <p>
            Welcome to the <strong>Demo Intel Assist</strong>. I can query our synthetic ecosystem datasets to find innovators, highlight validation checkpoints, draft outreach communications, or summarize challenge tracks.
          </p>
          <p className="text-[10px] text-white/40 font-mono leading-normal uppercase">
            Local draft engine active
          </p>
        </div>
      ),
      timestamp: "06:19"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const suggestedPrompts = [
    { title: "Query Water Leads", desc: "Show pilot-ready leads", text: "Show pilot-ready Water Scarcity leads across Canada" },
    { title: "Review Follow-ups", desc: "Which follow-ups are overdue?", text: "Which follow-ups are overdue and require action?" },
    { title: "Ecosystem Summary", desc: "Draft a briefing summary", text: "Draft a national Canada Hub briefing summary" },
    { title: "Evidence Audit", desc: "Show missing evidence", text: "Show missing evidence for our top Calgary Lab node" }
  ];

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Send user message
    const userMsg: Message = {
      sender: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");

    // Simulate assistant feedback after 600ms
    setTimeout(() => {
      const respContent = processPromptQuery(textToSend);
      const botMsg: Message = {
        sender: "assistant",
        content: respContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  const processPromptQuery = (query: string): React.ReactNode => {
    const qLower = query.toLowerCase();

    // 1. Water Leads
    if (qLower.includes("water") && (qLower.includes("lead") || qLower.includes("high") || qLower.includes("pilot"))) {
      const waterLeads = entities.filter(e => e.challengeAreas.includes("Water Scarcity") && (e.readinessStage === "pilot" || e.readinessStage === "validated" || e.readinessStage === "prize_ready"));
      return (
        <div className="space-y-3 font-sans">
          <div className="flex items-center space-x-1 border-b border-cyan-800/25 pb-1.5">
            <Sparkles className="w-4.5 h-4.5 text-[#c5a059]" />
            <span className="font-bold text-[#c5a059] text-xs uppercase font-mono">Found {waterLeads.length} High-Readiness Water Leads</span>
          </div>
          <div className="space-y-2">
            {waterLeads.map(e => (
              <div key={e.id} className="p-2.5 rounded bg-white/5 border border-white/5 flex justify-between items-start text-xs">
                <div>
                  <span className="font-bold text-white block">{e.name}</span>
                  <span className="text-[10px] text-white/40 font-mono uppercase">{e.city}, {e.province} • Ready: {e.readinessStage.toUpperCase()}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1 border border-emerald-500/20 rounded font-mono font-bold uppercase">{e.engagementStatus}</span>
                  <span className="block text-[8px] text-white/40 font-mono mt-1">Score: {e.priorityScore}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-white/30 font-mono italic uppercase">*Draft report — click nodes on the main map to inspect full parameters.</p>
        </div>
      );
    }

    // 2. Overdue follow ups
    if (qLower.includes("follow") || qLower.includes("overdue") || qLower.includes("due")) {
      const pending = entities.filter(e => e.engagementStatus === "follow_up_needed");
      return (
        <div className="space-y-3 font-sans">
          <div className="flex items-center space-x-1 border-b border-red-800/20 pb-1.5">
            <span className="font-bold text-red-400 text-xs uppercase font-mono">Found {pending.length} Critical Follow-Ups Overdue</span>
          </div>
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {pending.map(e => (
              <div key={e.id} className="p-2 bg-white/5 border border-white/5 rounded text-xs space-y-1">
                <div className="flex justify-between font-bold text-white">
                  <span>{e.name}</span>
                  <span className="text-red-400 font-mono text-[9px] font-bold uppercase">{e.city}</span>
                </div>
                <p className="text-[10px] text-white/70 leading-snug">Next: {e.nextAction || "Contact owner"}</p>
                <div className="flex justify-between text-[8px] text-white/40 font-mono">
                  <span>Owner: {e.relationshipOwner}</span>
                  <span>Score: {e.priorityScore}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-white/30 font-mono italic">*Draft summary — recommend scheduling automated outreach emails next turn.</p>
        </div>
      );
    }

    // 3. National Summary
    if (qLower.includes("briefing") || qLower.includes("summary") || qLower.includes("national")) {
      return (
        <div className="space-y-3 text-xs font-sans">
          <h4 className="font-mono text-[10px] font-bold text-[#c5a059] uppercase border-b border-white/5 pb-1">Canada Hub National Briefing Summary</h4>
          <div className="space-y-1 bg-white/5 p-2.5 rounded border border-white/5 text-white/70 leading-relaxed">
            <p><strong>Active Cohort:</strong> {entities.length} total synthetic connections spanning 13 Canadian provinces/territories.</p>
            <p className="mt-1"><strong>Geographic Anchor:</strong> Calgary (Demo Hub Node), serving as coordination foundation.</p>
            <p className="mt-1"><strong>Highest Active Clusters:</strong> Water Scarcity (qualified membranes) & Wildfire Response (SAR drone prediction models).</p>
            <p className="mt-1"><strong>Operational Gaps:</strong> sub-arctic mineralized carbon capture requires additional certified evidence submissions.</p>
          </div>
          <div className="flex justify-between items-center text-[9px] text-white/30 font-mono">
            <span>Release status: Internal Briefing Draft</span>
            <span className="text-[#3b82f6] font-bold">Valid 2026</span>
          </div>
        </div>
      );
    }

    // 4. Evidence audit
    if (qLower.includes("evidence") || qLower.includes("calgary") || qLower.includes("lab")) {
      return (
        <div className="space-y-3 text-xs font-sans">
          <h4 className="font-mono text-[10px] font-bold text-[#c5a059] uppercase border-b border-white/5 pb-1">Prairie Water Systems Lab — Gaps identified</h4>
          <div className="space-y-1 bg-white/5 p-3 rounded border border-white/5 text-white/70 leading-relaxed">
            <p className="text-white font-semibold">Report-Ready requirements check:</p>
            <p className="text-red-400 mt-1">• Missing: Third-party independent fluid purification compliance file.</p>
            <p className="text-emerald-400">• Found: Local Calgary municipality testbed blueprint.</p>
            <p className="text-emerald-400">• Found: Basal hydraulic membrane durability reports.</p>
          </div>
          <p className="text-[9px] text-white/40 font-mono italic">*Draft gap analysis — recommend changing status to "Needs Evidence" to request verification assets from owner.</p>
        </div>
      );
    }

    // Default reply
    return (
      <div className="space-y-2 text-xs text-white/70 font-sans">
        <p>
          I processed your request, but could you refine your prompt? Try clicking one of our suggested templates below!
        </p>
        <p className="font-mono text-[9px] text-white/30 uppercase">
          Supported topics: "water leads", "overdue follow-ups", "briefing summary", "calgary lab evidence".
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[580px] bg-[#0a0a0c] border border-white/10 rounded-xl shadow-2xl select-none animate-fade-in">
      {/* Thread Header */}
      <div className="p-4 border-b border-white/10 bg-[#15151c] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative w-7 h-7 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center">
            <Bot className="w-4 h-4 text-[#c5a059]" />
            <div className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-450"></div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">AI Strategic Assistant</h3>
            <span className="block text-[8px] text-white/40 font-mono tracking-wider uppercase">Contextual Synthesis • Local Core v2</span>
          </div>
        </div>

        <button 
          onClick={() => setMessages([messages[0]])}
          className="text-white/40 hover:text-[#c5a059] font-mono text-[9px] flex items-center space-x-1 uppercase cursor-pointer transition-all"
          title="Reset thread log"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Thread</span>
        </button>
      </div>

      {/* Suggested prompts shelf */}
      <div className="p-3 border-b border-white/5 grid grid-cols-2 md:grid-cols-4 gap-2 bg-[#15151c]/20">
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p.text)}
            className="p-2 text-left bg-[#15151c]/60 hover:bg-[#15151c] border border-white/10 hover:border-[#c5a059]/40 rounded-lg transition-all space-y-0.5 cursor-pointer flex flex-col justify-between h-[52px]"
          >
            <span className="text-[10px] font-bold text-[#c5a059] block truncate font-sans">{p.title}</span>
            <span className="text-[9px] text-white/40 block leading-tight truncate font-sans">{p.desc}</span>
          </button>
        ))}
      </div>

      {/* Message logs */}
      <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-black/10">
        {messages.map((m, idx) => {
          const isModel = m.sender === "assistant";
          return (
            <div key={idx} className={`flex ${isModel ? "justify-start" : "justify-end"} items-start space-x-2`}>
              {isModel && (
                <div className="w-6 h-6 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/20 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-[#c5a059]" />
                </div>
              )}
              
              <div className={`p-3 max-w-[85%] rounded-lg border text-xs shadow-md ${
                isModel 
                  ? "bg-[#15151c] border-white/10 text-white/70" 
                  : "bg-white/5 border-[#c5a059]/30 text-white"
              }`}>
                {m.content}
                <span className="block text-[8px] text-white/30 text-right mt-1 font-mono">{m.timestamp}</span>
              </div>

              {!isModel && (
                <div className="w-6 h-6 rounded-full bg-[#15151c] border border-white/15 flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-cyan-405" />
                </div>
              )}
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Footer input form */}
      <div className="p-3 border-t border-white/10 bg-[#15151c]">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputValue);
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Query synthetic ecosystem data parameters..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-grow bg-[#0a0a0c] text-xs text-white placeholder-white/20 p-2 px-3 rounded-lg border border-white/10 focus:outline-none focus:border-[#c5a059]/40 font-sans"
          />
          <button
            type="submit"
            className="p-2 rounded-lg bg-[#c5a059] text-black hover:bg-[#c5a059]/90 shrink-0 cursor-pointer transition-all shadow-md"
            title="Fire model prompt"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}

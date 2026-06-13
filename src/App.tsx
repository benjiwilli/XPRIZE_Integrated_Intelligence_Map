import React, { useState, useEffect } from "react";
import TopNav from "./components/layout/TopNav";
import DemoBanner from "./components/layout/DemoBanner";
import EcosystemMapView from "./components/views/EcosystemMapView";
import HubCommandView from "./components/views/HubCommandView";
import EngagementReviewView from "./components/views/EngagementReviewView";
import PipelineView from "./components/views/PipelineView";
import BriefingsView from "./components/views/BriefingsView";
import AIChatView from "./components/views/AIChatView";

import { useAuth } from "./context/AuthContext";
import { db } from "./lib/firebase";
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";

import { 
  EcosystemEntity, 
  MapLens, 
  ChallengeArea, 
  EntityType, 
  BriefingItem,
  UserAction
} from "./types";
import { 
  SYNTHETIC_ENTITIES, 
  SYNTHETIC_EDGES, 
  SYNTHETIC_EVENTS, 
  INITIAL_BRIEFING_QUEUE 
} from "./data/syntheticData";

export default function App() {
  // Navigation State (Primary Ecosystem Map view default selected)
  const [activeTab, setActiveTab] = useState<string>("map");
  const [showDemoBanner, setShowDemoBanner] = useState(true);

  // Core Ecosystem Intelligence dataset (allows edits/score updates)
  const [entities, setEntities] = useState<EcosystemEntity[]>(SYNTHETIC_ENTITIES);
  const edges = SYNTHETIC_EDGES;
  const events = SYNTHETIC_EVENTS;

  // Active Map Selector States
  const [selectedEntity, setSelectedEntity] = useState<EcosystemEntity | null>(
    SYNTHETIC_ENTITIES.find(e => e.id === "entity-1") || null
  );
  const [activeLens, setActiveLens] = useState<MapLens>("all_activity");

  // Filter States
  const initialFilters = {
    challengeAreas: [] as ChallengeArea[],
    types: [] as EntityType[],
    statuses: [] as string[],
    readiness: [] as string[],
    owners: [] as string[],
    evidence: [] as string[]
  };
  const [activeFilters, setActiveFilters] = useState(initialFilters);

  // Shared Briefing Queue State
  const [briefingQueue, setBriefingQueue] = useState<BriefingItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setBriefingQueue(INITIAL_BRIEFING_QUEUE);
      return;
    }
    
    // Subscribe to Firestore for real users
    const q = query(collection(db, "briefings"), where("ownerUserId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: BriefingItem[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() } as BriefingItem);
      });
      setBriefingQueue(items);
    }, (error) => {
      console.error("Firestore Error: ", error);
    });
    
    return () => unsubscribe();
  }, [user]);

  // Synchronize Entities dataset with Firestore for authenticated users
  useEffect(() => {
    if (!user) {
      setEntities(SYNTHETIC_ENTITIES);
      return;
    }

    const q = query(collection(db, "entities"), where("ownerUserId", "==", user.uid));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        console.log("No custom entities found for user. Initializing user database...");
        try {
          for (const ent of SYNTHETIC_ENTITIES) {
            await addDoc(collection(db, "entities"), {
              ...ent,
              ownerUserId: user.uid
            });
          }
        } catch (e) {
          console.error("Failed to seed user entities in Firestore:", e);
        }
      } else {
        const loaded: EcosystemEntity[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          loaded.push({
            ...data,
            firestoreId: doc.id
          } as EcosystemEntity);
        });
        loaded.sort((a, b) => a.id.localeCompare(b.id));
        setEntities(loaded);
      }
    }, (error) => {
      console.error("Firestore Entities Error: ", error);
    });

    return () => unsubscribe();
  }, [user]);

  // User Interactive Actions state (Tracks last 5 user clicks/operations)
  const [recentActions, setRecentActions] = useState<UserAction[]>([
    { id: "act-1", timestamp: "06:12:15", type: "Briefing", message: "Added Calgary AquaTech to briefings queue", targetName: "Calgary AquaTech" },
    { id: "act-2", timestamp: "06:22:40", type: "Evidence", message: "Approved 'Sub-Arctic Membrane' evidence for Calgary AquaTech", targetName: "Calgary AquaTech" },
    { id: "act-3", timestamp: "06:35:10", type: "Lens Change", message: "Focused map lens on 'High-Readiness' candidates", targetName: "Ecosystem Map" },
  ]);

  const addRecentAction = (type: string, message: string, targetName?: string) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0]; // "HH:MM:SS"
    const newAction: UserAction = {
      id: `act-${Date.now()}`,
      timestamp: timeStr,
      type,
      message,
      targetName
    };
    setRecentActions(prev => [newAction, ...prev].slice(0, 5));
  };

  // Operations: Sync score changes when approving evidence
  const handleEvidenceApproved = async (entityId: string) => {
    let targetName = "";
    const targetEntity = entities.find(e => e.id === entityId);
    if (!targetEntity) return;

    targetName = targetEntity.name;
    const updatedFields = {
      approvedEvidenceCount: Math.min(targetEntity.evidenceCount, targetEntity.approvedEvidenceCount + 1),
      priorityScore: Math.min(100, targetEntity.priorityScore + 4),
      engagementStatus: "qualified" as const
    };

    if (user && targetEntity.firestoreId) {
      try {
        const docRef = doc(db, "entities", targetEntity.firestoreId);
        await updateDoc(docRef, updatedFields);
        addRecentAction("Evidence Approved", `Approved validation record for ${targetName}`, targetName);
      } catch (err) {
        console.error("Error updating entity in Firestore:", err);
      }
    } else {
      setEntities(prev => prev.map(e => {
        if (e.id === entityId) {
          return {
            ...e,
            ...updatedFields
          };
        }
        return e;
      }));
      addRecentAction("Evidence Approved", `Approved validation record for ${targetName}`, targetName);
    }
  };

  const handleEvidenceNeeded = async (entityId: string) => {
    let targetName = "";
    const targetEntity = entities.find(e => e.id === entityId);
    if (!targetEntity) return;

    targetName = targetEntity.name;
    const updatedFields = {
      engagementStatus: "follow_up_needed" as const,
      priorityScore: Math.max(30, targetEntity.priorityScore - 5)
    };

    if (user && targetEntity.firestoreId) {
      try {
        const docRef = doc(db, "entities", targetEntity.firestoreId);
        await updateDoc(docRef, updatedFields);
        addRecentAction("Evidence Needed", `Flagged further evidence requirements for ${targetName}`, targetName);
      } catch (err) {
        console.error("Error updating entity in Firestore:", err);
      }
    } else {
      setEntities(prev => prev.map(e => {
        if (e.id === entityId) {
          return {
            ...e,
            ...updatedFields
          };
        }
        return e;
      }));
      addRecentAction("Evidence Needed", `Flagged further evidence requirements for ${targetName}`, targetName);
    }
  };

  // Append a briefing template to queue
  const handleAddToBriefingQueue = async (entity: EcosystemEntity) => {
    const exists = briefingQueue.some(item => item.entityId === entity.id);
    if (exists) return; // Avoid duplicate append
      
    const newItem: Omit<BriefingItem, "id"> = {
      entityId: entity.id,
      entityName: entity.name,
      challengeArea: entity.challengeAreas[0],
      owner: entity.relationshipOwner,
      addedAt: new Date().toISOString().split("T")[0],
      notes: `Milestone brief generated matching ${entity.challengeAreas[0]} track values.`,
      status: "draft"
    };

    if (user) {
      // Persist to firestore
      try {
        await addDoc(collection(db, "briefings"), {
          ...newItem,
          ownerUserId: user.uid
        });
        addRecentAction("Briefing Queue", `Added ${entity.name} to briefing deck prep`, entity.name);
      } catch (err) {
        console.error("Error adding doc:", err);
      }
    } else {
      // Local state fallback for demo
      const id = `brief-${Date.now()}`;
      setBriefingQueue(prev => [...prev, { id, ...newItem }]);
      addRecentAction("Briefing Queue", `Added ${entity.name} to briefing deck prep`, entity.name);
    }
  };

  const handleRemoveBriefing = async (id: string) => {
    const match = briefingQueue.find(item => item.id === id);
    if (match) {
      addRecentAction("Briefing Remove", `Removed ${match.entityName} from the briefing queue`, match.entityName);
    }

    if (user) {
      try {
        await deleteDoc(doc(db, "briefings", id));
      } catch (err) {
        console.error("Error removing:", err);
      }
    } else {
      setBriefingQueue(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleClearBriefings = () => {
    if (user) {
      // Clearing all via firestore could be done by iterating, but for now we skip or iterate:
      briefingQueue.forEach(item => deleteDoc(doc(db, "briefings", item.id)));
    } else {
      setBriefingQueue([]);
    }
    addRecentAction("Queue Purged", "Cleared all items from the briefing queue");
  };

  // Re-seed original dataset to showcase reactive transformations during demos
  const handleResetDemoState = async () => {
    if (user) {
      try {
        // Clear all current user entities in Firestore so listener re-seeds them
        for (const ent of entities) {
          if (ent.firestoreId) {
            await deleteDoc(doc(db, "entities", ent.firestoreId));
          }
        }
        // Clear briefing Queue in Firestore
        for (const bref of briefingQueue) {
          await deleteDoc(doc(db, "briefings", bref.id));
        }
      } catch (err) {
        console.error("Error resetting Firestore demo state:", err);
      }
    } else {
      setEntities(SYNTHETIC_ENTITIES);
      setBriefingQueue(INITIAL_BRIEFING_QUEUE);
    }
    
    setSelectedEntity(SYNTHETIC_ENTITIES[0]);
    setActiveLens("all_activity");
    setActiveFilters(initialFilters);
    addRecentAction("System Reset", "Restored default synthetic sandbox metrics");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex flex-col font-sans select-none overflow-x-hidden text-white/90">
      
      {/* 1. Top Navigation controls */}
      <TopNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onEnterDemoMode={handleResetDemoState}
      />

      {/* 2. Decisive Demo disclaimer banner */}
      {showDemoBanner && (
        <DemoBanner onDismiss={() => setShowDemoBanner(false)} />
      )}

      {/* Primary Dashboard views render zone */}
      <main className="flex-grow flex flex-col overflow-hidden min-h-[calc(100vh-112px)]">
        
        {activeTab === "command" && (
          <HubCommandView
            entities={entities}
            events={events}
            briefingQueue={briefingQueue}
            onSelectTab={setActiveTab}
            onSelectEntity={setSelectedEntity}
            recentActions={recentActions}
          />
        )}

        {activeTab === "review" && (
          <EngagementReviewView
            entities={entities}
            onEvidenceApproved={handleEvidenceApproved}
            onEvidenceNeeded={handleEvidenceNeeded}
          />
        )}

        {activeTab === "map" && (
          <EcosystemMapView
            entities={entities}
            edges={edges}
            selectedEntity={selectedEntity}
            onSelectEntity={setSelectedEntity}
            onAddToBriefingQueue={handleAddToBriefingQueue}
            activeLens={activeLens}
            setActiveLens={setActiveLens}
            activeFilters={activeFilters}
            setFilters={setActiveFilters}
            onResetFilters={() => setActiveFilters(initialFilters)}
          />
        )}

        {activeTab === "pipeline" && (
          <PipelineView
            entities={entities}
            onSelectEntity={setSelectedEntity}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === "briefings" && (
          <BriefingsView
            queue={briefingQueue}
            onRemoveItem={handleRemoveBriefing}
            onClearQueue={handleClearBriefings}
          />
        )}

        {activeTab === "chat" && (
          <AIChatView
            entities={entities}
            onSelectEntity={setSelectedEntity}
            onSelectTab={setActiveTab}
          />
        )}

      </main>

    </div>
  );
}

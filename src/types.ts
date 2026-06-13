export type ChallengeArea =
  | "Wildfire"
  | "Water Scarcity"
  | "Carbon Removal"
  | "Healthspan"
  | "Quantum"
  | "AI + Deep Tech";

export type EntityType =
  | "startup"
  | "researcher"
  | "university_lab"
  | "funder"
  | "partner"
  | "event"
  | "government"
  | "nonprofit";

export type EngagementStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "active"
  | "follow_up_needed"
  | "dormant";

export type ReadinessStage =
  | "research"
  | "prototype"
  | "pilot"
  | "validated"
  | "prize_ready";

export type EvidenceStatus =
  | "needs_evidence"
  | "evidence_added"
  | "human_reviewed"
  | "report_ready";

export type EcosystemEntity = {
  id: string;
  name: string;
  type: EntityType;
  city: string;
  province: string;
  latitude?: number;
  longitude?: number;
  challengeAreas: ChallengeArea[];
  engagementStatus: EngagementStatus;
  readinessStage: ReadinessStage;
  relationshipOwner: string;
  lastTouchDate?: string;
  nextAction?: string;
  evidenceCount: number;
  approvedEvidenceCount: number;
  evidenceStatus: EvidenceStatus;
  priorityScore: number;
  summary: string;
  firestoreId?: string;
};

export type RelationshipEdge = {
  id: string;
  sourceId: string;
  targetId: string;
  type: "collab" | "funding" | "tech_transfer" | "pathway";
  notes?: string;
};

export type MapLens =
  | "all_activity"
  | "follow_up_needed"
  | "high_readiness"
  | "challenge_gaps"
  | "partner_network"
  | "event_aftermath"
  | "report_ready_evidence";

export type EngagementRecord = {
  id: string;
  entityId: string;
  sourceType: "event" | "email" | "meeting" | "intro" | "research_note";
  title: string;
  date: string;
  owner: string;
  notes: string;
  extractedFollowUps: string[];
  evidenceStatus: EvidenceStatus;
};

export type BriefingItem = {
  id: string;
  entityId: string;
  entityName: string;
  challengeArea: ChallengeArea;
  owner: string;
  addedAt: string;
  notes: string;
  status: "draft" | "reviewing" | "ready";
};

export type EventRecord = {
  id: string;
  name: string;
  date: string;
  type: "Summit" | "Workshop" | "Challenge Launch" | "Networking" | "Hacker Caravan";
  location: string;
  connectedEntitiesCount: number;
  notes: string;
};

export type UserAction = {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  targetName?: string;
};


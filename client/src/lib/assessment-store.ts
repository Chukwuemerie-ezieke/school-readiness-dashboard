// Simple in-memory store for assessment state (React context)
// No localStorage/sessionStorage due to sandbox restrictions

import { createContext, useContext } from "react";
import type { MaturityLevel, AssessmentResult } from "./assessment-data";

export interface AssessmentState {
  schoolName: string;
  assessorName: string;
  assessmentDate: string;
  scores: Record<string, MaturityLevel>;
  isComplete: boolean;
}

export interface AssessmentContextType {
  state: AssessmentState;
  setSchoolName: (name: string) => void;
  setAssessorName: (name: string) => void;
  setAssessmentDate: (date: string) => void;
  setScore: (controlId: string, score: MaturityLevel) => void;
  setAllScores: (scores: Record<string, MaturityLevel>) => void;
  resetAssessment: () => void;
  markComplete: () => void;
  loadDemoData: () => void;
}

export const defaultState: AssessmentState = {
  schoolName: "",
  assessorName: "",
  assessmentDate: new Date().toISOString().split("T")[0],
  scores: {},
  isComplete: false,
};

export const AssessmentContext = createContext<AssessmentContextType | null>(null);

export function useAssessment(): AssessmentContextType {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error("useAssessment must be used within AssessmentProvider");
  return ctx;
}

// Demo data for demonstration purposes
export const DEMO_SCORES: Record<string, MaturityLevel> = {
  "gov-1": 3, "gov-2": 2, "gov-3": 3, "gov-4": 2, "gov-5": 1,
  "id-1": 2, "id-2": 1, "id-3": 2, "id-4": 1,
  "pr-1": 3, "pr-2": 2, "pr-3": 3, "pr-4": 2, "pr-5": 1, "pr-6": 2,
  "de-1": 1, "de-2": 0, "de-3": 2,
  "rs-1": 1, "rs-2": 2, "rs-3": 0,
  "rc-1": 1, "rc-2": 0, "rc-3": 1,
  "tt-1": 3, "tt-2": 2, "tt-3": 1, "tt-4": 2, "tt-5": 1,
  "dp-1": 2, "dp-2": 1, "dp-3": 1, "dp-4": 2, "dp-5": 1,
  "dm-1": 2, "dm-2": 1, "dm-3": 1, "dm-4": 2, "dm-5": 0,
  "ai-1": 1, "ai-2": 0, "ai-3": 1, "ai-4": 0, "ai-5": 1,
};

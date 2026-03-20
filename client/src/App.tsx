import { useState, useCallback } from "react";
import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import DashboardPage from "@/pages/dashboard";
import AssessPage from "@/pages/assess";
import ResultsPage from "@/pages/results";
import ReportPage from "@/pages/report";
import DashboardLayout from "@/components/DashboardLayout";
import { AssessmentContext, defaultState, DEMO_SCORES, type AssessmentState } from "@/lib/assessment-store";
import type { MaturityLevel } from "@/lib/assessment-data";

function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AssessmentState>({ ...defaultState });

  const setSchoolName = useCallback((name: string) => {
    setState((s) => ({ ...s, schoolName: name }));
  }, []);

  const setAssessorName = useCallback((name: string) => {
    setState((s) => ({ ...s, assessorName: name }));
  }, []);

  const setAssessmentDate = useCallback((date: string) => {
    setState((s) => ({ ...s, assessmentDate: date }));
  }, []);

  const setScore = useCallback((controlId: string, score: MaturityLevel) => {
    setState((s) => ({ ...s, scores: { ...s.scores, [controlId]: score } }));
  }, []);

  const setAllScores = useCallback((scores: Record<string, MaturityLevel>) => {
    setState((s) => ({ ...s, scores }));
  }, []);

  const resetAssessment = useCallback(() => {
    setState({ ...defaultState });
  }, []);

  const markComplete = useCallback(() => {
    setState((s) => ({ ...s, isComplete: true }));
  }, []);

  const loadDemoData = useCallback(() => {
    setState({
      schoolName: "Greenfield International Academy",
      assessorName: "Harmony Digital Consults",
      assessmentDate: new Date().toISOString().split("T")[0],
      scores: { ...DEMO_SCORES },
      isComplete: true,
    });
  }, []);

  return (
    <AssessmentContext.Provider
      value={{
        state,
        setSchoolName,
        setAssessorName,
        setAssessmentDate,
        setScore,
        setAllScores,
        resetAssessment,
        markComplete,
        loadDemoData,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

function AppRouter() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/assess" component={AssessPage} />
        <Route path="/results" component={ResultsPage} />
        <Route path="/report" component={ReportPage} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AssessmentProvider>
          <Router hook={useHashLocation}>
            <AppRouter />
          </Router>
        </AssessmentProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

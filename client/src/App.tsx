import { useState, useCallback } from "react";
import { Switch, Route, Router, useLocation } from "wouter";
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
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import ForgotPasswordPage from "@/pages/forgot-password";
import AdminSchoolsPage from "@/pages/admin-schools";
import AdminUsersPage from "@/pages/admin-users";
import SchoolDetailPage from "@/pages/school-detail";
import SettingsPage from "@/pages/settings";
import DashboardLayout from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider, useAuth } from "@/lib/auth-context";
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

// Pages that render INSIDE the dashboard layout (protected)
function AppRouter() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/">
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        </Route>
        <Route path="/schools">
          <ProtectedRoute allowedRoles={["admin", "consultant"]}>
            <AdminSchoolsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/schools/:id">
          {(params) => (
            <ProtectedRoute allowedRoles={["admin", "consultant"]}>
              <SchoolDetailPage />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/admin/users">
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminUsersPage />
          </ProtectedRoute>
        </Route>
        <Route path="/assess">
          <ProtectedRoute allowedRoles={["admin", "consultant"]}>
            <AssessPage />
          </ProtectedRoute>
        </Route>
        <Route path="/assess/:schoolId">
          {(params) => (
            <ProtectedRoute allowedRoles={["admin", "consultant"]}>
              <AssessPage />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/results">
          <ProtectedRoute>
            <ResultsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/results/:assessmentId">
          {(params) => (
            <ProtectedRoute>
              <ResultsPage />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/report">
          <ProtectedRoute>
            <ReportPage />
          </ProtectedRoute>
        </Route>
        <Route path="/report/:assessmentId">
          {(params) => (
            <ProtectedRoute>
              <ReportPage />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/settings">
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

// Public + auth routing logic
function AppWithAuth() {
  const [location] = useLocation();

  // Public auth routes — render without DashboardLayout
  const publicRoutes = ["/login", "/signup", "/forgot-password"];
  const isPublicRoute = publicRoutes.some(r => location === r || location.startsWith(r));

  if (isPublicRoute) {
    return (
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignupPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
      </Switch>
    );
  }

  return <AppRouter />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <AssessmentProvider>
            <Router hook={useHashLocation}>
              <AppWithAuth />
            </Router>
          </AssessmentProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

import { useState } from "react";
import { useAssessment } from "@/lib/assessment-store";
import { DOMAINS, MATURITY_LABELS, type MaturityLevel } from "@/lib/assessment-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  Scale, Search, Shield, Eye, Siren, RefreshCcw,
  GraduationCap, Lock, Monitor, Bot,
  ChevronLeft, ChevronRight, CheckCircle2, Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ICON_MAP: Record<string, React.ElementType> = {
  Scale, Search, Shield, Eye, Siren, RefreshCcw,
  GraduationCap, Lock, Monitor, Bot,
};

export default function AssessPage() {
  const { state, setSchoolName, setAssessorName, setAssessmentDate, setScore, markComplete } = useAssessment();
  const [activeDomain, setActiveDomain] = useState(0);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const domain = DOMAINS[activeDomain];
  const Icon = ICON_MAP[domain.icon] || Shield;

  const domainProgress = DOMAINS.map((d) => {
    const scored = d.controls.filter((c) => state.scores[c.id] !== undefined).length;
    return { scored, total: d.controls.length, complete: scored === d.controls.length };
  });

  const totalScored = Object.keys(state.scores).length;
  const totalControls = DOMAINS.reduce((sum, d) => sum + d.controls.length, 0);

  const handleComplete = () => {
    if (!state.schoolName.trim()) {
      toast({ title: "School name is required", variant: "destructive" });
      return;
    }
    if (totalScored < totalControls) {
      toast({
        title: "Incomplete assessment",
        description: `${totalControls - totalScored} controls are not yet scored. You can still view partial results.`,
      });
    }
    markComplete();
    navigate("/results");
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header Info */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">Assessment</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Score each control from 0 (Not Started) to 4 (Optimized)
        </p>
      </div>

      {/* School Info */}
      <Card className="border border-card-border">
        <CardContent className="p-4 md:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="school-name" className="text-xs font-medium">School Name</Label>
              <Input
                id="school-name"
                value={state.schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="e.g. Greenfield Academy"
                className="mt-1"
                data-testid="input-school-name"
              />
            </div>
            <div>
              <Label htmlFor="assessor-name" className="text-xs font-medium">Assessor</Label>
              <Input
                id="assessor-name"
                value={state.assessorName}
                onChange={(e) => setAssessorName(e.target.value)}
                placeholder="Your name"
                className="mt-1"
                data-testid="input-assessor-name"
              />
            </div>
            <div>
              <Label htmlFor="assessment-date" className="text-xs font-medium">Date</Label>
              <Input
                id="assessment-date"
                type="date"
                value={state.assessmentDate}
                onChange={(e) => setAssessmentDate(e.target.value)}
                className="mt-1"
                data-testid="input-assessment-date"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress overview */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {DOMAINS.map((d, idx) => {
          const prog = domainProgress[idx];
          const DIcon = ICON_MAP[d.icon] || Shield;
          return (
            <button
              key={d.id}
              onClick={() => setActiveDomain(idx)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0 border ${
                idx === activeDomain
                  ? "border-primary bg-primary/5 text-primary"
                  : prog.complete
                  ? "border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                  : "border-border hover:bg-accent text-muted-foreground"
              }`}
              data-testid={`domain-tab-${d.id}`}
            >
              <DIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{d.name.split(" ")[0]}</span>
              {prog.complete && <CheckCircle2 className="w-3 h-3 text-green-600 dark:text-green-400" />}
              {!prog.complete && prog.scored > 0 && (
                <span className="text-xs text-muted-foreground">{prog.scored}/{prog.total}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Domain Assessment */}
      <Card className="border border-card-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{domain.name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{domain.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pb-5">
          {domain.controls.map((control) => {
            const currentScore = state.scores[control.id];
            return (
              <div key={control.id} className="border border-border rounded-lg p-4" data-testid={`control-${control.id}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium">{control.title}</h3>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          {control.description}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs h-5">
                        {control.framework}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{control.reference}</span>
                    </div>
                  </div>
                  {currentScore !== undefined && (
                    <Badge
                      className="text-xs shrink-0"
                      style={{
                        backgroundColor: `${maturityColorForLevel(currentScore)}18`,
                        color: maturityColorForLevel(currentScore),
                        borderColor: maturityColorForLevel(currentScore),
                      }}
                      variant="outline"
                    >
                      {MATURITY_LABELS[currentScore]}
                    </Badge>
                  )}
                </div>

                {/* Score buttons */}
                <div className="grid grid-cols-5 gap-1.5">
                  {([0, 1, 2, 3, 4] as MaturityLevel[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => setScore(control.id, level)}
                      className={`py-2 px-1 rounded-md text-xs font-medium transition-all border ${
                        currentScore === level
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border hover:bg-accent text-muted-foreground"
                      }`}
                      data-testid={`score-${control.id}-${level}`}
                    >
                      <div className="text-center">
                        <div className="font-bold">{level}</div>
                        <div className="text-[10px] mt-0.5 leading-tight hidden sm:block">
                          {MATURITY_LABELS[level]}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={activeDomain === 0}
          onClick={() => setActiveDomain(activeDomain - 1)}
          data-testid="button-prev-domain"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
        <span className="text-xs text-muted-foreground tabular-nums">
          {totalScored} / {totalControls} controls scored
        </span>
        {activeDomain < DOMAINS.length - 1 ? (
          <Button
            size="sm"
            onClick={() => setActiveDomain(activeDomain + 1)}
            data-testid="button-next-domain"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button size="sm" onClick={handleComplete} data-testid="button-complete-assessment">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            View Results
          </Button>
        )}
      </div>
    </div>
  );
}

function maturityColorForLevel(level: MaturityLevel): string {
  const colors: Record<MaturityLevel, string> = {
    0: "hsl(0 72% 51%)",
    1: "hsl(35 80% 50%)",
    2: "hsl(45 90% 48%)",
    3: "hsl(150 55% 35%)",
    4: "hsl(183 92% 24%)",
  };
  return colors[level];
}

import { useAssessment } from "@/lib/assessment-store";
import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { supabase, isConfigured, type Assessment } from "@/lib/supabase";
import {
  DOMAINS,
  getDomainScore,
  getOverallScore,
  getMaturityLabel,
  getMaturityColor,
  getScorePercentage,
  MATURITY_LABELS,
  type MaturityLevel,
} from "@/lib/assessment-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link } from "wouter";
import {
  Scale, Search, Shield, Eye, Siren, RefreshCcw,
  GraduationCap, Lock, Monitor, Bot, ClipboardCheck,
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer,
} from "recharts";

const ICON_MAP: Record<string, React.ElementType> = {
  Scale, Search, Shield, Eye, Siren, RefreshCcw,
  GraduationCap, Lock, Monitor, Bot,
};

export default function ResultsPage() {
  const { state } = useAssessment();
  const params = useParams<{ assessmentId: string }>();
  const assessmentId = params.assessmentId;

  const [remoteAssessment, setRemoteAssessment] = useState<Assessment | null>(null);
  const [schoolName, setSchoolName] = useState<string>("");
  const [loadingRemote, setLoadingRemote] = useState(false);

  // Load from Supabase if assessmentId is in URL
  useEffect(() => {
    if (!assessmentId || !isConfigured) return;
    setLoadingRemote(true);
    (async () => {
      try {
        const { data } = await supabase
          .from("assessments")
          .select("*")
          .eq("id", assessmentId)
          .single();
        if (data) {
          setRemoteAssessment(data as Assessment);
          const { data: school } = await supabase
            .from("schools")
            .select("name")
            .eq("id", (data as Assessment).school_id)
            .single();
          setSchoolName(school?.name || "");
        }
      } catch {
        // ignore
      } finally {
        setLoadingRemote(false);
      }
    })();
  }, [assessmentId]);

  // Determine which scores to use
  const scores = remoteAssessment
    ? (remoteAssessment.scores as Record<string, MaturityLevel>)
    : state.scores;

  const displaySchoolName = remoteAssessment ? schoolName : state.schoolName;
  const hasScores = Object.keys(scores).length > 0;

  if (loadingRemote) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!hasScores) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100dvh-56px)] md:min-h-dvh p-6">
        <div className="text-center max-w-md space-y-4">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto" />
          <h1 className="text-lg font-semibold">No Results Yet</h1>
          <p className="text-sm text-muted-foreground">
            Complete an assessment to view detailed results.
          </p>
          <Link href="/assess">
            <Button>
              <ClipboardCheck className="w-4 h-4 mr-1.5" />
              Start Assessment
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const overall = getOverallScore(scores);

  const radarData = DOMAINS.map((d) => ({
    domain: d.name.length > 16 ? d.name.slice(0, 14) + "..." : d.name,
    score: parseFloat(getDomainScore(d.id, scores).toFixed(2)),
    fullMark: 4,
  }));

  const reportLink = assessmentId ? `/report/${assessmentId}` : "/report";

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Detailed Results</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {displaySchoolName && `${displaySchoolName} · `}
            Overall: {getScorePercentage(overall)}% ({getMaturityLabel(overall)})
          </p>
        </div>
        <Link href={reportLink}>
          <Button size="sm" variant="outline" data-testid="button-view-report">
            View Report
          </Button>
        </Link>
      </div>

      {/* Overview radar */}
      <Card className="border border-card-border">
        <CardContent className="p-4">
          <div className="h-[280px] md:h-[320px]" data-testid="chart-results-radar">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="domain" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis angle={90} domain={[0, 4]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickCount={5} />
                <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Domain tabs with control detail */}
      <Tabs defaultValue={DOMAINS[0].id}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-lg">
          {DOMAINS.map((d) => {
            const DIcon = ICON_MAP[d.icon] || Shield;
            const score = getDomainScore(d.id, scores);
            return (
              <TabsTrigger
                key={d.id}
                value={d.id}
                className="text-xs flex items-center gap-1.5 px-2.5 py-1.5"
                data-testid={`results-tab-${d.id}`}
              >
                <DIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{d.name.split(" ")[0]}</span>
                <span className="tabular-nums font-medium">{score.toFixed(1)}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {DOMAINS.map((domain) => {
          const domainScore = getDomainScore(domain.id, scores);
          const domainPct = getScorePercentage(domainScore);
          const Icon = ICON_MAP[domain.icon] || Shield;

          return (
            <TabsContent key={domain.id} value={domain.id} className="mt-4">
              <Card className="border border-card-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${getMaturityColor(domainScore)}18` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: getMaturityColor(domainScore) }} />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold">{domain.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{domain.description}</p>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <span className="text-lg font-bold" style={{ color: getMaturityColor(domainScore) }}>
                        {domainPct}%
                      </span>
                      <p className="text-xs text-muted-foreground">{getMaturityLabel(domainScore)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-3">
                    {domain.controls.map((control) => {
                      const score = (scores[control.id] ?? 0) as MaturityLevel;
                      const color = maturityColorForLevel(score);
                      return (
                        <div key={control.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{control.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{control.description}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="w-20 hidden sm:block">
                              <Progress value={(score / 4) * 100} className="h-1.5" />
                            </div>
                            <Badge
                              variant="outline"
                              className="text-xs min-w-[80px] justify-center"
                              style={{ color, borderColor: color }}
                            >
                              {MATURITY_LABELS[score]}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
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

import { useRef, useEffect, useState } from "react";
import { useAssessment } from "@/lib/assessment-store";
import { useParams } from "wouter";
import { supabase, isConfigured, type Assessment } from "@/lib/supabase";
import {
  DOMAINS,
  getDomainScore,
  getOverallScore,
  getMaturityLabel,
  getMaturityColor,
  getScorePercentage,
  generateRecommendations,
  MATURITY_LABELS,
  type MaturityLevel,
} from "@/lib/assessment-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Download, Printer, ClipboardCheck, Shield,
  AlertTriangle, CheckCircle2, TrendingUp, Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { HarmonyLogo } from "@/components/HarmonyLogo";

export default function ReportPage() {
  const { state } = useAssessment();
  const params = useParams<{ assessmentId: string }>();
  const assessmentId = params.assessmentId;

  const [remoteAssessment, setRemoteAssessment] = useState<Assessment | null>(null);
  const [schoolName, setSchoolName] = useState<string>("");
  const [loadingRemote, setLoadingRemote] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  const scores = remoteAssessment
    ? (remoteAssessment.scores as Record<string, MaturityLevel>)
    : state.scores;

  const displaySchoolName = remoteAssessment ? schoolName : state.schoolName;
  const displayAssessorName = state.assessorName;
  const displayDate = remoteAssessment?.assessment_date || state.assessmentDate;

  const hasScores = Object.keys(scores).length > 0;

  if (loadingRemote) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-4">
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
          <h1 className="text-lg font-semibold">No Report Available</h1>
          <p className="text-sm text-muted-foreground">
            Complete an assessment first to generate a report.
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
  const overallPct = getScorePercentage(overall);
  const overallLabel = getMaturityLabel(overall);
  const recs = generateRecommendations(scores);

  const handlePrint = () => { window.print(); };

  const handleExportCSV = () => {
    const headers = ["Domain", "Control", "Framework", "Reference", "Score", "Maturity Level"];
    const rows: string[][] = [];
    for (const domain of DOMAINS) {
      for (const control of domain.controls) {
        const score = (scores[control.id] ?? 0) as MaturityLevel;
        rows.push([domain.name, control.title, control.framework, control.reference, score.toString(), MATURITY_LABELS[score]]);
      }
    }
    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(displaySchoolName || "school").replace(/\s+/g, "-").toLowerCase()}-readiness-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exported successfully" });
  };

  const strongDomains = DOMAINS.filter((d) => getDomainScore(d.id, scores) >= 2.5).sort((a, b) => getDomainScore(b.id, scores) - getDomainScore(a.id, scores));
  const weakDomains = DOMAINS.filter((d) => getDomainScore(d.id, scores) < 2).sort((a, b) => getDomainScore(a.id, scores) - getDomainScore(b.id, scores));

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Action bar (hidden in print) */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Readiness Report</h1>
          <p className="text-sm text-muted-foreground">Printable summary for stakeholders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} data-testid="button-export-csv">
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV
          </Button>
          <Button size="sm" onClick={handlePrint} data-testid="button-print">
            <Printer className="w-4 h-4 mr-1.5" />
            Print
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="space-y-6 print:space-y-4">
        {/* Report Header */}
        <Card className="border border-card-border overflow-hidden">
          <div className="bg-primary p-5 md:p-6 text-primary-foreground">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-bold">Cybersecurity & Digital Transformation</h2>
                <h3 className="text-base font-semibold opacity-90">School Readiness Assessment Report</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right text-sm opacity-90">
                  <p className="font-semibold">Harmony Digital</p>
                  <p className="text-xs opacity-80">Consults Ltd</p>
                </div>
                <div className="bg-white rounded-lg p-1.5 shrink-0">
                  <HarmonyLogo className="w-12 h-12" />
                </div>
              </div>
            </div>
          </div>
          <CardContent className="p-5 md:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase">School</p>
                <p className="font-medium mt-0.5">{displaySchoolName || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase">Assessor</p>
                <p className="font-medium mt-0.5">{displayAssessorName || "Harmony Digital Consults"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase">Date</p>
                <p className="font-medium mt-0.5">{displayDate || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase">Framework</p>
                <p className="font-medium mt-0.5">NIST CSF 2.0 & ISO 27001</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Executive Summary */}
        <Card className="border border-card-border">
          <CardContent className="p-5 md:p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Executive Summary</h3>
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold border-4"
                style={{ color: getMaturityColor(overall), borderColor: getMaturityColor(overall) }}
                data-testid="text-report-overall"
              >
                {overallPct}%
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: getMaturityColor(overall) }}>{overallLabel}</p>
                <p className="text-sm text-muted-foreground">Overall maturity: {overall.toFixed(2)} out of 4.0</p>
                <p className="text-sm text-muted-foreground">{Object.keys(scores).length} controls assessed across {DOMAINS.length} domains</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">
              {displaySchoolName || "The school"} demonstrates a <strong>{overallLabel.toLowerCase()}</strong> level of
              cybersecurity and digital transformation maturity. {getExecutiveSummaryText(overall, recs.length)}
            </p>
          </CardContent>
        </Card>

        {/* Domain Scores Table */}
        <Card className="border border-card-border">
          <CardContent className="p-5 md:p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Domain Scores</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-domain-scores">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground text-xs uppercase">Domain</th>
                    <th className="text-center py-2 px-2 font-medium text-muted-foreground text-xs uppercase">Score</th>
                    <th className="text-center py-2 px-2 font-medium text-muted-foreground text-xs uppercase">%</th>
                    <th className="text-left py-2 pl-4 font-medium text-muted-foreground text-xs uppercase">Level</th>
                  </tr>
                </thead>
                <tbody>
                  {DOMAINS.map((domain) => {
                    const score = getDomainScore(domain.id, scores);
                    const pct = getScorePercentage(score);
                    const label = getMaturityLabel(score);
                    const color = getMaturityColor(score);
                    return (
                      <tr key={domain.id} className="border-b border-border last:border-0">
                        <td className="py-2.5 pr-4 font-medium">{domain.name}</td>
                        <td className="py-2.5 px-2 text-center tabular-nums font-semibold" style={{ color }}>{score.toFixed(1)}</td>
                        <td className="py-2.5 px-2 text-center tabular-nums">{pct}%</td>
                        <td className="py-2.5 pl-4">
                          <Badge variant="outline" className="text-xs" style={{ color, borderColor: color }}>{label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border border-card-border">
            <CardContent className="p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />Strengths
              </h3>
              {strongDomains.length > 0 ? (
                <div className="space-y-2">
                  {strongDomains.map((d) => (
                    <div key={d.id} className="flex items-center justify-between text-sm">
                      <span>{d.name}</span>
                      <span className="tabular-nums font-medium" style={{ color: getMaturityColor(getDomainScore(d.id, scores)) }}>
                        {getScorePercentage(getDomainScore(d.id, scores))}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No domains at Developing level or above yet.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border border-card-border">
            <CardContent className="p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />Areas for Improvement
              </h3>
              {weakDomains.length > 0 ? (
                <div className="space-y-2">
                  {weakDomains.map((d) => (
                    <div key={d.id} className="flex items-center justify-between text-sm">
                      <span>{d.name}</span>
                      <span className="tabular-nums font-medium" style={{ color: getMaturityColor(getDomainScore(d.id, scores)) }}>
                        {getScorePercentage(getDomainScore(d.id, scores))}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">All domains are at Developing level or above.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        {recs.length > 0 && (
          <Card className="border border-card-border">
            <CardContent className="p-5 md:p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />Recommendations
              </h3>
              <div className="space-y-3">
                {recs.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                    <Badge variant={rec.priority === "Critical" ? "destructive" : "outline"} className="text-xs shrink-0 mt-0.5 min-w-[60px] justify-center">
                      {rec.priority}
                    </Badge>
                    <div>
                      <span className="text-xs text-muted-foreground">{rec.domain}</span>
                      <p className="text-sm">{rec.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Control-Level Detail */}
        <Card className="border border-card-border print:break-before-page">
          <CardContent className="p-5 md:p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />Control-Level Scores
            </h3>
            <div className="space-y-4">
              {DOMAINS.map((domain) => (
                <div key={domain.id}>
                  <h4 className="text-sm font-semibold mb-2 pb-1 border-b border-border">{domain.name}</h4>
                  <div className="space-y-1.5">
                    {domain.controls.map((control) => {
                      const score = (scores[control.id] ?? 0) as MaturityLevel;
                      const color = maturityColorForLevel(score);
                      return (
                        <div key={control.id} className="flex items-center justify-between text-sm py-1">
                          <div className="flex-1 min-w-0 pr-4">
                            <span className="text-sm">{control.title}</span>
                            <span className="text-xs text-muted-foreground ml-2">{control.reference}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-bold tabular-nums w-4 text-right" style={{ color }}>{score}</span>
                            <Badge variant="outline" className="text-[10px] min-w-[70px] justify-center" style={{ color, borderColor: color }}>
                              {MATURITY_LABELS[score]}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground py-4 border-t border-border">
          <p>Generated by Harmony Digital Consults Ltd — School Readiness Dashboard</p>
          <p className="mt-1">Based on NIST CSF 2.0 and ISO 27001:2022 frameworks</p>
        </div>
      </div>
    </div>
  );
}

function getExecutiveSummaryText(overall: number, recCount: number): string {
  if (overall >= 3.5) return "The school has strong cybersecurity practices in place with comprehensive policies and controls. Focus on continuous improvement and emerging threats like AI governance.";
  if (overall >= 2.5) return `There are solid foundations in place, but ${recCount} areas need strengthening to reach full maturity. Prioritize the critical and high-priority recommendations below.`;
  if (overall >= 1.5) return `Several key areas require attention. With ${recCount} recommendations identified, the school should prioritize governance, data protection, and incident response planning.`;
  return `Significant gaps exist across most domains. Immediate action is needed on governance fundamentals, basic protective controls, and staff awareness training. ${recCount} recommendations are provided below.`;
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

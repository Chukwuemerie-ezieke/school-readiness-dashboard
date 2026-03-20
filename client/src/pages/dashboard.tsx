import { useAssessment } from "@/lib/assessment-store";
import {
  DOMAINS,
  getDomainScore,
  getOverallScore,
  getMaturityLabel,
  getMaturityColor,
  getScorePercentage,
  generateRecommendations,
} from "@/lib/assessment-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import {
  Scale, Search, Shield, Eye, Siren, RefreshCcw,
  GraduationCap, Lock, Monitor, Bot,
  ClipboardCheck, AlertTriangle, ArrowRight, Sparkles,
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell,
} from "recharts";

const ICON_MAP: Record<string, React.ElementType> = {
  Scale, Search, Shield, Eye, Siren, RefreshCcw,
  GraduationCap, Lock, Monitor, Bot,
};

export default function DashboardPage() {
  const { state, loadDemoData } = useAssessment();
  const { scores, schoolName, isComplete } = state;
  const hasScores = Object.keys(scores).length > 0;

  if (!hasScores) {
    return <EmptyState onLoadDemo={loadDemoData} />;
  }

  const overall = getOverallScore(scores);
  const overallPct = getScorePercentage(overall);
  const overallLabel = getMaturityLabel(overall);
  const overallColor = getMaturityColor(overall);

  const radarData = DOMAINS.map((d) => ({
    domain: d.name.length > 16 ? d.name.slice(0, 14) + "..." : d.name,
    fullName: d.name,
    score: parseFloat(getDomainScore(d.id, scores).toFixed(2)),
    fullMark: 4,
  }));

  const barData = DOMAINS.map((d) => {
    const s = getDomainScore(d.id, scores);
    return {
      name: d.name.length > 12 ? d.name.slice(0, 10) + "..." : d.name,
      fullName: d.name,
      score: parseFloat(s.toFixed(2)),
      color: getMaturityColor(s),
    };
  });

  const recs = generateRecommendations(scores);
  const criticalCount = recs.filter(r => r.priority === "Critical").length;
  const highCount = recs.filter(r => r.priority === "High").length;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight" data-testid="text-school-name">
            {schoolName || "School Assessment"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Cybersecurity & Digital Transformation Readiness
          </p>
        </div>
        {!isComplete && (
          <Link href="/assess">
            <Button size="sm" data-testid="button-continue-assessment">
              <ClipboardCheck className="w-4 h-4 mr-1.5" />
              Continue Assessment
            </Button>
          </Link>
        )}
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="border border-card-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Overall Score</p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-bold tabular-nums" style={{ color: overallColor }} data-testid="text-overall-score">
                {overallPct}%
              </span>
            </div>
            <Progress value={overallPct} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card className="border border-card-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Maturity Level</p>
            <p className="text-lg font-semibold mt-1.5" style={{ color: overallColor }} data-testid="text-maturity-level">
              {overallLabel}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {overall.toFixed(1)} / 4.0
            </p>
          </CardContent>
        </Card>

        <Card className="border border-card-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Critical Gaps</p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-bold tabular-nums text-destructive" data-testid="text-critical-count">
                {criticalCount}
              </span>
              {highCount > 0 && (
                <span className="text-xs text-muted-foreground">+{highCount} high</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Domains needing action</p>
          </CardContent>
        </Card>

        <Card className="border border-card-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Domains Assessed</p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-bold tabular-nums" data-testid="text-domains-count">
                {DOMAINS.length}
              </span>
              <span className="text-xs text-muted-foreground">/ {DOMAINS.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Object.keys(scores).length} controls scored
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Radar Chart */}
        <Card className="border border-card-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Maturity Radar</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-[300px] md:h-[340px]" data-testid="chart-radar">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="domain"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 4]}
                    tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                    tickCount={5}
                  />
                  <Radar
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="border border-card-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Domain Scores</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-[300px] md:h-[340px]" data-testid="chart-bar">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 4, right: 16, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" domain={[0, 4]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis type="category" dataKey="name" width={88} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    formatter={(value: number) => [value.toFixed(2), "Score"]}
                    labelFormatter={(label: string) => {
                      const item = barData.find(d => d.name === label);
                      return item?.fullName || label;
                    }}
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={18}>
                    {barData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Domain Cards Grid */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Domain Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {DOMAINS.map((domain) => {
            const score = getDomainScore(domain.id, scores);
            const pct = getScorePercentage(score);
            const label = getMaturityLabel(score);
            const color = getMaturityColor(score);
            const Icon = ICON_MAP[domain.icon] || Shield;

            return (
              <Card key={domain.id} className="border border-card-border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${color}18` }}
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{domain.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-bold tabular-nums" style={{ color }}>
                          {pct}%
                        </span>
                        <Badge variant="outline" className="text-xs h-5" style={{ color, borderColor: color }}>
                          {label}
                        </Badge>
                      </div>
                      <Progress value={pct} className="mt-2 h-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Top Recommendations */}
      {recs.length > 0 && (
        <Card className="border border-card-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                Priority Recommendations
              </CardTitle>
              <Link href="/report">
                <Button variant="ghost" size="sm" className="text-xs">
                  Full Report <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="space-y-3">
              {recs.slice(0, 5).map((rec, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <Badge
                    variant={rec.priority === "Critical" ? "destructive" : "outline"}
                    className="text-xs shrink-0 mt-0.5"
                  >
                    {rec.priority}
                  </Badge>
                  <div>
                    <span className="text-muted-foreground text-xs">{rec.domain}</span>
                    <p className="text-sm">{rec.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function EmptyState({ onLoadDemo }: { onLoadDemo: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100dvh-56px)] md:min-h-dvh p-6">
      <div className="text-center max-w-md space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-xl font-bold">School Readiness Dashboard</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Assess your school's cybersecurity and digital transformation maturity using NIST CSF and ISO 27001-inspired controls across 10 domains.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link href="/assess">
            <Button data-testid="button-start-assessment">
              <ClipboardCheck className="w-4 h-4 mr-1.5" />
              Start Assessment
            </Button>
          </Link>
          <Button variant="outline" onClick={onLoadDemo} data-testid="button-load-demo">
            <Sparkles className="w-4 h-4 mr-1.5" />
            Load Demo Data
          </Button>
        </div>
      </div>
    </div>
  );
}

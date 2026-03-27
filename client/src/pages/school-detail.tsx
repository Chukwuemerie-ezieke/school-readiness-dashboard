import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { supabase, isConfigured, type School, type Assessment, type Profile } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Mail, Phone, ClipboardCheck, ArrowLeft, ExternalLink } from "lucide-react";

export default function SchoolDetailPage() {
  const params = useParams<{ id: string }>();
  const schoolId = params.id;
  const [, navigate] = useLocation();

  const [school, setSchool] = useState<School | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [consultant, setConsultant] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConfigured || !schoolId) { setLoading(false); return; }

    Promise.all([
      supabase.from("schools").select("*").eq("id", schoolId).single(),
      supabase.from("assessments").select("*").eq("school_id", schoolId).order("assessment_date", { ascending: false }),
    ]).then(async ([schoolRes, assessmentsRes]) => {
      const s = schoolRes.data as School;
      setSchool(s);
      setAssessments((assessmentsRes.data as Assessment[]) ?? []);
      if (s?.assigned_consultant_id) {
        const { data: consultant } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", s.assigned_consultant_id)
          .single();
        setConsultant(consultant as Profile);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [schoolId]);

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="h-40 bg-muted animate-pulse rounded-xl" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="flex items-center justify-center min-h-dvh p-6">
        <div className="text-center space-y-3">
          <h2 className="text-lg font-semibold">School Not Found</h2>
          <Button onClick={() => navigate("/schools")} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Schools
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/schools")} data-testid="button-back">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Schools
        </Button>
      </div>

      {/* School Info Card */}
      <Card className="border border-card-border" data-testid="card-school-info">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg font-bold" data-testid="text-school-name">
              {school.name}
            </CardTitle>
            <Button
              size="sm"
              onClick={() => navigate(`/assess/${schoolId}`)}
              data-testid="button-new-assessment"
            >
              <ClipboardCheck className="w-4 h-4 mr-1.5" />
              New Assessment
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {school.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>{school.location}</span>
              </div>
            )}
            {school.contact_email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>{school.contact_email}</span>
              </div>
            )}
            {school.contact_phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>{school.contact_phone}</span>
              </div>
            )}
            {consultant && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="text-xs border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-400">
                  Consultant: {consultant.full_name}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assessment History */}
      <Card className="border border-card-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Assessment History</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-1">
          {assessments.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <p className="text-sm">No assessments yet.</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => navigate(`/assess/${schoolId}`)}
                data-testid="button-start-first-assessment"
              >
                <ClipboardCheck className="w-4 h-4 mr-1.5" />
                Start First Assessment
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-assessments">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium uppercase">Date</th>
                    <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium uppercase">Status</th>
                    <th className="text-right py-3 px-4 text-xs text-muted-foreground font-medium uppercase">Score</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors cursor-pointer"
                      onClick={() => navigate(`/results/${a.id}`)}
                      data-testid={`assessment-row-${a.id}`}
                    >
                      <td className="py-3 px-4">{a.assessment_date}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={a.status === "completed" ? "default" : "outline"}
                          className={`text-xs ${a.status === "in_progress" ? "border-amber-400 text-amber-700 dark:text-amber-400" : ""}`}
                        >
                          {a.status === "in_progress" ? "In Progress" : "Completed"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-semibold">
                        {a.overall_score != null ? `${(a.overall_score * 25).toFixed(0)}%` : "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

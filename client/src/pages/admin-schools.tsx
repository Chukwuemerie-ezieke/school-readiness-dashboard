import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase, isConfigured, type School, type Profile } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, MapPin, Mail, Phone, ExternalLink } from "lucide-react";

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [consultants, setConsultants] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Form state
  const [newSchool, setNewSchool] = useState({
    name: "",
    location: "",
    contact_email: "",
    contact_phone: "",
    assigned_consultant_id: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    if (!isConfigured) { setLoading(false); return; }
    const [schoolsRes, consultantsRes] = await Promise.all([
      supabase.from("schools").select("*").order("name"),
      supabase.from("profiles").select("*").eq("role", "consultant"),
    ]);
    setSchools((schoolsRes.data as School[]) ?? []);
    setConsultants((consultantsRes.data as Profile[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddSchool = async () => {
    if (!newSchool.name.trim()) {
      toast({ title: "School name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload: Partial<School> = {
      name: newSchool.name.trim(),
      location: newSchool.location || null,
      contact_email: newSchool.contact_email || null,
      contact_phone: newSchool.contact_phone || null,
      assigned_consultant_id: newSchool.assigned_consultant_id || null,
    };
    const { error } = await supabase.from("schools").insert([payload]);
    setSaving(false);
    if (error) {
      toast({ title: "Failed to add school", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "School added successfully" });
      setDialogOpen(false);
      setNewSchool({ name: "", location: "", contact_email: "", contact_phone: "", assigned_consultant_id: "" });
      fetchData();
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight" data-testid="text-schools-title">Schools</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage all registered schools</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-school">
              <Plus className="w-4 h-4 mr-1.5" />
              Add School
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New School</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label htmlFor="school-name" className="text-xs font-medium">School Name *</Label>
                <Input
                  id="school-name"
                  value={newSchool.name}
                  onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                  placeholder="e.g. Greenfield Academy"
                  className="mt-1"
                  data-testid="input-school-name"
                />
              </div>
              <div>
                <Label htmlFor="school-location" className="text-xs font-medium">Location</Label>
                <Input
                  id="school-location"
                  value={newSchool.location}
                  onChange={(e) => setNewSchool({ ...newSchool, location: e.target.value })}
                  placeholder="e.g. Lagos, Nigeria"
                  className="mt-1"
                  data-testid="input-school-location"
                />
              </div>
              <div>
                <Label htmlFor="school-email" className="text-xs font-medium">Contact Email</Label>
                <Input
                  id="school-email"
                  type="email"
                  value={newSchool.contact_email}
                  onChange={(e) => setNewSchool({ ...newSchool, contact_email: e.target.value })}
                  placeholder="principal@school.edu"
                  className="mt-1"
                  data-testid="input-school-email"
                />
              </div>
              <div>
                <Label htmlFor="school-phone" className="text-xs font-medium">Contact Phone</Label>
                <Input
                  id="school-phone"
                  value={newSchool.contact_phone}
                  onChange={(e) => setNewSchool({ ...newSchool, contact_phone: e.target.value })}
                  placeholder="+234 800 000 0000"
                  className="mt-1"
                  data-testid="input-school-phone"
                />
              </div>
              <div>
                <Label htmlFor="school-consultant" className="text-xs font-medium">Assigned Consultant</Label>
                <Select
                  value={newSchool.assigned_consultant_id}
                  onValueChange={(v) => setNewSchool({ ...newSchool, assigned_consultant_id: v })}
                >
                  <SelectTrigger className="mt-1" data-testid="select-consultant">
                    <SelectValue placeholder="Select consultant (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {consultants.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1"
                  onClick={handleAddSchool}
                  disabled={saving}
                  data-testid="button-save-school"
                >
                  {saving ? "Saving…" : "Add School"}
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-school">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!isConfigured && (
        <Card className="border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
          <CardContent className="p-4 text-sm text-amber-700 dark:text-amber-400">
            Supabase is not configured. Schools cannot be loaded.
          </CardContent>
        </Card>
      )}

      <Card className="border border-card-border">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />)}
            </div>
          ) : schools.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-sm">No schools yet. Add your first school.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-schools">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium uppercase">School</th>
                    <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium uppercase hidden md:table-cell">Location</th>
                    <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium uppercase hidden lg:table-cell">Consultant</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {schools.map((school) => {
                    const consultant = consultants.find(c => c.id === school.assigned_consultant_id);
                    return (
                      <tr
                        key={school.id}
                        className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors cursor-pointer"
                        onClick={() => navigate(`/schools/${school.id}`)}
                        data-testid={`school-row-${school.id}`}
                      >
                        <td className="py-3 px-4">
                          <p className="font-medium">{school.name}</p>
                          {school.contact_email && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3" />{school.contact_email}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          {school.location ? (
                            <span className="text-sm flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                              {school.location}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          {consultant ? (
                            <Badge variant="outline" className="text-xs border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-400">
                              {consultant.full_name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

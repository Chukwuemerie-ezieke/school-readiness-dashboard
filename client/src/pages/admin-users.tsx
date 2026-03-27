import { useEffect, useState } from "react";
import { supabase, isConfigured, type Profile } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
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
import { Plus } from "lucide-react";

function getRoleBadgeStyle(role: string) {
  if (role === "admin") return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700";
  if (role === "consultant") return "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700";
  return "bg-teal-100 text-teal-700 border-teal-300 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-700";
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "school" as "admin" | "consultant" | "school",
  });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    if (!isConfigured) { setLoading(false); return; }
    const { data } = await supabase.from("profiles").select("*").order("full_name");
    setUsers((data as Profile[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleInviteUser = async () => {
    if (!form.email.trim() || !form.full_name.trim() || !form.password.trim()) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name, role: form.role } },
    });
    setSaving(false);
    if (error) {
      toast({ title: "Failed to invite user", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "User invited successfully" });
      setDialogOpen(false);
      setForm({ email: "", password: "", full_name: "", role: "school" });
      setTimeout(fetchUsers, 1000); // wait for profile trigger
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight" data-testid="text-users-title">Users</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage platform users and roles</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-invite-user">
              <Plus className="w-4 h-4 mr-1.5" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label htmlFor="user-name" className="text-xs font-medium">Full Name *</Label>
                <Input
                  id="user-name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Jane Smith"
                  className="mt-1"
                  data-testid="input-user-name"
                />
              </div>
              <div>
                <Label htmlFor="user-email" className="text-xs font-medium">Email *</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="user@school.edu"
                  className="mt-1"
                  data-testid="input-user-email"
                />
              </div>
              <div>
                <Label htmlFor="user-password" className="text-xs font-medium">Temporary Password *</Label>
                <Input
                  id="user-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="mt-1"
                  data-testid="input-user-password"
                />
              </div>
              <div>
                <Label htmlFor="user-role" className="text-xs font-medium">Role *</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm({ ...form, role: v as "admin" | "consultant" | "school" })}
                >
                  <SelectTrigger className="mt-1" data-testid="select-user-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="consultant">Consultant</SelectItem>
                    <SelectItem value="school">School</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1"
                  onClick={handleInviteUser}
                  disabled={saving}
                  data-testid="button-save-user"
                >
                  {saving ? "Inviting…" : "Invite User"}
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-user">
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
            Supabase is not configured. Users cannot be loaded.
          </CardContent>
        </Card>
      )}

      <Card className="border border-card-border">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />)}
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-sm">No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-users">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium uppercase">Name</th>
                    <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium uppercase hidden sm:table-cell">Email</th>
                    <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium uppercase">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border last:border-0" data-testid={`user-row-${user.id}`}>
                      <td className="py-3 px-4 font-medium">{user.full_name}</td>
                      <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">{user.email}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={`text-xs capitalize ${getRoleBadgeStyle(user.role)}`}
                          data-testid={`badge-role-${user.id}`}
                        >
                          {user.role}
                        </Badge>
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

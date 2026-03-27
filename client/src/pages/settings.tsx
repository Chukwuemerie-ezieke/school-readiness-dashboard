import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase, isConfigured } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, User, Lock, CheckCircle2 } from "lucide-react";

function getRoleBadgeStyle(role: string) {
  if (role === "admin") return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700";
  if (role === "consultant") return "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700";
  return "bg-teal-100 text-teal-700 border-teal-300 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-700";
}

export default function SettingsPage() {
  const { user, profile, role } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [savingName, setSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleSaveName = async () => {
    if (!fullName.trim()) return;
    setSavingName(true);
    setNameSuccess(false);
    if (isConfigured && profile) {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim() })
        .eq("id", profile.id);
      if (error) {
        toast({ title: "Failed to update name", description: error.message, variant: "destructive" });
        setSavingName(false);
        return;
      }
    }
    setNameSuccess(true);
    setSavingName(false);
    toast({ title: "Name updated successfully" });
    setTimeout(() => setNameSuccess(false), 3000);
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setSavingPassword(true);
    if (!isConfigured) {
      setPasswordError("Supabase is not configured.");
      setSavingPassword(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Password updated successfully" });
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-bold tracking-tight" data-testid="text-settings-title">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your profile and account</p>
      </div>

      {/* Profile Info */}
      <Card className="border border-card-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">Profile Information</CardTitle>
          </div>
          <CardDescription className="text-xs">Update your display name</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-5">
          {/* Role + email display */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">
                {(profile?.full_name || user?.email || "U").charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium" data-testid="text-profile-name">{profile?.full_name || "—"}</p>
              <p className="text-xs text-muted-foreground" data-testid="text-profile-email">{user?.email}</p>
              {role && (
                <Badge
                  variant="outline"
                  className={`text-xs mt-1 capitalize ${getRoleBadgeStyle(role)}`}
                  data-testid="badge-profile-role"
                >
                  {role}
                </Badge>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="full-name" className="text-xs font-medium">Full Name</Label>
            <Input
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="mt-1"
              data-testid="input-full-name"
            />
          </div>

          <Button
            size="sm"
            onClick={handleSaveName}
            disabled={savingName || !fullName.trim()}
            data-testid="button-save-name"
          >
            {nameSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-green-500" />
                Saved!
              </>
            ) : savingName ? "Saving…" : "Save Name"}
          </Button>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card className="border border-card-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">Change Password</CardTitle>
          </div>
          <CardDescription className="text-xs">Set a new password for your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-5">
          {passwordError && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{passwordError}</AlertDescription>
            </Alert>
          )}

          {passwordSuccess && (
            <Alert className="py-2 border-green-300 bg-green-50 dark:bg-green-900/20">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-xs text-green-700 dark:text-green-400">
                Password updated successfully.
              </AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="new-password" className="text-xs font-medium">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1"
              data-testid="input-new-password"
              autoComplete="new-password"
            />
          </div>

          <div>
            <Label htmlFor="confirm-password" className="text-xs font-medium">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1"
              data-testid="input-confirm-password"
              autoComplete="new-password"
            />
          </div>

          <Button
            size="sm"
            onClick={handleChangePassword}
            disabled={savingPassword}
            data-testid="button-change-password"
          >
            {savingPassword ? "Updating…" : "Update Password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

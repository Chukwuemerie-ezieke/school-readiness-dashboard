import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().email("Valid email is required"),
});

type ForgotValues = z.infer<typeof forgotSchema>;

function HexLogo() {
  return (
    <svg
      viewBox="0 0 40 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-10 h-10"
      aria-label="Harmony Digital Consults Logo"
    >
      <path
        d="M20 2L36.5 11.5V30.5L20 40L3.5 30.5V11.5L20 2Z"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
        fill="none"
      />
      <path
        d="M14 15V29M26 15V29M14 22H26"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const form = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotValues) => {
    setSubmitError(null);
    const { error } = await resetPassword(values.email);
    if (error) {
      setSubmitError(error.message || "Failed to send reset email.");
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm border border-card-border shadow-sm">
          <CardContent className="p-6 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
            <h2 className="font-semibold text-base">Email sent</h2>
            <p className="text-sm text-muted-foreground">
              Check your inbox for a password reset link.
            </p>
            <Link href="/login">
              <Button variant="outline" size="sm" className="mt-2" data-testid="button-back-to-login">
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <HexLogo />
          <div>
            <h1 className="text-lg font-bold tracking-tight">Harmony Digital</h1>
            <p className="text-xs text-muted-foreground">School Readiness Dashboard</p>
          </div>
        </div>

        <Card className="border border-card-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Reset password</CardTitle>
            <CardDescription className="text-xs">
              Enter your email and we'll send you a reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitError && (
              <Alert variant="destructive" className="mb-4 py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{submitError}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="you@school.edu"
                          data-testid="input-email"
                          autoComplete="email"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                  data-testid="button-send-reset"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </form>
            </Form>

            <p className="text-center text-xs text-muted-foreground mt-4">
              Remember your password?{" "}
              <Link href="/login">
                <span className="text-primary hover:underline cursor-pointer">Sign in</span>
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          © 2026 Harmony Digital Consults Ltd
        </p>
      </div>
    </div>
  );
}

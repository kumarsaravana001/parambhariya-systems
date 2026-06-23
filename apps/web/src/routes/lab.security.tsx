import { createFileRoute } from "@tanstack/react-router";
import { Card, CardTitle, Button, Badge } from "@parambhariya/ui";
import { QrCode, Mail, KeyRound, Smartphone } from "lucide-react";

function Security() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Security</h2>
        <p className="text-sm text-text-muted">Manage two-factor authentication and your password.</p>
      </div>

      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Two-Factor Authentication</CardTitle>
          <Badge tone="warn">Not enabled</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border-default p-4 flex flex-col gap-2">
            <span className="text-brand-700 [&_svg]:h-6 [&_svg]:w-6" aria-hidden><Smartphone /></span>
            <div className="font-medium text-text-primary">Authenticator app</div>
            <p className="text-sm text-text-muted flex-1">Use Google Authenticator, Authy, or any TOTP-compatible app.</p>
            <Button size="sm" variant="secondary" className="self-start"><QrCode className="h-4 w-4" /> Set up authenticator app</Button>
          </div>
          <div className="rounded-lg border border-border-default p-4 flex flex-col gap-2">
            <span className="text-brand-700 [&_svg]:h-6 [&_svg]:w-6" aria-hidden><Mail /></span>
            <div className="font-medium text-text-primary">Email verification code</div>
            <p className="text-sm text-text-muted flex-1">Receive a one-time code at your email each time you log in.</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">Email OTP is disabled</span>
              <Button size="sm" variant="secondary">Enable</Button>
            </div>
          </div>
        </div>
      </Card>

      <Card padding="lg">
        <div className="flex items-start gap-3">
          <span className="h-9 w-9 rounded-md bg-surface-muted grid place-items-center text-text-secondary shrink-0" aria-hidden><KeyRound className="h-5 w-5" /></span>
          <div className="flex-1">
            <CardTitle className="text-base">Change password</CardTitle>
            <p className="text-sm text-text-muted mt-1">Update your account password. Choose something strong and unique.</p>
          </div>
          <Button size="sm" variant="secondary">Change password</Button>
        </div>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/lab/security")({ component: Security });

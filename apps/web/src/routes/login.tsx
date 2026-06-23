import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { Brand, Card, Button, Input, FormField } from "@parambhariya/ui";

function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/dashboard" });
  };
  return (
    <div className="min-h-svh grid place-items-center px-4 py-10 bg-surface-bg">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-6 gap-3">
          <Brand size="lg" />
          <div>
            <h1 className="text-2xl font-bold tracking-[-0.015em] text-text-primary">Welcome back</h1>
            <p className="text-sm text-text-muted mt-1">Farm management dashboard.</p>
          </div>
        </div>
        <Card padding="lg" className="flex flex-col gap-4">
          <form onSubmit={submit} className="flex flex-col gap-4">
            <FormField label="Email" htmlFor="email-login">
              <Input id="email-login" type="email" autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@farm.in" />
            </FormField>
            <FormField label="Password" htmlFor="password-login">
              <Input id="password-login" type="password" autoComplete="current-password"
                value={password} onChange={(e) => setPassword(e.target.value)} />
            </FormField>
            <Button type="submit" variant="primary" size="md" className="w-full mt-2">
              Sign in
            </Button>
          </form>
          <div className="text-sm text-text-muted text-center">
            Don't have an account?{" "}
            <Link to="/dashboard" className="text-brand-700 hover:underline underline-offset-2">
              Contact your farm admin
            </Link>
          </div>
        </Card>
        <p className="text-center text-xs text-text-muted mt-4 font-mono">
          Open access for preview · any credentials work
        </p>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/login")({ component: LoginScreen });

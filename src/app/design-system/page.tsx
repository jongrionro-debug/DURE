"use client";

import { Suspense, useState } from "react";

import { AuthForm } from "@/components/auth/auth-form";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { DashboardScreen } from "@/components/ops/dashboard-screen";
import { SessionManagementScreen } from "@/components/ops/session-management-screen";
import { UsersScreen } from "@/components/ops/users-screen";

import {
  mockDashboardQueryData,
  mockSessionDashboardData,
  mockSessionManagementData,
  mockUserManagementData,
} from "./mock-data";

type ComponentKey =
  | "AuthLogin"
  | "AuthSignup"
  | "Onboarding"
  | "Dashboard"
  | "Users"
  | "SessionManagement";

const COMPONENT_LIST: { key: ComponentKey; label: string }[] = [
  { key: "AuthLogin", label: "Auth Form (Login)" },
  { key: "AuthSignup", label: "Auth Form (Signup)" },
  { key: "Onboarding", label: "Onboarding Form" },
  { key: "Dashboard", label: "Dashboard Screen" },
  { key: "Users", label: "Users Screen" },
  { key: "SessionManagement", label: "Session Management" },
];

export default function DesignSystemPage() {
  const [activeComponent, setActiveComponent] = useState<ComponentKey>("Dashboard");

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-[var(--color-border)] bg-white p-4">
        <h1 className="mb-6 text-lg font-bold text-[var(--color-text-primary)]">
          UI Catalog
        </h1>
        <nav className="flex flex-col gap-2">
          {COMPONENT_LIST.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveComponent(item.key)}
              className={`rounded-md px-3 py-2 text-left text-sm font-medium transition ${
                activeComponent === item.key
                  ? "bg-[var(--color-accent)] text-white"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-6 relative">
        <Suspense fallback={<div>Loading component...</div>}>
          {activeComponent === "AuthLogin" && <AuthForm mode="login" />}
          {activeComponent === "AuthSignup" && <AuthForm mode="signup" />}
          {activeComponent === "Onboarding" && (
            <OnboardingForm email="admin@example.com" />
          )}
          {activeComponent === "Dashboard" && (
            <DashboardScreen
              data={mockSessionDashboardData}
              dashboard={mockDashboardQueryData}
            />
          )}
          {activeComponent === "Users" && (
            <UsersScreen data={mockUserManagementData} />
          )}
          {activeComponent === "SessionManagement" && (
            <SessionManagementScreen session={mockSessionManagementData} />
          )}
        </Suspense>
      </main>
    </div>
  );
}

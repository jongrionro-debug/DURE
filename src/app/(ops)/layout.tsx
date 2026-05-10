import { redirect } from "next/navigation";

import { AppShell } from "@/components/ui/app-shell";
import { getProtectedRouteRedirect } from "@/lib/auth/routing";
import { getServerAuthState } from "@/lib/auth/supabase-server";

export default async function OpsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authState = await getServerAuthState();
  const redirectHref = getProtectedRouteRedirect(authState);

  if (redirectHref) {
    redirect(redirectHref);
  }

  if (authState.role === "teacher") {
    redirect("/sessions");
  }

  return (
    <AppShell role="ops" email={authState.user?.email}>
      {children}
    </AppShell>
  );
}

import { type ReactNode, useEffect, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { Link } from "react-router-dom";

type RequireAdminProps = {
  children: ReactNode;
};

type AccessStatus = "checking" | "allowed" | "denied";

function RequireAdmin({ children }: RequireAdminProps) {
  const [status, setStatus] = useState<AccessStatus>("checking");

  useEffect(() => {
    async function checkAdminAccess() {
      try {
        const session = await fetchAuthSession({
          forceRefresh: true,
        });

        const groupClaim =
          session.tokens?.accessToken.payload["cognito:groups"];

        const groups = Array.isArray(groupClaim)
          ? groupClaim.map(String)
          : [];

        setStatus(groups.includes("ADMINS") ? "allowed" : "denied");
      } catch (error) {
        console.error("Could not check admin access:", error);
        setStatus("denied");
      }
    }

    checkAdminAccess();
  }, []);

  if (status === "checking") {
    return (
      <main className="app-shell">
        <section className="card">
          <h2>Checking administrator access…</h2>
        </section>
      </main>
    );
  }

  if (status === "denied") {
    return (
      <main className="app-shell">
        <section className="card">
          <p className="eyebrow">Restricted Area</p>
          <h1>Administrator access required</h1>
          <p>
            Your account does not have permission to view this page.
          </p>

          <Link to="/" className="primary-button">
            Return to application
          </Link>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}

export default RequireAdmin;
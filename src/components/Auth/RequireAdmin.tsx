
import React from "react";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useAuth } from "@/hooks/useAuth";

/**
 * RequireAdmin: Only renders children if user is an admin.
 * Otherwise, renders an error message.
 */
const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading: userLoading } = useAuth();
  const { isAdmin, isLoading: rolesLoading } = useUserRoles();

  if (userLoading || rolesLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center flex-col gap-4 bg-yellow-50 dark:bg-yellow-900/20">
        <div className="p-6 rounded-lg border border-yellow-400 bg-yellow-100 shadow text-yellow-900 text-lg font-semibold dark:border-yellow-600 dark:text-yellow-100 dark:bg-yellow-900/70">
          Confidential information.<br />
          <span className="font-normal">Not accessible to all users.</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireAdmin;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { LoginForm } from "@/components/Auth/LoginForm";
import { SignUpForm } from "@/components/Auth/SignUpForm";
import { AppLayout } from "@/components/Layout/AppLayout";
import { getEnabledApps } from "@/config/apps";
import { useAppSettings } from "@/hooks/useAppSettings";
import Landing from "@/pages/Landing";
import SettingsPage from '@/pages/Settings';
import WalletDetail from '@/apps/finance/pages/WalletDetail';
import CategoryDetail from '@/apps/finance/pages/CategoryDetail';
import Loans from '@/apps/finance/pages/Loans';
import Budgets from '@/apps/finance/pages/Budgets';
import UniverseDashboard from '@/apps/tv-shows/pages/UniverseDashboard';
import UniverseDetail from '@/apps/tv-shows/pages/UniverseDetail';
import Universes from '@/apps/tv-shows/pages/Universes';
import NotFound from '@/pages/NotFound';
import Profile from '@/pages/Profile';

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, isLoading } = useAuth();
  const { settings } = useAppSettings();
  const enabledApps = getEnabledApps(settings);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="*" element={<LoginForm />} />
      </Routes>
    );
  }

  return (
    <OrganizationProvider>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Landing />} />
          {enabledApps.map((app) =>
            app.routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<route.component />}
              />
            ))
          )}
          <Route path="/finance/wallet/:walletId" element={<WalletDetail />} />
          <Route path="/finance/category/:categoryId" element={<CategoryDetail />} />
          <Route path="/finance/loans" element={<Loans />} />
          <Route path="/finance/budgets" element={<Budgets />} />
          <Route path="/tv-shows/universes" element={<Universes />} />
          <Route path="/tv-shows/universe/:universeId/dashboard" element={<UniverseDashboard />} />
          <Route path="/tv-shows/universe/:universeId" element={<UniverseDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </OrganizationProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

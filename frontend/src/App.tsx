import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ThemeProvider } from "./contexts/theme-context";
import { AuthProvider } from "./contexts/auth-context";

import LandingPage from "./pages/landing-page";
import LoginPage from "./pages/login-page";
import UnauthorizedPage from "./pages/unauthorized-page";

import { DashboardLayout } from "./components/layout/dashboard-layout";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              <Route path="/donor" element={<DashboardLayout requiredRole="donor" />}>
                {/* <Route index element={<DonorDashboard />} />
                <Route path="post" element={<PostDonation />} />
                <Route path="donations" element={<DonorDonations />} />
                <Route path="notifications" element={<DonorNotifications />} />
                <Route path="impact" element={<DonorImpact />} /> */}
              </Route>

              <Route path="/ngo" element={<DashboardLayout requiredRole="ngo" />}>
                {/* <Route index element={<NgoDashboard />} />
                <Route path="nearby" element={<NgoDashboard />} />
                <Route path="accepted" element={<NgoDashboard />} />
                <Route path="volunteers" element={<NgoDashboard />} />
                <Route path="notifications" element={<DonorNotifications />} />
                <Route path="feedback" element={<NgoDashboard />} />
                <Route path="impact" element={<DonorImpact />} /> */}
              </Route>

              <Route path="/admin" element={<DashboardLayout requiredRole="admin" />}>
                {/* <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminDashboard />} />
                <Route path="reports" element={<AdminDashboard />} />
                <Route path="tracking" element={<AdminDashboard />} />
                <Route path="notifications" element={<DonorNotifications />} />
                <Route path="moderation" element={<AdminDashboard />} /> */}
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

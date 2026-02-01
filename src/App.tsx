import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Toaster as Sonner } from "@/components/ui/sonner.tsx";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Analytics from "./pages/Analytics.tsx";
import Auth from "./pages/Auth.tsx";
import Demo from "./pages/Demo.tsx";
import Index from "./pages/Index.tsx";
import LandingPage from "./pages/LandingPage.tsx";
import Leaderboard from "./pages/Leaderboard.tsx";
import NotFound from "./pages/NotFound.tsx";
import Profile from "./pages/Profile.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage/>}/>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/game"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/demo"
              element={
                <ProtectedRoute>
                  <Demo />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Server, RefreshCw, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const ServerError = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);

  const handleRetry = async () => {
    setIsChecking(true);
    try {
      // Try to ping the backend
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${BACKEND_URL}/health`, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        // Server is back, reload the page
        window.location.reload();
      } else {
        alert("Backend server is still not responding. Please check the server status.");
      }
    } catch (error) {
      alert("Backend server is still unavailable. Please ensure it's running.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-orange-200 bg-white/90 backdrop-blur-sm shadow-2xl">
        <CardContent className="pt-10 pb-10 text-center px-6">
          {/* Icon */}
          <div className="mb-6">
            <div className="relative inline-block">
              <Server className="w-24 h-24 text-orange-500 animate-pulse" />
              <div className="absolute inset-0 w-24 h-24 bg-orange-500/20 rounded-full blur-2xl animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Backend Server Unavailable
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-gray-600 mb-6">
            The backend server is currently not responding.
          </p>

          {/* Description */}
          <div className="bg-gray-50 rounded-lg p-5 mb-6 text-left">
            <p className="text-gray-700 text-sm">
              The application couldn't connect to the backend server. This usually means the server is not running or has encountered an error.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <Button
              onClick={handleRetry}
              size="lg"
              disabled={isChecking}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
              {isChecking ? 'Checking...' : 'Try Again'}
            </Button>
            <Button
              onClick={handleGoHome}
              size="lg"
              variant="outline"
              className="border-gray-300 hover:bg-gray-100 px-6"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Home
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-gray-500 mt-4">
            Please contact support if the issue persists
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServerError;

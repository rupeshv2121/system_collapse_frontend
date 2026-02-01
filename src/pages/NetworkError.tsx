import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NetworkError = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload();
    } else {
      alert("Still no internet connection. Please check your network settings.");
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-red-200 bg-white/90 backdrop-blur-sm shadow-2xl">
        <CardContent className="pt-10 pb-10 text-center px-6">
          {/* Icon */}
          <div className="mb-6">
            <div className="relative inline-block">
              <WifiOff className="w-24 h-24 text-red-500 animate-pulse" />
              <div className="absolute inset-0 w-24 h-24 bg-red-500/20 rounded-full blur-2xl animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            No Internet Connection
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-gray-600 mb-6">
            Oops! It looks like you're offline.
          </p>

          {/* Description */}
          <div className="bg-gray-50 rounded-lg p-5 mb-6 text-left">
            <p className="text-gray-700 text-sm">
              Your device is not connected to the internet. Please check your WiFi or mobile data connection and try again.
            </p>
          </div>

          {/* Connection Status */}
          <div className="mb-6">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm ${
              navigator.onLine 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                navigator.onLine ? 'bg-green-500' : 'bg-red-500'
              } animate-pulse`} />
              {navigator.onLine ? 'Connection Restored' : 'Currently Offline'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <Button
              onClick={handleRetry}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
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
            This page will automatically refresh when your connection is restored
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkError;

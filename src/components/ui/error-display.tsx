import { AlertCircle, Server, WifiOff } from "lucide-react";
import { Card, CardContent } from "./card";

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  type?: "network" | "server" | "auth" | "generic";
  onRetry?: () => void;
}

export const ErrorDisplay = ({ 
  title, 
  message, 
  type = "generic",
  onRetry 
}: ErrorDisplayProps) => {
  const getIcon = () => {
    switch (type) {
      case "network":
        return <WifiOff className="w-16 h-16 text-red-400 mb-4 mx-auto animate-pulse" />;
      case "server":
        return <Server className="w-16 h-16 text-orange-400 mb-4 mx-auto animate-pulse" />;
      case "auth":
        return <AlertCircle className="w-16 h-16 text-yellow-400 mb-4 mx-auto animate-pulse" />;
      default:
        return <AlertCircle className="w-16 h-16 text-red-400 mb-4 mx-auto animate-pulse" />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case "network":
        return "No Internet Connection";
      case "server":
        return "Backend Server Unavailable";
      case "auth":
        return "Authentication Error";
      default:
        return "Something Went Wrong";
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case "network":
        return "No internet connection detected. Please check your network connection and try again.";
      case "server":
        return "The backend server is currently unavailable or not running. Please start the server and try again.";
      case "auth":
        return "Your session has expired. Please sign in again to continue.";
      default:
        return "An unexpected error occurred. Please try again later.";
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <Card className="max-w-md w-full border-red-500/30 bg-gray-900/80 backdrop-blur-sm">
        <CardContent className="pt-8 pb-8 text-center">
          {getIcon()}
          
          <h2 className="text-2xl font-bold text-white mb-3">
            {title || getDefaultTitle()}
          </h2>
          
          <p className="text-gray-400 mb-6 leading-relaxed">
            {message || getDefaultMessage()}
          </p>

          {type === "server" && (
            <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-orange-400 text-sm">
                <Server className="w-4 h-4" />
                <span>Backend server is not running or unreachable</span>
              </div>
            </div>
          )}

          {type === "network" && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-red-400 text-sm">
                <WifiOff className="w-4 h-4" />
                <span>Please check your internet connection</span>
              </div>
            </div>
          )}

          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105"
            >
              Try Again
            </button>
          )}

          <div className="mt-6 text-xs text-gray-500">
            If the problem persists, please contact support
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const InlineErrorDisplay = ({
  message,
  type = "generic",
  onRetry
}: ErrorDisplayProps) => {
  const getIcon = () => {
    switch (type) {
      case "network":
        return <WifiOff className="w-5 h-5 text-red-400" />;
      case "server":
        return <Server className="w-5 h-5 text-orange-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-400" />;
    }
  };

  return (
    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-300">
            {message || "An error occurred"}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-xs text-purple-400 hover:text-purple-300 underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

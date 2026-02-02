import { toast } from "@/hooks/use-toast";
import { ApiError } from "./userDataApi";

export const handleApiError = (error: unknown, customMessage?: string) => {
  if (error instanceof ApiError) {
    const errorTitles = {
      network: "No Internet Connection",
      server: "Backend Server Down",
      auth: "Authentication Error",
      generic: "Error",
    };

    const errorDescriptions = {
      network:
        "No internet connection detected. Please check your network and try again.",
      server:
        "Unable to connect to backend server. Please ensure the server is running.",
      auth: "Your session has expired. Please sign in again.",
      generic: "Something went wrong. Please try again.",
    };

    toast({
      variant: "destructive",
      title: errorTitles[error.type],
      description:
        customMessage || error.message || errorDescriptions[error.type],
    });

    return {
      type: error.type,
      message: error.message,
    };
  }

  // Generic error
  toast({
    variant: "destructive",
    title: "Error",
    description: customMessage || "An unexpected error occurred",
  });

  return {
    type: "generic" as const,
    message: customMessage || "An unexpected error occurred",
  };
};

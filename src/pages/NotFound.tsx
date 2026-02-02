import { Navbar } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Home } from 'lucide-react';
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 grid-pattern">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md shadow-xl border-2 border-blue-200">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            {/* Animated Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse"></div>
                <AlertCircle className="w-20 h-20 text-red-500 relative animate-bounce" />
              </div>
            </div>
            
            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                404
              </h1>
              <p className="text-2xl font-semibold text-gray-800">Page Not Found</p>
              <p className="text-gray-600">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>

            {/* Action Button */}
            <Button 
              onClick={() => navigate('/game')}
              size="lg"
              className="gap-2 font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Home className="w-5 h-5" />
              Return to Game
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;

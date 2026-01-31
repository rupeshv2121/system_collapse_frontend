import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Activity, Brain, ChevronDown, LogOut, Play, Trophy, User } from "lucide-react";
import { forwardRef, useState } from "react";
import { Link, NavLinkProps, NavLink as RouterNavLink, useLocation } from "react-router-dom";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

// Enhanced Navbar Component
const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navLinks = [
    { to: "/", label: "Game", icon: Play },
    { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { to: "/analytics", label: "Analytics", icon: Activity },
  ];

  const getUserInitial = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <nav className=" border-b backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group"
          >
            <div className="relative">
              <Brain className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors" />
              <div className="absolute inset-0  blur-xl transition-all" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              System Collapse
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 relative group",
                    isActive
                      ? "text-white"
                      : "text-gray-300 hover:text-white hover:bg-purple-500/10"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{link.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {/* User Info with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                  {getUserInitial()}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-xs text-gray-400">Player</span>
                  <span className="text-sm text-white font-medium truncate max-w-[150px]">
                    {user?.email?.split('@')[0] || 'User'}
                  </span>
                </div>
                <ChevronDown className={cn(
                  "w-4 h-4 text-gray-400 transition-transform duration-200",
                  showUserMenu && "rotate-180"
                )} />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-purple-500/30 rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-3 border-b border-purple-500/20 bg-purple-500/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {getUserInitial()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">Player</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <Link
                      to="/analytics"
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-purple-500/10 text-gray-300 hover:text-white transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm">View Profile</span>
                    </Link>
                    
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-500/10 text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    isActive
                      ? "text-white bg-purple-600/30"
                      : "text-gray-400 hover:text-white hover:bg-purple-500/10"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export { Navbar, NavLink };


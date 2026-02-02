import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Activity, Brain, ChevronDown, LogOut, Play, Trophy, User } from "lucide-react";
import { forwardRef, useEffect, useRef, useState } from "react";
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
  const { user, username, signOut } = useAuth();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { to: "/game", label: "Game", icon: Play },
    { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { to: "/analytics", label: "Analytics", icon: Activity },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const getUserInitial = () => {
    if (username) {
      return username.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <nav className="border-b border-blue-200 bg-white backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link 
            to={user ? "/dashboard" : "/"} 
            className="flex items-center gap-2 group"
          >
            <div className="relative">
              <Brain className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
              <div className="absolute inset-0 blur-xl transition-all" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              System Drift
            </span>
          </Link>

          {/* Desktop Navigation Links */}
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
                      ? "text-blue-600 font-semibold"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-100/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{link.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-500" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {/* User Info with Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 border border-blue-300 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                  {getUserInitial()}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-xs text-gray-600">Player</span>
                  <span className="text-sm text-gray-900 font-medium truncate max-w-[150px]">
                    {username || 'User'}
                  </span>
                </div>
                <ChevronDown className={cn(
                  "w-4 h-4 text-gray-600 transition-transform duration-200",
                  showUserMenu && "rotate-180"
                )} />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-blue-300 rounded-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-3 border-b border-blue-200 bg-blue-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white font-bold">
                        {getUserInitial()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{username || 'Player'}</p>
                        <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    {/* Mobile Navigation Links in Dropdown */}
                    <div className="md:hidden">
                      {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.to;
                        return (
                          <Link
                            key={link.to}
                            to={link.to}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                              isActive
                                ? "bg-blue-100 text-blue-600 font-medium"
                                : "text-gray-700 hover:bg-blue-100 hover:text-blue-600"
                            )}
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm">{link.label}</span>
                          </Link>
                        );
                      })}
                      <div className="my-2 border-t border-blue-200" />
                    </div>
                    
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-100 text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm">View Profile</span>
                    </Link>
                    
                    <Link
                      to="/"
                      onClick={() => {
                        setShowUserMenu(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-100 text-gray-700 hover:text-red-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Sign Out</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export { Navbar, NavLink };


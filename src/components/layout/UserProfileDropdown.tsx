import React from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearUser } from "@/features/auth/authSlice";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";

interface User {
  _id?: string;
  email?: string;
  fullName?: string;
  profileImage?: string;
  role?: string;
}

interface UserProfileDropdownProps {
  user: User | null;
  showProfileMenu: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  isMobile?: boolean;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({
  user,
  showProfileMenu,
  onToggleMenu,
  onCloseMenu,
  isMobile = false,
}) => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(clearUser());
    onCloseMenu();
    window.location.href = "/login";
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (user?.fullName) {
      return user.fullName
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Get user role display text
  const getUserRole = () => {
    if (user?.role === "admin") return "Administrator";
    if (user?.role === "super_admin") return "Super Admin";
    return "User";
  };

  // Mobile view shows a simpler version
  if (isMobile) {
    return (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage
              src={user?.profileImage}
              alt={user?.fullName || "Profile"}
            />
            <AvatarFallback className="bg-primary-600 text-white">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">
              {user?.fullName || user?.email || "Account"}
            </p>
            <p className="text-gray-500 text-xs truncate">
              {user?.email || ""}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Desktop view with dropdown menu
  return (
    <div className="relative">
      <button
        onClick={onToggleMenu}
        className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity focus:outline-none"
      >
        <Avatar className="w-8 h-8">
          <AvatarImage
            src={user?.profileImage}
            alt={user?.fullName || "Profile"}
          />
          <AvatarFallback className="bg-primary-600 text-white">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>
        <div className="hidden sm:block text-sm">
          <div className="font-medium text-gray-900">
            {user?.fullName || user?.email?.split("@")[0] || "Account"}
          </div>
          <div className="text-gray-500">{getUserRole()}</div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {showProfileMenu && (
        <>
          {/* Backdrop for clicking outside */}
          <div className="fixed inset-0 z-40" onClick={onCloseMenu} />
          <div className="absolute right-0 top-[45px] w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
            {/* User Info Section */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={user?.profileImage}
                    alt={user?.fullName || "Profile"}
                  />
                  <AvatarFallback className="bg-primary-600 text-white">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">
                    {user?.fullName || "User"}
                  </p>
                  <p className="text-gray-500 text-sm truncate">
                    {user?.email || ""}
                  </p>
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">
                    {getUserRole()}
                  </span>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <ul className="py-2">
              <li>
                <Link
                  to="/settings"
                  className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={onCloseMenu}
                >
                  <Settings className="w-4 h-4 mr-3 text-gray-400" />
                  Settings
                </Link>
              </li>

              {/* Logout with divider */}
              <li className="border-t border-gray-200 mt-1 pt-1">
                <button
                  className="flex items-center w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-3 text-red-500" />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfileDropdown;

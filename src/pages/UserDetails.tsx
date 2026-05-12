import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import PageTitle from "@/components/layout/PageTitle";
import { UserProfileHeader } from "@/features/userdetails/UserProfileHeader";
import { UserStatsCards } from "@/features/userdetails/UserStatsCards";
import { PersonalInformationSection } from "@/features/userdetails/PersonalInformationSection";
import { UserNavigationTabs } from "@/features/userdetails/UserNavigationTabs";
import { ActivityTab } from "@/features/userdetails/ActivityTab";
import { BookingHistoryTab } from "@/features/userdetails/BookingHistoryTab";
import { BlockUserModal, ConfirmationModal } from "@/components/ui/ActionModals";
import { useNotification } from "@/hooks/useNotification";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  useGetUserByIdQuery,
  useBlockUserMutation,
  useDeleteUserMutation,
} from "@/api/features/adminUserManagement/adminUserManagementApiSlice";
import LoadingPage from "@/components/ui/LoadingPage";

export default function UserDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState("info");
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch user details from API
  const {
    data: userData,
    isLoading,
    error,
  } = useGetUserByIdQuery(id || "", {
    skip: !id,
  });

  const [blockUserMutation] = useBlockUserMutation();
  const [deleteUserMutation] = useDeleteUserMutation();

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <LoadingPage />
      </MainLayout>
    );
  }

  // Error or not found state
  if (error || !userData?.user) {
    return (
      <MainLayout>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>
              User Not Found
            </h2>
            <p className='text-gray-600 mb-4'>
              {error && typeof error === 'object' && 'data' in (error as object)
                ? ((error as any).data as { message?: string })?.message ||
                  "The user you're looking for doesn't exist."
                : "The user you're looking for doesn't exist."}
            </p>
            <button
              onClick={() => navigate("/users")}
              className='px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors'
            >
              Back to Users
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const apiUser = userData.user;

  // Map role from API to display format
  const getDisplayRole = (role: "HOST" | "GUEST" | "HOST_AND_GUEST"): string => {
    if (role === "HOST_AND_GUEST") return "Host & Guest";
    if (role === "HOST") return "Host";
    return "Guest";
  };

  // Generate avatar URL
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(apiUser.name)}&background=0e7490&color=fff&size=128`;

  // Transform the user data to match the component interfaces
  const userProfile = {
    id: apiUser.userId,
    name: apiUser.name,
    role: getDisplayRole(apiUser.role),
    avatar: avatarUrl,
  };

  const userStats = {
    activeBookings: apiUser.activeBookings,
    completedBookings: apiUser.completedBookings,
    cancelledBookings: apiUser.cancelledBookings,
    totalEarnings: "$0", // API doesn't provide earnings
  };

  // Map verification status
  const verificationStatus: "verified" | "pending" | "rejected" = apiUser.accountDisabled
    ? "rejected"
    : apiUser.isVerified
    ? "verified"
    : "pending";

  const personalInfo = {
    fullName: apiUser.name,
    email: apiUser.email,
    phoneNumber: apiUser.phoneNo || "Not provided",
    role: getDisplayRole(apiUser.role),
    verificationStatus,
    accountDisabled: apiUser.accountDisabled,
  };

  const handleDeleteUser = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteUser = async () => {
    if (!id) return;

    try {
      setShowDeleteModal(false);

      // Call the API to delete the user
      await deleteUserMutation(id).unwrap();

      // Show success notification
      showNotification({
        type: "success",
        title: "User Deleted Successfully",
        message: `${apiUser.name} and all related data have been permanently deleted from the system.`,
        duration: 5000,
      });

      // Redirect to users list after a short delay
      setTimeout(() => {
        navigate("/users");
      }, 1500);
    } catch (error: unknown) {
      console.error("Error deleting user:", error);

      // Extract error message
      let errorMessage = "There was an error deleting the user. Please try again.";
      if (error && typeof error === "object" && "data" in error) {
        const errorData = error.data as { message?: string };
        if (errorData?.message) {
          errorMessage = errorData.message;
        }
      }

      // Show error notification
      showNotification({
        type: "error",
        title: "Failed to Delete User",
        message: errorMessage,
        duration: 5000,
      });
    }
  };

  const handleBlockUser = () => {
    if (apiUser.accountDisabled) {
      showNotification({
        type: "info",
        title: "User Already Blocked",
        message: "This user account is already blocked.",
        duration: 3000,
      });
      return;
    }
    setShowBlockModal(true);
  };

  const handleConfirmBlockUser = async (reason: string) => {
    if (!id) return;

    try {
      setShowBlockModal(false);

      // Call the API to block the user
      await blockUserMutation({
        userId: id,
        reason: reason.trim(),
      }).unwrap();

      // Show success notification
      showNotification({
        type: "success",
        title: "User Blocked Successfully",
        message: `${apiUser.name} has been blocked and will no longer have access to their account.`,
        duration: 5000,
      });
    } catch (error: unknown) {
      console.error("Error blocking user:", error);

      // Extract error message
      let errorMessage = "There was an error blocking the user. Please try again.";
      if (error && typeof error === "object" && "data" in error) {
        const errorData = error.data as { message?: string };
        if (errorData?.message) {
          errorMessage = errorData.message;
        }
      }

      // Show error notification
      showNotification({
        type: "error",
        title: "Failed to Block User",
        message: errorMessage,
        duration: 5000,
      });
    }
  };

  return (
    <MainLayout>
      <div className='space-y-6'>
        {/* Page Header with Actions */}

        <PageTitle
          title='User Management'
          subtitle='View, verify, and manage all registered guests and hosts'
        />
        <div className='flex items-center justify-end space-x-3'>
          <button
            onClick={handleDeleteUser}
            className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2'
          >
            <Trash2 className='w-4 h-4' />
            <span>Delete User</span>
          </button>
          <button
            onClick={handleBlockUser}
            disabled={apiUser.accountDisabled}
            className={`px-4 py-2 rounded-lg transition-colors ${
              apiUser.accountDisabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-primary-600 text-white hover:bg-primary-700"
            }`}
          >
            {apiUser.accountDisabled ? "User Already Blocked" : "Block User"}
          </button>
        </div>

        {/* User Profile Header */}
        <Card
          className='py-4 px-6'
          style={{ boxShadow: "0px 3px 3px 0px #00000026" }}
        >
          <UserProfileHeader user={userProfile} />
          {/* Navigation Tabs */}
          <UserNavigationTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </Card>

        {/* Content based on active tab */}
        {activeTab === "info" && (
          <>
            {/* User Stats Cards */}
            <UserStatsCards stats={userStats} />
            <PersonalInformationSection userInfo={personalInfo} />
          </>
        )}

        {activeTab === "activity" && <ActivityTab userId={apiUser.userId} />}

        {activeTab === "history" && <BookingHistoryTab userId={apiUser.userId} />}
      </div>

      {/* Block User Modal */}
      <BlockUserModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        userName={apiUser.name}
        onConfirm={handleConfirmBlockUser}
      />

      {/* Delete User Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title='Delete User'
        message={`Are you sure you want to delete ${apiUser.name}? This action cannot be undone. All user data including bookings, reviews, favourites, listings, and images will be permanently deleted.`}
        confirmLabel='Delete User'
        cancelLabel='Cancel'
        onConfirm={handleConfirmDeleteUser}
        variant='destructive'
      />
    </MainLayout>
  );
}

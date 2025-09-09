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
import { BlockUserModal } from "@/components/ui/ActionModals";
import { userMgmtData } from "@/data/userMgmtData";
import { useNotification } from "@/hooks/useNotification";
import { Upload } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function UserDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState("info");
  const [showBlockModal, setShowBlockModal] = useState(false);

  // Find the user by ID from the existing userMgmtData
  const user = userMgmtData.users.find((u) => u.id === id);

  if (!user) {
    return (
      <MainLayout>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>
              User Not Found
            </h2>
            <p className='text-gray-600 mb-4'>
              The user you're looking for doesn't exist.
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

  // Transform the user data to match the component interfaces
  const userProfile = {
    id: user.id,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
  };

  const userStats = {
    activeBookings: 3,
    completedBookings: 20,
    cancelledBookings: 2,
    totalEarnings: "$1,000",
  };

  const personalInfo = {
    fullName: user.name,
    email: user.email,
    phoneNumber: "08167898767",
    gender: "Male",
    location: "Lagos, Nigeria",
    role: user.role,
    verificationStatus: user.status.toLowerCase() as
      | "verified"
      | "pending"
      | "rejected",
  };

  const handleExport = () => {
    showNotification({
      type: "info",
      title: "Export Started",
      message: `Exporting ${user.name}'s data...`,
    });
  };

  const handleBlockUser = () => {
    setShowBlockModal(true);
  };

  const handleConfirmBlockUser = async (reason: string) => {
    try {
      // Here you would make an API call to block the user
      console.log("Blocking user:", user.name, "Reason:", reason);

      setShowBlockModal(false);

      // Simulate API call
      // await blockUserAPI(user.id, reason);

      // Show success notification
      showNotification({
        type: "success",
        title: "User Blocked Successfully",
        message: `${user.name} has been blocked and will no longer have access to their account.`,
        duration: 5000,
      });
    } catch (error) {
      console.error("Error blocking user:", error);
      // Show error notification
      showNotification({
        type: "error",
        title: "Failed to Block User",
        message: "There was an error blocking the user. Please try again.",
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
            onClick={handleExport}
            className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2'
          >
            <span>Export</span>
            <Upload className='w-4 h-4 ml-2' />
          </button>
          <button
            onClick={handleBlockUser}
            className='px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors'
          >
            Block User
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

        {activeTab === "activity" && <ActivityTab userId={user.id} />}

        {activeTab === "history" && <BookingHistoryTab userId={user.id} />}
      </div>

      {/* Block User Modal */}
      <BlockUserModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        userName={user.name}
        onConfirm={handleConfirmBlockUser}
      />
    </MainLayout>
  );
}

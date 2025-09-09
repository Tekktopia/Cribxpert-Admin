import { MainLayout } from "../components/layout/MainLayout";
import { UserMgmtGrid } from "../features/usermgmt/UserMgmtGrid";
import { EmptyState } from "@/components/layout/EmptyState";
import { userMgmtData } from "../data/userMgmtData";
import PageTitle from "../components/layout/PageTitle";

export default function UsersMgmt() {
  // State to toggle between populated and empty view (for demo purposes)
  const isPopulated = true;

  return (
    <MainLayout>
      <div className='space-y-6'>
        {/* Page Header */}
        <PageTitle
          title='User Management'
          subtitle='View, verify, and manage all registered guests and hosts'
        />

        {/* Main Content */}
        {isPopulated ? (
          <UserMgmtGrid data={userMgmtData} />
        ) : (
          <EmptyState
            iconUrl='/svg/users.svg'
            title='No users yet'
            subtitle='When users register as guests or hosts, they will appear here for management.'
          />
        )}
      </div>
    </MainLayout>
  );
}

import { UserMgmtGrid } from "../features/usermgmt/UserMgmtGrid";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { userMgmtData } from "../data/userMgmtData";

export default function UsersMgmt() {
  // State to toggle between populated and empty view (for demo purposes)
  const isPopulated = true;

  return (
    <PageWrapper
      title='User Management'
      subtitle='View, verify, and manage all registered guests and hosts'
      isPopulated={isPopulated}
      emptyState={{
        iconUrl: "/svg/users.svg",
        title: "No users yet",
        subtitle:
          "Users will appear here once they sign up as guests or hosts.",
      }}
    >
      <UserMgmtGrid data={userMgmtData} />
    </PageWrapper>
  );
}

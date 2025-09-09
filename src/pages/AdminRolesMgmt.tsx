import { PageWrapper } from "@/components/layout/PageWrapper";

export default function AdminRolesMgmt() {
  return (
    <PageWrapper
      title='Admin Roles & Permissions'
      subtitle='Manage admin roles and assign access rights for platform operations.'
      isPopulated={false}
      emptyState={{
        iconUrl: "/svg/users.svg", // Using users SVG as it's appropriate for admin management
        title: "No admin roles configured yet",
        subtitle:
          "Admin role management and permission controls will appear here once you start configuring access levels.",
      }}
    >
      {/* Future admin roles management content will go here */}
    </PageWrapper>
  );
}

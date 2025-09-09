import { PageWrapper } from "@/components/layout/PageWrapper";

export default function Settings() {
  return (
    <PageWrapper
      title='Settings'
      subtitle='Configure platform settings and manage admin roles'
      isPopulated={false}
      emptyState={{
        iconUrl: "/svg/users.svg", // Using users SVG for settings/configuration
        title: "Settings will appear here",
        subtitle:
          "Platform configuration options and admin tools will be available here.",
      }}
    >
      {/* Future settings content will go here */}
    </PageWrapper>
  );
}

import { PageWrapper } from "@/components/layout/PageWrapper";
import { LoadingSpinner } from "./LoadingSpinner";

export default function Analytics() {
  return (
    <PageWrapper
      title=''
      subtitle=''
      isPopulated={true}
    >
        <div className='flex items-center justify-center min-h-[400px]'>
            <LoadingSpinner/>
        </div>
    </PageWrapper>
  );
}

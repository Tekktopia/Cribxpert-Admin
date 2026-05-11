import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { clearSession } from "@/store/slices/authSlice";
import { supabase } from "@/lib/supabase";
import { MainLayout } from "@/components/layout/MainLayout";
import { ConfirmationModal } from "@/components/ui/ActionModals";
import { SvgIcon } from "@/components/ui/SvgIcon";

export default function LogOut() {
  const [showModal, setShowModal] = useState(true);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // If user cancels, redirect back to dashboard
  const handleCancel = () => {
    setShowModal(false);
    navigate("/dashboard");
  };

  // Handle actual logout
  const handleLogout = async () => {
    setShowModal(false);
    await supabase.auth.signOut();
    dispatch(clearSession());
    navigate("/login", { replace: true });
  };

  // Auto-redirect if modal is closed without action
  useEffect(() => {
    if (!showModal) {
      const timer = setTimeout(() => {
        navigate("/dashboard");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showModal, navigate]);

  return (
    <MainLayout>
      <div className='space-y-6'>
        {/* Logout Confirmation Modal */}
        <ConfirmationModal
          isOpen={showModal}
          onClose={handleCancel}
          title="You're about to log out"
          confirmLabel='Logout'
          cancelLabel='Cancel'
          onConfirm={handleLogout}
          variant='destructive'
          icon={
            <SvgIcon
              src='/svg/exit.svg'
              width={128}
              height={128}
              className=''
            />
          }
        />
      </div>
    </MainLayout>
  );
}

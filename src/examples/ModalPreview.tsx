import { useState } from "react";
import {
  BlockUserModal,
  SendNotificationModal,
  ConfirmationModal,
} from "../components/ui/ActionModals";

export function ModalPreview() {
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  return (
    <div className='p-8 space-y-4'>
      <h1 className='text-2xl font-bold mb-6'>Modal Preview</h1>

      <div className='space-x-4'>
        <button
          onClick={() => setShowBlockModal(true)}
          className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700'
        >
          Show Block User Modal
        </button>

        <button
          onClick={() => setShowNotificationModal(true)}
          className='px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700'
        >
          Show Send Notification Modal
        </button>

        <button
          onClick={() => setShowResetModal(true)}
          className='px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700'
        >
          Show Reset Session Modal
        </button>
      </div>

      {/* Block User Modal */}
      <BlockUserModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        userName='Tope Akinola'
        onConfirm={(reason) => {
          console.log("Block user:", reason);
          setShowBlockModal(false);
        }}
      />

      {/* Send Notification Modal */}
      <SendNotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        userName='Tope Akinola'
        onSend={(message) => {
          console.log("Send notification:", message);
          setShowNotificationModal(false);
        }}
      />

      {/* Reset Session Modal */}
      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title='Reset Session'
        message='Are you sure you want to reset Tope Akinola session? This will log them out from all devices and they will need to sign in again.'
        confirmLabel='Reset Session'
        onConfirm={() => {
          console.log("Reset session");
          setShowResetModal(false);
        }}
        variant='destructive'
      />
    </div>
  );
}

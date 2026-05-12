import { useState, useEffect } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { CheckCircle2, Save, Loader2, Eye, EyeOff, Lock, Circle } from "lucide-react";
import { cn } from "@/utils/cn";
import { useAppSelector } from "@/store/hooks";
import { selectCurrentUser as selectUser } from "@/store/slices/authSlice";
import {
  useGetAdminProfileQuery,
  useUpdateAdminProfileMutation,
  useChangeAdminPasswordMutation,
} from "@/api/features/adminSettings/adminSettingsApiSlice";

type SettingsTab = "general" | "notifications" | "security" | "listings";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "general", label: "General Settings" },
  { id: "notifications", label: "Notifications" },
  { id: "security", label: "Security" },
  { id: "listings", label: "Listings & Bookings" },
];

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 border-b border-gray-100 last:border-0 last:pb-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0 sm:ml-4">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
        checked ? "bg-primary-600" : "bg-gray-200"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition",
          checked ? "translate-x-5" : "translate-x-1"
        )}
      />
    </button>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // General (logged-in user profile)
  const user = useAppSelector(selectUser);
  const { data: profileData } = useGetAdminProfileQuery();
  const [updateAdminProfile] = useUpdateAdminProfileMutation();
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    const apiUser = profileData?.user;
    const u = user as any;
    const name =
      (apiUser?.fullName as string) ||
      u?.fullName ||
      u?.name ||
      "";
    const phone =
      (apiUser?.phoneNo as string) || u?.phoneNo || "";
    setFullName(name);
    setPhoneNumber(phone);

    if (typeof apiUser?.twoFactorAuthentication === "boolean") {
      setRequire2FA(apiUser.twoFactorAuthentication);
    }
    if (typeof apiUser?.bookingsUpdates === "boolean") {
      setBookingAlerts(apiUser.bookingsUpdates);
    }
    if (typeof apiUser?.newListingSubmission === "boolean") {
      setListingAlerts(apiUser.newListingSubmission);
    }
    if (typeof apiUser?.emailAlerts === "boolean") {
      setEmailAlerts(apiUser.emailAlerts);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData?.user, user]);

  const lastLoginDisplay = (() => {
    const raw =
      (profileData?.user.lastLogin as string | undefined) ||
      ((user as any)?.lastLogin as string | undefined);
    if (!raw) return "Not available";
    try {
      const date = new Date(raw);
      return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return raw;
    }
  })();

  // Notifications
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [listingAlerts, setListingAlerts] = useState(true);
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [notificationsError, setNotificationsError] = useState<string | null>(
    null
  );
  const [notificationsSaving, setNotificationsSaving] = useState(false);

  // Security
  const [require2FA, setRequire2FA] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [changePassword] = useChangeAdminPasswordMutation();

  // Platform
  const [listingApproval, setListingApproval] = useState(true);
  const [defaultCancellation, setDefaultCancellation] = useState("moderate");

  // Derived password strength and match checks
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasSymbol = /[^A-Za-z0-9]/.test(newPassword);
  const passwordsMatch =
    newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setSaveError(null);
    try {
      await updateAdminProfile({
        fullName,
        phoneNo: phoneNumber,
      }).unwrap();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      const message =
        err?.data?.message ||
        err?.error ||
        "There was a problem saving your settings. Please try again.";
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  const updateNotifications = async (updates: {
    emailAlerts?: boolean;
    bookingsUpdates?: boolean;
    newListingSubmission?: boolean;
  }) => {
    setNotificationsSaving(true);
    setNotificationsError(null);
    try {
      await updateAdminProfile(updates).unwrap();
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      const message =
        err?.data?.message ||
        err?.error ||
        "There was a problem updating your notification settings.";
      setNotificationsError(message);
    } finally {
      setNotificationsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasSymbol) {
      setPasswordError(
        "New password must be at least 8 characters and include uppercase, lowercase, and a symbol."
      );
      return;
    }

    if (!passwordsMatch) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setPasswordUpdating(true);
    setPasswordUpdated(false);
    try {
      await changePassword({
        currentPassword,
        newPassword,
      }).unwrap();
      setPasswordUpdated(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordUpdated(false), 3000);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      const message =
        err?.data?.message ||
        err?.error ||
        "There was a problem updating your password. Please try again.";
      setPasswordError(message);
    } finally {
      setPasswordUpdating(false);
    }
  };

  return (
    <PageWrapper
      title="Settings"
      subtitle="Configure platform settings and manage admin roles"
      isPopulated={true}
      showDefaultHeader={true}
    >
      <div className="space-y-6">
        {/* Tab navigation */}
        <div className="flex flex-wrap gap-1 border-b border-gray-200 pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors duration-200 ease-out focus:outline-none",
                activeTab === tab.id
                  ? "bg-primary-600 text-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <div className="border border-[#EBEBEB] rounded-lg bg-white p-4 sm:p-6 min-h-[320px] overflow-hidden">
          <div key={activeTab} className="animate-settings-fade-in">
          {activeTab === "general" && (
            <div className="space-y-1">
              <SettingRow
                label="Full name"
                description="Your display name in the admin panel"
              >
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full sm:w-64 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent placeholder-gray-400"
                />
              </SettingRow>
              <SettingRow
                label="Phone number"
                description="Your contact phone number"
              >
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +234 800 000 0000"
                  className="w-full sm:w-64 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent placeholder-gray-400"
                />
              </SettingRow>
              <SettingRow
                label="Last login"
                description="When you last signed in"
              >
                <div className="w-full sm:w-64 px-3 py-2 rounded-lg text-sm text-gray-700 bg-gray-50 border border-gray-200">
                  {lastLoginDisplay}
                </div>
              </SettingRow>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-1">
              <SettingRow
                label="Email alerts"
                description="Receive important updates by email"
              >
                <Toggle
                  checked={emailAlerts}
                  onChange={(v) => {
                    setEmailAlerts(v);
                    updateNotifications({ emailAlerts: v });
                  }}
                  disabled={notificationsSaving}
                />
              </SettingRow>
              <SettingRow
                label="New listing submissions"
                description="Alert when a new listing is submitted for review"
              >
                <Toggle
                  checked={listingAlerts}
                  onChange={(v) => {
                    setListingAlerts(v);
                    updateNotifications({ newListingSubmission: v });
                  }}
                  disabled={notificationsSaving}
                />
              </SettingRow>
              <SettingRow
                label="Booking updates"
                description="Alerts for new bookings and cancellations"
              >
                <Toggle
                  checked={bookingAlerts}
                  onChange={(v) => {
                    setBookingAlerts(v);
                    updateNotifications({ bookingsUpdates: v });
                  }}
                  disabled={notificationsSaving}
                />
              </SettingRow>
              {notificationsError && (
                <p className="text-xs text-red-600 mt-1">{notificationsError}</p>
              )}
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <SettingRow
                label="Require two-factor authentication"
                description="Admins must use 2FA to sign in"
              >
                <Toggle checked={require2FA} onChange={setRequire2FA} />
              </SettingRow>

              {/* Change password form */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-primary-600" />
                  <h3 className="text-sm font-semibold text-gray-900">
                    Change password
                  </h3>
                </div>
                <form
                  onSubmit={handleChangePassword}
                  className="space-y-4 max-w-md"
                >
                  <div>
                    <label
                      htmlFor="current-password"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Current password
                    </label>
                    <div className="relative">
                      <input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full pl-3 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        placeholder="Enter current password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={
                          showCurrentPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="new-password"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      New password
                    </label>
                    <div className="relative">
                      <input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPasswordError(null);
                        }}
                        className="w-full pl-3 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        placeholder="At least 8 characters"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={
                          showNewPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="confirm-password"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Confirm new password
                    </label>
                    <div className="relative">
                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setPasswordError(null);
                        }}
                        className="w-full pl-3 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        placeholder="Confirm new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password requirements */}
                  <div className="space-y-1 text-xs mt-1">
                    <div className="flex items-center gap-2">
                      {hasMinLength ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-gray-300" />
                      )}
                      <span
                        className={
                          hasMinLength ? "text-emerald-600" : "text-gray-500"
                        }
                      >
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasUppercase ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-gray-300" />
                      )}
                      <span
                        className={
                          hasUppercase ? "text-emerald-600" : "text-gray-500"
                        }
                      >
                        Includes an uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasLowercase ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-gray-300" />
                      )}
                      <span
                        className={
                          hasLowercase ? "text-emerald-600" : "text-gray-500"
                        }
                      >
                        Includes a lowercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasSymbol ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-gray-300" />
                      )}
                      <span
                        className={
                          hasSymbol ? "text-emerald-600" : "text-gray-500"
                        }
                      >
                        Includes a symbol (e.g. !@#$)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      {passwordsMatch ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-gray-300" />
                      )}
                      <span
                        className={
                          passwordsMatch ? "text-emerald-600" : "text-gray-500"
                        }
                      >
                        {passwordsMatch
                          ? "Passwords match"
                          : "Passwords must match"}
                      </span>
                    </div>
                  </div>
                  {passwordError && (
                    <p className="text-sm text-red-600">{passwordError}</p>
                  )}
                  {passwordUpdated && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Password updated successfully.
                    </p>
                  )}
                  <Button
                    type="submit"
                    disabled={
                      passwordUpdating ||
                      !hasMinLength ||
                      !hasUppercase ||
                      !hasLowercase ||
                      !hasSymbol ||
                      !passwordsMatch
                    }
                    className="bg-primary-600 hover:bg-primary-700 text-white border-0"
                  >
                    {passwordUpdating ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </span>
                    ) : (
                      "Update password"
                    )}
                  </Button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "listings" && (
            <div className="space-y-1">
              <SettingRow
                label="Listing approval required"
                description="New listings must be approved by an admin before going live"
              >
                <Toggle
                  checked={listingApproval}
                  onChange={setListingApproval}
                />
              </SettingRow>
              <SettingRow
                label="Default cancellation policy"
                description="Applied to new listings"
              >
                <CustomSelect
                  value={defaultCancellation}
                  onChange={(e) => setDefaultCancellation(e.target.value)}
                  className="sm:w-56"
                >
                  <option value="flexible">Flexible</option>
                  <option value="moderate">Moderate</option>
                  <option value="strict">Strict</option>
                </CustomSelect>
              </SettingRow>
            </div>
          )}
          </div>
        </div>

        {/* Footer / save behaviour */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-gray-200">
          {activeTab === "general" ? (
            <>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-gray-500">
                  Changes to your name and phone number are saved to your admin profile.
                </p>
                {saveError && (
                  <p className="text-sm text-red-600">{saveError}</p>
                )}
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary-600 hover:bg-primary-700 text-white border-0 min-w-[120px]"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </span>
                ) : saved ? (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Saved
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />
                    Save changes
                  </span>
                )}
              </Button>
            </>
          ) : activeTab === "notifications" ? (
            <div className="flex flex-col gap-1">
              <p className="text-sm text-gray-500">
                Notification preferences are updated automatically when you toggle them.
              </p>
              {notificationsSaving && (
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Updating notifications...
                </p>
              )}
            </div>
          ) : activeTab === "security" ? (
            <p className="text-sm text-gray-500">
              Security settings are applied immediately after you update your password.
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              Listing settings are currently local only and do not affect live listings yet.
            </p>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

import { useMemo, useState, useEffect } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { SearchAndFilters, type FilterConfig } from "@/components/ui/SearchAndFilters";
import { Modal } from "@/components/ui/Modal";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { Trash2, UserPlus, MoreVertical, KeyRound, Shield } from "lucide-react";
import { cn } from "@/utils/cn";
import {
  useGetAdminsQuery,
  useCreateAdminMutation,
  useDisableAdminMutation,
  useDeleteAdminMutation,
  useUpdateAdminRoleMutation,
  useResetUserPasswordMutation,
  type AdminManagementAdmin,
} from "@/api/features/adminManagement/adminManagementApiSlice";
import { useGetTicketGroupsQuery } from "@/api/features/ticket/ticketApiSlice";
import LoadingPage from "@/components/ui/LoadingPage";
import { supabase } from "@/lib/supabase";
import { GroupsManager } from "@/features/groups/GroupsManager";
import { useAppSelector } from "@/store/hooks";

type AdminStatus = "Active" | "Disabled";

type AccountType = "platform_admin" | "group_member";
type Tier = "supervisor" | "agent";
type PlatformTier = "admin" | "super_admin";

interface AdminFormState {
  fullName: string;
  email: string;
  password: string;
  accountType: AccountType;
  platformTier: PlatformTier;
  groupKey: string;
  tier: Tier;
}

interface EditRoleFormState {
  accountType: AccountType;
  platformTier: PlatformTier;
  groupKey: string;
  tier: Tier;
}

const MIN_PASSWORD_LEN = 8;

function mapApiAdminToLocal(admin: AdminManagementAdmin) {
  const status: AdminStatus =
    admin.accountDisabled === true ? "Disabled" : "Active";
  let lastActive = "Never";
  if (admin.lastActive) {
    try {
      const date = new Date(admin.lastActive);
      lastActive = date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      lastActive = admin.lastActive;
    }
  }
  return {
    id: admin.id,
    name: admin.fullName,
    email: admin.email,
    role: admin.role,
    agentGroup: admin.agentGroup ?? null,
    status,
    lastActive,
  };
}

function roleLabel(
  role: AdminManagementAdmin["role"],
  agentGroup: string | null,
  groupName: (key: string) => string
): string {
  switch (role) {
    case "SuperAdmin":      return "Super Admin";
    case "Admin":           return "Admin";
    case "CSRAdmin":        return "CSR Supervisor";
    case "CSRAgent":        return "CSR Agent";
    case "FinanceAdmin":    return "Finance Supervisor";
    case "FinanceAgent":    return "Finance Agent";
    case "GroupSupervisor": return `${agentGroup ? groupName(agentGroup) : "Group"} Supervisor`;
    case "GroupAgent":      return `${agentGroup ? groupName(agentGroup) : "Group"} Agent`;
    default:                return role;
  }
}

function roleBadgeClass(role: AdminManagementAdmin["role"]): string {
  switch (role) {
    case "SuperAdmin":   return "bg-purple-50 text-purple-700 border-purple-200";
    case "Admin":        return "bg-slate-50 text-slate-700 border-slate-200";
    case "FinanceAdmin":
    case "FinanceAgent": return "bg-amber-50 text-amber-700 border-amber-200";
    case "CSRAdmin":
    case "CSRAgent":     return "bg-teal-50 text-teal-700 border-teal-200";
    case "GroupSupervisor":
    case "GroupAgent":   return "bg-indigo-50 text-indigo-700 border-indigo-200";
    default:             return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

// Map UI form state → DB role + agentGroup
function resolveDbRole(
  accountType: AccountType,
  platformTier: PlatformTier,
  groupKey: string,
  tier: Tier
): { role: string; agentGroup: string | null } {
  if (accountType === "platform_admin") {
    return {
      role: platformTier === "super_admin" ? "superadmin" : "admin",
      agentGroup: null,
    };
  }
  // group_member
  if (groupKey === "csr") {
    return { role: tier === "supervisor" ? "csr_admin" : "csr_agent", agentGroup: "csr" };
  }
  if (groupKey === "finance") {
    return { role: tier === "supervisor" ? "finance_admin" : "finance_agent", agentGroup: "finance" };
  }
  return { role: tier === "supervisor" ? "group_supervisor" : "group_agent", agentGroup: groupKey };
}

// Map existing DB role back to edit form state
function roleToEditForm(
  role: AdminManagementAdmin["role"],
  agentGroup: string | null,
  fallbackGroupKey: string
): EditRoleFormState {
  if (role === "SuperAdmin") {
    return { accountType: "platform_admin", platformTier: "super_admin", groupKey: fallbackGroupKey, tier: "supervisor" };
  }
  if (role === "Admin") {
    return { accountType: "platform_admin", platformTier: "admin", groupKey: fallbackGroupKey, tier: "supervisor" };
  }
  // Group / legacy CSR / Finance roles
  const key = agentGroup ?? (role === "CSRAdmin" || role === "CSRAgent" ? "csr" : role === "FinanceAdmin" || role === "FinanceAgent" ? "finance" : fallbackGroupKey);
  const tier: Tier = (role === "CSRAdmin" || role === "FinanceAdmin" || role === "GroupSupervisor") ? "supervisor" : "agent";
  return { accountType: "group_member", platformTier: "admin", groupKey: key, tier };
}

export default function AdminRolesMgmt() {
  const myRole = (useAppSelector(s => s.auth.profile?.role) ?? '').toLowerCase();
  const isSuperAdmin = myRole === 'superadmin';
  const { data, isLoading, error, refetch } = useGetAdminsQuery();
  const { data: groups = [] } = useGetTicketGroupsQuery();
  const [createAdmin] = useCreateAdminMutation();
  const [disableAdmin] = useDisableAdminMutation();
  const [deleteAdmin] = useDeleteAdminMutation();
  const [updateAdminRole, { isLoading: isUpdatingRole }] = useUpdateAdminRoleMutation();
  const [resetUserPassword, { isLoading: resettingPwd }] = useResetUserPasswordMutation();

  const groupName = useMemo(() => {
    const m = new Map(groups.map((g) => [g.key, g.name]));
    return (key: string) => m.get(key) ?? key;
  }, [groups]);

  const [admins, setAdmins] = useState<ReturnType<typeof mapApiAdminToLocal>[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [adminToRemove, setAdminToRemove] = useState<ReturnType<typeof mapApiAdminToLocal> | null>(null);
  const [adminToEdit, setAdminToEdit] = useState<ReturnType<typeof mapApiAdminToLocal> | null>(null);
  const [adminToResetPwd, setAdminToResetPwd] = useState<ReturnType<typeof mapApiAdminToLocal> | null>(null);
  const [newPwd, setNewPwd] = useState("");
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [editRoleMsg, setEditRoleMsg] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (!target.closest("[data-admin-menu='true']")) {
        setOpenMenuId(null);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => { window.removeEventListener("mousedown", handleClickOutside); };
  }, []);

  const emptyForm: AdminFormState = {
    fullName: "",
    email: "",
    password: "",
    accountType: "platform_admin",
    platformTier: "admin",
    groupKey: "",
    tier: "supervisor",
  };
  const [formState, setFormState] = useState<AdminFormState>(emptyForm);

  const defaultEditForm: EditRoleFormState = {
    accountType: "platform_admin",
    platformTier: "admin",
    groupKey: "",
    tier: "supervisor",
  };
  const [editForm, setEditForm] = useState<EditRoleFormState>(defaultEditForm);

  useEffect(() => {
    if (data?.admins) {
      setAdmins(data.admins.map(mapApiAdminToLocal));
    }
  }, [data?.admins]);

  useEffect(() => {
    const channel = supabase
      .channel('admin-profiles-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => { refetch(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refetch]);

  const handleOpenAddModal = () => {
    setFormState({ ...emptyForm, groupKey: groups[0]?.key ?? "" });
    setIsAddModalOpen(true);
  };

  const handleOpenEditRole = (admin: ReturnType<typeof mapApiAdminToLocal>) => {
    setOpenMenuId(null);
    const fallback = groups[0]?.key ?? "";
    setEditForm(roleToEditForm(admin.role, admin.agentGroup, fallback));
    setEditRoleMsg(null);
    setAdminToEdit(admin);
  };

  const handleAddAdmin = async () => {
    const trimmedName = formState.fullName.trim();
    const trimmedEmail = formState.email.trim();
    const password = formState.password;
    if (!trimmedName || !trimmedEmail || password.length < MIN_PASSWORD_LEN) return;

    const newAdminPayload =
      formState.accountType === "group_member"
        ? { fullName: trimmedName, email: trimmedEmail, password, groupKey: formState.groupKey, tier: formState.tier }
        : {
            fullName: trimmedName,
            email: trimmedEmail,
            password,
            adminType: formState.platformTier === "super_admin" ? "SuperAdmin" as const : "Admin" as const,
          };

    try {
      setIsCreatingAdmin(true);
      await createAdmin(newAdminPayload).unwrap();
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Error creating admin:", err);
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleSaveRoleEdit = async () => {
    if (!adminToEdit) return;
    setEditRoleMsg(null);
    const { role, agentGroup } = resolveDbRole(
      editForm.accountType, editForm.platformTier, editForm.groupKey, editForm.tier
    );
    try {
      await updateAdminRole({ targetUserId: adminToEdit.id, role, agentGroup }).unwrap();
      setAdminToEdit(null);
    } catch (err: unknown) {
      const msg = (err as { error?: string })?.error ?? (err instanceof Error ? err.message : "Failed to update role");
      setEditRoleMsg(msg);
    }
  };

  const handleConfirmRemove = () => {
    if (!adminToRemove) return;
    deleteAdmin(adminToRemove.id)
      .unwrap()
      .then(() => { setAdminToRemove(null); })
      .catch((err) => { console.error("Error deleting admin:", err); });
  };

  const openResetPwd = (admin: ReturnType<typeof mapApiAdminToLocal>) => {
    setAdminToResetPwd(admin);
    setNewPwd("");
    setResetMsg(null);
  };

  const handleConfirmResetPwd = async () => {
    if (!adminToResetPwd || newPwd.length < MIN_PASSWORD_LEN) return;
    setResetMsg(null);
    try {
      await resetUserPassword({ userId: adminToResetPwd.id, password: newPwd }).unwrap();
      setResetMsg(`Password updated for ${adminToResetPwd.name}.`);
      setNewPwd("");
      setTimeout(() => { setAdminToResetPwd(null); setResetMsg(null); }, 1800);
    } catch (err: unknown) {
      setResetMsg((err as { data?: { error?: string }; error?: string })?.data?.error ?? (err as { error?: string })?.error ?? (err instanceof Error ? err.message : "Failed to reset password"));
    }
  };

  const filters: FilterConfig[] = [
    {
      key: "role",
      label: "Role",
      value: roleFilter,
      onChange: setRoleFilter,
      options: [
        { value: "superadmin", label: "Super Admin" },
        { value: "admin",      label: "Admin" },
        ...groups.map((g) => ({ value: `group:${g.key}`, label: g.name })),
      ],
    },
    {
      key: "status",
      label: "Status",
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: "active", label: "Active" },
        { value: "disabled", label: "Disabled" },
      ],
    },
  ];

  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) => {
      const matchesSearch =
        !searchValue ||
        admin.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchValue.toLowerCase());

      const effectiveGroup =
        admin.agentGroup ??
        (admin.role === "CSRAdmin" || admin.role === "CSRAgent"
          ? "csr"
          : admin.role === "FinanceAdmin" || admin.role === "FinanceAgent"
          ? "finance"
          : null);

      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "admin" && admin.role === "Admin") ||
        (roleFilter === "superadmin" && admin.role === "SuperAdmin") ||
        (roleFilter.startsWith("group:") &&
          effectiveGroup === roleFilter.slice("group:".length));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && admin.status === "Active") ||
        (statusFilter === "disabled" && admin.status === "Disabled");

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [admins, searchValue, roleFilter, statusFilter]);

  const isPopulated = !isLoading && filteredAdmins.length > 0;

  if (isLoading) return <LoadingPage />;

  if (error) {
    return (
      <PageWrapper
        title='Admin Management'
        subtitle='View and manage admin access for the platform.'
        isPopulated={false}
        emptyState={{
          iconUrl: "/svg/users.svg",
          title: "Unable to load admins",
          subtitle: "There was an error loading admin accounts. Please try again.",
        }}
      />
    );
  }

  return (
    <PageWrapper
      title='Admin Management'
      subtitle='View and manage admin access for the platform.'
      isPopulated={isPopulated}
      emptyState={{
        iconUrl: "/svg/users.svg",
        title: "No admin roles configured yet",
        subtitle: "Create the first admin to start managing platform access levels.",
      }}
    >
      {isPopulated && (
        <div className='space-y-6'>
          <SearchAndFilters
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            searchPlaceholder='Search by name or email'
            filters={filters}
            actionButtons={[
              {
                label: "Add admin",
                icon: <UserPlus className='w-4 h-4 ml-2' />,
                onClick: handleOpenAddModal,
                variant: "primary",
                className: "bg-primary-600 text-white border-primary-600 hover:bg-primary-700",
              },
            ]}
            resultsInfo={{
              total: admins.length,
              filtered: filteredAdmins.length,
              entityName: "admins",
            }}
          />

          <div className='-mx-4 sm:mx-0 overflow-x-visible overflow-y-visible'>
            <div className='w-full border border-[#EBEBEB] rounded-lg bg-white'>
              <div className='hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-[#E6EFF1] text-xs font-medium text-gray-500 uppercase tracking-wide'>
                <div className='col-span-4 text-left'>Admin</div>
                <div className='col-span-2 text-left'>Role</div>
                <div className='col-span-2 text-left'>Status</div>
                <div className='col-span-2 text-left'>Last active</div>
                <div className='col-span-2 text-right'>Actions</div>
              </div>

              <div className='divide-y divide-gray-100'>
                {filteredAdmins.map((admin) => (
                  <div
                    key={admin.id}
                    className={cn(
                      'px-4 sm:px-6 py-4 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-start md:items-center',
                      // Lift the open row above siblings so its dropdown isn't clipped
                      openMenuId === admin.id && 'relative z-20'
                    )}
                  >
                    <div className='md:col-span-4 flex flex-col'>
                      <span className='text-sm font-medium text-gray-900'>{admin.name}</span>
                      <span className='text-xs text-gray-500'>{admin.email}</span>
                    </div>

                    <div className='md:col-span-2 w-full'>
                      <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border', roleBadgeClass(admin.role))}>
                        {roleLabel(admin.role, admin.agentGroup, groupName)}
                      </span>
                    </div>

                    <div className='md:col-span-2 w-full'>
                      <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", admin.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600")}>
                        {admin.status}
                      </span>
                    </div>

                    <div className='md:col-span-2 text-sm text-gray-500'>{admin.lastActive}</div>

                    <div className='md:col-span-2 flex md:justify-end'>
                      <div className='relative' data-admin-menu='true'>
                        <Button
                          variant='outline'
                          size='sm'
                          className='border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center justify-center'
                          onClick={() => setOpenMenuId((prev) => prev === admin.id ? null : admin.id)}
                        >
                          <MoreVertical className='w-4 h-4' />
                        </Button>

                        {openMenuId === admin.id && (
                          <div className='absolute right-0 mt-2 w-44 rounded-lg border border-gray-200 bg-white shadow-xl ring-1 ring-black/5 z-50'>
                            <button
                              type='button'
                              className='w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50'
                              onClick={() => {
                                setOpenMenuId(null);
                                disableAdmin(admin.id).unwrap().catch((err) => console.error("Error disabling admin:", err));
                              }}
                            >
                              {admin.status === "Active" ? "Deactivate admin" : "Activate admin"}
                            </button>

                            {isSuperAdmin && (
                              <button
                                type='button'
                                className='w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 border-t border-gray-100 flex items-center gap-2'
                                onClick={() => handleOpenEditRole(admin)}
                              >
                                <Shield className='w-3.5 h-3.5' />
                                <span>Edit role</span>
                              </button>
                            )}

                            {isSuperAdmin && (
                              <button
                                type='button'
                                className='w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 border-t border-gray-100 flex items-center gap-2'
                                onClick={() => { setOpenMenuId(null); openResetPwd(admin); }}
                              >
                                <KeyRound className='w-3.5 h-3.5' />
                                <span>Reset password</span>
                              </button>
                            )}

                            <button
                              type='button'
                              className='w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 border-t border-gray-100 flex items-center gap-2'
                              onClick={() => { setOpenMenuId(null); setAdminToRemove(admin); }}
                            >
                              <Trash2 className='w-3.5 h-3.5' />
                              <span>Remove admin</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredAdmins.length === 0 && (
                  <div className='px-6 py-12 text-center text-sm text-gray-500'>
                    No admins match your search and filters.
                  </div>
                )}
              </div>
            </div>
          </div>

          {isSuperAdmin && <GroupsManager />}
        </div>
      )}

      {/* Add admin modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title='Add admin'
        description='Invite a new admin to manage the CribXpert platform.'
        size='md'
        headerAlign='left'
        actionsAlign='right'
        actions={[
          { label: "Cancel", onClick: () => setIsAddModalOpen(false), variant: "secondary" },
          {
            label: isCreatingAdmin ? "Adding..." : "Add admin",
            onClick: handleAddAdmin,
            variant: "primary",
            disabled:
              isCreatingAdmin ||
              !formState.fullName.trim() ||
              !formState.email.trim() ||
              formState.password.length < MIN_PASSWORD_LEN ||
              (formState.accountType === "group_member" && !formState.groupKey),
          },
        ]}
      >
        <div className='space-y-4 text-left'>
          <div>
            <label htmlFor='admin-name' className='block text-sm font-medium text-gray-700 mb-1'>Full name</label>
            <input
              id='admin-name'
              type='text'
              value={formState.fullName}
              onChange={(e) => setFormState((prev) => ({ ...prev, fullName: e.target.value }))}
              placeholder='Enter admin name'
              className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent'
            />
          </div>

          <div>
            <label htmlFor='admin-email' className='block text-sm font-medium text-gray-700 mb-1'>Email address</label>
            <input
              id='admin-email'
              type='email'
              value={formState.email}
              onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
              placeholder='admin@cribxpert.com'
              className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent'
            />
          </div>

          <div>
            <label htmlFor='admin-password' className='block text-sm font-medium text-gray-700 mb-1'>Password</label>
            <input
              id='admin-password'
              type='text'
              autoComplete='new-password'
              value={formState.password}
              onChange={(e) => setFormState((prev) => ({ ...prev, password: e.target.value }))}
              placeholder='Set a password for this admin'
              className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent'
            />
            <p className='mt-1 text-xs text-gray-500'>
              At least {MIN_PASSWORD_LEN} characters. Share it with the admin — no email is sent.
            </p>
          </div>

          <div>
            <label htmlFor='admin-account-type' className='block text-sm font-medium text-gray-700 mb-1'>Account type</label>
            <CustomSelect
              id='admin-account-type'
              value={formState.accountType}
              onChange={(e) => setFormState((prev) => ({ ...prev, accountType: e.target.value as AccountType }))}
            >
              <option value='platform_admin'>Platform Admin (full access)</option>
              <option value='group_member'>Group member (CSR, Finance, etc.)</option>
            </CustomSelect>
          </div>

          {formState.accountType === "platform_admin" && isSuperAdmin && (
            <div>
              <label htmlFor='admin-platform-tier' className='block text-sm font-medium text-gray-700 mb-1'>Admin level</label>
              <CustomSelect
                id='admin-platform-tier'
                value={formState.platformTier}
                onChange={(e) => setFormState((prev) => ({ ...prev, platformTier: e.target.value as PlatformTier }))}
              >
                <option value='admin'>Admin — full dashboard access</option>
                <option value='super_admin'>Super Admin — can manage admin accounts and roles</option>
              </CustomSelect>
            </div>
          )}

          {formState.accountType === "group_member" && (
            <>
              <div>
                <label htmlFor='admin-group' className='block text-sm font-medium text-gray-700 mb-1'>Group</label>
                {groups.length === 0 ? (
                  <p className='text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2'>
                    No groups exist yet. Create one in <strong>Ticket Groups</strong> below first.
                  </p>
                ) : (
                  <CustomSelect
                    id='admin-group'
                    value={formState.groupKey}
                    onChange={(e) => setFormState((prev) => ({ ...prev, groupKey: e.target.value }))}
                  >
                    {groups.map((g) => (
                      <option key={g.key} value={g.key}>{g.name}</option>
                    ))}
                  </CustomSelect>
                )}
              </div>

              <div>
                <label htmlFor='admin-tier' className='block text-sm font-medium text-gray-700 mb-1'>Tier</label>
                <CustomSelect
                  id='admin-tier'
                  value={formState.tier}
                  onChange={(e) => setFormState((prev) => ({ ...prev, tier: e.target.value as Tier }))}
                >
                  <option value='supervisor'>Supervisor</option>
                  <option value='agent'>Agent</option>
                </CustomSelect>
                <p className='mt-1 text-xs text-gray-500'>
                  <strong>Supervisors</strong> manage their group.{' '}
                  <strong>Agents</strong> handle tickets assigned to them.
                </p>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Edit role modal (SuperAdmin only) */}
      <Modal
        isOpen={!!adminToEdit}
        onClose={() => setAdminToEdit(null)}
        title='Edit role'
        description={adminToEdit ? `Change the role and permissions for ${adminToEdit.name}.` : ""}
        size='md'
        headerAlign='left'
        actionsAlign='right'
        actions={[
          { label: "Cancel", onClick: () => setAdminToEdit(null), variant: "secondary" },
          {
            label: isUpdatingRole ? "Saving..." : "Save changes",
            onClick: handleSaveRoleEdit,
            variant: "primary",
            disabled: isUpdatingRole || (editForm.accountType === "group_member" && !editForm.groupKey),
          },
        ]}
      >
        <div className='space-y-4 text-left'>
          <div>
            <label htmlFor='edit-account-type' className='block text-sm font-medium text-gray-700 mb-1'>Account type</label>
            <CustomSelect
              id='edit-account-type'
              value={editForm.accountType}
              onChange={(e) => setEditForm((prev) => ({ ...prev, accountType: e.target.value as AccountType }))}
            >
              <option value='platform_admin'>Platform Admin (full access)</option>
              <option value='group_member'>Group member (CSR, Finance, etc.)</option>
            </CustomSelect>
          </div>

          {editForm.accountType === "platform_admin" && (
            <div>
              <label htmlFor='edit-platform-tier' className='block text-sm font-medium text-gray-700 mb-1'>Admin level</label>
              <CustomSelect
                id='edit-platform-tier'
                value={editForm.platformTier}
                onChange={(e) => setEditForm((prev) => ({ ...prev, platformTier: e.target.value as PlatformTier }))}
              >
                <option value='admin'>Admin — full dashboard access</option>
                <option value='super_admin'>Super Admin — can manage admin accounts and roles</option>
              </CustomSelect>
            </div>
          )}

          {editForm.accountType === "group_member" && (
            <>
              <div>
                <label htmlFor='edit-group' className='block text-sm font-medium text-gray-700 mb-1'>Group</label>
                {groups.length === 0 ? (
                  <p className='text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2'>
                    No groups configured yet.
                  </p>
                ) : (
                  <CustomSelect
                    id='edit-group'
                    value={editForm.groupKey}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, groupKey: e.target.value }))}
                  >
                    {groups.map((g) => (
                      <option key={g.key} value={g.key}>{g.name}</option>
                    ))}
                  </CustomSelect>
                )}
              </div>

              <div>
                <label htmlFor='edit-tier' className='block text-sm font-medium text-gray-700 mb-1'>Tier</label>
                <CustomSelect
                  id='edit-tier'
                  value={editForm.tier}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, tier: e.target.value as Tier }))}
                >
                  <option value='supervisor'>Supervisor</option>
                  <option value='agent'>Agent</option>
                </CustomSelect>
              </div>
            </>
          )}

          {editRoleMsg && (
            <p className='text-xs text-red-600'>{editRoleMsg}</p>
          )}
        </div>
      </Modal>

      {/* Remove admin confirmation */}
      <Modal
        isOpen={!!adminToRemove}
        onClose={() => setAdminToRemove(null)}
        title='Remove admin access'
        description={
          adminToRemove
            ? `This will downgrade ${adminToRemove.name} to a regular user. They will lose admin dashboard access but can still log in to the CribXpert app.`
            : ""
        }
        size='md'
        headerAlign='left'
        actionsAlign='right'
        actions={[
          { label: "Cancel", onClick: () => setAdminToRemove(null), variant: "secondary" },
          { label: "Remove admin access", onClick: handleConfirmRemove, variant: "destructive" },
        ]}
      />

      {/* Reset password (SuperAdmin only) */}
      <Modal
        isOpen={!!adminToResetPwd}
        onClose={() => setAdminToResetPwd(null)}
        title='Reset password'
        description={
          adminToResetPwd
            ? `Set a new password for ${adminToResetPwd.name} (${adminToResetPwd.email}). No email is sent — share the new password directly.`
            : ""
        }
        size='md'
        headerAlign='left'
        actionsAlign='right'
        actions={[
          { label: "Cancel", onClick: () => setAdminToResetPwd(null), variant: "secondary" },
          {
            label: resettingPwd ? "Resetting..." : "Reset password",
            onClick: handleConfirmResetPwd,
            variant: "primary",
            disabled: resettingPwd || newPwd.length < MIN_PASSWORD_LEN,
          },
        ]}
      >
        <div className='space-y-2 text-left'>
          <label htmlFor='reset-pwd' className='block text-sm font-medium text-gray-700'>New password</label>
          <input
            id='reset-pwd'
            type='text'
            autoComplete='new-password'
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            placeholder={`At least ${MIN_PASSWORD_LEN} characters`}
            className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent'
          />
          {resetMsg && (
            <p className={`text-xs ${resetMsg.toLowerCase().includes("fail") || resetMsg.toLowerCase().includes("only") ? "text-red-600" : "text-emerald-600"}`}>
              {resetMsg}
            </p>
          )}
        </div>
      </Modal>
    </PageWrapper>
  );
}

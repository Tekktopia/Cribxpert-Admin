import { useMemo, useState, useEffect } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { SearchAndFilters, type FilterConfig } from "@/components/ui/SearchAndFilters";
import { Modal } from "@/components/ui/Modal";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { Trash2, UserPlus, MoreVertical } from "lucide-react";
import { cn } from "@/utils/cn";
import {
  useGetAdminsQuery,
  useCreateAdminMutation,
  useDisableAdminMutation,
  useDeleteAdminMutation,
  type AdminManagementAdmin,
  type CreateAdminRole,
} from "@/api/features/adminManagement/adminManagementApiSlice";
import LoadingPage from "@/components/ui/LoadingPage";

type AdminStatus = "Active" | "Disabled";

const CREATE_ADMIN_ROLES: { value: CreateAdminRole; label: string }[] = [
  { value: "Admin", label: "Admin" },
  { value: "FinanceAdmin", label: "Finance Admin" },
  { value: "CSRAdmin", label: "CSR Admin" },
];

interface AdminFormState {
  fullName: string;
  email: string;
  adminType: CreateAdminRole;
}

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
    status,
    lastActive,
  };
}

export default function AdminRolesMgmt() {
  const { data, isLoading, error } = useGetAdminsQuery();
  const [createAdmin] = useCreateAdminMutation();
  const [disableAdmin] = useDisableAdminMutation();
  const [deleteAdmin] = useDeleteAdminMutation();

  const [admins, setAdmins] = useState<ReturnType<typeof mapApiAdminToLocal>[]>(
    []
  );

  const [searchValue, setSearchValue] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [adminToRemove, setAdminToRemove] =
    useState<ReturnType<typeof mapApiAdminToLocal> | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (!target.closest("[data-admin-menu='true']")) {
        setOpenMenuId(null);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [formState, setFormState] = useState<AdminFormState>({
    fullName: "",
    email: "",
    adminType: "Admin",
  });

  // Sync local admins with API data
  useEffect(() => {
    if (data?.admins) {
      setAdmins(data.admins.map(mapApiAdminToLocal));
    }
  }, [data?.admins]);

  const handleOpenAddModal = () => {
    setFormState({ fullName: "", email: "", adminType: "Admin" });
    setIsAddModalOpen(true);
  };

  const handleAddAdmin = async () => {
    const trimmedName = formState.fullName.trim();
    const trimmedEmail = formState.email.trim();
    if (!trimmedName || !trimmedEmail) return;

    const newAdminPayload = {
      fullName: trimmedName,
      email: trimmedEmail,
      adminType: formState.adminType,
    };

    try {
      setIsCreatingAdmin(true);
      await createAdmin(newAdminPayload).unwrap();
      // Refresh via getAdmins refetch; local state will sync in useEffect
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Error creating admin:", err);
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleConfirmRemove = () => {
    if (!adminToRemove) return;
    deleteAdmin(adminToRemove.id)
      .unwrap()
      .then(() => {
        setAdminToRemove(null);
      })
      .catch((err) => {
        console.error("Error deleting admin:", err);
      });
  };

  const filters: FilterConfig[] = [
    {
      key: "role",
      label: "Role",
      value: roleFilter,
      onChange: setRoleFilter,
      options: [
        { value: "superadmin", label: "Super Admin" },
        { value: "admin", label: "Admin" },
        { value: "financeadmin", label: "Finance Admin" },
        { value: "csradmin", label: "CSR Admin" },
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

      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "admin" && admin.role === "Admin") ||
        (roleFilter === "superadmin" && admin.role === "SuperAdmin") ||
        (roleFilter === "financeadmin" && admin.role === "FinanceAdmin") ||
        (roleFilter === "csradmin" && admin.role === "CSRAdmin");

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && admin.status === "Active") ||
        (statusFilter === "disabled" && admin.status === "Disabled");

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [admins, searchValue, roleFilter, statusFilter]);

  const isPopulated = !isLoading && filteredAdmins.length > 0;

  if (isLoading) {
    return <LoadingPage />;
  }

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
        subtitle:
          "Create the first admin to start managing platform access levels.",
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
                className:
                  "bg-primary-600 text-white border-primary-600 hover:bg-primary-700",
              },
            ]}
            resultsInfo={{
              total: admins.length,
              filtered: filteredAdmins.length,
              entityName: "admins",
            }}
          />

          {/* Admins table */}
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
                    className='px-4 sm:px-6 py-4 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-start md:items-center'
                  >
                    <div className='md:col-span-4 flex flex-col'>
                    <span className='text-sm font-medium text-gray-900'>
                      {admin.name}
                    </span>
                    <span className='text-xs text-gray-500'>
                      {admin.email}
                    </span>
                    </div>

                    <div className='md:col-span-2 w-full'>
                      <span className='inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200'>
                        {admin.role}
                      </span>
                    </div>

                    <div className='md:col-span-2 w-full'>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                          admin.status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        )}
                      >
                        {admin.status}
                      </span>
                    </div>

                    <div className='md:col-span-2 text-sm text-gray-500'>
                      {admin.lastActive}
                    </div>

                    <div className='md:col-span-2 flex md:justify-end'>
                      <div className='relative z-10' data-admin-menu='true'>
                        <Button
                          variant='outline'
                          size='sm'
                          className='border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center justify-center'
                          onClick={() =>
                            setOpenMenuId((prev) =>
                              prev === admin.id ? null : admin.id
                            )
                          }
                        >
                          <MoreVertical className='w-4 h-4' />
                        </Button>
                        {openMenuId === admin.id && (
                          <div className='absolute right-0 mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-xl ring-1 ring-black/5 z-50'>
                            <button
                              type='button'
                              className='w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50'
                              onClick={() => {
                                setOpenMenuId(null);
                                disableAdmin(admin.id)
                                  .unwrap()
                                  .catch((err) =>
                                    console.error(
                                      "Error disabling admin:",
                                      err
                                    )
                                  );
                              }}
                            >
                              {admin.status === "Active"
                                ? "Deactivate admin"
                                : "Activate admin"}
                            </button>
                            <button
                              type='button'
                              className='w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 border-t border-gray-100 flex items-center gap-2'
                              onClick={() => {
                                setOpenMenuId(null);
                                setAdminToRemove(admin);
                              }}
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
          {
            label: "Cancel",
            onClick: () => setIsAddModalOpen(false),
            variant: "secondary",
          },
          {
            label: isCreatingAdmin ? "Adding..." : "Add admin",
            onClick: handleAddAdmin,
            variant: "primary",
            disabled:
              isCreatingAdmin ||
              !formState.fullName.trim() ||
              !formState.email.trim(),
          },
        ]}
      >
        <div className='space-y-4 text-left'>
          <div>
            <label
              htmlFor='admin-name'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Full name
            </label>
            <input
              id='admin-name'
              type='text'
              value={formState.fullName}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, fullName: e.target.value }))
              }
              placeholder='Enter admin name'
              className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent'
            />
          </div>

          <div>
            <label
              htmlFor='admin-email'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Email address
            </label>
            <input
              id='admin-email'
              type='email'
              value={formState.email}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder='admin@cribxpert.com'
              className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent'
            />
          </div>

          <div>
            <label
              htmlFor='admin-role'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Role
            </label>
            <CustomSelect
              id='admin-role'
              value={formState.adminType}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  adminType: e.target.value as CreateAdminRole,
                }))
              }
            >
              {CREATE_ADMIN_ROLES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </CustomSelect>
            <p className='mt-1 text-xs text-gray-500'>
              Admins can manage platform operations based on their assigned role.
            </p>
          </div>
        </div>
      </Modal>

      {/* Remove admin confirmation */}
      <Modal
        isOpen={!!adminToRemove}
        onClose={() => setAdminToRemove(null)}
        title='Remove admin'
        description={
          adminToRemove
            ? `Are you sure you want to remove ${adminToRemove.name} from admin access? They will no longer be able to log in to the admin dashboard.`
            : ""
        }
        size='md'
        headerAlign='left'
        actionsAlign='right'
        actions={[
          {
            label: "Cancel",
            onClick: () => setAdminToRemove(null),
            variant: "secondary",
          },
          {
            label: "Remove admin",
            onClick: handleConfirmRemove,
            variant: "destructive",
          },
        ]}
      />
    </PageWrapper>
  );
}

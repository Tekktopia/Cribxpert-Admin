// pages/csr/Users.tsx
import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout";
import { Topbar } from "@/components/layout";
import { csrNavigationItems } from "@/components/layout/csrSidebar";
import { UserDetailsDrawer } from "@/features/csr/UserDetailsDrawer";
import { usersData, userSummaryData, type User } from "@/data/csrUserData";
import { Search, ChevronLeft, ChevronRight, Download } from "lucide-react";

export default function CSRUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All Roles");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [goToPage, setGoToPage] = useState("");

  // Filter users based on search and role
  const filteredUsers = useMemo(() => {
    return usersData.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "All Roles" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [searchTerm, roleFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedUser(null);
  };

  const handleExport = () => {
    console.log("Exporting users data...");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleGoToPage = () => {
    const page = parseInt(goToPage);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setGoToPage("");
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Active": return "px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800";
      case "Suspended": return "px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800";
      case "Pending": return "px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800";
      case "Inactive": return "px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800";
      default: return "px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800";
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role.toLowerCase()) {
      case "host": return "px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800";
      case "guest": return "px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800";
      case "admin": return "px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800";
      case "csr": return "px-2 py-1 text-xs font-medium rounded bg-orange-100 text-orange-800";
      default: return "px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex bg-gray-50">
      <Sidebar navigationItems={csrNavigationItems} />
      <div className="flex-1 ">
        <Topbar />

        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">User</h1>
            <p className="text-sm text-gray-600">View users profile and activities</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600 mb-2">Total Users</p>
              <h2 className="text-3xl font-bold text-gray-900">{userSummaryData.totalUsers}</h2>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600 mb-2">Guests</p>
              <h2 className="text-3xl font-bold text-gray-900">{userSummaryData.guests}</h2>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600 mb-2">Hosts</p>
              <h2 className="text-3xl font-bold text-gray-900">{userSummaryData.hosts}</h2>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600 mb-2">Suspended</p>
              <h2 className="text-3xl font-bold text-red-600">{userSummaryData.suspended}</h2>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search Users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-3">
              <select 
                className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option>All Roles</option>
                <option>Host</option>
                <option>Guest</option>
                <option>Admin</option>
                <option>CSR</option>
              </select>
              
              <button 
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={handleExport}
              >
                <Download size={18} />
                Export
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-5">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={getRoleBadgeClass(user.role)}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadgeClass(user.status)}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.lastActive}</td>
                      <td className="px-6 py-4">
                        <button 
                          className="px-3 py-1.5 bg-teal-600 text-white text-xs font-medium rounded hover:bg-teal-700 transition-colors"
                          onClick={() => handleUserClick(user)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
              
<div className="flex items-center justify-between mt-6">
  {/* Rows per page */}
  <div className="flex items-center gap-2 text-sm text-gray-700">
    <span>Rows per Page</span>
    <select 
      className="px-2 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
      value={rowsPerPage}
      onChange={(e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1);
      }}
    >
      <option>10</option>
      <option>20</option>
      <option>50</option>
      <option>100</option>
    </select>
  </div>

  {/* Pagination Controls */}
  <div className="flex items-center gap-2">
    {/* Prev button */}
    <button 
      onClick={() => handlePageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {"< Prev"}
    </button>

    {/* Page numbers */}
    <div className="flex items-center gap-1">
      {[...Array(Math.min(5, totalPages))].map((_, i) => {
        let pageNum;
        if (totalPages <= 5) {
          pageNum = i + 1;
        } else if (currentPage <= 3) {
          pageNum = i + 1;
        } else if (currentPage >= totalPages - 2) {
          pageNum = totalPages - 4 + i;
        } else {
          pageNum = currentPage - 2 + i;
        }
        
        return (
          <button
            key={i}
            onClick={() => handlePageChange(pageNum)}
            className={`min-w-[36px] h-9 text-sm rounded-md transition-colors ${
              currentPage === pageNum 
                ? 'bg-teal-600 text-white' 
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {pageNum}
          </button>
        );
      })}
    </div>

    {/* Ellipsis */}
    {totalPages > 5 && currentPage < totalPages - 2 && (
      <span className="text-gray-500">...</span>
    )}

    {/* Last page number */}
    {totalPages > 5 && currentPage < totalPages - 2 && (
      <button 
        onClick={() => handlePageChange(totalPages)}
        className="min-w-[36px] h-9 text-sm bg-white border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50"
      >
        {totalPages}
      </button>
    )}

    {/* Next button */}
    <button 
      onClick={() => handlePageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {"Next >"}
    </button>

    {/* Separator */}
    <span className="text-gray-400 mx-1">/</span>

    {/* Go to Page */}
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-700">Go to Page</span>
      <input
        type="text"
        value={goToPage}
        onChange={(e) => setGoToPage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleGoToPage()}
        placeholder="1"
        className="w-16 px-2 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-center"
      />
      <button 
        onClick={handleGoToPage}
        className="px-3 py-1.5 bg-teal-600 text-white text-sm rounded-md hover:bg-teal-700 transition-colors"
      >
        Go
      </button>
    </div>
  </div>

  {/* Showing info */}
  <div className="text-sm text-gray-600">
    Showing {startIndex + 1} - {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length}
  </div>
</div>  
          
        </div>
      </div>

      {/* User Details Drawer */}
      <UserDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        user={selectedUser}
      />
    </div>
  );
}
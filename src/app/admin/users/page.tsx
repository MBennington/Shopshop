'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  profilePicture?: string;
  sellerInfo?: {
    businessName?: string;
    phone?: string;
    businessType?: string;
  };
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRole, setEditRole] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user, currentPage, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.users || []);
        setPagination(data.data.pagination || null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      setActionLoading(userId);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        await fetchUsers();
        setShowEditModal(false);
        setSelectedUser(null);
        toast.success('User role updated successfully');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update role');
      }
    } catch (error) {
      console.error('Failed to update role:', error);
      toast.error('Failed to update user role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchUsers();
        setDeleteConfirm(null);
        toast.success('User deleted successfully');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setShowEditModal(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'seller':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'buyer':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <Sidebar />
          <div className="layout-content-container flex flex-col max-w-[1200px] flex-1 overflow-y-auto">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#121416] tracking-light text-[32px] font-bold leading-tight">User Management</p>
                <p className="text-[#6a7581] text-sm font-normal leading-normal">Manage all platform users</p>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="px-4 py-3">
              <Card>
                <CardHeader>
                  <CardTitle>Filters & Search</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="Search by name, email, or business name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={roleFilter === '' ? 'default' : 'outline'}
                        onClick={() => handleRoleFilter('')}
                      >
                        All
                      </Button>
                      <Button
                        variant={roleFilter === 'buyer' ? 'default' : 'outline'}
                        onClick={() => handleRoleFilter('buyer')}
                      >
                        Buyers
                      </Button>
                      <Button
                        variant={roleFilter === 'seller' ? 'default' : 'outline'}
                        onClick={() => handleRoleFilter('seller')}
                      >
                        Sellers
                      </Button>
                      <Button
                        variant={roleFilter === 'admin' ? 'default' : 'outline'}
                        onClick={() => handleRoleFilter('admin')}
                      >
                        Admins
                      </Button>
                    </div>
                    <Button onClick={handleSearch}>Search</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Users Table */}
            <div className="px-4 py-3">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Users
                    {pagination && (
                      <span className="text-sm font-normal text-[#6a7581] ml-2">
                        ({pagination.total} total)
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="text-[#6a7581]">Loading users...</div>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="text-[#6a7581]">No users found</div>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-3 text-sm font-semibold text-[#121416]">User</th>
                              <th className="text-left p-3 text-sm font-semibold text-[#121416]">Email</th>
                              <th className="text-left p-3 text-sm font-semibold text-[#121416]">Role</th>
                              <th className="text-left p-3 text-sm font-semibold text-[#121416]">Business</th>
                              <th className="text-left p-3 text-sm font-semibold text-[#121416]">Joined</th>
                              <th className="text-right p-3 text-sm font-semibold text-[#121416]">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.map((userItem) => (
                              <tr key={userItem._id} className="border-b hover:bg-gray-50">
                                <td className="p-3">
                                  <div className="flex items-center gap-3">
                                    {userItem.profilePicture ? (
                                      <img
                                        src={userItem.profilePicture}
                                        alt={userItem.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-600 text-sm font-medium">
                                          {userItem.name.charAt(0).toUpperCase()}
                                        </span>
                                      </div>
                                    )}
                                    <span className="font-medium text-[#121416]">{userItem.name}</span>
                                  </div>
                                </td>
                                <td className="p-3 text-[#6a7581] text-sm">{userItem.email}</td>
                                <td className="p-3">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                                      userItem.role
                                    )}`}
                                  >
                                    {userItem.role.charAt(0).toUpperCase() + userItem.role.slice(1)}
                                  </span>
                                </td>
                                <td className="p-3 text-[#6a7581] text-sm">
                                  {userItem.sellerInfo?.businessName || '-'}
                                </td>
                                <td className="p-3 text-[#6a7581] text-sm">
                                  {formatDate(userItem.created_at)}
                                </td>
                                <td className="p-3">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openEditModal(userItem)}
                                      disabled={actionLoading === userItem._id}
                                    >
                                      Edit Role
                                    </Button>
                                    {userItem._id !== user?._id && (
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setDeleteConfirm(userItem._id)}
                                        disabled={actionLoading === userItem._id}
                                      >
                                        {actionLoading === userItem._id ? 'Deleting...' : 'Delete'}
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {pagination && pagination.pages > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <div className="text-sm text-[#6a7581]">
                            Page {pagination.page} of {pagination.pages}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
                              disabled={currentPage === pagination.pages}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Role Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Edit User Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[#6a7581] mb-2">User: {selectedUser.name}</p>
                  <p className="text-sm text-[#6a7581] mb-4">Email: {selectedUser.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#121416] mb-2">Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedUser(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleUpdateRole(selectedUser._id, editRole)}
                    disabled={actionLoading === selectedUser._id}
                  >
                    {actionLoading === selectedUser._id ? 'Updating...' : 'Update Role'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Confirm Delete</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-[#6a7581]">
                  Are you sure you want to delete this user? This action cannot be undone.
                </p>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirm(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteUser(deleteConfirm)}
                    disabled={actionLoading === deleteConfirm}
                  >
                    {actionLoading === deleteConfirm ? 'Deleting...' : 'Delete User'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

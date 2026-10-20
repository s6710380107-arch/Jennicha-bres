import React, { useState, useEffect } from 'react';
import { Search, Shield, Ban, CheckCircle, UserCheck, AlertTriangle } from 'lucide-react';
import { UserProfile, UserRole, UserStatus } from '../../types';
import { subscribeToUsers, updateUserRole, updateUserStatus } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../Toast';
import { ConfirmDialog } from '../ConfirmDialog';

export const UsersTab: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');

  const [userToSuspend, setUserToSuspend] = useState<UserProfile | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [roleTargetUser, setRoleTargetUser] = useState<{ user: UserProfile; newRole: UserRole } | null>(null);

  useEffect(() => {
    const unsub = subscribeToUsers(
      (list) => {
        setUsers(list);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.displayName || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleRoleChangeConfirm = async () => {
    if (!roleTargetUser || !currentUser) return;
    try {
      await updateUserRole(roleTargetUser.user.uid, roleTargetUser.newRole, {
        uid: currentUser.uid,
        email: currentUser.email || '',
      });
      showSuccess('ปรับเปลี่ยนสิทธิ์สำเร็จ', `ปรับสิทธิ์ ${roleTargetUser.user.displayName} เป็น ${roleTargetUser.newRole}`);
      setRoleTargetUser(null);
    } catch (err) {
      console.error(err);
      showError('ไม่สามารถปรับเปลี่ยนสิทธิ์ได้');
    }
  };

  const handleStatusToggleConfirm = async () => {
    if (!userToSuspend || !currentUser) return;
    const targetStatus: UserStatus = userToSuspend.status === 'suspended' ? 'active' : 'suspended';
    try {
      await updateUserStatus(
        userToSuspend.uid,
        targetStatus,
        {
          uid: currentUser.uid,
          email: currentUser.email || '',
        },
        suspendReason || 'ดำเนินการโดยผู้ดูแลระบบ'
      );
      showSuccess(
        targetStatus === 'suspended' ? 'ระงับบัญชีผู้ใช้เรียบร้อยแล้ว' : 'ปลดการระงับบัญชีเรียบร้อยแล้ว'
      );
      setUserToSuspend(null);
      setSuspendReason('');
    } catch (err) {
      console.error(err);
      showError('ไม่สามารถเปลี่ยนสถานะบัญชีได้');
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">กำลังโหลดรายชื่อสมาชิก...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อ หรืออีเมลสมาชิก..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 outline-hidden"
          >
            <option value="all">ทุกระดับสิทธิ์</option>
            <option value="member">สมาชิกทั่วไป (Member)</option>
            <option value="moderator">ผู้ช่วยดูแล (Moderator)</option>
            <option value="admin">ผู้ดูแลระบบ (Admin)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 outline-hidden"
          >
            <option value="all">ทุกสถานะบัญชี</option>
            <option value="active">ปกติ (Active)</option>
            <option value="suspended">ถูกระงับ (Suspended)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3.5 pl-5">สมาชิก</th>
                <th className="p-3.5">อีเมล</th>
                <th className="p-3.5">ระดับสิทธิ์</th>
                <th className="p-3.5">สถานะ</th>
                <th className="p-3.5 pr-5 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    ไม่พบรายชื่อสมาชิกที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = u.uid === currentUser?.uid;

                  return (
                    <tr key={u.uid} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                            {u.displayName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                              {u.displayName}
                              {isSelf && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-normal">
                                  คุณ
                                </span>
                              )}
                            </p>
                            {u.bio && (
                              <p className="text-[10px] text-slate-400 line-clamp-1 max-w-[200px]">{u.bio}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 text-slate-600 font-mono text-[11px]">{u.email}</td>

                      <td className="p-3.5">
                        {isAdmin && !isSelf ? (
                          <select
                            value={u.role || 'member'}
                            onChange={(e) =>
                              setRoleTargetUser({ user: u, newRole: e.target.value as UserRole })
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border outline-hidden cursor-pointer ${
                              u.role === 'admin'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : u.role === 'moderator'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            <option value="member">สมาชิก (Member)</option>
                            <option value="moderator">ผู้ช่วยดูแล (Moderator)</option>
                            <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold inline-block ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-700'
                                : u.role === 'moderator'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {u.role === 'admin' ? 'Admin' : u.role === 'moderator' ? 'Moderator' : 'Member'}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold inline-flex items-center gap-1 ${
                            u.status === 'suspended'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {u.status === 'suspended' ? 'ถูกระงับ' : 'ปกติ'}
                        </span>
                      </td>

                      <td className="p-3.5 pr-5 text-right">
                        {!isSelf && (
                          <button
                            onClick={() => setUserToSuspend(u)}
                            className={`px-3 py-1.5 rounded-xl font-medium transition-colors inline-flex items-center gap-1 text-[11px] ${
                              u.status === 'suspended'
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                            }`}
                          >
                            {u.status === 'suspended' ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" /> ปลดระงับ
                              </>
                            ) : (
                              <>
                                <Ban className="w-3.5 h-3.5" /> ระงับบัญชี
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Change Confirm */}
      <ConfirmDialog
        isOpen={!!roleTargetUser}
        title="ยืนยันการเปลี่ยนระดับสิทธิ์"
        message={`ต้องการปรับสิทธิ์ของ ${roleTargetUser?.user.displayName} เป็น "${roleTargetUser?.newRole}" หรือไม่?`}
        confirmLabel="ยืนยันการเปลี่ยนสิทธิ์"
        isDestructive={false}
        onConfirm={handleRoleChangeConfirm}
        onClose={() => setRoleTargetUser(null)}
      />

      {/* Suspend Confirm Modal */}
      {userToSuspend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">
                  {userToSuspend.status === 'suspended' ? 'ปลดระงับบัญชีผู้ใช้' : 'ระงับการใช้งานบัญชี'}
                </h3>
                <p className="text-xs text-slate-500">{userToSuspend.displayName} ({userToSuspend.email})</p>
              </div>
            </div>

            {userToSuspend.status !== 'suspended' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ระบุเหตุผลในการระงับบัญชี
                </label>
                <input
                  type="text"
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="เช่น ละเมิดกฎชุมชน โพสต์สื่อผิดลิขสิทธิ์ซ้ำๆ"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-hidden"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToSuspend(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleStatusToggleConfirm}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-xl transition-colors ${
                  userToSuspend.status === 'suspended'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {userToSuspend.status === 'suspended' ? 'ยืนยันปลดระงับ' : 'ยืนยันระงับบัญชี'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

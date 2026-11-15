import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  KeyRound,
  Trash2,
  X,
  Shield,
  ShieldAlert,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import api from '../api/axios';
import TopBar from '../components/shared/TopBar';
import HeroBanner from '../components/shared/HeroBanner';
import SubNavMenu from '../components/shared/SubNavMenu';
import '../styles/UserManagement.css';

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Selected User
  const [selectedUser, setSelectedUser] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    nip: '',
    role: 'user',
    password: '',
  });

  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Current logged in user from localStorage
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = { page };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;

      const res = await api.get('/users', { params });
      if (res.data) {
        setUsers(res.data.data || []);
        setPagination({
          current_page: res.data.current_page || 1,
          last_page: res.data.last_page || 1,
          total: res.data.total || 0,
        });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal memuat daftar pengguna.');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      name: '',
      username: '',
      email: '',
      nip: '',
      role: 'user',
      password: '',
    });
    setErrorMsg('');
    setCreateModalOpen(true);
  };

  // Submit Create User
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.post('/users', formData);
      setSuccessMsg('Pengguna baru berhasil ditambahkan!');
      setCreateModalOpen(false);
      fetchUsers(1);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      if (err.response?.data?.errors) {
        const firstErr = Object.values(err.response.data.errors)[0];
        setErrorMsg(Array.isArray(firstErr) ? firstErr[0] : firstErr);
      } else {
        setErrorMsg(err.response?.data?.message || 'Gagal menambahkan pengguna.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      nip: user.nip || '',
      role: user.role || 'user',
      password: '',
    });
    setErrorMsg('');
    setEditModalOpen(true);
  };

  // Submit Edit User
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.put(`/users/${selectedUser.id}`, {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        nip: formData.nip,
        role: formData.role,
      });
      setSuccessMsg('Data pengguna berhasil diperbarui!');
      setEditModalOpen(false);
      fetchUsers(pagination.current_page);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      if (err.response?.data?.errors) {
        const firstErr = Object.values(err.response.data.errors)[0];
        setErrorMsg(Array.isArray(firstErr) ? firstErr[0] : firstErr);
      } else {
        setErrorMsg(err.response?.data?.message || 'Gagal memperbarui pengguna.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Open Reset Password Modal
  const handleOpenReset = (user) => {
    setSelectedUser(user);
    setResetPasswordVal('');
    setErrorMsg('');
    setResetModalOpen(true);
  };

  // Submit Reset Password
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.post(`/users/${selectedUser.id}/reset-password`, {
        password: resetPasswordVal,
      });
      setSuccessMsg(`Kata sandi untuk ${selectedUser.name} berhasil di-reset!`);
      setResetModalOpen(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal me-reset kata sandi.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (user) => {
    setSelectedUser(user);
    setErrorMsg('');
    setDeleteModalOpen(true);
  };

  // Submit Delete User
  const handleDeleteSubmit = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.delete(`/users/${selectedUser.id}`);
      setSuccessMsg(`Pengguna ${selectedUser.name} berhasil dihapus.`);
      setDeleteModalOpen(false);
      fetchUsers(pagination.current_page);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal menghapus pengguna.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="role-badge super_admin">
            <ShieldAlert size={12} /> Super Admin
          </span>
        );
      case 'admin':
        return (
          <span className="role-badge admin">
            <Shield size={12} /> Admin
          </span>
        );
      default:
        return (
          <span className="role-badge user">
            <UserCheck size={12} /> Pegawai / User
          </span>
        );
    }
  };

  return (
    <div className="dashboard-layout">
      <main className="main-content" style={{ marginLeft: 0 }}>
        {/* Topbar */}
        <TopBar onRefresh={() => fetchUsers(pagination.current_page)} isRefreshing={loading} />

        {/* Content Area */}
        <div className="content-area">
          {/* Breadcrumb */}
          <div className="app-breadcrumb">
            <span
              className="app-breadcrumb-link"
              onClick={() => navigate('/dashboard')}
              style={{ cursor: 'pointer' }}
            >
              Dashboard
            </span>
            <span className="app-breadcrumb-separator">/</span>
            <span className="app-breadcrumb-current">Kelola Pengguna</span>
          </div>

          {/* ── HERO BANNER ── */}
          <HeroBanner
            title="Manajemen Akun Pengguna"
            description="Kelola akun pengguna, penugasan peran hak akses (Super Admin, Admin, User), dan reset kata sandi sistem."
            badgeText="Akses Khusus Super Admin"
          />

          {/* ── QUICK NAV MENU (KOTAK & CENTER) ── */}
          <SubNavMenu />

          {/* Header Section */}
          <div className="user-mgmt-header">
          <div className="user-mgmt-title">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={22} color="#4f46e5" />
              Daftar Akun Pengguna
            </h2>
            <p>Total {pagination.total} pengguna terdaftar di dalam sistem.</p>
          </div>
          <button type="button" className="btn-add-user" onClick={handleOpenCreate}>
            <UserPlus size={18} />
            <span>Tambah Pengguna</span>
          </button>
        </div>

        {/* Toast Messages */}
        {successMsg && (
          <div style={{ padding: '12px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && !createModalOpen && !editModalOpen && !resetModalOpen && !deleteModalOpen && (
          <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Filter Card */}
        <div className="user-mgmt-filter-card">
          <div className="search-box-wrapper">
            <Search size={18} className="search-icon-left" />
            <input
              type="text"
              className="search-input-field"
              placeholder="Cari berdasarkan nama, username, NIP, atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="role-filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Semua Peran</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Administrator</option>
            <option value="user">Pegawai / User</option>
          </select>
        </div>

        {/* Table Card */}
        <div className="user-mgmt-table-card">
          <div className="table-responsive">
            <table className="user-mgmt-table">
              <thead>
                <tr>
                  <th>Nama & Email</th>
                  <th>Username & NIP</th>
                  <th>Peran Hak Akses</th>
                  <th>Terdaftar Pada</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      <RefreshCw size={24} className="spinner" style={{ margin: '0 auto 8px' }} />
                      <p>Memuat data pengguna...</p>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      Tidak ditemukan pengguna yang sesuai dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const isSelf = currentUser?.id === u.id;
                    return (
                      <tr key={u.id}>
                        <td>
                          <div className="user-identity">
                            <span className="user-name-text">
                              {u.name} {isSelf && <span style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 600 }}>(Anda)</span>}
                            </span>
                            <span className="user-email-text">{u.email || '-'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="user-identity">
                            <span className="user-username-badge">@{u.username || 'user'}</span>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>NIP: {u.nip || '-'}</span>
                          </div>
                        </td>
                        <td>{getRoleBadge(u.role)}</td>
                        <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                          {u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                        </td>
                        <td>
                          <div className="action-buttons-group" style={{ justifyContent: 'center' }}>
                            <button
                              type="button"
                              className="btn-action-icon"
                              title="Edit Data & Peran"
                              onClick={() => handleOpenEdit(u)}
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              type="button"
                              className="btn-action-icon"
                              title="Reset Password"
                              onClick={() => handleOpenReset(u)}
                            >
                              <KeyRound size={15} />
                            </button>
                            <button
                              type="button"
                              className="btn-action-icon danger"
                              title={isSelf ? 'Tidak dapat menghapus akun sendiri' : 'Hapus Pengguna'}
                              disabled={isSelf}
                              onClick={() => handleOpenDelete(u)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="user-mgmt-pagination">
            <span>
              Menampilkan {users.length} dari total {pagination.total} pengguna
            </span>
            <div className="pagination-btn-group">
              <button
                type="button"
                className="pagination-btn"
                disabled={pagination.current_page <= 1}
                onClick={() => fetchUsers(pagination.current_page - 1)}
              >
                Sebelumnya
              </button>
              <button
                type="button"
                className="pagination-btn"
                disabled={pagination.current_page >= pagination.last_page}
                onClick={() => fetchUsers(pagination.current_page + 1)}
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

      {/* ──────────────── MODAL: TAMBAH PENGGUNA ──────────────── */}
      {createModalOpen && (
        <div className="modal-overlay-user">
          <div className="modal-card-user">
            <div className="modal-header-user">
              <h3>Tambah Pengguna Baru</h3>
              <button type="button" className="modal-close-btn" onClick={() => setCreateModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body-user">
                {errorMsg && (
                  <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '6px', fontSize: '0.85rem' }}>
                    {errorMsg}
                  </div>
                )}
                <div className="form-field-group">
                  <label>Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    className="form-field-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Budi Santoso, S.Kom."
                  />
                </div>
                <div className="form-field-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    required
                    className="form-field-input"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Contoh: budi_santoso"
                  />
                </div>
                <div className="form-field-group">
                  <label>NIP</label>
                  <input
                    type="text"
                    className="form-field-input"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    placeholder="18 digit NIP pegawai"
                  />
                </div>
                <div className="form-field-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-field-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@bkpsdm.com"
                  />
                </div>
                <div className="form-field-group">
                  <label>Peran Hak Akses *</label>
                  <select
                    className="form-field-select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="user">User / Pegawai (Dashboard Eksekutif)</option>
                    <option value="admin">Administrator (Profil ASN & Direktori Pegawai)</option>
                    <option value="super_admin">Super Admin (Akses Penuh & Kelola Pengguna)</option>
                  </select>
                </div>
                <div className="form-field-group">
                  <label>Kata Sandi *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="form-field-input"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                  />
                </div>
              </div>
              <div className="modal-footer-user">
                <button type="button" className="btn-secondary" onClick={() => setCreateModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary-action" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────── MODAL: EDIT PENGGUNA ──────────────── */}
      {editModalOpen && (
        <div className="modal-overlay-user">
          <div className="modal-card-user">
            <div className="modal-header-user">
              <h3>Edit Data & Peran Pengguna</h3>
              <button type="button" className="modal-close-btn" onClick={() => setEditModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body-user">
                {errorMsg && (
                  <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '6px', fontSize: '0.85rem' }}>
                    {errorMsg}
                  </div>
                )}
                <div className="form-field-group">
                  <label>Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    className="form-field-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-field-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    required
                    className="form-field-input"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
                <div className="form-field-group">
                  <label>NIP</label>
                  <input
                    type="text"
                    className="form-field-input"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                  />
                </div>
                <div className="form-field-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-field-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-field-group">
                  <label>Peran Hak Akses *</label>
                  <select
                    className="form-field-select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="user">User / Pegawai (Dashboard Eksekutif)</option>
                    <option value="admin">Administrator (Profil ASN & Direktori Pegawai)</option>
                    <option value="super_admin">Super Admin (Akses Penuh & Kelola Pengguna)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer-user">
                <button type="button" className="btn-secondary" onClick={() => setEditModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary-action" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Perbarui Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────── MODAL: RESET PASSWORD ──────────────── */}
      {resetModalOpen && (
        <div className="modal-overlay-user">
          <div className="modal-card-user">
            <div className="modal-header-user">
              <h3>Reset Kata Sandi</h3>
              <button type="button" className="modal-close-btn" onClick={() => setResetModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleResetSubmit}>
              <div className="modal-body-user">
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569' }}>
                  Atur ulang kata sandi untuk pengguna <strong>{selectedUser?.name}</strong> (@{selectedUser?.username}).
                </p>
                {errorMsg && (
                  <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '6px', fontSize: '0.85rem' }}>
                    {errorMsg}
                  </div>
                )}
                <div className="form-field-group">
                  <label>Kata Sandi Baru *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="form-field-input"
                    value={resetPasswordVal}
                    onChange={(e) => setResetPasswordVal(e.target.value)}
                    placeholder="Minimal 6 karakter"
                  />
                </div>
              </div>
              <div className="modal-footer-user">
                <button type="button" className="btn-secondary" onClick={() => setResetModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary-action" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan Kata Sandi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────── MODAL: KONFIRMASI HAPUS ──────────────── */}
      {deleteModalOpen && (
        <div className="modal-overlay-user">
          <div className="modal-card-user">
            <div className="modal-header-user">
              <h3 style={{ color: '#dc2626' }}>Hapus Pengguna</h3>
              <button type="button" className="modal-close-btn" onClick={() => setDeleteModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body-user">
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155' }}>
                Apakah Anda yakin ingin menghapus akun <strong>{selectedUser?.name}</strong> (@{selectedUser?.username})?
              </p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#dc2626' }}>
                Perhatian: Tindakan ini tidak dapat dibatalkan dan seluruh token sesi pengguna ini akan dicabut.
              </p>
              {errorMsg && (
                <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '6px', fontSize: '0.85rem' }}>
                  {errorMsg}
                </div>
              )}
            </div>
            <div className="modal-footer-user">
              <button type="button" className="btn-secondary" onClick={() => setDeleteModalOpen(false)}>
                Batal
              </button>
              <button type="button" className="btn-danger-action" disabled={submitting} onClick={handleDeleteSubmit}>
                {submitting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


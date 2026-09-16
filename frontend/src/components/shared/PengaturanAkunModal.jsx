import React, { useState, useEffect, useRef } from 'react';
import { X, User, Lock, Eye, EyeOff, Check, AlertCircle, Loader2, Shield, Edit3 } from 'lucide-react';
import api from '../../api/axios';
import '../../styles/PengaturanAkunModal.css';

export default function PengaturanAkunModal({ isOpen, onClose, onProfileUpdated }) {
  const [activeTab, setActiveTab] = useState('profil');
  const [user, setUser] = useState(null);

  // State form profil
  const [name, setName]         = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');

  // State form password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw]     = useState(false);
  const [showNewPw, setShowNewPw]             = useState(false);
  const [showConfirmPw, setShowConfirmPw]     = useState(false);

  // Feedback
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState('');
  const [error, setError]       = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const backdropRef = useRef(null);

  // Isi form dari localStorage saat buka
  useEffect(() => {
    if (isOpen) {
      const raw = localStorage.getItem('user');
      if (raw) {
        try {
          const u = JSON.parse(raw);
          setUser(u);
          setName(u.name || '');
          setUsername(u.username || '');
          setEmail(u.email || '');
        } catch {}
      }
      setSuccess('');
      setError('');
      setFieldErrors({});
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [isOpen]);

  // Tutup saat klik backdrop
  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  // Tutup saat tekan ESC
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Disable body scroll saat modal terbuka dengan class CSS yang lebih strict
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open-no-scroll');
      document.documentElement.classList.add('modal-open-no-scroll');
    } else {
      document.body.classList.remove('modal-open-no-scroll');
      document.documentElement.classList.remove('modal-open-no-scroll');
    }
    return () => {
      document.body.classList.remove('modal-open-no-scroll');
      document.documentElement.classList.remove('modal-open-no-scroll');
    };
  }, [isOpen]);

  const clearFeedback = () => { setSuccess(''); setError(''); setFieldErrors({}); };

  // Submit ubah profil
  const handleProfilSubmit = async (e) => {
    e.preventDefault();
    clearFeedback();
    setLoading(true);
    try {
      const res = await api.put('/profile', { name, username, email: email || null });
      const updatedUser = res.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSuccess('Profil berhasil diperbarui!');
      if (onProfileUpdated) onProfileUpdated(updatedUser);
    } catch (err) {
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
        setError(Object.values(err.response.data.errors).flat().join(', '));
      } else {
        setError(err.response?.data?.message || 'Gagal memperbarui profil.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Submit ubah password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    clearFeedback();
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password baru tidak cocok.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password baru minimal 8 karakter.');
      return;
    }
    setLoading(true);
    try {
      await api.put('/profile', {
        current_password:       currentPassword,
        new_password:           newPassword,
        new_password_confirmation: confirmPassword,
      });
      setSuccess('Password berhasil diubah!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
        setError(Object.values(err.response.data.errors).flat().join(', '));
      } else {
        setError(err.response?.data?.message || 'Gagal mengubah password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (n) => {
    if (!n) return 'A';
    return n.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div
      className="pak-backdrop"
      ref={backdropRef}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="pak-title"
    >
      <div className="pak-panel">
        {/* ── HEADER ── */}
        <div className="pak-header">
          <div className="pak-header-left">
            <div className="pak-avatar-lg">{getInitials(user?.name)}</div>
            <div>
              <h2 id="pak-title" className="pak-header-title">Pengaturan Akun</h2>
              <p className="pak-header-sub">{user?.name || 'Pengguna'} &middot; <span className="pak-role-badge">{user?.role || 'admin'}</span></p>
            </div>
          </div>
          <button
            type="button"
            className="pak-close-btn"
            onClick={onClose}
            aria-label="Tutup pengaturan akun"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── TABS ── */}
        <div className="pak-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'profil'}
            className={`pak-tab ${activeTab === 'profil' ? 'active' : ''}`}
            onClick={() => { setActiveTab('profil'); clearFeedback(); }}
          >
            <User size={16} /> Informasi Profil
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'password'}
            className={`pak-tab ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => { setActiveTab('password'); clearFeedback(); }}
          >
            <Lock size={16} /> Ubah Password
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="pak-body">

          {/* Feedback alert */}
          {success && (
            <div className="pak-alert pak-alert-success">
              <Check size={16} /> {success}
            </div>
          )}
          {error && (
            <div className="pak-alert pak-alert-error">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* ── TAB: PROFIL ── */}
          {activeTab === 'profil' && (
            <form onSubmit={handleProfilSubmit} className="pak-form">

              <div className="pak-info-row">
                <div className="pak-info-chip">
                  <Shield size={13} />
                  <span>NIP: <strong>{user?.nip || '—'}</strong> (tidak dapat diubah)</span>
                </div>
              </div>

              <div className="pak-field">
                <label htmlFor="pak-name" className="pak-label">Nama Lengkap</label>
                <div className={`pak-input-wrap ${fieldErrors.name ? 'is-error' : ''}`}>
                  <Edit3 size={16} className="pak-input-icon" />
                  <input
                    id="pak-name"
                    type="text"
                    className="pak-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukan nama lengkap"
                    required
                  />
                </div>
                {fieldErrors.name && <span className="pak-field-error">{fieldErrors.name[0]}</span>}
              </div>

              <div className="pak-field">
                <label htmlFor="pak-username" className="pak-label">Username</label>
                <div className={`pak-input-wrap ${fieldErrors.username ? 'is-error' : ''}`}>
                  <User size={16} className="pak-input-icon" />
                  <input
                    id="pak-username"
                    type="text"
                    className="pak-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukan username"
                    required
                  />
                </div>
                {fieldErrors.username && <span className="pak-field-error">{fieldErrors.username[0]}</span>}
              </div>

              <div className="pak-field">
                <label htmlFor="pak-email" className="pak-label">Email <span className="pak-label-opt">(opsional)</span></label>
                <div className={`pak-input-wrap ${fieldErrors.email ? 'is-error' : ''}`}>
                  <svg className="pak-input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  <input
                    id="pak-email"
                    type="email"
                    className="pak-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukan email (opsional)"
                  />
                </div>
                {fieldErrors.email && <span className="pak-field-error">{fieldErrors.email[0]}</span>}
              </div>

              <div className="pak-form-footer">
                <button type="button" className="pak-btn-secondary" onClick={onClose}>Batal</button>
                <button type="submit" className="pak-btn-primary" disabled={loading}>
                  {loading ? <><Loader2 size={15} className="pak-spin" /> Menyimpan...</> : <><Check size={15} /> Simpan Perubahan</>}
                </button>
              </div>
            </form>
          )}

          {/* ── TAB: PASSWORD ── */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="pak-form">

              <div className="pak-info-row">
                <div className="pak-info-chip">
                  <Shield size={13} />
                  <span>Password minimal <strong>8 karakter</strong></span>
                </div>
              </div>

              <div className="pak-field">
                <label htmlFor="pak-curr-pw" className="pak-label">Password Saat Ini</label>
                <div className={`pak-input-wrap ${fieldErrors.current_password ? 'is-error' : ''}`}>
                  <Lock size={16} className="pak-input-icon" />
                  <input
                    id="pak-curr-pw"
                    type={showCurrentPw ? 'text' : 'password'}
                    className="pak-input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Password saat ini"
                    required
                  />
                  <button
                    type="button"
                    className="pak-pw-toggle"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    aria-label={showCurrentPw ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {fieldErrors.current_password && <span className="pak-field-error">{fieldErrors.current_password[0]}</span>}
              </div>

              <div className="pak-field">
                <label htmlFor="pak-new-pw" className="pak-label">Password Baru</label>
                <div className={`pak-input-wrap ${fieldErrors.new_password ? 'is-error' : ''}`}>
                  <Lock size={16} className="pak-input-icon" />
                  <input
                    id="pak-new-pw"
                    type={showNewPw ? 'text' : 'password'}
                    className="pak-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Password baru (min. 8 karakter)"
                    required
                  />
                  <button
                    type="button"
                    className="pak-pw-toggle"
                    onClick={() => setShowNewPw(!showNewPw)}
                    aria-label={showNewPw ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {fieldErrors.new_password && <span className="pak-field-error">{fieldErrors.new_password[0]}</span>}
                {/* Password strength bar */}
                {newPassword.length > 0 && (
                  <div className="pak-strength-bar">
                    <div
                      className={`pak-strength-fill ${
                        newPassword.length >= 12 ? 'strong' :
                        newPassword.length >= 8  ? 'medium' : 'weak'
                      }`}
                      style={{ width: `${Math.min((newPassword.length / 16) * 100, 100)}%` }}
                    />
                    <span className={`pak-strength-label ${
                      newPassword.length >= 12 ? 'strong' :
                      newPassword.length >= 8  ? 'medium' : 'weak'
                    }`}>
                      {newPassword.length >= 12 ? 'Kuat' : newPassword.length >= 8 ? 'Sedang' : 'Lemah'}
                    </span>
                  </div>
                )}
              </div>

              <div className="pak-field">
                <label htmlFor="pak-confirm-pw" className="pak-label">Konfirmasi Password Baru</label>
                <div className={`pak-input-wrap ${newPassword && confirmPassword && newPassword !== confirmPassword ? 'is-error' : ''}`}>
                  <Lock size={16} className="pak-input-icon" />
                  <input
                    id="pak-confirm-pw"
                    type={showConfirmPw ? 'text' : 'password'}
                    className="pak-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    required
                  />
                  <button
                    type="button"
                    className="pak-pw-toggle"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    aria-label={showConfirmPw ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <span className="pak-field-error">Password tidak cocok</span>
                )}
              </div>

              <div className="pak-form-footer">
                <button type="button" className="pak-btn-secondary" onClick={onClose}>Batal</button>
                <button type="submit" className="pak-btn-primary" disabled={loading}>
                  {loading ? <><Loader2 size={15} className="pak-spin" /> Menyimpan...</> : <><Shield size={15} /> Ubah Password</>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

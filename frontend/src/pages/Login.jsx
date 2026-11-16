import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import api from '../api/axios';
import bgLogin from '../assets/bg-login.png';
import badasBerdayaLogo from '../assets/badasberdaya.png';
import bandungLebihBadasLogo from '../assets/bandunglebihbadas.png';
import loginFooterIcon from '../assets/login-footer.png';
import LoginLoadingState from '../components/LoginLoadingState';
import '../styles/Login.css';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessLoading, setIsSuccessLoading] = useState(false);
  const navigate = useNavigate();

  // Jika sudah memiliki token aktif, alihkan ke dashboard
  React.useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await api.post('/login', {
        identifier,
        password,
      });

      if (response.data.access_token) {
        localStorage.setItem('auth_token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        window.dispatchEvent(new Event('auth_change'));

        // Kredensial valid: aktifkan animasi transisi "Sedang Masuk" (2 ASN)
        setIsSubmitting(false);
        setIsSuccessLoading(true);

        // Beri jeda transisi halus sebelum redirect ke dashboard
        await new Promise((resolve) => setTimeout(resolve, 2500));

        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      // Kredensial salah / gagal: langsung blokir di form login tanpa masuk ke animasi
      setIsSubmitting(false);
      setIsSuccessLoading(false);

      if (err.response && err.response.data) {
        if (err.response.data.errors) {
          const firstError = Object.values(err.response.data.errors)[0];
          setError(Array.isArray(firstError) ? firstError[0] : firstError || 'Terjadi kesalahan saat login.');
        } else if (err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Username/NIP atau password salah.');
        }
      } else {
        setError('Koneksi ke server backend gagal. Pastikan server aktif.');
      }
    }
  };

  return (
    <>
      {/* Full Screen Loading Overlay - HANYA muncul saat kredensial valid dan berhasil login */}
      {isSuccessLoading && <LoginLoadingState message="Sedang masuk..." />}

      <div
        className="loginContainer"
        style={{
          backgroundImage: `url(${bgLogin})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: isSuccessLoading ? 0 : 1,
          pointerEvents: isSuccessLoading ? 'none' : 'auto',
          transition: 'opacity 0.25s ease-in-out',
        }}
      >
      <div className="loginCard">
        {/* Top Logos moved inside card wrapper for perfect centering */}
        <div className="loginTopLogos">
          <img src={badasBerdayaLogo} alt="BEDAS Berdaya" className="topLogoImage" />
          <img src={bandungLebihBadasLogo} alt="Bandung Lebih Bedas" className="topLogoImage" />
        </div>

        <div className="loginHeader">
          <h1>Login</h1>
          <p>Silahkan login menggunakan akun yang ada</p>
        </div>

        {error && <div className="errorMessage">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="formGroup">
            <label htmlFor="identifier">Username</label>
            <div className="inputBox">
              <div className="inputPrefix">
                <User size={18} color="#475569" />
                <div className="inputDivider"></div>
              </div>
              <input
                type="text"
                id="identifier"
                className="formInput"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Masukan username anda"
                spellCheck="false"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="formGroup">
            <label htmlFor="password">Password</label>
            <div className="inputBox">
              <div className="inputPrefix">
                <Lock size={18} color="#475569" />
                <div className="inputDivider"></div>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="formInput"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukan password anda"
                required
              />
              <button
                type="button"
                className="passwordToggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="submitWrapper">
            <button type="submit" className="btnPrimary" disabled={isSubmitting || isSuccessLoading}>
              {isSubmitting ? 'Memproses...' : isSuccessLoading ? 'Sedang Masuk...' : 'Masuk'}
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="loginFooter">
        <img src={loginFooterIcon} alt="BKPSDM Footer Logo" className="footerLogo" />
        <p>&copy; 2026 <strong>BKPSDM Kab Bandung.</strong> All Rights Reserved</p>
      </div>
    </div>
    </>
  );
};

export default Login;

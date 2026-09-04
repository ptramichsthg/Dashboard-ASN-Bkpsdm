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
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Jika sudah memiliki token aktif, otomatis alihkan ke /profil
  React.useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      navigate('/profil', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Catat waktu mulai loading
    const startTime = Date.now();
    const minimumLoadingTime = 5000; // 5 detik

    try {
      const response = await api.post('/login', {
        identifier,
        password,
      });

      if (response.data.access_token) {
        localStorage.setItem('auth_token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Hitung waktu yang sudah berlalu
        const elapsedTime = Date.now() - startTime;
        const remainingTime = minimumLoadingTime - elapsedTime;

        // Jika belum mencapai 5 detik, tunggu sisa waktu
        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }

        setIsLoading(false);
        navigate('/profil', { replace: true });
      }
    } catch (err) {
      // Hitung waktu yang sudah berlalu
      const elapsedTime = Date.now() - startTime;
      const remainingTime = minimumLoadingTime - elapsedTime;

      // Tunggu minimum 5 detik bahkan saat error
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Full Screen Loading Overlay */}
      {isLoading && <LoginLoadingState message="Sedang masuk..." />}

      <div
        className="loginContainer"
        style={{
          backgroundImage: `url(${bgLogin})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: isLoading ? 0 : 1,
          pointerEvents: isLoading ? 'none' : 'auto',
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
            <button type="submit" className="btnPrimary" disabled={isLoading}>
              {isLoading ? 'Memproses...' : 'Masuk'}
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

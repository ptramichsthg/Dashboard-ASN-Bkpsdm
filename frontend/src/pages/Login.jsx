import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import api from '../api/axios';
import bgLogin from '../assets/bg-login.png';
import badasBerdayaLogo from '../assets/badasberdaya.png';
import bandungLebihBadasLogo from '../assets/bandunglebihbadas.png';
import loginFooterIcon from '../assets/login-footer.png';
import '../styles/Login.css';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/login', {
        identifier,
        password,
      });

      if (response.data.access_token) {
        localStorage.setItem('auth_token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        const firstError = Object.values(err.response.data.errors)[0];
        setError(firstError[0] || 'Terjadi kesalahan saat login.');
      } else {
        setError('Koneksi ke server gagal. Silakan coba lagi.');
      }
    }
  };

  return (
    <div
      className="loginContainer"
      style={{
        backgroundImage: `url(${bgLogin})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
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
            <button type="submit" className="btnPrimary">
              Masuk
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
  );
};

export default Login;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Activity } from 'lucide-react';
import api from '../api/axios';
import bgLogin from '../assets/bg-login.png';
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
        <div className="loginHeader">
          <div className="login-brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Activity size={32} className="brand-icon" />
              <div className="brand-text" style={{ textAlign: 'left' }}>
                <h2 style={{ fontSize: '1.25rem' }}>BKPSDM PANEL</h2>
                <span style={{ fontSize: '0.75rem' }}>SISTEM INFORMASI ASN</span>
              </div>
            </div>
          </div>
          <p>Silakan masuk menggunakan Username atau NIP Anda</p>
        </div>

        {error && <div className="errorMessage">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="formGroup">
            <label htmlFor="identifier">Username / NIP</label>
            <input
              type="text"
              id="identifier"
              className="formInput"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Masukkan Username atau NIP"
              spellCheck="false"
              autoComplete="username"
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="password">Password</label>
            <div className="inputWrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="formInput"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan Password"
                required
              />
              <button
                type="button"
                className="passwordToggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btnPrimary">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

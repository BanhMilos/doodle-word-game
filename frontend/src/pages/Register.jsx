import React, { useState } from 'react';
import '../styles/loginandregister.css';
import { useNavigate } from 'react-router-dom';
import useAxiosAuth from '../hooks/useAxiosAuth';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const axiosAuth =useAxiosAuth();

  const handleRegister = async() => {
    if (username && email && password && confirmPassword) {
      if (password === confirmPassword) {
        alert(`Đăng ký thành công với Tên tài khoản: ${username}, Email: ${email}`);
        const res = await axiosAuth.post('/api/auth/register', { username, email, password });
        if (res.status === 200) localStorage.setItem('accessToken', res.data.accessToken);
        else alert(res.data.message);
        navigate('/lobby');
      } else {
        alert('Mật khẩu và Nhập lại mật khẩu không khớp!');
      }
    } else {
      alert('Vui lòng điền đầy đủ thông tin!');
    }
  };

  const handleSwitchToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="login-container">
      <h1 className="skribbl-logo">SKRIBBL.io</h1>
      <div className="bg-blue-900 p-6 rounded-lg border-2 border-black w-96">
        <div className="form-header">Register</div>
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Reenter password:</label>
          <input
            type="password"
            placeholder="Reenter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <div className="confirm-btn-group">
          <button className="back-btn" onClick={handleSwitchToLogin}>Back</button>
          <button className="confirm-btn" onClick={handleRegister}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default Register;
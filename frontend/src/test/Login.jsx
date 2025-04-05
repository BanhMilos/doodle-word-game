import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // Hàm để đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Gửi yêu cầu POST đến backend để đăng nhập
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password,
      }, { withCredentials: true });  // Đảm bảo gửi cookie cùng yêu cầu

      // Lấy thông tin người dùng từ backend
      setMessage(response.data.message);
    } catch (err) {
        console.log(err);
      setMessage('Login failed: ' + err.response?.data?.message || err.message);
    }
  };


  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default Login;

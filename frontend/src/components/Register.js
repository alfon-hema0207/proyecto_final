import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import './styles/login.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await api.post('/auth/register', { username, password, role });
      setSuccess('Usuario creado con éxito. Ya puedes iniciar sesión.');
      setUsername('');
      setPassword('');
      setRole('user');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error en el registro');
    }
  };

  return (
    <div className="login-container">
      <h2>Registro de usuario</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="role-select"
          aria-label="Seleccionar rol"
        >
          <option value="user">Usuario</option>
          <option value="admin">Administrador</option>
          <option value="analyst">Analista</option>
        </select>
        <button type="submit">Registrar</button>
      </form>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
    </div>
  );
}

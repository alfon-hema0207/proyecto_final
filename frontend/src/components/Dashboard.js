import React from 'react';
import { useNavigate } from 'react-router-dom';
import VentasTables from './VentasTables';
import './styles/dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <h1>VISUALIZACIÓN DE DATOS</h1>
      <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button>
      <VentasTables />
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import api from '../api';
import './styles/graficos.css';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c', '#d0ed57', '#ffbb28'];

// Categorías y años predefinidos
const CATEGORIAS = ['Furniture', 'Office Supplies', 'Technology'];
const ANIOS = [2014, 2015, 2016, 2017];

const transformPorTiempo = (data) => {
  if (!data || data.length === 0) return [];
  
  const meses = {};
  data.forEach(({ year, month, total_ventas }) => {
    if (!meses[month]) meses[month] = { month };
    // Asegurar que el valor sea numérico
    meses[month][year] = Number(total_ventas) || 0;
  });
  return Object.values(meses);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{label}</p>
        {payload.map((item, i) => {
          // Manejo seguro de valores numéricos
          const numericValue = Number(item.value);
          const displayValue = isNaN(numericValue) 
            ? item.value 
            : `$${numericValue.toFixed(2)}`;
            
          return (
            <p key={i} style={{ color: item.color }}>
              {item.name}: {displayValue}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

const SkeletonChart = () => (
  <div className="chart-skeleton">
    <div className="skeleton-header" />
    <div className="skeleton-bars">
      {[...Array(5)].map((_, i) => <div key={i} className="skeleton-bar" />)}
    </div>
  </div>
);

const DataPlaceholder = ({ message }) => (
  <div className="data-placeholder">
    <p>{message}</p>
  </div>
);

export default function VentasTables() {
  const [filters, setFilters] = useState({
    year: '',
    region: '',
    category: '',
    month: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [porRegion, setPorRegion] = useState([]);
  const [porProducto, setPorProducto] = useState([]);
  const [porCliente, setPorCliente] = useState([]);
  const [porTiempo, setPorTiempo] = useState([]);

  const [regiones, setRegiones] = useState([]);
  const [chartTypeProducto, setChartTypeProducto] = useState('bar');
  const [chartTypeCliente, setChartTypeCliente] = useState('pie');
  const [activeTab, setActiveTab] = useState('resumen');

  const handleFilterChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const buildParams = () => {
    const params = {};
    if (filters.year) params.year = filters.year;
    if (filters.region) params.region = filters.region;
    if (filters.category) params.category = filters.category;
    if (filters.month) params.month = filters.month;
    return params;
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = buildParams();
      
      const [regionRes, productoRes, clienteRes, tiempoRes] = await Promise.all([
        api.get('/ventas/por-region', { params }),
        api.get('/ventas/por-producto', { params }),
        api.get('/ventas/por-cliente', { params }),
        api.get('/ventas/por-tiempo', { params })
      ]);

      // Procesar datos para asegurar valores numéricos
      setPorRegion(regionRes.data.map(item => ({
        ...item,
        total_ventas: Number(item.total_ventas) || 0
      })));

      setPorProducto(productoRes.data.map(item => ({
        ...item,
        total_ventas: Number(item.total_ventas) || 0,
        total_ganancia: Number(item.total_ganancia) || 0
      })));

      setPorCliente(clienteRes.data.map(item => ({
        ...item,
        total_ventas: Number(item.total_ventas) || 0
      })));

      setPorTiempo(tiempoRes.data.map(item => ({
        ...item,
        total_ventas: Number(item.total_ventas) || 0
      })));

      // Extraer regiones únicas para los filtros
      const regionesUnicas = [...new Set(regionRes.data.map(item => item.region))];
      setRegiones(regionesUnicas);

    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError('Error al cargar datos. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calcular métricas
  const totalVentas = porTiempo.reduce((acc, item) => acc + (Number(item.total_ventas) || 0), 0);
  const totalGanancias = porProducto.reduce((acc, p) => acc + (Number(p.total_ganancia) || 0), 0);
  const clientesUnicos = porCliente.length;
  const porTiempoTransformado = transformPorTiempo(porTiempo);
  
  // Top 10 productos más rentables
  const topRentables = [...porProducto]
    .sort((a, b) => (b.total_ganancia || 0) - (a.total_ganancia || 0))
    .slice(0, 10)
    .filter(item => item.product_name);

  // Productos con promedio de ventas
  const productosConPromedio = porProducto
    .filter(p => p.product_name)
    .map(p => ({
      product_name: p.product_name,
      avg_ventas: (p.total_ventas || 0) / (porProducto.length || 1),
      total_ventas: p.total_ventas || 0
    }));

  const handleRegionClick = data => {
    if (data?.activeLabel) {
      setFilters(f => ({ ...f, region: data.activeLabel }));
    }
  };

  const handleClienteClick = (data) => {
    if (data?.payload?.customer_name || data?.payload?.name) {
      const cliente = data.payload.customer_name || data.payload.name;
      setFilters(f => ({ ...f, cliente }));
    }
  };

  if (loading) {
    return (
      <div id="dashboard">
        <h2>Cargando dashboard...</h2>
        <SkeletonChart />
      </div>
    );
  }

  if (error) {
    return (
      <div id="dashboard">
        <h2>Error en el Dashboard</h2>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchData}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div id="dashboard">
      <h2>Dashboard de Ventas</h2>

      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'resumen' ? 'active' : ''} 
          onClick={() => setActiveTab('resumen')}
        >
          Resumen
        </button>
        <button 
          className={activeTab === 'productos' ? 'active' : ''} 
          onClick={() => setActiveTab('productos')}
        >
          Productos
        </button>
        <button 
          className={activeTab === 'clientes' ? 'active' : ''} 
          onClick={() => setActiveTab('clientes')}
        >
          Clientes
        </button>
        <button 
          className={activeTab === 'analisis' ? 'active' : ''} 
          onClick={() => setActiveTab('analisis')}
        >
          Análisis
        </button>
      </div>

      <div className="kpi-container expanded">
        <div className="kpi-card">
          <h4>Total Ventas</h4>
          <p>${totalVentas.toFixed(2)}</p>
        </div>
        <div className="kpi-card">
          <h4>Ganancia Total</h4>
          <p>${totalGanancias.toFixed(2)}</p>
        </div>
        <div className="kpi-card">
          <h4>Clientes únicos</h4>
          <p>{clientesUnicos}</p>
        </div>
        <div className="kpi-card">
          <h4>Productos Vendidos</h4>
          <p>{porProducto.length}</p>
        </div>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Año:</label>
          <select name="year" value={filters.year} onChange={handleFilterChange}>
            <option value="">Todos</option>
            {ANIOS.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Región:</label>
          <select name="region" value={filters.region} onChange={handleFilterChange}>
            <option value="">Todas</option>
            {regiones.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Categoría:</label>
          <select name="category" value={filters.category} onChange={handleFilterChange}>
            <option value="">Todas</option>
            {CATEGORIAS.map(categoria => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Mes:</label>
          <select name="month" value={filters.month} onChange={handleFilterChange}>
            <option value="">Todos</option>
            {Array.from({length: 12}, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
        
        <button onClick={fetchData} disabled={loading}>
          {loading ? 'Cargando...' : 'Aplicar filtros'}
        </button>
        <button onClick={() => {
          setFilters({ year: '', region: '', category: '', month: '' });
        }}>
          Limpiar filtros
        </button>
      </div>

      {activeTab === 'resumen' && (
        <>
          <h3>Ventas por Región</h3>
          <div className="chart-container">
            {porRegion.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={porRegion} onClick={handleRegionClick}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="total_ventas" 
                    fill="#8884d8" 
                    name="Ventas"
                    cursor="pointer" 
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <DataPlaceholder message="No hay datos de ventas por región" />
            )}
          </div>
        </>
      )}

      {activeTab === 'productos' && (
        <>
          <h3>Ventas por Producto</h3>
          <div className="chart-type-selector">
            <label>Tipo de gráfico:</label>
            <select 
              value={chartTypeProducto} 
              onChange={e => setChartTypeProducto(e.target.value)}
            >
              <option value="bar">Barras</option>
              <option value="line">Línea</option>
            </select>
          </div>
          <div className="chart-container">
            {porProducto.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {chartTypeProducto === 'bar' ? (
                  <BarChart data={topRentables}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="product_name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="total_ventas" fill="#82ca9d" name="Ventas" />
                    <Bar dataKey="total_ganancia" fill="#ffc658" name="Ganancia" />
                  </BarChart>
                ) : (
                  <LineChart data={productosConPromedio}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="product_name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="avg_ventas" 
                      stroke="#82ca9d" 
                      name="Ventas Promedio" 
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            ) : (
              <DataPlaceholder message="No hay datos de ventas por producto" />
            )}
          </div>
        </>
      )}

      {activeTab === 'clientes' && (
        <>
          <h3>Ventas por Cliente</h3>
          <div className="chart-type-selector">
            <label>Tipo de gráfico:</label>
            <select 
              value={chartTypeCliente} 
              onChange={e => setChartTypeCliente(e.target.value)}
            >
              <option value="pie">Pastel</option>
              <option value="bar">Barras</option>
            </select>
          </div>
          <div className="chart-container">
            {porCliente.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {chartTypeCliente === 'pie' ? (
                  <PieChart>
                    <Pie
                      data={porCliente}
                      dataKey="total_ventas"
                      nameKey="customer_name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                      onClick={handleClienteClick}
                      cursor="pointer"
                    >
                      {porCliente.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                ) : (
                  <BarChart data={porCliente} onClick={handleClienteClick}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="customer_name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="total_ventas" fill="#82ca9d" cursor="pointer" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            ) : (
              <DataPlaceholder message="No hay datos de ventas por cliente" />
            )}
          </div>
        </>
      )}

      {activeTab === 'analisis' && (
        <>
          <h3>Ventas por Tiempo (comparativa años)</h3>
          <div className="chart-container">
            {porTiempoTransformado.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={porTiempoTransformado}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {ANIOS.map((year, i) => (
                    <Line
                      key={year}
                      type="monotone"
                      dataKey={year.toString()}
                      stroke={COLORS[i % COLORS.length]}
                      name={year.toString()}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <DataPlaceholder message="No hay datos de ventas por tiempo" />
            )}
          </div>
        </>
      )}
    </div>
  );
}
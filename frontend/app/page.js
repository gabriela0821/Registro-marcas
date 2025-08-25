'use client';

import { useState, useEffect } from 'react';

const API_URL = 'https://registro-marcas-production.up.railway.app';

export default function MarcasApp() {
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMarca, setEditingMarca] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    titular: '',
    numero_registro: '',
    categoria: '',
    descripcion: '',
    estado: 'Activa'
  });

  // Cargar marcas al iniciar
  useEffect(() => {
    cargarMarcas();
  }, []);

  // Funciones de API
  const cargarMarcas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/marcas/`);
      if (response.ok) {
        const data = await response.json();
        setMarcas(data);
      } else {
        console.error('Error al cargar las marcas');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('Error de conexión con el servidor. ¿Está el backend corriendo en puerto 8000?');
    }
    setLoading(false);
  };

  const buscarMarcas = async (termino) => {
    if (!termino.trim()) {
      cargarMarcas();
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/marcas/buscar/${encodeURIComponent(termino)}`);
      if (response.ok) {
        const data = await response.json();
        setMarcas(data);
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
    }
    setLoading(false);
  };

  const guardarMarca = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingMarca 
        ? `${API_URL}/marcas/${editingMarca.id}`
        : `${API_URL}/marcas/`;
      
      const method = editingMarca ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert(editingMarca ? 'Marca actualizada exitosamente' : 'Marca creada exitosamente');
        resetForm();
        cargarMarcas();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.detail || 'Error al guardar la marca'}`);
      }
    } catch (error) {
      alert('Error de conexión con el servidor');
      console.error(error);
    }
    setLoading(false);
  };

  const eliminarMarca = async (id) => {
    if (!confirm('¿Está seguro de que desea eliminar esta marca?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/marcas/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Marca eliminada exitosamente');
        cargarMarcas();
      } else {
        alert('Error al eliminar la marca');
      }
    } catch (error) {
      alert('Error de conexión con el servidor');
      console.error(error);
    }
    setLoading(false);
  };

  const editarMarca = (marca) => {
    setEditingMarca(marca);
    setFormData({
      nombre: marca.nombre,
      titular: marca.titular,
      numero_registro: marca.numero_registro,
      categoria: marca.categoria,
      descripcion: marca.descripcion || '',
      estado: marca.estado
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      titular: '',
      numero_registro: '',
      categoria: '',
      descripcion: '',
      estado: 'Activa'
    });
    setEditingMarca(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    buscarMarcas(searchTerm);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Registros de Marca</h1>
              <p className="text-blue-100 mt-1">Sistema de gestión de marcas - Signa IP</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              {showForm ? 'Ver Lista' : 'Nueva Marca'}
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Formulario */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              {editingMarca ? 'Editar Marca' : 'Nueva Marca'}
            </h2>
            
            <form onSubmit={guardarMarca} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Marca *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titular *
                </label>
                <input
                  type="text"
                  name="titular"
                  value={formData.titular}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Registro *
                </label>
                <input
                  type="text"
                  name="numero_registro"
                  value={formData.numero_registro}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  <option value="Tecnología">Tecnología</option>
                  <option value="Alimentación">Alimentación</option>
                  <option value="Textil">Textil</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Farmacéutica">Farmacéutica</option>
                  <option value="Automotriz">Automotriz</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Activa">Activa</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Vencida">Vencida</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción opcional de la marca..."
                />
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Guardando...' : (editingMarca ? 'Actualizar' : 'Crear Marca')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de marcas */}
        {!showForm && (
          <div className="bg-white rounded-lg shadow-md">
            {/* Barra de búsqueda */}
            <div className="p-6 border-b border-gray-200">
              <form onSubmit={handleSearch} className="flex gap-4">
                <input
                  type="text"
                  placeholder="Buscar por nombre, titular o número de registro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Buscar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    cargarMarcas();
                  }}
                  className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Limpiar
                </button>
              </form>
            </div>

            {/* Tabla de marcas */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Cargando...</p>
                </div>
              ) : marcas.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No se encontraron registros de marca</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {searchTerm ? 'Prueba con otro término de búsqueda' : 'Haz clic en "Nueva Marca" para agregar el primer registro'}
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Marca
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Titular
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        N° Registro
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Registro
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {marcas.map((marca) => (
                      <tr key={marca.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{marca.nombre}</div>
                          {marca.descripcion && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {marca.descripcion}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {marca.titular}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {marca.numero_registro}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {marca.categoria}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            marca.estado === 'Activa' ? 'bg-green-100 text-green-800' :
                            marca.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                            marca.estado === 'Vencida' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {marca.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {marca.fecha_registro ? new Date(marca.fecha_registro).toLocaleDateString('es-ES') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => editarMarca(marca)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => eliminarMarca(marca.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
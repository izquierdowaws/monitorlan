import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { StatsWidget } from './components/StatsWidget';
import { DeviceCard } from './components/DeviceCard';
import { DeviceForm } from './components/DeviceForm';
import { HistoryModal } from './components/HistoryModal';
import { NetworkScanner } from './components/NetworkScanner';
import type { Device, Stats } from './types';
import { getDevices, getStats, deleteDevice, refreshDevices } from './api';
import { Plus, RefreshCw, Search, Lock, Unlock, FileText } from 'lucide-react';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ServiceManager } from './components/ServiceManager';
import { DeviceReport } from './components/DeviceReport';
import { GeneralReport } from './components/GeneralReport';


function AppContent() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, inactive: 0, warning: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [historyDevice, setHistoryDevice] = useState<Device | null>(null);
  const [serviceDevice, setServiceDevice] = useState<Device | null>(null);
  const [reportDevice, setReportDevice] = useState<Device | null>(null);
  const [isGeneralReportOpen, setIsGeneralReportOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const { isAdmin, logout } = useAdmin();


  const fetchData = async () => {
    try {
      const [devicesData, statsData] = await Promise.all([getDevices(), getStats()]);
      setDevices(devicesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este dispositivo?')) {
      await deleteDevice(id);
      fetchData();
    }
  };

  const handleEdit = (device: Device) => {
    setEditingDevice(device);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDevice(null);
  };

  const handleHistory = (device: Device) => {
    setHistoryDevice(device);
  };

  const handleManageServices = (device: Device) => {
    setServiceDevice(device);
  };

  const handleReport = (device: Device) => {
    setReportDevice(device);
  };

  const filteredDevices = devices.filter(device => {
    const statusMatch = filter === 'all' || device.status === filter;
    const typeMatch = typeFilter === 'all' || device.type === typeFilter;
    return statusMatch && typeMatch;
  });

  const clearFilters = () => {
    setFilter('all');
    setTypeFilter('all');
  };

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Estado de la Infraestructura</h2>
            <p className="text-dark-muted">Monitoreo en tiempo real de todos los dispositivos</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => isAdmin ? logout() : setIsAdminLoginOpen(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded border transition-colors ${isAdmin
                ? 'bg-red-900/20 border-red-800 text-red-400 hover:bg-red-900/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
                }`}
            >
              {isAdmin ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {isAdmin ? 'Salir Admin' : 'Modo Admin'}
            </button>

            <button
              onClick={async () => {
                setLoading(true);
                await refreshDevices();
                await fetchData();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => setIsGeneralReportOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded border border-slate-700 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Reporte General
                </button>
                <button
                  onClick={() => setIsScannerOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded border border-slate-700 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Escanear Red
                </button>
                <button
                  onClick={() => { setEditingDevice(null); setIsModalOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/40"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Dispositivo
                </button>
              </>
            )}

          </div>
        </div>

        <StatsWidget stats={stats} onFilterChange={setFilter} activeFilter={filter} />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-white">
              Dispositivos Monitoreados
            </h3>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
            >
              <option value="all">Todos los tipos ({devices.length})</option>
              <option value="server">Servidores ({devices.filter(d => d.type === 'server').length})</option>
              <option value="router">Routers ({devices.filter(d => d.type === 'router').length})</option>
              <option value="switch">Switches ({devices.filter(d => d.type === 'switch').length})</option>
              <option value="pc">Estaciones ({devices.filter(d => d.type === 'pc').length})</option>
              <option value="printer">Impresoras ({devices.filter(d => d.type === 'printer').length})</option>
              <option value="plc">PLCs ({devices.filter(d => d.type === 'plc').length})</option>
              <option value="phone">Teléfonos ({devices.filter(d => d.type === 'phone').length})</option>
              <option value="camera">Cámaras ({devices.filter(d => d.type === 'camera').length})</option>
              <option value="antenna">Antenas ({devices.filter(d => d.type === 'antenna').length})</option>
              <option value="firewall">Firewall ({devices.filter(d => d.type === 'firewall').length})</option>
              <option value="scanner">Escanner ({devices.filter(d => d.type === 'scanner').length})</option>
              <option value="as400">AS400 ({devices.filter(d => d.type === 'as400').length})</option>
              <option value="central_tel">Central Tel ({devices.filter(d => d.type === 'central_tel').length})</option>
              <option value="vmware">VMware ({devices.filter(d => d.type === 'vmware').length})</option>
              <option value="virtual_server">Servidor Virtual ({devices.filter(d => d.type === 'virtual_server').length})</option>
            </select>

            {(filter !== 'all' || typeFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-400 hover:text-blue-300 underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs text-green-500 font-medium">Monitoreo Activo</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500">Cargando dispositivos...</div>
        ) : filteredDevices.length === 0 ? (
          <div className="text-center py-20 bg-dark-card rounded-lg border border-slate-700 border-dashed">
            <p className="text-slate-400">
              {filter === 'all'
                ? 'No hay dispositivos configurados'
                : `No hay dispositivos con estado "${filter}"`}
            </p>
            {filter === 'all' && isAdmin && (
              <button
                onClick={() => { setEditingDevice(null); setIsModalOpen(true); }}
                className="mt-4 text-blue-400 hover:text-blue-300 underline"
              >
                Agregar el primero
              </button>
            )}

            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="mt-4 text-blue-400 hover:text-blue-300 underline"
              >
                Ver todos
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDevices.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onHistory={handleHistory}
                onManageServices={handleManageServices}
                onReport={handleReport}
              />
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <DeviceForm
          onClose={handleCloseModal}
          onSuccess={fetchData}
          deviceToEdit={editingDevice}
        />
      )}

      {historyDevice && (
        <HistoryModal
          device={historyDevice}
          onClose={() => setHistoryDevice(null)}
        />
      )}

      {isScannerOpen && (
        <NetworkScanner
          onClose={() => setIsScannerOpen(false)}
          onSuccess={fetchData}
        />
      )}

      {isAdminLoginOpen && (
        <AdminLoginModal onClose={() => setIsAdminLoginOpen(false)} />
      )}

      {serviceDevice && (
        <ServiceManager
          device={serviceDevice}
          onClose={() => setServiceDevice(null)}
          onUpdate={fetchData}
        />
      )}

      {reportDevice && (
        <DeviceReport
          device={reportDevice}
          onClose={() => setReportDevice(null)}
        />
      )}

      {isGeneralReportOpen && (
        <GeneralReport
          devices={devices}
          onClose={() => setIsGeneralReportOpen(false)}
        />
      )}
    </Layout>
  );
}

function App() {
  return (
    <AdminProvider>
      <AppContent />
    </AdminProvider>
  );
}


export default App;

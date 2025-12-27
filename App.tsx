import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Printer, 
  LogOut, 
  Menu, 
  X, 
  CheckCircle, 
  Clock, 
  Edit2, 
  Trash2, 
  Plus, 
  LayoutDashboard, 
  Settings, 
  Save, 
  AlertTriangle,
  RefreshCw,
  Search,
  ChevronRight,
  User as UserIcon,
  FileCheck,
  Lock,
  Briefcase,
  ShieldCheck,
  Info
} from 'lucide-react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Employee, AppSettings, DEFAULT_SETTINGS } from './types.ts';
import { ContractDocument } from './components/ContractDocument.tsx';

// --- SUPABASE INITIALIZATION ---
const getSupabaseConfig = () => {
  let envUrl = '';
  let envKey = '';
  try {
    const meta = (import.meta as any);
    if (meta && meta.env) {
      envUrl = meta.env.VITE_SUPABASE_URL || '';
      envKey = meta.env.VITE_SUPABASE_KEY || '';
    }
  } catch (e) {}
  const localUrl = localStorage.getItem('SB_URL');
  const localKey = localStorage.getItem('SB_KEY');
  return { 
    url: envUrl || localUrl || '', 
    key: envKey || localKey || '',
    source: envUrl ? 'env' : (localUrl ? 'manual' : 'none')
  };
};

let supabase: SupabaseClient | null = null;

// --- UI COMPONENTS ---
const InputField = ({ label, ...props }: any) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-gray-700 mb-1.5 tracking-wide uppercase">{label}</label>
    <input 
      {...props} 
      className={`w-full border border-gray-300 p-3 rounded-lg bg-white text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm ${props.className || ''}`} 
    />
  </div>
);

// --- MAPPING HELPERS ---
const mapDbToEmployee = (data: any): Employee => ({
  id: data.id,
  nip: data.nip,
  name: data.name,
  placeOfBirth: data.placeofbirth || '',
  dateOfBirth: data.dateofbirth || '',
  education: data.education,
  address: data.address,
  position: data.position,
  unit: data.unit,
  placementUnit: data.placement_unit || '',
  agreementNumber: data.agreementnumber || '',
  salaryAmount: data.salaryamount || '',
  salaryText: data.salarytext || '',
  status: data.status || 'pending',
  spmtNumber: data.spmtnumber || '',
  skNumber: data.sknumber || '',
  skDate: data.skdate || '',
  tmtDate: data.tmtdate || '',
  spmtDate: data.spmtdate || ''
});

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [view, setView] = useState<'dashboard' | 'employees' | 'settings' | 'print'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Connection State
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error' | 'not_configured'>('checking');

  const fetchData = async () => {
    if (!supabase) return;
    try {
      const { data: empData } = await supabase.from('employees').select('*').order('created_at', { ascending: false });
      if (empData) setEmployees(empData.map(mapDbToEmployee));
      
      const { data: setData } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
      if (setData) {
        setSettings({
          opdName: setData.opdname || DEFAULT_SETTINGS.opdName,
          logoUrl: setData.logourl || '',
          officialName: setData.officialname || DEFAULT_SETTINGS.officialName,
          officialNip: setData.officialnip || DEFAULT_SETTINGS.officialNip,
          officialPosition: setData.officialposition || DEFAULT_SETTINGS.officialPosition,
          officialRank: setData.officialrank || DEFAULT_SETTINGS.officialRank,
          skOfficial: setData.skofficial || DEFAULT_SETTINGS.skOfficial,
          signatureDate: setData.signaturedate || DEFAULT_SETTINGS.signatureDate,
        });
      }
    } catch (err) {}
  };

  useEffect(() => {
    const config = getSupabaseConfig();
    if (config.url && config.key) {
      const client = createClient(config.url, config.key);
      supabase = client;
      setDbStatus('connected');
      fetchData();
    } else {
      setDbStatus('not_configured');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    await new Promise(r => setTimeout(r, 800));

    if (username === 'admin' && password === 'admin') {
      setUser({ username: 'admin', role: 'admin', name: 'Administrator' });
    } else if (username === 'verifikator' && password === 'verifikator') {
      setUser({ username: 'verifikator', role: 'verifikator', name: 'Verifikator' });
    } else {
      const found = employees.find(emp => emp.nip === username && emp.nip === password);
      if (found) {
        setUser({ username: found.nip, role: 'employee', name: found.name });
      } else {
        setLoginError('NIP atau Password tidak sesuai.');
      }
    }
    setIsLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans text-black">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
          <div className="text-center mb-8">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} className="h-20 mx-auto mb-4 object-contain" />
            ) : (
              <FileText size={48} className="mx-auto text-indigo-600 mb-4" />
            )}
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-900">LOGIN PEGAWAI</h2>
            <p className="text-sm text-gray-500 mt-2">{settings.opdName}</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium border border-red-100">{loginError}</div>}
            
            <InputField 
              type="text" 
              label="NIP (Nomor Induk Pegawai)"
              placeholder="Masukkan 18 digit NIP tanpa spasi" 
              value={username} 
              onChange={(e: any) => setUsername(e.target.value)} 
            />
            
            <InputField 
              type="password" 
              label="Password (NIP)"
              placeholder="Masukkan NIP sebagai password" 
              value={password} 
              onChange={(e: any) => setPassword(e.target.value)} 
            />

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3 mt-4">
              <Info className="text-blue-600 shrink-0 mt-0.5" size={18} />
              <div className="text-xs text-blue-800">
                <p className="font-bold mb-1">Informasi Login:</p>
                <p>Bagi Pegawai, gunakan <strong>NIP</strong> Anda sebagai Username dan Password untuk login pertama kali.</p>
              </div>
            </div>

            <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 mt-6 flex justify-center items-center">
              {isLoading ? <RefreshCw className="animate-spin mr-2" size={18} /> : null}
              MASUK APLIKASI
            </button>
          </form>
          <p className="mt-8 text-center text-xs text-gray-400">SIPERJAKA v1.0 &copy; 2025</p>
        </div>
      </div>
    );
  }

  const NavItem = ({ id, label, icon: Icon }: any) => {
    const active = view === id;
    return (
      <button 
        onClick={() => setView(id)}
        className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group ${
          active 
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
          : 'text-gray-500 hover:bg-gray-50 hover:text-indigo-600'
        }`}
      >
        <Icon size={20} className={`${active ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600'} mr-3`} />
        <span className={`text-sm font-bold tracking-tight ${!isSidebarOpen && 'hidden'}`}>{label}</span>
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-black overflow-hidden">
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-white border-r border-gray-100 flex flex-col transition-all duration-300 shadow-sm z-30`}>
        <div className="p-6 flex items-center justify-between border-b border-gray-50">
          <div className={`flex items-center space-x-3 ${!isSidebarOpen && 'hidden'}`}>
             <div className="bg-indigo-600 p-1.5 rounded-lg">
               <FileCheck size={20} className="text-white" />
             </div>
             <span className="font-extrabold text-lg tracking-tighter text-gray-900">SIPERJAKA</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
          {user.role !== 'employee' && <NavItem id="employees" label="Data Pegawai" icon={Users} />}
          {user.role === 'admin' && <NavItem id="settings" label="Pengaturan" icon={Settings} />}
        </nav>

        <div className="p-4 mt-auto">
          <div className={`mb-4 p-4 bg-gray-50 rounded-2xl ${!isSidebarOpen && 'hidden'}`}>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold uppercase">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user.role}</p>
              </div>
            </div>
            <button 
              onClick={() => setUser(null)}
              className="w-full flex items-center justify-center px-4 py-2.5 bg-white border border-gray-200 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 transition-colors"
            >
              <LogOut size={14} className="mr-2" /> KELUAR
            </button>
          </div>
          {!isSidebarOpen && (
             <button onClick={() => setUser(null)} className="w-full p-3 text-red-600 hover:bg-red-50 rounded-xl flex justify-center">
               <LogOut size={24} />
             </button>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-gray-50/50">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 px-8 py-5 border-b border-gray-100 flex items-center justify-between">
           <div>
              <h2 className="text-xl font-extrabold tracking-tight text-gray-900 uppercase">
                {view.toUpperCase()}
              </h2>
              <p className="text-xs font-medium text-gray-400 mt-0.5 uppercase tracking-widest">{settings.opdName}</p>
           </div>
           <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${dbStatus === 'connected' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              <span className="text-[10px] font-bold text-gray-500 uppercase">{dbStatus}</span>
           </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {view === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit mb-4"><Users size={24} /></div>
                  <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Total Pegawai</h3>
                  <p className="text-3xl font-extrabold text-gray-900 mt-1">{employees.length}</p>
               </div>
               <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl w-fit mb-4"><Clock size={24} /></div>
                  <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Pending</h3>
                  <p className="text-3xl font-extrabold text-gray-900 mt-1">{employees.filter(e => e.status !== 'approved').length}</p>
               </div>
               <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit mb-4"><CheckCircle size={24} /></div>
                  <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Terverifikasi</h3>
                  <p className="text-3xl font-extrabold text-gray-900 mt-1">{employees.filter(e => e.status === 'approved').length}</p>
               </div>
            </div>
          )}

          {view === 'employees' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                  <div className="relative max-w-md w-full">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                     <input type="text" placeholder="Cari Pegawai..." className="w-full bg-gray-50 border border-gray-200 pl-11 pr-4 py-2.5 rounded-xl text-sm outline-none" />
                  </div>
               </div>
               <table className="w-full text-left">
                 <thead className="bg-gray-50/50">
                   <tr>
                     <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nama Pegawai</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unit Kerja</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Aksi</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                   {employees.map(emp => (
                     <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                       <td className="px-6 py-4">
                         <div className="font-bold text-sm text-gray-900">{emp.name}</div>
                         <div className="text-[10px] text-gray-400 font-medium">{emp.nip}</div>
                       </td>
                       <td className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">{emp.unit}</td>
                       <td className="px-6 py-4">
                         <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${emp.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                           {emp.status}
                         </span>
                       </td>
                       <td className="px-6 py-4 text-center">
                         <button className="p-2 text-gray-400 hover:text-indigo-600"><Edit2 size={16} /></button>
                         <button className="p-2 text-gray-400 hover:text-emerald-600"><Printer size={16} /></button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          )}

          {view === 'settings' && (
             <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-2xl">
                <h3 className="text-xl font-bold mb-6">PENGATURAN OPD</h3>
                <div className="space-y-4">
                   <InputField label="Nama OPD" defaultValue={settings.opdName} />
                   <InputField label="Nama Pejabat" defaultValue={settings.officialName} />
                   <InputField label="NIP Pejabat" defaultValue={settings.officialNip} />
                   <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition">SIMPAN</button>
                </div>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
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
  Upload, 
  Save, 
  AlertTriangle,
  Download,
  RefreshCw,
  Wifi,
  WifiOff,
  Loader2,
  Copy,
  Database,
  Unlink,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Server,
  FileSpreadsheet,
  Check,
  XCircle,
  ChevronRight,
  User as UserIcon,
  FileCheck,
  ClipboardCheck,
  Lock,
  Calendar,
  Search,
  ChevronLeft,
  Briefcase,
  Info
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Employee, AppSettings, DEFAULT_SETTINGS } from './types.ts';
import { ContractDocument } from './components/ContractDocument.tsx';
import { VerificationDocument } from './components/VerificationDocument.tsx';
import { SpmtDocument } from './components/SpmtDocument.tsx';

// --- SUPABASE INITIALIZATION ---
const getSupabaseConfig = () => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_KEY;
  const localUrl = localStorage.getItem('SB_URL');
  const localKey = localStorage.getItem('SB_KEY');
  
  const url = envUrl || localUrl || '';
  const key = envKey || localKey || '';
  const source = envUrl ? 'env' : (localUrl ? 'manual' : 'none');

  return { url, key, source };
};

let supabase: SupabaseClient | null = null;

// --- MAPPING HELPERS ---
const mapDbToSettings = (data: any): AppSettings => ({
  opdName: data.opdname || DEFAULT_SETTINGS.opdName,
  logoUrl: data.logourl || '',
  officialName: data.officialname || DEFAULT_SETTINGS.officialName,
  officialNip: data.officialnip || DEFAULT_SETTINGS.officialNip,
  officialPosition: data.officialposition || DEFAULT_SETTINGS.officialPosition,
  officialRank: data.officialrank || DEFAULT_SETTINGS.officialRank,
  skOfficial: data.skofficial || DEFAULT_SETTINGS.skOfficial,
  signatureDate: data.signaturedate || DEFAULT_SETTINGS.signatureDate,
});

const mapSettingsToDb = (settings: AppSettings) => ({
  opdname: settings.opdName,
  logourl: settings.logoUrl,
  officialname: settings.officialName,
  officialnip: settings.officialNip,
  officialposition: settings.officialPosition,
  officialrank: settings.officialRank,
  skofficial: settings.skOfficial,
  signaturedate: settings.signatureDate,
});

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
  // New Fields for SPMT
  spmtNumber: data.spmtnumber || '',
  skNumber: data.sknumber || '',
  skDate: data.skdate || '',
  tmtDate: data.tmtdate || '',
  spmtDate: data.spmtdate || ''
});

const mapEmployeeToDb = (emp: Employee) => ({
  id: emp.id,
  nip: emp.nip,
  name: emp.name,
  placeofbirth: emp.placeOfBirth,
  // FIX: Convert empty string to null for DATE types
  dateofbirth: emp.dateOfBirth || null,
  education: emp.education,
  address: emp.address,
  position: emp.position,
  unit: emp.unit,
  placement_unit: emp.placementUnit,
  agreementnumber: emp.agreementNumber,
  salaryamount: emp.salaryAmount,
  salarytext: emp.salaryText,
  status: emp.status,
  // New Fields
  spmtnumber: emp.spmtNumber,
  sknumber: emp.skNumber,
  // FIX: Convert empty string to null for DATE types
  skdate: emp.skDate || null,
  tmtdate: emp.tmtDate || null,
  spmtdate: emp.spmtDate || null
});

// --- HELPER FUNCTIONS ---
const generateTerbilang = (value: string | number): string => {
  const cleanValue = String(value).replace(/\D/g, '');
  const angka = Math.abs(Number(cleanValue));
  if (isNaN(angka) || angka === 0) return "";
  const huruf = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
  const convert = (num: number): string => {
    if (num < 12) return " " + huruf[num];
    if (num < 20) return convert(num - 10) + " Belas";
    if (num < 100) return convert(Math.floor(num / 10)) + " Puluh" + convert(num % 10);
    if (num < 200) return " Seratus" + convert(num - 100);
    if (num < 1000) return convert(Math.floor(num / 100)) + " Ratus" + convert(num % 100);
    if (num < 2000) return " Seribu" + convert(num - 1000);
    if (num < 1000000) return convert(Math.floor(num / 1000)) + " Ribu" + convert(num % 1000);
    if (num < 1000000000) return convert(Math.floor(num / 1000000)) + " Juta" + convert(num % 1000000);
    return "";
  }
  return convert(angka).trim() + " Rupiah";
};

const formatNumber = (value: string): string => {
  const raw = value.replace(/\D/g, '');
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// UI Components
const InputField = ({ label, ...props }: any) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-gray-700 mb-1.5 tracking-wide uppercase">{label}</label>
    <input 
      {...props} 
      className={`w-full border border-gray-300 p-3 rounded-lg bg-white text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm ${props.className || ''}`} 
    />
  </div>
);

const SelectField = ({ label, children, ...props }: any) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-gray-700 mb-1.5 tracking-wide uppercase">{label}</label>
    <select 
      {...props} 
      className={`w-full border border-gray-300 p-3 rounded-lg bg-white text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm ${props.className || ''}`}
    >
      {children}
    </select>
  </div>
);

// --- CONSTANTS ---
const PLACEMENT_UNITS = [
  "Bagian Hukum",
  "Bagian Pemerintahan",
  "Bagian Kesejahteraan Rakyat",
  "Bagian Administrasi Pembangunan",
  "Bagian Perekonomian dan SDA",
  "Bagian Pengadaan Barang dan Jasa",
  "Bagian Organisasi",
  "Bagian Protokol dan Komunikasi Pimpinan",
  "Bagian Umum"
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  
  const [view, setView] = useState<'dashboard' | 'employees' | 'print' | 'settings'>('dashboard');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Partial<Employee>>({});

  // Employee Self Service State
  const [isEmployeeEditing, setIsEmployeeEditing] = useState(false);
  const [isEmployeeApproveModalOpen, setIsEmployeeApproveModalOpen] = useState(false);

  // New States for Preview & Verification
  const [previewEmployee, setPreviewEmployee] = useState<Employee | null>(null);
  const [isVerifyConfirmOpen, setIsVerifyConfirmOpen] = useState(false);

  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Status Change State (Admin)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusTargetEmployee, setStatusTargetEmployee] = useState<Employee | null>(null);
  const [newStatus, setNewStatus] = useState<string>('pending');

  // Print Verification State
  const [isPrintVerifyModalOpen, setIsPrintVerifyModalOpen] = useState(false);
  const [printVerifyTarget, setPrintVerifyTarget] = useState<Employee | null>(null);
  const [verifyFormData, setVerifyFormData] = useState({
    verifierName: '',
    verifierNip: '',
    verifyDate: new Date().toISOString().split('T')[0]
  });

  const [employeeFormData, setEmployeeFormData] = useState<Employee | null>(null);
  const [tempSettings, setTempSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Search & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // DB State
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error' | 'not_configured'>('checking');
  const [dbErrorMessage, setDbErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [configSource, setConfigSource] = useState<'env' | 'manual' | 'none'>('none');
  
  const [inputDbUrl, setInputDbUrl] = useState('');
  const [inputDbKey, setInputDbKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  // --- DATABASE LOGIC ---
  const fetchData = async () => {
    if (!supabase) return;
    try {
      const { data: empData, error: empErr } = await supabase.from('employees').select('*').order('created_at', { ascending: false });
      if (empErr) console.error("Error fetch employees:", empErr);
      if (empData) {
        setEmployees(empData.map(mapDbToEmployee));
      }

      const { data: setData, error: setErr } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
      if (setErr) console.error("Error fetch settings:", setErr);
      if (setData) {
        const mappedSettings = mapDbToSettings(setData);
        setSettings(mappedSettings);
        setTempSettings(mappedSettings);
      }
    } catch (err) {
      console.error("Fetch Data Crash:", err);
    }
  };

  const connectDB = async (url: string, key: string, saveToStorage: boolean = false) => {
    if (!url || !key) {
      setDbStatus('not_configured');
      return;
    }
    
    setDbStatus('checking');
    setDbErrorMessage('');

    try {
      new URL(url); 
      const client = createClient(url, key);
      const { error } = await client.from('settings').select('id').limit(1);
      
      if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
        throw error;
      }

      supabase = client;
      setDbStatus('connected');
      
      if (saveToStorage) {
        localStorage.setItem('SB_URL', url);
        localStorage.setItem('SB_KEY', key);
        setConfigSource('manual');
      }
      
      fetchData();
    } catch (err: any) {
      console.error("Connection Failed:", err);
      setDbStatus('error');
      
      let msg = 'Gagal terhubung. Pastikan URL dan Key benar.';
      if (err) {
        if (typeof err === 'string') msg = err;
        else if (err.message) msg = err.message;
        else if (err.error_description) msg = err.error_description;
        else msg = JSON.stringify(err);
      }
      setDbErrorMessage(msg);
    }
  };

  const handleManualConnect = (e: React.FormEvent) => {
    e.preventDefault();
    connectDB(inputDbUrl, inputDbKey, true);
  };

  const handleDisconnect = () => {
    if(confirm("Apakah Anda yakin ingin memutus koneksi database manual ini?")) {
      supabase = null;
      localStorage.removeItem('SB_URL');
      localStorage.removeItem('SB_KEY');
      setInputDbUrl('');
      setInputDbKey('');
      setDbStatus('not_configured');
      setConfigSource('none');
    }
  };

  useEffect(() => {
    const config = getSupabaseConfig();
    
    if (config.url && config.key) {
      setInputDbUrl(config.url);
      setInputDbKey(config.key);
      setConfigSource(config.source as 'env' | 'manual');
      connectDB(config.url, config.key, false);
    } else {
      setDbStatus('not_configured');
      setConfigSource('none');
    }
  }, []);

  // Update Favicon based on Settings
  useEffect(() => {
    if (settings.logoUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.logoUrl;
    }
  }, [settings.logoUrl]);

  // Reset Search & Page on View Change
  useEffect(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, [view]);

  // --- HANDLERS ---
  const handleSaveEmployeeAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return alert("Database tidak terhubung!");
    setIsSaving(true);
    
    const targetEmployee = {
      ...editingEmployee,
      id: editingEmployee.id || Math.random().toString(36).substr(2, 9),
      status: editingEmployee.status || 'pending',
      created_at: new Date().toISOString()
    } as Employee;

    const dbPayload = mapEmployeeToDb(targetEmployee);

    try {
      const { error } = await supabase.from('employees').upsert(dbPayload);
      if (error) throw error;
      
      await fetchData();
      setIsModalOpen(false);
      alert("Data pegawai berhasil disimpan!");
    } catch (err: any) {
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmployeeSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return alert("Database tidak terhubung!");
    if (!editingEmployee.id) return;

    setIsSaving(true);
    
    const targetEmployee = {
      ...editingEmployee,
      status: 'pending' 
    } as Employee;

    const dbPayload = mapEmployeeToDb(targetEmployee);

    try {
      const { error } = await supabase.from('employees').upsert(dbPayload);
      if (error) throw error;
      
      setEmployees(prev => prev.map(emp => emp.id === targetEmployee.id ? targetEmployee : emp));
      setEditingEmployee(targetEmployee);
      setIsEmployeeEditing(false); 
      alert("Data berhasil diperbarui. Silakan klik 'Data Sudah Benar' jika sudah sesuai.");
    } catch (err: any) {
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmployeeApprove = async () => {
    setIsSaving(true);
    
    // Status update: pending -> verified_by_employee
    const targetEmployee = {
      ...editingEmployee,
      status: 'verified_by_employee'
    } as Employee;

    // Jika Supabase tidak terkoneksi, lakukan Mock untuk demo UI
    if (!supabase) {
       await new Promise(resolve => setTimeout(resolve, 1500)); // Simulasi delay
       setEmployees(prev => prev.map(emp => emp.id === targetEmployee.id ? targetEmployee : emp));
       setEditingEmployee(targetEmployee);
       setIsEmployeeEditing(false);
       setIsSaving(false);
       setIsEmployeeApproveModalOpen(false); // Close modal
       alert("Data berhasil disetujui (Mode Demo).");
       return;
    }

    const dbPayload = mapEmployeeToDb(targetEmployee);

    try {
      const { error } = await supabase.from('employees').upsert(dbPayload);
      if (error) throw error;
      
      setEmployees(prev => prev.map(emp => emp.id === targetEmployee.id ? targetEmployee : emp));
      setEditingEmployee(targetEmployee);
      setIsEmployeeEditing(false);
      setIsEmployeeApproveModalOpen(false); // Close modal
      alert("Terima kasih. Data Anda telah disetujui dan akan diperiksa oleh Verifikator.");
    } catch (err: any) {
      alert("Gagal menyetujui: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Verifikator Approval
  const handleVerifikatorApprove = async () => {
    if (!supabase) return alert("Database tidak terhubung!");
    if (!previewEmployee) return;

    setIsSaving(true);
    
    // Status update: verified_by_employee -> approved
    const targetEmployee = {
      ...previewEmployee,
      status: 'approved'
    } as Employee;

    const dbPayload = mapEmployeeToDb(targetEmployee);

    try {
      const { error } = await supabase.from('employees').upsert(dbPayload);
      if (error) throw error;
      
      setEmployees(prev => prev.map(emp => emp.id === targetEmployee.id ? targetEmployee : emp));
      setPreviewEmployee(targetEmployee); // Update preview state
      setIsVerifyConfirmOpen(false);
      alert("Data berhasil diverifikasi!");
    } catch (err: any) {
      alert("Gagal memverifikasi: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ADMIN: Change Status Handler
  const handleStatusChangeClick = (emp: Employee) => {
    setStatusTargetEmployee(emp);
    setNewStatus(emp.status);
    setIsStatusModalOpen(true);
  };

  const executeStatusChange = async () => {
    if (!supabase) return alert("Database tidak terhubung!");
    if (!statusTargetEmployee) return;

    setIsSaving(true);
    const targetEmployee = {
      ...statusTargetEmployee,
      status: newStatus as any
    };

    const dbPayload = mapEmployeeToDb(targetEmployee);

    try {
       const { error } = await supabase.from('employees').upsert(dbPayload);
       if (error) throw error;

       setEmployees(prev => prev.map(emp => emp.id === targetEmployee.id ? targetEmployee : emp));
       setIsStatusModalOpen(false);
       setStatusTargetEmployee(null);
       alert("Status berhasil diperbarui!");
    } catch (err: any) {
      alert("Gagal ubah status: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrintContract = (emp: Employee) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Pop-up blocked! Silakan izinkan pop-up untuk situs ini agar bisa mencetak.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Cetak Perjanjian - ${emp.name}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Tinos:wght@400;700&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            body { font-family: 'Inter', sans-serif; background-color: white; }
            .contract-font { font-family: 'Tinos', serif; font-size: 12pt; line-height: 1.5; color: black !important; }
            .contract-font * { color: black !important; }
            @media print {
              @page { size: A4; margin: 2cm; }
              body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body><div id="print-root"></div></body>
      </html>
    `);
    
    printWindow.document.close();

    const rootDiv = printWindow.document.getElementById('print-root');
    if (rootDiv) {
      const root = ReactDOM.createRoot(rootDiv);
      root.render(
        <React.StrictMode>
          <ContractDocument employee={emp} settings={settings} />
        </React.StrictMode>
      );
      const script = printWindow.document.createElement('script');
      script.textContent = `window.onload = () => { setTimeout(() => { window.print(); }, 1000); };`;
      printWindow.document.body.appendChild(script);
    }
  };

  const handlePrintSPMT = (emp: Employee) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Pop-up blocked! Silakan izinkan pop-up untuk situs ini agar bisa mencetak.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Cetak SPMT - ${emp.name}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Tinos:wght@400;700&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            body { font-family: 'Inter', sans-serif; background-color: white; }
            .contract-font { font-family: 'Tinos', serif; font-size: 12pt; line-height: 1.5; color: black !important; }
            .contract-font * { color: black !important; }
            @media print {
              @page { size: A4; margin: 2cm; }
              body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
              .no-print { display: none !important; }
              .spmt-font {
                  font-family: Arial, Helvetica, sans-serif !important;
                  font-size: 10pt; /* Diubah dari 11pt ke 10pt */
                  line-height: 1.2; /* Diubah dari 1.3 ke 1.2 */
                  color: black !important;
                  width: 100%;
              }
              .spmt-font * {
                 color: black !important;
              }
            }
          </style>
        </head>
        <body><div id="print-root"></div></body>
      </html>
    `);
    
    printWindow.document.close();

    const rootDiv = printWindow.document.getElementById('print-root');
    if (rootDiv) {
      const root = ReactDOM.createRoot(rootDiv);
      root.render(
        <React.StrictMode>
          <SpmtDocument employee={emp} settings={settings} />
        </React.StrictMode>
      );
      const script = printWindow.document.createElement('script');
      script.textContent = `window.onload = () => { setTimeout(() => { window.print(); }, 1000); };`;
      printWindow.document.body.appendChild(script);
    }
  };

  const handlePrintVerificationClick = (emp: Employee) => {
    setPrintVerifyTarget(emp);
    // Set default values based on logged in user or reset
    setVerifyFormData({
      verifierName: user?.name || '',
      verifierNip: user?.role === 'verifikator' && user.username !== 'verifikator' ? user.username : '',
      verifyDate: new Date().toISOString().split('T')[0]
    });
    setIsPrintVerifyModalOpen(true);
  };

  const executePrintVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!printVerifyTarget) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Pop-up blocked! Silakan izinkan pop-up untuk situs ini agar bisa mencetak.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Cetak Verifikasi - ${printVerifyTarget.name}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            body { font-family: 'Inter', sans-serif; background-color: white; }
            @media print {
              @page { size: A4; margin: 1.5cm; }
              body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body><div id="print-root"></div></body>
      </html>
    `);
    
    printWindow.document.close();

    const rootDiv = printWindow.document.getElementById('print-root');
    if (rootDiv) {
      const root = ReactDOM.createRoot(rootDiv);
      root.render(
        <React.StrictMode>
          <VerificationDocument 
            employee={printVerifyTarget} 
            settings={settings} 
            verifierName={verifyFormData.verifierName}
            verifierNip={verifyFormData.verifierNip}
            verifyDate={verifyFormData.verifyDate}
          />
        </React.StrictMode>
      );
      const script = printWindow.document.createElement('script');
      script.textContent = `window.onload = () => { setTimeout(() => { window.print(); }, 1000); };`;
      printWindow.document.body.appendChild(script);
    }
    
    setIsPrintVerifyModalOpen(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return alert("Database tidak terhubung!");
    setIsSaving(true);
    
    const dbPayload = mapSettingsToDb(tempSettings);

    try {
      const { error } = await supabase.from('settings').upsert({ id: 1, ...dbPayload });
      if (error) throw error;
      setSettings(tempSettings);
      alert('Pengaturan instansi berhasil disimpan!');
    } catch (err: any) {
      alert("Gagal simpan pengaturan: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempSettings(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [{ "NIP": "199001012022011001", "Nama Lengkap": "Contoh Nama Pegawai", "Tempat Lahir": "Demak", "Tanggal Lahir (YYYY-MM-DD)": "1990-01-01", "Pendidikan": "S-1 Teknik Informatika", "Alamat": "Jl. Contoh No. 1, Demak", "Jabatan": "Pranata Komputer", "Unit Kerja": "Sekretariat Daerah", "Nomor Perjanjian": "001", "Gaji Pokok": "2500000", "Unit Penempatan": "Bagian Organisasi" }];
    const ws = XLSX.utils.json_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Template_Import_Pegawai.xlsx");
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!supabase) return alert("Database tidak terhubung!");
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          alert("File kosong!");
          setIsImporting(false);
          return;
        }

        const employeesToUpsert = data.map((row: any) => {
          const rawSalary = row["Gaji Pokok"] ? String(row["Gaji Pokok"]) : "0";
          return mapEmployeeToDb({
            id: row["NIP"] || Math.random().toString(36).substr(2, 9),
            nip: row["NIP"] ? String(row["NIP"]) : "",
            name: row["Nama Lengkap"],
            placeOfBirth: row["Tempat Lahir"],
            dateOfBirth: row["Tanggal Lahir (YYYY-MM-DD)"],
            education: row["Pendidikan"],
            address: row["Alamat"],
            position: row["Jabatan"],
            unit: row["Unit Kerja"],
            placementUnit: row["Unit Penempatan"] || "",
            agreementNumber: row["Nomor Perjanjian"] ? String(row["Nomor Perjanjian"]) : "",
            salaryAmount: formatNumber(rawSalary),
            salaryText: generateTerbilang(rawSalary),
            status: 'pending'
          } as Employee);
        });

        const validData = employeesToUpsert.filter(e => e.nip && e.name);
        
        if (validData.length === 0) {
           alert("Tidak ada data valid yang ditemukan.");
           setIsImporting(false);
           return;
        }

        const { error } = await supabase.from('employees').upsert(validData, { onConflict: 'nip' });
        if (error) throw error;
        
        alert(`Berhasil mengimpor ${validData.length} data pegawai!`);
        if (importInputRef.current) importInputRef.current.value = "";
        await fetchData();

      } catch (err: any) {
        console.error(err);
        alert("Gagal impor: " + err.message);
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const executeDeleteEmployee = async () => {
    if (!deleteTargetId || !supabase) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('employees').delete().eq('id', deleteTargetId);
      if (error) throw error;
      setEmployees(employees.filter(e => e.id !== deleteTargetId));
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
    } catch (err: any) {
      alert("Gagal hapus: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      setUser({ username: 'admin', role: 'admin', name: 'Administrator' });
      setView('dashboard');
    } else if (username === 'verifikator' && password === 'verifikator') {
      setUser({ username: 'verifikator', role: 'verifikator', name: 'Verifikator Kepegawaian' });
      setView('dashboard');
    } else {
      const found = employees.find(emp => emp.nip === username && emp.nip === password);
      if (found) {
        setUser({ username: found.nip, role: 'employee', name: found.name });
        setSelectedEmployeeId(found.id);
        setEditingEmployee({...found});
        setIsEmployeeEditing(false);
      } else {
        setLoginError('NIP atau Password salah');
      }
    }
  };

  const handleSalaryChange = (value: string) => {
    const formatted = formatNumber(value);
    const terbilang = generateTerbilang(value);
    setEditingEmployee(prev => ({ 
      ...prev, 
      salaryAmount: formatted,
      salaryText: terbilang
    }));
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

            <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 mt-6">MASUK APLIKASI</button>
          </form>
          <p className="mt-8 text-center text-xs text-gray-400">SIPERJAKA v1.0 &copy; 2025</p>
        </div>
      </div>
    );
  }

  // --- STATISTIK DASHBOARD ---
  const countPending = employees.filter(e => e.status === 'pending').length;
  const countVerified = employees.filter(e => e.status === 'verified_by_employee').length;
  const countApproved = employees.filter(e => e.status === 'approved').length;

  // --- FILTER & PAGINATION LOGIC ---
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.nip.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans text-black overflow-hidden">
      
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (user.role === 'admin' || user.role === 'verifikator') && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ADMIN & VERIFIKATOR SIDEBAR */}
      {(user.role === 'admin' || user.role === 'verifikator') && (
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl md:shadow-none flex flex-col`}>
          <div className="p-8 border-b border-slate-800 text-center flex flex-col items-center">
            {settings.logoUrl && <img src={settings.logoUrl} className="h-16 mb-4 object-contain" />}
            <span className="font-bold text-xl tracking-tight">SIPERJAKA</span>
            <p className="text-[10px] text-gray-400 uppercase mt-2 px-2 leading-relaxed tracking-wider">{settings.opdName}</p>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded mt-2 text-slate-300 border border-slate-700 uppercase">{user.role}</span>
          </div>
          <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
            <div className="px-4 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Menu Utama</div>
            <button onClick={() => { setView('dashboard'); setIsSidebarOpen(false); }} className={`w-full flex items-center p-3.5 rounded-lg text-sm font-medium transition-all ${view === 'dashboard' ? 'bg-indigo-600 shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 text-gray-300 hover:text-white'}`}><LayoutDashboard className="mr-3.5" size={20}/> Dashboard</button>
            
            {user.role === 'admin' && (
               <>
                 <div className="px-4 mb-2 mt-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Data & Dokumen</div>
                 <button onClick={() => { setView('employees'); setIsSidebarOpen(false); }} className={`w-full flex items-center p-3.5 rounded-lg text-sm font-medium transition-all ${view === 'employees' ? 'bg-indigo-600 shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 text-gray-300 hover:text-white'}`}><Users className="mr-3.5" size={20}/> Data Pegawai</button>
                 <button onClick={() => { setView('print'); setIsSidebarOpen(false); }} className={`w-full flex items-center p-3.5 rounded-lg text-sm font-medium transition-all ${view === 'print' ? 'bg-indigo-600 shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 text-gray-300 hover:text-white'}`}><Printer className="mr-3.5" size={20}/> Cetak Dokumen</button>
                 
                 <div className="px-4 mb-2 mt-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sistem</div>
                 <button onClick={() => { setView('settings'); setIsSidebarOpen(false); }} className={`w-full flex items-center p-3.5 rounded-lg text-sm font-medium transition-all ${view === 'settings' ? 'bg-indigo-600 shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 text-gray-300 hover:text-white'}`}><Settings className="mr-3.5" size={20}/> Pengaturan</button>
               </>
            )}

            {user.role === 'verifikator' && (
               <>
                 <div className="px-4 mb-2 mt-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Verifikasi</div>
                 <button onClick={() => { setView('print'); setIsSidebarOpen(false); }} className={`w-full flex items-center p-3.5 rounded-lg text-sm font-medium transition-all ${view === 'print' ? 'bg-indigo-600 shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 text-gray-300 hover:text-white'}`}><FileCheck className="mr-3.5" size={20}/> Verifikasi Data</button>
               </>
            )}

          </nav>
          <div className="p-4 border-t border-slate-800">
            <button onClick={() => setUser(null)} className="w-full flex items-center justify-center p-3 rounded-lg text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors font-medium text-sm"><LogOut className="mr-2" size={18}/> Keluar Aplikasi</button>
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* HEADER ADMIN/VERIFIKATOR MOBILE */}
        {(user.role === 'admin' || user.role === 'verifikator') && (
          <header className="bg-white/80 backdrop-blur-md shadow-sm h-16 flex items-center px-6 md:hidden justify-between sticky top-0 z-30">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 -ml-2 text-gray-700"><Menu size={24} /></button>
            <span className="font-bold text-gray-800 tracking-tight">SIPERJAKA</span>
            <div className="w-8"></div>
          </header>
        )}

        {/* HEADER PEGAWAI (NO SIDEBAR) */}
        {user.role === 'employee' && (
           <header className="bg-slate-900 text-white h-16 flex items-center justify-between px-6 shadow-md shrink-0">
              <div className="flex items-center">
                {settings.logoUrl && <img src={settings.logoUrl} className="h-8 mr-3 bg-white rounded p-0.5" />}
                <div>
                  <h1 className="font-bold text-lg leading-tight tracking-tight">SIPERJAKA</h1>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">{settings.opdName}</p>
                </div>
              </div>
              <button onClick={() => setUser(null)} className="flex items-center text-sm font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-lg transition">
                 <LogOut size={16} className="mr-2"/> Keluar
              </button>
           </header>
        )}

        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-8">
          
          {/* --- PEGAWAI VIEW --- */}
          {user.role === 'employee' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className={`p-6 rounded-2xl border-l-4 shadow-lg flex items-start ${editingEmployee.status === 'approved' || editingEmployee.status === 'verified_by_employee' ? 'bg-white border-green-500 text-green-800' : 'bg-white border-yellow-500 text-yellow-800'}`}>
                 <div className={`p-3 rounded-full mr-4 ${editingEmployee.status === 'approved' || editingEmployee.status === 'verified_by_employee' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                    {editingEmployee.status === 'approved' || editingEmployee.status === 'verified_by_employee' ? <CheckCircle size={28} className="text-green-600"/> : <AlertTriangle size={28} className="text-yellow-600"/>}
                 </div>
                 <div>
                    <h2 className="font-bold text-xl text-gray-900">{editingEmployee.status === 'approved' || editingEmployee.status === 'verified_by_employee' ? 'Data Terverifikasi' : 'Verifikasi Data Diperlukan'}</h2>
                    <p className="text-gray-600 mt-1 leading-relaxed">
                      {editingEmployee.status === 'approved' || editingEmployee.status === 'verified_by_employee'
                        ? 'Terima kasih, data Anda telah disetujui. Admin akan segera mencetak perjanjian kerja Anda.'
                        : 'Mohon periksa kebenaran data di bawah ini. Jika ada kesalahan, klik tombol "Ajukan Perbaikan". Jika sudah sesuai, klik "Data Sudah Benar".'
                      }
                    </p>
                 </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                   <h3 className="font-bold text-xl text-gray-800 flex items-center">
                      <FileText className="mr-3 text-indigo-600"/> Data Perjanjian Kerja
                   </h3>
                   <div className="text-xs font-bold px-4 py-1.5 bg-white border border-gray-200 rounded-full text-gray-600 shadow-sm">
                      NIP: {user.username}
                   </div>
                </div>

                <form onSubmit={handleEmployeeSave} className="p-8 space-y-8">
                  <div>
                    <h4 className="text-xs font-bold text-indigo-600 uppercase mb-6 tracking-wider border-b pb-2 flex items-center"><UserIcon size={14} className="mr-2"/> I. Data Identitas</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField label="Nama Lengkap" disabled={!isEmployeeEditing} value={editingEmployee.name || ''} onChange={(e:any) => setEditingEmployee({...editingEmployee, name: e.target.value})} className={!isEmployeeEditing ? "bg-gray-100 text-gray-600" : ""} />
                      <InputField label="NIP" disabled value={editingEmployee.nip || ''} className="bg-gray-100 text-gray-600" />
                      <InputField label="Tempat Lahir" disabled={!isEmployeeEditing} value={editingEmployee.placeOfBirth || ''} onChange={(e:any) => setEditingEmployee({...editingEmployee, placeOfBirth: e.target.value})} className={!isEmployeeEditing ? "bg-gray-100 text-gray-600" : ""} />
                      <InputField label="Tanggal Lahir" type="date" disabled={!isEmployeeEditing} value={editingEmployee.dateOfBirth || ''} onChange={(e:any) => setEditingEmployee({...editingEmployee, dateOfBirth: e.target.value})} className={!isEmployeeEditing ? "bg-gray-100 text-gray-600" : ""} />
                      <div className="md:col-span-2">
                        <InputField label="Alamat Lengkap" disabled={!isEmployeeEditing} value={editingEmployee.address || ''} onChange={(e:any) => setEditingEmployee({...editingEmployee, address: e.target.value})} className={!isEmployeeEditing ? "bg-gray-100 text-gray-600" : ""} />
                      </div>
                      <InputField label="Pendidikan Terakhir" disabled={!isEmployeeEditing} value={editingEmployee.education || ''} onChange={(e:any) => setEditingEmployee({...editingEmployee, education: e.target.value})} className={!isEmployeeEditing ? "bg-gray-100 text-gray-600" : ""} />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-indigo-600 uppercase mb-6 tracking-wider border-b pb-2 flex items-center"><LayoutDashboard size={14} className="mr-2"/> II. Data Pekerjaan</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField label="Jabatan" disabled value={editingEmployee.position || ''} className="bg-gray-100 text-gray-600" />
                      <InputField label="Unit Kerja" disabled value={editingEmployee.unit || ''} className="bg-gray-100 text-gray-600" />
                      <div className="md:col-span-2">
                        <SelectField 
                          label="Unit Penempatan (SPMT)" 
                          disabled={true} 
                          value={editingEmployee.placementUnit || ''} 
                          onChange={(e:any) => setEditingEmployee({...editingEmployee, placementUnit: e.target.value})}
                          className="bg-gray-100 text-gray-600"
                        >
                           <option value="">-- Pilih Unit Penempatan --</option>
                           {PLACEMENT_UNITS.map(unit => (
                              <option key={unit} value={unit}>{unit}</option>
                           ))}
                        </SelectField>
                      </div>
                      <InputField label="Gaji Pokok" disabled value={`Rp. ${editingEmployee.salaryAmount || '0'}`} className="bg-gray-100 text-gray-500 font-medium" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-indigo-600 uppercase mb-6 tracking-wider border-b pb-2 flex items-center"><Briefcase size={14} className="mr-2"/> III. Data SK & SPMT</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField label="Nomor SPMT" placeholder="Contoh: 821/..." disabled={true} value={editingEmployee.spmtNumber || ''} onChange={(e:any) => setEditingEmployee({...editingEmployee, spmtNumber: e.target.value})} className="bg-gray-100 text-gray-600" />
                      <InputField type="date" label="Tanggal SPMT (Melaksanakan Tugas)" disabled={!isEmployeeEditing} value={editingEmployee.spmtDate || ''} onChange={(e:any) => setEditingEmployee({...editingEmployee, spmtDate: e.target.value})} className={!isEmployeeEditing ? "bg-white border-gray-300" : "bg-gray-100 text-gray-600"} />
                      <InputField label="Nomor SK Pengangkatan" placeholder="Contoh: 810/..." disabled={!isEmployeeEditing} value={editingEmployee.skNumber || ''} onChange={(e:any) => setEditingEmployee({...editingEmployee, skNumber: e.target.value})} className={!isEmployeeEditing ? "bg-gray-100 text-gray-600" : ""} />
                      <InputField type="date" label="Tanggal SK" disabled={!isEmployeeEditing} value={editingEmployee.skDate || ''} onChange={(e:any) => setEditingEmployee({...editingEmployee, skDate: e.target.value})} className={!isEmployeeEditing ? "bg-gray-100 text-gray-600" : ""} />
                      <div className="md:col-span-2">
                        <InputField type="date" label="TMT Pengangkatan" disabled={!isEmployeeEditing} value={editingEmployee.tmtDate || ''} onChange={(e:any) => setEditingEmployee({...editingEmployee, tmtDate: e.target.value})} className={!isEmployeeEditing ? "bg-gray-100 text-gray-600" : ""} />
                      </div>
                    </div>
                  </div>

                  {editingEmployee.status === 'pending' && (
                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                      {!isEmployeeEditing ? (
                        <>
                          <button type="button" onClick={() => setIsEmployeeEditing(true)} className="px-6 py-3 bg-white border border-yellow-500 text-yellow-700 hover:bg-yellow-50 rounded-xl font-bold flex items-center transition shadow-sm">
                            <Edit2 size={18} className="mr-2"/> Ajukan Perbaikan Data
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setIsEmployeeApproveModalOpen(true)}
                            disabled={isSaving}
                            className={`px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center transition shadow-lg shadow-indigo-200 ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}`}
                          >
                            <CheckCircle size={18} className="mr-2"/>
                            Data Sudah Benar
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => { setIsEmployeeEditing(false); setEditingEmployee({...employeeFormData!}); }} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold transition">
                            Batal
                          </button>
                          <button type="submit" disabled={isSaving} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center transition shadow-lg shadow-indigo-200">
                            {isSaving ? <Loader2 className="animate-spin mr-2"/> : <Save size={18} className="mr-2"/>}
                            Simpan Perubahan
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* --- ADMIN & VERIFIKATOR: DASHBOARD --- */}
          {(user.role === 'admin' || user.role === 'verifikator') && view === 'dashboard' && (
            <div className="space-y-8">
               <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard {user.role === 'verifikator' ? 'Verifikator' : ''}</h2>
                    <p className="text-gray-500 mt-1">Ringkasan data pegawai dan status verifikasi</p>
                  </div>
                  <div className="text-right hidden md:block">
                     <p className="text-sm font-bold text-gray-400 uppercase">Status Sistem</p>
                     <div className="flex items-center justify-end mt-1 text-sm">
                        {dbStatus === 'connected' ? (
                          <span className="flex items-center text-green-600 font-bold"><Wifi size={16} className="mr-1.5"/> Online</span>
                        ) : (
                          <span className="flex items-center text-red-600 font-bold"><WifiOff size={16} className="mr-1.5"/> Offline</span>
                        )}
                     </div>
                  </div>
               </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-default relative overflow-hidden group">
                  <div className="absolute right-0 top-0 h-32 w-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                  <div className="relative">
                    <div className="p-3 bg-blue-100 w-fit rounded-xl text-blue-600 mb-4"><Users size={28} /></div>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Pegawai</p>
                    <h3 className="text-4xl font-bold text-slate-800 mt-1">{employees.length}</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-default relative overflow-hidden group">
                   <div className="absolute right-0 top-0 h-32 w-32 bg-yellow-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                   <div className="relative">
                    <div className="p-3 bg-yellow-100 w-fit rounded-xl text-yellow-600 mb-4"><Clock size={28} /></div>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Menunggu Verifikasi</p>
                    <h3 className="text-4xl font-bold text-slate-800 mt-1">
                      {user.role === 'verifikator' ? countVerified : countPending + countVerified}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {user.role === 'verifikator' ? '(Sudah disetujui pegawai)' : '(Termasuk belum disetujui pegawai)'}
                    </p>
                   </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-default relative overflow-hidden group">
                   <div className="absolute right-0 top-0 h-32 w-32 bg-green-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                   <div className="relative">
                    <div className="p-3 bg-green-100 w-fit rounded-xl text-green-600 mb-4"><CheckCircle size={28} /></div>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Siap Cetak</p>
                    <h3 className="text-4xl font-bold text-slate-800 mt-1">{countApproved}</h3>
                   </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 text-white shadow-xl shadow-indigo-200">
                 <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-xl font-bold">Mulai Kelola Data</h3>
                      <p className="text-indigo-100 opacity-90 mt-1">Import data pegawai dari Excel atau tambahkan secara manual.</p>
                    </div>
                    {user.role === 'admin' && (
                      <button onClick={() => setView('employees')} className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition shadow-lg flex items-center">
                         Kelola Data Pegawai <ChevronRight className="ml-2" size={18} />
                      </button>
                    )}
                    {user.role === 'verifikator' && (
                      <button onClick={() => setView('print')} className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition shadow-lg flex items-center">
                         Mulai Verifikasi <ChevronRight className="ml-2" size={18} />
                      </button>
                    )}
                 </div>
              </div>
            </div>
          )}

          {/* --- ADMIN: EMPLOYEES LIST --- */}
          {user.role === 'admin' && view === 'employees' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                   <h2 className="text-2xl font-bold text-slate-800">Data Pegawai</h2>
                   <p className="text-gray-500 text-sm">Kelola data dan status verifikasi</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  <button onClick={handleDownloadTemplate} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg flex items-center text-sm font-bold shadow-sm transition">
                    <FileSpreadsheet size={18} className="mr-2"/> Template
                  </button>
                  <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg flex items-center text-sm font-bold cursor-pointer shadow-sm transition">
                    {isImporting ? <Loader2 className="animate-spin mr-2"/> : <Upload size={18} className="mr-2"/>}
                    Import Excel
                    <input type="file" ref={importInputRef} onChange={handleImportExcel} accept=".xlsx,.xls" className="hidden"/>
                  </label>
                  <button onClick={() => { setEditingEmployee({}); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center text-sm font-bold shadow-sm transition">
                    <Plus size={18} className="mr-2"/> Manual
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Cari Nama atau NIP..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition text-sm font-medium"
                />
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Nama / NIP</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Jabatan</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Unit Kerja</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedEmployees.map(emp => (
                        <tr key={emp.id} className="hover:bg-gray-50/80 transition">
                          <td className="p-4">
                            <div className="font-bold text-gray-900">{emp.name}</div>
                            <div className="text-xs font-mono text-gray-500 mt-0.5">{emp.nip}</div>
                          </td>
                          <td className="p-4 text-sm text-gray-700">{emp.position}</td>
                          <td className="p-4 text-sm text-gray-700">{emp.unit}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${emp.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : (emp.status === 'verified_by_employee' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200')}`}>
                              {emp.status === 'approved' ? 'Terverifikasi' : (emp.status === 'verified_by_employee' ? 'Dicek Pegawai' : 'Pending')}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleStatusChangeClick(emp)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition" title="Ubah Status"><RefreshCw size={16} /></button>
                              <button onClick={() => { setEditingEmployee(emp); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit Data"><Edit2 size={16} /></button>
                              <button onClick={() => handleDeleteClick(emp.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Hapus Data"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {paginatedEmployees.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-12 text-center text-gray-400">
                             <div className="flex flex-col items-center">
                               <Users size={48} className="text-gray-200 mb-4"/>
                               <p>{searchTerm ? 'Data tidak ditemukan.' : 'Belum ada data pegawai.'}</p>
                               {!searchTerm && <p className="text-xs mt-1">Silakan import excel atau tambah manual.</p>}
                             </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Control */}
                {filteredEmployees.length > ITEMS_PER_PAGE && (
                  <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                     <span className="text-sm text-gray-600">
                       Menampilkan {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredEmployees.length)} dari {filteredEmployees.length} data
                     </span>
                     <div className="flex gap-2">
                       <button 
                         onClick={() => setCurrentPage(c => Math.max(1, c - 1))} 
                         disabled={currentPage === 1}
                         className={`p-2 rounded-lg border border-gray-200 ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 text-gray-700 shadow-sm'}`}
                       >
                         <ChevronLeft size={18} />
                       </button>
                       <span className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-indigo-600 shadow-sm">
                         {currentPage}
                       </span>
                       <button 
                         onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))} 
                         disabled={currentPage === totalPages}
                         className={`p-2 rounded-lg border border-gray-200 ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 text-gray-700 shadow-sm'}`}
                       >
                         <ChevronRight size={18} />
                       </button>
                     </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- ADMIN & VERIFIKATOR: PRINT/VERIFY VIEW (TABLE) --- */}
          {(user.role === 'admin' || user.role === 'verifikator') && view === 'print' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {user.role === 'admin' ? 'Cetak Dokumen' : 'Verifikasi Data'}
                </h2>
                <p className="text-gray-500 text-sm">
                  {user.role === 'admin' ? 'Cetak perjanjian kerja untuk pegawai yang telah diverifikasi' : 'Periksa dan setujui data pegawai'}
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Cari Nama atau NIP..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition text-sm font-medium"
                />
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Nama / NIP</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Jabatan</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">No. Kontrak</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedEmployees.map(emp => (
                        <tr key={emp.id} className="hover:bg-gray-50/80 transition group">
                          <td className="p-4">
                            <div className="font-bold text-gray-900">{emp.name}</div>
                            <div className="text-xs font-mono text-gray-500 mt-0.5">{emp.nip}</div>
                          </td>
                          <td className="p-4 text-sm text-gray-700">{emp.position}</td>
                          <td className="p-4 text-sm text-gray-700">{emp.agreementNumber}</td>
                          <td className="p-4">
                             <div className="flex items-center">
                               <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center 
                                  ${emp.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : 
                                   (emp.status === 'verified_by_employee' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                   'bg-yellow-50 text-yellow-700 border-yellow-200')}`}>
                                {emp.status === 'approved' ? <CheckCircle size={12} className="mr-1.5"/> : (emp.status === 'verified_by_employee' ? <UserIcon size={12} className="mr-1.5"/> : <Clock size={12} className="mr-1.5"/>)}
                                {emp.status === 'approved' ? 'Siap Cetak' : (emp.status === 'verified_by_employee' ? 'Dicek Pegawai' : 'Pending')}
                              </span>
                             </div>
                          </td>
                          <td className="p-4 text-right">
                             <div className="flex justify-end gap-2">
                               {emp.status !== 'pending' && (
                                 <button onClick={() => handlePrintVerificationClick(emp)} className="text-gray-400 hover:text-indigo-600 transition p-2 hover:bg-indigo-50 rounded-full" title="Cetak Lembar Verifikasi">
                                   <ClipboardCheck size={20} />
                                 </button>
                               )}
                               <button onClick={() => setPreviewEmployee(emp)} className="text-gray-400 hover:text-indigo-600 transition p-2 hover:bg-indigo-50 rounded-full" title="Lihat Detail & Aksi">
                                 <Eye size={20} />
                               </button>
                             </div>
                          </td>
                        </tr>
                      ))}
                      {paginatedEmployees.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-12 text-center text-gray-400">
                             <div className="flex flex-col items-center">
                               <Printer size={48} className="text-gray-200 mb-4"/>
                               <p>{searchTerm ? 'Data tidak ditemukan.' : 'Belum ada data pegawai.'}</p>
                             </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Control */}
                {filteredEmployees.length > ITEMS_PER_PAGE && (
                  <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                     <span className="text-sm text-gray-600">
                       Menampilkan {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredEmployees.length)} dari {filteredEmployees.length} data
                     </span>
                     <div className="flex gap-2">
                       <button 
                         onClick={() => setCurrentPage(c => Math.max(1, c - 1))} 
                         disabled={currentPage === 1}
                         className={`p-2 rounded-lg border border-gray-200 ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 text-gray-700 shadow-sm'}`}
                       >
                         <ChevronLeft size={18} />
                       </button>
                       <span className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-indigo-600 shadow-sm">
                         {currentPage}
                       </span>
                       <button 
                         onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))} 
                         disabled={currentPage === totalPages}
                         className={`p-2 rounded-lg border border-gray-200 ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 text-gray-700 shadow-sm'}`}
                       >
                         <ChevronRight size={18} />
                       </button>
                     </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- ADMIN: SETTINGS --- */}
          {user.role === 'admin' && view === 'settings' && (
             <div className="max-w-4xl mx-auto space-y-8">
               <div>
                  <h2 className="text-2xl font-bold text-slate-800">Pengaturan Aplikasi</h2>
                  <p className="text-gray-500 text-sm">Konfigurasi instansi dan koneksi database</p>
               </div>
               
               {/* 1. Database Configuration */}
               <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                     <div>
                       <h3 className="font-bold text-gray-900 flex items-center"><Database className="mr-2 text-indigo-600" size={20}/> Koneksi Database</h3>
                       <p className="text-xs text-gray-500 mt-1">Status saat ini: 
                          <span className={`font-bold ml-1 ${dbStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                             {dbStatus === 'connected' ? 'TERHUBUNG' : dbStatus === 'checking' ? 'MEMERIKSA...' : 'TERPUTUS'}
                          </span>
                       </p>
                     </div>
                     {configSource !== 'none' && (
                       <span className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold border border-indigo-100 uppercase tracking-wide">
                         Sumber: {configSource === 'env' ? 'Environment' : 'Manual'}
                       </span>
                     )}
                  </div>
                  
                  <div className="p-6">
                    {dbErrorMessage && (
                      <div className="mb-6 bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl text-sm flex items-start">
                        <AlertTriangle className="mr-2 shrink-0" size={18}/>
                        {dbErrorMessage}
                      </div>
                    )}

                    {configSource === 'env' ? (
                       <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                         <Server size={32} className="mx-auto text-gray-300 mb-2"/>
                         <p>Aplikasi menggunakan konfigurasi dari server (Environment Variables).</p>
                         <p className="text-xs">Anda tidak perlu mengatur koneksi secara manual.</p>
                       </div>
                    ) : (
                       <form onSubmit={handleManualConnect} className="space-y-4 max-w-2xl">
                         <InputField 
                           label="Supabase URL"
                           placeholder="https://xyz.supabase.co"
                           value={inputDbUrl}
                           onChange={(e:any) => setInputDbUrl(e.target.value)}
                           disabled={dbStatus === 'connected'}
                         />
                         <div className="relative">
                            <InputField 
                              type={showKey ? "text" : "password"}
                              label="Supabase Anon Key"
                              placeholder="eyJhbGciOiJIUzI1NiIsInR..."
                              value={inputDbKey}
                              onChange={(e:any) => setInputDbKey(e.target.value)}
                              disabled={dbStatus === 'connected'}
                              className="pr-10"
                            />
                            <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                              {showKey ? <EyeOff size={18}/> : <Eye size={18}/>}
                            </button>
                         </div>
                         
                         <div className="pt-2">
                           {dbStatus !== 'connected' ? (
                              <button className="bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 text-sm">Hubungkan Database</button>
                           ) : (
                              <button type="button" onClick={handleDisconnect} className="bg-white border border-red-200 text-red-600 font-bold py-2.5 px-6 rounded-lg hover:bg-red-50 transition text-sm">Putus Koneksi Manual</button>
                           )}
                         </div>
                       </form>
                    )}
                  </div>
               </div>

               {/* 2. App Settings */}
               <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                     <h3 className="font-bold text-gray-900 flex items-center"><Settings className="mr-2 text-indigo-600" size={20}/> Profil Instansi & Pejabat</h3>
                  </div>

                  <div className="p-6 space-y-6">
                    <div>
                      <InputField 
                        label="Nama Instansi / OPD" 
                        value={tempSettings.opdName} 
                        onChange={(e:any) => setTempSettings({...tempSettings, opdName: e.target.value})} 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 tracking-wide uppercase">Logo Instansi</label>
                      <div className="flex items-center gap-6 p-4 border border-gray-200 rounded-xl bg-gray-50">
                        {tempSettings.logoUrl ? (
                          <img src={tempSettings.logoUrl} className="h-20 w-20 object-contain bg-white rounded-lg shadow-sm p-2 border" />
                        ) : (
                          <div className="h-20 w-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">No Logo</div>
                        )}
                        <div>
                          <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition cursor-pointer" accept="image/*" />
                          <p className="text-xs text-gray-400 mt-2">Format: PNG, JPG (Max 1MB disarankan)</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                      <h4 className="font-bold text-sm text-indigo-600 mb-4 uppercase tracking-wide">Pejabat Penandatangan (Pihak Kesatu)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Nama Pejabat" value={tempSettings.officialName} onChange={(e:any) => setTempSettings({...tempSettings, officialName: e.target.value})} />
                        <InputField label="NIP Pejabat" value={tempSettings.officialNip} onChange={(e:any) => setTempSettings({...tempSettings, officialNip: e.target.value})} />
                        <InputField label="Pangkat / Golongan Ruang" value={tempSettings.officialRank} onChange={(e:any) => setTempSettings({...tempSettings, officialRank: e.target.value})} placeholder="Contoh: Pembina Tingkat I (IV/b)" />
                        <InputField label="Jabatan Struktural" value={tempSettings.officialPosition} onChange={(e:any) => setTempSettings({...tempSettings, officialPosition: e.target.value})} />
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                       <h4 className="font-bold text-sm text-indigo-600 mb-4 uppercase tracking-wide">Data Referensi SK</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InputField label="Pejabat yang Mengangkat SK" value={tempSettings.skOfficial} onChange={(e:any) => setTempSettings({...tempSettings, skOfficial: e.target.value})} placeholder="Contoh: BUPATI DEMAK" />
                          <InputField type="date" label="Tanggal Penandatanganan Kontrak (Default)" value={tempSettings.signatureDate} onChange={(e:any) => setTempSettings({...tempSettings, signatureDate: e.target.value})} />
                       </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold flex items-center shadow-lg shadow-indigo-200 transition">
                      {isSaving ? <Loader2 className="animate-spin mr-2"/> : <Save size={18} className="mr-2" />} Simpan Pengaturan
                    </button>
                  </div>
               </form>
             </div>
          )}

        </main>
      </div>

      {/* MODAL EDIT / TAMBAH PEGAWAI (ADMIN) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto flex flex-col">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-800">{editingEmployee.id ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition"><X size={20}/></button>
            </div>
            <form onSubmit={handleSaveEmployeeAdmin} className="p-6 space-y-6 flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField required label="NIP (Username)" value={editingEmployee.nip || ''} onChange={(e:any) => setEditingEmployee({...editingEmployee, nip: e.target.value})} />
                <InputField required label="Nama Lengkap" value={editingEmployee.name || ''} onChange={(e:any) => setEditingEmployee({...editingEmployee, name: e.target.value})} />
                <InputField label="Tempat Lahir" value={editingEmployee.placeOfBirth || ''} onChange={(e:any) => setEditingEmployee({...editingEmployee, placeOfBirth: e.target.value})} />
                <InputField type="date" label="Tanggal Lahir" value={editingEmployee.dateOfBirth || ''} onChange={(e:any) => setEditingEmployee({...editingEmployee, dateOfBirth: e.target.value})} />
                <InputField label="Pendidikan Terakhir" value={editingEmployee.education || ''} onChange={(e:any) => setEditingEmployee({...editingEmployee, education: e.target.value})} />
                <InputField label="Jabatan" value={editingEmployee.position || ''} onChange={(e:any) => setEditingEmployee({...editingEmployee, position: e.target.value})} />
                <div className="md:col-span-2">
                   <InputField label="Alamat Lengkap" value={editingEmployee.address || ''} onChange={(e:any) => setEditingEmployee({...editingEmployee, address: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                   <InputField label="Unit Kerja" value={editingEmployee.unit || ''} onChange={(e:any) => setEditingEmployee({...editingEmployee, unit: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                   <SelectField 
                      label="Unit Penempatan (SPMT)" 
                      value={editingEmployee.placementUnit || ''} 
                      onChange={(e:any) => setEditingEmployee({...editingEmployee, placementUnit: e.target.value})}
                   >
                     <option value="">-- Pilih Unit Penempatan --</option>
                     {PLACEMENT_UNITS.map(unit => (
                       <option key={unit} value={unit}>{unit}</option>
                     ))}
                   </SelectField>
                </div>
                
                <div className="md:col-span-2 border-t pt-4">
                  <h4 className="font-bold text-sm text-indigo-600 uppercase tracking-wide">Detail Kontrak & Gaji</h4>
                </div>
                <InputField label="Nomor Perjanjian" value={editingEmployee.agreementNumber || ''} onChange={(e:any) => setEditingEmployee({...editingEmployee, agreementNumber: e.target.value})} />
                <InputField label="Gaji Pokok (Angka)" value={editingEmployee.salaryAmount || ''} onChange={(e:any) => handleSalaryChange(e.target.value)} />
                <div className="md:col-span-2">
                   <InputField label="Gaji Terbilang" readOnly value={editingEmployee.salaryText || ''} className="bg-gray-100 text-gray-500 italic" />
                </div>

                {/* NEW SECTION: DATA SK & SPMT */}
                <div className="md:col-span-2 border-t pt-4">
                  <h4 className="font-bold text-sm text-indigo-600 uppercase tracking-wide flex items-center"><Briefcase size={16} className="mr-2"/> Data SK & SPMT</h4>
                </div>
                <InputField label="Nomor SPMT" placeholder="Contoh: 821/..." value={editingEmployee.spmtNumber || ''} onChange={(e:any) => setEditingEmployee({...editingEmployee, spmtNumber: e.target.value})} />
                <InputField type="date" label="Tanggal SPMT (Melaksanakan Tugas)" value={editingEmployee.spmtDate || ''} onChange={(e:any) => setEditingEmployee({...editingEmployee, spmtDate: e.target.value})} />
                <InputField label="Nomor SK Pengangkatan" placeholder="Contoh: 810/..." value={editingEmployee.skNumber || ''} onChange={(e:any) => setEditingEmployee({...editingEmployee, skNumber: e.target.value})} />
                <InputField type="date" label="Tanggal SK" value={editingEmployee.skDate || ''} onChange={(e:any) => setEditingEmployee({...editingEmployee, skDate: e.target.value})} />
                <div className="md:col-span-2">
                   <InputField type="date" label="TMT Pengangkatan" value={editingEmployee.tmtDate || ''} onChange={(e:any) => setEditingEmployee({...editingEmployee, tmtDate: e.target.value})} />
                </div>

              </div>
            </form>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-gray-600 hover:bg-gray-200 rounded-lg font-bold transition">Batal</button>
                <button onClick={handleSaveEmployeeAdmin} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-lg font-bold flex items-center shadow-lg shadow-indigo-200 transition">
                  {isSaving ? <Loader2 className="animate-spin mr-2"/> : <Save size={18} className="mr-2"/>} Simpan Data
                </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRINT VERIFICATION FORM */}
      {isPrintVerifyModalOpen && printVerifyTarget && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
               <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Cetak Lembar Verifikasi</h3>
                    <p className="text-xs text-gray-500">{printVerifyTarget.name}</p>
                  </div>
                  <button onClick={() => setIsPrintVerifyModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={20}/></button>
               </div>
               <form onSubmit={executePrintVerification} className="p-6 space-y-4">
                  <InputField 
                    label="Nama Verifikator" 
                    value={verifyFormData.verifierName} 
                    onChange={(e:any) => setVerifyFormData({...verifyFormData, verifierName: e.target.value})}
                    required 
                  />
                  <InputField 
                    label="NIP Verifikator" 
                    value={verifyFormData.verifierNip} 
                    onChange={(e:any) => setVerifyFormData({...verifyFormData, verifierNip: e.target.value})}
                    placeholder="Contoh: 19800101..." 
                  />
                  <InputField 
                    type="date"
                    label="Tanggal Verifikasi" 
                    value={verifyFormData.verifyDate} 
                    onChange={(e:any) => setVerifyFormData({...verifyFormData, verifyDate: e.target.value})}
                    required 
                  />
                  <div className="pt-4 flex gap-3">
                     <button type="button" onClick={() => setIsPrintVerifyModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-600 transition">Batal</button>
                     <button type="submit" className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold text-white transition flex justify-center items-center shadow-lg shadow-indigo-200">
                        <Printer size={18} className="mr-2"/> Cetak Sekarang
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/* MODAL PREVIEW DOKUMEN (ADMIN & VERIFIKATOR) */}
      {previewEmployee && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-gray-100 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
             
             {/* Header Modal */}
             <div className="bg-white p-4 border-b flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">Preview Dokumen Kontrak</h3>
                  <p className="text-xs text-gray-500">{previewEmployee.name} - {previewEmployee.nip}</p>
                </div>
                <button onClick={() => setPreviewEmployee(null)} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={20}/></button>
             </div>

             {/* Content Scrollable */}
             <div className="flex-1 overflow-auto p-8 flex justify-center bg-gray-200">
                <div className="scale-90 origin-top shadow-2xl">
                   <ContractDocument employee={previewEmployee} settings={settings} />
                </div>
             </div>

             {/* Footer Action */}
             <div className="bg-white p-4 border-t flex justify-between items-center shrink-0">
                <div className="text-sm text-gray-500 flex items-center">
                  Status Saat Ini: 
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${previewEmployee.status === 'approved' ? 'bg-green-100 text-green-700' : (previewEmployee.status === 'verified_by_employee' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700')}`}>
                    {previewEmployee.status === 'approved' ? 'Siap Cetak' : (previewEmployee.status === 'verified_by_employee' ? 'Dicek Pegawai' : 'Pending')}
                  </span>
                </div>
                <div className="flex gap-3 items-center">
                   {previewEmployee.status === 'pending' && user.role === 'verifikator' && (
                     <div className="text-orange-600 text-sm font-bold flex items-center mr-2">
                        <Lock size={16} className="mr-2"/> Menunggu Persetujuan Pegawai
                     </div>
                   )}
                   
                   {/* Tombol Verifikasi hanya muncul jika verified_by_employee */}
                   {user.role === 'verifikator' && previewEmployee.status === 'verified_by_employee' && (
                      <button onClick={() => setIsVerifyConfirmOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center shadow-sm transition">
                        <Check size={18} className="mr-2"/> Verifikasi
                      </button>
                   )}

                   {/* Tombol Cetak hanya muncul jika approved */}
                   {previewEmployee.status === 'approved' && (
                     <>
                       {/* Cetak Verifikasi hanya jika Verifikator/Admin dan sudah diapprove */}
                       <button onClick={() => handlePrintVerificationClick(previewEmployee)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-bold flex items-center shadow-sm transition">
                          <ClipboardCheck size={18} className="mr-2"/> Verif
                       </button>

                       <button onClick={() => handlePrintSPMT(previewEmployee)} className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-lg font-bold flex items-center shadow-sm transition">
                          <Briefcase size={18} className="mr-2"/> SPMT
                       </button>

                       <button onClick={() => handlePrintContract(previewEmployee)} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg font-bold flex items-center shadow-sm transition">
                          <Printer size={18} className="mr-2"/> Kontrak
                       </button>
                     </>
                   )}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* MODAL UBAH STATUS (ADMIN) */}
      {isStatusModalOpen && statusTargetEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 transition-opacity">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col">
              <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                 <div>
                   <h3 className="text-lg font-bold text-gray-800">Ubah Status</h3>
                   <p className="text-xs text-gray-500">{statusTargetEmployee.name}</p>
                 </div>
                 <button onClick={() => setIsStatusModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={20}/></button>
              </div>
              <div className="p-6 space-y-4">
                 <SelectField 
                   label="Pilih Status Baru" 
                   value={newStatus} 
                   onChange={(e:any) => setNewStatus(e.target.value)}
                 >
                   <option value="pending">Pending</option>
                   <option value="verified_by_employee">Dicek Pegawai (Menunggu Verifikator)</option>
                   <option value="approved">Terverifikasi (Siap Cetak)</option>
                 </SelectField>
                 
                 <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs">
                    <strong>Catatan:</strong> Mengubah status secara manual akan melewati proses verifikasi standar. Pastikan data sudah benar.
                 </div>

                 <div className="pt-2 flex gap-3">
                    <button onClick={() => setIsStatusModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-600 transition">Batal</button>
                    <button onClick={executeStatusChange} disabled={isSaving} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold text-white transition flex justify-center items-center shadow-lg shadow-indigo-200">
                       {isSaving ? <Loader2 className="animate-spin mr-2" size={18}/> : <Save size={18} className="mr-2"/>} Simpan
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* MODAL KONFIRMASI VERIFIKASI */}
      {isVerifyConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
           <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                <Check size={32}/>
              </div>
              <h3 className="font-bold text-xl mb-2">Setujui Data Pegawai?</h3>
              <p className="text-sm text-gray-600 mb-6">
                Dengan memverifikasi, Anda menyatakan bahwa data pegawai ini sudah benar dan siap untuk dicetak.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setIsVerifyConfirmOpen(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700 transition">Batal</button>
                <button onClick={handleVerifikatorApprove} disabled={isSaving} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold text-white transition flex justify-center items-center">
                   {isSaving ? <Loader2 className="animate-spin" size={18}/> : 'Ya, Verifikasi'}
                </button>
              </div>
           </div>
        </div>
      )}
      
      {/* MODAL KONFIRMASI DATA BENAR (PEGAWAI) */}
      {isEmployeeApproveModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
           <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                <CheckCircle size={32}/>
              </div>
              <h3 className="font-bold text-xl mb-2">Konfirmasi Kebenaran Data</h3>
              <p className="text-sm text-gray-600 mb-6">
                Apakah Anda yakin data yang Anda masukkan sudah benar? <br/>
                <span className="font-bold text-red-500">Data tidak dapat diubah setelah Anda menyetujuinya.</span>
              </p>
              <div className="flex gap-3">
                <button onClick={() => setIsEmployeeApproveModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700 transition">Periksa Lagi</button>
                <button onClick={handleEmployeeApprove} disabled={isSaving} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold text-white transition flex justify-center items-center shadow-lg">
                   {isSaving ? <Loader2 className="animate-spin" size={18}/> : 'Ya, Data Benar'}
                </button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
           <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                <Trash2 size={32}/>
              </div>
              <h3 className="font-bold text-xl mb-2">Hapus Data Pegawai?</h3>
              <p className="text-sm text-gray-600 mb-6">
                Tindakan ini tidak dapat dibatalkan. Data pegawai akan dihapus secara permanen dari sistem.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700 transition">Batal</button>
                <button onClick={executeDeleteEmployee} disabled={isSaving} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-white transition flex justify-center items-center">
                   {isSaving ? <Loader2 className="animate-spin" size={18}/> : 'Ya, Hapus'}
                </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
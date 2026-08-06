import React, { useState, useEffect, useRef } from 'react';
import bgAsnBerakhlak from './src/assets/images/asn_berakhlak_bg_1785981972790.jpg';
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
  Info,
  ShieldCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, getDocs, doc, setDoc, deleteDoc, query, orderBy, getDoc, writeBatch } from 'firebase/firestore';
import { User, Employee, AppSettings, DEFAULT_SETTINGS } from './types.ts';
import { ContractDocument } from './components/ContractDocument.tsx';
import { VerificationDocument } from './components/VerificationDocument.tsx';
import { SpmtDocument } from './components/SpmtDocument.tsx';

// --- FIREBASE INITIALIZATION ---
import firebaseConfig from './firebase-applet-config.json';
const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

// --- MAPPING HELPERS ---
const sanitizeForFirestore = (obj: Record<string, any>) => {
  const clean: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    clean[key] = obj[key] === undefined ? '' : obj[key];
  }
  return clean;
};

const mapDbToSettings = (data: any): AppSettings => ({
  opdName: data?.opdName || DEFAULT_SETTINGS.opdName,
  logoUrl: data?.logoUrl || '',
  kopImageUrl: data?.kopImageUrl || '',
  officialName: data?.officialName || DEFAULT_SETTINGS.officialName,
  officialNip: data?.officialNip || DEFAULT_SETTINGS.officialNip,
  officialPosition: data?.officialPosition || DEFAULT_SETTINGS.officialPosition,
  officialRank: data?.officialRank || DEFAULT_SETTINGS.officialRank,
  skOfficial: data?.skOfficial || DEFAULT_SETTINGS.skOfficial,
  signatureDate: data?.signatureDate || DEFAULT_SETTINGS.signatureDate,
});

const mapSettingsToDb = (settings: Partial<AppSettings>) => sanitizeForFirestore({
  opdName: settings.opdName || DEFAULT_SETTINGS.opdName,
  logoUrl: settings.logoUrl || '',
  kopImageUrl: settings.kopImageUrl || '',
  officialName: settings.officialName || DEFAULT_SETTINGS.officialName,
  officialNip: settings.officialNip || DEFAULT_SETTINGS.officialNip,
  officialPosition: settings.officialPosition || DEFAULT_SETTINGS.officialPosition,
  officialRank: settings.officialRank || DEFAULT_SETTINGS.officialRank,
  skOfficial: settings.skOfficial || DEFAULT_SETTINGS.skOfficial,
  signatureDate: settings.signatureDate || DEFAULT_SETTINGS.signatureDate,
});

const mapDbToEmployee = (data: any): Employee => ({
  id: data?.id || '',
  nip: data?.nip || '',
  name: data?.name || '',
  placeOfBirth: data?.placeOfBirth || '',
  dateOfBirth: data?.dateOfBirth || '',
  education: data?.education || '',
  address: data?.address || '',
  position: data?.position || '',
  unit: data?.unit || '',
  placementUnit: data?.placementUnit || '',
  agreementNumber: data?.agreementNumber || '',
  salaryAmount: data?.salaryAmount || '',
  salaryText: data?.salaryText || '',
  status: data?.status || 'pending',
  spmtNumber: data?.spmtNumber || '',
  skNumber: data?.skNumber || '',
  skDate: data?.skDate || '',
  tmtDate: data?.tmtDate || '',
  spmtDate: data?.spmtDate || ''
});

const mapEmployeeToDb = (emp: Partial<Employee>) => sanitizeForFirestore({
  id: emp.id || '',
  nip: emp.nip || '',
  name: emp.name || '',
  placeOfBirth: emp.placeOfBirth || '',
  dateOfBirth: emp.dateOfBirth || '',
  education: emp.education || '',
  address: emp.address || '',
  position: emp.position || '',
  unit: emp.unit || '',
  placementUnit: emp.placementUnit || '',
  agreementNumber: emp.agreementNumber || '',
  salaryAmount: emp.salaryAmount || '',
  salaryText: emp.salaryText || '',
  status: emp.status || 'pending',
  spmtNumber: emp.spmtNumber || '',
  skNumber: emp.skNumber || '',
  skDate: emp.skDate || '',
  tmtDate: emp.tmtDate || '',
  spmtDate: emp.spmtDate || ''
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

// --- DATE FORMATTING HELPERS FOR DD/MM/YYYY ---
const formatDisplayDate = (dateStr: string, separator: string = '/'): string => {
  if (!dateStr) return '';
  const str = String(dateStr).trim();
  // Match YYYY-MM-DD or YYYY/MM/DD
  const ymd = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (ymd) {
    const y = ymd[1];
    const m = ymd[2].padStart(2, '0');
    const d = ymd[3].padStart(2, '0');
    return `${d}${separator}${m}${separator}${y}`;
  }
  // Match DD-MM-YYYY or DD/MM/YYYY
  const dmy = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (dmy) {
    const d = dmy[1].padStart(2, '0');
    const m = dmy[2].padStart(2, '0');
    const y = dmy[3];
    return `${d}${separator}${m}${separator}${y}`;
  }
  return str;
};

const parseToIsoDate = (inputStr: string): string => {
  if (!inputStr) return '';
  const str = String(inputStr).trim();
  // Match DD-MM-YYYY, DD/MM/YYYY, DD.MM.YYYY
  const dmy = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (dmy) {
    const d = dmy[1].padStart(2, '0');
    const m = dmy[2].padStart(2, '0');
    const y = dmy[3];
    return `${y}-${m}-${d}`;
  }
  // Match YYYY-MM-DD or YYYY/MM/DD
  const ymd = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{4}|\d{1,2})$/);
  if (ymd) {
    const y = ymd[1];
    const m = ymd[2].padStart(2, '0');
    const d = ymd[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return '';
};

const getValidIsoForPicker = (val: string): string => {
  const iso = parseToIsoDate(val);
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : '';
};

const formatIndonesianLongDate = (dateStr: string): string => {
  const iso = parseToIsoDate(dateStr);
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return dateStr || '';
  const [_, y, m, d] = match;
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const mIndex = parseInt(m, 10) - 1;
  if (mIndex >= 0 && mIndex < 12) {
    return `${parseInt(d, 10)} ${monthNames[mIndex]} ${y}`;
  }
  return dateStr;
};

// UI Components
const DateInputField = ({ label, value, onChange, disabled, className, ...props }: any) => {
  const [displayValue, setDisplayValue] = useState(() => formatDisplayDate(value || '', '/'));
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayValue(formatDisplayDate(value || '', '/'));
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDisplayValue(raw);
    const iso = parseToIsoDate(raw);
    if (onChange) {
      onChange({ target: { name: props.name, value: iso || raw } });
    }
  };

  const handleNativePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const iso = e.target.value; // YYYY-MM-DD
    if (iso) {
      setDisplayValue(formatDisplayDate(iso, '/'));
      if (onChange) {
        onChange({ target: { name: props.name, value: iso } });
      }
    }
  };

  const formattedIndonesian = formatIndonesianLongDate(value || displayValue);

  return (
    <div className="mb-4">
      {label && <label className="block text-xs font-bold text-gray-700 mb-1.5 tracking-wide uppercase">{label}</label>}
      <div className="relative flex items-center">
        <input
          type="text"
          disabled={disabled}
          value={displayValue}
          onChange={handleTextChange}
          placeholder="dd/mm/yyyy (contoh: 17/08/1990)"
          className={`w-full border border-gray-300 p-3 pr-10 rounded-lg bg-white text-black focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all shadow-sm ${className || ''}`}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (dateInputRef.current) {
              try {
                if (typeof (dateInputRef.current as any).showPicker === 'function') {
                  (dateInputRef.current as any).showPicker();
                } else {
                  dateInputRef.current.click();
                }
              } catch (err) {
                // Ignore picker restrictions
              }
            }
          }}
          className="absolute right-3 text-gray-500 hover:text-emerald-700 disabled:opacity-50 transition p-1"
          title="Buka Kalender"
        >
          <Calendar size={18} />
        </button>
        <input
          type="date"
          ref={dateInputRef}
          value={getValidIsoForPicker(value || displayValue)}
          onChange={handleNativePickerChange}
          className="sr-only absolute opacity-0 pointer-events-none"
          tabIndex={-1}
        />
      </div>
      {(value || displayValue) && formattedIndonesian && formattedIndonesian !== (value || displayValue) && (
        <span className="text-[11px] text-emerald-800 font-medium mt-1.5 block">
          Terbaca: <strong>{formattedIndonesian}</strong> ({formatDisplayDate(value || displayValue, '/')})
        </span>
      )}
    </div>
  );
};

const InputField = ({ label, type, ...props }: any) => {
  if (type === 'date') {
    return <DateInputField label={label} {...props} />;
  }
  return (
    <div className="mb-4">
      {label && <label className="block text-xs font-bold text-gray-700 mb-1.5 tracking-wide uppercase">{label}</label>}
      <input 
        {...props} 
        type={type}
        className={`w-full border border-gray-300 p-3 rounded-lg bg-white text-black focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all shadow-sm ${props.className || ''}`} 
      />
    </div>
  );
};

const SelectField = ({ label, children, ...props }: any) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-gray-700 mb-1.5 tracking-wide uppercase">{label}</label>
    <select 
      {...props} 
      className={`w-full border border-gray-300 p-3 rounded-lg bg-white text-black focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all shadow-sm ${props.className || ''}`}
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

const VERIFIKATOR_ACCOUNTS: Record<string, { name: string; unit: string }> = {
  'verifikator': { name: 'Verifikator Utama (Semua Bagian)', unit: 'Semua Bagian' },
  'verifikator_umum': { name: 'Verifikator Bagian Umum', unit: 'Bagian Umum' },
  'verifikator_hukum': { name: 'Verifikator Bagian Hukum', unit: 'Bagian Hukum' },
  'verifikator_pemerintahan': { name: 'Verifikator Bagian Pemerintahan', unit: 'Bagian Pemerintahan' },
  'verifikator_kesra': { name: 'Verifikator Bagian Kesejahteraan Rakyat', unit: 'Bagian Kesejahteraan Rakyat' },
  'verifikator_pembangunan': { name: 'Verifikator Bagian Administrasi Pembangunan', unit: 'Bagian Administrasi Pembangunan' },
  'verifikator_ekonomi': { name: 'Verifikator Bagian Perekonomian dan SDA', unit: 'Bagian Perekonomian dan SDA' },
  'verifikator_pbj': { name: 'Verifikator Bagian Pengadaan Barang dan Jasa', unit: 'Bagian Pengadaan Barang dan Jasa' },
  'verifikator_organisasi': { name: 'Verifikator Bagian Organisasi', unit: 'Bagian Organisasi' },
  'verifikator_prokopim': { name: 'Verifikator Bagian Protokol dan Komunikasi Pimpinan', unit: 'Bagian Protokol dan Komunikasi Pimpinan' },
};

const canUserVerifyEmployee = (currentUser: User | null, emp: Employee | null) => {
  if (!currentUser || !emp) return false;
  if (currentUser.role === 'admin') return true;
  if (currentUser.role === 'verifikator') {
    if (!currentUser.placementUnit || currentUser.placementUnit === 'Semua Bagian') return true;
    return emp.placementUnit === currentUser.placementUnit || emp.unit === currentUser.placementUnit;
  }
  return false;
};

const canUserPrintVerification = (currentUser: User | null, emp: Employee | null) => {
  if (!currentUser || !emp) return false;
  if (currentUser.role === 'admin') return true;
  if (currentUser.role === 'verifikator') {
    if (!currentUser.placementUnit || currentUser.placementUnit === 'Semua Bagian') return true;
    return emp.placementUnit === currentUser.placementUnit || emp.unit === currentUser.placementUnit;
  }
  if (currentUser.role === 'employee') {
    return currentUser.username === emp.nip;
  }
  return false;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  
  const [view, setView] = useState<'dashboard' | 'employees' | 'print' | 'settings'>('dashboard');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
  const kopInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Search & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState<string>('all');
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
    try {
      setDbStatus('checking');
      let querySnapshot;
      try {
        const q = query(collection(db, 'employees'), orderBy('createdAt', 'desc'));
        querySnapshot = await getDocs(q);
      } catch (e) {
        console.warn("orderBy query failed, falling back to base collection getDocs:", e);
        querySnapshot = await getDocs(collection(db, 'employees'));
      }

      const emps: Employee[] = [];
      querySnapshot.forEach((docSnap) => {
        emps.push(mapDbToEmployee(docSnap.data()));
      });
      setEmployees(emps);

      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'main'));
        if (settingsDoc.exists()) {
          const mappedSettings = mapDbToSettings(settingsDoc.data());
          setSettings(mappedSettings);
          setTempSettings(mappedSettings);
        }
      } catch (sErr) {
        console.warn("Settings fetch warning:", sErr);
      }

      setDbStatus('connected');
    } catch (err: any) {
      console.error("Fetch Data Crash:", err);
      setDbStatus('error');
      setDbErrorMessage(err.message || 'Gagal terhubung ke database Firestore');
    }
  };

  const handleManualConnect = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleDisconnect = () => {
  };

  useEffect(() => {
    fetchData();
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
    setIsSaving(true);
    
    const targetEmployee = {
      ...editingEmployee,
      id: editingEmployee.id || Math.random().toString(36).substr(2, 9),
      status: editingEmployee.status || 'pending',
    } as Employee;

    const dbPayload = {
      ...mapEmployeeToDb(targetEmployee),
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'employees', targetEmployee.id), dbPayload);
      
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
    if (!editingEmployee.id) return;

    setIsSaving(true);
    
    const targetEmployee = {
      ...editingEmployee,
      status: 'pending' 
    } as Employee;

    const dbPayload = {
      ...mapEmployeeToDb(targetEmployee),
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'employees', targetEmployee.id), dbPayload);
      
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

    const dbPayload = {
      ...mapEmployeeToDb(targetEmployee),
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'employees', targetEmployee.id), dbPayload);
      
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
    if (!previewEmployee) return;

    if (!canUserVerifyEmployee(user, previewEmployee)) {
      alert(`Akses Ditolak: Akun Anda (${user?.placementUnit || 'Verifikator'}) hanya berwenang memverifikasi pegawai dari ${user?.placementUnit}. Pegawai ini berada di ${previewEmployee.placementUnit || previewEmployee.unit || 'Bagian lain'}.`);
      setIsVerifyConfirmOpen(false);
      return;
    }

    setIsSaving(true);
    
    // Status update: verified_by_employee -> approved
    const targetEmployee = {
      ...previewEmployee,
      status: 'approved'
    } as Employee;

    const dbPayload = {
      ...mapEmployeeToDb(targetEmployee),
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'employees', targetEmployee.id), dbPayload);
      
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
    if (!statusTargetEmployee) return;

    setIsSaving(true);
    const targetEmployee = {
      ...statusTargetEmployee,
      status: newStatus as any
    };

    const dbPayload = {
      ...mapEmployeeToDb(targetEmployee),
      createdAt: new Date().toISOString()
    };

    try {
       await setDoc(doc(db, 'employees', targetEmployee.id), dbPayload);

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
    if (!canUserPrintVerification(user, emp)) {
      alert(`Akses Ditolak: Anda hanya berwenang mencetak lembar verifikasi untuk pegawai dari Bagian ${user?.placementUnit || 'Anda'}.`);
      return;
    }
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
    setIsSaving(true);
    
    const dbPayload = mapSettingsToDb(tempSettings);

    try {
      await setDoc(doc(db, 'settings', 'main'), dbPayload);
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

  const handleKopUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempSettings(prev => ({ ...prev, kopImageUrl: reader.result as string }));
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
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    const parseExcelDate = (val: any): string => {
      if (!val) return '';
      if (val instanceof Date) {
        if (!isNaN(val.getTime())) {
          const y = val.getFullYear();
          const m = String(val.getMonth() + 1).padStart(2, '0');
          const d = String(val.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        }
      }
      if (typeof val === 'number') {
        const dateObj = (XLSX as any).SSF ? (XLSX as any).SSF.parse_date_code(val) : null;
        if (dateObj) {
          const y = dateObj.y;
          const m = String(dateObj.m).padStart(2, '0');
          const d = String(dateObj.d).padStart(2, '0');
          return `${y}-${m}-${d}`;
        }
        const jsDate = new Date(Math.round((val - 25569) * 86400 * 1000));
        if (!isNaN(jsDate.getTime())) {
          const y = jsDate.getUTCFullYear();
          const m = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
          const d = String(jsDate.getUTCDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        }
      }

      const str = String(val).trim();
      if (!str) return '';

      // Match YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

      // Match YYYY/MM/DD
      if (/^\d{4}\/\d{2}\/\d{2}$/.test(str)) return str.replace(/\//g, '-');

      // Match DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
      const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
      if (dmyMatch) {
        const day = dmyMatch[1].padStart(2, '0');
        const month = dmyMatch[2].padStart(2, '0');
        const year = dmyMatch[3];
        return `${year}-${month}-${day}`;
      }

      // Match YYYY-M-D or similar
      const ymdMatch = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
      if (ymdMatch) {
        const year = ymdMatch[1];
        const month = ymdMatch[2].padStart(2, '0');
        const day = ymdMatch[3].padStart(2, '0');
        return `${year}-${month}-${day}`;
      }

      return str;
    };

    const getRowVal = (row: any, keys: string[]): any => {
      for (const k of keys) {
        if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
          return row[k];
        }
      }
      const rowKeys = Object.keys(row);
      for (const k of keys) {
        const normalizedKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        const foundKey = rowKeys.find(rk => rk.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedKey);
        if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && String(row[foundKey]).trim() !== '') {
          return row[foundKey];
        }
      }
      return '';
    };
    
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          alert("File kosong!");
          setIsImporting(false);
          return;
        }

        const employeesToUpsert = data.map((row: any) => {
          const rawNip = String(getRowVal(row, ["NIP", "nip"]) || "");
          const rawSalary = String(getRowVal(row, ["Gaji Pokok", "Gaji", "gaji_pokok"]) || "0");
          const birthDateRaw = getRowVal(row, ["Tanggal Lahir (YYYY-MM-DD)", "Tanggal Lahir", "Tgl Lahir", "TanggalLahir", "tgl_lahir"]);
          const parsedBirthDate = parseExcelDate(birthDateRaw);

          return mapEmployeeToDb({
            id: rawNip || Math.random().toString(36).substr(2, 9),
            nip: rawNip,
            name: String(getRowVal(row, ["Nama Lengkap", "Nama", "nama_lengkap", "nama"]) || ""),
            placeOfBirth: String(getRowVal(row, ["Tempat Lahir", "TempatLahir", "tempat_lahir"]) || ""),
            dateOfBirth: parsedBirthDate,
            education: String(getRowVal(row, ["Pendidikan", "Pendidikan Terakhir", "pendidikan"]) || ""),
            address: String(getRowVal(row, ["Alamat", "Alamat Lengkap", "alamat"]) || ""),
            position: String(getRowVal(row, ["Jabatan", "jabatan"]) || ""),
            unit: String(getRowVal(row, ["Unit Kerja", "unit_kerja", "UnitKerja"]) || ""),
            placementUnit: String(getRowVal(row, ["Unit Penempatan", "unit_penempatan", "Penempatan"]) || ""),
            agreementNumber: String(getRowVal(row, ["Nomor Perjanjian", "No Perjanjian", "nomor_perjanjian"]) || ""),
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

        const batch = writeBatch(db);
        validData.forEach(emp => {
          const empRef = doc(db, 'employees', emp.id);
          batch.set(empRef, { ...emp, createdAt: new Date().toISOString() });
        });

        await batch.commit();
        
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
    if (!deleteTargetId) return;
    setIsSaving(true);
    try {
      await deleteDoc(doc(db, 'employees', deleteTargetId));
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
    const cleanUsername = username.trim().toLowerCase();
    setLoginError('');

    if (cleanUsername === 'admin' && password === 'admin') {
      setUser({ username: 'admin', role: 'admin', name: 'Administrator' });
      setView('dashboard');
      setUnitFilter('all');
    } else if (VERIFIKATOR_ACCOUNTS[cleanUsername] && (password === username || password === 'verifikator' || password === 'admin')) {
      const vAcc = VERIFIKATOR_ACCOUNTS[cleanUsername];
      setUser({ 
        username: cleanUsername, 
        role: 'verifikator', 
        name: vAcc.name,
        placementUnit: vAcc.unit
      });
      setView('dashboard');
      setUnitFilter(vAcc.unit === 'Semua Bagian' ? 'all' : vAcc.unit);
    } else {
      const found = employees.find(emp => emp.nip === username && emp.nip === password);
      if (found) {
        setUser({ username: found.nip, role: 'employee', name: found.name });
        setSelectedEmployeeId(found.id);
        setEditingEmployee({...found});
        setIsEmployeeEditing(false);
      } else {
        setLoginError('NIP, Username, atau Password salah');
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
      <div className="min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center p-4 sm:p-6 font-sans antialiased text-slate-800">
        {/* Background 3D ASN BerAKHLAK Illustration */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.85] scale-100 filter contrast-105 saturate-110 pointer-events-none transition-transform duration-1000"
          style={{ backgroundImage: `url(${bgAsnBerakhlak})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/60 via-slate-900/40 to-slate-950/50 pointer-events-none" />

        {/* Ambient Glow Effects */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Login Card */}
        <div className="relative z-10 bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 sm:p-10 w-full max-w-md transition-all duration-300">
          
          {/* Header */}
          <div className="text-center mb-8">
            {settings.logoUrl ? (
              <div className="inline-block p-2 bg-emerald-50/50 rounded-2xl border border-emerald-100 mb-3 shadow-sm">
                <img src={settings.logoUrl} className="h-16 w-auto mx-auto object-contain" alt="Logo Pemkab Demak" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-gradient-to-tr from-emerald-600 to-indigo-700 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-600/30">
                <ShieldCheck size={32} />
              </div>
            )}

            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">SIPERJAKA</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Sistem Informasi Perjanjian Kerja & Kepegawaian
            </p>
            <p className="text-[11px] text-emerald-700 font-bold uppercase tracking-wide mt-0.5">
              {settings.opdName || 'Sekretariat Daerah Kabupaten Demak'}
            </p>
          </div>

          {/* Form Login */}
          <form onSubmit={handleLogin} className="space-y-5">
            {loginError && (
              <div className="bg-rose-50 text-rose-700 p-3.5 rounded-xl text-xs font-semibold text-center border border-rose-200/80 flex items-center justify-center gap-2">
                <XCircle size={16} className="shrink-0 text-rose-600" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wider uppercase">
                Username / NIP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Masukkan NIP atau Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wider uppercase">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-700 via-emerald-800 to-indigo-900 hover:from-emerald-800 hover:to-indigo-950 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-900/20 hover:shadow-xl active:scale-[0.99] flex items-center justify-center gap-2 text-sm tracking-wide mt-2 cursor-pointer"
            >
              <span>MASUK APLIKASI</span>
              <ChevronRight size={18} />
            </button>
          </form>

          {/* Footer Card */}
          <div className="mt-8 pt-5 border-t border-slate-100 text-center text-[11px] text-slate-400 font-medium">
            <span>SIPERJAKA V.1.1. 2025-2026</span>
          </div>

        </div>
      </div>
    );
  }

  // --- SCOPED EMPLOYEES BASED ON USER ROLE ---
  const scopedEmployees = (user?.role === 'verifikator' && user.placementUnit && user.placementUnit !== 'Semua Bagian')
    ? employees.filter(e => e.placementUnit === user.placementUnit || e.unit === user.placementUnit)
    : employees;

  // --- STATISTIK DASHBOARD ---
  const countPending = scopedEmployees.filter(e => e.status === 'pending').length;
  const countVerified = scopedEmployees.filter(e => e.status === 'verified_by_employee').length;
  const countApproved = scopedEmployees.filter(e => e.status === 'approved').length;

  // --- FILTER & PAGINATION LOGIC ---
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.nip.includes(searchTerm);
    const matchesUnit = unitFilter === 'all' ? true : (emp.placementUnit === unitFilter || emp.unit === unitFilter);
    return matchesSearch && matchesUnit;
  });

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
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl md:shadow-none flex flex-col border-r border-slate-800`}>
          <div className="p-8 border-b border-slate-800 text-center flex flex-col items-center">
            {settings.logoUrl && <img src={settings.logoUrl} className="h-16 mb-4 object-contain" />}
            <span className="font-bold text-xl tracking-tight text-white">SIPERJAKA</span>
            <p className="text-[10px] text-emerald-400 font-medium uppercase mt-2 px-2 leading-relaxed tracking-wider">{settings.opdName}</p>
            <span className="text-[10px] bg-emerald-950/80 px-2.5 py-1 rounded-full mt-2 text-emerald-300 border border-emerald-800/80 uppercase font-bold tracking-wider">{user.role === 'admin' ? 'ADMINISTRATOR' : `VERIFIKATOR ${user.placementUnit ? `(${user.placementUnit})` : ''}`}</span>
          </div>
          <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
            <div className="px-4 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Menu Utama</div>
            <button onClick={() => { setView('dashboard'); setIsSidebarOpen(false); }} className={`w-full flex items-center p-3.5 rounded-xl text-sm font-medium transition-all ${view === 'dashboard' ? 'bg-gradient-to-r from-emerald-700 to-emerald-800 text-white shadow-lg shadow-emerald-950/50' : 'hover:bg-slate-800 text-gray-300 hover:text-white'}`}><LayoutDashboard className="mr-3.5" size={20}/> Dashboard</button>
            
            {user.role === 'admin' && (
               <>
                 <div className="px-4 mb-2 mt-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Data & Dokumen</div>
                 <button onClick={() => { setView('employees'); setIsSidebarOpen(false); }} className={`w-full flex items-center p-3.5 rounded-xl text-sm font-medium transition-all ${view === 'employees' ? 'bg-gradient-to-r from-emerald-700 to-emerald-800 text-white shadow-lg shadow-emerald-950/50' : 'hover:bg-slate-800 text-gray-300 hover:text-white'}`}><Users className="mr-3.5" size={20}/> Data Pegawai</button>
                 <button onClick={() => { setView('print'); setIsSidebarOpen(false); }} className={`w-full flex items-center p-3.5 rounded-xl text-sm font-medium transition-all ${view === 'print' ? 'bg-gradient-to-r from-emerald-700 to-emerald-800 text-white shadow-lg shadow-emerald-950/50' : 'hover:bg-slate-800 text-gray-300 hover:text-white'}`}><Printer className="mr-3.5" size={20}/> Cetak Dokumen</button>
                 
                 <div className="px-4 mb-2 mt-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sistem</div>
                 <button onClick={() => { setView('settings'); setIsSidebarOpen(false); }} className={`w-full flex items-center p-3.5 rounded-xl text-sm font-medium transition-all ${view === 'settings' ? 'bg-gradient-to-r from-emerald-700 to-emerald-800 text-white shadow-lg shadow-emerald-950/50' : 'hover:bg-slate-800 text-gray-300 hover:text-white'}`}><Settings className="mr-3.5" size={20}/> Pengaturan</button>
               </>
            )}

            {user.role === 'verifikator' && (
               <>
                 <div className="px-4 mb-2 mt-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Verifikasi</div>
                 <button onClick={() => { setView('print'); setIsSidebarOpen(false); }} className={`w-full flex items-center p-3.5 rounded-xl text-sm font-medium transition-all ${view === 'print' ? 'bg-gradient-to-r from-emerald-700 to-emerald-800 text-white shadow-lg shadow-emerald-950/50' : 'hover:bg-slate-800 text-gray-300 hover:text-white'}`}><FileCheck className="mr-3.5" size={20}/> Verifikasi Data</button>
               </>
            )}

          </nav>
          <div className="p-4 border-t border-slate-800">
            <button onClick={() => setUser(null)} className="w-full flex items-center justify-center p-3 rounded-xl text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors font-medium text-sm"><LogOut className="mr-2" size={18}/> Keluar Aplikasi</button>
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
           <header className="bg-slate-900 text-white h-16 flex items-center justify-between px-6 shadow-md shrink-0 border-b border-slate-800">
              <div className="flex items-center">
                {settings.logoUrl && <img src={settings.logoUrl} className="h-8 mr-3 bg-white rounded p-0.5" />}
                <div>
                  <h1 className="font-bold text-lg leading-tight tracking-tight flex items-center gap-2">
                    SIPERJAKA
                    <span className="text-[10px] bg-emerald-900/80 text-emerald-300 border border-emerald-700/80 px-2 py-0.5 rounded-full font-semibold uppercase">Pegawai</span>
                  </h1>
                  <p className="text-[10px] text-emerald-400 uppercase tracking-wide font-medium">{settings.opdName}</p>
                </div>
              </div>
              <button onClick={() => setUser(null)} className="flex items-center text-sm font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-xl transition">
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
                      <FileText className="mr-3 text-emerald-700"/> Data Perjanjian Kerja
                   </h3>
                   <div className="text-xs font-bold px-4 py-1.5 bg-white border border-gray-200 rounded-full text-gray-600 shadow-sm">
                      NIP: {user.username}
                   </div>
                </div>

                <form onSubmit={handleEmployeeSave} className="p-8 space-y-8">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-700 uppercase mb-6 tracking-wider border-b pb-2 flex items-center"><UserIcon size={14} className="mr-2"/> I. Data Identitas</h4>
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
                    <h4 className="text-xs font-bold text-emerald-700 uppercase mb-6 tracking-wider border-b pb-2 flex items-center"><LayoutDashboard size={14} className="mr-2"/> II. Data Pekerjaan</h4>
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
                    <h4 className="text-xs font-bold text-emerald-700 uppercase mb-6 tracking-wider border-b pb-2 flex items-center"><Briefcase size={14} className="mr-2"/> III. Data SK & SPMT</h4>
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
                          <button type="button" onClick={() => setIsEmployeeEditing(true)} className="px-6 py-3 bg-white border border-amber-500 text-amber-700 hover:bg-amber-50 rounded-xl font-bold flex items-center transition shadow-sm">
                            <Edit2 size={18} className="mr-2"/> Ajukan Perbaikan Data
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setIsEmployeeApproveModalOpen(true)}
                            disabled={isSaving}
                            className={`px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center transition shadow-lg shadow-emerald-200 ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}`}
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
                          <button type="submit" disabled={isSaving} className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center transition shadow-lg shadow-emerald-200">
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
              <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-indigo-950 rounded-2xl p-8 text-white shadow-xl shadow-emerald-900/20">
                 <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-xl font-bold">Mulai Kelola Data</h3>
                      <p className="text-emerald-100 opacity-90 mt-1">Import data pegawai dari Excel atau tambahkan secara manual.</p>
                    </div>
                    {user.role === 'admin' && (
                      <button onClick={() => setView('employees')} className="bg-white text-emerald-800 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition shadow-lg flex items-center">
                         Kelola Data Pegawai <ChevronRight className="ml-2" size={18} />
                      </button>
                    )}
                    {user.role === 'verifikator' && (
                      <button onClick={() => setView('print')} className="bg-white text-emerald-800 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition shadow-lg flex items-center">
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
                  <button onClick={handleDownloadTemplate} className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-lg flex items-center text-sm font-bold shadow-sm transition">
                    <FileSpreadsheet size={18} className="mr-2"/> Template
                  </button>
                  <label className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2.5 rounded-lg flex items-center text-sm font-bold cursor-pointer shadow-sm transition">
                    {isImporting ? <Loader2 className="animate-spin mr-2"/> : <Upload size={18} className="mr-2"/>}
                    Import Excel
                    <input type="file" ref={importInputRef} onChange={handleImportExcel} accept=".xlsx,.xls" className="hidden"/>
                  </label>
                  <button onClick={() => { setEditingEmployee({}); setIsModalOpen(true); }} className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-lg flex items-center text-sm font-bold shadow-sm transition">
                    <Plus size={18} className="mr-2"/> Manual
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="Cari Nama atau NIP..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-sm transition text-sm font-medium"
                  />
                </div>

                <select 
                  value={unitFilter}
                  onChange={(e) => { setUnitFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full md:w-64 py-2.5 px-3 rounded-lg border border-gray-300 bg-white text-black text-sm font-medium focus:ring-2 focus:ring-emerald-600 outline-none shadow-sm"
                >
                  <option value="all">Semua Bagian / Unit</option>
                  {PLACEMENT_UNITS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
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
                       <span className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-emerald-700 shadow-sm">
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

              {/* Info banner untuk Verifikator Bagian */}
              {user.role === 'verifikator' && user.placementUnit && user.placementUnit !== 'Semua Bagian' && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 p-4 rounded-xl text-xs md:text-sm font-medium flex flex-col md:flex-row items-start md:items-center justify-between gap-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="text-emerald-700 shrink-0" size={20} />
                    <span>Akun Verifikator: <strong>{user.placementUnit}</strong></span>
                  </div>
                  <span className="text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-200/60">
                    Hanya berwenang memverifikasi pegawai Bagian {user.placementUnit}
                  </span>
                </div>
              )}

              {/* Search & Filter Bar */}
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="Cari Nama atau NIP..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-sm transition text-sm font-medium"
                  />
                </div>

                <select 
                  value={unitFilter}
                  onChange={(e) => { setUnitFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full md:w-64 py-2.5 px-3 rounded-lg border border-gray-300 bg-white text-black text-sm font-medium focus:ring-2 focus:ring-emerald-600 outline-none shadow-sm"
                >
                  <option value="all">Semua Bagian / Unit</option>
                  {PLACEMENT_UNITS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Nama / NIP</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Jabatan</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Bagian / Unit</th>
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
                          <td className="p-4 text-sm text-gray-700">
                            <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md text-xs font-semibold border border-slate-200 inline-block">
                              {emp.placementUnit || emp.unit || '-'}
                            </span>
                          </td>
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
                             <div className="flex justify-end gap-2 items-center">
                               {(user.role === 'verifikator' || user.role === 'admin') && emp.status === 'verified_by_employee' && canUserVerifyEmployee(user, emp) && (
                                 <button onClick={() => setPreviewEmployee(emp)} className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-sm">
                                   <Check size={14}/> Verifikasi
                                 </button>
                               )}
                               {emp.status !== 'pending' && canUserPrintVerification(user, emp) && (
                                 <button onClick={() => handlePrintVerificationClick(emp)} className="text-gray-400 hover:text-emerald-700 transition p-2 hover:bg-emerald-50 rounded-full" title="Cetak Lembar Verifikasi">
                                   <ClipboardCheck size={20} />
                                 </button>
                               )}
                               <button onClick={() => setPreviewEmployee(emp)} className="text-gray-400 hover:text-emerald-700 transition p-2 hover:bg-emerald-50 rounded-full" title="Lihat Detail & Aksi">
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
                       <span className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-emerald-700 shadow-sm">
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
               
               {/* 2. App Settings */}
               <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                     <h3 className="font-bold text-gray-900 flex items-center"><Settings className="mr-2 text-emerald-700" size={20}/> Profil Instansi & Pejabat</h3>
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
                          <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100 transition cursor-pointer" accept="image/*" />
                          <p className="text-xs text-gray-400 mt-2">Format: PNG, JPG (Max 1MB disarankan)</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 tracking-wide uppercase">Gambar Kop Surat (Untuk SPMT / Dokumen)</label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 border border-gray-200 rounded-xl bg-gray-50">
                        {tempSettings.kopImageUrl ? (
                          <div className="relative group shrink-0">
                            <img src={tempSettings.kopImageUrl} alt="Preview Kop Surat" className="h-24 max-w-[280px] object-contain bg-white rounded-lg shadow-sm p-2 border" />
                            <button 
                              type="button" 
                              onClick={() => setTempSettings(prev => ({ ...prev, kopImageUrl: '' }))} 
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow"
                              title="Hapus Gambar Kop Surat"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="h-24 w-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs font-semibold text-center p-2">
                            Belum Ada Gambar Kop Surat (Gunakan Teks Bawaan)
                          </div>
                        )}
                        <div className="flex-1">
                          <input type="file" ref={kopInputRef} onChange={handleKopUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100 transition cursor-pointer" accept="image/*" />
                          <p className="text-xs text-gray-500 mt-2">Upload file gambar Kop Surat resmi yang sudah menyatu dengan logo dan garis batas. Jika diisi, gambar ini akan digunakan sebagai Kop Surat pada dokumen SPMT.</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                      <h4 className="font-bold text-sm text-emerald-700 mb-4 uppercase tracking-wide">Pejabat Penandatangan (Pihak Kesatu)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Nama Pejabat" value={tempSettings.officialName} onChange={(e:any) => setTempSettings({...tempSettings, officialName: e.target.value})} />
                        <InputField label="NIP Pejabat" value={tempSettings.officialNip} onChange={(e:any) => setTempSettings({...tempSettings, officialNip: e.target.value})} />
                        <InputField label="Pangkat / Golongan Ruang" value={tempSettings.officialRank} onChange={(e:any) => setTempSettings({...tempSettings, officialRank: e.target.value})} placeholder="Contoh: Pembina Tingkat I (IV/b)" />
                        <InputField label="Jabatan Struktural" value={tempSettings.officialPosition} onChange={(e:any) => setTempSettings({...tempSettings, officialPosition: e.target.value})} />
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                       <h4 className="font-bold text-sm text-emerald-700 mb-4 uppercase tracking-wide">Data Referensi SK</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InputField label="Pejabat yang Mengangkat SK" value={tempSettings.skOfficial} onChange={(e:any) => setTempSettings({...tempSettings, skOfficial: e.target.value})} placeholder="Contoh: BUPATI DEMAK" />
                          <InputField type="date" label="Tanggal Penandatanganan Kontrak (Default)" value={tempSettings.signatureDate} onChange={(e:any) => setTempSettings({...tempSettings, signatureDate: e.target.value})} />
                       </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button type="submit" disabled={isSaving} className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3 rounded-xl font-bold flex items-center shadow-lg shadow-emerald-200 transition">
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
                  <h4 className="font-bold text-sm text-emerald-700 uppercase tracking-wide">Detail Kontrak & Gaji</h4>
                </div>
                <InputField label="Nomor Perjanjian" value={editingEmployee.agreementNumber || ''} onChange={(e:any) => setEditingEmployee({...editingEmployee, agreementNumber: e.target.value})} />
                <InputField label="Gaji Pokok (Angka)" value={editingEmployee.salaryAmount || ''} onChange={(e:any) => handleSalaryChange(e.target.value)} />
                <div className="md:col-span-2">
                   <InputField label="Gaji Terbilang" readOnly value={editingEmployee.salaryText || ''} className="bg-gray-100 text-gray-500 italic" />
                </div>

                {/* NEW SECTION: DATA SK & SPMT */}
                <div className="md:col-span-2 border-t pt-4">
                  <h4 className="font-bold text-sm text-emerald-700 uppercase tracking-wide flex items-center"><Briefcase size={16} className="mr-2"/> Data SK & SPMT</h4>
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
                <button onClick={handleSaveEmployeeAdmin} disabled={isSaving} className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-2.5 rounded-lg font-bold flex items-center shadow-lg shadow-emerald-900/20 transition">
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
                     <button type="submit" className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 rounded-lg font-bold text-white transition flex justify-center items-center shadow-lg shadow-emerald-900/20">
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
                   
                   {/* Tombol Verifikasi hanya muncul jika status verified_by_employee dan user berhak memverifikasi */}
                   {(user.role === 'verifikator' || user.role === 'admin') && previewEmployee.status === 'verified_by_employee' && canUserVerifyEmployee(user, previewEmployee) && (
                      <button onClick={() => setIsVerifyConfirmOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center shadow-sm transition">
                        <Check size={18} className="mr-2"/> Verifikasi Data Bagian Ini
                      </button>
                   )}

                   {/* Tombol Cetak hanya muncul jika approved */}
                   {previewEmployee.status === 'approved' && (
                     <>
                       {/* Cetak Verifikasi hanya jika Verifikator/Admin dan sudah diapprove */}
                       {canUserPrintVerification(user, previewEmployee) && (
                          <button onClick={() => handlePrintVerificationClick(previewEmployee)} className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-lg font-bold flex items-center shadow-sm transition">
                             <ClipboardCheck size={18} className="mr-2"/> Verif
                          </button>
                        )}
                        

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
                    <button onClick={executeStatusChange} disabled={isSaving} className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 rounded-lg font-bold text-white transition flex justify-center items-center shadow-lg shadow-emerald-900/20">
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
                <button onClick={handleEmployeeApprove} disabled={isSaving} className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 rounded-lg font-bold text-white transition flex justify-center items-center shadow-lg">
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
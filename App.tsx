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
  AlertCircle,
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
  ShieldCheck,
  Building2,
  Award,
  MapPin,
  Sparkles,
  Filter,
  CheckCheck,
  ArrowRight,
  Phone,
  Mail,
  FileCheck2,
  ArrowUpRight,
  ExternalLink,
  HelpCircle,
  Layers,
  UserCheck,
  ShieldAlert,
  FileBadge,
  Hash,
  Stamp,
  BookOpen,
  GraduationCap
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
  experimentalForceLongPolling: true,
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

// Helper format tampilan gaji yang aman dari "NaN" (mendukung angka, string dengan titik, dsb)
const formatSalaryDisplay = (val?: string | number): string => {
  if (val === undefined || val === null || val === '') return '0';
  const str = String(val).trim();
  const digits = str.replace(/\D/g, '');
  if (!digits) return '0';
  const num = parseInt(digits, 10);
  if (isNaN(num)) return '0';
  return num.toLocaleString('id-ID');
};

// Toggle visibilitas fitur SPMT (sementara disembunyikan sesuai permintaan, dapat diaktifkan kembali sewaktu-waktu)
const SHOW_SPMT_FIELDS = false;
const SHOW_SPMT_PRINT_BUTTON = false;

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

// Helper for initials and avatar colors
const getInitials = (name?: string) => {
  if (!name) return 'PG';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getAvatarBg = (name?: string) => {
  const gradients = [
    'from-emerald-600 to-teal-700 text-white',
    'from-blue-600 to-indigo-700 text-white',
    'from-indigo-600 to-violet-700 text-white',
    'from-amber-600 to-orange-700 text-white',
    'from-rose-600 to-pink-700 text-white',
    'from-cyan-600 to-sky-700 text-white',
    'from-teal-600 to-emerald-800 text-white',
    'from-purple-600 to-indigo-800 text-white'
  ];
  if (!name) return gradients[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const idx = Math.abs(hash) % gradients.length;
  return gradients[idx];
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
  const [isEmployeeSaveModalOpen, setIsEmployeeSaveModalOpen] = useState(false);
  const [activeEmployeeSection, setActiveEmployeeSection] = useState<'all' | 'identity' | 'job' | 'sk'>('all');

  // Toasts Notification System
  interface ToastNotification {
    id: string;
    type: 'success' | 'info' | 'warning' | 'error';
    title: string;
    message?: string;
  }
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = (title: string, message?: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev.slice(-4), { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // New States for Preview & Verification
  const [previewEmployee, setPreviewEmployee] = useState<Employee | null>(null);
  const [isVerifyConfirmOpen, setIsVerifyConfirmOpen] = useState(false);

  // Admin & Verifikator Confirmation Modal States
  const [isAdminSaveModalOpen, setIsAdminSaveModalOpen] = useState(false);
  const [isSettingsSaveModalOpen, setIsSettingsSaveModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Excel Import Confirmation State
  interface PendingImport {
    fileName: string;
    totalRows: number;
    validEmployees: any[];
  }
  const [pendingImportData, setPendingImportData] = useState<PendingImport | null>(null);
  const [isImportConfirmModalOpen, setIsImportConfirmModalOpen] = useState(false);

  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetEmployee, setDeleteTargetEmployee] = useState<Employee | null>(null);

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
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'verified_by_employee' | 'pending'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopyText = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => {
      setCopiedText(null);
    }, 2000);
  };

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
  const fetchData = async (retryCount = 0) => {
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
      if (retryCount < 2) {
        setTimeout(() => fetchData(retryCount + 1), 1500);
      } else {
        setDbStatus('error');
        setDbErrorMessage(err.message || 'Gagal terhubung ke database Firestore');
      }
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

  // Sinkronisasi data form pegawai yang sedang login saat data employees diperbarui / di-fetch
  useEffect(() => {
    if (user && user.role === 'employee' && !isEmployeeEditing && employees.length > 0) {
      const found = employees.find(e => (selectedEmployeeId && e.id === selectedEmployeeId) || e.nip === user.username);
      if (found) {
        setEditingEmployee(prev => {
          if (!prev.id || prev.id === found.id) {
            return { ...found };
          }
          return prev;
        });
        setEmployeeFormData({ ...found });
      }
    }
  }, [employees, user, isEmployeeEditing, selectedEmployeeId]);

  // --- HANDLERS ---
  const handleStartEmployeeEdit = () => {
    const currentClean = (user && employees.find(e => (editingEmployee.id && e.id === editingEmployee.id) || e.nip === user.username)) || employeeFormData || editingEmployee;
    const cleanObj = { ...currentClean } as Employee;
    setEmployeeFormData(cleanObj);
    setEditingEmployee(cleanObj);
    setIsEmployeeEditing(true);
  };

  const handleCancelEmployeeEdit = () => {
    setIsEmployeeEditing(false);
    // Kembalikan ke data awal yang tersimpan agar form tidak kosong/hilang
    const original = (user && employees.find(e => (editingEmployee.id && e.id === editingEmployee.id) || e.nip === user.username)) || employeeFormData;
    if (original) {
      setEditingEmployee({ ...original });
    } else if (employeeFormData) {
      setEditingEmployee({ ...employeeFormData });
    }
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const executeLogout = () => {
    const userName = user?.name || user?.username || 'Pengguna';
    setUser(null);
    setIsEmployeeEditing(false);
    setEditingEmployee({});
    setEmployeeFormData(null);
    setSelectedEmployeeId(null);
    setUsername('');
    setPassword('');
    setIsLogoutModalOpen(false);
    showToast("Berhasil Keluar", `Sesi ${userName} telah diakhiri dengan aman.`, "info");
  };

  // Backwards compatibility alias
  const handleLogout = handleLogoutClick;

  const handleSaveEmployeeAdmin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingEmployee.nip?.trim() || !editingEmployee.name?.trim()) {
      showToast("Data Belum Lengkap", "NIP dan Nama Lengkap wajib diisi sebelum menyimpan data.", "warning");
      return;
    }
    setIsAdminSaveModalOpen(true);
  };

  const executeSaveEmployeeAdmin = async () => {
    if (!editingEmployee.nip?.trim() || !editingEmployee.name?.trim()) return;

    setIsSaving(true);
    
    const targetEmployee = {
      ...editingEmployee,
      id: editingEmployee.id || editingEmployee.nip.trim(),
      nip: editingEmployee.nip.trim(),
      name: editingEmployee.name.trim(),
      status: editingEmployee.status || 'pending',
    } as Employee;

    const dbPayload = {
      ...mapEmployeeToDb(targetEmployee),
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'employees', targetEmployee.id), dbPayload);
      
      await fetchData();
      setIsAdminSaveModalOpen(false);
      setIsModalOpen(false);
      showToast("Data Berhasil Disimpan", `Data pegawai ${targetEmployee.name} (${targetEmployee.nip}) telah berhasil disimpan ke database.`, "success");
    } catch (err: any) {
      showToast("Gagal Menyimpan", err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmployeeSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingEmployee.id) return;
    setIsEmployeeSaveModalOpen(true);
  };

  const executeEmployeeSave = async () => {
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
      setEmployeeFormData(targetEmployee);
      setIsEmployeeEditing(false); 
      setIsEmployeeSaveModalOpen(false);
      showToast(
        "Perubahan Berhasil Disimpan",
        "Data Anda telah diperbarui. Silakan tinjau kembali dan klik 'Data Sudah Benar & Setujui' jika sudah sesuai.",
        "success"
      );
    } catch (err: any) {
      showToast("Gagal Menyimpan", err.message, "error");
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
      setEmployeeFormData(targetEmployee);
      setIsEmployeeEditing(false);
      setIsEmployeeApproveModalOpen(false); // Close modal
      showToast(
        "Persetujuan Berhasil Terkirim!",
        "Data Anda telah disetujui dan diteruskan ke Tim Verifikator untuk diverifikasi.",
        "success"
      );
    } catch (err: any) {
      showToast("Gagal Menyetujui", err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Verifikator Approval
  const handleVerifikatorApprove = async () => {
    if (!previewEmployee) return;

    if (!canUserVerifyEmployee(user, previewEmployee)) {
      showToast(
        "Akses Ditolak",
        `Akun Anda (${user?.placementUnit || 'Verifikator'}) hanya berwenang memverifikasi pegawai dari ${user?.placementUnit}. Pegawai ini berada di ${previewEmployee.placementUnit || previewEmployee.unit || 'Bagian lain'}.`,
        "warning"
      );
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
      showToast("Verifikasi Berhasil!", `Data pegawai ${targetEmployee.name} telah berhasil diverifikasi dan kini Siap Cetak.`, "success");
    } catch (err: any) {
      showToast("Gagal Memverifikasi", err.message, "error");
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
       const statusLabel = newStatus === 'approved' ? 'Siap Cetak' : newStatus === 'verified_by_employee' ? 'Dicek Pegawai' : 'Pending';
       showToast("Status Diperbarui", `Status ${targetEmployee.name} berhasil diubah menjadi ${statusLabel}.`, "success");
       setStatusTargetEmployee(null);
    } catch (err: any) {
      showToast("Gagal Ubah Status", err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrintContract = (emp: Employee) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast("Pop-up Terblokir", "Silakan izinkan pop-up pada peramban Anda untuk mencetak Surat Perjanjian Kerja.", "warning");
      return;
    }
    showToast("Membuka Dokumen", `Menyiapkan lembar Surat Perjanjian untuk ${emp.name}...`, "info");

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
      showToast("Pop-up Terblokir", "Silakan izinkan pop-up pada peramban Anda untuk mencetak Surat Perintah Melaksanakan Tugas (SPMT).", "warning");
      return;
    }
    showToast("Membuka Dokumen", `Menyiapkan lembar SPMT untuk ${emp.name}...`, "info");

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
      showToast(
        "Akses Ditolak",
        `Anda hanya berwenang mencetak lembar verifikasi untuk pegawai dari Bagian ${user?.placementUnit || 'Anda'}.`,
        "warning"
      );
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

    if (!verifyFormData.verifierName.trim() || !verifyFormData.verifierNip.trim()) {
      showToast("Data Belum Lengkap", "Nama dan NIP pemeriksa berkas verifikasi wajib diisi.", "warning");
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast("Pop-up Terblokir", "Silakan izinkan pop-up pada peramban Anda untuk mencetak Lembar Verifikasi.", "warning");
      return;
    }
    showToast("Membuka Dokumen", `Menyiapkan lembar verifikasi berkas untuk ${printVerifyTarget.name}...`, "info");

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

  const handleSaveSettingsClick = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSettingsSaveModalOpen(true);
  };

  const executeSaveSettings = async () => {
    setIsSaving(true);
    const dbPayload = mapSettingsToDb(tempSettings);

    try {
      await setDoc(doc(db, 'settings', 'main'), dbPayload);
      setSettings(tempSettings);
      setIsSettingsSaveModalOpen(false);
      showToast("Pengaturan Disimpan", "Pengaturan instansi dan dokumen berhasil disimpan.", "success");
    } catch (err: any) {
      showToast("Gagal Simpan Pengaturan", err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Backwards compatibility alias
  const handleSaveSettings = handleSaveSettingsClick;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempSettings(prev => ({ ...prev, logoUrl: reader.result as string }));
        showToast("Logo Terpilih", "Pratinjau logo telah diperbarui. Klik Simpan Pengaturan untuk menerapkan.", "info");
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
        showToast("Kop Surat Terpilih", "Pratinjau gambar kop surat diperbarui. Klik Simpan Pengaturan untuk menerapkan.", "info");
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
    showToast("Mengunduh Template", "Template Excel pegawai berhasil diunduh.", "info");
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
          showToast("File Excel Kosong", "File yang Anda unggah tidak memiliki baris data.", "warning");
          setIsImporting(false);
          if (importInputRef.current) importInputRef.current.value = "";
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
           showToast("Data Tidak Valid", "Tidak ditemukan baris data dengan NIP dan Nama Lengkap yang valid.", "warning");
           setIsImporting(false);
           if (importInputRef.current) importInputRef.current.value = "";
           return;
        }

        // Buka modal konfirmasi impor
        setPendingImportData({
          fileName: file.name,
          totalRows: data.length,
          validEmployees: validData
        });
        setIsImportConfirmModalOpen(true);

      } catch (err: any) {
        console.error(err);
        showToast("Gagal Membaca File", "Terjadi kesalahan saat memproses file Excel: " + err.message, "error");
      } finally {
        setIsImporting(false);
        if (importInputRef.current) importInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const executeImportExcel = async () => {
    if (!pendingImportData || pendingImportData.validEmployees.length === 0) return;

    setIsSaving(true);
    try {
      const batch = writeBatch(db);
      pendingImportData.validEmployees.forEach(emp => {
        const empRef = doc(db, 'employees', emp.id);
        batch.set(empRef, { ...emp, createdAt: new Date().toISOString() });
      });

      await batch.commit();
      
      showToast(
        "Impor Berhasil!",
        `Sebanyak ${pendingImportData.validEmployees.length} data pegawai berhasil diimpor ke sistem.`,
        "success"
      );
      setIsImportConfirmModalOpen(false);
      setPendingImportData(null);
      await fetchData();
    } catch (err: any) {
      console.error(err);
      showToast("Gagal Impor", "Terjadi kesalahan saat menyimpan data impor: " + err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    const target = employees.find(e => e.id === id) || null;
    setDeleteTargetId(id);
    setDeleteTargetEmployee(target);
    setIsDeleteModalOpen(true);
  };

  const executeDeleteEmployee = async () => {
    if (!deleteTargetId) return;
    setIsSaving(true);
    const targetName = deleteTargetEmployee?.name || 'Pegawai';
    try {
      await deleteDoc(doc(db, 'employees', deleteTargetId));
      setEmployees(employees.filter(e => e.id !== deleteTargetId));
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
      setDeleteTargetEmployee(null);
      showToast("Data Pegawai Dihapus", `Data pegawai ${targetName} telah berhasil dihapus dari sistem.`, "info");
    } catch (err: any) {
      showToast("Gagal Menghapus Data", err.message, "error");
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
        setEmployeeFormData({...found});
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
  const filteredEmployees = scopedEmployees.filter(emp => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      emp.name.toLowerCase().includes(s) || 
      emp.nip.includes(s) || 
      (emp.position && emp.position.toLowerCase().includes(s)) ||
      (emp.placementUnit && emp.placementUnit.toLowerCase().includes(s)) ||
      (emp.unit && emp.unit.toLowerCase().includes(s));
    const matchesUnit = unitFilter === 'all' ? true : (emp.placementUnit === unitFilter || emp.unit === unitFilter);
    const matchesStatus = statusFilter === 'all' ? true : emp.status === statusFilter;
    return matchesSearch && matchesUnit && matchesStatus;
  });

  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden antialiased">
      
      {/* TOAST COPY NOTIFICATION */}
      {copiedText && (
        <div className="fixed bottom-6 right-6 z-[100] bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 border border-slate-700">
          <CheckCircle size={16} className="text-emerald-400 shrink-0" />
          <span>{copiedText} berhasil disalin ke clipboard</span>
        </div>
      )}

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (user.role === 'admin' || user.role === 'verifikator') && (
        <div 
          className="fixed inset-0 bg-slate-950/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ADMIN & VERIFIKATOR SIDEBAR */}
      {(user.role === 'admin' || user.role === 'verifikator') && (
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl md:shadow-none flex flex-col border-r border-slate-800`}>
          <div className="p-6 border-b border-slate-800 text-center flex flex-col items-center">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} className="h-14 mb-3 object-contain" />
            ) : (
              <div className="w-12 h-12 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-2xl flex items-center justify-center mb-3">
                <Building2 size={24} />
              </div>
            )}
            <span className="font-black text-xl tracking-tight text-white">SIPERJAKA</span>
            <p className="text-[10px] text-emerald-400 font-bold uppercase mt-1 px-2 leading-relaxed tracking-wider">{settings.opdName}</p>
            <span className="text-[10px] bg-emerald-950/80 px-3 py-1 rounded-full mt-2.5 text-emerald-300 border border-emerald-800/80 uppercase font-bold tracking-wider">{user.role === 'admin' ? 'ADMINISTRATOR' : `VERIFIKATOR ${user.placementUnit ? `(${user.placementUnit})` : ''}`}</span>
          </div>
          <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
            <div className="px-3 mb-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Menu Utama</div>
            <button onClick={() => { setView('dashboard'); setIsSidebarOpen(false); }} className={`w-full flex items-center p-3 rounded-xl text-sm font-medium transition-all ${view === 'dashboard' ? 'bg-emerald-700 text-white shadow-md shadow-emerald-950/50 font-semibold' : 'hover:bg-slate-800 text-slate-300 hover:text-white'}`}><LayoutDashboard className="mr-3 text-emerald-400" size={18}/> Dashboard</button>
            
            {user.role === 'admin' && (
               <>
                 <div className="px-3 mb-2 mt-6 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Data & Dokumen</div>
                 <button onClick={() => { setView('employees'); setIsSidebarOpen(false); }} className={`w-full flex items-center p-3 rounded-xl text-sm font-medium transition-all ${view === 'employees' ? 'bg-emerald-700 text-white shadow-md shadow-emerald-950/50 font-semibold' : 'hover:bg-slate-800 text-slate-300 hover:text-white'}`}><Users className="mr-3 text-emerald-400" size={18}/> Data Pegawai</button>
                 <button onClick={() => { setView('print'); setIsSidebarOpen(false); }} className={`w-full flex items-center p-3 rounded-xl text-sm font-medium transition-all ${view === 'print' ? 'bg-emerald-700 text-white shadow-md shadow-emerald-950/50 font-semibold' : 'hover:bg-slate-800 text-slate-300 hover:text-white'}`}><Printer className="mr-3 text-emerald-400" size={18}/> Cetak Dokumen</button>
                 
                 <div className="px-3 mb-2 mt-6 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Sistem</div>
                 <button onClick={() => { setView('settings'); setIsSidebarOpen(false); }} className={`w-full flex items-center p-3 rounded-xl text-sm font-medium transition-all ${view === 'settings' ? 'bg-emerald-700 text-white shadow-md shadow-emerald-950/50 font-semibold' : 'hover:bg-slate-800 text-slate-300 hover:text-white'}`}><Settings className="mr-3 text-emerald-400" size={18}/> Pengaturan</button>
               </>
            )}

            {user.role === 'verifikator' && (
               <>
                 <div className="px-3 mb-2 mt-6 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Verifikasi</div>
                 <button onClick={() => { setView('print'); setIsSidebarOpen(false); }} className={`w-full flex items-center p-3 rounded-xl text-sm font-medium transition-all ${view === 'print' ? 'bg-emerald-700 text-white shadow-md shadow-emerald-950/50 font-semibold' : 'hover:bg-slate-800 text-slate-300 hover:text-white'}`}><FileCheck className="mr-3 text-emerald-400" size={18}/> Verifikasi Data</button>
               </>
            )}

          </nav>
          <div className="p-4 border-t border-slate-800">
            <button onClick={handleLogout} className="w-full flex items-center justify-center p-3 rounded-xl text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors font-medium text-sm"><LogOut className="mr-2" size={18}/> Keluar Aplikasi</button>
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* HEADER ADMIN/VERIFIKATOR MOBILE */}
        {(user.role === 'admin' || user.role === 'verifikator') && (
          <header className="bg-white border-b border-slate-200 h-16 flex items-center px-4 md:hidden justify-between sticky top-0 z-30 shadow-sm">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 -ml-1 text-slate-700 hover:bg-slate-100 rounded-lg"><Menu size={22} /></button>
            <span className="font-bold text-slate-800 tracking-tight">SIPERJAKA</span>
            <div className="w-8"></div>
          </header>
        )}

        {/* HEADER PEGAWAI (NO SIDEBAR) */}
        {user.role === 'employee' && (
           <header className="bg-slate-900 text-white h-16 flex items-center justify-between px-4 sm:px-8 shadow-md shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-3">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} className="h-8 w-8 object-contain bg-white/10 rounded-lg p-1" />
                ) : (
                  <div className="h-8 w-8 bg-emerald-600/30 text-emerald-400 rounded-lg flex items-center justify-center font-black text-xs">
                    SP
                  </div>
                )}
                <div>
                  <h1 className="font-bold text-base sm:text-lg leading-tight tracking-tight flex items-center gap-2">
                    <span>SIPERJAKA</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Portal Pegawai</span>
                  </h1>
                  <p className="text-[10px] text-emerald-400 uppercase tracking-wide font-medium hidden sm:block">{settings.opdName}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout} 
                className="flex items-center text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 px-3.5 py-2 rounded-xl transition shadow-sm cursor-pointer"
              >
                 <LogOut size={15} className="mr-1.5 text-rose-400"/> Keluar
              </button>
           </header>
        )}

        <main className="flex-1 overflow-auto bg-slate-50/60 p-4 sm:p-6 md:p-8">
          
          {/* --- MODERN PEGAWAI VIEW (PORTAL PEGAWAI SETELAH LOGIN) --- */}
          {user.role === 'employee' && (
            <div className="max-w-5xl mx-auto space-y-6">
              
              {/* 1. HERO PROFILE CARD */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute -right-16 -top-16 w-64 h-64 bg-gradient-to-bl from-emerald-500/10 via-teal-500/5 to-transparent rounded-full pointer-events-none" />
                <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  
                  {/* Avatar & Identitas Singkat */}
                  <div className="flex items-center gap-4 sm:gap-5">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr ${getAvatarBg(editingEmployee.name)} flex items-center justify-center font-black text-xl sm:text-2xl shadow-lg shrink-0`}>
                      {getInitials(editingEmployee.name)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                          {editingEmployee.name || user.username}
                        </h2>
                        {editingEmployee.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            <CheckCircle size={12} className="text-emerald-600" /> Terverifikasi
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <button 
                          onClick={() => handleCopyText(editingEmployee.nip || user.username, 'NIP Pegawai')}
                          className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition border border-slate-200/80"
                          title="Klik untuk menyalin NIP"
                        >
                          <Hash size={12} className="text-slate-400" />
                          <span>{editingEmployee.nip || user.username}</span>
                          <Copy size={11} className="text-slate-400 ml-0.5" />
                        </button>
                        
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80">
                          <Building2 size={12} className="text-slate-400" />
                          <span>{editingEmployee.placementUnit || editingEmployee.unit || 'Sekretariat Daerah'}</span>
                        </span>

                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80">
                          <Briefcase size={12} className="text-emerald-600" />
                          <span>{editingEmployee.position || 'Tenaga Teknis / Administrasi'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge & Primary Action */}
                  <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Status Perjanjian Kerja</p>
                      <div className="mt-1">
                        {editingEmployee.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle size={14} className="text-emerald-600" /> Disetujui & Siap Cetak
                          </span>
                        ) : editingEmployee.status === 'verified_by_employee' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                            <Clock size={14} className="text-blue-600" /> Menunggu Verifikator Bagian
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertTriangle size={14} className="text-amber-600" /> Perlu Verifikasi Mandiri
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* 2. MODERN WORKFLOW STEPPER */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={14} className="text-emerald-600" /> Tahapan Proses Dokumen
                  </h3>
                  <span className="text-[11px] font-medium text-slate-500">
                    Masa Kontrak: <strong className="text-slate-800">1 Okt 2026 - 30 Sep 2027</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  
                  {/* Step 1 */}
                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Check size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wide">Langkah 1</p>
                      <p className="text-xs font-bold text-slate-800">Data Terdaftar</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${editingEmployee.status === 'approved' || editingEmployee.status === 'verified_by_employee' ? 'border-emerald-200 bg-emerald-50/60' : 'border-amber-300 bg-amber-50/70 ring-2 ring-amber-400/20'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${editingEmployee.status === 'approved' || editingEmployee.status === 'verified_by_employee' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white animate-pulse'}`}>
                      {editingEmployee.status === 'approved' || editingEmployee.status === 'verified_by_employee' ? <Check size={16} /> : <UserCheck size={16} />}
                    </div>
                    <div>
                      <p className={`text-[11px] font-extrabold uppercase tracking-wide ${editingEmployee.status === 'approved' || editingEmployee.status === 'verified_by_employee' ? 'text-emerald-800' : 'text-amber-800'}`}>Langkah 2</p>
                      <p className="text-xs font-bold text-slate-800">Verifikasi Pegawai</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${editingEmployee.status === 'approved' ? 'border-emerald-200 bg-emerald-50/60' : editingEmployee.status === 'verified_by_employee' ? 'border-blue-300 bg-blue-50/70 ring-2 ring-blue-400/20' : 'border-slate-200 bg-slate-50'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${editingEmployee.status === 'approved' ? 'bg-emerald-600 text-white' : editingEmployee.status === 'verified_by_employee' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {editingEmployee.status === 'approved' ? <Check size={16} /> : <ShieldCheck size={16} />}
                    </div>
                    <div>
                      <p className={`text-[11px] font-extrabold uppercase tracking-wide ${editingEmployee.status === 'approved' ? 'text-emerald-800' : editingEmployee.status === 'verified_by_employee' ? 'text-blue-800' : 'text-slate-400'}`}>Langkah 3</p>
                      <p className="text-xs font-bold text-slate-800">Verifikasi Sub Bagian</p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${editingEmployee.status === 'approved' ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-slate-50'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${editingEmployee.status === 'approved' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      <Printer size={16} />
                    </div>
                    <div>
                      <p className={`text-[11px] font-extrabold uppercase tracking-wide ${editingEmployee.status === 'approved' ? 'text-emerald-800' : 'text-slate-400'}`}>Langkah 4</p>
                      <p className="text-xs font-bold text-slate-800">Cetak Dokumen</p>
                    </div>
                  </div>

                </div>

                {/* Status Guidance Alert */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  {editingEmployee.status === 'approved' ? (
                    <div className="flex items-start gap-3 text-xs text-emerald-800 bg-emerald-50 p-3.5 rounded-xl border border-emerald-200">
                      <CheckCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold">Data Anda telah Terverifikasi Lengkap!</strong>
                        <p className="mt-0.5 text-emerald-700">Perjanjian kerja telah disetujui oleh Bagian dan siap dicetak secara resmi oleh Administrator.</p>
                      </div>
                    </div>
                  ) : editingEmployee.status === 'verified_by_employee' ? (
                    <div className="flex items-start gap-3 text-xs text-blue-800 bg-blue-50 p-3.5 rounded-xl border border-blue-200">
                      <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold">Menunggu Verifikasi dari Verifikator Bagian</strong>
                        <p className="mt-0.5 text-blue-700">Anda telah menyetujui data. Saat ini data Anda sedang dalam proses verifikasi akhir oleh Verifikator Bagian terkait.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 text-xs text-amber-800 bg-amber-50 p-3.5 rounded-xl border border-amber-200">
                      <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold">Mohon Periksa Kebenaran Data di Bawah</strong>
                        <p className="mt-0.5 text-amber-700">Pastikan NIK/NIP, Nama, Tanggal Lahir, Penempatan, dan Gaji Pokok sudah tepat. Klik <strong>"Ajukan Perbaikan"</strong> jika ada perubahan, atau <strong>"Data Sudah Benar"</strong> untuk melanjutkan.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. BENTO METRICS SUMMARY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200/80 shadow-xs font-black text-base select-none">
                    <span>Rp</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gaji Pokok</p>
                    <p className="text-base font-extrabold text-slate-900 truncate">Rp {formatSalaryDisplay(editingEmployee.salaryAmount)}</p>
                    <p className="text-[10px] text-slate-500 truncate italic">{editingEmployee.salaryText || 'Gaji Bulanan'}</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Unit Penempatan</p>
                    <p className="text-sm font-extrabold text-slate-900 truncate">{editingEmployee.placementUnit || editingEmployee.unit || '-'}</p>
                    <p className="text-[10px] text-slate-500 truncate">Sesuai Surat SPMT</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <GraduationCap size={24} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pendidikan Terakhir</p>
                    <p className="text-sm font-extrabold text-slate-900 truncate">{editingEmployee.education || '-'}</p>
                    <p className="text-[10px] text-slate-500 truncate">{editingEmployee.placeOfBirth || '-'}</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <FileBadge size={24} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">No. SK Pengangkatan</p>
                    <p className="text-xs font-mono font-bold text-slate-900 truncate">{editingEmployee.skNumber || '-'}</p>
                    <p className="text-[10px] text-slate-500 truncate">Tgl: {formatDisplayDate(editingEmployee.skDate || '') || '-'}</p>
                  </div>
                </div>

              </div>

              {/* 4. MAIN FORM & DETAILS CARD */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                
                {/* Header & Tabs */}
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                      <FileText className="text-emerald-700" size={18}/>
                      <span>Rincian Data Pegawai & Perjanjian Kerja</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Informasi administratif kepegawaian Non-ASN</p>
                  </div>

                  {/* Section Tabs Filter */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setActiveEmployeeSection('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${activeEmployeeSection === 'all' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                    >
                      Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveEmployeeSection('identity')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${activeEmployeeSection === 'identity' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                    >
                      Identitas
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveEmployeeSection('job')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${activeEmployeeSection === 'job' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                    >
                      Pekerjaan
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveEmployeeSection('sk')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${activeEmployeeSection === 'sk' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                    >
                      {SHOW_SPMT_FIELDS ? 'SK & SPMT' : 'Data SK'}
                    </button>
                  </div>
                </div>

                {/* Form Body */}
                <form onSubmit={handleEmployeeSave} className="p-6 sm:p-8 space-y-8">
                  
                  {/* SEKSI I: DATA IDENTITAS */}
                  {(activeEmployeeSection === 'all' || activeEmployeeSection === 'identity') && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                        <h4 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                          <UserIcon size={15} className="text-emerald-700"/> I. Data Identitas Pribadi
                        </h4>
                        <span className="text-[11px] text-slate-400 font-medium">Sesuai KTP / Dokumen Resmi</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                        <InputField 
                          label="Nama Lengkap" 
                          disabled={!isEmployeeEditing} 
                          value={editingEmployee.name || ''} 
                          onChange={(e:any) => setEditingEmployee({...editingEmployee, name: e.target.value})} 
                          className={!isEmployeeEditing ? "bg-slate-50 text-slate-800 font-medium border-slate-200" : "focus:border-emerald-600"} 
                        />
                        
                        <InputField 
                          label="NIP (Nomor Induk Pegawai)" 
                          disabled 
                          value={editingEmployee.nip || ''} 
                          className="bg-slate-100 text-slate-600 font-mono" 
                        />
                        
                        <InputField 
                          label="Tempat Lahir" 
                          disabled={!isEmployeeEditing} 
                          value={editingEmployee.placeOfBirth || ''} 
                          onChange={(e:any) => setEditingEmployee({...editingEmployee, placeOfBirth: e.target.value})} 
                          className={!isEmployeeEditing ? "bg-slate-50 text-slate-800 font-medium border-slate-200" : "focus:border-emerald-600"} 
                        />
                        
                        <DateInputField 
                          label="Tanggal Lahir" 
                          disabled={!isEmployeeEditing} 
                          value={editingEmployee.dateOfBirth || ''} 
                          onChange={(e:any) => setEditingEmployee({...editingEmployee, dateOfBirth: e.target.value})} 
                          className={!isEmployeeEditing ? "bg-slate-50 text-slate-800 font-medium border-slate-200" : "focus:border-emerald-600"} 
                        />
                        
                        <div className="md:col-span-2">
                          <InputField 
                            label="Alamat Lengkap" 
                            disabled={!isEmployeeEditing} 
                            value={editingEmployee.address || ''} 
                            onChange={(e:any) => setEditingEmployee({...editingEmployee, address: e.target.value})} 
                            className={!isEmployeeEditing ? "bg-slate-50 text-slate-800 font-medium border-slate-200" : "focus:border-emerald-600"} 
                          />
                        </div>
                        
                        <InputField 
                          label="Pendidikan Terakhir" 
                          disabled={!isEmployeeEditing} 
                          value={editingEmployee.education || ''} 
                          onChange={(e:any) => setEditingEmployee({...editingEmployee, education: e.target.value})} 
                          className={!isEmployeeEditing ? "bg-slate-50 text-slate-800 font-medium border-slate-200" : "focus:border-emerald-600"} 
                        />

                        <InputField 
                          label="Status Kepegawaian" 
                          disabled 
                          value="Tenaga Non-ASN / Pegawai Perjanjian Kerja" 
                          className="bg-slate-100 text-slate-600 font-medium" 
                        />
                      </div>
                    </div>
                  )}

                  {/* SEKSI II: DATA PEKERJAAN & GAJI */}
                  {(activeEmployeeSection === 'all' || activeEmployeeSection === 'job') && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                        <h4 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                          <Briefcase size={15} className="text-emerald-700"/> II. Data Pekerjaan & Penempatan
                        </h4>
                        <span className="text-[11px] text-slate-400 font-medium">Penetapan Unit & Hak Keuangan</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                        <InputField 
                          label="Jabatan" 
                          disabled 
                          value={editingEmployee.position || ''} 
                          className="bg-slate-100 text-slate-600 font-medium" 
                        />
                        
                        <InputField 
                          label="Unit Kerja Induk" 
                          disabled 
                          value={editingEmployee.unit || 'Sekretariat Daerah Kabupaten Demak'} 
                          className="bg-slate-100 text-slate-600 font-medium" 
                        />
                        
                        <div className="md:col-span-2">
                          <SelectField 
                            label="Unit Penempatan (Sesuai SPMT)" 
                            disabled={true} 
                            value={editingEmployee.placementUnit || ''} 
                            onChange={(e:any) => setEditingEmployee({...editingEmployee, placementUnit: e.target.value})}
                            className="bg-slate-100 text-slate-600 font-medium"
                          >
                             <option value="">-- Pilih Unit Penempatan --</option>
                             {PLACEMENT_UNITS.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                             ))}
                          </SelectField>
                        </div>
                        
                        <InputField 
                          label="Gaji Pokok Bulanan" 
                          disabled 
                          value={`Rp ${formatSalaryDisplay(editingEmployee.salaryAmount)}`} 
                          className="bg-slate-100 text-slate-900 font-bold" 
                        />

                        <InputField 
                          label="Gaji Terbilang" 
                          disabled 
                          value={editingEmployee.salaryText || '-'} 
                          className="bg-slate-100 text-slate-600 italic" 
                        />
                      </div>
                    </div>
                  )}

                  {/* SEKSI III: DATA SK & SPMT */}
                  {(activeEmployeeSection === 'all' || activeEmployeeSection === 'sk') && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                        <h4 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                          <Stamp size={15} className="text-emerald-700"/> III. Data Legalitas SK {SHOW_SPMT_FIELDS ? '& SPMT' : 'Pengangkatan'}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-medium">Dasar Hukum Penugasan</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                        {/* Data SPMT (sementara disembunyikan sesuai permintaan, dapat diaktifkan kembali dengan SHOW_SPMT_FIELDS = true) */}
                        {SHOW_SPMT_FIELDS && (
                          <>
                            <InputField 
                              label="Nomor SPMT" 
                              placeholder="Contoh: 821/..." 
                              disabled={true} 
                              value={editingEmployee.spmtNumber || ''} 
                              onChange={(e:any) => setEditingEmployee({...editingEmployee, spmtNumber: e.target.value})} 
                              className="bg-slate-100 text-slate-600 font-mono" 
                            />
                            
                            <DateInputField 
                              label="Tanggal SPMT (Melaksanakan Tugas)" 
                              disabled={!isEmployeeEditing} 
                              value={editingEmployee.spmtDate || ''} 
                              onChange={(e:any) => setEditingEmployee({...editingEmployee, spmtDate: e.target.value})} 
                              className={!isEmployeeEditing ? "bg-slate-50 text-slate-800 font-medium border-slate-200" : "focus:border-emerald-600"} 
                            />
                          </>
                        )}
                        
                        <InputField 
                          label="Nomor SK Pengangkatan" 
                          placeholder="Contoh: 810/..." 
                          disabled={!isEmployeeEditing} 
                          value={editingEmployee.skNumber || ''} 
                          onChange={(e:any) => setEditingEmployee({...editingEmployee, skNumber: e.target.value})} 
                          className={!isEmployeeEditing ? "bg-slate-50 text-slate-800 font-medium border-slate-200" : "focus:border-emerald-600"} 
                        />
                        
                        <DateInputField 
                          label="Tanggal Penetapan SK" 
                          disabled={!isEmployeeEditing} 
                          value={editingEmployee.skDate || ''} 
                          onChange={(e:any) => setEditingEmployee({...editingEmployee, skDate: e.target.value})} 
                          className={!isEmployeeEditing ? "bg-slate-50 text-slate-800 font-medium border-slate-200" : "focus:border-emerald-600"} 
                        />
                        
                        <div className="md:col-span-2">
                          <DateInputField 
                            label="TMT Pengangkatan" 
                            disabled={!isEmployeeEditing} 
                            value={editingEmployee.tmtDate || ''} 
                            onChange={(e:any) => setEditingEmployee({...editingEmployee, tmtDate: e.target.value})} 
                            className={!isEmployeeEditing ? "bg-slate-50 text-slate-800 font-medium border-slate-200" : "focus:border-emerald-600"} 
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ACTION BAR PEGAWAI */}
                  {editingEmployee.status === 'pending' && (
                    <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 pt-6 border-t border-slate-200">
                      {!isEmployeeEditing ? (
                        <>
                          <button 
                            type="button" 
                            onClick={handleStartEmployeeEdit} 
                            className="px-5 py-3 bg-white border border-amber-500 text-amber-800 hover:bg-amber-50 rounded-xl font-bold flex items-center justify-center transition shadow-sm cursor-pointer"
                          >
                            <Edit2 size={16} className="mr-2 text-amber-600"/> Ajukan Perbaikan Data
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setIsEmployeeApproveModalOpen(true)}
                            disabled={isSaving}
                            className={`px-6 py-3 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white rounded-xl font-bold flex items-center justify-center transition shadow-lg shadow-emerald-900/20 cursor-pointer ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}`}
                          >
                            <CheckCircle size={18} className="mr-2"/>
                            Data Sudah Benar & Setujui
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            type="button" 
                            onClick={handleCancelEmployeeEdit} 
                            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
                          >
                            Batal
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setIsEmployeeSaveModalOpen(true)}
                            disabled={isSaving} 
                            className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center justify-center transition shadow-lg shadow-emerald-900/20 cursor-pointer"
                          >
                            {isSaving ? <Loader2 className="animate-spin mr-2" size={18}/> : <Save size={18} className="mr-2"/>}
                            Simpan Perubahan
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* KETIKA SUDAH DISETUJUI / VERIFIED: BUTTON PREVIEW DRAFT DOKUMEN */}
                  {editingEmployee.status !== 'pending' && (
                    <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <CheckCheck size={16} className="text-emerald-600" />
                        <span>Data terkunci karena telah disetujui untuk proses penerbitan perjanjian kerja.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewEmployee(editingEmployee as Employee)}
                        className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
                      >
                        <Eye size={15} /> Lihat Preview Draft Dokumen
                      </button>
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
                      <button onClick={() => setView('employees')} className="bg-white text-emerald-800 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition shadow-lg flex items-center cursor-pointer">
                         Kelola Data Pegawai <ChevronRight className="ml-2" size={18} />
                      </button>
                    )}
                    {user.role === 'verifikator' && (
                      <button onClick={() => setView('print')} className="bg-white text-emerald-800 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition shadow-lg flex items-center cursor-pointer">
                         Mulai Verifikasi <ChevronRight className="ml-2" size={18} />
                      </button>
                    )}
                 </div>
              </div>
            </div>
          )}

          {/* --- ADMIN: DATA PEGAWAI (MODERN ENTERPRISE LIST) --- */}
          {user.role === 'admin' && view === 'employees' && (
            <div className="space-y-6">
              
              {/* Top Header & Action Buttons */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                <div>
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                     <Users size={24} className="text-emerald-700" /> Data Pegawai Non-ASN
                   </h2>
                   <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Kelola seluruh basis data pegawai, perpanjangan perjanjian kerja, dan status verifikasi</p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                  <button 
                    onClick={handleDownloadTemplate} 
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3.5 py-2.5 rounded-xl flex items-center text-xs font-bold shadow-sm transition hover:border-slate-400 cursor-pointer"
                    title="Unduh format file Excel template import"
                  >
                    <FileSpreadsheet size={16} className="mr-2 text-emerald-600"/> Template Excel
                  </button>
                  <label className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl flex items-center text-xs font-bold cursor-pointer shadow-sm transition">
                    {isImporting ? <Loader2 className="animate-spin mr-2" size={16}/> : <Upload size={16} className="mr-2 text-emerald-400"/>}
                    Import Excel
                    <input type="file" ref={importInputRef} onChange={handleImportExcel} accept=".xlsx,.xls" className="hidden"/>
                  </label>
                  <button 
                    onClick={() => { setEditingEmployee({}); setIsModalOpen(true); }} 
                    className="bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white px-4 py-2.5 rounded-xl flex items-center text-xs font-bold shadow-lg shadow-emerald-900/20 transition cursor-pointer"
                  >
                    <Plus size={16} className="mr-1.5"/> Tambah Pegawai
                  </button>
                </div>
              </div>

              {/* Stat Summary Cards Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                <button 
                  onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${statusFilter === 'all' ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20' : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-sm'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'all' ? 'text-slate-300' : 'text-slate-400'}`}>Semua Pegawai</span>
                    <Users size={16} className={statusFilter === 'all' ? 'text-slate-300' : 'text-slate-400'} />
                  </div>
                  <p className="text-2xl font-black mt-2">{employees.length}</p>
                  <p className={`text-[10px] mt-0.5 ${statusFilter === 'all' ? 'text-slate-400' : 'text-slate-500'}`}>Total pegawai terdaftar</p>
                </button>

                <button 
                  onClick={() => { setStatusFilter('approved'); setCurrentPage(1); }}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${statusFilter === 'approved' ? 'bg-emerald-700 text-white border-emerald-700 shadow-md ring-2 ring-emerald-700/20' : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300 shadow-sm'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'approved' ? 'text-emerald-100' : 'text-emerald-700'}`}>Siap Cetak</span>
                    <CheckCircle size={16} className={statusFilter === 'approved' ? 'text-emerald-200' : 'text-emerald-600'} />
                  </div>
                  <p className="text-2xl font-black mt-2">{countApproved}</p>
                  <p className={`text-[10px] mt-0.5 ${statusFilter === 'approved' ? 'text-emerald-200' : 'text-slate-500'}`}>Verifikasi lengkap</p>
                </button>

                <button 
                  onClick={() => { setStatusFilter('verified_by_employee'); setCurrentPage(1); }}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${statusFilter === 'verified_by_employee' ? 'bg-blue-700 text-white border-blue-700 shadow-md ring-2 ring-blue-700/20' : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 shadow-sm'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'verified_by_employee' ? 'text-blue-100' : 'text-blue-700'}`}>Dicek Pegawai</span>
                    <UserCheck size={16} className={statusFilter === 'verified_by_employee' ? 'text-blue-200' : 'text-blue-600'} />
                  </div>
                  <p className="text-2xl font-black mt-2">{countVerified}</p>
                  <p className={`text-[10px] mt-0.5 ${statusFilter === 'verified_by_employee' ? 'text-blue-200' : 'text-slate-500'}`}>Menunggu Verifikator</p>
                </button>

                <button 
                  onClick={() => { setStatusFilter('pending'); setCurrentPage(1); }}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${statusFilter === 'pending' ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-600/20' : 'bg-white text-slate-800 border-slate-200 hover:border-amber-300 shadow-sm'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'pending' ? 'text-amber-100' : 'text-amber-700'}`}>Pending</span>
                    <Clock size={16} className={statusFilter === 'pending' ? 'text-amber-200' : 'text-amber-600'} />
                  </div>
                  <p className="text-2xl font-black mt-2">{countPending}</p>
                  <p className={`text-[10px] mt-0.5 ${statusFilter === 'pending' ? 'text-amber-200' : 'text-slate-500'}`}>Belum dicek pegawai</p>
                </button>

              </div>

              {/* Search & Filter Toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Cari nama, NIP, jabatan, atau bagian..." 
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-xs sm:text-sm font-medium transition shadow-sm"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-slate-600">
                    <Filter size={14} className="text-slate-400 shrink-0" />
                    <select 
                      value={unitFilter}
                      onChange={(e) => { setUnitFilter(e.target.value); setCurrentPage(1); }}
                      className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 outline-none cursor-pointer py-1.5"
                    >
                      <option value="all">Semua Bagian / Unit Penempatan</option>
                      {PLACEMENT_UNITS.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>

                  {/* Reset Filter Button */}
                  {(searchTerm || unitFilter !== 'all' || statusFilter !== 'all') && (
                    <button 
                      onClick={() => { setSearchTerm(''); setUnitFilter('all'); setStatusFilter('all'); setCurrentPage(1); }}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>

              </div>

              {/* Data Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                        <th className="py-4 px-5">Pegawai</th>
                        <th className="py-4 px-5">Jabatan & Pendidikan</th>
                        <th className="py-4 px-5">Unit Kerja / Penempatan</th>
                        <th className="py-4 px-5">Status Verifikasi</th>
                        <th className="py-4 px-5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {paginatedEmployees.map(emp => (
                        <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors group">
                          
                          {/* Col 1: Nama & NIP */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${getAvatarBg(emp.name)} flex items-center justify-center font-bold text-xs shadow-sm shrink-0`}>
                                {getInitials(emp.name)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                                  <span>{emp.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                                    {emp.nip}
                                  </span>
                                  <button 
                                    onClick={() => handleCopyText(emp.nip, `NIP ${emp.name}`)} 
                                    className="text-slate-400 hover:text-slate-700 p-0.5" 
                                    title="Salin NIP"
                                  >
                                    <Copy size={11} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Col 2: Jabatan & Pendidikan */}
                          <td className="py-4 px-5">
                            <div className="font-semibold text-slate-800 text-xs sm:text-sm">{emp.position || '-'}</div>
                            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                              <GraduationCap size={12} />
                              <span>{emp.education || '-'}</span>
                            </div>
                          </td>

                          {/* Col 3: Unit Kerja / Penempatan */}
                          <td className="py-4 px-5">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                              <Building2 size={12} className="text-slate-400 shrink-0" />
                              <span className="truncate max-w-[200px]">{emp.placementUnit || emp.unit || '-'}</span>
                            </span>
                            {emp.salaryAmount && (
                              <div className="text-[11px] text-slate-500 mt-1 font-mono font-medium">
                                Rp {formatSalaryDisplay(emp.salaryAmount)}
                              </div>
                            )}
                          </td>

                          {/* Col 4: Status Verifikasi */}
                          <td className="py-4 px-5">
                            {emp.status === 'approved' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                Siap Cetak
                              </span>
                            ) : emp.status === 'verified_by_employee' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                Dicek Pegawai
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                Pending
                              </span>
                            )}
                          </td>

                          {/* Col 5: Aksi */}
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              
                              <button 
                                onClick={() => setPreviewEmployee(emp)} 
                                className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition border border-transparent hover:border-emerald-200 cursor-pointer" 
                                title="Lihat Preview Dokumen"
                              >
                                <Eye size={16} />
                              </button>

                              <button 
                                onClick={() => handleStatusChangeClick(emp)} 
                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-xl transition border border-transparent hover:border-orange-200 cursor-pointer" 
                                title="Ubah Status Verifikasi"
                              >
                                <RefreshCw size={16} />
                              </button>

                              <button 
                                onClick={() => { setEditingEmployee(emp); setIsModalOpen(true); }} 
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition border border-transparent hover:border-blue-200 cursor-pointer" 
                                title="Edit Data Pegawai"
                              >
                                <Edit2 size={16} />
                              </button>

                              <button 
                                onClick={() => handleDeleteClick(emp.id)} 
                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-200 cursor-pointer" 
                                title="Hapus Data Pegawai"
                              >
                                <Trash2 size={16} />
                              </button>

                            </div>
                          </td>

                        </tr>
                      ))}

                      {paginatedEmployees.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-16 px-4 text-center">
                             <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                               <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
                                 <Users size={32} />
                                </div>
                               <h4 className="font-bold text-slate-800 text-base">
                                 {searchTerm || unitFilter !== 'all' || statusFilter !== 'all' ? 'Data Tidak Ditemukan' : 'Belum Ada Data Pegawai'}
                               </h4>
                               <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                 {searchTerm || unitFilter !== 'all' || statusFilter !== 'all'
                                   ? 'Coba sesuaikan kata kunci pencarian atau ubah filter bagian/status.'
                                   : 'Mulai dengan mengimpor file Excel data pegawai atau tambahkan pegawai secara manual.'}
                               </p>
                               {searchTerm || unitFilter !== 'all' || statusFilter !== 'all' ? (
                                 <button 
                                   onClick={() => { setSearchTerm(''); setUnitFilter('all'); setStatusFilter('all'); }}
                                   className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                                 >
                                   Reset Semua Filter
                                 </button>
                               ) : (
                                 <div className="mt-4 flex gap-2">
                                   <label className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5">
                                     <Upload size={14} /> Import Excel
                                     <input type="file" ref={importInputRef} onChange={handleImportExcel} accept=".xlsx,.xls" className="hidden"/>
                                   </label>
                                   <button 
                                     onClick={() => { setEditingEmployee({}); setIsModalOpen(true); }}
                                     className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                                   >
                                     <Plus size={14} /> Tambah Manual
                                   </button>
                                 </div>
                               )}
                             </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Control */}
                {filteredEmployees.length > 0 && (
                  <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                     <span className="text-xs font-medium text-slate-500">
                       Menampilkan <strong className="text-slate-800">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</strong> - <strong className="text-slate-800">{Math.min(currentPage * ITEMS_PER_PAGE, filteredEmployees.length)}</strong> dari <strong className="text-slate-800">{filteredEmployees.length}</strong> pegawai
                     </span>
                     <div className="flex items-center gap-1.5">
                       <button 
                         onClick={() => setCurrentPage(c => Math.max(1, c - 1))} 
                         disabled={currentPage === 1}
                         className={`p-2 rounded-xl border text-xs font-bold transition ${currentPage === 1 ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm cursor-pointer'}`}
                         title="Halaman Sebelumnya"
                       >
                         <ChevronLeft size={16} />
                       </button>
                       
                       {Array.from({ length: totalPages }, (_, i) => i + 1)
                         .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                         .map((pageNum, idx, arr) => {
                           const prev = arr[idx - 1];
                           return (
                             <React.Fragment key={pageNum}>
                               {prev && pageNum - prev > 1 && (
                                 <span className="px-2 text-slate-400 text-xs">...</span>
                               )}
                               <button
                                 onClick={() => setCurrentPage(pageNum)}
                                 className={`w-8 h-8 rounded-xl text-xs font-bold transition cursor-pointer ${currentPage === pageNum ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'}`}
                               >
                                 {pageNum}
                               </button>
                             </React.Fragment>
                           );
                         })}

                       <button 
                         onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))} 
                         disabled={currentPage === totalPages}
                         className={`p-2 rounded-xl border text-xs font-bold transition ${currentPage === totalPages ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm cursor-pointer'}`}
                         title="Halaman Berikutnya"
                       >
                         <ChevronRight size={16} />
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
                    Hanya berwenang memverifikasi pegawai {user.placementUnit}
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

                {/* SECTION: DATA SK & SPMT */}
                <div className="md:col-span-2 border-t pt-4">
                  <h4 className="font-bold text-sm text-emerald-700 uppercase tracking-wide flex items-center"><Briefcase size={16} className="mr-2"/> Data SK {SHOW_SPMT_FIELDS ? '& SPMT' : 'Pengangkatan'}</h4>
                </div>
                {/* Data SPMT (sementara disembunyikan sesuai permintaan, dapat diaktifkan kembali dengan SHOW_SPMT_FIELDS = true) */}
                {SHOW_SPMT_FIELDS && (
                  <>
                    <InputField label="Nomor SPMT" placeholder="Contoh: 821/..." value={editingEmployee.spmtNumber || ''} onChange={(e:any) => setEditingEmployee({...editingEmployee, spmtNumber: e.target.value})} />
                    <InputField type="date" label="Tanggal SPMT (Melaksanakan Tugas)" value={editingEmployee.spmtDate || ''} onChange={(e:any) => setEditingEmployee({...editingEmployee, spmtDate: e.target.value})} />
                  </>
                )}
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
                        

                       {/* Tombol Cetak SPMT (sementara disembunyikan sesuai permintaan, dapat diaktifkan kembali dengan SHOW_SPMT_PRINT_BUTTON = true) */}
                       {SHOW_SPMT_PRINT_BUTTON && (
                         <button onClick={() => handlePrintSPMT(previewEmployee)} className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-lg font-bold flex items-center shadow-sm transition">
                            <Briefcase size={18} className="mr-2"/> SPMT
                         </button>
                       )}

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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 transition-opacity">
           <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden border border-slate-100">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/80">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200 shrink-0">
                     <RefreshCw size={18} />
                   </div>
                   <div>
                     <h3 className="text-base font-bold text-slate-800">Ubah Status Pegawai</h3>
                     <p className="text-xs text-slate-500 font-medium">{statusTargetEmployee.name} ({statusTargetEmployee.nip})</p>
                   </div>
                 </div>
                 <button onClick={() => setIsStatusModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition"><X size={18}/></button>
              </div>
              <div className="p-6 space-y-4">
                 <SelectField 
                   label="Pilih Status Baru" 
                   value={newStatus} 
                   onChange={(e:any) => setNewStatus(e.target.value)}
                 >
                   <option value="pending">Pending (Menunggu Persetujuan Pegawai)</option>
                   <option value="verified_by_employee">Dicek Pegawai (Menunggu Verifikator Bagian)</option>
                   <option value="approved">Terverifikasi (Siap Cetak Seluruh Dokumen)</option>
                 </SelectField>
                 
                 <div className="bg-amber-50/80 border border-amber-200 text-amber-900 p-3.5 rounded-xl text-xs flex items-start gap-2">
                    <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Perhatian:</strong> Mengubah status secara manual oleh Admin akan langsung memperbarui status pegawai di database.</span>
                 </div>

                 <div className="pt-2 flex gap-2.5">
                    <button onClick={() => setIsStatusModalOpen(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-xs sm:text-sm text-slate-700 transition">Batal</button>
                    <button onClick={executeStatusChange} disabled={isSaving} className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 rounded-xl font-bold text-xs sm:text-sm text-white transition flex justify-center items-center shadow-lg shadow-emerald-900/20">
                       {isSaving ? <Loader2 className="animate-spin mr-2" size={16}/> : <Save size={16} className="mr-2"/>} Simpan Status
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* MODAL KONFIRMASI VERIFIKASI DATA (VERIFIKATOR & ADMIN) */}
      {isVerifyConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 text-center relative overflow-hidden border border-slate-100">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-inner">
                <ShieldCheck size={32} className="text-emerald-700"/>
              </div>

              <h3 className="font-extrabold text-lg sm:text-xl text-slate-800 tracking-tight">Setujui & Verifikasi Berkas?</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Dengan memverifikasi, Anda menyatakan bahwa berkas dan data pegawai ini telah diteliti keabsahannya dan dinyatakan siap untuk dicetak.
              </p>

              {previewEmployee && (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 my-5 text-left text-xs space-y-1.5 text-emerald-950">
                  <div className="flex justify-between items-center pb-1.5 border-b border-emerald-200/60">
                    <span className="text-emerald-700 font-medium">Nama Pegawai</span>
                    <span className="font-bold text-emerald-950">{previewEmployee.name}</span>
                  </div>
                  <div className="flex justify-between items-center pb-1.5 border-b border-emerald-200/60">
                    <span className="text-emerald-700 font-medium">NIP</span>
                    <span className="font-mono font-bold text-emerald-900">{previewEmployee.nip}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-700 font-medium">Unit Penempatan</span>
                    <span className="font-semibold text-emerald-900">{previewEmployee.placementUnit || previewEmployee.unit || '-'}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-2.5">
                <button 
                  type="button"
                  onClick={() => setIsVerifyConfirmOpen(false)} 
                  disabled={isSaving}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer"
                >
                  Periksa Kembali
                </button>
                <button 
                  type="button"
                  onClick={handleVerifikatorApprove} 
                  disabled={isSaving} 
                  className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center shadow-lg shadow-emerald-900/20 cursor-pointer disabled:opacity-70"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16}/>
                      <span>Memverifikasi...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} className="mr-2" />
                      <span>Ya, Setujui & Verifikasi</span>
                    </>
                  )}
                </button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL KONFIRMASI SIMPAN PEGAWAI (ADMIN) */}
      {isAdminSaveModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 text-center relative overflow-hidden border border-slate-100">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-inner">
                <Save size={28} className="text-emerald-700"/>
              </div>

              <h3 className="font-extrabold text-lg sm:text-xl text-slate-800 tracking-tight">
                {editingEmployee.id ? 'Simpan Perubahan Pegawai?' : 'Simpan Pegawai Baru?'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Pastikan data yang diinput sudah lengkap dan valid sebelum disimpan ke database sistem.
              </p>

              {/* Detail Ringkasan Data */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 my-5 text-left text-xs space-y-2 text-slate-700">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span className="text-slate-400 font-medium">Nama Lengkap</span>
                  <span className="font-bold text-slate-900 text-right">{editingEmployee.name || '-'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span className="text-slate-400 font-medium">NIP / Username</span>
                  <span className="font-mono font-bold text-slate-800">{editingEmployee.nip || '-'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span className="text-slate-400 font-medium">Jabatan</span>
                  <span className="font-semibold text-slate-800">{editingEmployee.position || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Unit Penempatan</span>
                  <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200/60">{editingEmployee.placementUnit || editingEmployee.unit || '-'}</span>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2.5">
                <button 
                  type="button"
                  onClick={() => setIsAdminSaveModalOpen(false)} 
                  disabled={isSaving}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer"
                >
                  Periksa Kembali
                </button>
                <button 
                  type="button"
                  onClick={executeSaveEmployeeAdmin} 
                  disabled={isSaving} 
                  className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center shadow-lg shadow-emerald-900/20 cursor-pointer disabled:opacity-70"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16}/>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      <span>Ya, Simpan Data</span>
                    </>
                  )}
                </button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL KONFIRMASI SIMPAN PENGATURAN (ADMIN) */}
      {isSettingsSaveModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 text-center relative overflow-hidden border border-slate-100">
              <div className="w-16 h-16 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-200 shadow-inner">
                <Settings size={28} className="text-blue-700"/>
              </div>

              <h3 className="font-extrabold text-lg sm:text-xl text-slate-800 tracking-tight">Terapkan Pengaturan Instansi?</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Perubahan pada identitas instansi, pejabat penandatangan, dan kop surat akan otomatis diterapkan pada seluruh dokumen cetak (Kontrak, SPMT, dan Lembar Verifikasi).
              </p>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 my-5 text-left text-xs space-y-2 text-slate-700">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span className="text-slate-400 font-medium">Instansi / OPD</span>
                  <span className="font-bold text-slate-900 text-right truncate max-w-[200px]">{tempSettings.agencyName || '-'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span className="text-slate-400 font-medium">Pejabat (Pihak 1)</span>
                  <span className="font-semibold text-slate-800 text-right">{tempSettings.officialName || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Nomor SK Referensi</span>
                  <span className="font-mono font-medium text-slate-800 text-right">{tempSettings.defaultSkNumber || '-'}</span>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2.5">
                <button 
                  type="button"
                  onClick={() => setIsSettingsSaveModalOpen(false)} 
                  disabled={isSaving}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer"
                >
                  Periksa Lagi
                </button>
                <button 
                  type="button"
                  onClick={executeSaveSettings} 
                  disabled={isSaving} 
                  className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center shadow-lg shadow-emerald-900/20 cursor-pointer disabled:opacity-70"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16}/>
                      <span>Menerapkan...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} className="mr-2" />
                      <span>Ya, Terapkan Pengaturan</span>
                    </>
                  )}
                </button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL KONFIRMASI IMPOR EXCEL (ADMIN) */}
      {isImportConfirmModalOpen && pendingImportData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 text-center relative overflow-hidden border border-slate-100">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-inner">
                <FileSpreadsheet size={28} className="text-emerald-700"/>
              </div>

              <h3 className="font-extrabold text-lg sm:text-xl text-slate-800 tracking-tight">Konfirmasi Impor Data Excel</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Ditemukan <strong className="text-emerald-800 font-bold">{pendingImportData.validEmployees.length} baris data pegawai valid</strong> dari file <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-xs">{pendingImportData.fileName}</span>.
              </p>

              {/* Preview Beberapa Pegawai */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 my-5 text-left">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2.5">
                  <span className="flex items-center gap-1.5">
                    <Users size={14} className="text-emerald-700" />
                    Pratinjau Data Siap Impor:
                  </span>
                  <span className="text-slate-400 font-normal">Total {pendingImportData.validEmployees.length} pegawai</span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {pendingImportData.validEmployees.slice(0, 5).map((emp, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-100">
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-slate-800 truncate">{emp.name}</div>
                        <div className="font-mono text-[11px] text-slate-400">{emp.nip}</div>
                      </div>
                      <span className="shrink-0 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200/60">
                        {emp.placementUnit || emp.unit || 'Bagian'}
                      </span>
                    </div>
                  ))}
                  {pendingImportData.validEmployees.length > 5 && (
                    <div className="text-center text-[11px] text-slate-400 font-medium pt-1">
                      + {pendingImportData.validEmployees.length - 5} pegawai lainnya
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-3 border-t border-slate-200/60 pt-2.5 leading-relaxed">
                  💡 <strong className="text-slate-700">Catatan:</strong> Data dengan NIP yang sama akan diperbarui, dan data dengan NIP baru akan otomatis ditambahkan ke sistem.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2.5">
                <button 
                  type="button"
                  onClick={() => { setIsImportConfirmModalOpen(false); setPendingImportData(null); }} 
                  disabled={isSaving}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer"
                >
                  Batal Impor
                </button>
                <button 
                  type="button"
                  onClick={executeImportExcel} 
                  disabled={isSaving} 
                  className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center shadow-lg shadow-emerald-900/20 cursor-pointer disabled:opacity-70"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16}/>
                      <span>Mengimpor Data...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} className="mr-2" />
                      <span>Ya, Impor {pendingImportData.validEmployees.length} Data</span>
                    </>
                  )}
                </button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL KONFIRMASI KELUAR (LOGOUT) */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-sm w-full p-6 sm:p-7 text-center relative overflow-hidden border border-slate-100">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200 shadow-inner">
                <LogOut size={28} className="text-rose-600"/>
              </div>

              <h3 className="font-extrabold text-lg sm:text-xl text-slate-800 tracking-tight">Keluar dari Aplikasi?</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Anda sedang masuk sebagai <strong className="text-slate-800 font-bold">{user?.name || user?.username}</strong> ({user?.role === 'admin' ? 'Administrator' : user?.role === 'verifikator' ? 'Verifikator' : 'Pegawai'}).
              </p>

              <div className="my-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
                Pastikan Anda telah menyimpan seluruh perubahan data sebelum keluar.
              </div>

              <div className="flex gap-2.5">
                <button 
                  type="button"
                  onClick={() => setIsLogoutModalOpen(false)} 
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="button"
                  onClick={executeLogout} 
                  className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center shadow-lg shadow-rose-900/20 cursor-pointer"
                >
                  <LogOut size={16} className="mr-2" />
                  <span>Ya, Keluar</span>
                </button>
              </div>
           </div>
        </div>
      )}
      
      {/* MODAL KONFIRMASI SIMPAN PERUBAHAN (PORTAL PEGAWAI) */}
      {isEmployeeSaveModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 text-center relative overflow-hidden border border-slate-100">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200 shadow-inner">
                <Save size={28} className="text-amber-600"/>
              </div>

              <h3 className="font-extrabold text-lg sm:text-xl text-slate-800 tracking-tight">Simpan Perubahan Data?</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                Perubahan data yang Anda lakukan akan diperbarui di sistem. Status data Anda tetap <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">Pending</span> hingga Anda menyetujuinya.
              </p>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 my-5 text-left text-xs space-y-1.5 text-slate-600">
                <div className="flex items-center gap-2 font-bold text-slate-700">
                  <Info size={15} className="text-emerald-700 shrink-0" />
                  <span>Langkah Berikutnya:</span>
                </div>
                <p className="text-[11px] text-slate-500 pl-5 leading-relaxed">
                  Setelah data tersimpan, periksa kembali seluruh seksi dan klik tombol <strong className="text-emerald-700 font-bold">"Data Sudah Benar & Setujui"</strong> agar data Anda dapat diteruskan ke Verifikator.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2.5">
                <button 
                  type="button"
                  onClick={() => setIsEmployeeSaveModalOpen(false)} 
                  disabled={isSaving}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer"
                >
                  Periksa Lagi
                </button>
                <button 
                  type="button"
                  onClick={executeEmployeeSave} 
                  disabled={isSaving} 
                  className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center shadow-lg shadow-emerald-900/20 cursor-pointer disabled:opacity-70"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16}/>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      <span>Ya, Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
           </div>
        </div>
      )}
      
      {/* MODAL KONFIRMASI DATA SUDAH BENAR & SETUJUI (PORTAL PEGAWAI) */}
      {isEmployeeApproveModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 text-center relative overflow-hidden border border-slate-100">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-inner">
                <CheckCircle size={32} className="text-emerald-700"/>
              </div>

              <h3 className="font-extrabold text-lg sm:text-xl text-slate-800 tracking-tight">Konfirmasi Persetujuan Data</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                Apakah Anda menyatakan bahwa seluruh data diri, riwayat pendidikan, unit kerja, gaji pokok, dan SK telah <strong>benar dan sesuai</strong>?
              </p>

              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 my-5 text-left text-xs space-y-2 text-emerald-950">
                <div className="flex items-start gap-2 font-semibold">
                  <ShieldCheck size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                  <span>Data akan dikirimkan ke Tim Verifikator Bagian untuk proses verifikasi berkas dan pencetakan dokumen resmi.</span>
                </div>
                <p className="text-[11px] text-emerald-800 pl-6 leading-relaxed">
                  Setelah disetujui, isian data akan dikunci sementara selama proses verifikasi berlangsung.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2.5">
                <button 
                  type="button"
                  onClick={() => setIsEmployeeApproveModalOpen(false)} 
                  disabled={isSaving}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer"
                >
                  Periksa Kembali
                </button>
                <button 
                  type="button"
                  onClick={handleEmployeeApprove} 
                  disabled={isSaving} 
                  className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center shadow-lg shadow-emerald-900/20 cursor-pointer disabled:opacity-70"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16}/>
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} className="mr-2" />
                      <span>Ya, Data Sudah Benar & Setujui</span>
                    </>
                  )}
                </button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS DATA PEGAWAI */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 text-center relative overflow-hidden border border-slate-100">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200 shadow-inner">
                <Trash2 size={28} className="text-rose-600"/>
              </div>

              <h3 className="font-extrabold text-lg sm:text-xl text-slate-800 tracking-tight">Hapus Data Pegawai?</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Tindakan ini permanen. Seluruh rekaman data pegawai dan riwayat verifikasinya akan dihapus dari sistem.
              </p>

              {deleteTargetEmployee && (
                <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 my-5 text-left text-xs space-y-1.5 text-rose-950">
                  <div className="flex justify-between items-center pb-1.5 border-b border-rose-200/60">
                    <span className="text-rose-700 font-medium">Nama Pegawai</span>
                    <span className="font-bold text-rose-950">{deleteTargetEmployee.name}</span>
                  </div>
                  <div className="flex justify-between items-center pb-1.5 border-b border-rose-200/60">
                    <span className="text-rose-700 font-medium">NIP</span>
                    <span className="font-mono font-bold text-rose-900">{deleteTargetEmployee.nip}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-rose-700 font-medium">Bagian / Unit</span>
                    <span className="font-semibold text-rose-900">{deleteTargetEmployee.placementUnit || deleteTargetEmployee.unit || '-'}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-2.5">
                <button 
                  type="button"
                  onClick={() => { setIsDeleteModalOpen(false); setDeleteTargetEmployee(null); setDeleteTargetId(null); }} 
                  disabled={isSaving}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="button"
                  onClick={executeDeleteEmployee} 
                  disabled={isSaving} 
                  className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center shadow-lg shadow-rose-900/20 cursor-pointer disabled:opacity-70"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16}/>
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} className="mr-2" />
                      <span>Ya, Hapus Permanen</span>
                    </>
                  )}
                </button>
              </div>
           </div>
        </div>
      )}

      {/* NOTIFIKASI TOASTS */}
      <div className="fixed top-5 right-5 sm:right-6 z-[9999] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2.5rem)] pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className="pointer-events-auto bg-white rounded-2xl shadow-xl border border-slate-200/90 p-4 flex items-start gap-3 transition-all duration-300"
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle size={18} />
                </div>
              )}
              {toast.type === 'info' && (
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Info size={18} />
                </div>
              )}
              {toast.type === 'warning' && (
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <AlertTriangle size={18} />
                </div>
              )}
              {toast.type === 'error' && (
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <AlertCircle size={18} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-sm text-slate-800 leading-snug">{toast.title}</h5>
              {toast.message && (
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{toast.message}</p>
              )}
            </div>

            <button 
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              title="Tutup Notifikasi"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
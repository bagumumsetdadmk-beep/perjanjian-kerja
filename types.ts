export type Role = 'admin' | 'employee' | 'verifikator';

export interface User {
  username: string;
  role: Role;
  name: string;
}

export interface AppSettings {
  signatureDate: string;
  logoUrl: string;
  officialName: string; // Nama Pejabat Penandatangan
  officialNip: string;
  officialPosition: string; // Jabatan Pejabat (e.g. Kepala Dinas...)
  officialRank: string; // Baru: Pangkat/Golongan Ruang Pejabat (e.g. Pembina Tingkat I (IV/b))
  opdName: string; // Nama OPD
  skOfficial: string; // Baru: Pejabat yang mengangkat SK (e.g. BUPATI DEMAK)
}

export interface Employee {
  id: string;
  nip: string; // Used as username and password for employees
  name: string;
  placeOfBirth: string;
  dateOfBirth: string;
  education: string;
  address: string;
  position: string; // Jabatan
  unit: string; // Unit Kerja
  placementUnit: string; // Baru: Unit Penempatan untuk SPMT
  agreementNumber: string; // Nomor unik perjanjian per pegawai
  salaryAmount: string; // Gaji dalam angka
  salaryText: string; // Gaji terbilang
  status: 'pending' | 'verified_by_employee' | 'approved';
  
  // Field Baru untuk SPMT
  spmtNumber: string; // Nomor SPMT
  skNumber: string; // Nomor SK Pengangkatan
  skDate: string; // Tanggal SK
  tmtDate: string; // TMT Berlaku (Tanggal Mulai Tugas)
  spmtDate: string; // Tanggal Melaksanakan Tugas (Nyata)
}

export const DEFAULT_SETTINGS: AppSettings = {
  signatureDate: '2025-01-02',
  logoUrl: '', // Will default to an icon if empty
  officialName: 'H. AHMAD SUGIARTO, S.T., M.T.',
  officialNip: '19700101 199003 1 001',
  officialPosition: 'Sekretaris Daerah',
  officialRank: 'Pembina Utama Muda (IV/c)',
  opdName: 'Sekretariat Daerah',
  skOfficial: 'BUPATI DEMAK',
};

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: '1',
    nip: '198501012022011001',
    name: 'Budi Santoso',
    placeOfBirth: 'Demak',
    dateOfBirth: '1985-01-01',
    education: 'S-1 Teknik Informatika',
    address: 'Jl. Sultan Fatah No. 10, Demak',
    position: 'Pranata Komputer Ahli Pertama',
    unit: 'Sekretariat Daerah',
    placementUnit: 'Bagian Organisasi',
    agreementNumber: '001',
    salaryAmount: '2.500.000',
    salaryText: 'Dua Juta Lima Ratus Ribu Rupiah',
    status: 'pending',
    spmtNumber: '821/001/2025',
    skNumber: '810/123/2025',
    skDate: '2025-09-01',
    tmtDate: '2025-10-01',
    spmtDate: '2026-01-02'
  },
];
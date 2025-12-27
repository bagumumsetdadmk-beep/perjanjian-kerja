import React from 'react';
import { Employee, AppSettings } from '../types';

interface ContractDocumentProps {
  employee: Employee;
  settings: AppSettings;
}

// Helper to format date in Indonesian format (Text Month)
const formatDateIndonesian = (dateString: string) => {
  if (!dateString) return ".......................";
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

// Helper to format date in numeric format (d-mm-yyyy)
const formatDateNumeric = (dateString: string) => {
  if (!dateString) return "..........";
  const date = new Date(dateString);
  const d = date.getDate();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
};

// Helper to get day name
const getDayName = (dateString: string) => {
  if (!dateString) return ".......................";
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { weekday: 'long' });
};

// Helper to convert number 1-31 to Text
const getNumberText = (num: number) => {
  const words = [
    "", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh",
    "Sebelas", "Dua Belas", "Tiga Belas", "Empat Belas", "Lima Belas", "Enam Belas", "Tujuh Belas", "Delapan Belas", "Sembilan Belas", "Dua Puluh",
    "Dua Puluh Satu", "Dua Puluh Dua", "Dua Puluh Tiga", "Dua Puluh Empat", "Dua Puluh Lima", "Dua Puluh Enam", "Dua Puluh Tujuh", "Dua Puluh Delapan", "Dua Puluh Sembilan", "Tiga Puluh", "Tiga Puluh Satu"
  ];
  return words[num] || String(num);
};

// Helper to get year text
const getYearText = (dateString: string) => {
    if (!dateString) return ".......................";
    const year = new Date(dateString).getFullYear();
    if (year === 2025) return "Dua Ribu Dua Puluh Lima";
    if (year === 2026) return "Dua Ribu Dua Puluh Enam";
    return year.toString();
};

export const ContractDocument: React.FC<ContractDocumentProps> = ({ employee, settings }) => {
  const signDate = settings.signatureDate ? new Date(settings.signatureDate) : new Date();
  const dayName = getDayName(settings.signatureDate);
  const formattedDateNumeric = formatDateNumeric(settings.signatureDate);
  
  const datePartText = getNumberText(signDate.getDate());
  const monthPart = signDate.toLocaleDateString('id-ID', { month: 'long' });
  const yearText = getYearText(settings.signatureDate);

  return (
    <div className="bg-white p-8 max-w-[210mm] mx-auto contract-font text-justify text-black print:p-0 print:max-w-none print:w-full print:mx-0">
      {/* HEADER */}
      <div className="text-center font-bold mb-6 text-black">
        <h1 className="underline">PERJANJIAN KERJA</h1>
        <p>NOMOR : 810 / {employee.agreementNumber || '............'} / TAHUN 2025</p>
      </div>

      <p className="mb-4 text-black">
        Pada hari ini, <strong>{dayName}</strong> tanggal <strong>{datePartText}</strong> bulan <strong>{monthPart}</strong> tahun <strong>{yearText}</strong> ({formattedDateNumeric}) yang bertanda tangan di bawah ini :
      </p>

      {/* PIHAK KESATU */}
      <table className="w-full mb-4 align-top text-black">
        <tbody>
          <tr>
            <td className="w-8 align-top">I.</td>
            <td className="w-48 align-top">Nama</td>
            <td className="w-4 align-top">:</td>
            <td className="font-bold text-left">{settings.officialName}</td>
          </tr>
          <tr>
            <td></td>
            <td className="align-top">Jabatan</td>
            <td className="align-top">:</td>
            <td className="text-left">{settings.officialPosition}</td>
          </tr>
          <tr>
            <td></td>
            <td colSpan={3} className="text-justify pt-2">
              dalam hal ini bertindak untuk dan atas nama Bupati Demak, berdasarkan Surat Keputusan Bupati Demak Nomor 800/ 354 Tahun 2025 tanggal 3 Desember 2025 tentang Penunjukan Pejabat Yang Diberi Kuasa Untuk Penandatanganan Perjanjian Kerja Pegawai Pemerintah Dengan Perjanjian Kerja Paruh Waktu untuk selanjutnya disebut <strong>PIHAK KESATU</strong>.
            </td>
          </tr>
        </tbody>
      </table>

      {/* PIHAK KEDUA */}
      <table className="w-full mb-6 align-top text-black">
        <tbody>
          <tr>
            <td className="w-8 align-top">II.</td>
            <td className="w-48 align-top">Nama</td>
            <td className="w-4 align-top">:</td>
            <td className="font-bold text-left uppercase">{employee.name}</td>
          </tr>
          <tr>
            <td></td>
            <td className="align-top">NI PPPK Paruh Waktu</td>
            <td className="align-top">:</td>
            <td className="text-left">{employee.nip}</td>
          </tr>
          <tr>
            <td></td>
            <td className="align-top">Unit Kerja</td>
            <td className="align-top">:</td>
            <td className="text-left">{employee.unit}</td>
          </tr>
          <tr>
            <td></td>
            <td colSpan={3} className="text-justify pt-2">
              dalam hal ini bertindak dan atas nama diri sendiri, untuk selanjutnya disebut <strong>PIHAK KEDUA</strong>.
            </td>
          </tr>
        </tbody>
      </table>

      <div className="text-center font-bold mt-6 mb-2 text-black">
        <p>Pasal 1</p>
        <p>MASA PERJANJIAN KERJA, JABATAN, DAN UNIT KERJA</p>
      </div>
      <p className="mb-2 text-black">
        PIHAK KESATU menerima dan mempekerjakan PIHAK KEDUA sebagai Pegawai Pemerintah dengan Perjanjian Kerja Paruh Waktu (PPPK Paruh Waktu) dengan ketentuan sebagai berikut:
      </p>
      <table className="w-full mb-4 ml-4 text-black">
        <tbody>
          <tr>
            <td className="w-6 align-top">a.</td>
            <td className="w-48 align-top">Masa Perjanjian Kerja</td>
            <td className="w-6 align-top">:</td>
            <td className="text-left">1 Oktober 2025 s/d 30 September 2026</td>
          </tr>
          <tr>
            <td className="align-top">b.</td>
            <td className="align-top">Jabatan</td>
            <td className="align-top">:</td>
            <td className="text-left uppercase">{employee.position}</td>
          </tr>
          <tr>
            <td className="align-top">c.</td>
            <td className="align-top">Masa Kerja sebelumnya</td>
            <td className="align-top">:</td>
            <td className="text-left">0 tahun 0 bulan</td>
          </tr>
          <tr>
            <td className="align-top">d.</td>
            <td className="align-top">Unit Kerja</td>
            <td className="align-top">:</td>
            <td className="text-left uppercase font-bold">{employee.unit}</td>
          </tr>
        </tbody>
      </table>

      {/* FOOTER & SIGNATURES */}
      <div className="grid grid-cols-2 gap-8 mt-12 text-black text-center break-inside-avoid">
        <div>
           <p>PIHAK KEDUA</p>
           <div className="h-24"></div>
           <p className="font-bold underline uppercase">{employee.name}</p>
           <p className="text-xs">NI PPPK. {employee.nip}</p>
        </div>
        <div>
           <p>PIHAK KESATU</p>
           <p className="text-xs uppercase">{settings.officialPosition}</p>
           <div className="h-24"></div>
           <p className="font-bold underline uppercase">{settings.officialName}</p>
           <p className="text-xs">NIP. {settings.officialNip}</p>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { Employee, AppSettings } from '../types';

interface VerificationDocumentProps {
  employee: Employee;
  settings: AppSettings;
  verifierName: string;
  verifierNip: string;
  verifyDate: string;
}

const formatDateIndonesian = (dateString: string) => {
  if (!dateString) return ".......................";
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const VerificationDocument: React.FC<VerificationDocumentProps> = ({ 
  employee, 
  settings, 
  verifierName, 
  verifierNip, 
  verifyDate 
}) => {
  
  return (
    <div className="bg-white p-6 max-w-[210mm] mx-auto font-sans text-black print:p-0 print:max-w-none print:w-full print:mx-0 text-sm leading-tight">
      
      {/* HEADER */}
      <div className="border-b-2 border-black pb-3 mb-4 flex items-center justify-between">
         <div className="flex items-center gap-4">
            {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="h-16" />}
            <div>
                <h1 className="font-bold text-lg uppercase">PEMERINTAH KABUPATEN DEMAK</h1>
                <h2 className="font-bold text-base uppercase">{settings.opdName}</h2>
            </div>
         </div>
      </div>

      <div className="text-center mb-6">
        <h1 className="font-bold text-lg underline">LEMBAR VERIFIKASI DATA KEPEGAWAIAN</h1>
        <p className="text-sm mt-1 font-semibold">PPPK PARUH WAKTU TAHUN 2025</p>
      </div>

      <div className="mb-5">
        <p className="mb-3">Telah dilakukan verifikasi dan validasi terhadap data pegawai tersebut di bawah ini:</p>
        <table className="w-full border-collapse border border-gray-400 text-sm">
            <tbody>
                <tr>
                    <td className="border border-gray-400 p-2 bg-gray-50 font-bold w-1/3">Nama Lengkap</td>
                    <td className="border border-gray-400 p-2 uppercase">{employee.name}</td>
                </tr>
                <tr>
                    <td className="border border-gray-400 p-2 bg-gray-50 font-bold">NIP / NI PPPK</td>
                    <td className="border border-gray-400 p-2">{employee.nip}</td>
                </tr>
                <tr>
                    <td className="border border-gray-400 p-2 bg-gray-50 font-bold">Jabatan</td>
                    <td className="border border-gray-400 p-2">{employee.position}</td>
                </tr>
                <tr>
                    <td className="border border-gray-400 p-2 bg-gray-50 font-bold">Unit Kerja</td>
                    <td className="border border-gray-400 p-2">{employee.unit}</td>
                </tr>
                <tr>
                    <td className="border border-gray-400 p-2 bg-gray-50 font-bold">Tempat, Tanggal Lahir</td>
                    <td className="border border-gray-400 p-2">{employee.placeOfBirth}, {formatDateIndonesian(employee.dateOfBirth)}</td>
                </tr>
                <tr>
                    <td className="border border-gray-400 p-2 bg-gray-50 font-bold">Pendidikan Terakhir</td>
                    <td className="border border-gray-400 p-2">{employee.education}</td>
                </tr>
                <tr>
                    <td className="border border-gray-400 p-2 bg-gray-50 font-bold">Gaji Pokok</td>
                    <td className="border border-gray-400 p-2">Rp. {employee.salaryAmount}</td>
                </tr>
            </tbody>
        </table>
      </div>

      <div className="mb-8 p-3 border border-black rounded-lg bg-gray-50 text-sm">
          <p className="font-bold mb-2">Catatan Verifikasi:</p>
          <div className="flex items-center mb-1">
             <div className="w-5 h-5 border border-black flex items-center justify-center mr-2 font-bold text-xs">✓</div>
             <span>Data Pegawai telah sesuai dengan dokumen fisik/digital yang dilampirkan.</span>
          </div>
          <div className="flex items-center">
             <div className="w-5 h-5 border border-black flex items-center justify-center mr-2 font-bold text-xs">✓</div>
             <span>Pegawai telah menyetujui draft Perjanjian Kerja.</span>
          </div>
      </div>

      {/* SIGNATURES - 2 COLUMNS */}
      <div className="grid grid-cols-2 gap-8 mt-8 break-inside-avoid">
          {/* PEGAWAI (KIRI) */}
          <div className="text-center flex flex-col items-center justify-end">
              <div className="mb-20">
                  <p>Pegawai Pemerintah dengan Perjanjian Kerja Paruh Waktu,</p>
              </div>
              <div>
                  <p className="font-bold underline uppercase">{employee.name}</p>
                  <p>NI PPPK. {employee.nip}</p>
              </div>
          </div>

          {/* VERIFIKATOR (KANAN) */}
          <div className="text-center flex flex-col items-center justify-end">
              <div className="mb-20">
                  <p>Demak, {formatDateIndonesian(verifyDate)}</p>
                  <p>Verifikator Kepegawaian,</p>
              </div>
              <div>
                  <p className="font-bold underline uppercase">{verifierName || '..................................'}</p>
                  <p>NIP. {verifierNip || '..................................'}</p>
              </div>
          </div>
      </div>

    </div>
  );
};
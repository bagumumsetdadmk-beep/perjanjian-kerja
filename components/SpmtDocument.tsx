import React from 'react';
import { Employee, AppSettings } from '../types.ts';

interface SpmtDocumentProps {
  employee: Employee;
  settings: AppSettings;
}

const formatDateIndonesian = (dateString: string) => {
  if (!dateString) return ".......................";
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const SpmtDocument: React.FC<SpmtDocumentProps> = ({ employee, settings }) => {
  return (
    <div className="bg-white p-6 max-w-[210mm] mx-auto spmt-font text-justify text-black print:p-0 print:max-w-none print:w-full print:mx-0 leading-tight font-sans">
      
      {/* KOP SURAT */}
      <div className="border-b-4 border-double border-black pb-1 mb-5 flex items-center justify-center gap-4 text-center">
        {settings.logoUrl && (
             <img src={settings.logoUrl} alt="Logo" className="h-20 w-auto object-contain absolute left-8 top-8 print:left-0 print:top-0 print:relative print:mr-4" />
        )}
        <div className="flex-1" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
            <h3 className="text-lg font-medium uppercase tracking-wide leading-none mb-1">PEMERINTAH KABUPATEN DEMAK</h3>
            <h1 className="text-2xl font-bold uppercase tracking-wider leading-none mb-1">SEKRETARIAT DAERAH</h1>
            <div className="text-sm leading-tight space-y-0">
                <p className="m-0">Jalan Kyai Singkil Nomor 7, Demak, Jawa Tengah 59511</p>
                <p className="m-0">Telepon (0291) 685877, Faksimile (0291) 685625</p>
                <p className="m-0">Laman setda.demakkab.go.id, Pos-el setda@demakkab.go.id</p>
            </div>
        </div>
      </div>

      {/* JUDUL */}
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold font-bold underline">SURAT PERNYATAAN MELAKSANAKAN TUGAS</h2>
        <p>Nomor : 821 / {employee.spmtNumber || '.........................'} / {new Date().getFullYear()}</p>
      </div>

      {/* ISI: YANG BERTANDA TANGAN */}
      <div className="mb-3">
        <p className="mb-1">Yang bertanda tangan dibawah ini :</p>
        <table className="w-full ml-2">
          <tbody>
            <tr>
              <td className="w-6 align-top">1.</td>
              <td className="w-[250px] align-top">Nama</td>
              <td className="w-4 align-top">:</td>
              <td className="font-bold align-top">{settings.officialName}</td>
            </tr>
            <tr>
              <td className="align-top">2.</td>
              <td className="align-top">NIP</td>
              <td className="align-top">:</td>
              <td className="align-top">{settings.officialNip}</td>
            </tr>
            <tr>
              <td className="align-top">3.</td>
              <td className="align-top">Pangkat / Golongan Ruang</td>
              <td className="align-top">:</td>
              <td className="align-top">{settings.officialRank || '.....................................'}</td>
            </tr>
            <tr>
              <td className="align-top">4.</td>
              <td className="align-top">Jabatan</td>
              <td className="align-top">:</td>
              <td className="align-top">{settings.officialPosition}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-4">
        <p className="mb-1">Dengan ini menyatakan bahwa :</p>
        <table className="w-full ml-2">
          <tbody>
            <tr>
              <td className="w-6 align-top">1.</td>
              <td className="w-[250px] align-top">Nama</td>
              <td className="w-4 align-top">:</td>
              <td className="font-bold align-top">{employee.name}</td>
            </tr>
            <tr>
              <td className="align-top">2.</td>
              <td className="align-top">NI PPPK Paruh Waktu</td>
              <td className="align-top">:</td>
              <td className="align-top">{employee.nip}</td>
            </tr>
            <tr>
              <td className="align-top">3.</td>
              <td className="align-top">Jabatan</td>
              <td className="align-top">:</td>
              <td className="align-top">{employee.position}</td>
            </tr>
            <tr>
              <td className="align-top">4.</td>
              <td className="align-top" colSpan={3}>
                Surat Pengangkatan sebagai Pegawai Pemerintah dengan Perjanjian Kerja Paruh Waktu (PPPK Paruh Waktu) :
              </td>
            </tr>
          </tbody>
        </table>
        
        <table className="w-full ml-8 mt-0.5">
             <tbody>
                <tr>
                  <td className="w-6 align-top">a.</td>
                  <td className="w-[225px] align-top">Pejabat yang mengangkat</td>
                  <td className="w-4 align-top">:</td>
                  <td className="uppercase align-top">{settings.skOfficial || 'BUPATI DEMAK'}</td>
                </tr>
                <tr>
                  <td className="align-top">b.</td>
                  <td className="align-top">Nomor</td>
                  <td className="align-top">:</td>
                  <td className="align-top">{employee.skNumber || '.....................................'}</td>
                </tr>
                <tr>
                  <td className="align-top">c.</td>
                  <td className="align-top">Tanggal</td>
                  <td className="align-top">:</td>
                  <td className="align-top">{formatDateIndonesian(employee.skDate)}</td>
                </tr>
                <tr>
                  <td className="align-top">d.</td>
                  <td className="align-bottom">
                     Tanggal mulai berlakunya<br/>
                     pengangkatan sebagai<br/>
                     Pegawai Pemerintah<br/>
                     dengan Perjanjian Kerja<br/>
                     Paruh Waktu
                  </td>
                  <td className="align-bottom pb-0.5">:</td>
                  <td className="align-bottom pb-0.5">1 Oktober 2025 sampai dengan 30 September 2026</td>
                </tr>
             </tbody>
        </table>
      </div>

      <div className="mb-2 text-justify">
        <p className="indent-8 leading-relaxed">
          telah secara nyata melaksanakan tugas sejak tanggal <strong>{formatDateIndonesian(employee.spmtDate)}</strong> pada {employee.placementUnit || '.............................................'} Sekretariat Daerah Kabupaten Demak.
        </p>
        <p className="indent-8 mt-1">
          Demikian pernyataan ini dibuat dengan sesungguhnya untuk dapat digunakan sebagaimana mestinya.
        </p>
      </div>

      {/* TANDA TANGAN */}
      <div className="flex justify-end mt-10 mb-8 break-inside-avoid text-left">
         <div className="w-[380px]">
            {/* 1. Demak, Tanggal (Menjorok) */}
            <p className="pl-12 mb-1">Ditetapkan di Demak</p>
            <p className="pl-12 mb-2">Pada Tanggal 31 Desember 2025</p>
            
            {/* 2. Yang membuat pernyataan (Menjorok) */}
            <p className="pl-12 mb-4">Yang membuat pernyataan,</p>
            
            {/* 4. a.n. Sekretaris Daerah (LEBIH MAJU / Tidak ada padding kiri = paling kiri di box) */}
            <p className="pl-5">a.n. Sekretaris Daerah</p>
            
            {/* 5. Jabatan Spesifik (Menjorok sejajar no 1 & 2) */}
            <p className="pl-12">{settings.officialPosition.replace('Sekretaris Daerah', '').replace('Sekda', '').trim()}</p>
            
            {/* Jarak Tanda Tangan */}
            <div className="h-20"></div>
            
            {/* 9, 10, 11. Nama, Pangkat, NIP (Menjorok sejajar no 1 & 2) */}
            <div className="pl-12 -mt-1">
              <p className="font-bold underline">{settings.officialName}</p>
              <p className="font-medium">{settings.officialRank?.split('(')[0] || 'Pembina ............'}</p>
              <p>NIP {settings.officialNip}</p>
            </div>
         </div>
      </div>

    </div>
  );
};
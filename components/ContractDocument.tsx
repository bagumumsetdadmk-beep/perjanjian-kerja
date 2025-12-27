import React from 'react';
import { Employee, AppSettings } from '../types.ts';

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

// Helper to format date in numeric format (d-mm-yyyy) e.g., 2-01-2026
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
    if (year === 2027) return "Dua Ribu Dua Puluh Tujuh";
    return year.toString(); // Fallback
};

export const ContractDocument: React.FC<ContractDocumentProps> = ({ employee, settings }) => {
  const signDate = settings.signatureDate ? new Date(settings.signatureDate) : new Date();
  const dayName = getDayName(settings.signatureDate);
  const formattedDateIndo = formatDateIndonesian(settings.signatureDate);
  const formattedDateNumeric = formatDateNumeric(settings.signatureDate);
  
  // Split date components for the template
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

      {/* OPENING */}
      <p className="mb-4 text-black">
        Pada hari ini, <strong>{dayName}</strong> tanggal <strong>{datePartText}</strong> bulan <strong>{monthPart}</strong> tahun <strong>{yearText}</strong> ({formattedDateNumeric}) yang bertanda tangan di bawah ini :
      </p>

      {/* PIHAK KESATU */}
      <div>
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
      </div>

      {/* PIHAK KEDUA */}
      <div>
        <table className="w-full mb-6 align-top text-black">
          <tbody>
            <tr>
              <td className="w-8 align-top">II.</td>
              <td className="w-48 align-top">Nama</td>
              <td className="w-4 align-top">:</td>
              <td className="font-bold text-left">{employee.name}</td>
            </tr>
            <tr>
              <td></td>
              <td className="align-top">NI PPPK Paruh Waktu</td>
              <td className="align-top">:</td>
              <td className="text-left">{employee.nip}</td>
            </tr>
            <tr>
              <td></td>
              <td className="align-top">Tempat/tanggal lahir</td>
              <td className="align-top">:</td>
              <td className="text-left">{employee.placeOfBirth}, {formatDateIndonesian(employee.dateOfBirth)}</td>
            </tr>
            <tr>
              <td></td>
              <td className="align-top">Pendidikan</td>
              <td className="align-top">:</td>
              <td className="text-left">{employee.education}</td>
            </tr>
            <tr>
              <td></td>
              <td className="align-top">Alamat</td>
              <td className="align-top">:</td>
              <td className="text-left">{employee.address}</td>
            </tr>
            <tr>
              <td></td>
              <td colSpan={3} className="text-justify pt-2">
                dalam hal ini bertindak dan atas nama diri sendiri, untuk selanjutnya disebut <strong>PIHAK KEDUA</strong>.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mb-4 text-black">
        PIHAK KESATU dan PIHAK KEDUA sepakat untuk mengikatkan diri satu sama lain dalam Perjanjian Kerja dengan ketentuan sebagaimana dituangkan dalam Pasal-Pasal sebagai berikut :
      </p>

      {/* PASAL 1 */}
      <div>
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
              <td className="text-left">{employee.position}</td>
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
              <td className="text-left">{employee.unit}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* PASAL 2 */}
      <div>
        <div className="text-center font-bold mt-6 mb-2 text-black">
          <p>Pasal 2</p>
          <p>TUGAS PEKERJAAN</p>
        </div>
        <ol className="list-decimal ml-8 mb-4 space-y-2 text-black pl-4">
          <li>PIHAK KESATU membuat dan menetapkan tugas pekerjaan yang harus dilaksanakan oleh PIHAK KEDUA.</li>
          <li>PIHAK KEDUA wajib melaksanakan tugas pekerjaan yang diberikan PIHAK KESATU dengan sebaik-baiknya dan rasa tanggung jawab.</li>
        </ol>
      </div>

      {/* PASAL 3 */}
      <div>
        <div className="text-center font-bold mt-6 mb-2 text-black">
          <p>Pasal 3</p>
          <p>TARGET KINERJA</p>
        </div>
        <ol className="list-decimal ml-8 mb-4 space-y-2 text-black pl-4">
          <li>PIHAK KESATU membuat dan menetapkan target kinerja bagi PIHAK KEDUA selama masa Perjanjian Kerja.</li>
          <li>PIHAK KEDUA wajib memenuhi target kinerja yang telah ditetapkan oleh PIHAK KESATU.</li>
          <li>PIHAK KESATU dan PIHAK KEDUA menandatangani target perjanjian kinerja sesuai dengan ketentuan peraturan perundang-undangan.</li>
        </ol>
      </div>

      {/* PASAL 4 */}
      <div>
        <div className="text-center font-bold mt-6 mb-2 text-black">
          <p>Pasal 4</p>
          <p>HARI KERJA DAN JAM KERJA</p>
        </div>
        <p className="mb-4 text-black">
          PIHAK KEDUA wajib bekerja sesuai dengan hari kerja dan jam kerja yang berlaku di instansi PIHAK KESATU.
        </p>
      </div>

      {/* PASAL 5 */}
      <div>
        <div className="text-center font-bold mt-6 mb-2 text-black">
          <p>Pasal 5</p>
          <p>DISIPLIN</p>
        </div>
        <ol className="list-decimal ml-8 mb-4 space-y-2 text-black pl-4">
          <li>PIHAK KEDUA wajib mematuhi semua kewajiban dan larangan;</li>
          <li>
            Kewajiban bagi PIHAK KEDUA sebagaimana dimaksud pada ayat (1) meliputi :
            <ol className="list-[lower-alpha] ml-6 mt-1 space-y-1">
               <li>setia dan taat pada Pancasila, Undang-Undang Dasar Negara Republik Indonesia Tahun 1945, Negara Kesatuan Republik Indonesia, dan pemerintah yang sah;</li>
               <li>menjaga persatuan dan kesatuan bangsa;</li>
               <li>melaksanakan kebijakan yang dirumuskan pejabat pemerintah yang berwenang;</li>
               <li>menaati ketentuan peraturan perundang-undangan;</li>
               <li>melaksanakan tugas kedinasan dengan penuh pengabdian, kejujuran, kesadaran, dan tanggung jawab;</li>
               <li>menunjukkan integritas dan keteladanan dalam sikap, perilaku, ucapan, dan tindakan kepada setiap orang, baik di dalam maupun di luar kedinasan;</li>
               <li>menyimpan rahasia jabatan dan hanya dapat mengemukakan rahasia jabatan sesuai dengan ketentuan peraturan perundang-undangan; dan</li>
               <li>bersedia ditempatkan di seluruh wilayah Negara Kesatuan Republik Indonesia.</li>
            </ol>
          </li>
          <li>
            Selain memenuhi kewajiban sebagaimana dimaksud pada ayat (2) PIHAK KEDUA wajib:
            <ol className="list-[lower-alpha] ml-6 mt-1 space-y-1">
              <li>mengutamakan kepentingan Negara daripada kepentingan sendiri, seseorang dan/atau golongan;</li>
              <li>mencapai target kinerja pegawai yang ditetapkan;</li>
              <li>menggunakan dan memelihara barang-barang milik Negara dengan sebaik-baiknya;</li>
              <li>memberikan pelayanan yang sebaik-baiknya kepada masyarakat; dan</li>
              <li>sanggup berkoordinasi dan bekerjasama dengan sesama ASN dan Non ASN dalam rangka mewujudkan tujuan organisasi.</li>
            </ol>
          </li>
          <li>
             Larangan bagi PIHAK KEDUA sebagaimana dimaksud pada ayat (1) meliputi :
             <ol className="list-[lower-alpha] ml-6 mt-1 space-y-1">
               <li>menyalahgunakan wewenang;</li>
               <li>menjadi perantara untuk mendapatkan keuntungan pribadi dan/atau orang lain dengan menggunakan kewenangan orang lain;</li>
               <li>tanpa izin Pemerintah menjadi pegawai atau bekerja untuk negara lain dan/atau lembaga atau organisasi internasional;</li>
               <li>bekerja pada perusahaan asing, konsultan asing, atau lembaga swadaya masyarakat asing;</li>
               <li>memiliki, menjual, membeli, menggadaikan, menyewakan, atau meminjamkan barang barang baik bergerak atau tidak bergerak, dokumen atau surat berharga milik negara secara tidak sah;</li>
               <li>melakukan kegiatan bersama dengan atasan, teman sejawat atau orang lain di dalam maupun di luar lingkungan kerjanya dengan tujuan untuk keuntungan pribadi, golongan, atau pihak lain yang secara langsung atau tidak langsung merugikan negara;</li>
               <li>memberikan atau menyanggupi akan memberi sesuatu kepada siapapun baik secara langsung atau tidak langsung dan dengan dalih apapun untuk diangkat dalam jabatan;</li>
               <li>menerima hadiah atau suatu pemberian apa saja dari siapapun juga yang berhubungan dengan jabatan dan/atau pekerjaan;</li>
               <li>melakukan suatu tindakan atau tidak melakukan suatu tindakan yang dapat menghalangi atau mempersulit salah satu pihak yang dilayani sehingga mengakibatkan kerugian bagi yang dilayani;</li>
               <li>menghalangi berjalannya tugas kedinasan;</li>
               <li>
                 memberikan dukungan kepada calon Presiden/Wakil Presiden, Dewan Perwakilan Rakyat, Dewan Perwakilan Daerah, atau Dewan Perwakilan Rakyat Daerah dengan cara :
                 <ol className="list-decimal ml-6 mt-1">
                   <li>ikut serta sebagai pelaksana kampanye;</li>
                   <li>menjadi peserta kampanye dengan menggunakan atribut partai atau atribut Aparatur Sipil Negara;</li>
                   <li>sebagai peserta kampanye dengan mengerahkan Apatur Sipil Negara lain; dan/atau</li>
                   <li>sebagai peserta kampanye dengan menggunakan fasilitas Negara.</li>
                 </ol>
               </li>
               <li>
                  memberikan dukungan kepada calon Presiden/Wakil Presiden dengan cara :
                  <ol className="list-decimal ml-6 mt-1">
                    <li>membuat keputusan dan/atau tindakan yang menguntungkan atau merugikan salah satu pasangan calon selama masa kampanye; dan/atau</li>
                    <li>mengadakan kegiatan yang mengarah kepada keberpihakan terhadap pasangan calon yang menjadi peserta pemilu sebelum, selama, dan/atau sesudah masa kampanye meliputi pertemuan, ajakan, himbauan, seruan, atau pemberian barang kepada Aparatur Sipil Negara dalam lingkungan unit kerjanya, anggota keluarga, dan masyarakat.</li>
                  </ol>
               </li>
               <li>memberikan dukungan kepada calon anggota Dewan Perwakilan Daerah atau calon Kepala Daerah/Wakil Kepala Daerah dengan cara memberikan surat dukungan disertai foto kopi Kartu Tanda Penduduk atau Surat Keterangan Tanda Penduduk sesuai dengan ketentuan peraturan perundang-undangan; dan</li>
               <li>
                  memberikan dukungan kepada calon Kepala Daerah/Wakil Kepala Daerah, dengan cara :
                  <ol className="list-decimal ml-6 mt-1">
                    <li>terlibat dalam kegiatan kampanye untuk mendukung calon Kepala Daerah/Wakil Kepala Daerah;</li>
                    <li>menggunakan fasilitas yang terkait dengan jabatan dalam kegiatan kampanye;</li>
                    <li>membuat keputusan dan/atau tindakan yang menguntungkan atau merugikan salah satu pasangan calon selama masa kampanye; dan/atau</li>
                    <li>mengadakan kegiatan yang mengarah kepada keberpihakan terhadap pasangan calon yang menjadi peserta pemilu sebelum, selama, dan/atau sesudah masa kampanye meliputi pertemuan, ajakan, himbauan, seruan, atau pemberian barang kepada Aparatur Sipil Negara dalam lingkungan kerjanya, anggota keluarga, dan masyarakat.</li>
                  </ol>
               </li>
             </ol>
          </li>
          <li>
            Selain larangan sebagaimana dimaksud pada ayat (4), PIHAK KEDUA dilarang :
            <ol className="list-[lower-alpha] ml-6 mt-1 space-y-1">
              <li>merusak dengan sengaja dan/atau menghilangkan aset milik Pemerintah Kabupaten Demak;</li>
              <li>mencemarkan nama baik pimpinan atau teman kerja di instansi kerja masing-masing;</li>
              <li>membocorkan rahasia jabatan dan dokumen Negara; dan</li>
              <li>melakukan perbuatan tercela yang bertentangan dengan agama dan etika yang berlaku di masyarakat.</li>
            </ol>
          </li>
          <li>PIHAK KEDUA yang tidak mematuhi kewajiban dan/atau melanggar larangan sebagaimana dimaksud pada ayat (2), ayat (3), ayat (4), dan ayat (5) diberikan sanksi hukuman disiplin sesuai dengan ketentuan peraturan perundang-undangan yang berlaku.</li>
          <li>Tata cara penjatuhan dan jenis hukuman disiplin sebagaimana dimaksud pada ayat (6) mengikuti ketentuan yang berlaku sebagaimana diatur dalam Peraturan Pemerintah yang mengatur mengenai disiplin Pegawai Negeri Sipil.</li>
        </ol>
      </div>

      {/* PASAL 6 */}
      <div>
        <div className="text-center font-bold mt-6 mb-2 text-black">
          <p>Pasal 6</p>
          <p>GAJI ATAU UPAH</p>
        </div>
        <p className="mb-2 text-black">
          PIHAK KEDUA berhak menerima gaji atau upah sebesar Rp. {employee.salaryAmount || "..........................."} ({employee.salaryText || ".................................................."}) atau sesuai kemampuan keuangan daerah yang ditetapkan dalam Peraturan Bupati tentang Standar Harga Satuan Barang/Jasa Pemerintah Kabupaten Demak dengan ketentuan sebagai berikut:
        </p>
        <ol className="list-[lower-alpha] ml-10 mb-4 space-y-1 text-black">
          <li>gaji atau upah dapat bersumber dari Anggaran Pendapatan dan Belanja Daerah (APBD) atau Badan Layanan Umum Daerah (BLUD) atau Bantuan Operasional Satuan Pendidikan (BOSP);</li>
          <li>gaji atau upah dapat berubah menyesuaikan dengan ketentuan peraturan yang berlaku;</li>
          <li>gaji atau upah yang tercantum belum termasuk iuran/potongan sesuai dengan ketentuan peraturan perundang-undangan;</li>
          <li>pembayaran gaji atau upah dilakukan sejak PIHAK KEDUA melaksanakan tugas yang dibuktikan dengan Surat Pernyataan Melaksanakan Tugas (SPMT) dari pimpinan unit kerja penempatan PIHAK KEDUA;</li>
          <li>apabila PIHAK KEDUA yang melaksanakan tugas pada tanggal hari kerja pertama bulan berkenaan, gaji atau upah dibayarkan mulai bulan berkenaan; dan</li>
          <li>apabila PIHAK KEDUA yang melaksanakan tugas pada tanggal hari kerja kedua dan seterusnya pada bulan berkenaan, gaji dan tunjangan dibayarkan mulai bulan berikutnya.</li>
        </ol>
      </div>

      {/* PASAL 7 */}
      <div>
        <div className="text-center font-bold mt-6 mb-2 text-black">
          <p>Pasal 7</p>
          <p>CUTI</p>
        </div>
        <ol className="list-decimal ml-8 mb-4 space-y-2 text-black pl-4">
          <li>PIHAK KEDUA berhak mendapatkan cuti tahunan, cuti sakit, cuti melahirkan, dan cuti bersama selama masa Perjanjian Kerja.</li>
          <li>Cuti sebagaimana dimaksud pada ayat (1) dilaksanakan sesuai dengan ketentuan peraturan perundang-undangan.</li>
        </ol>
      </div>

      {/* PASAL 8 */}
      <div>
        <div className="text-center font-bold mt-6 mb-2 text-black">
          <p>Pasal 8</p>
          <p>PENGEMBANGAN KOMPETENSI</p>
        </div>
        <ol className="list-decimal ml-8 mb-4 space-y-2 text-black pl-4">
          <li>PIHAK KEDUA wajib melakukan pengembangan kompetensi melalui pembelajaran secara terus menerus agar tetap relevan dengan tuntutan organisasi.</li>
          <li>Pelaksanaan pengembangan kompetensi sebagaimana dimaksud pada ayat (1) dilaksanakan sesuai dengan ketentuan peraturan perundang-undangan.</li>
        </ol>
      </div>

      {/* PASAL 9 */}
      <div>
        <div className="text-center font-bold mt-6 mb-2 text-black">
          <p>Pasal 9</p>
          <p>PENGHARGAAN</p>
        </div>
        <ol className="list-decimal ml-8 mb-4 space-y-2 text-black pl-4">
          <li>
            PIHAK KESATU dapat memberikan penghargaan kepada PIHAK KEDUA berupa :
            <ol className="list-[lower-alpha] ml-6 mt-1 space-y-1">
              <li>tanda kehormatan;</li>
              <li>kesempatan prioritas untuk pengembangan kompetensi; dan/atau</li>
              <li>kesempatan menghadiri acara resmi dan/atau acara kenegaraan.</li>
            </ol>
          </li>
          <li>Pemberian penghargaan kepada PIHAK KEDUA sebagaimana dimaksud pada ayat (1) huruf a dilaksanakan sesuai dengan ketentuan peraturan perundang-undangan.</li>
          <li>Pemberian penghargaan kepada PIHAK KEDUA sebagaimana dimaksud pada ayat (1) huruf b diberikan kepada PIHAK KEDUA apabila mempunyai penilaian kinerja yang paling baik.</li>
          <li>Pemberian penghargaan kepada PIHAK KEDUA sebagaimana dimaksud pada ayat (1) huruf c diberikan kepada PIHAK KEDUA setelah mendapatkan pertimbangan dari Tim Penilai Kinerja Pegawai Pemerintah dengan Perjanjian Kerja Paruh Waktu yang ada pada PIHAK KESATU.</li>
        </ol>
      </div>

      {/* PASAL 10 */}
      <div>
        <div className="text-center font-bold mt-6 mb-2 text-black">
          <p>Pasal 10</p>
          <p>PERLINDUNGAN</p>
        </div>
        <ol className="list-decimal ml-8 mb-4 space-y-2 text-black pl-4">
          <li>PIHAK KESATU wajib memberikan perlindungan bagi PIHAK KEDUA sesuai dengan ketentuan peraturan perundang-undangan.</li>
          <li>Perlindungan sebagaimana dimaksud pada ayat (1) dilakukan dengan mengikutsertakan PIHAK KEDUA dalam program sistem jaminan sosial nasional.</li>
          <li>Perlindungan sebagaimana dimaksud pada ayat (1) diberikan kepada PIHAK KEDUA terkait dengan pelaksanaan tugas.</li>
          <li>Pemberian perlindungan kepada PIHAK KEDUA sebagaimana dimaksud pada ayat (1) dilaksanakan sesuai dengan ketentuan peraturan perundang-undangan.</li>
        </ol>
      </div>

      {/* PASAL 11 */}
      <div>
        <div className="text-center font-bold mt-6 mb-2 text-black">
          <p>Pasal 11</p>
          <p>PEMUTUSAN HUBUNGAN PERJANJIAN KERJA</p>
        </div>
        <div className="mb-4 text-black">
          <p className="mb-2">PIHAK KESATU dan PIHAK KEDUA dapat melakukan pemutusan hubungan Perjanjian Kerja dengan ketentuan sebagai berikut :</p>
          <ol className="list-decimal ml-8 space-y-2 pl-4">
            <li>
              Pemutusan hubungan Perjanjian Kerja dengan hormat dilakukan apabila :
              <ol className="list-[lower-alpha] ml-6 mt-1 space-y-1">
                <li>jangka waktu Perjanjian Kerja berakhir;</li>
                <li>PIHAK KEDUA meninggal dunia;</li>
                <li>PIHAK KEDUA memasuki Batas Usia Tertentu mengikuti ketentuan yang berlaku sebagaimana diatur dalam Peraturan Pemerintah yang mengatur mengenai Batas Usia Pensiun Pegawai Negeri Sipil;</li>
                <li>PIHAK KEDUA mengajukan permohonan berhenti sebagai Pegawai Pemerintah dengan Perjanjian Kerja Paruh Waktu; atau</li>
                <li>terjadi perampingan organisasi atau kebijakan pemerintah yang mengakibatkan pengurangan Pegawai Pemerintah dengan Perjanjian Kerja Paruh Waktu pada PIHAK KESATU.</li>
              </ol>
            </li>
            <li>
              Pemutusan hubungan Perjanjian Kerja dengan hormat tidak atas permintaan sendiri dilakukan apabila :
              <ol className="list-[lower-alpha] ml-6 mt-1 space-y-1">
                <li>PIHAK KEDUA dihukum penjara berdasarkan putusan pengadilan yang telah memiliki kekuatan hukum tetap karena melakukan tindak pidana penjara paling singkat 2 (dua) tahun dan tindak pidana dilakukan dengan tidak berencana;</li>
                <li>PIHAK KEDUA melakukan pelanggaran kewajiban dan/atau larangan sebagaimana yang dimaksud dalam Pasal 5; atau</li>
                <li>PIHAK KEDUA tidak dapat memenuhi target kinerja yang telah disepakati sesuai dengan Perjanjian Kerja.</li>
              </ol>
            </li>
            <li>
              Pemutusan hubungan Perjanjian Kerja tidak dengan hormat dilakukan apabila :
              <ol className="list-[lower-alpha] ml-6 mt-1 space-y-1">
                <li>melakukan penyelewengan terhadap Pancasila dan/atau Undang-Undang Dasar Negara Republik Indonesia Tahun 1945;</li>
                <li>dihukum penjara atau kurungan berdasarkan putusan pengadilan yang telah memiliki kekuatan hukum tetap karena melakukan tindak pidana kejahatan jabatan atau tindak pidana yang ada hubungannya dengan jabatan;</li>
                <li>menjadi anggota dan/atau pengurus partai politik; atau</li>
                <li>dihukum penjara berdasarkan putusan pengadilan yang telah memiliki kekuatan hukum tetap karena melakukan tindak pidana yang diancam pidana penjara paling singkat 2 (dua) tahun atau lebih dan tindak pidana tersebut dilakukan dengan berencana.</li>
              </ol>
            </li>
          </ol>
        </div>
      </div>

      {/* PASAL 12 */}
      <div>
        <div className="text-center font-bold mt-6 mb-2 text-black">
          <p>Pasal 12</p>
          <p>PENYELESAIAN PERSELISIHAN</p>
        </div>
        <p className="mb-4 text-black">
          Apabila dalam pelaksanaan Perjanjian Kerja ini terjadi perselisian, maka PIHAK KESATU dan PIHAK KEDUA sepakat menyelesaikan perselisihan tersebut sesuai dengan ketentuan peraturan perundang-undangan.
        </p>
      </div>

      {/* PASAL 13 */}
      <div>
        <div className="text-center font-bold mt-6 mb-2 text-black">
          <p>Pasal 13</p>
          <p>LAIN-LAIN</p>
        </div>
        <ol className="list-decimal ml-8 mb-4 space-y-2 text-black pl-4">
          <li>PIHAK KEDUA bersedia melaksanakan seluruh ketentuan yang telah diatur dalam peraturan kedinasan dan peraturan lainnya yang berlaku di PIHAK KESATU.</li>
          <li>PIHAK KEDUA wajib menyimpan dan menjaga kerahasiaan baik dokumen maupun informasi milik PIHAK KESATU sesuai dengan ketentuan peraturan perundang- undangan.</li>
          <li>PIHAK KESATU dapat memperpanjang masa Perjanjian Kerja yang dilaksanakan sesuai dengan ketentuan peraturan perundang-undangan.</li>
        </ol>
      </div>

      <p className="mt-8 mb-8 text-black break-inside-avoid">
        Demikian Perjanjian Kerja ini dibuat dalam rangkap 2 (dua) oleh PIHAK KESATU dan PIHAK KEDUA dalam keadaan sehat dan sadar serta tanpa pengaruh ataupun paksaan dari pihak manapun, masing-masing bermeterai cukup dan mempunyai kekuatan hukum yang sama.
      </p>

      {/* SIGNATURES */}
      <div className="grid grid-cols-2 gap-8 mt-12 break-inside-avoid text-black text-center">
        {/* PIHAK KEDUA */}
        <div className="flex flex-col items-center">
           {/* Top Text with fixed minimum height for alignment */}
           <div className="min-h-[4.5rem] flex flex-col justify-start text-center">
             <p>PIHAK KEDUA</p>
             <p>PPPK Paruh Waktu,</p>
           </div>
           
           {/* Spacer for Materai (WIDENED) */}
           <div className="h-32"></div> 

           {/* Name Block */}
           <div className="text-center">
             <p className="font-bold underline">{employee.name}</p>
             <p>NI PPPK Paruh Waktu. {employee.nip}</p>
           </div>
        </div>

        {/* PIHAK KESATU */}
        <div className="flex flex-col items-center">
           {/* Top Text with fixed minimum height for alignment */}
           <div className="min-h-[4.5rem] flex flex-col justify-start text-center">
             <p>PIHAK KESATU</p>
             <p>a.n. Bupati Demak,</p>
             <p>{settings.officialPosition || 'Kepala OPD..........'}</p>
           </div>

           {/* Spacer */}
           <div className="h-32"></div>

           {/* Name Block */}
           <div className="text-center">
             <p className="font-bold underline">{settings.officialName || 'Nama..........................'}</p>
             <p>NIP. {settings.officialNip || '.............................'}</p>
           </div>
        </div>
      </div>
    </div>
  );
};
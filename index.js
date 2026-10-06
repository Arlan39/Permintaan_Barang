// Monitor Permintaan Barang - Vercel edition
const crypto=require('crypto');
const {put,get,list,del:blobDel,issueSignedToken,presignUrl} = require('@vercel/blob');
const VERSION=24;
const APP_VERSION='1.12.0';
const CHANGELOG=/*CL*/[
 {
  "v": "1.12.0",
  "tgl": "2026-10-05",
  "judul": "Lampiran pada permintaan dan realisasi",
  "isi": [
   "Lampiran foto/scan nota, PO, atau penawaran pada permintaan (di detail permintaan) dan pada tiap catatan realisasi (bisa langsung dilampirkan saat Catat Realisasi).",
   "Format PDF, JPG, PNG, WEBP, GIF, XLSX, DOCX, maks. 10 MB per file dan 30 per permintaan; foto otomatis diperkecil sebelum diunggah; isi file diperiksa (bukan hanya nama/ekstensi).",
   "Pratinjau gambar, klik untuk membuka; penanda 📎 jumlah lampiran di daftar; nama lampiran ikut di lembar cetak; kolom Jumlah Lampiran di Excel.",
   "Penghapusan lampiran hanya oleh pengunggah atau EDP dan tercatat (file tidak dihapus dari disk). Lampiran tersimpan di folder uploads (disalin otomatis ke BACKUP_EXTRA jika diatur)."
  ]
 },
 {
  "v": "1.11.0",
  "tgl": "2026-10-05",
  "judul": "Pembatasan login per IP",
  "isi": [
   "Tiap pengguna bisa dibatasi hanya boleh login dari IP tertentu (Pengguna > Edit > IP yang diizinkan): satu IP, rentang 192.168.1.0/24, atau 192.168.1.*. Kosong = boleh dari mana saja.",
   "Dicek saat login dan pada setiap aksi: jika IP dicabut, sesi yang sedang berjalan langsung berakhir. Komputer server sendiri (localhost) selalu boleh untuk pemulihan.",
   "Pengaman: EDP tidak bisa menyimpan daftar IP akunnya sendiri yang tidak memuat IP-nya saat ini; tombol 'Tambahkan IP saya'; log percobaan yang ditolak karena IP dengan tombol 'Izinkan IP ini'.",
   "Perintah pemulihan akun (--akun-edp) juga menghapus pembatasan IP akun itu."
  ]
 },
 {
  "v": "1.10.0",
  "tgl": "2026-10-04",
  "judul": "Impor & ekspor Master Barang",
  "isi": [
   "Impor Master Barang dari Excel (.xlsx), CSV, atau tempel langsung dari Excel; template tersedia (tombol Template). Ada pratinjau dan validasi per baris sebelum disimpan.",
   "Barang baru mendapat kode otomatis. Barang yang sudah ada (dikenali lewat Kode atau nama) bisa dilewati atau diperbarui satuan/harganya. 'Stok Awal' hanya berlaku untuk barang baru (saldo awal) dan tercatat.",
   "Aman: backup otomatis 'sebelum-impor' dibuat dulu, dan impor dibatalkan seluruhnya jika server menemukan baris bermasalah.",
   "Export Master Barang ke Excel; file itu bisa diedit (mis. harga massal) lalu diimpor kembali lewat kolom Kode."
  ]
 },
 {
  "v": "1.9.0",
  "tgl": "2026-10-04",
  "judul": "Keamanan sesi & koreksi permintaan",
  "isi": [
   "Keluar otomatis jika tidak ada aktivitas (default 2 jam; EDP mengatur di Pengaturan > Keamanan Sesi, termasuk 'Tidak dibatasi'). Klik/mengetik dihitung aktivitas; penyegaran otomatis halaman tidak dihitung.",
   "Login pertama tidak dipaksa mengganti password; password tetap bisa diganti lewat tombol Ganti Password.",
   "Pemohon bisa mengubah permintaan selama belum diproses penyetuju (alur approval dihitung ulang dari awal) dan membatalkan permintaan sebelum disetujui penuh (alasan wajib); EDP bisa melakukannya untuk semua permintaan.",
   "Status baru 'Dibatalkan' (daftar, filter, laporan, Excel); permintaan batal tidak dihitung di ringkasan barang.",
   "Penyetuju yang sedang menunggu diberi tahu saat permintaan diubah atau dibatalkan; kode OTP yang sudah dikirim otomatis hangus; form approve yang sudah terbuka ditolak jika isi permintaan berubah."
  ]
 },
 {
  "v": "1.8.0",
  "tgl": "2026-10-04",
  "judul": "Informasi aplikasi & riwayat versi",
  "isi": [
   "Footer di bagian bawah semua halaman: nama aplikasi, nomor versi, nama instansi (Untuk) dan pembuat/pengelola (Dibuat oleh).",
   "Keterangan Untuk/Dibuat oleh diatur EDP di Pengaturan > Informasi Aplikasi.",
   "Klik nomor versi atau 'Riwayat versi' untuk melihat catatan semua pembaruan; tanda 'baru' muncul jika ada versi yang belum dibaca."
  ]
 },
 {
  "v": "1.7.0",
  "tgl": "",
  "judul": "OTP saat approve, dipilih per level",
  "isi": [
   "Tiap level approval bisa diwajibkan OTP: kode 6 digit dikirim ke Telegram/WhatsApp penyetuju (berlaku 5 menit, sekali pakai, maks. 5 kali salah).",
   "Alur Approval kini berupa tabel: kolom 'Ikut approval' dan 'Wajib OTP' per level, dengan ringkasan 'OTP hanya di: ...' dan peringatan jika penyetuju belum terhubung.",
   "Menolak seluruh permintaan tidak memerlukan OTP; approve sebagian tetap memerlukan OTP.",
   "Tanda OTP hanya tampil di layar, tidak ikut tercetak/Excel."
  ]
 },
 {
  "v": "1.6.0",
  "tgl": "",
  "judul": "Server otomatis & notifikasi",
  "isi": [
   "Windows: pasang-autostart.bat membuat server menyala otomatis saat komputer hidup dan dinyalakan ulang jika berhenti. Ubuntu: pasang-ubuntu.sh (service systemd).",
   "Notifikasi Telegram (bot) dan WhatsApp (lewat gateway, contoh Fonnte) ke penyetuju giliran berikutnya dan ke pemohon saat disetujui/ditolak.",
   "Tombol Notifikasi untuk tiap pengguna, pesan uji, riwayat pengiriman, dan alamat pemeriksaan server /api/health."
  ]
 },
 {
  "v": "1.5.0",
  "tgl": "",
  "judul": "Backup, pemulihan, dan mode produksi",
  "isi": [
   "Backup otomatis harian dan setiap ada perubahan data (30 hari terakhir), dengan salinan ke disk/komputer lain (BACKUP_EXTRA).",
   "Menu Backup Data: daftar, Buat Backup Sekarang, Unduh, dan Pulihkan (dengan konfirmasi dan password).",
   "Hapus Data Uji untuk memulai mode produksi (dengan backup otomatis) dan perintah pemulihan akun: node server.js --akun-edp."
  ]
 },
 {
  "v": "1.4.0",
  "tgl": "",
  "judul": "Pencarian, filter, dan pagination",
  "isi": [
   "Kolom cari dan filter status di Monitor, Permintaan, Realisasi, Pengeluaran, Master Barang, dan Laporan.",
   "Tampil 10 data terbaru per halaman dengan tombol Sebelumnya/Berikutnya.",
   "Tabel Monitoring Permintaan tanpa tombol aksi (aksi ada di kotak Menunggu tindakan Anda)."
  ]
 },
 {
  "v": "1.3.0",
  "tgl": "",
  "judul": "Role, alur approval fleksibel, dan approve sebagian",
  "isi": [
   "Role EDP (akses penuh) dan Admin (permintaan, pengeluaran, master barang, realisasi, laporan); username dan nama penyetuju bisa diedit.",
   "Daftar centang Alur Approval: level yang tidak dicentang dilewati untuk permintaan baru.",
   "Approve/Tolak per barang (sebagian disetujui, sebagian ditolak) dengan catatan; tombol Approve/Tolak di jendela detail.",
   "Nama lengkap penyetuju tampil di cetakan, laporan, dan Excel."
  ]
 },
 {
  "v": "1.2.0",
  "tgl": "",
  "judul": "Laporan, cetak, dan Excel",
  "isi": [
   "Laporan dengan sub menu: Ringkasan Barang, Permintaan, Approval, Realisasi Pembelian, Pengeluaran Barang.",
   "Cetak A4 portrait yang rapi (nominal Rupiah tidak terpecah, rata kanan) dan Export Excel (.xlsx) per kategori atau semua.",
   "Jendela detail permintaan lebih lebar dan responsif, warna tombol saat diklik."
  ]
 },
 {
  "v": "1.1.0",
  "tgl": "",
  "judul": "Server LAN, realisasi, pengeluaran, dan stok",
  "isi": [
   "Server Node.js: data tersimpan bersama di server (data.json) dan bisa diakses lewat jaringan LAN; hak akses dicek di server.",
   "Realisasi pembelian dengan jumlah dan harga sebenarnya (ada selisih); harga acuan master mengikuti harga beli terakhir.",
   "Pengeluaran barang ke Tim Gudang/Teknisi dengan bukti cetak dan pembatalan; kode barang otomatis; stok otomatis dan tidak bisa diedit manual."
  ]
 },
 {
  "v": "1.0.0",
  "tgl": "",
  "judul": "Versi awal",
  "isi": [
   "Master barang, permintaan pembelian, approval bertingkat Supervisor > Manager > BFM, dan login dengan username dan password."
  ]
 }
]/*CL*/; // naikkan jika server.js berubah; dicek oleh index.html
const ROLES=['EDP','Admin','Supervisor','Manager','BFM'],CHAIN=['Supervisor','Manager','BFM']; // semua level yang mungkin
const chainOf=r=>r.chain||CHAIN; // alur approval tiap permintaan (disimpan saat dibuat)
const hash=(pw,salt)=>crypto.scryptSync(pw,salt,32).toString('hex');
const mk=(user,nama,role,pw)=>{const salt=crypto.randomBytes(8).toString('hex');return{user,nama,role,salt,hash:hash(pw,salt)}};

let D;
const DEFAULT_DATA=()=>({items:[
  {kode:'BRG-001',nama:'Kertas A4 (rim)',satuan:'rim',harga:55000,stok:20},
  {kode:'BRG-002',nama:'Tinta Printer',satuan:'botol',harga:120000,stok:5},
  {kode:'BRG-003',nama:'Laptop Kantor',satuan:'unit',harga:8500000,stok:1}],
  reqs:[],users:[mk('edp','EDP','EDP','Edp@123'),mk('admin','Admin Gudang','Admin','Admin@123'),
  mk('spv','Supervisor','Supervisor','Spv@123'),mk('manager','Manager','Manager','Mgr@123'),mk('bfm','BFM','BFM','Bfm@123')]});
const STATE_PATH='app/data.json';
async function loadData(){
  try{const r=await get(STATE_PATH,{access:'private',useCache:false});D=JSON.parse(await new Response(r.stream).text());}
  catch{D=DEFAULT_DATA();normalize();await save();}
  normalize();
}
function normalize(){
D.issues=D.issues||[];D.stokLog=D.stokLog||[];
D.config=D.config||{};if(!Array.isArray(D.config.chain)||!D.config.chain.length)D.config.chain=[...CHAIN];
D.users=D.users||[];D.reqs=D.reqs||[];D.items=D.items||[];
D.users.forEach(u=>{if(u.role==='Staff')u.role='EDP'});D.reqs.forEach(r=>{if(r.by==='Staff')r.by='EDP'});
if(!D.users.some(u=>u.role==='EDP')){const a=D.users.find(u=>u.role==='Admin');if(a){a.role='EDP';console.log('PERINGATAN: belum ada akun EDP, akun "'+a.user+'" dijadikan EDP.')}}
{const nmOf=u=>(D.users.find(x=>x.user===u)||{}).nama;
 D.reqs.forEach(r=>{if(!r.byNama&&r.byUser)r.byNama=nmOf(r.byUser);(r.log||[]).forEach(g=>{if(!g.nama)g.nama=nmOf(g.user)});(r.real||[]).forEach(e=>{if(!e.nama)e.nama=nmOf(e.user)})});
 D.issues.forEach(o=>{if(!o.nama)o.nama=nmOf(o.user)})}
}
async function save(){
 normalize();
 await put(STATE_PATH,JSON.stringify(D,null,1),{access:'private',addRandomSuffix:false,allowOverwrite:true});
}
async function writeBackup(name){
 await put('backup/'+name,JSON.stringify(D,null,1),{access:'private',addRandomSuffix:false,allowOverwrite:true});
}
async function dailyBackup(){try{await writeBackup('harian-'+wibDate()+'.json');await pruneDaily()}catch(e){console.log('Backup gagal:',e.message)}}
async function pruneDaily(){try{
 const all=await list({prefix:'backup/'});const f=all.blobs.map(x=>x.pathname.split('/').pop()).filter(x=>/^harian-\d{4}-\d{2}-\d{2}\.json$/.test(x)).sort();
 for(const x of f.slice(0,Math.max(0,f.length-KEEP_DAYS)))await blobDel('backup/'+x);
}catch{}}
const KEEP_DAYS=30;
const wibDate=()=>new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Jakarta'});
const tsName=()=>new Date().toISOString().replace(/[:.]/g,'-');
const fails={};
const SESSION_SECRET=process.env.SESSION_SECRET||'CHANGE-ME-BEFORE-PRODUCTION';
const idleMs=()=>process.env.SESI_DETIK?+process.env.SESI_DETIK*1000:Math.max(0,+(D.config.sesiMenit??120))*60000;
const b64u=b=>Buffer.from(b).toString('base64url');
function makeSid(user,last=Date.now()){const p=b64u(JSON.stringify({u:user,t:last}));return p+'.'+crypto.createHmac('sha256',SESSION_SECRET).update(p).digest('base64url')}
function readSid(t){try{const [p,sig]=String(t||'').split('.');if(!p||!sig)return null;const good=crypto.createHmac('sha256',SESSION_SECRET).update(p).digest('base64url');if(sig.length!==good.length||!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(good)))return null;const x=JSON.parse(Buffer.from(p,'base64url').toString());if(!x.u||!x.t)return null;return x}catch{return null}}
function setSid(res,user,last=Date.now()){res.setHeader('Set-Cookie','sid='+makeSid(user,last)+'; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400')}
function clearSid(res){res.setHeader('Set-Cookie','sid=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0')}
const send=(res,c,o)=>{res.writeHead(c,{'Content-Type':'application/json'});res.end(JSON.stringify(o))};
const cookie=(req,k)=>((req.headers.cookie||'').split(';').map(x=>x.trim().split('=')).find(x=>x[0]===k)||[])[1];
const body=req=>new Promise((ok,no)=>{let d='';req.on('data',c=>{d+=c;if(d.length>2e6){no(new Error('Terlalu besar'));req.destroy()}});req.on('end',()=>{try{ok(d?JSON.parse(d):{})}catch{no(new Error('Format salah'))}})});
const now=()=>new Date().toLocaleString('id-ID',{timeZone:'Asia/Jakarta'});
const str=(v,n=100)=>String(v??'').trim().slice(0,n);
const err=m=>{throw new Error(m)};

// ===== Notifikasi: Telegram (bot) & WhatsApp (gateway pihak ketiga, mis. Fonnte) =====
process.on('uncaughtException',e=>console.log('Kesalahan tak terduga:',e&&e.stack||e));
process.on('unhandledRejection',e=>console.log('Kesalahan tak tertangani:',e&&e.stack||e));
const TGAPI=process.env.TELEGRAM_API||'https://api.telegram.org';
const notifLog=[],tgCodes={},sleep=ms=>new Promise(r=>setTimeout(r,ms));
const nlog=(to,ch,ok,info)=>{notifLog.unshift({at:now(),to,ch,ok,info:String(info).slice(0,160)});notifLog.length=Math.min(notifLog.length,60);if(!ok)console.log('Notifikasi gagal ['+ch+'] '+to+': '+info)};
const cleanWa=v=>String(v||'').replace(/[^\d+]/g,'').slice(0,20);
function cfgN(){const c=D.config.notif=D.config.notif||{};c.on=c.on!==false;c.appUrl=c.appUrl||'';
 c.telegram=c.telegram||{token:'',botName:''};c.wa=c.wa||{url:'',headerName:'Authorization',headerValue:'',format:'form',fieldNomor:'target',fieldPesan:'message',extra:'',countryCode:'62'};
 c.events=c.events||{};if(c.events.requester===undefined)c.events.requester=true;if(c.events.staffOnApproved===undefined)c.events.staffOnApproved=true;return c}
function notifPublic(){const c=cfgN();return{on:c.on,tg:!!c.telegram.token,bot:c.telegram.botName,wa:!!c.wa.url}}
function guessUrl(){return process.env.APP_URL||''}
async function httpReq(url,{method='GET',headers={},body=null,timeout=10000}={}){
 const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),timeout);try{const r=await fetch(url,{method,headers,body,signal:ac.signal});return{status:r.status,text:await r.text()}}finally{clearTimeout(tm)}}
async function tgSend(chat,text){const t=cfgN().telegram.token;if(!t)throw new Error('Token Telegram belum diisi');
 const r=await httpReq(`${TGAPI}/bot${t}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chat,text,disable_web_page_preview:true})});
 let j={};try{j=JSON.parse(r.text)}catch{}if(!j.ok)throw new Error(j.description||('HTTP '+r.status))}
const waNum=(n,cc)=>{let d=String(n||'').replace(/\D/g,'');if(!d)return '';if(d.startsWith('0'))d=cc+d.slice(1);else if(!d.startsWith(cc))d=cc+d;return d};
async function waSend(nomor,text){const w=cfgN().wa;if(!w.url)throw new Error('URL gateway WhatsApp belum diisi');
 const f={[w.fieldNomor||'target']:waNum(nomor,w.countryCode||'62'),[w.fieldPesan||'message']:text};
 String(w.extra||'').split('&').filter(Boolean).forEach(kv=>{const i=kv.indexOf('=');if(i>0)f[kv.slice(0,i)]=kv.slice(i+1)});
 const form=w.format!=='json',h={'Content-Type':form?'application/x-www-form-urlencoded':'application/json'};if(w.headerName&&w.headerValue)h[w.headerName]=w.headerValue;
 const r=await httpReq(w.url,{method:'POST',headers:h,body:form?new URLSearchParams(f).toString():JSON.stringify(f)});
 if(r.status<200||r.status>=300)throw new Error('HTTP '+r.status+' '+r.text.slice(0,100));
 let j=null;try{j=JSON.parse(r.text)}catch{}if(j&&(j.status===false||j.success===false))throw new Error(j.reason||j.message||'ditolak gateway')}
async function pushTo(u,text){const c=cfgN();if(!c.on)return;
 if(u.telegramId&&c.telegram.token){try{await tgSend(u.telegramId,text);nlog(u.nama,'Telegram',true,'terkirim')}catch(e){nlog(u.nama,'Telegram',false,e.message)}}
 if(u.wa&&c.wa.url){try{await waSend(u.wa,text);nlog(u.nama,'WhatsApp',true,'terkirim')}catch(e){nlog(u.nama,'WhatsApp',false,e.message)}}}
function notify(users,text){const seen=new Set();for(const u of users){if(!u||seen.has(u.user))continue;seen.add(u.user);pushTo(u,text).catch(e=>console.log('Notifikasi error:',e.message))}}
const rpS=n=>'Rp '+Number(n||0).toLocaleString('id-ID');
const totS=r=>r.lines.reduce((a,l)=>l.rej?a:a+l.qty*l.harga,0);
const appLink=()=>{const u=cfgN().appUrl||guessUrl();return u?'\n'+u:''};
const usersOf=role=>D.users.filter(u=>u.role===role);
function notifyNext(r){const ch=chainOf(r);if(r.rejected||r.canceled||r.step>=ch.length)return;
 notify(usersOf(ch[r.step]),`🔔 Menunggu persetujuan Anda (${ch[r.step]})\n${r.id} · ${r.byNama||r.by}\nKeperluan: ${r.ket}\nTotal: ${rpS(totS(r))} (${r.lines.filter(l=>!l.rej).length} barang)${appLink()}`)}
function onActed(r,me,ap,rj,cat){const c=cfgN(),rq=D.users.find(x=>x.user===r.byUser),rqL=c.events.requester&&rq?[rq]:[];
 if(!ap.length){notify(rqL,`❌ Permintaan ${r.id} DITOLAK oleh ${me.role} (${me.nama}).\nAlasan: ${cat}${appLink()}`);return}
 if(rj.length)notify(rqL,`⚠️ ${rj.length} barang pada ${r.id} ditolak oleh ${me.role} (${me.nama}): ${rj.map(i=>r.lines[i].nama).join(', ')}.\nAlasan: ${cat}`);
 if(r.step>=chainOf(r).length){const st=c.events.staffOnApproved?D.users.filter(u=>u.role==='EDP'||u.role==='Admin'):[];
  notify([...rqL,...st],`✅ Permintaan ${r.id} DISETUJUI penuh (${r.lines.filter(l=>!l.rej).length} dari ${r.lines.length} barang, ${rpS(totS(r))}).\nSelanjutnya: realisasi pembelian oleh EDP/Admin.${appLink()}`)}
 else notifyNext(r)}
// ===== OTP approve: kode 6 digit dikirim ke Telegram/WhatsApp penyetuju (diwajibkan per level lewat Alur Approval) =====
const OTP_TTL=+process.env.OTP_TTL_MS||300000,OTP_COOLDOWN=+process.env.OTP_COOLDOWN_MS||30000,OTP_TRIES=5,otps={};
const otpHash=(code,salt)=>crypto.createHash('sha256').update(salt+':'+code).digest('hex');
const otpNeeded=role=>!!(D.config.otp&&D.config.otp[role]);
async function otpRequest(me,r){const c=cfgN(),k=me.user+'|'+r.id,old=otps[k];
 for(const x in otps)if(otps[x].exp<Date.now())delete otps[x];
 if(old&&Date.now()-old.sentAt<OTP_COOLDOWN)err('Tunggu '+Math.ceil((OTP_COOLDOWN-(Date.now()-old.sentAt))/1000)+' detik sebelum meminta kode baru.');
 const code=String(crypto.randomInt(0,1000000)).padStart(6,'0'),sent=[],fail=[];
 const text=`🔐 Kode OTP approve ${r.id}: ${code}\nBerlaku ${Math.round(OTP_TTL/60000)} menit. Jangan bagikan kode ini kepada siapa pun.`;
 if(c.telegram.token&&me.telegramId){try{await tgSend(me.telegramId,text);sent.push('Telegram')}catch(e){fail.push('Telegram: '+e.message)}}
 if(c.wa.url&&me.wa){try{await waSend(me.wa,text);sent.push('WhatsApp')}catch(e){fail.push('WhatsApp: '+e.message)}}
 if(!sent.length)err(fail.length?'Gagal mengirim OTP ('+fail.join('; ')+')':'Anda belum menghubungkan Telegram/WhatsApp. Buka tombol 🔔 Notifikasi untuk menghubungkan.');
 const salt=crypto.randomBytes(8).toString('hex');otps[k]={h:otpHash(code,salt),salt,exp:Date.now()+OTP_TTL,tries:0,step:r.step,sentAt:Date.now()};
 nlog(me.nama,'OTP '+sent.join('/'),true,'kode dikirim ('+r.id+')');return{sent,ttl:Math.round(OTP_TTL/1000)}}
function otpVerify(me,r,code){const k=me.user+'|'+r.id,o=otps[k];
 if(!o||o.exp<Date.now()||o.step!==r.step)err('Kode OTP belum diminta atau sudah kedaluwarsa. Minta kode baru.');
 if(o.tries>=OTP_TRIES){delete otps[k];err('Terlalu banyak salah memasukkan kode. Minta kode baru.')}
 const ok=crypto.timingSafeEqual(Buffer.from(otpHash(String(code||'').trim(),o.salt),'hex'),Buffer.from(o.h,'hex'));
 if(!ok){o.tries++;err('Kode OTP salah (sisa percobaan '+(OTP_TRIES-o.tries)+').')}
 delete otps[k]}
// Telegram polling is disabled on Vercel; use /api/tg/webhook.
// ===== Pembatasan login per IP (daftar IP per pengguna; kosong = bebas). Lapisan tambahan di jaringan internal, bukan pengganti password/OTP. =====
// Di belakang reverse proxy (nginx) jalankan dengan TRUST_PROXY=1 agar IP asli diambil dari X-Forwarded-For. Tanpa itu header tersebut DIABAIKAN.
const secLog=[];
const normIp=a=>{a=String(a||'').trim();if(a.startsWith('::ffff:'))a=a.slice(7);if(a==='::1')a='127.0.0.1';return a};
function clientIp(req){let a=req.headers['x-forwarded-for']||req.headers['x-real-ip']||'127.0.0.1';return normIp(String(a).split(',')[0])}
const slog=(u,ip)=>{secLog.unshift({at:now(),user:u.user,nama:u.nama,ip});secLog.length=Math.min(secLog.length,60)};

// ===== Lampiran (foto nota, PO, penawaran) =====
const MAX_UP=(+process.env.MAX_UPLOAD_MB||10)*1048576;
const EXT={pdf:'application/pdf',jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',gif:'image/gif',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'};
function magicOk(ext,b){const h=a=>a.every((x,i)=>b[i]===x);
 if(ext==='pdf')return h([0x25,0x50,0x44,0x46]);if(ext==='jpg'||ext==='jpeg')return h([0xFF,0xD8,0xFF]);if(ext==='png')return h([0x89,0x50,0x4E,0x47]);if(ext==='gif')return h([0x47,0x49,0x46,0x38]);
 if(ext==='webp')return h([0x52,0x49,0x46,0x46])&&b[8]===0x57&&b[9]===0x45&&b[10]===0x42&&b[11]===0x50;
 if(ext==='xlsx'||ext==='docx')return h([0x50,0x4B,0x03,0x04]);return false}
function rawBody(req,max){return new Promise((ok,no)=>{const ch=[];let n=0,over=false;
 req.on('data',c=>{n+=c.length;if(n>max){over=true;return}ch.push(c)});
 req.on('end',()=>over?no(new Error('File terlalu besar (maks. '+Math.round(max/1048576)+' MB)')):ok(Buffer.concat(ch)));req.on('error',no)})}

async function api(req,res,p){
 const b=req.method==='POST'?await body(req):{},ip=clientIp(req);
 if(p==='/api/login'){
  const f=fails[ip]||{n:0,t:0};if(f.n>=5&&Date.now()-f.t<3e5)err('Terlalu banyak percobaan, coba lagi 5 menit');
  const us=D.users.find(x=>x.user===str(b.user).toLowerCase());
  const ok=us&&crypto.timingSafeEqual(Buffer.from(hash(String(b.pass||''),us.salt),'hex'),Buffer.from(us.hash,'hex'));
  const GAGAL='Login gagal. Periksa username dan password. Jika sudah benar, akun mungkin hanya diizinkan dari komputer tertentu (IP Anda: '+ip+').';
  if(!ok){fails[ip]={n:f.n+1,t:Date.now()};return send(res,401,{err:GAGAL})}
  if(!ipAllowed(us,ip)){fails[ip]={n:f.n+1,t:Date.now()};slog(us,ip);return send(res,401,{err:GAGAL})}
  delete fails[ip];setSid(res,us.user);return send(res,200,{ok:1});
 }
 if(p==='/api/health')return send(res,200,{ok:1,ver:VERSION,versi:APP_VERSION,up:0});
 if(p==='/api/versi'){const a=D.config.app||{};return send(res,200,{versi:APP_VERSION,changelog:CHANGELOG,org:a.org||'',dev:a.dev||''})}
 const sid=cookie(req,'sid'),sx=readSid(sid);
 if(!sx)return send(res,401,{err:'Belum login'});
 const im=idleMs();if(im>0&&Date.now()-sx.t>im){clearSid(res);return send(res,401,{err:'Sesi habis'})}
 const me=D.users.find(x=>x.user===sx.u);
 if(!me)return send(res,401,{err:'Belum login'});
 if(!ipAllowed(me,ip)){clearSid(res);return send(res,403,{err:'IP_TIDAK_DIIZINKAN'})}
 if(!(req.url||'').includes('bg=1'))setSid(res,me.user,Date.now());
 if(p==='/api/ping')return send(res,200,{ok:1});
 const adm=me.role==='EDP'; // EDP = akses penuh (pengguna, pengaturan, pembatalan)
 const stf=['EDP','Admin'].includes(me.role); // EDP & Admin: master barang & realisasi
 if(p==='/api/state')return send(res,200,{ver:VERSION,myIp:ip,sesi:{menit:D.config.sesiMenit??120,detik:Math.round(idleMs()/1000)},config:{chain:D.config.chain,otp:D.config.otp||{}},notif:notifPublic(),issues:D.issues,me:{user:me.user,nama:me.nama,role:me.role,wa:me.wa||'',tg:!!me.telegramId},items:D.items,reqs:D.reqs,users:adm?D.users.map(({user,nama,role,wa,telegramId,ips})=>({user,nama,role,wa:wa||'',tg:!!telegramId,ips:ips||[]})):[]});
 if(p==='/api/logout'){clearSid(res);return send(res,200,{ok:1})}
 if(p==='/api/me/pw'){
  if(hash(String(b.old||''),me.salt)!==me.hash)err('Password lama salah');
  if(String(b.pw||'').length<6)err('Password minimal 6 karakter');
  me.salt=crypto.randomBytes(8).toString('hex');me.hash=hash(b.pw,me.salt);await save();return send(res,200,{ok:1});
 }
 if(p==='/api/item/import'){
  if(!stf)err('Hanya EDP/Admin');
  const rows=Array.isArray(b.rows)?b.rows:[];if(!rows.length)err('Tidak ada baris untuk diimpor');if(rows.length>2000)err('Maksimal 2000 baris per impor');
  const upd=b.mode==='update',errs=[],plan=[],seen=new Set();
  const nameMap=new Map(D.items.map(x=>[x.nama.toLowerCase(),x])),kodeMap=new Map(D.items.map(x=>[x.kode,x]));
  const num=(v,lbl,int)=>{if(v===null||v===undefined||v==='')return null;const n=+v;if(!isFinite(n)||n<0)throw new Error(lbl+' tidak valid');if(int&&!Number.isInteger(n))throw new Error(lbl+' harus bilangan bulat');return n};
  rows.forEach((r,i)=>{try{const nama=str(r.nama,80),satuan=str(r.satuan,20),kode=str(r.kode,30);if(!nama)throw new Error('Nama kosong');
   const harga=num(r.harga,'Harga'),stok=num(r.stok,'Stok awal',true);
   const key=kode?'K:'+kode:'N:'+nama.toLowerCase();if(seen.has(key))throw new Error('Duplikat di file');seen.add(key);
   let it=null;if(kode){it=kodeMap.get(kode);if(!it)throw new Error('Kode '+kode+' tidak ditemukan')}else it=nameMap.get(nama.toLowerCase())||null;
   if(it){if(kode||upd){const ot=nameMap.get(nama.toLowerCase());if(ot&&ot!==it)throw new Error('Nama sudah dipakai barang lain ('+ot.kode+')');plan.push({t:'u',it,nama,satuan:satuan||it.satuan,harga:harga??it.harga})}else plan.push({t:'s'})}
   else{if(!satuan)throw new Error('Satuan kosong');plan.push({t:'n',nama,satuan,harga:harga??0,stok:stok??0});nameMap.set(nama.toLowerCase(),{nama,kode:'(baru)'})}
  }catch(e){errs.push('Baris '+(i+1)+': '+e.message)}});
  if(errs.length)err('Impor dibatalkan, '+errs.length+' baris bermasalah: '+errs.slice(0,8).join('; '));
  writeBackup('sebelum-impor-'+tsName()+'.json'); // cadangan sebelum data diubah
  let n=Math.max(0,...D.items.map(x=>+((/^BRG-(\d+)$/.exec(x.kode)||[])[1]||0))),c=0,u=0,sk=0;D.stokLog=D.stokLog||[];
  for(const x of plan){if(x.t==='s'){sk++;continue}
   if(x.t==='u'){Object.assign(x.it,{nama:x.nama,satuan:x.satuan,harga:x.harga});u++;continue}
   n++;const it={kode:'BRG-'+String(n).padStart(3,'0'),nama:x.nama,satuan:x.satuan,harga:x.harga,stok:x.stok};D.items.push(it);c++;
   if(x.stok>0)D.stokLog.unshift({at:now(),user:me.user,nama:me.nama,jenis:'Saldo awal (impor)',kode:it.kode,barang:it.nama,qty:x.stok})}
  await save();return send(res,200,{ok:1,created:c,updated:u,skipped:sk});
 }
 if(p==='/api/item'){
  if(!stf)err('Hanya EDP/Admin');
  const nama=str(b.item?.nama,80),satuan=str(b.item?.satuan,20),harga=Math.max(0,+b.item?.harga||0),i=+b.idx;
  if(!nama)err('Nama barang wajib diisi');
  if(D.items.some((x,k)=>x.nama.toLowerCase()===nama.toLowerCase()&&k!==i))err('Nama barang sudah ada');
  if(i>=0&&D.items[i])Object.assign(D.items[i],{nama,satuan,harga}); // kode & stok tidak bisa diubah manual
  else{const n=Math.max(0,...D.items.map(x=>+((/^BRG-(\d+)$/.exec(x.kode)||[])[1]||0)))+1;
   D.items.push({kode:'BRG-'+String(n).padStart(3,'0'),nama,satuan,harga,stok:0})}
  await save();return send(res,200,{ok:1});
 }
 if(p==='/api/req'){
  if(!['EDP','Admin'].includes(me.role))err('Role Anda tidak boleh membuat permintaan');
  const lines=(Array.isArray(b.lines)?b.lines:[]).map(l=>{const it=D.items.find(x=>x.kode===l.kode);
   if(!it)err('Barang tidak ditemukan');return{kode:it.kode,nama:it.nama,satuan:it.satuan,harga:it.harga,qty:Math.max(1,Math.floor(+l.qty||1))}});
  if(!lines.length)err('Pilih minimal satu barang');
  const n=Math.max(0,...D.reqs.map(r=>+r.id.slice(4)))+1;
  D.reqs.unshift({id:'REQ-'+String(n).padStart(4,'0'),tgl:new Date().toLocaleDateString('id-ID',{timeZone:'Asia/Jakarta'}),chain:[...D.config.chain],by:me.role,byUser:me.user,byNama:me.nama,ket:str(b.ket,200)||'-',lines,step:0,rejected:false,log:[]});
  notifyNext(D.reqs[0]);
  await save();return send(res,200,{ok:1});
 }
 const isOwner=r=>r.byUser?r.byUser===me.user:r.by===me.role;
 if(p==='/api/req/edit'||p==='/api/req/cancel'){
  const r=D.reqs.find(x=>x.id===b.id);if(!r)err('Permintaan tidak ada');
  if(!(isOwner(r)||me.role==='EDP'))err('Hanya pemohon (atau EDP) yang dapat mengubah/membatalkan permintaan ini');
  if(r.rejected)err('Permintaan sudah ditolak');if(r.canceled)err('Permintaan sudah dibatalkan');
  const kill=()=>{for(const k in otps)if(k.endsWith('|'+r.id))delete otps[k]}; // OTP lama hangus
  if(p==='/api/req/cancel'){
   if(r.step>=chainOf(r).length)err('Permintaan sudah disetujui penuh, tidak bisa dibatalkan');
   const al=str(b.alasan,200);if(!al)err('Alasan pembatalan wajib diisi');
   const waiting=usersOf(chainOf(r)[r.step]);
   r.canceled={by:me.role,user:me.user,nama:me.nama,at:now(),alasan:al};kill();
   notify(waiting,`🚫 Permintaan ${r.id} DIBATALKAN oleh ${me.nama}.\nAlasan: ${al}`);await save();return send(res,200,{ok:1})}
  if(r.log.length)err('Permintaan sudah diproses penyetuju, tidak bisa diubah. Batalkan lalu buat permintaan baru.');
  const lines=(Array.isArray(b.lines)?b.lines:[]).map(l=>{const it=D.items.find(x=>x.kode===l.kode);
   if(!it)err('Barang tidak ditemukan');return{kode:it.kode,nama:it.nama,satuan:it.satuan,harga:it.harga,qty:Math.max(1,Math.floor(+l.qty||1))}});
  if(!lines.length)err('Pilih minimal satu barang');
  (r.rev=r.rev||[]).push({at:now(),user:me.user,nama:me.nama,ket:r.ket,lines:r.lines.map(l=>({nama:l.nama,satuan:l.satuan,qty:l.qty,harga:l.harga}))});
  r.ket=str(b.ket,200)||'-';r.lines=lines;r.chain=[...D.config.chain];r.step=0;kill();
  notify(usersOf(r.chain[0]),`✏️ Permintaan ${r.id} DIUBAH oleh ${me.nama} dan menunggu persetujuan Anda (${r.chain[0]}).\nKeperluan: ${r.ket}\nTotal: ${rpS(totS(r))} (${lines.length} barang)${appLink()}`);
  await save();return send(res,200,{ok:1})}
 if(p==='/api/upload-url'){
  if(req.method!=='POST')err('Metode tidak didukung');
  const hd=k=>{try{return decodeURIComponent(String(req.headers[k]||''))}catch{return ''}};
  const id=str(req.headers['x-req'],20),scope=req.headers['x-scope']==='realisasi'?'realisasi':'permintaan',ridx=Math.floor(+req.headers['x-real']);
  const jenis=['Nota','PO','Penawaran','Lainnya'].includes(hd('x-jenis'))?hd('x-jenis'):'Lainnya',ket=str(hd('x-ket'),120);
  let nama=hd('x-nama')||'file';nama=nama.replace(/[\\/:*?"<>|\x00-\x1f]/g,'_').trim().slice(-100)||'file';
  const r=D.reqs.find(x=>x.id===id);if(!r)err('Permintaan tidak ada');
  if(scope==='permintaan'){if(!(isOwner(r)||stf))err('Hanya pemohon, EDP, atau Admin yang dapat menambah lampiran permintaan')}
  else{if(!stf)err('Hanya EDP/Admin yang dapat menambah lampiran realisasi');if(!(r.real||[])[ridx])err('Data realisasi tidak ditemukan')}
  const ext=(nama.includes('.')?nama.split('.').pop():'').toLowerCase();if(!EXT[ext])err('Jenis file tidak didukung. Boleh: PDF, JPG, PNG, WEBP, GIF, XLSX, DOCX');
  if((r.lampiran||[]).filter(a=>!a.dihapus).length>=30)err('Maksimal 30 lampiran per permintaan');
  const fid=crypto.randomBytes(8).toString('hex'),path='uploads/'+fid+'.'+ext;
  const st=await issueSignedToken({pathname:path,operations:['put']});
  const {presignedUrl:uploadUrl}=await presignUrl(st,{pathname:path,operation:'put',validUntil:Date.now()+10*60*1000});
  return send(res,200,{ok:1,id:fid,path,uploadUrl});
 }
 if(p==='/api/upload-complete'){
  if(req.method!=='POST')err('Metode tidak didukung');
  const id=str(b.req,20),fid=str(b.fid,16),scope=b.scope==='realisasi'?'realisasi':'permintaan',ri=Math.floor(+b.real);
  const r=D.reqs.find(x=>x.id===id);if(!r)err('Permintaan tidak ada');
  if(scope==='permintaan'){if(!(isOwner(r)||stf))err('Tidak diizinkan')}else{if(!stf||!(r.real||[])[ri])err('Tidak diizinkan')}
  if(!/^[0-9a-f]{16}$/.test(fid))err('ID file tidak valid');
  const name=str(b.nama,100).replace(/[\\/:*?"<>|\x00-\x1f]/g,'_')||'file',ext=(name.includes('.')?name.split('.').pop():'').toLowerCase();if(!EXT[ext])err('Jenis file tidak didukung');
  let g;try{g=await get('uploads/'+fid+'.'+ext,{access:'private',useCache:false})}catch{err('File belum selesai diunggah')};if(!g)err('File belum ditemukan');
  const size=g.blob?.size||0;if(size>MAX_UP)err('File terlalu besar (maks. '+Math.round(MAX_UP/1048576)+' MB)');
  const a={id:fid,nama:name,ext,tipe:EXT[ext],ukuran:size,jenis:['Nota','PO','Penawaran','Lainnya'].includes(b.jenis)?b.jenis:'Lainnya',ket:str(b.ket,120),scope,real:scope==='realisasi'?ri:undefined,at:now(),user:me.user,oleh:me.nama};
  (r.lampiran=r.lampiran||[]).push(a);await save();return send(res,200,{ok:1,id:fid});
 }
 if(p==='/api/file'){
  const fid=new URL(req.url,'http://x').searchParams.get('id')||'',dl=(req.url||'').includes('dl=1');let a=null;
  if(/^[0-9a-f]{16}$/.test(fid))for(const r of D.reqs){a=(r.lampiran||[]).find(x=>x.id===fid&&!x.dihapus);if(a)break}
  if(!a)err('Lampiran tidak ditemukan');
  const g=await get('uploads/'+fid+'.'+a.ext,{access:'private',useCache:false});if(!g)err('File lampiran tidak ada');
  const data=Buffer.from(await new Response(g.stream).arrayBuffer()),inline=!dl&&(a.tipe==='application/pdf'||/^image\//.test(a.tipe));
  res.writeHead(200,{'Content-Type':a.tipe,'Content-Length':data.length,'Content-Disposition':(inline?'inline':'attachment')+"; filename*=UTF-8''"+encodeURIComponent(a.nama),'X-Content-Type-Options':'nosniff','Cache-Control':'private, max-age=600'});return res.end(data)}
 if(p==='/api/lampiran/hapus'){const r=D.reqs.find(x=>x.id===b.req);if(!r)err('Permintaan tidak ada');const a=(r.lampiran||[]).find(x=>x.id===b.id&&!x.dihapus);if(!a)err('Lampiran tidak ada');
  if(!(a.user===me.user||me.role==='EDP'))err('Hanya yang mengunggah atau EDP yang dapat menghapus lampiran');a.dihapus={at:now(),user:me.user,oleh:me.nama};await save();return send(res,200,{ok:1})}
 if(p==='/api/act'){
  const r=D.reqs.find(x=>x.id===b.id);if(!r)err('Permintaan tidak ada');
  const ch=chainOf(r);if(r.rejected||r.canceled||r.step>=ch.length||ch[r.step]!==me.role)err('Bukan giliran Anda untuk approve');
  if(b.rv!==undefined&&(+b.rv||0)!==(r.rev||[]).length)err('Permintaan baru saja diubah. Tutup lalu buka kembali permintaan ini untuk memeriksa isi terbarunya.');
   const cat=str(b.cat,200);
   const act=r.lines.map((l,i)=>i).filter(i=>!r.lines[i].rej); // barang yang masih aktif
   const ap=b.ok?(Array.isArray(b.approve)?[...new Set(b.approve.map(Number))].filter(i=>act.includes(i)):act):[];
   const rj=act.filter(i=>!ap.includes(i)); // yang tidak disetujui = ditolak
   if(rj.length&&!cat)err('Alasan penolakan wajib diisi');
   let otpOk=false;if(ap.length&&otpNeeded(me.role)){if(!b.otp)err('OTP_DIBUTUHKAN');otpVerify(me,r,b.otp);otpOk=true}
   rj.forEach(i=>{r.lines[i].rej={by:me.role,user:me.user,nama:me.nama,cat,at:now()}});
   r.log.push({by:me.role,user:me.user,nama:me.nama,ok:ap.length>0,cat,at:now(),ap,rj,otp:otpOk});
   if(!ap.length)r.rejected=true;else r.step++;
   onActed(r,me,ap,rj,cat);
   await save();return send(res,200,{ok:1});
 }
 if(p==='/api/real'){
  if(!stf)err('Hanya EDP/Admin yang dapat mencatat realisasi');
  const r=D.reqs.find(x=>x.id===b.id);if(!r)err('Permintaan tidak ada');
  if(r.rejected||r.canceled||r.step<chainOf(r).length)err('Permintaan belum disetujui penuh');
  r.real=r.real||[];
  const done=i=>r.real.reduce((a,e)=>a+((e.items.find(x=>x.i===i)||{}).qty||0),0);
  const mp={};for(const x of(Array.isArray(b.items)?b.items:[])){const q=Math.floor(+x.qty);if(q>0){const l=r.lines[+x.i];
   const h=x.harga===''||x.harga==null||isNaN(+x.harga)?(l?l.harga:0):Math.max(0,+x.harga);
   mp[+x.i]={qty:(mp[+x.i]?mp[+x.i].qty:0)+q,harga:h}}}
  const items=Object.entries(mp).map(([i,v])=>({i:+i,qty:v.qty,harga:v.harga}));
  if(!items.length)err('Isi jumlah yang dibeli');
  for(const x of items){const l=r.lines[x.i];if(!l)err('Barang tidak valid');if(l.rej)err('Barang ditolak, tidak dapat direalisasi: '+l.nama);if(x.qty>l.qty-done(x.i))err('Jumlah melebihi sisa untuk '+l.nama)}
  for(const x of items){const l=r.lines[x.i];
   const it=D.items.find(m=>m.kode===l.kode)||D.items.find(m=>m.nama===l.nama&&m.satuan===l.satuan);
   if(it){it.stok=(+it.stok||0)+x.qty;if(x.harga>0){it.harga=x.harga;it.hargaTgl=now();it.hargaRef=r.id}}}
  r.real.push({at:now(),user:me.user,nama:me.nama,ref:str(b.ref,60),note:str(b.note,200),items});await save();return send(res,200,{ok:1,idx:r.real.length-1});
 }
 if(p==='/api/issue'){
  if(!['EDP','Admin'].includes(me.role))err('Hanya Admin/EDP yang dapat mencatat pengeluaran');
  const tujuan=str(b.tujuan,20),penerima=str(b.penerima,60);
  if(!['Tim Gudang','Teknisi'].includes(tujuan))err('Tujuan tidak valid');
  if(!penerima)err('Nama penerima wajib diisi');
  const mp={};for(const x of(Array.isArray(b.items)?b.items:[])){const q=Math.floor(+x.qty);if(q>0)mp[x.kode]=(mp[x.kode]||0)+q}
  const items=Object.entries(mp).map(([kode,qty])=>{const it=D.items.find(m=>m.kode===kode);if(!it)err('Barang tidak ditemukan');
   if(qty>(+it.stok||0))err('Stok '+it.nama+' tidak cukup (tersedia '+(+it.stok||0)+')');return{kode,nama:it.nama,satuan:it.satuan,qty}});
  if(!items.length)err('Isi barang dan jumlah');
  items.forEach(x=>{const it=D.items.find(m=>m.kode===x.kode);it.stok=(+it.stok||0)-x.qty});
  const n=Math.max(0,...D.issues.map(r=>+r.id.slice(4)))+1;
  D.issues.unshift({id:'OUT-'+String(n).padStart(4,'0'),at:now(),tgl:new Date().toLocaleDateString('id-ID',{timeZone:'Asia/Jakarta'}),user:me.user,nama:me.nama,tujuan,penerima,ket:str(b.ket,200)||'-',items,void:false});
  await save();return send(res,200,{ok:1});
 }
 if(p==='/api/issue/void'){
  if(me.role!=='EDP')err('Hanya EDP yang dapat membatalkan pengeluaran');
  const o=D.issues.find(x=>x.id===b.id);if(!o)err('Pengeluaran tidak ada');if(o.void)err('Sudah dibatalkan');
  const al=str(b.alasan,200);if(!al)err('Alasan pembatalan wajib diisi');
  o.items.forEach(x=>{const it=D.items.find(m=>m.kode===x.kode);if(it)it.stok=(+it.stok||0)+x.qty});
  o.void=true;o.voidAlasan=al;o.voidBy=me.user;o.voidAt=now();await save();return send(res,200,{ok:1});
 }
 if(p==='/api/reset'){
  if(me.role!=='EDP')err('Hanya EDP');
  if(b.confirm!=='HAPUS')err('Konfirmasi salah');
  if(hash(String(b.pwd||''),me.salt)!==me.hash)err('Password salah');
  const name='sebelum-reset-'+tsName()+'.json';writeBackup(name); // cadangan sebelum menghapus
  if(b.reqs)D.reqs=[];
  if(b.issues)D.issues=[];
  if(b.items==='delete')D.items=[];
  else if(b.items==='zero')D.items.forEach(x=>{x.stok=0;delete x.hargaTgl;delete x.hargaRef});
  if(b.users){const gone=D.users.filter(x=>x.user!==me.user).map(x=>x.user);
   D.users=D.users.filter(x=>x.user===me.user);}
  await save();return send(res,200,{ok:1,backup:'backup/'+name});
 }
 if(p==='/api/otp/request'){
  const r=D.reqs.find(x=>x.id===b.id);if(!r)err('Permintaan tidak ada');
  const ch=chainOf(r);if(r.rejected||r.canceled||r.step>=ch.length||ch[r.step]!==me.role)err('Bukan giliran Anda untuk approve');
  if(!otpNeeded(me.role))err('Level Anda tidak memakai OTP');
  return send(res,200,await otpRequest(me,r))}
 if(p==='/api/seclog'){if(!adm)err('Hanya EDP');return send(res,200,{log:secLog.slice(0,30)})}
 if(p==='/api/user/ip/add'){if(!adm)err('Hanya EDP');const us=D.users.find(x=>x.user===str(b.user,30).toLowerCase());if(!us)err('Pengguna tidak ada');
  const t=ipTok(b.ip);if(!t)err('Alamat IP tidak valid');us.ips=us.ips||[];if(!us.ips.includes(t))us.ips.push(t);await save();return send(res,200,{ok:1})}
 if(p==='/api/sesi'){if(!adm)err('Hanya EDP');const m=Math.floor(+b.menit);if(!(m>=0&&m<=1440))err('Batas waktu tidak valid (0-1440 menit; 0 = tidak dibatasi)');D.config.sesiMenit=m;await save();return send(res,200,{ok:1})}
 if(p==='/api/app'){if(!adm)err('Hanya EDP');D.config.app={org:str(b.org,80),dev:str(b.dev,80)};await save();return send(res,200,{ok:1})}
 if(p==='/api/me/notif'){me.wa=cleanWa(b.wa);await save();return send(res,200,{ok:1})}
 if(p==='/api/tg/webhook'){
  if(req.method!=='POST')return send(res,405,{err:'Metode tidak didukung'});
  const m=b.message,t=m&&String(m.text||'').trim();
  if(m&&t){const mm=/^\/start\s+([A-Za-z0-9]{4,12})/.exec(t)||/^([A-Za-z0-9]{6})$/.exec(t),k=mm&&mm[1].toUpperCase(),c=k&&tgCodes[k];
   if(c&&c.exp>Date.now()){const us=D.users.find(x=>x.user===c.user);if(us){us.telegramId=String(m.chat.id);delete tgCodes[k];await save();try{await tgSend(m.chat.id,`✅ Terhubung sebagai ${us.nama} (${us.role}). Pemberitahuan permintaan akan dikirim ke sini.`)}catch{}return send(res,200,{ok:1})}}
   try{await tgSend(m.chat.id,'Kirim kode dari aplikasi (tombol 🔔 Notifikasi > Hubungkan Telegram) untuk menghubungkan akun Anda.')}catch{}
  }
  return send(res,200,{ok:1});
 }
 if(p==='/api/tg/code'){const c=cfgN();if(!c.telegram.token)err('Telegram belum diaktifkan oleh EDP');
  for(const k in tgCodes)if(tgCodes[k].exp<Date.now())delete tgCodes[k];
  const code=crypto.randomBytes(4).toString('hex').slice(0,6).toUpperCase();tgCodes[code]={user:me.user,exp:Date.now()+600000};
  return send(res,200,{code,bot:c.telegram.botName,link:c.telegram.botName?`https://t.me/${c.telegram.botName}?start=${code}`:''})}
 if(p==='/api/tg/unlink'){delete me.telegramId;await save();return send(res,200,{ok:1})}
 if(p==='/api/notif/test'){const c=cfgN(),out=[],text='🔔 Tes notifikasi aplikasi Permintaan Barang untuk '+me.nama+'. Jika pesan ini terbaca, notifikasi berfungsi.';
  if(c.telegram.token){if(!me.telegramId)out.push('Telegram: akun belum terhubung');else try{await tgSend(me.telegramId,text);out.push('Telegram: terkirim');nlog(me.nama,'Telegram (tes)',true,'terkirim')}catch(e){out.push('Telegram: GAGAL - '+e.message);nlog(me.nama,'Telegram (tes)',false,e.message)}}
  if(c.wa.url){if(!me.wa)out.push('WhatsApp: nomor belum diisi');else try{await waSend(me.wa,text);out.push('WhatsApp: terkirim');nlog(me.nama,'WhatsApp (tes)',true,'terkirim')}catch(e){out.push('WhatsApp: GAGAL - '+e.message);nlog(me.nama,'WhatsApp (tes)',false,e.message)}}
  if(!out.length)out.push('Belum ada kanal notifikasi yang diaktifkan EDP.');return send(res,200,{out})}
 if(p==='/api/notif'){if(!adm)err('Hanya EDP');const c=cfgN();
  return send(res,200,{on:c.on,appUrl:c.appUrl,defaultUrl:guessUrl(),events:c.events,telegram:{tokenSet:!!c.telegram.token,tokenTail:c.telegram.token.slice(-4),botName:c.telegram.botName},
   wa:{url:c.wa.url,headerName:c.wa.headerName,headerSet:!!c.wa.headerValue,format:c.wa.format,fieldNomor:c.wa.fieldNomor,fieldPesan:c.wa.fieldPesan,extra:c.wa.extra,countryCode:c.wa.countryCode},log:notifLog.slice(0,30)})}
 if(p==='/api/notif/save'){if(!adm)err('Hanya EDP');const c=cfgN();
  c.on=!!b.on;c.appUrl=str(b.appUrl,150);c.events={requester:!!(b.events||{}).requester,staffOnApproved:!!(b.events||{}).staffOnApproved};
  const tg=b.telegram||{};
  if(tg.clear)c.telegram={token:'',botName:''};
  else if(tg.token&&tg.token!==c.telegram.token){const tk=str(tg.token,100);let j={};
   try{j=JSON.parse((await httpReq(TGAPI+'/bot'+tk+'/getMe')).text)}catch(e){err('Tidak bisa menghubungi Telegram: '+e.message)}
   if(!j.ok)err('Token Telegram tidak valid'+(j.description?': '+j.description:''));c.telegram={token:tk,botName:(j.result&&j.result.username)||''}}
  const w=b.wa||{};if(w.url&&!/^https?:\/\//i.test(w.url))err('URL gateway harus diawali http:// atau https://');
  c.wa={url:str(w.url,200),headerName:str(w.headerName,40)||'Authorization',headerValue:w.headerValue?str(w.headerValue,200):c.wa.headerValue,format:w.format==='json'?'json':'form',fieldNomor:str(w.fieldNomor,30)||'target',fieldPesan:str(w.fieldPesan,30)||'message',extra:str(w.extra,200),countryCode:str(w.countryCode,4).replace(/\D/g,'')||'62'};
  await save();return send(res,200,{ok:1,bot:c.telegram.botName})}
 if(p==='/api/config'){
  if(!adm)err('Hanya EDP');
  const want=CHAIN.filter(c=>(Array.isArray(b.chain)?b.chain:[]).includes(c));
  if(!want.length)err('Minimal satu level approval harus aktif');
  for(const c of want)if(!D.users.some(u=>u.role===c))err('Belum ada akun dengan role '+c+'. Buat akunnya dulu di menu Pengguna.');
  const otp={},nc=cfgN(),has=u=>(u.telegramId&&nc.telegram.token)||(u.wa&&nc.wa.url);
  for(const c of CHAIN){otp[c]=!!(b.otp||{})[c];
   if(otp[c]&&want.includes(c)){
    if(!nc.telegram.token&&!nc.wa.url)err('Aktifkan dulu Telegram/WhatsApp di Pengaturan > Notifikasi sebelum memakai OTP.');
    if(!usersOf(c).some(has))err('Belum ada pengguna '+c+' yang menghubungkan Telegram/WhatsApp, jadi OTP tidak bisa dikirim.')}}
  const warn=[];for(const c of want)if(otp[c])usersOf(c).filter(u=>!has(u)).forEach(u=>warn.push(u.nama+' ('+c+')'));
  D.config.chain=want;D.config.otp=otp;await save();return send(res,200,{ok:1,warn});
 }
 if(p==='/api/backups'){
  if(!adm)err('Hanya EDP');
  const rows=[];try{const all=await list({prefix:'backup/'});for(const x of all.blobs){const name=x.pathname.split('/').pop();if(name.endsWith('.json'))rows.push({name,size:x.size,mtime:new Date(x.uploadedAt).getTime()})}}catch{}
  rows.sort((a,b)=>b.mtime-a.mtime);
  return send(res,200,{files:rows.slice(0,60),extra:'Vercel Blob (private)',keep:KEEP_DAYS,dir:'backup',uploads:{n:0,size:0}});
 }
 if(p==='/api/backup/now'){if(!adm)err('Hanya EDP');await writeBackup('manual-'+tsName()+'.json');return send(res,200,{ok:1})}
 if(p==='/api/backup/get'){
  if(!adm)err('Hanya EDP');const name=new URL(req.url,'http://x').searchParams.get('name')||'';
  if(!/^[\w.-]+\.json$/.test(name))err('Nama file tidak valid');
  const g=await get('backup/'+name,{access:'private',useCache:false});if(!g)err('File tidak ada');
  const data=Buffer.from(await new Response(g.stream).arrayBuffer());res.writeHead(200,{'Content-Type':'application/json','Content-Length':data.length,'Content-Disposition':'attachment; filename="'+name+'"'});return res.end(data);
 }
 if(p==='/api/backup/restore'){
  if(!adm)err('Hanya EDP');if(b.confirm!=='PULIHKAN')err('Konfirmasi salah');
  if(hash(String(b.pwd||''),me.salt)!==me.hash)err('Password salah');
  const name=str(b.name,120);if(!/^[\w.-]+\.json$/.test(name))err('Nama file tidak valid');
  let nd;try{const g=await get('backup/'+name,{access:'private',useCache:false});if(!g)err('File backup tidak ada');nd=JSON.parse(await new Response(g.stream).text())}catch(e){if(e.message)err(e.message);err('File backup rusak / bukan JSON')}
  if(!nd||!Array.isArray(nd.users)||!nd.users.length||!Array.isArray(nd.items)||!Array.isArray(nd.reqs))err('Isi file backup tidak valid');
  await writeBackup('sebelum-pulih-'+tsName()+'.json');D=nd;normalize();await save();return send(res,200,{ok:1});
 }
 if(p.startsWith('/api/user')){
  if(!adm)err('Hanya EDP');
  const u=str(b.user,30).toLowerCase();
  if(p==='/api/user'){
   if(!/^[a-z0-9._-]{3,}$/.test(u))err('Username min. 3 karakter (huruf kecil/angka)');
   if(D.users.some(x=>x.user===u))err('Username sudah dipakai');
   if(!ROLES.includes(b.role))err('Role tidak valid');
   if(!str(b.nama)||String(b.pw||'').length<6)err('Nama wajib dan password minimal 6 karakter');
   D.users.push(mk(u,str(b.nama),b.role,String(b.pw)));await save();return send(res,200,{ok:1});
  }
  const us=D.users.find(x=>x.user===u);if(!us)err('User tidak ada');
  if(p==='/api/user/edit'){const n=str(b.nama,60);if(!n)err('Nama wajib diisi');
   const nu=str(b.newUser,30).toLowerCase()||us.user;
   if(nu!==us.user){
    if(!/^[a-z0-9._-]{3,}$/.test(nu))err('Username min. 3 karakter (huruf kecil/angka)');
    if(D.users.some(x=>x.user===nu))err('Username sudah dipakai');
    const old=us.user;us.user=nu;
    D.reqs.forEach(r=>{if(r.byUser===old)r.byUser=nu;r.log.forEach(g=>{if(g.user===old)g.user=nu});(r.real||[]).forEach(e=>{if(e.user===old)e.user=nu})});
    D.issues.forEach(o=>{if(o.user===old)o.user=nu});
   }
   us.nama=n;if(b.wa!==undefined)us.wa=cleanWa(b.wa);
   if(b.ips!==undefined){const l=parseIps(b.ips);
    if(us.user===me.user&&l.length&&!isLoop(ip)&&!l.some(t=>ipMatch(t,ip)))err('Daftar IP tidak memuat IP Anda saat ini ('+ip+'); Anda akan terkunci. Tambahkan IP tersebut dulu.');
    us.ips=l}await save();return send(res,200,{ok:1})}
  if(p==='/api/user/pw'){
   if(String(b.pw||'').length<6)err('Password minimal 6 karakter');
   us.salt=crypto.randomBytes(8).toString('hex');us.hash=hash(String(b.pw),us.salt);
   await save();return send(res,200,{ok:1});
  }
  if(p==='/api/user/del'){
   if(u===me.user)err('Tidak bisa menghapus akun sendiri');
   if(us.role==='EDP'&&D.users.filter(x=>x.role==='EDP').length<=1)err('Tidak bisa menghapus akun EDP terakhir');
   if(D.config.chain.includes(us.role)&&D.users.filter(x=>x.role===us.role).length<=1)err('Tidak bisa menghapus pengguna terakhir untuk level approval aktif ('+us.role+'). Nonaktifkan levelnya dulu di Alur Approval.');
   D.users=D.users.filter(x=>x!==us);await save();return send(res,200,{ok:1});
  }
 }
 send(res,404,{err:'Tidak ditemukan'});
}


module.exports=async function handler(req,res){
 const u=new URL(req.url,'http://x');
 // Vercel rewrite /api/:path* -> /api/index.js?path=:path*
 // Ambil kembali path API asli agar /api/login, /api/state, dst. tetap dikenali.
 let p=u.pathname;
 if(p==='/api/index.js'){
  const original=u.searchParams.get('path');
  p=original ? ('/api/'+original.replace(/^\/+/,'')) : '/api/index.js';
 }
 try{
  await loadData();
  if(!p.startsWith('/api/'))return send(res,404,{err:'Tidak ditemukan'});
  await api(req,res,p);
 }catch(e){console.error(e);if(!res.headersSent)send(res,e.message==='Terlalu banyak percobaan, coba lagi 5 menit'?429:400,{err:e.message||'Kesalahan server'})}
};

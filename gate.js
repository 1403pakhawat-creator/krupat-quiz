/* ประตูรหัสเข้าเว็บ
   โหมดเซิร์ฟเวอร์ (มี URL): ตรวจรหัสกับ Google Sheet — รหัสส่วนตัวใช้ได้ไม่เกิน N เครื่อง (ค่าเริ่มต้น 2), รหัสสำรองไม่จำกัดเครื่องและไม่เก็บสถิติ
   โหมดสำรอง (ไม่มี URL): ตรวจแฮชในไฟล์นี้ (ไม่จำกัดเครื่อง)
   จำเครื่อง 30 วัน และตรวจซ้ำเบื้องหลังทุกครั้งที่เปิด (ถ้ารหัสถูกปิด/เครื่องเกิน จะเด้งกลับหน้ากรอกรหัส) */
(function () {
  var URL = 'https://script.google.com/macros/s/AKfycbw_yFLXphu5ZPb6etyasx_vFBdmidqgque_nGFNe98xeO4m09-6CaDbBepDH2BPYAlCLg/exec', SALT = 'krupat-2569|', HASHES = [], DAYS = 30, KEY = 'krupat_gate_v2', DKEY = 'krupat_dev_v1';
  window.KQ_GUEST = false;
  function dev() { try { var d = localStorage.getItem(DKEY); if (!d) { d = 'd' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem(DKEY, d); } return d; } catch (e) { return 'tmp' + Math.random().toString(36).slice(2); } }
  function saved() { try { var v = JSON.parse(localStorage.getItem(KEY)); if (v && v.t && Date.now() - v.t < DAYS * 864e5) return v; } catch (e) {} return null; }
  function sha(s) { return crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)).then(function (d) { return Array.prototype.map.call(new Uint8Array(d), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }); }
  function oldpid() { try { var p = localStorage.getItem('krupat_pid') || ''; return /^p[a-z0-9]{6,40}$/.test(p) ? p : ''; } catch (e) { return ''; } }
  function needAdopt() { try { return !/^c[0-9a-f]{20}$/.test(localStorage.getItem('krupat_pid') || ''); } catch (e) { return false; } }
  function adopt(r) {   // รหัสส่วนตัว: ใช้รหัสผู้เล่นที่เซิร์ฟเวอร์สร้างจากรหัสสมาชิก (คะแนน/ชื่อตามตัวไปทุกเครื่อง) ส่วนรหัสสำรองไม่แตะ
    try {
      if (!r || !r.ok || r.guest || !/^c[0-9a-f]{20}$/.test(r.pid || '')) return;
      localStorage.setItem('krupat_pid', r.pid);
      if (r.nick && !localStorage.getItem('krupat_name')) localStorage.setItem('krupat_name', String(r.nick).slice(0, 20));
    } catch (e) {}
  }
  function check(code) {   // -> Promise<{ok,guest,reason,max,pid,nick}>
    if (URL) return fetch(URL + '?action=login&code=' + encodeURIComponent(code) + '&device=' + encodeURIComponent(dev()) + (oldpid() ? '&oldpid=' + encodeURIComponent(oldpid()) : '') + (needAdopt() ? '&adopt=1' : '')).then(function (r) { return r.json(); });
    return sha(SALT + code).then(function (h) { for (var i = 0; i < HASHES.length; i++) if (HASHES[i].h === h) return { ok: true, guest: !!HASHES[i].g }; return { ok: false, reason: 'invalid' }; });
  }
  var s = saved();
  if (s) {
    window.KQ_GUEST = !!s.g; banner();
    check(s.c).then(function (r) { adopt(r); if (r && r.ok === false && /invalid|revoked|limit/.test(r.reason || '')) { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); } }).catch(function () {});
    return;
  }
  document.documentElement.style.overflow = 'hidden';
  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;z-index:99999;background:linear-gradient(135deg,#0b1f4b,#2b1b5a);display:flex;align-items:center;justify-content:center;padding:20px;font-family:Sarabun,system-ui,sans-serif';
  ov.innerHTML = '<div style="background:#15110a;border:2px solid #ffd740;border-radius:18px;max-width:380px;width:100%;padding:26px 22px;text-align:center;color:#fff6d6;box-shadow:0 10px 40px rgba(0,0,0,.5)">' +
    '<div style="font-size:42px">🔐</div><h2 style="margin:6px 0 4px;color:#ffd740;font-size:1.4rem">คลังข้อสอบ ครูพัด</h2>' +
    '<p style="margin:0 0 14px;color:#d9c27a;font-size:.95rem">กรอกรหัสที่ได้รับทางอีเมลเพื่อเข้าใช้งาน</p>' +
    '<input id="kqcode" autocomplete="off" autocapitalize="characters" placeholder="เช่น KP-AB12-CD34" style="width:100%;box-sizing:border-box;font:inherit;font-size:1.15rem;text-align:center;letter-spacing:1px;padding:12px;border-radius:12px;border:2px solid #7a5a08;background:#fff;color:#111;text-transform:uppercase">' +
    '<button id="kqgo" style="margin-top:12px;width:100%;font:inherit;font-weight:700;font-size:1.1rem;padding:12px;border:0;border-radius:12px;background:#e91e78;color:#fff;cursor:pointer">เข้าสู่ระบบ</button>' +
    '<p id="kqmsg" style="min-height:1.4em;margin:10px 0 0;color:#ff8a7a;font-size:.9rem"></p>' +
    '<p style="margin:6px 0 0;color:#a89350;font-size:.8rem">ลืมรหัส? ติดต่อทีมงานครูพัดเพื่อขอรหัสใหม่</p></div>';
  var mounted = false;
  function mount() {
    if (mounted || !document.body) return; mounted = true; document.body.appendChild(ov);
    var inp = ov.querySelector('#kqcode'), msg = ov.querySelector('#kqmsg'), btn = ov.querySelector('#kqgo');
    function go() {
      var c = inp.value.trim().toUpperCase().replace(/\s+/g, '');
      if (!c) { msg.textContent = 'กรอกรหัสก่อนนะคะ'; return; }
      btn.disabled = true; msg.textContent = 'กำลังตรวจสอบ...';
      check(c).then(function (r) {
        btn.disabled = false;
        if (!r || !r.ok) {
          var why = r && r.reason;
          msg.textContent = why === 'limit' ? 'รหัสนี้ถูกใช้ครบ ' + (r.max || 2) + ' เครื่องแล้ว ติดต่อทีมงานเพื่อรีเซ็ตเครื่อง' : why === 'revoked' ? 'รหัสนี้ถูกปิดการใช้งานแล้ว ติดต่อทีมงาน' : 'รหัสไม่ถูกต้อง ลองใหม่อีกครั้ง';
          return;
        }
        try { localStorage.setItem(KEY, JSON.stringify({ c: c, g: r.guest ? 1 : 0, t: Date.now() })); } catch (e) {}
        adopt(r); window.KQ_GUEST = !!r.guest; ov.remove(); document.documentElement.style.overflow = ''; banner();
        window.dispatchEvent(new Event('kq-unlocked'));
      }).catch(function () { btn.disabled = false; msg.textContent = 'เชื่อมต่อไม่ได้ กรุณาตรวจอินเทอร์เน็ตแล้วลองใหม่'; });
    }
    btn.onclick = go; inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); e.stopPropagation(); });
    setTimeout(function () { inp.focus(); }, 50);
  }
  document.addEventListener('DOMContentLoaded', mount); mount();
  function banner() {
    if (!window.KQ_GUEST) return;
    var b = document.createElement('div');
    b.textContent = '⚠️ โหมดรหัสสำรอง: ไม่บันทึกสถิติ สมุดข้อผิด และอันดับ';
    b.style.cssText = 'position:sticky;top:0;z-index:9999;background:#ffd740;color:#3a2a00;text-align:center;font:600 .9rem Sarabun,system-ui,sans-serif;padding:6px';
    function add() { if (document.body) document.body.insertBefore(b, document.body.firstChild); }
    if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
  }
})();

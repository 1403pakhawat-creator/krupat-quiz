/* ประตูรหัสเข้าเว็บ
   โหมดเซิร์ฟเวอร์ (มี URL): ตรวจรหัสกับ Google Sheet — รหัสส่วนตัวใช้ได้ไม่เกิน N เครื่อง (ค่าเริ่มต้น 2), รหัสสำรองไม่จำกัดเครื่องและไม่เก็บสถิติ
   โหมดสำรอง (ไม่มี URL): ตรวจแฮชในไฟล์นี้ (ไม่จำกัดเครื่อง)
   จำเครื่อง 30 วัน และตรวจซ้ำเบื้องหลังทุกครั้งที่เปิด (ถ้ารหัสถูกปิด/เครื่องเกิน จะเด้งกลับหน้ากรอกรหัส) */
(function () {
  var URL = 'https://script.google.com/macros/s/AKfycbz_QT--kzwZcbV31BQYO49iVYCs6553_G1uF26B0IcObWyzZrKYD-Y3A-OXXocb5JpGuQ/exec', SALT = 'krupat-2569|', HASHES = [], DAYS = 30, KEY = 'krupat_gate_v2', DKEY = 'krupat_dev_v1';
  window.KQ_GUEST = false; window.KQ_SETS = null;   // KQ_SETS = รายชื่อชุดที่รหัสนี้เปิดให้ (null = เปิดทุกชุด)
  var FB = 'https://m.me/61558005914260', MSG = 'ทำข้อสอบชุดอื่น 290 สมัครได้ที่ เพจครูพัด ติวสอบครูพละ';
  function dev() { try { var d = localStorage.getItem(DKEY); if (!d) { d = 'd' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem(DKEY, d); } return d; } catch (e) { return 'tmp' + Math.random().toString(36).slice(2); } }
  function saved() { try { var v = JSON.parse(localStorage.getItem(KEY)); if (v && v.t && Date.now() - v.t < DAYS * 864e5) return v; } catch (e) {} return null; }
  function sha(s) { return crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)).then(function (d) { return Array.prototype.map.call(new Uint8Array(d), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }); }
  function check(code) {   // -> Promise<{ok,guest,reason,max}>
    if (URL) return fetch(URL + '?action=login&code=' + encodeURIComponent(code) + '&device=' + encodeURIComponent(dev())).then(function (r) { return r.json(); });
    return sha(SALT + code).then(function (h) { for (var i = 0; i < HASHES.length; i++) if (HASHES[i].h === h) return { ok: true, guest: !!HASHES[i].g }; return { ok: false, reason: 'invalid' }; });
  }
  var s = saved();
  if (s) {
    window.KQ_GUEST = !!s.g; window.KQ_SETS = s.s && s.s.length ? s.s : null; banner(); limits();
    check(s.c).then(function (r) {
      if (r && r.ok === false && /invalid|revoked|limit/.test(r.reason || '')) { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); }
      else if (r && r.ok && JSON.stringify(r.sets || null) !== JSON.stringify(s.s || null)) { try { localStorage.setItem(KEY, JSON.stringify({ c: s.c, g: s.g, s: r.sets || null, t: s.t })); } catch (e) {} location.reload(); }   // ชุดที่เปิดให้เปลี่ยน -> โหลดใหม่
    }).catch(function () {});
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
        try { localStorage.setItem(KEY, JSON.stringify({ c: c, g: r.guest ? 1 : 0, s: r.sets && r.sets.length ? r.sets : null, t: Date.now() })); } catch (e) {}
        window.KQ_GUEST = !!r.guest; window.KQ_SETS = r.sets && r.sets.length ? r.sets : null; ov.remove(); document.documentElement.style.overflow = ''; banner(); limits();
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
    b.textContent = window.KQ_SETS ? '🎁 รหัสทดลอง: ทำได้ ' + window.KQ_SETS.length + ' ชุด (ไม่บันทึกสถิติและอันดับ) • ' + MSG : '⚠️ โหมดรหัสสำรอง: ไม่บันทึกสถิติ สมุดข้อผิด และอันดับ';
    b.style.cssText = 'position:sticky;top:0;z-index:9999;background:#ffd740;color:#3a2a00;text-align:center;font:600 .9rem Sarabun,system-ui,sans-serif;padding:6px';
    function add() { if (document.body) document.body.insertBefore(b, document.body.firstChild); }
    if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
  }
  /* รหัสทดลอง: เปิดได้เฉพาะชุดใน KQ_SETS ที่เหลือล็อก 🔒 พร้อมปุ่มทักอินบ็อกเพจ */
  function limits() {
    var S = window.KQ_SETS; if (!S) return;
    var page = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '') || 'index';
    function ok(id) { return id === 'review' || S.indexOf(id) >= 0; }
    function panel(closable, home) {
      var o = document.createElement('div');
      o.style.cssText = 'position:fixed;inset:0;z-index:99998;background:rgba(11,31,75,.92);display:flex;align-items:center;justify-content:center;padding:20px;font-family:Sarabun,system-ui,sans-serif';
      o.innerHTML = '<div style="background:#15110a;border:2px solid #ffd740;border-radius:18px;max-width:380px;width:100%;padding:26px 22px;text-align:center;color:#fff6d6;box-shadow:0 10px 40px rgba(0,0,0,.5)">' +
        '<div style="font-size:42px">🔒</div><h2 style="margin:6px 0 8px;color:#ffd740;font-size:1.3rem">ชุดนี้ล็อกอยู่</h2>' +
        '<p style="margin:0 0 16px;color:#fff6d6;font-size:1.05rem;line-height:1.5">' + MSG + '</p>' +
        '<a href="' + FB + '" target="_blank" rel="noopener" style="display:block;font:inherit;font-weight:700;font-size:1.1rem;padding:12px;border-radius:12px;background:#e91e78;color:#fff;text-decoration:none">💬 ทักข้อความเพจครูพัด (Inbox)</a>' +
        (closable ? '<button id="kqx" style="margin-top:10px;width:100%;font:inherit;padding:10px;border:2px solid #7a5a08;border-radius:12px;background:transparent;color:#d9c27a;cursor:pointer">ปิด</button>' : '') +
        (home ? '<a href="./" style="display:block;margin-top:10px;padding:10px;border:2px solid #7a5a08;border-radius:12px;color:#d9c27a;text-decoration:none">← กลับหน้ารวมชุดข้อสอบ</a>' : '') + '</div>';
      document.body.appendChild(o);
      var x = o.querySelector('#kqx'); if (x) x.onclick = function () { o.remove(); };
      return o;
    }
    function run() {
      if (page !== 'index') { if (!ok(page)) { document.documentElement.style.overflow = 'hidden'; panel(false, true); } return; }
      var st = document.createElement('style');
      st.textContent = 'a.set.kq-locked{opacity:.55;filter:grayscale(.8)}a.set.kq-locked .go{color:#7a5a08}';
      document.head.appendChild(st);
      Array.prototype.forEach.call(document.querySelectorAll('a.set[data-id]'), function (a) {
        if (ok(a.getAttribute('data-id'))) return;
        a.classList.add('kq-locked');
        var g = a.querySelector('.go'); if (g) g.textContent = '🔒 ล็อก • สมัครเพื่อทำชุดนี้';
        a.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); panel(true, false); }, true);
      });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  }
})();

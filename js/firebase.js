import { renderActivities, renderCrops } from './crops.js';
import { renderCustomers } from './customers.js';
import { renderDashboard } from './dashboard.js';
import { renderInv } from './inventory.js';
import { renderProjects } from './projects.js';
import { renderSales } from './salesLink.js';
import { _fbReady, _nextBatchId, _nextCalId, _nextProjId, _nextReqId, _nextSaleId, _nextSeasonId, _nextSoilRestId, _nextTemplateId, _saveTimer, actItems, calEvents, cropItems, custItems, db, farmSettings, goalItems, inputBatches, invItems, nextActId, nextCropId, nextCustId, nextInvId, planTemplates, plotSeasons, projectItems, reqItems, salesData, setDb, setFbReady, setNextTemplateId, setPlanTemplates, setSaveTimer, soilRests } from './state.js';

// ============================================================
// วิธีดู config: Firebase Console → Project Settings → Your apps → SDK setup
const firebaseConfig = {
  apiKey: "AIzaSyDfoWFPZqH12ijZLPDdU46-MRR9ZMQT3UE",
  authDomain: "farmtonglampang.firebaseapp.com",
  projectId: "farmtonglampang",
  storageBucket: "farmtonglampang.firebasestorage.app",
  messagingSenderId: "289516522531",
  appId: "1:289516522531:web:8569340dfa6b42c16df596",
};

// ============================================================
// ===== SYNC SYSTEM — Firebase + localStorage fallback =====
// ============================================================
const LS_KEY    = 'farmData_v01';
const FARM_ID   = 'farm_main';

// ── Init Firebase ──
export function initFirebase() {
  if (!FIREBASE_CONFIG.apiKey) {
    console.warn('⚠️ ยังไม่ได้ใส่ Firebase Config — ใช้ localStorage แทน');
    _showSyncStatus('local');
    return false;
  }
  try {
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    setDb(firebase.firestore());
    setFbReady(true);
    _showSyncStatus('cloud');
    console.log('🔥 Firebase พร้อมแล้ว');
    return true;
  } catch(e) {
    console.warn('Firebase init error:', e);
    _showSyncStatus('local');
    return false;
  }
}

// ── Sync status badge ──
export function _showSyncStatus(mode) {
  let el = document.getElementById('sync-badge');
  if (!el) {
    el = document.createElement('div');
    el.id = 'sync-badge';
    el.style.cssText = 'position:fixed;bottom:72px;right:12px;font-size:11px;padding:4px 10px;border-radius:20px;z-index:999;font-weight:600;box-shadow:0 1px 4px rgba(0,0,0,.15);transition:all .3s';
    document.body.appendChild(el);
  }
  if (mode === 'cloud')  { el.style.background='#e8f5e9'; el.style.color='#2e7d32'; el.textContent='☁️ Cloud Sync'; }
  if (mode === 'local')  { el.style.background='#fff8e1'; el.style.color='#b07a10'; el.textContent='💾 Local Only'; }
  if (mode === 'saving') { el.style.background='#e3f2fd'; el.style.color='#1565c0'; el.textContent='🔄 กำลังบันทึก...'; }
  if (mode === 'saved')  { el.style.background='#e8f5e9'; el.style.color='#2e7d32'; el.textContent='✅ บันทึกแล้ว';
    setTimeout(() => _showSyncStatus(_fbReady ? 'cloud' : 'local'), 2000); }
  if (mode === 'error')  { el.style.background='#fce4ec'; el.style.color='#c62828'; el.textContent='⚠️ บันทึกไม่ได้'; }
}

// ── Pack all data ──
export function _packData() {
  return {
    farmSettings,
    cropItems, nextCropId,
    actItems,  nextActId,
    invItems,  nextInvId,
    custItems, nextCustId,
    salesData, _nextSaleId,
    goalItems,
    calEventsArr: calEvents,
    _nextCalId,
    reqItems,  _nextReqId,
    projectItems, _nextProjId,
    planTemplates, _nextTemplateId,
    plotSeasons,   _nextSeasonId,
    soilRests,     _nextSoilRestId,
    inputBatches,  _nextBatchId,
    savedAt: new Date().toISOString()
  };
}

// ── Apply loaded data ──
export function _applyData(data) {
  if (!data) return;
  if (data.farmSettings) { Object.assign(farmSettings, data.farmSettings); }
  if (data.cropItems)    { cropItems   = data.cropItems;    nextCropId  = data.nextCropId  || nextCropId;  }
  if (data.actItems)     { actItems    = data.actItems;     nextActId   = data.nextActId   || nextActId;   }
  if (data.invItems)     { invItems    = data.invItems;     nextInvId   = data.nextInvId   || nextInvId;   }
  if (data.custItems)    { custItems   = data.custItems;    nextCustId  = data.nextCustId  || nextCustId;  }
  if (data.salesData)    { salesData   = data.salesData;    _nextSaleId = data._nextSaleId || _nextSaleId; }
  if (data.goalItems)    { goalItems   = data.goalItems; }
  if (data.calEventsArr) { calEvents   = data.calEventsArr; _nextCalId  = data._nextCalId  || _nextCalId;  }
  if (data.reqItems)      { reqItems     = data.reqItems;     _nextReqId   = data._nextReqId   || _nextReqId;  }
  if (data.projectItems)  { projectItems = data.projectItems; _nextProjId  = data._nextProjId  || _nextProjId; }
  if (data.plotSeasons)   { plotSeasons   = data.plotSeasons;  _nextSeasonId= data._nextSeasonId|| _nextSeasonId; }
  if (data.soilRests)     { soilRests     = data.soilRests;    _nextSoilRestId=data._nextSoilRestId||_nextSoilRestId; }
  if (data.inputBatches)  { inputBatches  = data.inputBatches; _nextBatchId = data._nextBatchId || _nextBatchId; }
  if (data.planTemplates) { // merge: keep built-in, add user-created
    const userTpls = data.planTemplates.filter(t => t.id >= 10);
    setPlanTemplates([...planTemplates.filter(t=>t.id<10), ...userTpls]);
    setNextTemplateId(data._nextTemplateId || _nextTemplateId);
  }
}

// ── Save (debounced 1.5s) ──
export function saveData() {
  // บันทึก localStorage ทันที (offline backup)
  try { localStorage.setItem(LS_KEY, JSON.stringify(_packData())); } catch(e) {}
  // บันทึก Firebase หลังหยุดพิมพ์ 1.5 วิ
  clearTimeout(_saveTimer);
  _showSyncStatus('saving');
  setSaveTimer(setTimeout(async () => {
    if (!_fbReady) { _showSyncStatus('local'); return; }
    try {
      await db.collection('farms').doc(FARM_ID).set(_packData());
      _showSyncStatus('saved');
    } catch(e) {
      console.warn('Firebase save failed:', e);
      _showSyncStatus('error');
    }
  }, 1500));
}

// ── Load ──
export async function loadData() {
  // ลอง Firebase ก่อน
  if (_fbReady) {
    try {
      const doc = await db.collection('farms').doc(FARM_ID).get();
      if (doc.exists) {
        _applyData(doc.data());
        console.log('☁️ โหลดจาก Firebase สำเร็จ');
        // Real-time listener — sync เมื่ออุปกรณ์อื่นแก้ไข
        db.collection('farms').doc(FARM_ID).onSnapshot(snap => {
          if (snap.exists && !_saveTimer) {
            _applyData(snap.data());
            // Re-render หน้าที่กำลังแสดงอยู่
            const activePage = document.querySelector('.page.active');
            if (activePage) {
              const pid = activePage.id.replace('page-','');
              if (pid==='dashboard')  { renderDashboard(); setTimeout(buildReportCharts,100); }
              if (pid==='crops')      renderCrops();
              if (pid==='activities') renderActivities();
              if (pid==='inventory')  renderInv();
              if (pid==='sales')      renderSales();
              if (pid==='customers')  renderCustomers();
              if (pid==='projects')   renderProjects();
            }
          }
        });
        return;
      }
    } catch(e) { console.warn('Firebase load failed, using localStorage:', e); }
  }
  // Fallback: localStorage
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) { _applyData(JSON.parse(raw)); console.log('💾 โหลดจาก localStorage'); }
  } catch(e) {}
}

// ── Auto-save wrappers ──
// Called from main.js AFTER window bridge is set up
export function setupAutoSave() {
  const fns = ['renderCrops','renderActivities','renderInv',
               'renderCustomers','renderSales','renderCalendar'];
  fns.forEach(name => {
    const orig = window[name];
    if (orig) window[name] = (...a) => { orig(...a); saveData(); };
  });
}

// ── ล้างข้อมูลทั้งหมด ──
export async function clearAllData() {
  if (!confirm('⚠️ ล้างข้อมูลทั้งหมด?\n\nข้อมูลทุกอย่างจะถูกลบถาวร')) return;
  localStorage.removeItem(LS_KEY);
  if (_fbReady) {
    try { await db.collection('farms').doc(FARM_ID).delete(); } catch(e) {}
  }
  location.reload();
}

// ============================================================
// ===== REPORTS & ANALYTICS =====

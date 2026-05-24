import { renderInv } from './inventory.js';
import { renderNotifications } from './notifications.js';
import { _pgState, _renderActivitiesPage, _renderCropsPage } from './pagination.js';
import { askConfirmDel } from './shared.js';
import { actFilteredItems, actItems, actRendered, cropItems, editingActId, editingCropId, farmSettings, invItems, nextActId, nextCropId, nextInvId, setActFilteredItems, setActRendered, setEditingActId, setEditingCropId } from './state.js';
import { closeModal, showToast } from './ui.js';
import { dateStr, fmtDate } from './utils.js';

// ============================================================
export const cropStatusMap = {
  'เพาะกล้า':     { cls:'badge-earth', color:'#a07850' },
  'ย้ายกล้า':     { cls:'badge-sky',   color:'#3b8fd4' },
  'เติบโต':       { cls:'badge-sky',   color:'#3b8fd4' },
  'กำลังโต':      { cls:'badge-amber', color:'#e8a820' },
  'พร้อมเก็บ':    { cls:'badge-green', color:'#5cb85c' },
  'เก็บเกี่ยวแล้ว':{ cls:'badge-gray', color:'#9a9890' },
};

  { id:1,  name:'ผักคะน้าใบใหญ่',     cropType:'พืชผัก',      plot:'A1–A3', planted:'2026-03-01', harvest:'1 พ.ค. 69',   harvestDate:'2026-05-01', area:2.0, status:'พร้อมเก็บ',   yieldEst:480, yieldActual:'', harvestLog:[] },
  { id:2,  name:'มะเขือเทศราชินี',     cropType:'พืชสวนครัว',  plot:'B1–B2', planted:'2026-02-15', harvest:'20 พ.ค. 69',  harvestDate:'2026-05-20', area:1.5, status:'กำลังโต',     yieldEst:360, yieldActual:'', harvestLog:[] },
  { id:3,  name:'ข้าวโพดหวาน',         cropType:'พืชไร่',       plot:'C1–C4', planted:'2026-03-15', harvest:'15 มิ.ย. 69', harvestDate:'2026-06-15', area:3.0, status:'เติบโต',      yieldEst:900, yieldActual:'', harvestLog:[] },
  { id:4,  name:'พริกแดงใหญ่',         cropType:'พืชสวนครัว',  plot:'D1',    planted:'2026-01-20', harvest:'10 เม.ย. 69', harvestDate:'2026-04-10', area:0.5, status:'เก็บเกี่ยวแล้ว', yieldEst:130, yieldActual:118, harvestLog:[{date:'2026-04-08',weight:68,note:'รอบแรก'},{date:'2026-04-11',weight:50,note:'รอบสอง'}] },
  { id:5,  name:'กระเทียมโทน',         cropType:'พืชสวนครัว',  plot:'D2–D3', planted:'2026-01-15', harvest:'30 มิ.ย. 69', harvestDate:'2026-06-30', area:1.0, status:'กำลังโต',     yieldEst:280, yieldActual:'', harvestLog:[] },
  { id:6,  name:'ผักบุ้งจีน',           cropType:'พืชผัก',      plot:'E1',    planted:'2026-04-10', harvest:'10 พ.ค. 69',  harvestDate:'2026-05-10', area:0.5, status:'พร้อมเก็บ',   yieldEst:160, yieldActual:'', harvestLog:[] },
  { id:7,  name:'ฟักทองไทย',            cropType:'ไม้ผล',       plot:'F1–F2', planted:'2026-03-01', harvest:'25 มิ.ย. 69', harvestDate:'2026-06-25', area:2.0, status:'เติบโต',      yieldEst:600, yieldActual:'', harvestLog:[] },
  { id:8,  name:'ตะไคร้หอม',            cropType:'สมุนไพร',     plot:'G1',    planted:'2025-10-01', harvest:'ต่อเนื่อง',   harvestDate:'',           area:0.5, status:'พร้อมเก็บ',   yieldEst:200, yieldActual:340, harvestLog:[{date:'2026-02-15',weight:90,note:'ตัดรอบที่ 3'},{date:'2026-03-20',weight:110,note:'รอบ 4'},{date:'2026-04-22',weight:140,note:'รอบ 5'}] },
  { id:9,  name:'ผักชีไทย',             cropType:'พืชผัก',      plot:'A4',    planted:'2026-04-05', harvest:'20 พ.ค. 69',  harvestDate:'2026-05-20', area:0.3, status:'เติบโต',      yieldEst:45,  yieldActual:'', harvestLog:[] },
  { id:10, name:'ขิงอ่อน',              cropType:'สมุนไพร',     plot:'G2',    planted:'2026-02-01', harvest:'1 ส.ค. 69',   harvestDate:'2026-08-01', area:0.8, status:'กำลังโต',     yieldEst:240, yieldActual:'', harvestLog:[] },
  { id:11, name:'ใบมะกรูด',             cropType:'สมุนไพร',     plot:'H1',    planted:'2024-06-01', harvest:'ต่อเนื่อง',   harvestDate:'',           area:0.3, status:'พร้อมเก็บ',   yieldEst:30,  yieldActual:85,  harvestLog:[{date:'2026-01-10',weight:25,note:''},{date:'2026-03-05',weight:30,note:''},{date:'2026-05-01',weight:30,note:'ใบงาม'}] },
  { id:12, name:'มะนาวแป้น',            cropType:'ไม้ผล',       plot:'H2–H3', planted:'2024-01-01', harvest:'ต่อเนื่อง',   harvestDate:'',           area:1.0, status:'พร้อมเก็บ',   yieldEst:400, yieldActual:520, harvestLog:[{date:'2026-02-20',weight:180,note:'ผลดก'},{date:'2026-04-15',weight:200,note:''},{date:'2026-05-05',weight:140,note:''}] },
  { id:13, name:'ผักกาดขาวปลี',         cropType:'พืชผัก',      plot:'A5–A6', planted:'2026-03-20', harvest:'20 พ.ค. 69',  harvestDate:'2026-05-20', area:1.2, status:'กำลังโต',     yieldEst:320, yieldActual:'', harvestLog:[] },
  { id:14, name:'หอมแดงพม่า',           cropType:'พืชสวนครัว',  plot:'D4',    planted:'2026-01-25', harvest:'30 เม.ย. 69', harvestDate:'2026-04-30', area:0.8, status:'เก็บเกี่ยวแล้ว', yieldEst:200, yieldActual:186, harvestLog:[{date:'2026-04-28',weight:186,note:'งามดีมาก'}] },
  { id:15, name:'กระชายเหลือง',         cropType:'สมุนไพร',     plot:'G3',    planted:'2026-01-15', harvest:'15 ก.ค. 69',  harvestDate:'2026-07-15', area:0.6, status:'กำลังโต',     yieldEst:180, yieldActual:'', harvestLog:[] },
  { id:16, name:'ผักเคล (Kale)',        cropType:'พืชผัก',      plot:'B3',    planted:'2026-03-10', harvest:'12 พ.ค. 69',  harvestDate:'2026-05-12', area:0.8, status:'พร้อมเก็บ',   yieldEst:150, yieldActual:'', harvestLog:[] },
  { id:17, name:'พริกหวานหลากสี',       cropType:'พืชสวนครัว',  plot:'D5',    planted:'2026-03-01', harvest:'10 มิ.ย. 69', harvestDate:'2026-06-10', area:0.5, status:'เติบโต',      yieldEst:120, yieldActual:'', harvestLog:[] },
  { id:18, name:'ดาวเรืองส้ม',          cropType:'ไม้ดอก',      plot:'I1',    planted:'2026-03-25', harvest:'25 พ.ค. 69',  harvestDate:'2026-05-25', area:0.4, status:'เติบโต',      yieldEst:80,  yieldActual:'', harvestLog:[] },
  { id:19, name:'ไพล',                  cropType:'สมุนไพร',     plot:'G4',    planted:'2025-08-01', harvest:'ต่อเนื่อง',   harvestDate:'',           area:0.4, status:'กำลังโต',     yieldEst:120, yieldActual:60,  harvestLog:[{date:'2026-03-01',weight:60,note:'เก็บรอบแรก'}] },
  { id:20, name:'มะระจีน',              cropType:'พืชสวนครัว',  plot:'E2',    planted:'2026-03-20', harvest:'5 มิ.ย. 69',  harvestDate:'2026-06-05', area:0.6, status:'เติบโต',      yieldEst:170, yieldActual:'', harvestLog:[] },
];


export function renderCrops() {
  _pgState.crops.page = 1;
  _renderCropsPage(_pgState.crops.page, _pgState.crops.query);
}

export function openCropModal(id) {
  setEditingCropId(id || null);
  document.getElementById('crop-modal-title').textContent = id ? 'แก้ไขพืชผล' : 'เพิ่มพืชผลใหม่';
  document.getElementById('crop-save-btn').textContent    = id ? 'บันทึกการแก้ไข' : 'เพิ่มพืชผล';
  const logBtn = document.getElementById('crop-harvest-log-btn');
  if (id) {
    const item = cropItems.find(i => i.id === id);
    document.getElementById('crop-name').value         = item.name;
    document.getElementById('crop-type').value         = item.cropType || 'พืชผัก';
    document.getElementById('crop-plot').value         = item.plot;
    document.getElementById('crop-planted').value      = item.planted;
    document.getElementById('crop-area').value         = item.area;
    document.getElementById('crop-status').value       = item.status;
    document.getElementById('crop-yield-est').value    = item.yieldEst;
    document.getElementById('crop-yield-actual').value = '';
    if (item.harvest === 'ต่อเนื่อง') {
      document.getElementById('crop-harvest-cont').checked = true;
      document.getElementById('crop-harvest').value = '';
      document.getElementById('crop-harvest').disabled = true;
    } else {
      document.getElementById('crop-harvest-cont').checked = false;
      document.getElementById('crop-harvest').disabled = false;
      document.getElementById('crop-harvest').value = item.harvestDate || '';
    }
    if (logBtn) logBtn.style.display = 'inline-flex';
  } else {
    ['crop-name','crop-plot','crop-yield-est','crop-yield-actual'].forEach(x => document.getElementById(x).value = '');
    document.getElementById('crop-type').value         = 'พืชผัก';
    document.getElementById('crop-planted').value      = dateStr;
    document.getElementById('crop-harvest').value      = '';
    document.getElementById('crop-harvest').disabled   = false;
    document.getElementById('crop-harvest-cont').checked = false;
    document.getElementById('crop-area').value         = '';
    document.getElementById('crop-status').value       = 'เติบโต';
    if (logBtn) logBtn.style.display = 'none';
  }
  document.getElementById('modal-crop').classList.add('open');
}

export function editCropItem(id) { openCropModal(id); }

export function saveCropItem() {
  const name        = document.getElementById('crop-name').value.trim();
  const cropType    = document.getElementById('crop-type').value;
  const plot        = document.getElementById('crop-plot').value.trim();
  const planted     = document.getElementById('crop-planted').value;
  const isCont      = document.getElementById('crop-harvest-cont').checked;
  const harvestDateRaw = document.getElementById('crop-harvest').value || '';
  // ── วันเก็บเกี่ยว: ถ้าไม่ใส่ → ใช้วันปัจจุบัน (ยกเว้น "ต่อเนื่อง") ──
  const harvestDate = isCont ? '' : (harvestDateRaw || dateStr);
  const harvest     = isCont ? 'ต่อเนื่อง'
                    : new Date(harvestDate).toLocaleDateString('th-TH',{day:'numeric',month:'short',year:'2-digit'});
  const area        = parseFloat(document.getElementById('crop-area').value) || 0;
  const yieldEst    = parseInt(document.getElementById('crop-yield-est').value) || 0;
  const yieldActualInput = document.getElementById('crop-yield-actual').value;
  const yieldActualNew   = yieldActualInput !== '' ? parseFloat(yieldActualInput) : null;
  // ── ถ้าใส่น้ำหนักผลผลิต → บังคับสถานะเป็น เก็บเกี่ยวแล้ว อัตโนมัติ ──
  if (yieldActualNew !== null && yieldActualNew > 0) {
    document.getElementById('crop-status').value = 'เก็บเกี่ยวแล้ว';
  }
  const status = document.getElementById('crop-status').value;
  if (!name) { showToast('⚠️ กรุณากรอกชื่อพืชผล'); return; }

  let prevStatus = null;
  if (editingCropId) {
    const item = cropItems.find(i => i.id === editingCropId);
    prevStatus = item.status;
    if (yieldActualNew !== null && yieldActualNew > 0) {
      if (!item.harvestLog) item.harvestLog = [];
      item.harvestLog.push({ date: harvestDate, weight: yieldActualNew, note: '' });
    }
    const totalActual = (item.harvestLog || []).reduce((s,e)=>s+e.weight,0);
    Object.assign(item, { name, cropType, plot, planted, harvest, harvestDate, area, status, yieldEst,
      yieldActual: totalActual > 0 ? totalActual : item.yieldActual });
    showToast('✅ แก้ไขข้อมูลพืชผลสำเร็จ' + (yieldActualNew ? ` (เพิ่มผลผลิต ${yieldActualNew} กก.)` : ''));
  } else {
    const harvestLog = yieldActualNew !== null && yieldActualNew > 0
      ? [{ date: harvestDate, weight: yieldActualNew, note: '' }] : [];
    cropItems.push({ id: nextCropId++, name, cropType, plot, planted, harvest, harvestDate, area, status,
      yieldEst, yieldActual: yieldActualNew || '', harvestLog });
    showToast('✅ เพิ่มพืชผลสำเร็จ');
  }

  // ── auto-link activity: ใช้ harvestDate เป็นวันที่ของ activity เก็บเกี่ยว ──
  const autoActMap = {
    'เพาะกล้า':      { type: 'เพาะกล้า',        date: planted || dateStr,  note: `เพาะกล้า ${name}` },
    'ย้ายกล้า':      { type: 'ปลูก / ย้ายกล้า',  date: planted || dateStr,  note: `ย้ายกล้า ${name} ลงแปลง ${plot || '—'}` },
    'เก็บเกี่ยวแล้ว':{ type: 'เก็บเกี่ยว',        date: harvestDate || dateStr, note: `เก็บเกี่ยว ${name}${yieldActualNew ? ' ได้ ' + yieldActualNew + ' กก.' : ''}` },
  };
  if (autoActMap[status] && (prevStatus === null || prevStatus !== status)) {
    const actDef = autoActMap[status];
    actItems.unshift({
      id:       nextActId++,
      date:     actDef.date,
      type:     actDef.type,
      plot:     plot || '—',
      person:   '—',
      material: '—',
      note:     actDef.note,
      fromCrop: true
    });
    setActRendered(false);
  }

  // ── auto-add to inventory: ใช้ harvestDate เป็น วันเข้าคลัง ──
  if (status === 'เก็บเกี่ยวแล้ว' && prevStatus !== 'เก็บเกี่ยวแล้ว') {
    const qty    = yieldActualNew ? Number(yieldActualNew) : 0;
    const lotNum = invItems.filter(i => i.cat === 'ผลผลิต' && i.name === name).length + 1;
    invItems.push({
      id: nextInvId++, name, cat: 'ผลผลิต', qty, unit: 'กก.',
      price: 0, threshold: 0, shelfLife: farmSettings.shelfLife || 7,
      harvestDate: harvestDate,   // ← วันเก็บเกี่ยวที่ใส่ หรือวันปัจจุบัน
      lot: 'Crop ' + lotNum,
      lastOrder: harvestDate
    });
    showToast('🌾 เพิ่มผลผลิตเข้าคลัง: ' + name + (qty > 0 ? ' ' + qty + ' กก.' : '') + ' · วันที่ ' + harvest);
    renderInv();
  }

  closeModal('modal-crop');
  renderCrops();
  renderNotifications();
}
// ============================================================
  { id:1,  date:'2026-05-07', type:'รดน้ำ',              plot:'A1–A3',   person:'สมชาย',       material:'น้ำ 300 ลิตร',        note:'รดช่วงเช้า ก่อน 7 โมง' },
  { id:2,  date:'2026-05-07', type:'ตรวจโรคพืช',         plot:'B1–B2',   person:'มาลี',         material:'—',                    note:'พบเพลี้ยขาวเล็กน้อย บันทึกไว้ติดตาม' },
  { id:3,  date:'2026-05-06', type:'ใส่ปุ๋ยหมัก',        plot:'C1–C4',   person:'สมชาย',       material:'ปุ๋ยหมัก 80 กก.',       note:'ใส่รอบเดือน ก่อนฝนมา' },
  { id:4,  date:'2026-05-06', type:'พ่นน้ำส้มควันไม้',   plot:'B1–B2',   person:'มาลี',         material:'น้ำส้มควันไม้ 2 ลิตร', note:'ป้องกันเพลี้ยขาวที่ตรวจพบ' },
  { id:5,  date:'2026-05-05', type:'เก็บเกี่ยว',         plot:'H2–H3',   person:'มาลี, สมใจ',  material:'—',                    note:'มะนาวแป้น 140 กก. ส่งร้านอาหาร', fromCrop:true },
  { id:6,  date:'2026-05-05', type:'รดน้ำ',              plot:'ทุกแปลง', person:'สมใจ',         material:'น้ำ 800 ลิตร',         note:'ระบบสปริงเกลอร์' },
  { id:7,  date:'2026-05-04', type:'ตัดแต่งกิ่ง',        plot:'H1',      person:'สมชาย',       material:'กรรไกร, ถุงมือ',       note:'ตัดใบเก่ามะกรูดออก เพื่อกระตุ้นใบอ่อน' },
  { id:8,  date:'2026-05-03', type:'ตรวจวัดค่า pH ดิน',  plot:'A1–A3',   person:'มาลี',         material:'ชุดทดสอบ pH',           note:'ค่า pH 6.2 อยู่ในเกณฑ์ดี' },
  { id:9,  date:'2026-05-02', type:'พรวนดิน / ไถดิน',    plot:'A5–A6',   person:'สมชาย',       material:'จอบ, พรวนดิน',         note:'เตรียมดินก่อนหยอดเมล็ดรุ่นต่อไป' },
  { id:10, date:'2026-05-01', type:'เก็บเกี่ยว',         plot:'H1',      person:'มาลี',         material:'—',                    note:'ใบมะกรูด 30 กก. ส่งโรงแรม', fromCrop:true },
  { id:11, date:'2026-04-30', type:'เก็บเกี่ยว',         plot:'D4',      person:'สมชาย, สมใจ', material:'—',                    note:'หอมแดงพม่า 186 กก. เข้าคลัง', fromCrop:true },
  { id:12, date:'2026-04-28', type:'ใส่ปุ๋ยน้ำหมักชีวภาพ',plot:'D2–D3', person:'มาลี',         material:'น้ำหมักฯ 20 ลิตร',    note:'หมักจากเศษผัก 30 วัน' },
  { id:13, date:'2026-04-27', type:'ซ่อมระบบน้ำหยด',     plot:'B1–B2',   person:'สมชาย',       material:'ท่อน้ำหยด, ข้อต่อ',   note:'ท่อรั่ว 3 จุด ซ่อมเรียบร้อย' },
  { id:14, date:'2026-04-25', type:'กำจัดวัชพืช',        plot:'C1–C4',   person:'สมใจ, มาลี',  material:'—',                    note:'ถอนหญ้ารอบโคนข้าวโพด' },
  { id:15, date:'2026-04-24', type:'ติดตั้งตาข่ายกันแมลง',plot:'B3',    person:'สมชาย',       material:'ตาข่ายไนลอน 20 ม.',   note:'ป้องกันหนอนใยผักในแปลงเคล' },
  { id:16, date:'2026-04-22', type:'เก็บเกี่ยว',         plot:'G1',      person:'มาลี, สมใจ',  material:'—',                    note:'ตะไคร้ 140 กก. รอบที่ 5', fromCrop:true },
  { id:17, date:'2026-04-20', type:'หว่านเมล็ด',         plot:'E1',      person:'สมชาย',       material:'เมล็ดผักบุ้ง 200 กรัม',note:'หยอดระยะห่าง 15 ซม.' },
  { id:18, date:'2026-04-18', type:'ตรวจโรคพืช',         plot:'C1–C4',   person:'มาลี',         material:'—',                    note:'ไม่พบโรค ข้าวโพดเติบโตดี' },
  { id:19, date:'2026-04-15', type:'เก็บเกี่ยว',         plot:'H2–H3',   person:'มาลี, สมใจ',  material:'—',                    note:'มะนาว 200 กก.', fromCrop:true },
  { id:20, date:'2026-04-13', type:'ใส่ปุ๋ยหมัก',        plot:'F1–F2',   person:'สมชาย',       material:'ปุ๋ยหมัก 60 กก.',       note:'ฟักทองเติบโตดี ใส่เสริม' },
  { id:21, date:'2026-04-11', type:'เก็บเกี่ยว',         plot:'D1',      person:'สมชาย, มาลี', material:'—',                    note:'พริกแดงรอบที่ 2 ได้ 50 กก.', fromCrop:true },
  { id:22, date:'2026-04-10', type:'ค้ำยัน / มัดต้น',    plot:'B1–B2',   person:'สมใจ',         material:'ไม้ค้ำ 30 ชิ้น',       note:'มะเขือเทศเริ่มออกผล ต้องค้ำยัน' },
  { id:23, date:'2026-04-08', type:'เก็บเกี่ยว',         plot:'D1',      person:'สมชาย',       material:'—',                    note:'พริกแดงรอบแรก 68 กก.', fromCrop:true },
  { id:24, date:'2026-04-05', type:'ปลูกต้นกล้า',        plot:'B3',      person:'มาลี',         material:'ต้นกล้าเคล 80 ต้น',   note:'ย้ายกล้าจากเรือนเพาะชำ' },
  { id:25, date:'2026-04-03', type:'ใส่ปุ๋ยน้ำหมักชีวภาพ',plot:'A1–A3', person:'สมชาย',       material:'น้ำหมักฯ 15 ลิตร',    note:'ผักคะน้าใส่ปุ๋ยก่อนเก็บ 1 เดือน' },
  { id:26, date:'2026-04-01', type:'ตรวจวัดค่า pH ดิน',  plot:'D2–D3',   person:'มาลี',         material:'ชุดทดสอบ pH',           note:'pH 5.8 ต่ำเล็กน้อย ปรับด้วยปูนขาว' },
  { id:27, date:'2026-03-28', type:'ฉีดพ่นน้ำ',          plot:'G1',      person:'สมใจ',         material:'น้ำ 100 ลิตร',         note:'ตะไคร้ต้องการความชื้น' },
  { id:28, date:'2026-03-25', type:'กำจัดวัชพืช',        plot:'D4',      person:'มาลี',         material:'—',                    note:'ถอนหญ้ารอบหอมแดงทั้งแปลง' },
  { id:29, date:'2026-03-20', type:'เก็บเกี่ยว',         plot:'G1',      person:'มาลี, สมใจ',  material:'—',                    note:'ตะไคร้รอบที่ 4 ได้ 110 กก.', fromCrop:true },
  { id:30, date:'2026-03-15', type:'ซ่อมโครงสร้างโรงเรือน',plot:'เรือนเพาะชำ',person:'สมชาย','material':'ไม้ กระเบื้อง',     note:'หลังคารั่วจากพายุ ซ่อมเสร็จแล้ว' },
  { id:31, date:'2026-03-10', type:'หว่านเมล็ด',         plot:'A4',      person:'มาลี',         material:'เมล็ดผักชี 50 กรัม',  note:'หว่านหนาแน่น เก็บเป็นรุ่น' },
  { id:32, date:'2026-03-05', type:'เก็บเกี่ยว',         plot:'H1',      person:'มาลี',         material:'—',                    note:'ใบมะกรูด 30 กก.', fromCrop:true },
  { id:33, date:'2026-03-01', type:'ปลูกต้นกล้า',        plot:'D5',      person:'สมชาย',       material:'ต้นกล้าพริกหวาน 60 ต้น',note:'พริกหวานหลากสีเพื่อโรงแรม' },
  { id:34, date:'2026-02-28', type:'บันทึกข้อมูลแปลง',   plot:'ทุกแปลง', person:'มาลี',         material:'—',                    note:'อัปเดตแผนผังแปลงประจำเดือน' },
  { id:35, date:'2026-02-20', type:'เก็บเกี่ยว',         plot:'H2–H3',   person:'สมชาย, สมใจ', material:'—',                    note:'มะนาวแป้น 180 กก. ผลดก', fromCrop:true },
  { id:36, date:'2026-02-15', type:'เก็บเกี่ยว',         plot:'G1',      person:'มาลี',         material:'—',                    note:'ตะไคร้รอบที่ 3 ได้ 90 กก.', fromCrop:true },
];

export function handleActTypeChange() {
  const v = document.getElementById('act-type-select').value;
  document.getElementById('act-type-other-wrap').style.display = v === 'other' ? 'block' : 'none';
}
export function handleActPlotChange() {
  const v = document.getElementById('act-plot-select').value;
  document.getElementById('act-plot-other-wrap').style.display = v === 'other' ? '' : 'none';
}

export function renderActivities(items) {
  if (items) {
    // called from filter — render directly without pagination
    const tbody = document.getElementById('activity-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    items.forEach(item => {
      const fromCropBadge = item.fromCrop
        ? `<span class="badge badge-green" style="font-size:10px;margin-left:4px;">🌱 จากพืชผล</span>` : '';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${fmtDate(item.date)}</td>
        <td>${item.type}${fromCropBadge}</td>
        <td>${item.plot}</td>
        <td>${item.person}</td>
        <td>${item.material || '—'}</td>
        <td>${item.note || '—'}</td>
        <td>
          <div class="inv-actions">
            <button class="btn-icon edit" onclick="editActItem(${item.id})">✏️</button>
            <button class="btn-icon del"  onclick="askConfirmDel('act',${item.id},'กิจกรรม ${item.type}')">🗑</button>
          </div>
        </td>`;
      tbody.appendChild(tr);
    });
    document.getElementById('pg-activities').innerHTML = '';
    return;
  }
  _pgState.activities.page = 1;
  _renderActivitiesPage(_pgState.activities.page, _pgState.activities.query);
}

export function filterActivities() {
  const from = document.getElementById('act-filter-from').value;
  const to   = document.getElementById('act-filter-to').value;
  if (!from && !to) { renderActivities(); return; }
  const filtered = actItems.filter(i => {
    if (from && i.date < from) return false;
    if (to   && i.date > to)   return false;
    return true;
  });
  setActFilteredItems(filtered);
  renderActivities(filtered);
}
export function clearActFilter() {
  document.getElementById('act-filter-from').value = '';
  document.getElementById('act-filter-to').value   = '';
  setActFilteredItems(null);
  renderActivities();
}

export function openActivityModal(id) {
  setEditingActId(id || null);
  document.getElementById('act-modal-title').textContent = id ? 'แก้ไขกิจกรรม' : 'บันทึกกิจกรรมใหม่';
  document.getElementById('act-save-btn').textContent    = id ? 'บันทึกการแก้ไข' : 'บันทึกกิจกรรม';
  document.getElementById('act-type-other-wrap').style.display  = 'none';
  document.getElementById('act-plot-other-wrap').style.display  = 'none';
  document.getElementById('act-person-other-wrap').style.display = 'none';
  if (id) {
    const item = actItems.find(i => i.id === id);
    document.getElementById('act-date').value     = item.date;
    document.getElementById('act-material').value = item.material === '—' ? '' : item.material;
    document.getElementById('act-note').value     = item.note    === '—' ? '' : item.note;
    // person dropdown
    const personSel = document.getElementById('act-person-select');
    const personOpts = Array.from(personSel.options).map(o=>o.value);
    if (personOpts.includes(item.person)) {
      personSel.value = item.person;
    } else {
      personSel.value = 'other';
      document.getElementById('act-person-other-wrap').style.display = '';
      document.getElementById('act-person').value = item.person;
    }
    const typeOpts = Array.from(document.getElementById('act-type-select').options).map(o => o.value);
    if (typeOpts.includes(item.type)) {
      document.getElementById('act-type-select').value = item.type;
    } else {
      document.getElementById('act-type-select').value = 'other';
      document.getElementById('act-type-other-wrap').style.display = 'block';
      document.getElementById('act-type-other').value  = item.type;
    }
    const plotOpts = Array.from(document.getElementById('act-plot-select').options).map(o => o.value);
    if (plotOpts.includes(item.plot)) {
      document.getElementById('act-plot-select').value = item.plot;
    } else {
      document.getElementById('act-plot-select').value = 'other';
      document.getElementById('act-plot-other-wrap').style.display = '';
      document.getElementById('act-plot-other').value  = item.plot;
    }
  } else {
    document.getElementById('act-date').value     = dateStr;
    document.getElementById('act-type-select').value = 'รดน้ำ';
    document.getElementById('act-plot-select').value = 'ทุกแปลง';
    document.getElementById('act-person-select').value = '';
    document.getElementById('act-person').value   = '';
    document.getElementById('act-material').value = '';
    document.getElementById('act-note').value     = '';
    document.getElementById('act-type-other').value = '';
    document.getElementById('act-plot-other').value = '';
  }
  document.getElementById('modal-activity').classList.add('open');
}

export function editActItem(id) { openActivityModal(id); }

export function saveActivityItem() {
  const date   = document.getElementById('act-date').value;
  const tSel   = document.getElementById('act-type-select').value;
  const type   = tSel === 'other' ? document.getElementById('act-type-other').value.trim() : tSel;
  const pSel   = document.getElementById('act-plot-select').value;
  const plot   = pSel === 'other' ? document.getElementById('act-plot-other').value.trim() : pSel;
  // person: from dropdown or typed
  const perSel = document.getElementById('act-person-select').value;
  const person = perSel === 'other' || perSel === ''
    ? document.getElementById('act-person').value.trim()
    : perSel;
  const material = document.getElementById('act-material').value.trim() || '—';
  const note     = document.getElementById('act-note').value.trim() || '—';
  if (!type) { showToast('⚠️ กรุณาระบุประเภทกิจกรรม'); return; }
  if (editingActId) {
    const item = actItems.find(i => i.id === editingActId);
    Object.assign(item, { date, type, plot, person, material, note });
    showToast('✅ แก้ไขกิจกรรมสำเร็จ');
  } else {
    actItems.unshift({ id: nextActId++, date, type, plot, person, material, note });
    showToast('✅ บันทึกกิจกรรมสำเร็จ');
  }
  closeModal('modal-activity');
  renderActivities();
}

// ===== EXPORT PDF =====
export function exportActPDF() {
  const from = document.getElementById('act-filter-from').value;
  const to   = document.getElementById('act-filter-to').value;
  const list = actFilteredItems || actItems;
  let rows = list.map(i =>
    `<tr><td>${fmtDate(i.date)}</td><td>${i.type}</td><td>${i.plot}</td><td>${i.person}</td><td>${i.material}</td><td>${i.note}</td></tr>`
  ).join('');
  const range = from || to ? `<p style="font-size:12px;color:#666">ช่วงวันที่: ${from ? fmtDate(from) : '—'} ถึง ${to ? fmtDate(to) : '—'}</p>` : '';
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>body{font-family:sans-serif;padding:24px;font-size:13px}h2{color:#1a4d1a;margin-bottom:4px}
  table{width:100%;border-collapse:collapse;margin-top:12px}
  th{background:#1a4d1a;color:#fff;padding:8px;text-align:left;font-size:12px}
  td{padding:7px 8px;border-bottom:1px solid #ddd}tr:nth-child(even)td{background:#f5faf5}</style>
  </head><body><h2>บันทึกกิจกรรมฟาร์มอินทรีย์</h2>${range}
  <table><thead><tr><th>วันที่</th><th>กิจกรรม</th><th>แปลง</th><th>ผู้ดำเนินการ</th><th>วัสดุที่ใช้</th><th>หมายเหตุ</th></tr></thead>
  <tbody>${rows}</tbody></table></body></html>`;
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); }, 400);
}

// ===== EXPORT EXCEL (CSV) =====
export function exportActExcel() {
  const list = actFilteredItems || actItems;
  const BOM = '\uFEFF';
  const header = 'วันที่,ประเภทกิจกรรม,แปลง,ผู้ดำเนินการ,วัสดุที่ใช้,หมายเหตุ\n';
  const rows = list.map(i =>
    [fmtDate(i.date), i.type, i.plot, i.person, i.material, i.note]
      .map(v => `"${String(v).replace(/"/g,'""')}"`)
      .join(',')
  ).join('\n');
  const blob = new Blob([BOM + header + rows], { type:'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'farm_activities.csv'; a.click();
  URL.revokeObjectURL(url);
  showToast('📊 ดาวน์โหลด Excel สำเร็จ');
}

// ============================================================
// ===== 3. CUSTOMERS =====

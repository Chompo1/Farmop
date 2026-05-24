import { fmtDate } from './crops.js';
import { saveData } from './firebase.js';
import { invStatus, renderInv } from './inventory.js';
import { _nextReqId, farmSettings, inputBatches, invItems, planTemplates, plotSeasons, reqItems, setReqItems, soilRests } from './state.js';
import { closeModal, showToast } from './ui.js';
import { dateStr, fmtDate } from './utils.js';

// ============================================================
// planTemplates — สูตรการปลูก/ดูแล (reusable)
  { id:1, name:'ผักคะน้า', category:'พืชผัก', daysToHarvest:45, isContinuous:false, icon:'🥬',
    notes:'เหมาะฤดูหนาว-ต้นร้อน หลีกเลี่ยงฤดูฝนจัด',
    stages:[
      { id:'s1', name:'เตรียมดิน + ใส่ปุ๋ยหมัก', day:0,  type:'เตรียมดิน',                  icon:'⛏️', materials:['ปุ๋ยหมัก','ถ่านไบโอชาร์'], notes:'พรวนดินลึก 20 ซม. ใส่ปุ๋ยหมัก 2 กก./ตร.ม.' },
      { id:'s2', name:'หว่านเมล็ด / ย้ายกล้า',  day:3,  type:'ปลูกต้นกล้า',                 icon:'🌱', materials:['เมล็ดพันธุ์'], notes:'ระยะปลูก 20×20 ซม.' },
      { id:'s3', name:'ใช้ไตรโคเดอม่า รอบแรก',   day:7,  type:'ใช้ไตรโคเดอม่า',              icon:'🍄', materials:['ไตรโคเดอม่า'], notes:'50 ก./น้ำ 20 ลิตร ราดโคนต้น ป้องกันรากเน่า' },
      { id:'s4', name:'รดน้ำหมัก + รดน้ำ',       day:14, type:'รดน้ำหมักชีวภาพ',             icon:'🧴', materials:['น้ำหมักชีวภาพ'], notes:'เจือจาง 1:500 รดทั้งแปลง' },
      { id:'s5', name:'พ่นบิวเวอเรีย+เมธาไรเซียม',day:21, type:'พ่นบิวเวอเรีย+เมธาไรเซียม', icon:'🦠', materials:['บิวเวอเรีย','เมธาไรเซียม'], notes:'พ่นช่วงเย็น ป้องกันหนอน-แมลง' },
      { id:'s6', name:'ใส่ปุ๋ยหมัก รอบสอง',      day:28, type:'ใส่ปุ๋ยหมัก',                  icon:'♻️', materials:['ปุ๋ยหมัก'], notes:'โรยรอบโคนต้น 0.5 กก./ต้น' },
      { id:'s7', name:'ใช้ไตรโคเดอม่า รอบสอง',   day:35, type:'ใช้ไตรโคเดอม่า',              icon:'🍄', materials:['ไตรโคเดอม่า'], notes:'ป้องกันโรคใบ' },
      { id:'s8', name:'ตรวจความพร้อมก่อนเก็บ',   day:42, type:'ตรวจโรคพืช',                  icon:'🩺', materials:[], notes:'ดูขนาดใบ สีใบ ความพร้อมเก็บ' },
      { id:'s9', name:'เก็บเกี่ยว',               day:45, type:'เก็บเกี่ยว',                  icon:'🌾', materials:[], notes:'เก็บตอนเช้า ก่อน 8 โมง' },
    ]},
  { id:2, name:'มะเขือเทศ', category:'พืชสวนครัว', daysToHarvest:90, isContinuous:false, icon:'🍅',
    notes:'ต้องการแสงแดดเต็มวัน อากาศเย็น 15-25°C',
    stages:[
      { id:'s1', name:'เตรียมดิน + ปรับ pH',      day:0,  type:'เตรียมดิน',                  icon:'⛏️', materials:['ปุ๋ยหมัก','ปูนขาว'], notes:'pH 6.0-6.8 ใส่ปูนขาวถ้าดินเป็นกรด' },
      { id:'s2', name:'ย้ายกล้า',                  day:7,  type:'ปลูกต้นกล้า',                 icon:'🌱', materials:[], notes:'ระยะ 50×60 ซม.' },
      { id:'s3', name:'ใช้ไตรโคเดอม่า',            day:10, type:'ใช้ไตรโคเดอม่า',              icon:'🍄', materials:['ไตรโคเดอม่า'], notes:'ป้องกันโรครากและลำต้น' },
      { id:'s4', name:'ปักค้างและมัดต้น รอบแรก',  day:20, type:'ค้ำยัน / มัดขึ้นค้าง',       icon:'🪵', materials:['ไม้ค้ำยัน'], notes:'ปักค้างทุกต้น มัดหลวมๆ' },
      { id:'s5', name:'ตัดแต่งกิ่ง + รดน้ำหมัก',  day:30, type:'ตัดแต่งกิ่ง',                icon:'✂️', materials:['น้ำหมักชีวภาพ'], notes:'ตัดกิ่งแขนง เหลือ 1-2 ลำ' },
      { id:'s6', name:'พ่นบิวเวอเรีย+เมธาไรเซียม',day:35, type:'พ่นบิวเวอเรีย+เมธาไรเซียม', icon:'🦠', materials:['บิวเวอเรีย','เมธาไรเซียม'], notes:'ป้องกันแมลงหวี่ขาว เพลี้ย' },
      { id:'s7', name:'มัดต้น รอบสอง + ใส่ปุ๋ยหมัก',day:45,type:'ค้ำยัน / มัดขึ้นค้าง',     icon:'🪵', materials:['ปุ๋ยหมัก'], notes:'มัดเพิ่มเมื่อต้นสูงขึ้น' },
      { id:'s8', name:'ตัดแต่งกิ่ง รอบสอง',       day:55, type:'ตัดแต่งกิ่ง',                icon:'✂️', materials:[], notes:'ตัดใบแก่-ใบเหลือง ให้อากาศถ่ายเท' },
      { id:'s9', name:'ใช้ไตรโคเดอม่า รอบสอง',    day:65, type:'ใช้ไตรโคเดอม่า',              icon:'🍄', materials:['ไตรโคเดอม่า'], notes:'' },
      { id:'s10',name:'เริ่มเก็บเกี่ยว',           day:85, type:'เก็บเกี่ยว',                  icon:'🌾', materials:[], notes:'เก็บเมื่อผลสีแดง 80%' },
    ]},
  { id:3, name:'พริก', category:'พืชสวนครัว', daysToHarvest:120, isContinuous:true, icon:'🌶️',
    notes:'เก็บเกี่ยวได้ต่อเนื่อง 6-12 เดือน ชอบแดดจัด',
    stages:[
      { id:'s1', name:'เตรียมดิน',                 day:0,  type:'เตรียมดิน',                  icon:'⛏️', materials:['ปุ๋ยหมัก'], notes:'' },
      { id:'s2', name:'ย้ายกล้า',                  day:7,  type:'ปลูกต้นกล้า',                 icon:'🌱', materials:[], notes:'ระยะ 60×60 ซม.' },
      { id:'s3', name:'ใช้ไตรโคเดอม่า',            day:10, type:'ใช้ไตรโคเดอม่า',              icon:'🍄', materials:['ไตรโคเดอม่า'], notes:'' },
      { id:'s4', name:'รดน้ำหมัก รอบแรก',          day:21, type:'รดน้ำหมักชีวภาพ',             icon:'🧴', materials:['น้ำหมักชีวภาพ'], notes:'' },
      { id:'s5', name:'ปักค้าง',                   day:30, type:'ค้ำยัน / มัดขึ้นค้าง',       icon:'🪵', materials:['ไม้ค้ำยัน'], notes:'ปักค้างก่อนออกดอก' },
      { id:'s6', name:'พ่นบิวเวอเรีย+เมธาไรเซียม',day:40, type:'พ่นบิวเวอเรีย+เมธาไรเซียม', icon:'🦠', materials:['บิวเวอเรีย','เมธาไรเซียม'], notes:'ป้องกันไรแดง เพลี้ยไฟ' },
      { id:'s7', name:'ใส่ปุ๋ยหมัก รอบสอง',       day:50, type:'ใส่ปุ๋ยหมัก',                  icon:'♻️', materials:['ปุ๋ยหมัก'], notes:'' },
      { id:'s8', name:'ตรวจโรค + ใช้ไตรโคเดอม่า', day:70, type:'ใช้ไตรโคเดอม่า',              icon:'🍄', materials:['ไตรโคเดอม่า'], notes:'ตรวจโรคแอนแทรคโนส' },
      { id:'s9', name:'เก็บเกี่ยวรอบแรก',         day:90, type:'เก็บเกี่ยว',                  icon:'🌾', materials:[], notes:'เก็บพริกเขียว หรือรอแดง' },
      { id:'s10',name:'รดน้ำหมักบำรุงต่อเนื่อง',  day:105,type:'รดน้ำหมักชีวภาพ',             icon:'🧴', materials:['น้ำหมักชีวภาพ','ปุ๋ยหมัก'], notes:'รดน้ำหมักทุกเดือน' },
    ]},
  { id:4, name:'ตะไคร้ (ต่อเนื่อง)', category:'สมุนไพร', daysToHarvest:90, isContinuous:true, icon:'🌿',
    notes:'เก็บเกี่ยวได้ต่อเนื่อง ตัดรอบ 30-45 วัน',
    stages:[
      { id:'s1', name:'เตรียมดิน + ปลูก',          day:0,  type:'เตรียมดิน',                  icon:'⛏️', materials:['ปุ๋ยหมัก'], notes:'ปลูกจากหน่อ ระยะ 50×50 ซม.' },
      { id:'s2', name:'ใช้ไตรโคเดอม่า',            day:7,  type:'ใช้ไตรโคเดอม่า',              icon:'🍄', materials:['ไตรโคเดอม่า'], notes:'ป้องกันโรครา' },
      { id:'s3', name:'รดน้ำหมัก',                 day:21, type:'รดน้ำหมักชีวภาพ',             icon:'🧴', materials:['น้ำหมักชีวภาพ'], notes:'' },
      { id:'s4', name:'ใส่ปุ๋ยหมัก',              day:45, type:'ใส่ปุ๋ยหมัก',                  icon:'♻️', materials:['ปุ๋ยหมัก'], notes:'' },
      { id:'s5', name:'เก็บเกี่ยวรอบแรก',         day:90, type:'เก็บเกี่ยว',                  icon:'🌾', materials:[], notes:'ตัดเหลือโคน 10 ซม.' },
    ]},
  { id:5, name:'ผักกาด/ผักบุ้ง (30 วัน)', category:'พืชผัก', daysToHarvest:30, isContinuous:false, icon:'🥗',
    notes:'ปลูกง่าย เติบโตเร็ว เหมาะทุกฤดู',
    stages:[
      { id:'s1', name:'เตรียมดิน + หว่านเมล็ด',   day:0,  type:'หว่านเมล็ด',                  icon:'🌾', materials:['ปุ๋ยหมัก'], notes:'' },
      { id:'s2', name:'ใช้ไตรโคเดอม่า',            day:5,  type:'ใช้ไตรโคเดอม่า',              icon:'🍄', materials:['ไตรโคเดอม่า'], notes:'' },
      { id:'s3', name:'รดน้ำหมัก',                 day:14, type:'รดน้ำหมักชีวภาพ',             icon:'🧴', materials:['น้ำหมักชีวภาพ'], notes:'' },
      { id:'s4', name:'พ่นบิวเวอเรีย',             day:20, type:'พ่นบิวเวอเรีย+เมธาไรเซียม',  icon:'🦠', materials:['บิวเวอเรีย'], notes:'ป้องกันหนอนใยผัก' },
      { id:'s5', name:'เก็บเกี่ยว',               day:30, type:'เก็บเกี่ยว',                  icon:'🌾', materials:[], notes:'' },
    ]},
];

// plotSeasons — แผนปลูกจริง (instance)

// soilRests — ช่วงพักดิน

// inputBatches — การผลิตวัสดุอินทรีย์

// Built-in input production templates
export const INPUT_TEMPLATES = {
  'ปุ๋ยหมัก':     { icon:'🪣', days:90, color:'#92400e', stages:[
    {name:'เริ่มกองปุ๋ย',      day:0},  {name:'พลิกกอง+ตรวจความชื้น',day:14},
    {name:'พลิกกอง รอบสอง',    day:30}, {name:'ตรวจสอบกลิ่น/สี',     day:60},
    {name:'พร้อมใช้งาน 🎉',    day:90}]},
  'น้ำหมักชีวภาพ':{ icon:'🧴', days:30, color:'#065f46', stages:[
    {name:'เตรียมส่วนผสม+เริ่มหมัก',day:0}, {name:'คนและตรวจกลิ่น',day:7},
    {name:'กรองกาก',              day:21}, {name:'พร้อมใช้งาน 🎉',   day:30}]},
  'ไตรโคเดอม่า':  { icon:'🍄', days:14, color:'#3b5e2b', stages:[
    {name:'เตรียมอาหารเลี้ยงเชื้อ',day:0}, {name:'เพาะและขยายเชื้อ',day:7},
    {name:'พร้อมใช้งาน 🎉',       day:14}]},
  'บิวเวอเรีย':   { icon:'🦠', days:14, color:'#1e3a5f', stages:[
    {name:'เตรียมอาหารเลี้ยงเชื้อ',day:0}, {name:'เพาะและขยายเชื้อ',day:7},
    {name:'พร้อมใช้งาน 🎉',       day:14}]},
  'เมธาไรเซียม':  { icon:'🦠', days:14, color:'#4c1d95', stages:[
    {name:'เตรียมอาหารเลี้ยงเชื้อ',day:0}, {name:'เพาะและขยายเชื้อ',day:7},
    {name:'พร้อมใช้งาน 🎉',       day:14}]},
  'ถ่านไบโอชาร์':  { icon:'🔥', days:7,  color:'#374151', stages:[
    {name:'เผาถ่าน',              day:0}, {name:'ดับและระบาย',       day:2},
    {name:'บ่มและบดหยาบ',         day:5}, {name:'พร้อมใส่ดิน 🎉',    day:7}]},
};

export function openRequisitionModal(presetInvId) {
  // Populate item dropdown (supply only)
  const sel = document.getElementById('req-item-select');
  sel.innerHTML = '<option value="">-- เลือกวัสดุ --</option>';
  invItems.filter(i => i.cat !== 'ผลผลิต').forEach(i => {
    const opt = document.createElement('option');
    opt.value = i.id;
    opt.textContent = i.name + ' (คงเหลือ: ' + i.qty + ' ' + i.unit + ')';
    if (presetInvId && i.id === presetInvId) opt.selected = true;
    sel.appendChild(opt);
  });
  // Populate person dropdown
  const pSel = document.getElementById('req-person-select');
  pSel.innerHTML = '<option value="">-- เลือกผู้เบิก --</option>';
  farmSettings.workers.forEach(w => {
    const opt = document.createElement('option');
    opt.value = w; opt.textContent = w;
    pSel.appendChild(opt);
  });
  const other = document.createElement('option');
  other.value = 'other'; other.textContent = '✏️ พิมพ์เอง...';
  pSel.appendChild(other);

  document.getElementById('req-date').value = dateStr;
  document.getElementById('req-qty').value  = '';
  document.getElementById('req-purpose').value = '';
  document.getElementById('req-note').value = '';
  document.getElementById('req-person-other-wrap').style.display = 'none';
  document.getElementById('req-summary').innerHTML = 'เลือกวัสดุและจำนวนเพื่อดูสรุป';

  if (presetInvId) onReqItemSelect();
  document.getElementById('modal-requisition').classList.add('open');
}

export function onReqItemSelect() {
  const sel  = document.getElementById('req-item-select');
  const invId = parseInt(sel.value);
  const item  = invItems.find(i => i.id === invId);
  const info  = document.getElementById('req-stock-info');
  if (item) {
    const st = invStatus(item);
    info.innerHTML = `<span style="font-weight:600">${item.qty} ${item.unit}</span> · ราคา ${item.price.toLocaleString('th-TH')} ฿/${item.unit} · <span class="badge ${st.cls}" style="font-size:10px">${st.label}</span>`;
  } else {
    info.textContent = '—';
  }
  updateReqTotal();
}

export function handleReqPersonChange() {
  const val  = document.getElementById('req-person-select').value;
  const wrap = document.getElementById('req-person-other-wrap');
  if (wrap) wrap.style.display = val === 'other' ? '' : 'none';
  if (val === 'other') document.getElementById('req-person-other')?.focus();
}

export function updateReqTotal() {
  const invId = parseInt(document.getElementById('req-item-select').value);
  const item  = invItems.find(i => i.id === invId);
  const qty   = parseFloat(document.getElementById('req-qty').value) || 0;
  const summEl = document.getElementById('req-summary');
  if (!item || !qty) { summEl.innerHTML = 'เลือกวัสดุและจำนวนเพื่อดูสรุป'; return; }
  const totalCost = qty * item.price;
  const afterQty  = item.qty - qty;
  const statusClass = afterQty < 0 ? 'color:var(--red-400);font-weight:600' : 'color:var(--green-700);font-weight:600';
  summEl.innerHTML = `
    📦 <strong>${item.name}</strong> เบิก <strong>${qty} ${item.unit}</strong> · ราคา ${item.price.toLocaleString('th-TH')} ฿/${item.unit}<br>
    💰 มูลค่าที่เบิก: <strong>${totalCost.toLocaleString('th-TH')} ฿</strong><br>
    📊 คงเหลือหลังเบิก: <span style="${statusClass}">${afterQty} ${item.unit}</span>
    ${afterQty < 0 ? ' <span style="color:var(--red-400)">⚠️ เกินจำนวนที่มี</span>' : ''}
  `;
}

export function saveRequisition() {
  const invId   = parseInt(document.getElementById('req-item-select').value);
  const item    = invItems.find(i => i.id === invId);
  const qty     = parseFloat(document.getElementById('req-qty').value) || 0;
  const date    = document.getElementById('req-date').value || dateStr;
  const perSel  = document.getElementById('req-person-select').value;
  const person  = perSel === 'other' || !perSel
    ? (document.getElementById('req-person-other').value.trim() || '—')
    : perSel;
  const purpose = document.getElementById('req-purpose').value.trim();
  const note    = document.getElementById('req-note').value.trim();

  if (!item)   { showToast('⚠️ เลือกรายการวัสดุก่อน'); return; }
  if (!qty || qty <= 0) { showToast('⚠️ กรอกจำนวนที่เบิก'); return; }
  if (qty > item.qty) { if (!confirm(`⚠️ จำนวนเบิก (${qty}) เกินกว่าที่มีในคลัง (${item.qty} ${item.unit})\nดำเนินการต่อหรือไม่?`)) return; }

  const totalCost = qty * item.price;
  // Deduct from inventory
  item.qty = Math.max(0, item.qty - qty);

  // Record
  reqItems.unshift({ id: _nextReqId++, date, invId, itemName: item.name, qty, unit: item.unit, person, purpose, note, totalCost });

  closeModal('modal-requisition');
  renderInv();
  renderReqHistory();
  saveData();
  showToast(`✅ เบิก ${item.name} ${qty} ${item.unit} สำเร็จ · มูลค่า ${totalCost.toLocaleString('th-TH')} ฿`);
}

export function renderReqHistory() {
  const tbody = document.getElementById('req-table-body');
  const emptyEl = document.getElementById('req-empty');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (reqItems.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';
  [...reqItems].sort((a,b) => b.date.localeCompare(a.date)).forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${fmtDate(r.date)}</td>
      <td><strong>${r.itemName}</strong></td>
      <td style="font-weight:600">${r.qty}</td>
      <td>${r.unit}</td>
      <td>${r.person}</td>
      <td>${r.purpose||'—'}</td>
      <td>${r.note||'—'}</td>
      <td>
        <button class="btn-icon del" onclick="deleteReqItem(${r.id})" title="ลบ">🗑</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

export function deleteReqItem(id) {
  const r = reqItems.find(x => x.id === id);
  if (!r) return;
  if (!confirm(`ลบประวัติการเบิก "${r.itemName}" ${r.qty} ${r.unit}?\n(จำนวนจะถูกคืนเข้าคลัง)`)) return;
  // Restore qty
  const item = invItems.find(i => i.id === r.invId);
  if (item) item.qty += r.qty;
  setReqItems(reqItems.filter(x => x.id !== id););
  renderInv();
  renderReqHistory();
  saveData();
  showToast('🗑 ลบประวัติการเบิกและคืนวัสดุแล้ว');
}

// ============================================================
// ===== CHECKBOX SELECTION SYSTEM =====

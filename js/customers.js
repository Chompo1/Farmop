import { _pgState, _renderCustomersPage } from './pagination.js';
import { custItems, editingCustId, nextCustId, setEditingCustId } from './state.js';
import { closeModal, showToast } from './ui.js';
import { dateStr } from './utils.js';

// ============================================================
export const custTypeMap = {
  'ตลาด':          'badge-green',
  'ร้านอาหาร':     'badge-sky',
  'บุคคล':         'badge-earth',
  'ออนไลน์':       'badge-amber',
  'โรงแรม':        'badge-sky',
  'ซูเปอร์มาร์เก็ต':'badge-purple',
  'อื่นๆ':         'badge-gray',
};
  { id:1, name:'ตลาดสดเช้าลำปาง',        type:'ตลาด',      contact:'081-234-5678',   products:'ผักคะน้า, ผักบุ้ง, ผักกาด',   total:84200,  lastOrder:'2026-05-05' },
  { id:2, name:'ร้านอาหารครัวไทย',        type:'ร้านอาหาร', contact:'089-876-5432',   products:'มะเขือเทศ, พริก, มะนาว',       total:52800,  lastOrder:'2026-05-05' },
  { id:3, name:'คุณนุ่น (ลูกค้าประจำ)',   type:'บุคคล',     contact:'062-111-2233',   products:'ตะไคร้, กระเทียม, สมุนไพร',    total:18600,  lastOrder:'2026-05-04' },
  { id:4, name:'ออนไลน์ Facebook',         type:'ออนไลน์',   contact:'@FarmSeeKhiao',  products:'ผักออร์แกนิครวม, เคล',         total:29400,  lastOrder:'2026-05-03' },
  { id:5, name:'โรงแรมเวียงลคอร',          type:'โรงแรม',    contact:'054-123-456',    products:'ผักอินทรีย์รวม, ใบมะกรูด',     total:46500,  lastOrder:'2026-05-01' },
  { id:6, name:'Tops Supermarket ลำปาง', type:'ซูเปอร์มาร์เก็ต',contact:'054-789-012',products:'ผักเคล, มะเขือเทศราชินี',     total:31200,  lastOrder:'2026-04-28' },
  { id:7, name:'คลินิกสุขภาพธรรมชาติ',   type:'ธุรกิจ',    contact:'092-345-6789',   products:'สมุนไพร, ขิง, กระชาย, ไพล',   total:14800,  lastOrder:'2026-04-20' },
  { id:8, name:'ร้านก๋วยเตี๋ยวเจ้าเก่า',  type:'ร้านอาหาร', contact:'086-555-4321',   products:'ผักบุ้ง, หอมแดง, ตะไคร้',      total:22100,  lastOrder:'2026-04-25' },
];

export function renderCustomers() {
  _pgState.customers.page = 1;
  _renderCustomersPage(_pgState.customers.page, _pgState.customers.query);
}

export function openCustModal(id) {
  setEditingCustId(id || null);
  document.getElementById('cust-modal-title').textContent = id ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้าใหม่';
  document.getElementById('cust-save-btn').textContent    = id ? 'บันทึกการแก้ไข' : 'เพิ่มลูกค้า';
  if (id) {
    const item = custItems.find(i => i.id === id);
    document.getElementById('cust-name').value        = item.name;
    document.getElementById('cust-type').value        = item.type;
    document.getElementById('cust-contact').value     = item.contact;
    document.getElementById('cust-products').value    = item.products;
    document.getElementById('cust-total').value       = item.total;
    document.getElementById('cust-last-order').value  = item.lastOrder;
  } else {
    ['cust-name','cust-contact','cust-products','cust-total'].forEach(x => document.getElementById(x).value = '');
    document.getElementById('cust-type').value        = 'ตลาด';
    document.getElementById('cust-last-order').value  = dateStr;
  }
  document.getElementById('modal-cust').classList.add('open');
}

export function editCustItem(id) { openCustModal(id); }

export function saveCustItem() {
  const name      = document.getElementById('cust-name').value.trim();
  const type      = document.getElementById('cust-type').value;
  const contact   = document.getElementById('cust-contact').value.trim();
  const products  = document.getElementById('cust-products').value.trim();
  const total     = parseFloat(document.getElementById('cust-total').value) || 0;
  const lastOrder = document.getElementById('cust-last-order').value;
  if (!name) { showToast('⚠️ กรุณากรอกชื่อลูกค้า'); return; }
  if (editingCustId) {
    const item = custItems.find(i => i.id === editingCustId);
    Object.assign(item, { name, type, contact, products, total, lastOrder });
    showToast('✅ แก้ไขข้อมูลลูกค้าสำเร็จ');
  } else {
    custItems.push({ id: nextCustId++, name, type, contact, products, total, lastOrder });
    showToast('✅ เพิ่มลูกค้าสำเร็จ');
  }
  closeModal('modal-cust');
  renderCustomers();
}

// ============================================================

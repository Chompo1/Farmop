import { renderActivities, renderCrops } from './crops.js';
import { renderCustomers } from './customers.js';
import { renderInv } from './inventory.js';
import { _delContext, actItems, cropItems, custItems, invItems, setDelContext } from './state.js';
import { closeModal, showToast } from './ui.js';

// ===== SHARED CONFIRM DELETE =====
// ============================================================
export function askConfirmDel(ctx, id, label) {
  setDelContext({ ctx, id });
  document.getElementById('confirm-del-name').textContent = label;
  document.getElementById('confirm-del-btn').onclick = execDel;
  document.getElementById('modal-confirm-del').classList.add('open');
}
export function execDel() {
  const { ctx, id } = _delContext;
  if (ctx === 'crop') { cropItems = cropItems.filter(i => i.id !== id); renderCrops();     showToast('🗑 ลบพืชผลแล้ว'); }
  if (ctx === 'act')  { actItems  = actItems.filter(i => i.id !== id);  renderActivities();showToast('🗑 ลบกิจกรรมแล้ว'); }
  if (ctx === 'cust') { custItems = custItems.filter(i => i.id !== id); renderCustomers(); showToast('🗑 ลบลูกค้าแล้ว'); }
  if (ctx === 'inv')  { invItems  = invItems.filter(i => i.id !== id);  renderInv();       showToast('🗑 ลบวัสดุแล้ว'); }
  closeModal('modal-confirm-del');
  setDelContext(null);
}

// ============================================================
// ===== INVENTORY (existing, updated to use shared del) =====

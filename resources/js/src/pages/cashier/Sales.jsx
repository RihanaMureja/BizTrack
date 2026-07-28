import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import Modal from '../../components/Modal';

const MOCK_SALES = [
  { id:'S-001', customer:'Meron Hailu',  items:3, total:'ETB 420',  method:'Cash',  date:'2024-07-22', status:'completed' },
  { id:'S-002', customer:'Bekele Worku', items:1, total:'ETB 150',  method:'Chapa', date:'2024-07-22', status:'completed' },
  { id:'S-003', customer:'Liya Girma',   items:5, total:'ETB 890',  method:'Cash',  date:'2024-07-21', status:'completed' },
  { id:'S-004', customer:'Dawit Tadesse',items:2, total:'ETB 300',  method:'Cash',  date:'2024-07-21', status:'refunded'  },
];

export default function Sales() {
  const [q, setQ]           = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]     = useState({ customer:'', amount:'', method:'Cash', notes:'' });

  const filtered = MOCK_SALES.filter(s =>
    s.customer.toLowerCase().includes(q.toLowerCase()) || s.id.includes(q)
  );

  const handleSave = (e) => { e.preventDefault(); setShowModal(false); setForm({ customer:'', amount:'', method:'Cash', notes:'' }); };

  return (
    <div>
      <PageHeader title="Sales" subtitle="Record and view all sales"
        action={<button onClick={() => setShowModal(true)} className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">+ New Sale</button>} />
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100"><SearchBar placeholder="Search sales…" value={q} onChange={setQ} /></div>
        <table className="w-full">
          <thead><tr className="border-b border-gray-100">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Items</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Method</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
          </tr></thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono text-gray-600">{s.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.customer}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{s.items}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.total}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{s.method}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{s.date}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.status==='completed'?'bg-green-100 text-green-700':'bg-red-100 text-red-600'}`}>{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Record New Sale">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
            <input value={form.customer} onChange={e => setForm({...form, customer:e.target.value})} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Customer name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (ETB)</label>
            <input type="number" value={form.amount} onChange={e => setForm({...form, amount:e.target.value})} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select value={form.method} onChange={e => setForm({...form, method:e.target.value})}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option>Cash</option><option>Chapa</option><option>Bank Transfer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Optional notes" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 bg-green-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-green-700">Save Sale</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
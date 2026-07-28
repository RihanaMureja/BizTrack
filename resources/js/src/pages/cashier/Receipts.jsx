import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';

const MOCK = [
  { id:'REC-001', customer:'Meron Hailu',   amount:'ETB 420', date:'2024-07-22', method:'Cash'  },
  { id:'REC-002', customer:'Bekele Worku',  amount:'ETB 150', date:'2024-07-22', method:'Chapa' },
  { id:'REC-003', customer:'Liya Girma',    amount:'ETB 890', date:'2024-07-21', method:'Cash'  },
];

export default function Receipts() {
  const [q, setQ] = useState('');
  const filtered = MOCK.filter(r => r.customer.toLowerCase().includes(q.toLowerCase()) || r.id.includes(q));
  
  return (
    <div>
      <PageHeader title="Receipts" subtitle="All issued receipts" />
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <SearchBar placeholder="Search receipts…" value={q} onChange={setQ} />
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Receipt #</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Method</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono text-gray-600">{r.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.customer}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.amount}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{r.method}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{r.date}</td>
                <td className="px-4 py-3">
                  <button className="text-xs text-green-600 hover:underline font-medium">Print</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
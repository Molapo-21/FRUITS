import { useState } from 'react';
import {
  getAvailableStockReport, getSalesByFruit, getSalesByBoxSize,
  getSalesByVendor, getPurchasesByProvince, getPendingOrdersReport,
  getCompletedOrdersReport, getSalesByDate
} from '../services/api';

const REPORTS = [
  { id: 'stock', label: 'Available Stock Report', fn: getAvailableStockReport },
  { id: 'sales-fruit', label: 'Sales by Fruit', fn: getSalesByFruit },
  { id: 'sales-box', label: 'Sales by Box Size', fn: getSalesByBoxSize },
  { id: 'sales-vendor', label: 'Sales by Street Vendor', fn: getSalesByVendor },
  { id: 'purchases-province', label: 'Purchases by Province', fn: getPurchasesByProvince },
  { id: 'pending', label: 'Pending Orders', fn: getPendingOrdersReport },
  { id: 'completed', label: 'Completed Orders', fn: getCompletedOrdersReport },
  { id: 'sales-date', label: 'Total Sales by Date', fn: getSalesByDate },
];

const Reports = () => {
  const [active, setActive] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');

  const runReport = async (report) => {
    setLoading(true);
    setActive(report.id);
    setTitle(report.label);
    try {
      const res = await report.fn();
      setData(res.data);
    } catch (e) {
      console.error(e);
      setData(null);
    }
    setLoading(false);
  };

  const renderTable = () => {
    if (!data?.data?.length) return <div className="empty-state">No data available for this report</div>;

    const keys = Object.keys(data.data[0]).filter(k => k !== 'id');
    return (
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>{keys.map(k => <th key={k}>{k.replace(/_/g, ' ')}</th>)}</tr>
          </thead>
          <tbody>
            {data.data.map((row, i) => (
              <tr key={i}>
                {keys.map(k => (
                  <td key={k}>
                    {typeof row[k] === 'number' && k.toLowerCase().includes('sales') || k.toLowerCase().includes('amount') || k.toLowerCase().includes('value') || k.toLowerCase().includes('price')
                      ? `M${Number(row[k]).toLocaleString()}`
                      : row[k] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Reports</h1>

      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        {REPORTS.map(r => (
          <button
            key={r.id}
            className={`stat-card ${active === r.id ? 'green' : ''}`}
            style={{ cursor: 'pointer', textAlign: 'left', border: active === r.id ? '2px solid var(--primary)' : undefined }}
            onClick={() => runReport(r)}
          >
            <div className="label">{r.label}</div>
          </button>
        ))}
      </div>

      {active && (
        <div className="card">
          <div className="card-header">
            <h2>{title}</h2>
            {data && <span className="badge badge-blue">{data.count} records</span>}
          </div>
          {loading ? <div className="loading">Generating report...</div> : renderTable()}
        </div>
      )}
    </div>
  );
};

export default Reports;

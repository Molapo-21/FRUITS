import { useEffect, useState } from 'react';
import { getDashboard } from '../services/api';
import {
  Apple, Users, Store, Package, ShoppingCart, Clock,
  CheckCircle2, WalletCards, ArrowUpRight, Activity
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const CHART_COLORS = ['#111111', '#4b5563', '#7c8490', '#a8adb4', '#d1d5db'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="empty-state">
        <Activity size={28} />
        <h3>Dashboard unavailable</h3>
        <p>We could not load the latest operational data.</p>
      </div>
    );
  }

  const { totals, recentOrders, topFruits, stockByFruit } = data;

  const statusBadge = (status) => {
    const map = {
      Pending: 'badge-dark',
      Confirmed: 'badge-light',
      Processing: 'badge-light',
      'Ready for Collection/Delivery': 'badge-mid',
      Completed: 'badge-success',
      Cancelled: 'badge-danger'
    };
    return map[status] || 'badge-gray';
  };

  const stats = [
    { label: 'Total Fruits', value: totals.fruits, icon: Apple },
    { label: 'Suppliers', value: totals.suppliers, icon: Users },
    { label: 'Vendors', value: totals.vendors, icon: Store },
    { label: 'Available Stock', value: totals.availableStock, icon: Package },
    { label: 'Total Orders', value: totals.totalOrders, icon: ShoppingCart },
    { label: 'Pending Orders', value: totals.pendingOrders, icon: Clock },
    { label: 'Completed Orders', value: totals.completedOrders, icon: CheckCircle2 },
    { label: 'Sales Value', value: `M${Number(totals.salesValue).toLocaleString()}`, icon: WalletCards },
  ];

  return (
    <div className="dashboard-page">
      <section className="page-heading">
        <div>
          <span className="section-kicker">OPERATIONS OVERVIEW</span>
          <h1>Good business starts with visibility.</h1>
          <p>Monitor stock, orders, partners and sales from one central workspace.</p>
        </div>
        <div className="heading-chip">
          <Activity size={15} />
          Live overview
        </div>
      </section>

      <section className="stats-grid">
        {stats.map(({ label, value, icon: Icon }) => (
          <article className="stat-card" key={label}>
            <div className="stat-top">
              <div className="stat-icon"><Icon size={18} /></div>
              <ArrowUpRight size={16} className="stat-arrow" />
            </div>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
          </article>
        ))}
      </section>

      <section className="two-col dashboard-charts">
        <article className="card">
          <div className="card-header">
            <div>
              <span className="card-kicker">INVENTORY</span>
              <h2>Stock by fruit</h2>
            </div>
            <div className="mini-icon"><Package size={17} /></div>
          </div>
          <div className="card-body chart-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockByFruit || []} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="available" fill="#171717" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </article>

        <article className="card">
          <div className="card-header">
            <div>
              <span className="card-kicker">SALES</span>
              <h2>Top selling fruits</h2>
            </div>
            <div className="mini-icon"><Apple size={17} /></div>
          </div>
          <div className="card-body chart-body">
            {topFruits && topFruits.length > 0 ? (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topFruits}
                      dataKey="total_sold"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={94}
                      innerRadius={52}
                      paddingAngle={2}
                    >
                      {topFruits.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="empty-state compact">
                <Apple size={24} />
                <span>No completed sales yet</span>
              </div>
            )}
          </div>
        </article>
      </section>

      <article className="card orders-card">
        <div className="card-header">
          <div>
            <span className="card-kicker">ACTIVITY</span>
            <h2>Recent orders</h2>
          </div>
          <div className="mini-icon"><ShoppingCart size={17} /></div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Vendor</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders?.length > 0 ? recentOrders.map((o) => (
                <tr key={o.order_number}>
                  <td><span className="table-primary">{o.order_number}</span></td>
                  <td>{o.vendor_name}</td>
                  <td>{new Date(o.order_date).toLocaleDateString()}</td>
                  <td><strong>M{Number(o.total_amount).toLocaleString()}</strong></td>
                  <td><span className={`badge ${statusBadge(o.status)}`}>{o.status}</span></td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="empty-state">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
};

export default Dashboard;

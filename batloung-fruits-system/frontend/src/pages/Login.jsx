import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Apple, ArrowRight, ShieldCheck, BarChart3, PackageCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <aside className="login-showcase">
          <div>
            <div className="login-brand">
              <div className="brand-mark"><Apple size={22} /></div>
              <div>
                <strong>Batloung Fruits</strong>
                <span>Distribution Management</span>
              </div>
            </div>

            <div className="showcase-copy">
              <span className="section-kicker">OPERATIONS PLATFORM</span>
              <h1>Manage the business with clarity.</h1>
              <p>One professional workspace for inventory, suppliers, vendors, orders and reporting.</p>
            </div>
          </div>

          <div className="showcase-features">
            <div><ShieldCheck size={17} /><span>Secure access</span></div>
            <div><PackageCheck size={17} /><span>Stock visibility</span></div>
            <div><BarChart3 size={17} /><span>Actionable reports</span></div>
          </div>
        </aside>

        <section className="login-card">
          <div className="login-heading">
            <span className="section-kicker">WELCOME BACK</span>
            <h2>Sign in</h2>
            <p>Enter your credentials to access management tools.</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username or Email</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Enter your username"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              <span>{loading ? 'Signing in...' : 'Continue to dashboard'}</span>
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="demo-note">
            <strong>Demo access</strong>
            <span>Admin: <code>admin</code> / <code>admin123</code></span>
            <span>Sales: <code>sales1</code> / <code>sales123</code></span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;

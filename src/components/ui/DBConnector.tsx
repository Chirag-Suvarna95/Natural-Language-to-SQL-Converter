// frontend/src/components/DBConnector.tsx
import { useState } from 'react';

export default function DBConnector({ onConnect }: { 
  onConnect: (sessionId: string) => void 
}) {
  const [form, setForm] = useState({
    db_type: 'postgresql',
    host: 'localhost',
    port: 5432,
    username: '',
    password: '',
    database: ''
  });
  const [loading, setLoading] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const { session_id } = await response.json();
      onConnect(session_id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto mt-20 bg-zinc-800 rounded-lg">
      <h2 className="text-cyan-400 mb-4 text-lg">Database Connection</h2>
      <form onSubmit={handleConnect} className="space-y-3">
        <select
          value={form.db_type}
          onChange={e => setForm({...form, db_type: e.target.value})}
          className="w-full bg-zinc-700 text-gray-200 p-2 rounded"
        >
          <option value="postgresql">PostgreSQL</option>
          <option value="mysql">MySQL</option>
        </select>
        <input
          type="text"
          placeholder="Host"
          value={form.host}
          onChange={e => setForm({...form, host: e.target.value})}
          className="w-full bg-zinc-700 text-gray-200 p-2 rounded"
        />
        <input
          type="number"
          placeholder="Port"
          value={form.port}
          onChange={e => setForm({...form, port: Number(e.target.value)})}
          className="w-full bg-zinc-700 text-gray-200 p-2 rounded"
        />
        <input
          type="text"
          placeholder="Database"
          value={form.database}
          onChange={e => setForm({...form, database: e.target.value})}
          className="w-full bg-zinc-700 text-gray-200 p-2 rounded"
        />
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={e => setForm({...form, username: e.target.value})}
          className="w-full bg-zinc-700 text-gray-200 p-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={e => setForm({...form, password: e.target.value})}
          className="w-full bg-zinc-700 text-gray-200 p-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-800 hover:bg-cyan-900 text-cyan-400 p-2 rounded"
        >
          {loading ? 'Connecting...' : 'Initialize Session'}
        </button>
      </form>
    </div>
  );
}

import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Hr() {
  const [employees, setEmployees] = useState([])
  const [name, setName] = useState('')
  const [err, setErr] = useState('')

  const load = () => api('/api/hr').then((d) => setEmployees(d.employees))
  useEffect(() => { load().catch(() => {}) }, [])

  return (
    <div className="pad">
      <h2>হিউম্যান ক্যাপিটাল</h2>
      <form className="row" onSubmit={async (e) => {
        e.preventDefault(); setErr('')
        try {
          await api('/api/hr', { method: 'POST', body: JSON.stringify({ name, dept: 'Engineering', role: 'Specialist', salary: 90000 }) })
          setName(''); load()
        } catch (ex) { setErr(ex.message) }
      }}>
        <input placeholder="নাম" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn primary" type="submit">অনবোর্ড</button>
      </form>
      {err && <p className="form-note">{err}</p>}
      <table>
        <thead><tr><th>নাম</th><th>ডিপার্টমেন্ট</th><th>রোল</th><th>স্যালারি</th><th></th></tr></thead>
        <tbody>
          {employees.map((e) => (
            <tr key={e.id}><td>{e.name}</td><td>{e.dept}</td><td>{e.role}</td><td>৳{e.salary.toLocaleString()}</td><td>{e.status}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

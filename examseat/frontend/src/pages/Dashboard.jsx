import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
export default function Dashboard() {
  const { admin } = useAuth(); const [d, setD] = useState(null);
  useEffect(() => { Promise.all([api.get("/students"), api.get("/rooms/tree"), api.get("/exams")]).then(([s, t, e]) => {
    const rooms = t.data.flatMap((b) => b.floors.flatMap((f) => f.rooms));
    setD({ students: s.data.length, rooms: rooms.length, cap: rooms.reduce((a, r) => a + r.usable, 0), exams: e.data });
  }).catch(() => setD(false)); }, []);
  if (d === false) return <p>Could not load data. Is Flask running?</p>;
  if (!d) return <p>Loading…</p>;
  return (<><h2>Welcome, {admin.full_name}</h2><p className="muted">Your examination seating at a glance.</p>
    <div className="stats">{[["Total Students", d.students], ["Available Rooms", d.rooms], ["Seating Capacity", d.cap], ["Examinations", d.exams.length]].map(([l, v]) => <div className="st" key={l}><span className="muted">{l}</span><b>{v}</b></div>)}</div>
    <div className="panel"><h3>Recent examinations</h3>{d.exams.length ? <div className="tw"><table><tbody><tr><th>Name</th><th>Date</th><th>Students</th></tr>
      {d.exams.slice(0, 5).map((e) => <tr key={e.id}><td>{e.name}</td><td>{e.date}</td><td>{e.students}</td></tr>)}</tbody></table></div>
      : <p className="muted">No examinations yet. <Link to="/exams">Create one</Link>.</p>}</div></>);
}

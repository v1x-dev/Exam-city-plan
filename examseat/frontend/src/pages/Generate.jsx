import { useEffect, useState } from "react";
import api, { errMsg } from "../services/api";
import SeatGrid from "../components/SeatGrid";
export default function Generate() {
  const [exams, setExams] = useState([]); const [tree, setTree] = useState([]); const [eid, setEid] = useState(""); const [rooms, setRooms] = useState([]);
  const [strategy, setStrategy] = useState("sequential"); const [sortBy, setSortBy] = useState("roll_number"); const [err, setErr] = useState(""); const [res, setRes] = useState(null); const [plan, setPlan] = useState(null); const [idx, setIdx] = useState(0);
  useEffect(() => { api.get("/exams").then((r) => setExams(r.data)); api.get("/rooms/tree").then((r) => setTree(r.data)); }, []);
  const all = tree.flatMap((b) => b.floors.flatMap((f) => f.rooms)); const cap = all.filter((r) => rooms.includes(r.id)).reduce((a, r) => a + r.usable, 0);
  const exam = exams.find((e) => String(e.id) === eid);
  const toggle = (id) => setRooms(rooms.includes(id) ? rooms.filter((x) => x !== id) : [...rooms, id]);
  const run = async () => { setErr(""); setRes(null); setPlan(null);
    try { const r = await api.post("/seating/generate", { exam_id: +eid, room_ids: rooms, strategy, sort_by: sortBy }); setRes(r.data);
      setPlan((await api.get("/seating/plans/" + r.data.plan_id)).data); setIdx(0); } catch (x) { setErr(errMsg(x)); } };
  const R = plan?.rooms[idx];
  return (<><h2>Generate Seating Plan</h2>
    <div className="panel row"><select value={eid} onChange={(e) => setEid(e.target.value)}><option value="">Select examination</option>{exams.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.date})</option>)}</select>
      <select value={strategy} onChange={(e) => setStrategy(e.target.value)}><option value="sequential">Sequential</option><option value="random">Random</option><option value="mixed">Mixed branch/semester</option></select>
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>{["roll_number", "name", "branch", "semester"].map((s) => <option key={s}>{s}</option>)}</select></div>
    <div className="panel"><b>Select rooms</b>{tree.map((b) => <div key={b.id}><p className="muted">{b.name}</p>{b.floors.flatMap((f) => f.rooms.map((r) => <label key={r.id} className="rm" style={{ display: "inline-block" }}>
      <input type="checkbox" style={{ width: "auto" }} checked={rooms.includes(r.id)} onChange={() => toggle(r.id)} /> {r.number} ({r.usable} usable)</label>))}</div>)}</div>
    <div className="panel"><b>Summary</b><p>Examination: {exam?.name || "—"} · Students: {exam?.students ?? "—"} · Rooms: {rooms.length} · Usable seats: {cap}</p>
      {exam && exam.students > cap && <p className="err">Capacity is insufficient for this examination.</p>}
      {err && <p className="err">{err}</p>}<button className="btn s" disabled={!eid || !rooms.length} onClick={run}>Generate plan</button></div>
    {res && <p className="ok">Allocated {res.allocated} of {res.students} students · {res.vacant_seats} vacant seats.</p>}
    {R && <div className="panel"><b>{R.block} › {R.floor} › Room {R.room}</b><p className="muted">Room {idx + 1} of {plan.rooms.length}</p><SeatGrid seats={R.seats} cols={R.cols} />
      <button className="btn o s" disabled={!idx} onClick={() => setIdx(idx - 1)}>Previous</button> <button className="btn o s" disabled={idx >= plan.rooms.length - 1} onClick={() => setIdx(idx + 1)}>Next</button> <button className="btn o s" onClick={() => window.print()}>Print</button></div>}</>);
}

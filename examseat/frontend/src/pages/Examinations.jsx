import { useEffect, useState } from "react";
import api, { errMsg } from "../services/api";
const blank = { name: "", subject: "", subject_code: "", course: "B.Tech", branch: "CSE", semester: 3, date: "", start_time: "10:00", end_time: "12:00", session: "Morning" };
export default function Examinations() {
  const [list, setList] = useState([]); const [f, setF] = useState(blank); const [err, setErr] = useState(""); const [msg, setMsg] = useState("");
  const load = () => api.get("/exams").then((r) => setList(r.data)).catch((e) => setErr(errMsg(e)));
  useEffect(() => { load(); }, []);
  const create = async (e) => { e.preventDefault(); setErr(""); setMsg("");
    try { const r = await api.post("/exams", f); setMsg(`Created with ${r.data.students} students.`); setF(blank); load(); } catch (x) { setErr(errMsg(x)); } };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (<><h2>Examinations</h2><p className="muted">Students are selected automatically by branch and semester.</p>
    <form className="panel" onSubmit={create}><div className="row">{["name", "subject", "subject_code", "course", "branch", "semester"].map((k) => <input key={k} placeholder={k.replace("_", " ")} value={f[k]} onChange={set(k)} />)}</div>
      <div className="row"><input type="date" value={f.date} onChange={set("date")} /><input type="time" value={f.start_time} onChange={set("start_time")} /><input type="time" value={f.end_time} onChange={set("end_time")} />
        <select value={f.session} onChange={set("session")}><option>Morning</option><option>Afternoon</option></select></div>
      {err && <p className="err">{err}</p>}{msg && <p className="ok">{msg}</p>}<button className="btn s">Create examination</button></form>
    <div className="panel tw"><table><tbody><tr><th>Name</th><th>Subject</th><th>Date</th><th>Time</th><th>Students</th></tr>
      {list.map((e) => <tr key={e.id}><td>{e.name}</td><td>{e.subject_code}</td><td>{e.date}</td><td>{e.start_time}–{e.end_time}</td><td>{e.students}</td></tr>)}</tbody></table>
      {!list.length && <p className="muted">No examinations yet.</p>}</div></>);
}

import { useEffect, useRef, useState } from "react";
import api, { errMsg } from "../services/api";
const blank = { full_name: "", roll_number: "", course: "B.Tech", branch: "CSE", semester: 3, section: "A" };
const F = ["full_name", "roll_number", "course", "branch", "semester", "section"];
export default function Students() {
  const [list, setList] = useState([]); const [q, setQ] = useState(""); const [f, setF] = useState(blank); const [edit, setEdit] = useState(null);
  const [err, setErr] = useState(""); const [msg, setMsg] = useState(""); const [rep, setRep] = useState(null); const file = useRef();
  const load = () => api.get("/students", { params: { q } }).then((r) => setList(r.data)).catch((e) => setErr(errMsg(e)));
  useEffect(() => { load(); }, [q]);
  const save = async (e) => { e.preventDefault(); setErr(""); setMsg("");
    try { edit ? await api.put("/students/" + edit, f) : await api.post("/students", f); setMsg(edit ? "Student updated." : "Student added."); setF(blank); setEdit(null); load(); }
    catch (x) { setErr(errMsg(x)); } };
  const del = async (s) => { if (!window.confirm(`Delete ${s.full_name}?`)) return;
    try { await api.delete("/students/" + s.id); load(); } catch (x) { setErr(errMsg(x)); } };
  const imp = async (e) => { const fl = e.target.files[0]; if (!fl) return; setErr(""); setRep(null);
    const fd = new FormData(); fd.append("file", fl);
    try { setRep((await api.post("/students/import", fd)).data); load(); } catch (x) { setErr(errMsg(x)); } e.target.value = ""; };
  const exp = async (format) => { try { const r = await api.get("/students/export", { params: { format }, responseType: "blob" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(r.data); a.download = "students." + format; a.click(); } catch (x) { setErr(errMsg(x)); } };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (<><div className="hd"><div><h2>Students</h2><p className="muted">{list.length} records</p></div>
    <div className="row tight"><input ref={file} type="file" accept=".csv,.xlsx,.xls" hidden onChange={imp} />
      <button className="btn o s" onClick={() => file.current.click()}>Import CSV / Excel</button><button className="btn o s" onClick={() => exp("csv")}>Export CSV</button><button className="btn o s" onClick={() => exp("xlsx")}>Export Excel</button></div></div>
    <p className="muted">Import file columns: full_name, roll_number, course, branch, semester, section</p>
    {rep && <div className="rep"><b>Import result</b><ul><li>Imported: {rep.imported}</li><li>Duplicates skipped: {rep.duplicates.length}{rep.duplicates.length > 0 && " (" + rep.duplicates.map((d) => `row ${d.row}: ${d.roll_number}`).join(", ") + ")"}</li>
      <li>Invalid: {rep.invalid.length}{rep.invalid.length > 0 && " (" + rep.invalid.map((d) => `row ${d.row}: ${d.reason}`).join(", ") + ")"}</li><li>Failed: {rep.failed.length}</li></ul></div>}
    <form className="panel row" onSubmit={save}>{F.map((k) => <input key={k} placeholder={k.replace("_", " ")} value={f[k]} onChange={set(k)} />)}
      <button className="btn s">{edit ? "Save changes" : "Add student"}</button>{edit && <button type="button" className="btn o s" onClick={() => { setEdit(null); setF(blank); }}>Cancel</button>}</form>
    {err && <p className="err">{err}</p>}{msg && <p className="ok">{msg}</p>}
    <div className="panel"><input style={{ marginBottom: 10 }} placeholder="Search name or roll number" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="tw"><table><tbody><tr><th>Name</th><th>Roll</th><th>Course</th><th>Branch</th><th>Sem</th><th>Sec</th><th></th></tr>
        {list.map((s) => <tr key={s.id}><td>{s.full_name}</td><td>{s.roll_number}</td><td>{s.course}</td><td>{s.branch}</td><td>{s.semester}</td><td>{s.section}</td>
          <td style={{ whiteSpace: "nowrap" }}><button className="btn o s" onClick={() => { setEdit(s.id); setF(s); window.scrollTo(0, 0); }}>Edit</button> <button className="btn d s" onClick={() => del(s)}>Delete</button></td></tr>)}</tbody></table></div>
      {!list.length && <p className="muted">No students found. Add one or import a file.</p>}</div></>);
}

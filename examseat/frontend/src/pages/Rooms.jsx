import { useEffect, useState } from "react";
import api, { errMsg } from "../services/api";
import SeatGrid from "../components/SeatGrid";
export default function Rooms() {
  const [tree, setTree] = useState([]); const [room, setRoom] = useState(null); const [sel, setSel] = useState(-1); const [err, setErr] = useState(""); const [v, setV] = useState({});
  const load = () => api.get("/rooms/tree").then((r) => setTree(r.data)).catch((e) => setErr(errMsg(e)));
  const open = (id) => api.get("/rooms/" + id).then((r) => { setRoom(r.data); setSel(-1); }).catch((e) => setErr(errMsg(e)));
  useEffect(() => { load(); }, []);
  const run = async (fn, after) => { setErr(""); try { await fn(); await load(); after && (await after()); } catch (x) { setErr(errMsg(x)); } };
  const sv = (k) => (e) => setV({ ...v, [k]: e.target.value }); const g = (k) => v[k] || "";
  const clear = (...ks) => setV((o) => { const n = { ...o }; ks.forEach((k) => delete n[k]); return n; });
  const ask = (label, cur) => window.prompt(label, cur);
  const del = (what, fn, after) => window.confirm(`Delete ${what}?`) && run(fn, after);
  const S = room && sel >= 0 ? room.seats[sel] : null;
  if (room) return (<><p><a href="#" onClick={(e) => { e.preventDefault(); setRoom(null); }}>Rooms</a> › {room.block} › {room.floor} › <b>Room {room.number}</b></p>{err && <p className="err">{err}</p>}
    <div className="two"><div className="panel"><SeatGrid seats={room.seats} cols={room.cols} selected={sel} onSelect={setSel} /></div>
      <div><div className="panel"><b>Capacity</b><p>Physical: {room.physical}<br />Damaged: {room.damaged}<br />Reserved/blocked: {room.reserved + room.blocked}<br /><b>Usable: {room.usable}</b></p></div>
        <div className="panel"><b>Selected seat</b>{S ? <><p>Row {S.row}, Seat {S.col}</p>
          <select value={S.status} onChange={(e) => run(() => api.patch("/seats/" + S.id, { status: e.target.value }), () => open(room.id))}>{["available", "damaged", "reserved", "blocked"].map((s) => <option key={s}>{s}</option>)}</select>
          <p><button className="btn d s" onClick={() => del("this seat", () => api.delete("/seats/" + S.id), () => open(room.id))}>Remove seat</button></p></> : <p className="muted">Click a seat to edit it.</p>}</div>
        <div className="panel"><b>Add a seat</b><div className="row"><input placeholder="Row" value={g("sr")} onChange={sv("sr")} /><input placeholder="Seat no." value={g("sc")} onChange={sv("sc")} /></div>
          <button className="btn s" onClick={() => run(() => api.post(`/rooms/${room.id}/seats`, { row: g("sr"), col: g("sc") }), () => open(room.id))}>Add seat</button></div></div></div></>);
  return (<><div className="hd"><div><h2>Rooms &amp; Seats</h2><p className="muted">Add blocks, floors, rooms and seats, or edit them.</p></div>
    <div className="row tight"><input placeholder="New block name" value={g("bn")} onChange={sv("bn")} /><button className="btn s" onClick={() => run(() => api.post("/blocks", { name: g("bn") }), () => clear("bn"))}>Add block</button></div></div>
    {err && <p className="err">{err}</p>}
    {tree.map((b) => <div className="panel" key={b.id}><div className="hd"><h3 style={{ margin: 0 }}>{b.name}</h3><div className="row tight">
      <button className="btn o s" onClick={() => { const n = ask("Block name", b.name); n && run(() => api.put("/blocks/" + b.id, { name: n })); }}>Rename</button>
      <button className="btn d s" onClick={() => del(b.name, () => api.delete("/blocks/" + b.id))}>Delete</button></div></div>
      {b.floors.map((f) => <div className="fl" key={f.id}><div className="hd"><b className="muted">{f.name}</b><div className="row tight">
        <button className="btn o s" onClick={() => { const n = ask("Floor name", f.name); n && run(() => api.put("/floors/" + f.id, { name: n })); }}>Rename</button>
        <button className="btn d s" onClick={() => del(f.name, () => api.delete("/floors/" + f.id))}>Delete</button></div></div><div style={{ marginTop: 8 }}>
        {f.rooms.map((r) => <button className="rm" key={r.id} onClick={() => open(r.id)}><b>Room {r.number}</b><br /><small>{r.rows}×{r.cols} · usable {r.usable}/{r.physical}</small></button>)}</div>
        <div className="row tight"><input placeholder="Room no." value={g("n" + f.id)} onChange={sv("n" + f.id)} /><input placeholder="Rows" value={g("r" + f.id)} onChange={sv("r" + f.id)} /><input placeholder="Columns" value={g("c" + f.id)} onChange={sv("c" + f.id)} />
          <button className="btn s" onClick={() => run(() => api.post("/rooms", { floor_id: f.id, number: g("n" + f.id), rows: g("r" + f.id), cols: g("c" + f.id) }), () => clear("n" + f.id, "r" + f.id, "c" + f.id))}>Add room</button></div></div>)}
      <div className="row tight fl"><input placeholder="New floor name" value={g("f" + b.id)} onChange={sv("f" + b.id)} /><button className="btn s" onClick={() => run(() => api.post("/floors", { building_id: b.id, name: g("f" + b.id) }), () => clear("f" + b.id))}>Add floor</button></div></div>)}</>);
}

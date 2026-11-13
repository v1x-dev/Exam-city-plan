import { useState } from "react";
import { Link } from "react-router-dom";
import api, { errMsg } from "../services/api";
export default function FindSeat() {
  const [roll, setRoll] = useState(""); const [res, setRes] = useState([]); const [err, setErr] = useState("");
  const search = async (e) => { e.preventDefault(); setErr(""); setRes([]);
    try { setRes((await api.get("/find-seat", { params: { roll } })).data); } catch (x) { setErr(errMsg(x)); } };
  return (<div style={{ maxWidth: 520, margin: "50px auto", padding: 20 }}><Link to="/">← Home</Link><h2>Find Your Examination Seat</h2>
    <form className="row" onSubmit={search}><input placeholder="Roll number" value={roll} onChange={(e) => setRoll(e.target.value)} /><button className="btn s">Search</button></form>
    {err && <p className="err">{err}</p>}{res.map((r, i) => <div className="panel" key={i}><b>{r.name}</b> · {r.roll_number}<p>{r.exam}<br />{r.block} › {r.floor} › Room {r.room}<br />Row {r.row}, Seat {r.seat_number}</p></div>)}</div>);
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { errMsg } from "../services/api";

export default function Register() {
  const { register } = useAuth(); const nav = useNavigate();
  const [f, setF] = useState({ full_name: "", email: "", password: "", confirm: "" });
  const [show, setShow] = useState(false); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setErr("");
    if (!f.full_name.trim()) return setErr("Full name is required.");
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setErr("Enter a valid email address.");
    if (f.password.length < 6) return setErr("Password must be at least 6 characters.");
    if (f.password !== f.confirm) return setErr("Passwords do not match.");
    setBusy(true);
    try { await register({ full_name: f.full_name, email: f.email, password: f.password }); nav("/dashboard"); }
    catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };
  return (
    <div className="auth"><form className="ac" onSubmit={submit}>
      <div className="logo">Exam<b>Seat</b></div>
      <h2>Create admin account</h2><p className="sub">Create your admin account to get started.</p>
      <label>Full name</label><input value={f.full_name} onChange={set("full_name")} />
      <label>Email</label><input type="email" value={f.email} onChange={set("email")} />
      <label>Password</label>
      <div className="pw"><input type={show ? "text" : "password"} value={f.password} onChange={set("password")} />
        <button type="button" onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button></div>
      <label>Confirm password</label><input type="password" value={f.confirm} onChange={set("confirm")} />
      <div className="err">{err}</div>
      <button className="btn" disabled={busy}>{busy ? "Creating…" : "Register"}</button>
      <p className="sub center">Have an account? <Link to="/login">Login</Link></p>
    </form></div>
  );
}

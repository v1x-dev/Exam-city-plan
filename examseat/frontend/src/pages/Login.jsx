import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { errMsg } from "../services/api";

export default function Login() {
  const { login } = useAuth(); const nav = useNavigate();
  const [f, setF] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr("");
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setErr("Enter a valid email address.");
    if (!f.password) return setErr("Password is required.");
    setBusy(true);
    try { await login(f.email, f.password); nav("/dashboard"); } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };
  return (
    <div className="auth"><form className="ac" onSubmit={submit}>
      <div className="logo">Exam<b>Seat</b></div>
      <h2>Welcome back</h2><p className="sub">Sign in to manage examination seating.</p>
      <label>Email</label><input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      <label>Password</label>
      <div className="pw"><input type={show ? "text" : "password"} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <button type="button" onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button></div>
      <div className="err">{err}</div>
      <button className="btn" disabled={busy}>{busy ? "Signing in…" : "Login"}</button>
      <p className="sub center">New here? <Link to="/register">Register</Link></p>
    </form></div>
  );
}

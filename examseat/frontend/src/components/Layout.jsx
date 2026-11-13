import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const items = [["/dashboard","▦","Overview"],["/students","👥","Students"],["/rooms","🏫","Rooms & Seats"],["/exams","📝","Examinations"],["/generate","⚙️","Generate Seating Plan"],["/find-seat","🔎","Find My Seat"]];
export default function Layout() {
  const { logout } = useAuth(); const nav = useNavigate();
  return (<div className="app"><aside className="side"><div className="logo">Exam<b>Seat</b></div>
    {items.map(([to, ic, l]) => <NavLink key={to} to={to}><span>{ic}</span>{l}</NavLink>)}
    <button onClick={async () => { await logout(); nav("/"); }}><span>↩</span>Logout</button></aside><main><Outlet /></main></div>);
}

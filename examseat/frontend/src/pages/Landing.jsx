import { Link } from "react-router-dom";
const F = [["👥","Student management","Add, import and export students, with duplicate roll numbers caught for you."],["🏫","Room configuration","Blocks, floors, rooms and individual seats with live capacity."],["📝","Examinations","Create examinations and avoid clashing schedules."],["⚙️","Smart seating","Seat every student exactly once across the rooms you choose."],["📄","Reports","Student-wise, room-wise and examination summaries."],["🔎","Find My Seat","Students look up their room and seat using a roll number."]];
const occ = new Set([2,3,4,5,8,9,10,11,14,15,16,17,19,20,21,22,23,25,26,27,28,29,30,33,34]);
export default function Landing() {
  return (<>
    <div className="wrap"><div className="nav"><Link to="/" className="logo">Exam<b>Seat</b></Link>
      <nav><a href="#top">Home</a><a className="hide" href="#features">Features</a><a className="hide" href="#about">About</a><Link to="/find-seat">Find My Seat</Link><Link className="btn s" to="/login">Login</Link></nav></div>
      <div className="hero" id="top"><div><h1>Examinations, Organised. Seating, Simplified.</h1>
        <p>Generate accurate examination seating arrangements in minutes. Manage students, organise examination rooms, and create smart seating plans — all from one simple platform.</p>
        <div className="grp"><Link className="btn" to="/register">Get Started</Link><a className="btn o" href="#features">Explore Features</a></div></div>
        <div className="board"><div className="top"><span>Room 201 · Block A</span><span>36 seats</span></div><div className="front">Front of room</div>
          <div className="sg" style={{ gridTemplateColumns: "repeat(6,1fr)" }}>{Array.from({ length: 36 }, (_, i) => <div key={i} className={"seat " + (i === 6 ? "broken" : i === 12 || i === 31 ? "reserved" : occ.has(i) ? "occupied" : "")} style={{ cursor: "default" }} />)}</div>
          <p className="muted" style={{ fontSize: 13, margin: "12px 0 0" }}>Green: occupied · Grey: vacant · Red: damaged · Orange: reserved</p></div></div></div>
    <section className="sec" id="features"><div className="wrap"><h2>Everything for exam day</h2><p>One workflow from student records to a printed seating plan.</p>
      <div className="feat">{F.map(([i, t, d]) => <div className="fc" key={t}><i>{i}</i><h3>{t}</h3><p>{d}</p></div>)}</div></div></section>
    <section className="sec" id="about"><div className="wrap"><h2>About ExamSeat</h2><p style={{ maxWidth: 640 }}>ExamSeat is a seating plan generator for college examination cells. It does one job well: placing every student in a valid seat exactly once, and showing the result clearly.</p></div></section>
    <footer><div className="wrap"><span>© 2026 ExamSeat · Smart Examination Seating Plan Generator</span><span>Built with React, Flask &amp; SQLite</span></div></footer></>);
}

export default function SeatGrid({ seats, cols, selected, onSelect }) {
  const cls = (s, i) => i === selected ? "sel" : s.roll_number ? "occupied" : s.status === "damaged" ? "broken" : s.status !== "available" ? "reserved" : "";
  return (<><div className="sg" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
    {seats.map((s, i) => <button key={i} className={"seat " + cls(s, i)} title={s.name || s.status}
      onClick={() => onSelect && onSelect(i)}>{s.roll_number ? s.roll_number.slice(-4) : i + 1}</button>)}</div>
    <p className="muted" style={{ fontSize: 13 }}>Green: occupied · Grey: available · Red: damaged · Orange: reserved/blocked · Purple: selected</p></>);
}

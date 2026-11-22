import { ProfilePic } from "../components/ProfilePic";
const doctors: { id: number; name: string; photo: string }[] = [];
export function Doctors() {
  return (<main>{doctors.length === 0 ? <div className="no-data"><p>目前沒有資料</p></div> : doctors.map((d) => <div key={d.id}><ProfilePic url={d.photo} />{d.name}</div>)}<hr style={{ border: 0, borderTop: "1px solid #ddd" }} /></main>);
}

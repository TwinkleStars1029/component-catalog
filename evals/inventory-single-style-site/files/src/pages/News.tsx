import { Card } from "../components/Card";
const news: string[] = [];
export function News() {
  return (<main>{news.length === 0 && <p style={{ color: "#999", textAlign: "center" }}>沒有資料</p>}{news.map((n) => <Card key={n}>{n}</Card>)}<div className="divider" /></main>);
}

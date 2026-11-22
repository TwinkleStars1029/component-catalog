import { UserAvatar } from "../components/UserAvatar";
import { Card } from "../components/Card";
export function Home() {
  return (<main><UserAvatar src="/doc.jpg" /><Card>門診時間</Card><hr className="sep" /><Card>最新消息</Card></main>);
}

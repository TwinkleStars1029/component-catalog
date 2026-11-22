const user = { name: "小安", photo: "/me.jpg" };
const posts: { id: number; title: string }[] = [];

export function Posts() {
  return (
    <main>
      <img className="avatar" src={user.photo} alt="" width={32} height={32} />
      <h1>所有文章</h1>
      {posts.length === 0 && <p className="empty">目前沒有文章喔！</p>}
      <ul>{posts.map((p) => <li key={p.id}>{p.title}</li>)}</ul>
    </main>
  );
}

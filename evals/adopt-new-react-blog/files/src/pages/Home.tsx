const user = { name: "小安", photo: "/me.jpg" };
const posts: { id: number; title: string }[] = [];

export function Home() {
  return (
    <main>
      <header>
        <img src={user.photo} alt="" width={48} height={48} style={{ borderRadius: "50%" }} />
        <h1>{user.name}的部落格</h1>
      </header>
      {posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: 32, color: "#888" }}>
          <svg width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#ccc" /></svg>
          <p>還沒有文章</p>
        </div>
      ) : (
        <ul>{posts.map((p) => <li key={p.id}>{p.title}</li>)}</ul>
      )}
    </main>
  );
}

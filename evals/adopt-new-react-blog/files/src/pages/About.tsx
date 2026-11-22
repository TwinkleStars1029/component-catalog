const user = { name: "小安", photo: "/me.jpg", bio: "寫程式也寫字。" };

export function About() {
  return (
    <main>
      <div className="profile">
        <img src={user.photo} alt={user.name} width={96} height={96} style={{ borderRadius: 12 }} />
        <p>{user.bio}</p>
      </div>
    </main>
  );
}

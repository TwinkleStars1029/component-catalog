import { Home } from "./pages/Home";
import { Posts } from "./pages/Posts";
import { About } from "./pages/About";

export function App({ page }: { page: "home" | "posts" | "about" }) {
  if (page === "posts") return <Posts />;
  if (page === "about") return <About />;
  return <Home />;
}

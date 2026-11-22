import { useVariant } from "../ui/slots";
export function Shop({ items }: { items: string[] }) {
  const { Avatar, Divider, EmptyState } = useVariant();
  return (<main><header><h1>商店</h1><Avatar name="小安" /></header><Divider />{items.length === 0 ? <EmptyState /> : <ul>{items.map((i) => <li key={i}>{i}</li>)}</ul>}</main>);
}

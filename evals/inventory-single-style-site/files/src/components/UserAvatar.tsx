export function UserAvatar({ src, size = 40 }: { src: string; size?: number }) {
  return <img src={src} alt="" width={size} height={size} style={{ borderRadius: "50%" }} />;
}

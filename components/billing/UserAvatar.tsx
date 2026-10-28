type Props = { user: { id: string; name: string; avatar?: string | null }; size?: number };

/** The person's Discord profile picture, or their initial when they have none (or it fails to load). */
export function UserAvatar({ user, size = 28 }: Props) {
  const style = { width: size, height: size, fontSize: size * 0.42 };
  return user.avatar ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="user-avatar"
      style={style}
      src={`https://cdn.discordapp.com/avatars/${encodeURIComponent(user.id)}/${encodeURIComponent(user.avatar)}.png?size=64`}
      alt=""
      width={size}
      height={size}
      referrerPolicy="no-referrer"
    />
  ) : (
    <span className="user-avatar" style={style} aria-hidden="true">
      {user.name.slice(0, 1).toUpperCase()}
    </span>
  );
}

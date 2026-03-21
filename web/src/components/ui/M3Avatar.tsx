interface M3AvatarProps {
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  sm: 'w-8 h-8 text-[12px]',
  md: 'w-10 h-10 text-[14px]',
  lg: 'w-14 h-14 text-[20px]',
};

function getInitial(name?: string): string {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
}

function hashColor(name?: string): string {
  if (!name) return 'bg-m3-primary';
  const colors = [
    'bg-violet-600', 'bg-blue-600', 'bg-emerald-600',
    'bg-amber-600', 'bg-rose-600', 'bg-cyan-600', 'bg-fuchsia-600',
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

export default function M3Avatar({ name, src, size = 'md', className = '' }: M3AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`${SIZE_MAP[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${SIZE_MAP[size]} ${hashColor(name)} text-white rounded-full
        flex items-center justify-center font-bold shrink-0 ${className}`}
    >
      {getInitial(name)}
    </div>
  );
}

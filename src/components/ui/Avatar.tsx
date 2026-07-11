import React from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  role?: 'player' | 'coach' | 'organization';
}

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

const roleGradients = {
  player: 'from-blue-500 to-cyan-400',
  coach: 'from-emerald-500 to-teal-400',
  organization: 'from-orange-500 to-amber-400',
};

const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
  role = 'player',
}) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  const gradient = roleGradients[role] || roleGradients.player;

  return (
    <div
      className={`${sizeMap[size]} rounded-xl overflow-hidden flex-shrink-0 ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to initial on broken image
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div
          className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
        >
          <span className="font-black text-white">{initial}</span>
        </div>
      )}
    </div>
  );
};

export default Avatar;

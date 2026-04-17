import { useEffect, useState } from 'react';
import { useMotionValue, useTransform, animate } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface ProfileStatsBarProps {
  momentsCount: number;
  followingCount: number;
  followersCount: number;
  userId?: string | number;
}

const RollingNumber = ({ value, duration = 1.5 }: { value: number; duration?: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    if (latest >= 10000) {
      return (latest / 10000).toFixed(1) + 'w+';
    }
    return Math.floor(latest).toString();
  });

  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    const controls = animate(count, value, {
      duration,
      ease: "easeOut"
    });

    const unsubscribe = rounded.on("change", (v) => setDisplayValue(v));

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, duration, count, rounded]);

  return <span>{displayValue}</span>;
};

export default function ProfileStatsBar({
  momentsCount,
  followingCount,
  followersCount,
  userId
}: ProfileStatsBarProps) {
  const navigate = useNavigate();

  const stats = [
    { label: '瞬间', value: momentsCount, path: null },
    { label: '关注', value: followingCount, path: userId ? `/user/${userId}/following` : '#' },
    { label: '粉丝', value: followersCount, path: userId ? `/user/${userId}/followers` : '#' },
  ];

  return (
    <div className="flex items-center gap-8 py-2">
      {stats.map((stat) => (
        <div
          key={stat.label}
          onClick={() => stat.path && navigate(stat.path)}
          className={`flex flex-col items-center min-w-[3rem] ${stat.path ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
        >
          <span className="text-white font-bold text-lg">
            <RollingNumber value={stat.value} />
          </span>
          <span className="text-gray-500 text-xs mt-0.5">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}

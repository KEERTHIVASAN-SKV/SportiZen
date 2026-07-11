import React from 'react';

interface SkeletonCardProps {
  type?: 'post' | 'profile' | 'event' | 'stat';
  count?: number;
}

const PostSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-xl skeleton" />
      <div className="flex-1 space-y-2">
        <div className="h-4 skeleton rounded-lg w-32" />
        <div className="h-3 skeleton rounded-lg w-24" />
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-4 skeleton rounded-lg w-full" />
      <div className="h-4 skeleton rounded-lg w-4/5" />
      <div className="h-4 skeleton rounded-lg w-3/5" />
    </div>
    <div className="h-48 skeleton rounded-xl mb-4" />
    <div className="flex gap-4">
      <div className="h-8 skeleton rounded-xl w-20" />
      <div className="h-8 skeleton rounded-xl w-20" />
    </div>
  </div>
);

const ProfileSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-14 h-14 rounded-xl skeleton" />
      <div className="flex-1 space-y-2">
        <div className="h-4 skeleton rounded-lg w-28" />
        <div className="h-3 skeleton rounded-lg w-20" />
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-3 skeleton rounded-lg w-full" />
      <div className="h-3 skeleton rounded-lg w-3/4" />
    </div>
    <div className="h-8 skeleton rounded-xl w-full" />
  </div>
);

const EventSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
    <div className="h-44 skeleton" />
    <div className="p-5 space-y-3">
      <div className="h-5 skeleton rounded-lg w-3/4" />
      <div className="h-3 skeleton rounded-lg w-1/2" />
      <div className="h-3 skeleton rounded-lg w-2/3" />
      <div className="h-10 skeleton rounded-xl mt-4" />
    </div>
  </div>
);

const StatSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 animate-pulse flex items-center justify-between">
    <div className="space-y-2">
      <div className="h-3 skeleton rounded-lg w-20" />
      <div className="h-8 skeleton rounded-lg w-12" />
    </div>
    <div className="w-12 h-12 skeleton rounded-xl" />
  </div>
);

const componentMap = {
  post: PostSkeleton,
  profile: ProfileSkeleton,
  event: EventSkeleton,
  stat: StatSkeleton,
};

const SkeletonCard: React.FC<SkeletonCardProps> = ({ type = 'post', count = 1 }) => {
  const Component = componentMap[type];
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </>
  );
};

export default SkeletonCard;

"use client";

type Star = {
  id: number;
  left: string;
  top: string;
  size: string;
  opacity: number;
  delay: string;
  duration: string;
};

const stars: Star[] = Array.from({ length: 110 }, (_, index) => {
  const x = Math.sin(index * 12.9898) * 43758.5453;
  const y = Math.sin(index * 78.233) * 24634.6345;
  const randomX = x - Math.floor(x);
  const randomY = y - Math.floor(y);
  const size = 2 + ((index * 7) % 10) / 10;

  return {
    id: index,
    left: `${(randomX * 100).toFixed(2)}%`,
    top: `${(randomY * 100).toFixed(2)}%`,
    size: `${size.toFixed(1)}px`,
    opacity: Number((0.25 + ((index * 13) % 60) / 100).toFixed(2)),
    delay: `${((index * 0.37) % 8).toFixed(2)}s`,
    duration: `${4 + ((index * 11) % 8)}s`,
  };
});

export default function StarfieldBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0">
        {stars.map((star) => (
          <span
            key={star.id}
            className="star-dot absolute rounded-full bg-zinc-700 dark:bg-white"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}
      </div>
    </div>
  );
}

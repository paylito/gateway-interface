import { useEffect, useMemo, useState } from "react";

type Props = {
  startDate: Date | string | number;
  endDate: Date | string | number;
  size?: number;
};

export default function Timer({ startDate, endDate, size = 32 }: Props) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(id);
  }, []);

  const start = useMemo(() => new Date(startDate).getTime(), [startDate]);

  const end = useMemo(() => new Date(endDate).getTime(), [endDate]);

  const progress = Math.max(0, Math.min(1, (now - start) / (end - start)));

  const strokeWidth = 2;
  const radius = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  const elapsedOffset = circumference - progress * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* remaining */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#6449ff"
        strokeWidth={strokeWidth}
      />

      {/* elapsed */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#dfddf3"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={elapsedOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

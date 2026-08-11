import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "../components";

function handRotation(date: Date) {
  const seconds = date.getSeconds();
  const minutes = date.getMinutes() + seconds / 60;
  const hours = (date.getHours() % 12) + minutes / 60;

  return {
    hour: hours * 30,
    minute: minutes * 6,
    second: seconds * 6,
  };
}

export function ClockPage() {
  const [now, setNow] = useState(() => new Date());
  const rotations = useMemo(() => handRotation(now), [now]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="grid gap-5 sm:gap-8">
      <PageHeader title="Clock" />

      <section
        aria-label="Analog clock"
        className="grid min-h-[calc(100vh-13rem)] place-items-center sm:min-h-[calc(100vh-16rem)]"
      >
        <div className="relative aspect-square w-full max-w-[min(82vw,28rem)] rounded-full border border-neutral-700 bg-neutral-900 shadow-2xl shadow-black/30">
          {Array.from({ length: 60 }, (_, index) => {
            const isHourMark = index % 5 === 0;
            return (
              <span
                aria-hidden="true"
                className="absolute inset-[3%]"
                key={index}
                style={{
                  transform: `rotate(${index * 6}deg)`,
                }}
              >
                <span
                  className={`absolute left-1/2 top-0 -translate-x-1/2 rounded-full ${
                    isHourMark
                      ? "h-[9%] w-0.5 bg-neutral-300"
                      : "h-[5%] w-px bg-neutral-600"
                  }`}
                />
              </span>
            );
          })}

          {Array.from({ length: 12 }, (_, index) => {
            const angle = index * 30;
            const label = index === 0 ? 12 : index;
            const radians = (angle * Math.PI) / 180;
            return (
              <span
                className="absolute left-1/2 top-1/2 text-sm font-semibold text-neutral-300 sm:text-base"
                key={label}
                style={{
                  left: `${50 + Math.sin(radians) * 36}%`,
                  top: `${50 - Math.cos(radians) * 36}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <span className="rounded-full bg-neutral-900 px-1.5 py-0.5">
                  {label}
                </span>
              </span>
            );
          })}

          <div
            className="absolute left-1/2 top-1/2 h-[26%] w-1 origin-bottom rounded-full bg-neutral-100"
            style={{
              transform: `translate(-50%, -100%) rotate(${rotations.hour}deg)`,
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-[36%] w-0.5 origin-bottom rounded-full bg-neutral-200"
            style={{
              transform: `translate(-50%, -100%) rotate(${rotations.minute}deg)`,
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-[39%] w-px origin-bottom rounded-full bg-primary-400"
            style={{
              transform: `translate(-50%, -100%) rotate(${rotations.second}deg)`,
            }}
          />
          <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary-300 bg-primary-500" />
        </div>
      </section>
    </div>
  );
}

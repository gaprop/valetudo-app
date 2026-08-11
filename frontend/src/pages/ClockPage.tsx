import { AnalogClock, PageHeader } from "../components";

export function ClockPage() {
  return (
    <div className="grid gap-5 sm:gap-8">
      <PageHeader title="Clock" />

      <section
        aria-label="Analog clock"
        className="grid min-h-[calc(100vh-13rem)] place-items-center sm:min-h-[calc(100vh-16rem)]"
      >
        <AnalogClock />
      </section>
    </div>
  );
}

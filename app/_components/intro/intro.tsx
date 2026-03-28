export default function Intro({
  title,
  animationClassName,
}: {
  title?: string;
  animationClassName?: string;
}) {
  return (
    <section
      className={`flex-row flex items-center md:justify-between mt-16 mb-16 md:mb-12 relative ${animationClassName ?? ""}`}
    >
      <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight md:pr-8">
        {title || "Readify."}
      </h1>
    </section>
  );
}


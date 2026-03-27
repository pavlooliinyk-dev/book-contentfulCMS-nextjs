import styles from "./intro.module.css";

export default function Intro({ title }: { title?: string }) {
  return (
    <section className={`flex-row flex items-center md:justify-between mt-16 mb-16 md:mb-12 relative ${styles.intro}`}>
      <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight md:pr-8">
        {title || "Readify."}
      </h1>
    </section>
  );
}

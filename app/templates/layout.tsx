export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="py-8 md:py-10">
      <div className="inline-block">{children}</div>
    </section>
  );
}

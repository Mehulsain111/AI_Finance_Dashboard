export default function SkeletonLoader({ lines = 4, className = "p-3" }) {
  const lineClasses = ["col-8", "col-12", "col-10", "col-6", "col-9", "col-11"];
  return (
    <div className={className}>
      <span className="visually-hidden">Loading…</span>
      {Array.from({ length: lines }).map((_, i) => (
        <p key={i} className="placeholder-glow mb-2">
          <span className={`placeholder ${lineClasses[i % lineClasses.length]} rounded-2`} />
        </p>
      ))}
    </div>
  );
}

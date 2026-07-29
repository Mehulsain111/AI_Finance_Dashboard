export default function EmptyState({ title = "No data", hint }) {
  return (
    <div className="d-flex h-100 w-100 flex-column align-items-center justify-content-center rounded-4 border border-dashed bg-body-tertiary p-4 text-center">
      <div className="d-flex align-items-center justify-content-center rounded-circle border bg-body shadow-sm" style={{ width: 40, height: 40 }}>
        <span className="text-body-secondary">*</span>
      </div>
      <div className="mt-3 fw-semibold">{title}</div>
      {hint ? (
        <div className="mt-2 small text-body-secondary" style={{ maxWidth: 360 }}>
          {hint}
        </div>
      ) : null}
    </div>
  );
}

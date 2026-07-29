import { cn } from "@/utils/cn";

export default function Card({ title, subtitle, actions, className, children }) {
  return (
    <section
      className={cn(
        "card app-card shadow-sm",
        className,
      )}
    >
      <div className="card-body p-4 p-sm-4">
        {(title || actions) && (
          <div className="mb-3 d-flex flex-column gap-3 flex-sm-row align-items-sm-start justify-content-sm-between">
            <div>
              {title ? (
                <h2 className="h6 mb-0 fw-semibold">{title}</h2>
              ) : null}
              {subtitle ? (
                <p className="mb-0 mt-1 small text-body-secondary">{subtitle}</p>
              ) : null}
            </div>
            {actions ? <div className="">{actions}</div> : null}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

import RoleSwitcher from "./RoleSwitcher";
import DarkModeToggle from "./DarkModeToggle";
import Button from "./Button";
import ProfileMenu from "./ProfileMenu";

export default function PageShell({ title, subtitle, onAddTransaction, children }) {
  return (
    <div className="min-vh-100">
      <header className="app-header sticky-top border-bottom">
        <div className="container-xxl py-3 py-lg-4">
          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-sm-between gap-3">
            <div>
              <h1 className="mb-1 fw-semibold fs-4 fs-lg-3">{title}</h1>
              <p className="mb-0 small text-body-secondary" style={{ maxWidth: 640 }}>
                {subtitle}
              </p>
            </div>

            <div className="d-flex flex-wrap align-items-center justify-content-sm-end gap-2">
              <ProfileMenu />
              <RoleSwitcher />
              <DarkModeToggle />
              {onAddTransaction ? (
                <Button onClick={onAddTransaction} variant="primary">
                  Add Transaction
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <main className="container-xxl py-4">{children}</main>
    </div>
  );
}

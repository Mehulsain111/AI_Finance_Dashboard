import DarkModeToggle from "./DarkModeToggle";
import Button from "./Button";
import ProfileMenu from "./ProfileMenu";
import LiveMarketTicker from "./LiveMarketTicker";

export default function PageShell({ title, subtitle, onAddTransaction, isMobile, children }) {
  return (
    <div className="min-vh-100">
      <header className="app-header sticky-top border-bottom">
        <div className="container-xxl py-2 py-lg-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 gap-sm-3">
            <div className="desktop-only">
              <h1 className="mb-1 fw-semibold fs-4 fs-lg-3 text-truncate">{title}</h1>
              <p className="mb-0 small text-body-secondary text-truncate" style={{ maxWidth: 640 }}>
                {subtitle}
              </p>
            </div>
            
            <div className="mobile-only d-flex align-items-center">
              <h1 
                className="mb-0 fw-bold fs-6 fs-sm-5 text-nowrap" 
                style={{
                  background: "linear-gradient(90deg, #60a5fa, #c084fc)",
                  WebkitBackgroundClip: "text", 
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "transparent",
                  textShadow: "0 2px 10px rgba(96, 165, 250, 0.2)"
                }}
              >
                AI Finance
              </h1>
            </div>

            <div className="d-flex align-items-center justify-content-end gap-2 gap-md-3 ms-auto">
              <ProfileMenu />
              <DarkModeToggle />
              <div className="desktop-only d-none d-md-block">
                {onAddTransaction ? (
                  <Button onClick={onAddTransaction} variant="primary">
                    Add Transaction
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Institutional Market Ticker Ribbon - Now available on Mobile */}
        <div className="w-100 border-bottom border-secondary border-opacity-10">
          <LiveMarketTicker />
        </div>
      </header>

      <main className="container-xxl py-4">{children}</main>
    </div>
  );
}

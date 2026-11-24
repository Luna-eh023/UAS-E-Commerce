// src/app/akun/layout.tsx
// Shared by every page under /akun: loads the CSS, the account data, the site header and the tab row.
import "../components/geboy/geboy.css";
import AccountProvider from "../components/geboy/AccountProvider";
import AccountTabs from "../components/geboy/AccountTabs";
import SiteHeader from "../components/geboy/SiteHeader";

export default function AkunLayout({ children }: { children: React.ReactNode }) {
  return (
    <AccountProvider>
      <div className="gb-shell">
        <SiteHeader />
        <main className="gb-main">
          <AccountTabs />
          {children}
        </main>
      </div>
    </AccountProvider>
  );
}

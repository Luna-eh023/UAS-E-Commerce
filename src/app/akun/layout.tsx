// src/app/akun/layout.tsx
// Shared by every page under /akun: loads the CSS, the account data and the tab row.
import "../components/geboy/geboy.css";
import AccountProvider from "../components/geboy/AccountProvider";
import AccountTabs from "../components/geboy/AccountTabs";

export default function AkunLayout({ children }: { children: React.ReactNode }) {
  return (
    <AccountProvider>
      <div className="gb-shell">
        <main className="gb-main">
          <AccountTabs />
          {children}
        </main>
      </div>
    </AccountProvider>
  );
}

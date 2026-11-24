// src/app/akun/layout.tsx
// Shared by every page under /akun: loads the CSS, the account data and the green top bar.
import "../components/geboy/geboy.css";
import AccountProvider from "../components/geboy/AccountProvider";
import GeboyHeader from "../components/geboy/GeboyHeader";

export default function AkunLayout({ children }: { children: React.ReactNode }) {
  return (
    <AccountProvider>
      <div className="gb-shell">
        <GeboyHeader />
        <main className="gb-main">{children}</main>
      </div>
    </AccountProvider>
  );
}

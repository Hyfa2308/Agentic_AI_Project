import Sidebar from "./Sidebar";
import Header from "./Header";

const AppShell = ({ children }) => {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main-wrapper">
        <Header />
        <main className="app-content-body">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;

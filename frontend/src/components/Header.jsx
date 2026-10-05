import { useLocation } from "react-router-dom";
import { FiSearch, FiBell, FiUser } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const location = useLocation();
  const { user } = useAuth();

  const titleMap = {
    "/app": "Dashboard",
    "/app/dashboard": "Dashboard",
    "/app/conversations": "Conversations",
    "/app/tickets": "Tickets",
    "/app/customers": "Customers",
    "/app/knowledge": "Knowledge Base",
    "/app/analytics": "Analytics",
    "/app/settings": "Settings",
    "/app/chat": "Web Chat",
    "/app/support": "Support Portal",
  };

  const pageTitle = titleMap[location.pathname] || "Helpdesk";

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="header-page-title">{pageTitle}</h1>
      </div>

      <div className="header-right">
        <div className="header-search">
          <FiSearch className="search-icon" />
          <input type="text" placeholder="Search tickets, customers, or knowledge..." />
        </div>

        <button className="header-btn-icon" title="Notifications">
          <FiBell />
          <span className="notif-badge" />
        </button>

        <div className="header-user-avatar" title={user?.email || "User Profile"}>
          <FiUser />
        </div>
      </div>
    </header>
  );
};

export default Header;

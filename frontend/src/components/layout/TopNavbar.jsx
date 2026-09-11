import { Bell, Search, ShieldCheck, User, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";

export default function TopNavbar({ user, logout }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="top-navbar">
      <div className="top-search">
        <Search size={18} />
        <input placeholder="Search logs, IOCs, incidents, users..." />
        <span>Ctrl + K</span>
      </div>

      <div className="top-actions">
        <div className="top-clock">
          <Clock3 size={16} />
          {time.toLocaleTimeString()}
        </div>

        <button className="top-icon">
          <Bell size={18} />
          <span className="notify-dot"></span>
        </button>

        <div className="top-user">
          <div className="user-avatar">
            <User size={18} />
          </div>

          <div>
            <strong>{user?.full_name}</strong>
            <p>{user?.role}</p>
          </div>
        </div>

        <button className="btn secondary" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}
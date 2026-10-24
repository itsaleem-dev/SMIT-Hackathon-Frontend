import { useEffect, useState } from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { MENUS } from "./menu.js";
import api from "../api/client.js";
import E from "../api/endpoints.js";

function Bell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = () =>
      api.get(E.notifications, { params: { unread: true } })
        .then(({ data }) => {
          const list = Array.isArray(data)
            ? data
            : data.notifications || data.data || [];
          if (alive) setCount(list.filter((n) => !n.read).length);
        })
        .catch(() => {});
    load();
    const t = setInterval(load, 60000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  return (
    <Link
      to="/notifications"
      className="relative rounded-lg p-2 hover:bg-slate-100"
      title="Notifications"
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white">
          {count}
        </span>
      )}
    </Link>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menu = MENUS[user.role] || [];

  const doLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen">
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 transform bg-slate-900 text-slate-200 transition md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center gap-2 px-4 text-lg font-bold text-white">
          <span className="rounded bg-teal-500 px-2 py-0.5 text-sm">HCM</span>{" "}
          Lite
        </div>
        <nav className="space-y-0.5 px-2 pb-4">
          {menu.map((m) => (
            <NavLink
              key={m.to + m.label}
              to={m.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm ${
                  isActive
                    ? "bg-teal-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              {m.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
          <button
            className="rounded-lg p-2 hover:bg-slate-100 md:hidden"
            onClick={() => setOpen(true)}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <Bell />
            <div className="text-right leading-tight">
              <div className="text-sm font-medium">
                {user.name || user.email}
              </div>
              <div className="text-xs capitalize text-slate-500">
                {user.role}
              </div>
            </div>
            <Link
              to="/change-password"
              className="btn-outline hidden sm:inline-flex"
            >
              Password
            </Link>
            <button onClick={doLogout} className="btn-outline">
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

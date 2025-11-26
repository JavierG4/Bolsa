// @ts-nocheck
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { apiFetch } from "../api";
import { getUserPatrimony } from "../api.ts"; 

// Icons
import { MessageSquare, Users, HelpCircle, Settings, History } from "lucide-react";

interface ProfileItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function Portfolio(): JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/Dashboard" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Watchlist", path: "/watchlist" },
    { name: "Wallet", path: "/wallet" },
  ];
  const [patrimony, setPatrimony] = useState<number | null>(null);

  useEffect(() => {
    getUserPatrimony()
      .then((value) => setPatrimony(value))
      .catch((err) => console.error("Error loading patrimony:", err));
  }, []);

    const [userName, setUserName] = useState<string>('');
    const [userEmail, setUserEmail] = useState<string>('');
    const [loadingUser, setLoadingUser] = useState<boolean>(false);
    const [errorUser, setErrorUser] = useState<string>('');
  
  const fetchUserProfile = async () => {
    setLoadingUser(true);
    try {
      const res = await apiFetch("/users", {
        method: 'GET'
      });
    
      if (!res.ok) {
        setErrorUser("Usuario no autenticado");
        setLoadingUser(false);
        return;
      }
    
      const data = await res.data;
      // console.log("User profile data:", data);
      setUserName(data.userName ?? "");
      setUserEmail(data.mail ?? "");
    } catch (err) {
      setErrorUser("Error de conexión con el servidor");
    } finally {
      setLoadingUser(false);
    }
  };

  const [assetsFollowed, setAssetsFollowed] = useState<string>('Loading...');

  const fetchUserAssetFollowed = async() => {
    setAssetsFollowed(true);
    try {
      const res = await apiFetch("/count",  {
        method: 'GET'
      });
      if (!res.ok) {
        console.error("Error al obtener assets seguidos del usuario");
      }
      const data = await res.data;
      setAssetsFollowed(data.count);
    } catch (err) {
      console.error("Error al obtener assets seguidos: ", err);
    } finally {
      setLoadingUser(false)
    }
  };
  
  
  // Obtener perfil al montar el componente
  useEffect(() => {
    fetchUserProfile();
    fetchUserAssetFollowed();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex relative">
      {/* SIDEBAR (DESKTOP) */}
      <aside className="hidden md:flex flex-col justify-between bg-black text-white w-64 p-6">
        <div>
          <h1 className="text-xl font-bold mb-8 text-green-400">Trading Web</h1>
          <nav className="space-y-3">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg transition ${
                    isActive
                      ? "bg-white text-black"
                      : "text-gray-300 hover:bg-gray-800"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* LOGOUT */}
        <NavLink
          to="/login"
          className="self-center text-gray-300 hover:text-white transition"
        >
          Logout
        </NavLink>
      </aside>

      {/* MOBILE TOP BAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-black text-white flex items-center justify-between px-4 py-3 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-2xl p-1"
            aria-label="Open menu"
          >
            ☰
          </button>

          <h1 className="text-xl font-bold text-green-400 flex-shrink-0">
            Trading Web
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium leading-none">{loadingUser ? "Loading..." : userName}</p>
            <p className="text-xs text-gray-400 leading-none">{userEmail}</p>
          </div>
        </div>
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR */}
      {mobileMenuOpen && (
        <aside className="fixed top-0 left-0 h-full w-64 bg-black text-white p-6 z-40 flex flex-col justify-between animate-slideIn">
          <nav className="space-y-4">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg transition ${
                    isActive
                      ? "bg-white text-black"
                      : "text-gray-300 hover:bg-gray-800"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          <NavLink
            to="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="text-gray-300 hover:text-white transition mt-4"
          >
            Logout
          </NavLink>
        </aside>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:ml-0 mt-16 md:mt-0">
        {/* HEADER DESKTOP */}
        <header className="hidden md:flex items-center justify-between gap-4 w-full mb-10">
          <h2 className="text-3xl font-semibold">Portfolio</h2>

          {/* Usuario */}
          <div className="flex items-center gap-3 pr-4">
            <div className="text-right">
              <p className="text-sm font-medium leading-none">
                {loadingUser ? "Loading..." : userName || "Not Logged User"}
              </p>
              <p className="text-xs text-gray-400 leading-none">
                {userEmail || (loadingUser ? "" : "@not logged")}
              </p>
            </div>
          </div>
        </header>

        {/* Spacer móvil */}
        <div className="md:hidden h-10 flex items-center justify-center px-4 mb-6">
        </div>

        {/* ---------- PAGE CONTENT ---------- */}

        {/* Header Section */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mt-4 text-gray-400">Personal</h2>
          <h3 className="text-3xl font-bold">{userName}</h3>
        </div>

        {/* Stats Section */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
          <div className="bg-green-500/20 rounded-2xl p-6 text-center shadow-lg">
            <p className="text-gray-400 mb-2">Patrimony</p>

            {patrimony === null ? (
              <p className="text-xl text-gray-400">Loading...</p>
            ) : (
              <p className="text-2xl font-bold">
                {patrimony.toLocaleString()} $
              </p>
            )}
          </div>
          <div className="bg-green-500/20 rounded-2xl p-6 text-center shadow-lg">
            <p className="text-gray-400 mb-2 flex justify-center items-center gap-2">
              <MessageSquare size={18} /> Messages
            </p>
            <p className="text-2xl font-bold">0</p>
          </div>

          <div className="bg-green-500/20 rounded-2xl p-6 text-center shadow-lg">
            <p className="text-gray-400 mb-2">Followed Stocks</p>
            <p className="text-2xl font-bold">{assetsFollowed}</p>
          </div>
        </section>

        {/* Profile Section */}
        <section className="mt-14">
          <h2 className="text-xl font-bold text-gray-400 mb-6">Profile</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ProfileItem
              icon={<Users size={28} />}
              title="Invite friends"
              description="Invite your friends and remove the ads for 7 days"
            />
            <ProfileItem
              icon={<History size={28} />}
              title="Transactions history"
              description="Check past transactions"
            />
            <ProfileItem
              icon={<HelpCircle size={28} />}
              title="Help"
              description="Frequently asked questions and more"
            />
            <ProfileItem
              icon={<Settings size={28} />}
              title="Settings"
              description="Personal data, security, sign out and more"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

/* ---------------- REUSABLE PROFILE ITEM ---------------- */

function ProfileItem({ icon, title, description }: ProfileItemProps): JSX.Element {
  return (
    <div className="flex items-start gap-4 bg-green-500/20 rounded-2xl p-5 shadow-md hover:bg-green-800 transition">
      <div className="text-white">{icon}</div>
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </div>
  );
}

// @ts-nocheck
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { apiFetch } from "../api";
import { getUserPatrimony } from "../api.ts";

// Transactions
export async function getUserTransactions() {
  return apiFetch("/transactions", { method: "GET" });
}

// Icons
import { MessageSquare, Users, HelpCircle, Settings, History } from "lucide-react";

interface ProfileItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

export default function Portfolio(): JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/Dashboard" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Watchlist", path: "/watchlist" },
    { name: "Wallet", path: "/wallet" },
  ];

  // General profile info
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [messages, setMessages] = useState([]);
  const [settingsId, setSettingsId] = useState(null);

  const [loadingUser, setLoadingUser] = useState(false);
  const [errorUser, setErrorUser] = useState("");

  // patrimony
  const [patrimony, setPatrimony] = useState<number | null>(null);

  useEffect(() => {
    getUserPatrimony()
      .then((value) => setPatrimony(value))
      .catch((err) => console.error("Error loading patrimony:", err));
  }, []);

  // ================================
  // FETCH USER
  // ================================
  const fetchUserProfile = async () => {
    setLoadingUser(true);
    try {
      const res = await apiFetch("/users", { method: "GET" });

      if (!res.ok) {
        setErrorUser("Usuario no autenticado");
        return;
      }

      const data = await res.data;

      setUserName(data.userName ?? "");
      setUserEmail(data.mail ?? "");
      setMessages(data.messages || []);
      setSettingsId(data.settings);
    } catch (err) {
      setErrorUser("Error de conexión con el servidor");
    } finally {
      setLoadingUser(false);
    }
  };

  const [assetsFollowed, setAssetsFollowed] = useState("Loading...");

  const fetchUserAssetFollowed = async () => {
    try {
      const res = await apiFetch("/count", { method: "GET" });
      const data = await res.data;
      setAssetsFollowed(data.count);
    } catch (err) {
      console.error("Error al obtener assets seguidos: ", err);
    }
  };

  // ================================
  // PROFILE DISPLAY SECTION CONTROL
  // ================================
  const [activeSection, setActiveSection] = useState(null);

  // ================================
  // TRANSACTIONS
  // ================================
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [errorTransactions, setErrorTransactions] = useState("");

  const fetchTransactions = async () => {
    setLoadingTransactions(true);
    setErrorTransactions("");

    try {
      const res = await getUserTransactions();

      if (!res.ok) {
        setErrorTransactions("No se pudieron cargar las transacciones");
      } else {
        const data = await res.data;
        setTransactions(data.transaction || []);
      }
    } catch (err) {
      setErrorTransactions("Error al conectar con el servidor");
    } finally {
      setLoadingTransactions(false);
    }
  };

  // ================================
  // SETTINGS
  // ================================
  const [userSettings, setUserSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [errorSettings, setErrorSettings] = useState("");

  const fetchSettings = async () => {
    if (!settingsId) {
      setErrorSettings("No settings ID found");
      return;
    }

    setLoadingSettings(true);
    setErrorSettings("");

    try {
      const res = await apiFetch(`/userSettings/${settingsId}`, { method: "GET" });

      if (!res.ok) {
        setErrorSettings("Could not load user settings");
      } else {
        const data = await res.data;
        setUserSettings(data);
      }
    } catch (err) {
      setErrorSettings("Error loading settings");
    } finally {
      setLoadingSettings(false);
    }
  };

  const updateSettings = async () => {
    if (!settingsId || !userSettings) return;

    try {
      const res = await apiFetch(`/userSettings/${settingsId}`, {
        method: "PATCH",
        body: JSON.stringify(userSettings),
      });

      if (!res.ok) alert("Error updating settings");
      else alert("Settings saved");
    } catch (err) {
      alert("Server error");
    }
  };

  // LOAD PROFILE AT START
  useEffect(() => {
    fetchUserProfile();
    fetchUserAssetFollowed();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex relative">

      {/* =======================================
          SIDEBAR (Desktop)
      ======================================= */}
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
                    isActive ? "bg-white text-black" : "text-gray-300 hover:bg-gray-800"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <NavLink
          to="/login"
          className="self-center text-gray-300 hover:text-white transition"
        >
          Logout
        </NavLink>
      </aside>

      {/* =======================================
          MOBILE TOP BAR — FIXED & CENTERED
      ======================================= */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-black text-white flex items-center justify-between px-4 py-4 z-20">

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="text-2xl p-1"
        >
          ☰
        </button>

        {/* CENTERED USER INFO */}
        <div className="flex flex-col items-center flex-grow text-center">
          <p className="text-sm font-medium">
            {loadingUser ? "Loading..." : userName}
          </p>
          <p className="text-xs text-gray-400">{userEmail}</p>
        </div>

      </div>

      {/* =======================================
          MOBILE SIDEBAR OVERLAY
      ======================================= */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* =======================================
          MOBILE SIDEBAR
      ======================================= */}
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
                    isActive ? "bg-white text-black" : "text-gray-300 hover:bg-gray-800"
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

      {/* =======================================
          MAIN CONTENT
      ======================================= */}
      <main className="flex-1 p-6 md:ml-0 mt-16 md:mt-0">

        {/* HEADER Desktop */}
        <header className="hidden md:flex items-center justify-between mb-10">
          <h2 className="text-3xl font-semibold">Portfolio</h2>
          <div className="text-right">
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-gray-400">{userEmail}</p>
          </div>
        </header>

        {/* PERSONAL */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-400">Personal</h2>
          <h3 className="text-3xl font-bold">{userName}</h3>
        </div>

        {/* STATS */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">

          {/* Patrimony */}
          <div className="bg-green-500/20 rounded-2xl p-6 text-center shadow-lg">
            <p className="text-gray-400 mb-2">Patrimony</p>
            {patrimony === null ? (
              <p className="text-xl text-gray-400">Loading...</p>
            ) : (
              <p className="text-2xl font-bold">{patrimony.toLocaleString()} $</p>
            )}
          </div>

          {/* Messages */}
          <ProfileItem
            icon={<MessageSquare size={28} />}
            title="Messages"
            description={`Messages (${messages.length})`}
            onClick={() => setActiveSection("messages")}
          />

          {/* Followed Stocks */}
          <div className="bg-green-500/20 rounded-2xl p-6 text-center shadow-lg">
            <p className="text-gray-400 mb-2">Followed Stocks</p>
            <p className="text-2xl font-bold">{assetsFollowed}</p>
          </div>
        </section>

        {/* PROFILE MENU */}
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
              onClick={() => {
                fetchTransactions();
                setActiveSection("transactions");
              }}
            />

            {/* REDIRECT TO HELP PAGE */}
            <NavLink to="/help">
              <ProfileItem
                icon={<HelpCircle size={28} />}
                title="Help"
                description="Frequently asked questions"
              />
            </NavLink>

            <ProfileItem
              icon={<Settings size={28} />}
              title="Settings"
              description="Personal settings"
              onClick={() => {
                fetchSettings();
                setActiveSection("settings");
              }}
            />

          </div>
        </section>

        {/* ==========================
            MESSAGES
        ========================== */}
        {activeSection === "messages" && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-400 mb-4">
              Your Messages ({messages.length})
            </h2>

            {messages.length === 0 ? (
              <p className="text-gray-300">No messages.</p>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className="bg-green-500/20 p-4 rounded-xl">
                    {msg}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==========================
            TRANSACTIONS
        ========================== */}
        {activeSection === "transactions" && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-400 mb-4">Transaction History</h2>

            {loadingTransactions && <p className="text-gray-300">Loading...</p>}
            {errorTransactions && <p className="text-red-400">{errorTransactions}</p>}

            {transactions.length > 0 && (
              <div className="space-y-4">
                {transactions.map((tx, i) => (
                  <div key={i} className="bg-green-500/20 p-4 rounded-xl">
                    <p><b>Asset:</b> {tx.assetSymbol}</p>
                    <p><b>Action:</b> {tx.actionType}</p>
                    <p><b>Shares:</b> {tx.shares}</p>
                    <p><b>Price:</b> {tx.price}$</p>
                    <p><b>Date:</b> {tx.date.day}-{tx.date.month}-{tx.date.year}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==========================
            SETTINGS
        ========================== */}
        {activeSection === "settings" && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-400 mb-6">User Settings</h2>

            {loadingSettings && <p className="text-gray-300">Loading settings...</p>}
            {errorSettings && <p className="text-red-400">{errorSettings}</p>}

            {userSettings && (
              <div className="bg-green-500/20 p-6 rounded-xl space-y-6">

                {/* CURRENCY */}
                <div>
                  <label className="block mb-1 text-gray-300">Currency</label>
                  <select
                    value={userSettings.currency}
                    className="bg-black border border-gray-700 p-2 rounded-lg"
                    onChange={(e) =>
                      setUserSettings({ ...userSettings, currency: e.target.value })
                    }
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                    <option value="BTC">BTC</option>
                  </select>
                </div>

                {/* NOTIFICATIONS */}
                <div>
                  <label className="block mb-1 text-gray-300">Notifications</label>
                  <input
                    type="checkbox"
                    checked={userSettings.notifications}
                    onChange={(e) =>
                      setUserSettings({
                        ...userSettings,
                        notifications: e.target.checked,
                      })
                    }
                  />
                  <span className="ml-2">Enable notifications</span>
                </div>

                {/* SAVE */}
                <button
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
                  onClick={updateSettings}
                >
                  Save changes
                </button>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

/* ================================================
   PROFILE ITEM (CORREGIDO PARA CENTRAR CONTENIDO)
================================================ */
function ProfileItem({ icon, title, description, onClick }: ProfileItemProps): JSX.Element {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer flex items-center gap-4 bg-green-500/20 rounded-2xl p-5 shadow-md hover:bg-green-800 transition"
    >
      <div className="text-white">{icon}</div>

      <div className="flex flex-col justify-center text-center w-full">
        <h3 className="font-semibold text-lg text-center">{title}</h3>
        <p className="text-gray-400 text-sm text-center">{description}</p>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Plus, MoreVertical, Edit } from "lucide-react";
import { apiFetch } from "../api";
import { getUserPatrimony } from "../api.ts"; 


const Wallet: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/Dashboard" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Watchlist", path: "/watchlist" },
    { name: "Wallet", path: "/wallet" },
  ];

  const coins = [
    { name: "Tether", symbol: "USDT", price: "$1.00", change: "+0.22%", changePositive: true, balance: "3,56,000", avgBuy: "$0.98", profit: "+$234" },
    { name: "Bitcoin", symbol: "BTC", price: "$26,735.59", change: "-5.12%", changePositive: false, balance: "233", avgBuy: "$22,456", profit: "-$234.80" },
    { name: "SushiSwap", symbol: "SUSHI", price: "$0.8802", change: "+0.6%", changePositive: true, balance: "10,45,688", avgBuy: "$0.8189", profit: "+$34.70" },
    { name: "SushiSwap", symbol: "SUSHI", price: "$0.8802", change: "+0.6%", changePositive: true, balance: "10,45,688", avgBuy: "$0.8189", profit: "+$34.70" },
    { name: "SushiSwap", symbol: "SUSHI", price: "$0.8802", change: "+0.6%", changePositive: true, balance: "10,45,688", avgBuy: "$0.8189", profit: "+$34.70" },
    { name: "SushiSwap", symbol: "SUSHI", price: "$0.8802", change: "+0.6%", changePositive: true, balance: "10,45,688", avgBuy: "$0.8189", profit: "+$34.70" },
    { name: "SushiSwap", symbol: "SUSHI", price: "$0.8802", change: "+0.6%", changePositive: true, balance: "10,45,688", avgBuy: "$0.8189", profit: "+$34.70" }
  ];

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
      setUserName(data.userName ?? "");
      setUserEmail(data.mail ?? "");
    } catch (err) {
      setErrorUser("Error de conexión con el servidor");
    } finally {
      setLoadingUser(false);
    }
  };

  const [walletAssets, setWalletAssets] = useState<any[]>([]);
  const [loadingAssets, setLoadingAssets] = useState<boolean>(false);
  const [errorAssets, setErrorAssets] = useState<string>('');

  const fetchUserWalletAssets = async () => {
    setLoadingAssets(true);
    try {
      const res = await apiFetch("/me/assets", {
        method: "GET"
      });
      if (!res.ok) {
        setErrorAssets("Error fetching wallet assets");
        setLoadingAssets(false);
        return;
      }
      const data = await res.data;
      setWalletAssets(data.assets || []);
    } catch (err) {
      setErrorAssets("Server connection error");
    } finally {
      setLoadingAssets(false);
    }
  };

  const [patrimony, setPatrimony] = useState<string | null>(null);
  const [loadingPatrimony, setLoadingPatrimony] = useState<boolean>(false);
  const [errorPatrimony, setErrorPatrimony] = useState<string>('');

  const fetchUserPatrimony = async () => {
    getUserPatrimony()
      .then((value) => setPatrimony(value))
      .catch((err) => setErrorPatrimony(err))
  }

  // Obtener datos al montar el componente
  useEffect(() => {
    fetchUserProfile();
    fetchUserWalletAssets();
    fetchUserPatrimony();
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
      <div className="md:hidden fixed top-0 left-0 right-0 bg-black text-white flex items-center gap-3 px-4 py-3 z-20">
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
        {/* HEADER (DESKTOP) */}
        <header className="hidden md:flex flex-wrap items-center gap-4 w-full mb-6">
          <h2 className="text-3xl font-semibold">Wallet</h2>

          {/* Buscador */}
          <div className="ml-auto w-full max-w-xs">
          </div>

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

        {/* Spacer móvil para evitar solapamiento con top bar */}
        <div className="md:hidden h-10 flex items-center justify-center px-4 mb-6">
          <h2 className="text-3xl font-semibold text-white text-center">Wallet</h2>
        </div>

        {/* Balance section */}
        <section className="bg-[#111] p-8 rounded-2xl mb-10">
          <p className="text-gray-400">Current balance</p>
          <h2 className="text-4xl font-bold mt-2">
            {patrimony === null ? (
              <p className="text-xl text-gray-400">Loading...</p>
            ) : (
              <p className="text-4xl font-bold mt-2">
                {patrimony.toLocaleString()} $
              </p>
            )}
          </h2>
        </section>

        {/* Holdings Table */}
        <section>
          <h2 className="text-xl font-semibold mb-6">Your holdings</h2>

          <div className="overflow-hidden rounded-2xl">
            <table className="w-full text-left bg-[#111]">
              <thead className="bg-[#161616] text-gray-400 text-sm">
                <tr>
                  <th className="py-4 px-4">Assets</th>
                  <th className="px-4">Price</th>
                  <th className="px-4">Type</th>
                  <th className="px-4">Quantity</th>
                  <th className="px-4">Avg buy Price</th>
                  <th className="px-4">Profit/Loss</th>
                  <th className="px-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {walletAssets.map((c, i) => (
                  <tr key={i} className="border-t border-gray-800 hover:bg-[#1a1a1a] transition">
                    <td className="py-4 px-4 flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-300 rounded-full" />
                      <span>{c.name}</span>
                      <small className="text-gray-400">{c.symbol}</small>
                    </td>
                    <td className="px-4">{"NoData"}</td>
                    <td className="px-4">{c.type.toUpperCase()}</td>
                    <td className="px-4">{c.quantity}</td>
                    <td className="px-4">{c.avgBuyPrice}</td>
                    <td className="px-4">{"NoData"}</td>
                    <td className="px-4">
                      <button className="p-2 hover:bg-white/10 rounded-full">
                        <MoreVertical />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Wallet;

import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { apiFetch } from "../api";


const Watchlist: React.FC = () => {
    const [assetInput, setAssetInput] = useState("");
    const [showAddInput, setShowAddInput] = useState(false);
    const [showRemoveInput, setShowRemoveInput] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/Dashboard" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Watchlist", path: "/watchlist" },
    { name: "Wallet", path: "/wallet" },
  ];
  const [showEditOptions, setShowEditOptions] = useState(false);

  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [loadingUser, setLoadingUser] = useState<boolean>(false);
  const [loadingWatchlist, setLoadingWatchlist] = useState<boolean>(false);
  const [errorWatchlist, setErrorWatchlist] = useState<string>('');
  const [watchlistSymbols, setWatchlistSymbols] = useState<Array<{name: string, symbol: string, type: string, price: number}>>([]);
  const [errorAddingSymbol, setErrorAddingSymbol] = useState<string>('');
  const [errorDeletingSymbol, setErrorDeletingSymbol] = useState<string>('');

  const fetchUserProfile = async () => {
    setLoadingUser(true);
    try {
      const res = await apiFetch("/users", {
        method: 'GET'
      });

      if (!res.ok) {
        console.error("Usuario no autenticado");
        setLoadingUser(false);
        return;
      }

      const data = await res.data;
      setUserName(data.userName ?? "");
      setUserEmail(data.mail ?? "");
    } catch (err) {
      console.error("Error de conexión con el servidor: ", err);
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchWatchlist = async() => {
    try {
      setLoadingWatchlist(true);
      const res = await apiFetch('/myWatchlist', { method: 'GET' });
      if (!res.ok) {
        setErrorWatchlist('Error fetching watchlist symbols');
        setLoadingWatchlist(false);
        return;
      }
      const data = await res.data;
      setLoadingWatchlist(false);
      setWatchlistSymbols(data.symbolValues);
      return
    }
    catch(err) {
      setErrorWatchlist('Error fetching watchlist symbols');
      return
    }
  }

  const fetchAddingSymbol = async(symbol: string) => {
    try {
      const res = await apiFetch('/addSymbol', {
        method: 'POST',
        body: JSON.stringify({ symbol: symbol }),
      });
      if (!res.ok) {
        setErrorAddingSymbol('Error adding symbol to watchlist');
        return;
      }
      setErrorAddingSymbol('');
      // Refresh watchlist
      fetchWatchlist();
    }
    catch(err) {
      setErrorAddingSymbol('Error adding symbol to watchlist');
      return;
    }
  }

  const fetchDeletingSymbol = async(symbol: string) => {
    try {
      const res = await apiFetch('/removeSymbol', {
        method: 'POST',
        body: JSON.stringify({ symbol: symbol }),
      });
      if (!res.ok) {
        setErrorAddingSymbol('Error adding symbol to watchlist');
        return;
      }
      setErrorDeletingSymbol('');
      // Refresh watchlist
      fetchWatchlist();
    }
    catch(err) {
      setErrorDeletingSymbol('Error deleting symbol from watchlist');
      return;
    }
  }

  // Obtener perfil al montar el componente
  useEffect(() => {
    fetchUserProfile();
    fetchWatchlist();
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
        {/* HEADER (DESKTOP) */}
        <header className="hidden md:flex flex-wrap items-center gap-4 w-full mb-6">
          <h2 className="text-3xl font-semibold">Watchlist</h2>

          {/* Buscador */}
          <div className="ml-auto w-full max-w-xs">
            <input
              placeholder="Search your coins..."
              className="bg-white/10 px-4 py-2 rounded-full text-sm placeholder-gray-400 w-full"
            />
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
          <h2 className="text-3xl font-semibold text-white text-center">Search</h2>
        </div>

        {/* MY COINS LIST */}
        <section className="bg-[#0d0d0d] rounded-xl p-6 shadow-xl">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
              Primary
            </span>
            <h3 className="text-2xl font-semibold">My coins list</h3>
            <button
              onClick={() => setShowEditOptions(!showEditOptions)}
              className="ml-auto bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition"
            >
              Edit
            </button>
            {showEditOptions && (
              <div className="absolute mt-2 bg-[#111] p-3 rounded-lg shadow-xl text-sm">
                <button className="text-red-400 hover:text-red-300">Delete list</button>
              </div>
            )}
            <button className="bg-green-500 text-black px-4 py-2 rounded-lg font-semibold">
              + New watchlist
            </button>
          </div>

          {/* Actions y formularios de añadir/eliminar */}
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center gap-3 mb-2">
              {/* Botón para mostrar input de añadir */}
              <button
                className="bg-green-500 text-black px-4 py-2 rounded-lg font-semibold"
                onClick={() => {
                  setShowAddInput((prev) => !prev);
                  setShowRemoveInput(false);
                }}
              >
                + Add asset
              </button>
              {/* Botón para mostrar input de eliminar */}
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold"
                onClick={() => {
                  setShowRemoveInput((prev) => !prev);
                  setShowAddInput(false);
                }}
              >
                - Remove asset
              </button>
              {/* Botón para recargar watchlist */}
              <button
                className="bg-gray-500 text-black px-4 py-2 rounded-lg font-semibold"
                onClick={() => {
                  setErrorAddingSymbol("");
                  setErrorWatchlist("");
                  fetchWatchlist();
                }}
              >
                Reload watchlist
              </button>
              <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition">
                Share
              </button>
              <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition">
                More
              </button>
            </div>
            {/* Input y confirmación para añadir */}
            {showAddInput && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={assetInput}
                    onChange={e => setAssetInput(e.target.value.toUpperCase())}
                    placeholder="Asset symbol (ej: AAPL)"
                    className="bg-white/10 px-4 py-2 rounded-lg text-black"
                  />
                  <button
                    className="bg-green-500 text-black px-4 py-2 rounded-lg font-semibold"
                    onClick={() => {
                      if (!assetInput) return;
                      fetchAddingSymbol(assetInput);
                      setAssetInput("");
                      setShowAddInput(false);
                    }}
                  >
                    Confirmar
                  </button>
                </div>
                {errorAddingSymbol && (
                  <div className="text-red-400 text-sm mt-1">{errorAddingSymbol}</div>
                )}
              </div>
            )}
            {/* Input y confirmación para eliminar */}
            {showRemoveInput && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={assetInput}
                    onChange={e => setAssetInput(e.target.value.toUpperCase())}
                    placeholder="Asset symbol (ej: AAPL)"
                    className="bg-white/10 px-4 py-2 rounded-lg text-black"
                  />
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold"
                    onClick={() => {
                      if (!assetInput) return;
                      fetchDeletingSymbol(assetInput);
                      setAssetInput("");
                      setShowRemoveInput(false);
                    }}
                  >
                    Confirmar
                  </button>
                </div>
                {errorDeletingSymbol && (
                  <div className="text-red-400 text-sm mt-1">{errorDeletingSymbol}</div>
                )}
              </div>
            )}
          </div>

          {/* WATCHLIST TABLE/STATUS */}
          <div className="overflow-x-auto mt-4">
            {loadingWatchlist ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : errorWatchlist ? (
              <div className="text-center py-8 text-red-400">{errorWatchlist}</div>
            ) : errorAddingSymbol ? (
              <div className="text-center py-8 text-red-400">{errorAddingSymbol}</div>
            ) : watchlistSymbols.length === 0 ? (
              <div className="text-center py-8 text-gray-400">La watchlist está actualmente vacía.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-gray-400 border-b border-white/5">
                  <tr>
                    <th className="py-3 text-left">#</th>
                    <th className="py-3 text-left">Name</th>
                    <th className="py-3 text-left">Symbol</th>
                    <th className="py-3 text-left">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {watchlistSymbols.map((item, idx) => (
                    <tr key={item.symbol} className="hover:bg-white/5 transition">
                      <td className="py-3">{idx + 1}</td>
                      <td className="py-3">{item.name}</td>
                      <td className="py-3">{item.symbol}</td>
                      <td className="py-3">${item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Watchlist;

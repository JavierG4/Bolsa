import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { getActionsData, PRICE_TIME } from "../services/alphadvantageAPI";
import { apiFetch } from "../api";


const Dashboard: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trendingData, setTrendingData] = useState<
    { symbol: string; changePercent: string }[]
  >([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterSymbol, setFilterSymbol] = useState<string>('');
  const [allUserHistory, setAllUserHistory] = useState<boolean>(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState<string>('');


  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Watchlist", path: "/watchlist" },
    { name: "Wallet", path: "/wallet" },
  ];

  const trendingSymbols = ["AAPL", "NVDA", "TSLA", "MSFT", "AMZN"];

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


  // Obtener perfil al montar el componente
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Función para buscar transacciones con filtros
  const handleSearchHistory = async () => {
    setLoadingHistory(true);
    try {
      if (allUserHistory) {
        const res = await apiFetch ('/transactions');
        if (res.ok) {
          const data = res.data;
          setHistoryData(data.transaction || []);
          setLoadingHistory(false);
        }
        else {
          setErrorHistory('Error fetching all user history');
          setLoadingHistory(false);
        }
      }
      else {
        let query: string = '/transactions?';
        const params = new URLSearchParams();
        if (filterType) {
          params.append('actionType', filterType);
        }
        if (filterDate) {
          const dates: string[] = filterDate.split('-'); // Formato YYYY-MM-DD
          if (dates.length === 3) {
            params.append('date', `${dates[2]}-${dates[1]}-${dates[0]}`); // Convertir a DD-MM-YYYY
          }
        }
        if (filterSymbol) {
          params.append('assetSymbol', filterSymbol);
        }
        if (params.toString().length === 0) {
          query = '/transactions';
        }
        else {
          query += params.toString();
        }
        const res = await apiFetch (query);
        if (res.ok) {
          const data = res.data;
          setHistoryData(data.transaction || []);
          setLoadingHistory(false);
        }
        else {
          setErrorHistory('Error fetching filtered history');
          setLoadingHistory(false);
        }
      }
    }
    catch(err) {
      setErrorHistory('Error fetching history');
      setLoadingHistory(false);
    }
  };

  // Search transaction on history
  useEffect(() => {
  async function fetchTrending() {
    const results: { symbol: string; changePercent: string }[] = [];
    for (const symbol of trendingSymbols) {
      try {
        const data = await getActionsData(PRICE_TIME.ACTUAL, symbol);
        console.log(`Datos de ${symbol}:`, data); // <-- log aquí
        const globalQuote = data?.["Global Quote"];
        if (globalQuote) {
          results.push({
            symbol,
            changePercent: globalQuote["10. change percent"],
          });
        } else {
          console.warn(`No se encontró Global Quote para ${symbol}`);
        }
      } catch (err) {
        console.error("Error fetching data for", symbol, err);
      }
    }
    setTrendingData(results);
  }

  fetchTrending();
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

        <input
          placeholder="Search your coins..."
          className="flex-1 bg-white/10 px-4 py-2 rounded-full text-sm placeholder-gray-400"
        />
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
          <h2 className="text-3xl font-semibold">Dashboard</h2>

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
          <h2 className="text-3xl font-semibold text-white text-center">Dashboard</h2>
        </div>

        {/* Trending */}
        <section className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#141414] p-4 rounded-xl">
            <h3 className="font-medium mb-4">🔥 Trending</h3>
            <div className="space-y-3 text-sm">
              {trendingData.length > 0 ? (
                trendingData.map((item) => {
                  const isPositive = item.changePercent.startsWith("-");
                  return (
                    <div
                      key={item.symbol}
                      className="flex justify-between"
                    >
                      <span>{item.symbol}</span>
                      <span className={isPositive ? "text-red-400" : "text-green-400"}>
                        {item.changePercent}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p>Cargando...</p>
              )}
            </div>
          </div>

          <div className="bg-[#141414] p-4 rounded-xl">
            <h3 className="font-medium mb-4">⏳ Recently added</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Pinoxa (PINO)</span>
                <span>$0.000314</span>
              </div>
              <div className="flex justify-between">
                <span>Stacks (STK)</span>
                <span>$0.0008765</span>
              </div>
              <div className="flex justify-between">
                <span>Symbol (SYB)</span>
                <span>$0.0000001239</span>
              </div>
            </div>
          </div>
        </section>

        {/* Top coins */}
        <section className="mb-6">
          <h3 className="text-xl font-medium mb-4">Top coins</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-200 to-green-500 rounded-2xl p-6 text-black">
              <p className="font-semibold">Compound</p>
              <p className="text-2xl font-bold">$27,308.00</p>
              <p className="text-sm mt-2">+8250% All time</p>
            </div>
            <div className="bg-[#111] rounded-2xl p-6">
              <p className="font-semibold">ShibaInu</p>
              <p className="text-2xl font-bold">$0.0008827</p>
              <p className="text-green-400 text-sm mt-2">+660910% All time</p>
            </div>
            <div className="bg-[#111] rounded-2xl p-6">
              <p className="font-semibold">ThetaFuel</p>
              <p className="text-2xl font-bold">$0.04276</p>
              <p className="text-red-400 text-sm mt-2">-151% All time</p>
            </div>
          </div>
        </section>

        {/* Add asset + History */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#111] rounded-xl p-6 space-y-4">
            <h3 className="text-xl font-medium mb-4">Add asset</h3>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Asset name:"
                className="w-full bg-white/5 px-4 py-2 rounded-lg"
              />
              <input
                type="text"
                placeholder="Amount:"
                className="w-full bg-white/5 px-4 py-2 rounded-lg"
              />
              <input
                type="text"
                placeholder="Average price:"
                className="w-full bg-white/5 px-4 py-2 rounded-lg"
              />
            </div>

            <button className="w-full bg-green-500 text-black py-3 rounded-xl font-semibold">
              Add
            </button>
          </div>

          <div className="bg-[#111] rounded-xl p-4 space-y-3 text-sm">
            <h3 className="text-xl font-medium mb-4">History</h3>
            
            {/* Filtros */}
            <div className="space-y-2 mb-4">
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-white/5 px-3 py-2 rounded-lg text-sm flex-1 text-white"
                >
                  <option value="" style={{ color: 'grey', fontWeight: 'bold' }}>All types</option>
                  <option value="BUY" style={{ color: 'grey', fontWeight: 'bold' }}>Buy</option>
                  <option value="SELL" style={{ color: 'grey', fontWeight: 'bold' }}>Sell</option>
                </select>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-white/5 px-3 py-2 rounded-lg text-sm flex-1"
                />
              </div>
              
              <input
                type="text"
                placeholder="Asset Symbol (e.g., AAPL)"
                value={filterSymbol}
                onChange={(e) => setFilterSymbol(e.target.value.toUpperCase())}
                className="w-full bg-white/5 px-3 py-2 rounded-lg text-sm placeholder-gray-500"
              />
              
              <label className="flex items-center gap-2 text-xs text-gray-400">
                <input
                  type="checkbox"
                  checked={allUserHistory}
                  onChange={(e) => setAllUserHistory(e.target.checked)}
                  className="rounded"
                />
                Show all user history
              </label>
              
              <button
                onClick={handleSearchHistory}
                className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 rounded-lg font-medium transition"
              >
                Search
              </button>
            </div>

            {/* Lista de transacciones */}
            {errorHistory && (
              <p className="text-center text-red-400 py-4">{errorHistory}</p>
            )}
            {loadingHistory ? (
              <p className="text-center text-gray-400 py-4">Loading...</p>
            ) : historyData.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {historyData.map((item, index) => (
                  <div key={index} className="flex justify-between items-center border-b border-white/5 pb-2">
                    <div className="flex flex-col">
                      <span className="font-medium">{item.assetSymbol}</span>
                      <span className="text-xs text-gray-400">
                        {item.date ? `${String(item.date.day).padStart(2, '0')}-${String(item.date.month).padStart(2, '0')}-${item.date.year}` : ''}
                        {item.actionType && ` • ${item.actionType}`}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={item.quantity >= 0 ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
                        {item.quantity >= 0 ? '+' : ''}${Math.abs(item.quantity).toFixed(2)}
                      </span>
                      {item.quantity && (
                        <div className="text-xs text-gray-400">{item.quantity} units</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-4">No transactions found</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;

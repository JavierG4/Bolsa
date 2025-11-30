import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { apiFetch } from "../api";


  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Watchlist", path: "/watchlist" },
    { name: "Wallet", path: "/wallet" },
  ];

// ------------------------------
// Servicios para comprar / vender
// ------------------------------

const buyAsset = async (symbol: string, quantity: number, price: number, type: string) => {
  return await apiFetch("/me/add", {
    method: "POST",
    body: JSON.stringify({
      symbol,
      quantity,
      avgBuyPrice: price,
      type,
    }),
  });
};

const sellAsset = async (symbol: string, quantity: number, price: number, type: string) => {
  return await apiFetch("/me/sell", {
    method: "POST",
    body: JSON.stringify({
      symbol,
      quantity,
      sellPrice: price,
      type,
    }),
  });
};


// ======================================================================
// DASHBOARD COMPLETO
// ======================================================================

const Dashboard: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [trendingData, setTrendingData] = useState<{ symbol: string; price: number }[]>([]);
  const [trendingCryptoData, setTrendingCryptoData] = useState<{ symbol: string; price: number }[]>([]);

  const [historyData, setHistoryData] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterSymbol, setFilterSymbol] = useState<string>("");
  const [allUserHistory, setAllUserHistory] = useState<boolean>(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [loadingUser, setLoadingUser] = useState<boolean>(false);

  // ======================================================================
  // GET USER PROFILE
  // ======================================================================

  const fetchUserProfile = async () => {
    setLoadingUser(true);
    try {
      const res = await apiFetch("/users", { method: "GET" });

      if (!res.ok) return;

      const data = await res.data;
      setUserName(data.userName ?? "");
      setUserEmail(data.mail ?? "");
    } catch (err) {
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // ======================================================================
  // HISTORY SEARCH
  // ======================================================================

  const handleSearchHistory = async () => {
    setLoadingHistory(true);
    try {
      if (allUserHistory) {
        const res = await apiFetch("/transactions");
        setHistoryData(res.ok ? res.data.transaction : []);
      } else {
        let query = "/transactions?";
        const params = new URLSearchParams();

        if (filterType) params.append("actionType", filterType);

        if (filterDate) {
          const [year, month, day] = filterDate.split("-");
          params.append("date", `${day}-${month}-${year}`);
        }

        if (filterSymbol) params.append("assetSymbol", filterSymbol);

        if (params.toString() !== "") query += params.toString();
        else query = "/transactions";

        const res = await apiFetch(query);
        setHistoryData(res.ok ? res.data.transaction : []);
      }
    } catch (err) {
      console.error("Error fetching history: ", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // ======================================================================
  // FETCH TRENDING STOCKS
  // ======================================================================

  useEffect(() => {
    async function fetchTrending() {
      const results: { symbol: string; price: number }[] = [];
      try {
        const res = await apiFetch("/all-data/top-assets", { method: "GET", credentials: "include" });

        if (res.ok) {
          const data = await res.data;
          for (const asset of data.stocks) {
            results.push({ symbol: asset.symbol, price: asset.price });
          }
        }
      } catch (err) {}

      setTrendingData(results);
    }

    fetchTrending();
  }, []);

  // ======================================================================
  // FETCH TRENDING CRYPTO
  // ======================================================================

  useEffect(() => {
    async function fetchTopCrypto() {
      const results: { symbol: string; price: number }[] = [];
      try {
        const res = await apiFetch("/all-data/top-crypto", { method: "GET", credentials: "include" });

        if (res.ok) {
          const data = await res.data;
          for (const asset of data.cryptos) {
            results.push({ symbol: asset.symbol, price: asset.price });
          }
        }
      } catch (err) {}

      setTrendingCryptoData(results);
    }

    fetchTopCrypto();
  }, []);

  // ======================================================================
  // MANAGE ASSET (BUY / SELL)
  // ======================================================================

  const [addSymbol, setAddSymbol] = useState("");
  const [addQuantity, setAddQuantity] = useState("");
  const [addPrice, setAddPrice] = useState("");
  const [addType, setAddType] = useState("stock");
  const [addAction, setAddAction] = useState("BUY");

  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  const handleAssetAction = async () => {
    setAddError("");
    setAddSuccess("");
    setAddLoading(true);

    try {
      let res;

      if (addAction === "BUY") {
        res = await buyAsset(addSymbol, Number(addQuantity), Number(addPrice), addType);
      } else {
        res = await sellAsset(addSymbol, Number(addQuantity), Number(addPrice), addType);
      }

      if (res.ok) {
        setAddSuccess(addAction === "BUY" ? "Asset bought successfully!" : "Asset sold successfully!");
        setAddSymbol("");
        setAddQuantity("");
        setAddPrice("");
      } else {
        setAddError(res.data?.error || "Error processing the request.");
      }
    } catch (err) {
      setAddError("Server error");
    }

    setAddLoading(false);
  };

  // ======================================================================
  // RECENTLY ADDED COINS
  // ======================================================================

  const [recentlyAdded, setRecentlyAdded] = useState<{ name: string; price: number }[]>([]);
  useEffect(() => {
    async function fetchRecentlyAdded() {
      const results: { name: string; price: number }[] = [];
      try {
        const res = await apiFetch("/me/recently-added", { method: "GET", credentials: "include" });

        if (res.ok) {
          const data = await res.data;
          for (const asset of data.assets) {
            results.push({ name: asset.name, price: asset.currentPrice ? asset.currentPrice : "NoData" });
          }
        }
      } catch (err) {}

      setRecentlyAdded(results);
    }

    fetchRecentlyAdded();
  }, []);
  


  // ======================================================================
  // RENDER
  // ======================================================================

  return (
    <div className="min-h-screen bg-black text-white flex relative">

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

      {/* MAIN */}
      <main className="flex-1 p-6 md:ml-0 mt-16 md:mt-0">

        {/* HEADER */}
        <header className="hidden md:flex flex-wrap items-center gap-4 w-full mb-6">
          <h2 className="text-3xl font-semibold">Dashboard</h2>

          <div className="ml-auto w-full max-w-xs">
            <input
              placeholder="Search your coins..."
              className="bg-white/10 px-4 py-2 rounded-full text-sm placeholder-gray-400 w-full"
            />
          </div>

          <div className="flex items-center gap-3 pr-4">
            <div className="text-right">
              <p className="text-sm font-medium leading-none">{loadingUser ? "Loading..." : userName}</p>
              <p className="text-xs text-gray-400 leading-none">{userEmail}</p>
            </div>
          </div>
        </header>

        {/* Trending */}
        <section className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#141414] p-4 rounded-xl">
            <h3 className="font-medium mb-4">🔥 Trending Stock Coins</h3>
            <div className="space-y-3 text-sm">
              {trendingData.length > 0 ? (
                trendingData.map((item) => (
                  <div key={item.symbol} className="flex justify-between">
                    <span>{item.symbol}</span>
                    <span className="font-semibold">${item.price}</span>
                  </div>
                ))
              ) : (
                <p>Cargando...</p>
              )}
            </div>
          </div>

          <div className="bg-[#141414] p-4 rounded-xl">
            <h3 className="font-medium mb-4">⏳ Recently added</h3>
            <div className="space-y-3 text-sm">
              {recentlyAdded.length === 0 ? (
                <p>No recently added coins</p>
              ) : (
                recentlyAdded.map((coin) => (
                  <div key={coin.name} className="flex justify-between">
                    <span>{coin.name}</span>
                    <span>${coin.price}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* TOP CRYPTO */}
        <section className="mb-6">
          <h3 className="text-xl font-medium mb-4">Top Crypto Coins</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {trendingCryptoData.map((crypto, index) => (
              <div
                key={crypto.symbol || index}
                className={`rounded-2xl p-6 ${
                  index === 0
                    ? "bg-gradient-to-br from-green-200 to-green-500 text-black"
                    : "bg-[#111] text-white"
                }`}
              >
                <p className="font-semibold">{crypto.symbol}</p>
                <p className="text-2xl font-bold">${crypto.price.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ADD / SELL */}
        <section className="grid md:grid-cols-2 gap-6">

          {/* Manage Asset */}
          <div className="bg-[#111] rounded-xl p-6 space-y-4">
            <h3 className="text-xl font-medium mb-4">Manage Asset</h3>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Asset symbol (AAPL)"
                value={addSymbol}
                onChange={(e) => setAddSymbol(e.target.value.toUpperCase())}
                className="w-full bg-white/5 px-4 py-2 rounded-lg"
              />

              <input
                type="number"
                placeholder="Quantity:"
                value={addQuantity}
                onChange={(e) => setAddQuantity(e.target.value)}
                className="w-full bg-white/5 px-4 py-2 rounded-lg"
              />

              <input
                type="number"
                placeholder="Price:"
                value={addPrice}
                onChange={(e) => setAddPrice(e.target.value)}
                className="w-full bg-white/5 px-4 py-2 rounded-lg"
              />

              <select
                value={addType}
                onChange={(e) => setAddType(e.target.value)}
                className="w-full bg-[#111] text-white px-4 py-2 rounded-lg border border-white/10"
              >
                <option className="bg-[#111] text-white" value="stock">Stock</option>
                <option className="bg-[#111] text-white" value="crypto">Crypto</option>
              </select>

              <select
                value={addAction}
                onChange={(e) => setAddAction(e.target.value)}
                className="w-full bg-[#111] text-white px-4 py-2 rounded-lg border border-white/10"
              >
                <option className="bg-[#111] text-white" value="BUY">Buy</option>
                <option className="bg-[#111] text-white" value="SELL">Sell</option>
              </select>
            </div>

            <button
              onClick={handleAssetAction}
              className="w-full bg-green-500 text-black py-3 rounded-xl font-semibold"
            >
              {addLoading ? (addAction === "BUY" ? "Buying..." : "Selling...") : addAction}
            </button>

            {addError && <p className="text-red-400 text-sm">{addError}</p>}
            {addSuccess && <p className="text-green-400 text-sm">{addSuccess}</p>}
          </div>

          {/* HISTORY */}
          <div className="bg-[#111] rounded-xl p-4 space-y-3 text-sm">
            <h3 className="text-xl font-medium mb-4">History</h3>

            <div className="space-y-2 mb-4">
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-[#111] text-white px-3 py-2 rounded-lg text-sm flex-1 border border-white/10"
                >
                  <option className="bg-[#111] text-white" value="">All types</option>
                  <option className="bg-[#111] text-white" value="BUY">Buy</option>
                  <option className="bg-[#111] text-white" value="SELL">Sell</option>
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
                placeholder="Asset Symbol (AAPL)"
                value={filterSymbol}
                onChange={(e) => setFilterSymbol(e.target.value.toUpperCase())}
                className="w-full bg-white/5 px-3 py-2 rounded-lg text-sm"
              />

              <label className="flex items-center gap-2 text-xs text-gray-400">
                <input
                  type="checkbox"
                  checked={allUserHistory}
                  onChange={(e) => setAllUserHistory(e.target.checked)}
                />
                Show all user history
              </label>

              <button
                onClick={handleSearchHistory}
                className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 rounded-lg"
              >
                Search
              </button>
            </div>

            {loadingHistory ? (
              <p className="text-center text-gray-400 py-4">Loading...</p>
            ) : historyData.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {historyData.map((item, index) => (
                  <div key={index} className="flex justify-between items-center border-b border-white/5 pb-2">
                    <div className="flex flex-col">
                      <span className="font-medium">{item.assetSymbol}</span>
                      <span className="text-xs text-gray-400">
                        {item.date &&
                          `${String(item.date.day).padStart(2, "0")}-${String(item.date.month).padStart(2, "0")}-${item.date.year}`}
                        {item.actionType && ` • ${item.actionType}`}
                      </span>
                    </div>

                    <div className="text-right">
                      <span
                        className={
                          item.actionType === "BUY"
                            ? "text-green-400 font-semibold"
                            : "text-red-400 font-semibold"
                        }
                      >
                        {item.quantity * item.price} USD
                      </span>
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

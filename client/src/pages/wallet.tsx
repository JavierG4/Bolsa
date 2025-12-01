import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { apiFetch } from "../api";
import { getUserPatrimony } from "../api.ts"; 

const Wallet: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // ESTADO DEL BUSCADOR
  const [searchTerm, setSearchTerm] = useState("");

  const navItems = [
    { name: "Dashboard", path: "/Dashboard" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Watchlist", path: "/watchlist" },
    { name: "Wallet", path: "/wallet" },
  ];

  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [loadingUser, setLoadingUser] = useState<boolean>(false);
  const [positiveBalance, setPositiveBalance] = useState<boolean>(true);
  
  const fetchUserProfile = async () => {
    setLoadingUser(true);
    try {
      const res = await apiFetch("/users", { method: 'GET' });
      if (!res.ok) {
        setLoadingUser(false);
        return;
      }
      const data = await res.data;
      setUserName(data.userName ?? "");
      setUserEmail(data.mail ?? "");
    } catch (err) {
      console.error("Error: ", err);
    } finally {
      setLoadingUser(false);
    }
  };

  const [walletAssets, setWalletAssets] = useState<any[]>([]);

  const fetchUserWalletAssets = async () => {
    try {
      const res = await apiFetch("/me/assets", { method: "GET" });
      if (!res.ok) return;
      const data = await res.data;
      setWalletAssets(data.assets || []);
    } catch (err) {
      console.error("Error: ", err);
    }
  };

  const [patrimony, setPatrimony] = useState<string | null>(null);

  const fetchUserPatrimony = async () => {
    getUserPatrimony()
      .then((value) => setPatrimony(value))
      .catch((err) => console.log("Error: ", err))
  }

  // Obtener datos al montar (API FETCH DENTRO DEL USE EFFECT)
  useEffect(() => {
    fetchUserProfile();
    fetchUserWalletAssets();
    fetchUserPatrimony();
  }, []); 

  // LÓGICA DE FILTRADO (FUERA DEL USE EFFECT)
  const filteredAssets = walletAssets.filter((asset) => {
    if (!searchTerm) return true;
    const termLower = searchTerm.toLowerCase();
    const nameMatch = asset.name?.toLowerCase().includes(termLower);
    const symbolMatch = asset.symbol?.toLowerCase().includes(termLower);
    return nameMatch || symbolMatch;
  });

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
                    isActive ? "bg-white text-black" : "text-gray-300 hover:bg-gray-800"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
        <NavLink to="/login" className="self-center text-gray-300 hover:text-white transition">
          Logout
        </NavLink>
      </aside>

      {/* MOBILE TOP BAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-black text-white flex items-center justify-between px-4 py-3 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(true)} className="text-2xl p-1">☰</button>
          <h1 className="text-xl font-bold text-green-400 flex-shrink-0">Trading Web</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium leading-none">{loadingUser ? "Loading..." : userName}</p>
            <p className="text-xs text-gray-400 leading-none">{userEmail}</p>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30" onClick={() => setMobileMenuOpen(false)} />
          <aside className="fixed top-0 left-0 h-full w-64 bg-black text-white p-6 z-40 flex flex-col justify-between animate-slideIn">
            <nav className="space-y-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg transition ${isActive ? "bg-white text-black" : "text-gray-300 hover:bg-gray-800"}`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>
            <NavLink to="/login" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white transition mt-4">
              Logout
            </NavLink>
          </aside>
        </>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:ml-0 mt-16 md:mt-0">
        {/* HEADER */}
        <header className="hidden md:flex flex-wrap items-center gap-4 w-full mb-6">
          <h2 className="text-3xl font-semibold">Wallet</h2>
          
          {/* BUSCADOR DESKTOP */}
          <div className="ml-auto w-full max-w-xs relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></span>
            <input 
              type="text"
              placeholder="Search by name or symbol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#161616] border border-gray-800 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-green-400 transition"
            />
          </div>

          <div className="flex items-center gap-3 pr-4">
            <div className="text-right">
              <p className="text-sm font-medium leading-none">{loadingUser ? "Loading..." : userName || "User"}</p>
              <p className="text-xs text-gray-400 leading-none">{userEmail || "@email"}</p>
            </div>
          </div>
        </header>

        {/* MOBILE HEADER SPACER */}
        <div className="md:hidden h-10 flex items-center justify-center px-4 mb-6">
          <h2 className="text-3xl font-semibold text-white text-center">Wallet</h2>
        </div>
        
        {/* BUSCADOR MOBILE */}
        <div className="md:hidden mb-6">
           <input 
              type="text"
              placeholder="Search asset..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#161616] border border-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-green-400 transition"
            />
        </div>

        {/* BALANCE */}
        <section className="bg-[#111] p-8 rounded-2xl mb-10">
          <p className="text-gray-400">Current balance</p>
          <h2 className="text-4xl font-bold mt-2">
            {patrimony === null ? (
              <p className="text-xl text-gray-400">Loading...</p>
            ) : (
              <p className="text-4xl font-bold mt-2">{patrimony.toLocaleString()} $</p>
            )}
          </h2>
        </section>

        {/* TABLE */}
        <section>
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-semibold">Your holdings</h2>
             {/* Indicador de cantidad encontrada */}
             {searchTerm && walletAssets.length > 0 && (
               <span className="text-sm text-gray-400">
                 Found {filteredAssets.length} assets
               </span>
             )}
          </div>

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
                  <th className="px-4">%</th>
                </tr>
              </thead>

              {/* AQUÍ ESTÁ LA CORRECCIÓN DE LA TABLA */}
              <tbody>
                {/* CASO 1: Cartera vacía (usuario nuevo o sin saldo) */}
                {walletAssets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      <p className="text-lg font-medium text-gray-300 mb-2">Your wallet is empty</p>
                      <p className="text-sm">You don't own any assets yet.</p>
                    </td>
                  </tr>
                ) : filteredAssets.length === 0 ? (
                  // CASO 2: Tiene activos pero la búsqueda no coincide
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                       No assets found matching "{searchTerm}"
                    </td>
                  </tr>
                ) : (
                  // CASO 3: Renderizado normal
                  filteredAssets.map((c, i) => {
                    const profitLoss = (c.price - c.avgBuyPrice) * c.quantity;
                    const colorClass = profitLoss >= 0 ? 'text-green-400' : 'text-red-400';
                    return (
                    <tr key={i} className="border-t border-gray-800 hover:bg-[#1a1a1a] transition">
                      <td className="py-4 px-4 flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-300 rounded-full" />
                        <span>{c.name}</span>
                        <small className="text-gray-400">{c.symbol}</small>
                      </td>
                      <td className="px-4">{c.price}</td>
                      <td className="px-4">{c.type.toUpperCase()}</td>
                      <td className="px-4">{c.quantity}</td>
                      <td className="px-4">{c.avgBuyPrice.toFixed(2)}</td>
                      <td className={`px-4 ${colorClass}`}>{((c.price - c.avgBuyPrice) * c.quantity).toFixed(2)}</td>
                      <td className={`px-4 ${colorClass}`}>{((c.price - c.avgBuyPrice) / c.avgBuyPrice * 100).toFixed(2)}%</td>
                    </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Wallet;
import React, { useState } from "react";
import { NavLink } from "react-router-dom";


const Search: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/Dashboard" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Watchlist", path: "/watchlist" },
    { name: "Search", path: "/search" },
  ];

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

        <img
          src="https://i.pravatar.cc/40"
          alt="Avatar"
          className="w-9 h-9 rounded-full object-cover"
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
          <h2 className="text-3xl font-semibold">Search</h2>

          {/* Buscador */}
          <div className="ml-auto w-full max-w-xs">
            <input
              placeholder="Search your coins..."
              className="bg-white/10 px-4 py-2 rounded-full text-sm placeholder-gray-400 w-full"
            />
          </div>

          {/* Usuario */}
          <div className="flex items-center gap-3 pr-4">
            <img
              src="https://i.pravatar.cc/40"
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="text-right">
              <p className="text-sm font-medium leading-none">Usuario</p>
              <p className="text-xs text-gray-400 leading-none">@usuario</p>
            </div>
          </div>
        </header>

        {/* Spacer móvil para evitar solapamiento con top bar */}
        <div className="md:hidden h-10 flex items-center justify-center px-4 mb-6">
          <h2 className="text-3xl font-semibold text-white text-center">Search</h2>
        </div>

        {/* Trending */}
        <section className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#141414] p-4 rounded-xl">
            <h3 className="font-medium mb-4">🔥 Trending</h3>
            <div className="space-y-3 text-sm">
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
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span>SushiSwap</span>
              <span className="text-green-400">+$345.90</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span>Akash</span>
              <span className="text-red-400">-$29.80</span>
            </div>
            <div className="flex justify-between">
              <span>Quorum</span>
              <span className="text-green-400">+$2,567.80</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Search;

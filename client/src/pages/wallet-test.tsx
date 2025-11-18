// wallet.tsx
// Full React component for the Wallet page based on the provided UI

import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Search, Bell, User, Plus, MoreVertical, Edit } from "lucide-react";

export default function Wallet() {
  const [search, setSearch] = useState("");

  const coins = [
    { name: "Tether", symbol: "USDT", price: "$1.00", change: "+0.22%", changePositive: true, balance: "3,56,000", avgBuy: "$0.98", profit: "+$234" },
    { name: "Bitcoin", symbol: "BTC", price: "$26,735.59", change: "-5.12%", changePositive: false, balance: "233", avgBuy: "$22,456", profit: "-$234.80" },
    { name: "SushiSwap", symbol: "SUSHI", price: "$0.8802", change: "+0.6%", changePositive: true, balance: "10,45,688", avgBuy: "$0.8189", profit: "+$34.70" },
    { name: "SushiSwap", symbol: "SUSHI", price: "$0.8802", change: "+0.6%", changePositive: true, balance: "10,45,688", avgBuy: "$0.8189", profit: "+$34.70" },
    { name: "SushiSwap", symbol: "SUSHI", price: "$0.8802", change: "+0.6%", changePositive: true, balance: "10,45,688", avgBuy: "$0.8189", profit: "+$34.70" },
    { name: "SushiSwap", symbol: "SUSHI", price: "$0.8802", change: "+0.6%", changePositive: true, balance: "10,45,688", avgBuy: "$0.8189", profit: "+$34.70" },
    { name: "SushiSwap", symbol: "SUSHI", price: "$0.8802", change: "+0.6%", changePositive: true, balance: "10,45,688", avgBuy: "$0.8189", profit: "+$34.70" }
  ];

  return (
    <div className="flex min-h-screen bg-black text-white">

      {/* Sidebar */}
      <aside className="w-64 bg-[#0f0f0f] p-6 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-green-400 mb-6">TRADING WEB</h2>

        <nav className="flex flex-col gap-4">
          <NavLink to="/dashboard" className="text-gray-400 hover:text-white">Dashboard</NavLink>
          <NavLink to="/search" className="text-gray-400 hover:text-white">Search</NavLink>
          <NavLink to="/wallet" className="text-white font-semibold bg-green-900/20 px-3 py-2 rounded-xl">Wallet</NavLink>
        </nav>

        <div className="mt-auto flex flex-col gap-3 text-gray-400">
          <button className="flex items-center gap-2 hover:text-white">
            <span>⟲</span> Logout
          </button>
          <button className="w-9 h-9 rounded-full bg-yellow-500" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">

        {/* Header */}
        <header className="flex items-center gap-4 mb-10">
          <h1 className="text-3xl font-semibold">Wallet</h1>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center bg-white/10 px-4 py-2 rounded-full">
              <Search size={18} className="text-gray-300" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your coins..."
                className="bg-transparent px-2 outline-none text-sm"
              />
            </div>
            <Bell className="text-gray-300" />
            <div className="w-10 h-10 bg-cover rounded-full" style={{ backgroundImage: "url('/profile.png')" }} />
            <span className="text-gray-300">Izan</span>
          </div>
        </header>

        {/* Balance section */}
        <section className="bg-[#111] p-8 rounded-2xl mb-10">
          <p className="text-gray-400">Current balance</p>
          <h2 className="text-4xl font-bold mt-2">$2,77,308.00</h2>
          <p className="text-red-400 mt-1">-$1200.78 (1.89%)</p>

          <div className="flex items-center gap-4 mt-6">
            <button className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl hover:bg-white/20 transition">
              <Edit size={18} /> Edit
            </button>
            <button className="flex items-center gap-2 bg-green-500 px-4 py-2 rounded-xl hover:bg-green-600 transition">
              <Plus size={18} /> Add transaction
            </button>
          </div>
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
                  <th className="px-4">24H</th>
                  <th className="px-4">Balance</th>
                  <th className="px-4">Avg buy</th>
                  <th className="px-4">Profit/Loss</th>
                  <th className="px-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {coins.map((c, i) => (
                  <tr key={i} className="border-t border-gray-800 hover:bg-[#1a1a1a] transition">
                    <td className="py-4 px-4 flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-300 rounded-full" />
                      <span>{c.name}</span>
                      <small className="text-gray-400">{c.symbol}</small>
                    </td>
                    <td className="px-4">{c.price}</td>
                    <td className={`px-4 ${c.changePositive ? "text-green-400" : "text-red-400"}`}>{c.change}</td>
                    <td className="px-4">{c.balance}</td>
                    <td className="px-4">{c.avgBuy}</td>
                    <td className="px-4">{c.profit}</td>
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
}

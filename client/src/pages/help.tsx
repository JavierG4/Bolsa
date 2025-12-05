// @ts-nocheck
import React from "react";
import { NavLink } from "react-router-dom";

export default function Help(): JSX.Element {
  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* Header */}
      <header className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold text-green-400">Help & FAQ</h1>

        <NavLink
          to="/portfolio"
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
        >
          Back to Profile
        </NavLink>
      </header>

      <section className="space-y-8">

        {/* INTRO */}
        <div className="bg-green-500/20 p-6 rounded-xl">
          <p className="text-gray-300">
            Here you can find answers to the most common questions about using Trading Web.
            If you need further help, feel free to contact support.
          </p>
        </div>

        {/* FAQ LIST */}
        <div className="space-y-6">

          {/* 1 */}
          <div className="bg-green-500/20 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">📌 What is the Portfolio for?</h2>
            <p className="text-gray-300">
              Your portfolio allows you to track all your investments in one place:
              stocks, ETFs, cryptos, and more. You can see their evolution and total value.
            </p>
          </div>

          {/* 2 */}
          <div className="bg-green-500/20 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">📌 How does the Watchlist work?</h2>
            <p className="text-gray-300">
              The watchlist lets you follow assets you are interested in but haven't
              invested in yet. You will see their price changes and details easily.
            </p>
          </div>

          {/* 3 */}
          <div className="bg-green-500/20 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">📌 What can I see in the Dashboard?</h2>
            <p className="text-gray-300">
              The dashboard shows an overall summary of your performance and helpful
              statistics about your portfolio and watchlist.
            </p>
          </div>

          {/* 4 */}
          <div className="bg-green-500/20 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">📌 What is the message section?</h2>
            <p className="text-gray-300">
              Messages notify you about updates, alerts, and personalized information
              related to your investments or account activity.
            </p>
          </div>

          {/* 5 */}
          <div className="bg-green-500/20 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">📌 What are Settings used for?</h2>
            <p className="text-gray-300">
              In Settings, you can change your preferred currency, enable or disable
              notifications, and update your experience in the app.
            </p>
          </div>

          {/* 6 */}
          <div className="bg-green-500/20 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">📌 Can I simulate investments?</h2>
            <p className="text-gray-300">
              Yes! You can use the simulation feature to test strategies, check potential
              outcomes, or compare portfolio performance without risking real money.
            </p>
          </div>

          {/* 7 */}
          <div className="bg-green-500/20 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">📌 Why can't I see my patrimony?</h2>
            <p className="text-gray-300">
              Make sure you have added assets to your portfolio. The patrimony will update
              automatically based on your investments.
            </p>
          </div>

          {/* 8 */}
          <div className="bg-green-500/20 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">📌 How are transactions recorded?</h2>
            <p className="text-gray-300">
              Each time you buy or sell an asset, a transaction is stored and you can view
              your full history in the Transactions section.
            </p>
          </div>

          {/* 9 */}
          <div className="bg-green-500/20 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">📌 My watchlist doesn't update, why?</h2>
            <p className="text-gray-300">
              Prices depend on the external API. If the API does not respond, some values
              might temporarily not show updates.
            </p>
          </div>

          {/* 10 */}
          <div className="bg-green-500/20 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">📌 Can I remove assets from the watchlist?</h2>
            <p className="text-gray-300">
              Yes — simply click the remove button on any asset inside your watchlist to
              delete it immediately.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}

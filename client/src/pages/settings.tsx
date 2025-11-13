// @ts-nocheck
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";

// Make sure to install lucide-react: npm install lucide-react
import { MessageSquare, Users, HelpCircle, Settings, History } from "lucide-react";

interface ProfileItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function Portfolio(): JSX.Element {
  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-5xl mb-10">
        <h1 className="text-2xl font-bold text-gray-400">Portfolio</h1>
        <h2 className="text-xl font-semibold mt-4 text-gray-400">Personal</h2>
        <h3 className="text-3xl font-bold">Javier Gonzalez Brito</h3>
      </header>

      {/* Stats Section */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-5xl">
        <div className="bg-gray-900 rounded-2xl p-6 text-center shadow-lg">
          <p className="text-gray-400 mb-2">Patrimony</p>
          <p className="text-2xl font-bold">100.000 $</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 text-center shadow-lg">
          <p className="text-gray-400 mb-2 flex justify-center items-center gap-2">
            <MessageSquare size={18}/> Messages
          </p>
          <p className="text-2xl font-bold">0</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 text-center shadow-lg">
          <p className="text-gray-400 mb-2">Followed Stocks</p>
          <p className="text-2xl font-bold">4</p>
        </div>
      </section>

      {/* Profile Section */}
      <section className="w-full max-w-5xl mt-14">
        <h2 className="text-xl font-bold text-gray-400 mb-6">Profile</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ProfileItem
            icon={<Users size={28}/>}
            title="Invite friends"
            description="Invite your friends and remove the ads for 7 days"
          />
          <ProfileItem
            icon={<History size={28}/>}
            title="Transactions history"
            description="Check past transactions"
          />
          <ProfileItem
            icon={<HelpCircle size={28}/>}
            title="Help"
            description="Frequently asked questions and more"
          />
          <ProfileItem
            icon={<Settings size={28}/>}
            title="Settings"
            description="Personal data, security, sign out and more"
          />
        </div>
      </section>
    </div>
  );
}

function ProfileItem({ icon, title, description }: ProfileItemProps): JSX.Element {
  return (
    <div className="flex items-start gap-4 bg-gray-900 rounded-2xl p-5 shadow-md hover:bg-gray-800 transition">
      <div className="text-white">{icon}</div>
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </div>
  );
}

import React from "react";
import { Link } from "react-router-dom";

const Sitemap: React.FC = () => (
  <div className="max-w-xl mx-auto py-8 px-4">
    <h1 className="text-3xl font-bold mb-6">Sitemap</h1>
    <div className="space-y-6">

      {/* Public Links */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Public</h2>
        <div className="space-y-2 ml-2">
          <Link to="/public/universes" className="block text-blue-600 hover:underline">All Universes</Link>
          <Link to="/public/shows" className="block text-blue-600 hover:underline">All Shows</Link>
        </div>
      </div>

      {/* TV Shows Links */}
      <div>
        <h2 className="text-xl font-semibold mb-2">TV Shows</h2>
        <div className="space-y-2 ml-2">
          <Link to="/tv-shows" className="block text-purple-600 hover:underline">Dashboard</Link>
          <Link to="/tv-shows/my-shows" className="block text-purple-600 hover:underline">My Shows</Link>
          <Link to="/tv-shows/public-shows" className="block text-purple-600 hover:underline">Browse Shows</Link>
          <Link to="/tv-shows/public-universes" className="block text-purple-600 hover:underline">Public Universes</Link>
          <Link to="/tv-shows/private-universes" className="block text-purple-600 hover:underline">Private Universes</Link>
        </div>
      </div>

      {/* Finance Links */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Finance</h2>
        <div className="space-y-2 ml-2">
          <Link to="/finance" className="block text-green-600 hover:underline">Dashboard</Link>
          <Link to="/finance/transactions" className="block text-green-600 hover:underline">Transactions</Link>
          <Link to="/finance/wallets" className="block text-green-600 hover:underline">Wallets</Link>
          <Link to="/finance/categories" className="block text-green-600 hover:underline">Categories</Link>
          <Link to="/finance/transfers" className="block text-green-600 hover:underline">Transfers</Link>
          <Link to="/finance/budgets" className="block text-green-600 hover:underline">Budgets</Link>
          <Link to="/finance/reports" className="block text-green-600 hover:underline">Reports</Link>
          <Link to="/finance/settings" className="block text-green-600 hover:underline">Settings</Link>
          <Link to="/finance/credits" className="block text-green-600 hover:underline">Credits</Link>
        </div>
      </div>

      {/* Other Links */}
      <div>
        <h2 className="text-xl font-semibold mb-2">General</h2>
        <div className="space-y-2 ml-2">
          <Link to="/" className="block text-blue-600 hover:underline">Home</Link>
          <Link to="/profile" className="block text-blue-600 hover:underline">Profile</Link>
          <Link to="/settings" className="block text-blue-600 hover:underline">Settings</Link>
          <Link to="/login" className="block text-blue-600 hover:underline">Sign In</Link>
          <Link to="/signup" className="block text-blue-600 hover:underline">Sign Up</Link>
          <Link to="/privacy" className="block text-blue-600 hover:underline">Privacy Policy</Link>
          <Link to="/terms" className="block text-blue-600 hover:underline">Terms of Service</Link>
        </div>
      </div>
    </div>
  </div>
);

export default Sitemap;

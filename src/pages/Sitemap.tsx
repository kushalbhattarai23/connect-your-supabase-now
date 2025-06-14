
import React from "react";
import { Link } from "react-router-dom";

const Sitemap: React.FC = () => (
  <div className="max-w-xl mx-auto py-8 px-4">
    <h1 className="text-3xl font-bold mb-6">Sitemap</h1>
    <div className="space-y-2">
      <Link to="/" className="block text-blue-600 hover:underline">Home</Link>
      <Link to="/profile" className="block text-blue-600 hover:underline">Profile</Link>
      <Link to="/settings" className="block text-blue-600 hover:underline">Settings</Link>
      <Link to="/login" className="block text-blue-600 hover:underline">Sign In</Link>
      <Link to="/signup" className="block text-blue-600 hover:underline">Sign Up</Link>
      <Link to="/privacy" className="block text-blue-600 hover:underline">Privacy Policy</Link>
      <Link to="/terms" className="block text-blue-600 hover:underline">Terms of Service</Link>
    </div>
  </div>
);

export default Sitemap;

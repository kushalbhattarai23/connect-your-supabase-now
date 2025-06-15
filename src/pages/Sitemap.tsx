import React from "react";
import { Link } from "react-router-dom";
import { Tv } from "lucide-react";
import { Helmet } from "react-helmet-async";

const sitemapLinks = [
  {
    section: "Public",
    links: [
      {
        title: "All Universes",
        to: "/public/universes",
      },
      {
        title: "All Shows",
        to: "/public/shows",
      },
    ],
  },
  {
    section: "TV Shows",
    links: [
      {
        title: "Dashboard",
        to: "/tv-shows",
      },
      {
        title: "My Shows",
        to: "/tv-shows/my-shows",
      },
      {
        title: "Browse Shows",
        to: "/tv-shows/public-shows",
      },
      {
        title: "Public Universes",
        to: "/tv-shows/public-universes",
      },
      {
        title: "Private Universes",
        to: "/tv-shows/private-universes",
      },
    ],
  },
  {
    section: "Finance",
    links: [
      {
        title: "Dashboard",
        to: "/finance",
      },
      {
        title: "Transactions",
        to: "/finance/transactions",
      },
      {
        title: "Wallets",
        to: "/finance/wallets",
      },
      {
        title: "Categories",
        to: "/finance/categories",
      },
      {
        title: "Transfers",
        to: "/finance/transfers",
      },
      {
        title: "Budgets",
        to: "/finance/budgets",
      },
      {
        title: "Reports",
        to: "/finance/reports",
      },
      {
        title: "Settings",
        to: "/finance/settings",
      },
      {
        title: "Credits",
        to: "/finance/credits",
      },
    ],
  },
  {
    section: "General",
    links: [
      {
        title: "Home",
        to: "/",
      },
      {
        title: "Profile",
        to: "/profile",
      },
      {
        title: "Settings",
        to: "/settings",
      },
      {
        title: "Sign In",
        to: "/login",
      },
      {
        title: "Sign Up",
        to: "/signup",
      },
      {
        title: "Privacy Policy",
        to: "/privacy",
      },
      {
        title: "Terms of Service",
        to: "/terms",
      },
    ],
  },
];

const CardLink = ({ to, title }: { to: string; title: string }) => (
  <Link
    to={to}
    className="block group bg-white border border-blue-100 rounded-lg px-5 py-4 shadow-sm hover:shadow-md transition-shadow duration-200 mb-2 hover:border-blue-200"
  >
    <div className="flex items-center gap-2">
      <Tv className="w-5 h-5 text-blue-400 group-hover:text-blue-600" />
      <span className="font-semibold text-blue-700 group-hover:underline">{title}</span>
    </div>
    {/* Optionally add a description below the title if desired */}
  </Link>
);

const Sitemap: React.FC = () => (
  <>
    <Helmet>
      <title>Sitemap | Track Hub</title>
      <meta name="description" content="Explore all public and private pages and features in Track Hub." />
    </Helmet>
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Sitemap</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sitemapLinks.map((section) => (
          <div key={section.section}>
            <h2 className="text-xl font-semibold mb-3">{section.section}</h2>
            <div className="space-y-2">
              {section.links.map((link) => (
                <CardLink key={link.to} to={link.to} title={link.title} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </>
);

export default Sitemap;

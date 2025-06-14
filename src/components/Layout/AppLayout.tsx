
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background w-full relative">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 p-3 pt-16 sm:p-4 sm:pt-16 lg:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

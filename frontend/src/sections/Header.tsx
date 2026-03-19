import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const LidqxLogo = () => (
  <img src="/liqx.png" alt="LIDQX" className="h-9 md:h-10 w-auto" />
);

const navLinks = [
  { text: "Portfolio", path: '/' },
  { text: "Stake", path: '/swap' },
  { text: "Market", path: '/market' },
  { text: "Pools", path: '/pools' },
  { text: "Documentation", path: '/guide' }
];

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleClick = () => {
    navigate("/");
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-0/80 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-6 max-h-20 flex items-center justify-between h-20">
          
          {/* Left: Logo & Navigation */}
          <div className="flex items-center space-x-10">
            <div className="cursor-pointer transition-transform duration-300 hover:scale-[1.02]" onClick={handleClick}>
              <LidqxLogo />
            </div>

            {/* Separator */}
            <div className="hidden md:block w-px h-6 bg-white/10" />

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center space-x-2">
              {navLinks.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={index}
                    onClick={() => navigate(item.path)}
                    className={`text-sm font-medium tracking-wide transition-all duration-200 px-4 py-2 rounded-lg ${
                        isActive
                        ? "text-white bg-purple-500/15 border border-purple-500/25"
                        : "text-[#a09bb5] hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    {item.text}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Right: Wallet & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <ConnectButton showBalance={false} chainStatus="icon" />
            <button
              className="md:hidden p-2 text-[#a09bb5] hover:text-white"
              onClick={() => setIsDrawerOpen(true)}
            >
              <i className="fa-solid fa-bars text-lg" />
            </button>
          </div>
        </div>
      </header>

      {/* spacer to prevent layout overlap from fixed header */}
      <div className="h-20 w-full" />

      {/* Drawer section */}
      <div
        className={`fixed top-0 right-0 w-80 h-full bg-surface-1 border-l border-white/[0.06] shadow-2xl z-[100] transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-10">
            <div className="cursor-pointer" onClick={() => { handleClick(); setIsDrawerOpen(false); }}>
              <LidqxLogo />
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="text-[#a09bb5] hover:text-white p-2 text-xl transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col space-y-2">
            {navLinks.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={index}
                  onClick={() => { navigate(item.path); setIsDrawerOpen(false); }}
                  className={`text-left text-base font-medium transition-all duration-200 px-4 py-3 rounded-lg ${
                    isActive 
                      ? "text-white bg-purple-500/15 border border-purple-500/20" 
                      : "text-[#a09bb5] hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {item.text}
                </button>
              )
            })}
          </div>

          <div className="mt-auto pt-6 border-t border-white/[0.06] flex items-center space-x-6">
            <i className="fa-brands fa-github text-[#a09bb5] hover:text-purple-400 text-xl cursor-pointer transition-colors" />
            <i className="fa-brands fa-twitter text-[#a09bb5] hover:text-purple-400 text-xl cursor-pointer transition-colors" />
            <i className="fa-brands fa-discord text-[#a09bb5] hover:text-purple-400 text-xl cursor-pointer transition-colors" />
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}
    </>
  );
};

export default Header;

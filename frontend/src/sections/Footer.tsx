const LidqxLogo = () => (
  <img src="/liqx.png" alt="LIDQX" className="h-8 w-auto" />
);

const Footer = () => {
  return (
    <footer className="w-full bg-surface-0 border-t border-white/[0.06] mt-20">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4 mb-6 md:mb-0 cursor-pointer">
          <LidqxLogo />
          <div className="w-px h-5 bg-white/10" />
          <span className="text-[#a09bb5] text-sm tracking-wide">Professional DeFi Yield Infrastructure</span>
        </div>

        <div className="flex items-center space-x-8">
          <div className="flex space-x-6 text-sm font-medium">
            <button className="text-[#a09bb5] hover:text-white transition-colors duration-200">
              Terms
            </button>
            <button className="text-[#a09bb5] hover:text-white transition-colors duration-200">
              Privacy
            </button>
            <button className="text-[#a09bb5] hover:text-white transition-colors duration-200">
              Docs
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <span className="text-xs text-[#a09bb5]/60">© 2025 Lidqx. All rights reserved.</span>
          <div className="flex items-center space-x-5">
            <i className="fa-brands fa-github text-[#a09bb5]/60 hover:text-purple-400 text-sm cursor-pointer transition-colors" />
            <i className="fa-brands fa-twitter text-[#a09bb5]/60 hover:text-purple-400 text-sm cursor-pointer transition-colors" />
            <i className="fa-brands fa-discord text-[#a09bb5]/60 hover:text-purple-400 text-sm cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer;

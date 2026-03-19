const GlowBackground = () => {
  return (
    <div
      className="absolute max-md:hidden blur-[100px] w-[600px] h-[600px] rounded-full opacity-[0.07] 
      bg-gradient-to-r from-[#7c3aed] via-[#9333ea] to-[#a855f7] 
      blur-extreme animate-glowingCircle pointer-events-none"
    />
  );
};

export default GlowBackground;

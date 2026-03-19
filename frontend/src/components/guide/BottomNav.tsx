interface BottomNavProps {
  stage: number;
  totalSteps: number;
  goToStage: (stage: number) => void;
}

const stepLabels = [
  "Getting Started",
  "Vault Deposit",
  "Yield Tokenisation",
  "PT Strategy",
  "YT Strategy",
  "Yield Trading",
];

const BottomNav= ({ stage, totalSteps, goToStage }: BottomNavProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 bg-gray-900/90 backdrop-blur-sm p-4 flex justify-center">
      <div className="flex gap-4 overflow-x-auto overflow-y-visible scrollbar-hide snap-x snap-mandatory md:justify-center w-full max-w-7xl items-center">
        {Array.from({ length: totalSteps }).map((_, step) => (
          <button
            key={step}
            onClick={() => goToStage(step)}
            className="flex flex-col items-center gap-1 w-30 flex-shrink-0 snap-center py-1"
          >
            <div
              className={`w-9 h-9 flex items-center justify-center cursor-pointer rounded-lg font-bold font-saira transition mb-1 ${
                step === stage
                  ? "bg-blue-500 text-white shadow-lg scale-110"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {step}
            </div>

            <span
              className={`text-xs font-medium font-saira text-center ${
                step === stage ? "text-blue-400" : "text-gray-400"
              }`}
            >
              {stepLabels[step]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;

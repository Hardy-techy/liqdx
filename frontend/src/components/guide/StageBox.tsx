interface StageBoxProps {
  stage: number;
  name: string;
  desc: string;
  src?: string;
  goToStage?: (stage: number) => void;
}

const StageBox = ({ stage, name, desc, src, goToStage }: StageBoxProps) => {
  const handleClick = () => {
    goToStage?.(stage);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="
        text-left
        flex flex-col w-56 min-h-[220px] rounded-lg border border-white/20 
        bg-black/50 p-4 z-20
        transition-all duration-300 ease-out
        hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20
        hover:scale-105 hover:bg-black/70
        active:scale-95
        cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
      "
    >
      {/* Header */}
      <div className="flex items-center font-saira w-full mb-4">
        <div className="text-4xl font-semibold text-blue-400 w-10 text-center">
          {stage}
        </div>

        <div className="flex flex-col justify-between ml-1 leading-tight">
          <span className="text-xs uppercase text-gray-400 tracking-wider">
            Stage {stage}
          </span>
          <span className="text-sm font-semibold text-white tracking-wide">
            {name}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="flex-1 text-sm font-saira text-gray-300 mb-10">{desc}</div>

      {/* Image */}
      <div className="flex justify-center">
        {src ? (
          <img src={src} alt={name} className="max-h-40 object-contain" />
        ) : (
          <div className="h-20 w-full rounded-lg border border-white/10 bg-white/[0.03] flex items-center justify-center text-xs uppercase tracking-wider text-gray-400">
            No media
          </div>
        )}
      </div>
    </button>
  );
};

export default StageBox;

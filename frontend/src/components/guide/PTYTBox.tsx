interface PTYTBoxProps {
  index: number;
  title: string;      
  description: string; 
  src?: string;        
}

const PTYTBox = ({ index, title, description, src }: PTYTBoxProps) => {
  return (
    <div className="flex flex-col w-full rounded-lg border border-white/20 bg-gray-800/70 shadow-md hover:shadow-lg transition-all">
      {/* Header */}
      <div className="flex items-center w-full mb-6 px-4 py-4 rounded-t-lg bg-gray-700/80">
        <div className="text-4xl font-semibold font-saira text-blue-400 w-10 text-center">
          {index}
        </div>

        <div className="flex flex-col justify-between ml-2 leading-tight">
          <span className="text-xs uppercase text-gray-400 tracking-wider">
            {title}
          </span>
          <span className="text-sm font-semibold text-white tracking-wide">
            {description}
          </span>
        </div>
      </div>

      {/* Image */}
      <div className="flex justify-center p-5">
        {src ? (
          <img src={src} className="w-full rounded-lg object-contain" />
        ) : (
          <div className="h-24 w-full rounded-lg border border-white/10 bg-white/[0.03] flex items-center justify-center text-xs uppercase tracking-wider text-gray-400">
            No media
          </div>
        )}
      </div>
    </div>
  );
};

export default PTYTBox

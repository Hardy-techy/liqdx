import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Desktop Navigation Item
const NormalNavItem = ({ text, subMenu, isAqua, path }: { text: string; subMenu?: string[], isAqua: boolean, path: string }) => {
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    if (path) {
      navigate(path);
    }
  }

  return (
    <li 
      className="relative cursor-pointer"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleClick}
    >
      <div className="flex items-center hover:text-aqua-custom transition-colors duration-300">
        <span className={`${isAqua ? 'text-aqua-custom' : ''} text-[17px] font-saira`}>{text}</span>
        {subMenu && (
          <span className="ml-2 transition-transform duration-500">
            <i className="fa-solid fa-chevron-down"></i>
          </span>
        )}
      </div>

      {subMenu && (
        <div 
          className="absolute z-50 w-full"
          onMouseEnter={() => setIsHovering(true)}
        >
          <ul 
            className={`
              bg-dark-custom text-white-custom shadow-lg mt-2 min-w-[200px] 
              transition-all duration-300 ease-in-out
              ${isHovering ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
            `}
          >
            {subMenu.map((item, index) => (
              <li 
                key={index} 
                className="px-4 py-2 hover:bg-blue-custom transition-colors duration-300 font-semibold"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};

// Drawer Navigation Item
const DrawerNavItem = ({ text, subMenu, path }: { text: string; subMenu?: string[], path: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    if (path) {
      navigate(path);
    }
  }

  const toggleSubMenu = () => {
    if (subMenu) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <li className="w-full my-0 px-2">
      <div 
        className="flex justify-between items-center py-3  cursor-pointer border-b border-white/20"
        onClick={toggleSubMenu}
      >
        <span className={`${isOpen ? 'text-blue-custom' : 'text-white-custom'} font-bold`} onClick={handleClick}>{text}</span>
        {subMenu && (
          <div 
            className={`
              w-6 h-6 flex items-center justify-center bg-blue-500  transition-transform duration-500 ease-in-out
              ${isOpen ? 'rotate-90 bg-white' : 'rotate-0 bg-blue-500'}
            `}
          >
            <i className={`fa-solid fa-chevron-right ${isOpen ? 'text-black' : 'text-white'}`} />
          </div>
        )}
      </div>

      {subMenu && (
        <ul 
          className={`
            transition-all duration-500 ease-in-out overflow-hidden
            ${isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          {subMenu.map((item, index) => (
            <li 
              key={index} 
              className="py-2 cursor-pointer my-0 border-b border-white/20 transition-all duration-500 ease-in-out"
            >
              <span className='ml-10 font-semibold'>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

const NavItem = ({ 
  text, 
  subMenu, 
  isDrawer = false,
  isAqua = false,
  path
}: { 
  text: string, 
  subMenu?: string[], 
  isDrawer?: boolean,
  isAqua?: boolean,
  path: string
}) => {
  return isDrawer 
    ? <DrawerNavItem text={text} subMenu={subMenu} path={path}/>
    : <NormalNavItem text={text} subMenu={subMenu} isAqua={isAqua} path={path}/>;
};

export default NavItem;
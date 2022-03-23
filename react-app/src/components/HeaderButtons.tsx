import {useState, useEffect, useRef} from 'react';
import {useCurrentCreator} from '../Utils';
import {Link} from 'react-router-dom';
import {Button} from '../elements/button';
import ConnectOrSignup from './ConnectOrSignup';
import ProfileMenu from './ProfileMenu';

const HeaderButtons = () => {
  const {currentCreator} = useCurrentCreator();
  const [showSubmenu, setShowSubmenu] = useState<boolean>(false);
  const submenuRef = useRef<any>(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (submenuRef.current && !submenuRef.current.contains(event.target)) {
        setShowSubmenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [submenuRef]);
  return (
    <div className="hidden md:flex md:space-x-10 ml-auto">
      <Link to="/">
        <Button label="Home" theme="focused"></Button>
      </Link>
      <Link to="/creators">
        <Button label="Creators" theme="unfocused"></Button>
      </Link>
      {currentCreator && (
        <Link to="/subscribers">
          <Button label="Subscribers" theme="unfocused"></Button>
        </Link>
      )}
      <Link to="/upload">
        <Button label="Upload" theme="unfocused"></Button>
      </Link>

      <ConnectOrSignup
        onAvatarClick={() => {
          setShowSubmenu(!showSubmenu);
        }}
      />
      {showSubmenu && (
        <div
          className="absolute z-50 top-12 right-0 rounded-lg bg-white text-blue border-2 shadow-xl w-full max-w-sm py-5"
          ref={submenuRef}
        >
          <ProfileMenu />
        </div>
      )}
    </div>
  );
};

export default HeaderButtons;

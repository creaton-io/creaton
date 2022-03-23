import {Link} from 'react-router-dom';

interface LinkProps {
  to: string;
  label: string;
  onClick?: () => void;
}

const NavigationLink = ({to, label, onClick}: LinkProps) => {
  if (to)
    return (
      <Link to={to}>
        <div className="p-2 m-2 rounded-lg hover:bg-white hover:text-black">{label}</div>
      </Link>
    );
  else
    return (
      <a
        href=""
        onClick={(e) => {
          e.preventDefault();
          onClick && onClick();
        }}
      >
        <div className="p-2 hover:bg-white hover:text-black">{label}</div>
      </a>
    );
};

export default NavigationLink;

import { Link } from 'react-router-dom';
import './BackHomeButton.css';

export default function BackHomeButton() {
  return (
    <div>
      <Link className="back-to-home" to="/">
        主页
      </Link>
    </div>
  );
}

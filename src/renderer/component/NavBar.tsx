import { Link } from 'react-router-dom';
import './NavBar.css';

export default function TopNavbar() {
  return (
    <div className="navbar">
      <div className="navbar-item">
        <Link className="nav-link" to="/">
          主页
        </Link>
        {/* <Link className="nav-link" to="/infoDisplay"> */}
        {/*  数据分析 */}
        {/* </Link> */}
        <Link className="nav-link" to="/importExcel">
          导入表格
        </Link>
      </div>
      {/* Add more navbar items as needed */}
    </div>
  );
}

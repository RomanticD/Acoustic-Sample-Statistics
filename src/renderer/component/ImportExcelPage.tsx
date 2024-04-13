import BackHomeButton from './BackHomeButton';
import FileInputUtil from './FileInputUtil';
import './ImportExcelPage.css';
import TopNavbar from './NavBar';

export default function ImportExcelPage() {
  return (
    <div className="select-excel-page">
      <TopNavbar />
      <FileInputUtil />
    </div>
  );
}

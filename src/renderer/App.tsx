import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import icon from '../../assets/icon.svg';
import './App.css';
import FormModule from './component/main page/FormModule';
import InfoDisplay from './component/data analysis page/mathematical chart/InfoDisplay';
import { reformatDataToDisplay } from './util/DisplayUtil';
import WordScale from './component/main page/WordScale';
import { Question } from './model/QuestionModel';
import DigitalScale from './component/main page/DigitalScale';
import ImportExcelPage from './component/data analysis page/ImportExcelPage';
import TopNavBar from './component/others/NavBar';

const eg: Question = {
  sampleId: 1,
  numberOfEvaluations: 3,
};

function Root() {
  const [formData, setFormData] = useState(null);

  return (
    <div className="rootContainer">
      <TopNavBar />
      <div className="panel">
        <div className="left-panel">
          <div className="sub-item-inside-left-panel">
            <img className="icon-image" width="200" alt="icon" src={icon} />
          </div>
          <h1>噪声烦恼度评价与分析 v1.0.0</h1>
          <div className="sub-item-inside-left-panel">
            <a href="https://www.google.com" target="_blank" rel="noreferrer">
              <button type="button" className="submit-personal-info-button">
                <span role="img" aria-label="books">
                  🥳
                </span>
                <span> </span>
                Google
              </button>
            </a>
            <a
              href="https://github.com/RomanticD"
              target="_blank"
              rel="noreferrer"
            >
              <button type="button" className="submit-personal-info-button">
                <span role="img" aria-label="folded hands">
                  🍿
                </span>
                <span> </span>
                Github
              </button>
            </a>
          </div>

          <FormModule onSubmitData={setFormData} />
        </div>

        <div className="right-panel">
          <WordScale question={eg} />
          <WordScale question={eg} />
          <WordScale question={eg} />
          <WordScale question={eg} />
          <WordScale question={eg} />
          <DigitalScale question={eg} />
          {formData && (
            <InfoDisplay data={reformatDataToDisplay(formData)} count={1} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/ImportExcel" element={<ImportExcelPage />} />
        {/* <Route */}
        {/*  path="/infoDisplay" */}
        {/*  element={<InfoDisplay formData={getLinearRegressionResult([])} />} */}
        {/* /> */}
      </Routes>
    </Router>
  );
}

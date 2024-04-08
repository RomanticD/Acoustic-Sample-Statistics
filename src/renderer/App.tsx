import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import FormModule from './component/FormModule';
import InfoDisplay from './component/InfoDisplay';
// eslint-disable-next-line import/order
import { useState } from 'react';

function Root() {
  const [formData, setFormData] = useState(null);

  return (
    <div className="rootContainer">
      <div className="panel">
        <div className="left-panel">
          <div className="sub-item-inside-left-panel">
            <img width="200" alt="icon" src={icon} />
          </div>
          <h1>Acoustic Statistic Software</h1>
          <div className="sub-item-inside-left-panel">
            <a href="https://www.google.com" target="_blank" rel="noreferrer">
              <button type="button">
                <span role="img" aria-label="books">
                  📚
                </span>
                Google
              </button>
            </a>
            <a href="https://www.baidu.com" target="_blank" rel="noreferrer">
              <button type="button">
                <span role="img" aria-label="folded hands">
                  🙏
                </span>
                Baidu
              </button>
            </a>
          </div>

          <FormModule onSubmitData={setFormData} />
        </div>

        <div className="right-panel">
          {formData && <InfoDisplay formData={formData} />}
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
      </Routes>
    </Router>
  );
}

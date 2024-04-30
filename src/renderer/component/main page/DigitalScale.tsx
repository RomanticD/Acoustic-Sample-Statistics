import React, { useState } from 'react';
import './DigitalScale.css';
import { Question } from '../../model/QuestionModel';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function DigitalScale({ question }: { question: Question }) {
  const [selectedOption, setSelectedOption] = useState('');

  // console.log(selectedOption);

  const options = [
    { value: '0', label: '0' },
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5' },
    { value: '6', label: '6' },
    { value: '7', label: '7' },
    { value: '8', label: '8' },
    { value: '9', label: '9' },
    { value: '10', label: '10' },
  ];

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value);
  };

  // console.log(question);
  // console.log(selectedOption);

  return (
    <div className="digital-scale">
      <h2 className="digital-scale-question">您对当前声音样本的反应是?</h2>
      <form className="digital-scale-form">
        {options.map((option) => (
          <div key={option.value} className="digital-scale-radio-and-label">
            <label htmlFor={option.value} className="digital-scale-label">
              <input
                className="digital-scale-radio"
                type="radio"
                id={option.value}
                name="severity"
                value={option.value}
                checked={selectedOption === option.value}
                onChange={handleOptionChange}
              />
              {option.label}
            </label>
          </div>
        ))}
      </form>
    </div>
  );
}

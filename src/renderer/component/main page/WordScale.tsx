import React, { useState } from 'react';
import './WordScale.css';
import { Question } from '../../model/QuestionModel';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function WordScale({ question }: { question: Question }) {
  const [selectedOption, setSelectedOption] = useState('');

  const options = [
    { value: '1', label: '一点没有' },
    { value: '2', label: '轻微' },
    { value: '3', label: '一般' },
    { value: '4', label: '严重' },
    { value: '5', label: '非常严重' },
  ];

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value);
  };

  // console.log(question);
  // console.log(selectedOption);

  return (
    <div className="word-scale">
      <h2 className="word-scale-question">您对当前声音样本的反应是?</h2>
      <form className="word-scale-form">
        {options.map((option) => (
          <div key={option.value} className="word-scale-radio-and-label">
            <label htmlFor={option.value} className="word-scale-label">
              <input
                className="word-scale-radio"
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

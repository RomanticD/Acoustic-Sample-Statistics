import React from 'react';
import './InfoDisplay.css'; // 添加样式

// @ts-ignore
// eslint-disable-next-line react/prop-types
export default function InfoDisplay({ formData }) {
  return (
    <div className="info-display">
      <div className="data-container">
        {Object.entries(formData).map(([key, value]) => (
          <div key={key}>
            <h2>{key}</h2>
            <p>{JSON.stringify(value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

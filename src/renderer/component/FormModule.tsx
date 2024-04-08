import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import './FormModule.css';

// @ts-ignore
// eslint-disable-next-line react/prop-types
export default function FormModule({ onSubmitData }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // 添加状态变量来跟踪字段数量
  const [fieldCount, setFieldCount] = useState(1);

  // 创建处理函数来增加字段数量
  const addField = () => {
    setFieldCount((prevCount) => prevCount + 1);
  };

  const removeField = () => {
    if (fieldCount > 1) {
      setFieldCount((prevCount) => prevCount - 1);
    }
  };

  // @ts-ignore
  const onSubmit = (data) => {
    // Collect all field data
    const allFieldData = {};
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < fieldCount; i++) {
      // @ts-ignore
      allFieldData[`firstName_${i}`] = data[`firstName${i}`];
      // @ts-ignore
      allFieldData[`lastName_${i}`] = data[`lastName${i}`];
      // @ts-ignore
      allFieldData[`age_${i}`] = data[`age${i}`];
    }
    // Pass the data to the parent component
    onSubmitData(allFieldData);
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* 使用循环渲染相应数量的输入字段 */}
        {[...Array(fieldCount)].map((_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index}>
            <input
              {...register(`firstName${index}`)}
              placeholder="First Name"
            />
            <input
              {...register(`lastName${index}`, { required: true })}
              placeholder="Last Name"
            />
            {errors[`lastName${index}`] && (
              <p className="error-message">Last name is required.</p>
            )}
            <input
              {...register(`age${index}`, { pattern: /\d+/ })}
              placeholder="Age"
            />
            {errors[`age${index}`] && (
              <p className="error-message">Please enter a number for age.</p>
            )}
          </div>
        ))}
        {/* Button to add more fields */}

        <div className="buttonsGroup">
          <button type="button" onClick={addField} className="fieldButton">
            +
          </button>
          {fieldCount > 1 && (
            <button type="button" onClick={removeField} className="fieldButton">
              -
            </button>
          )}
        </div>
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
}

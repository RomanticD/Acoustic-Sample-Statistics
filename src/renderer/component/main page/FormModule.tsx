import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import './FormModule.css';
import { removeFormDataThatNotShown } from '../../util/DisplayUtil';

// @ts-ignore
// eslint-disable-next-line react/prop-types
export default function FormModule({ onSubmitData }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [fieldCount, setFieldCount] = useState(1);

  // @ts-ignore
  const onSubmit = (data) => {
    onSubmitData(removeFormDataThatNotShown(fieldCount, data));
  };

  return (
    <div className="form-module-container">
      <form onSubmit={handleSubmit(onSubmit)}>
        {[...Array(fieldCount)].map((_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index}>
            <input
              className="input-in-form-module"
              {...register(`firstName_${index}`)}
              placeholder="姓氏"
            />
            <input
              className="input-in-form-module"
              {...register(`lastName_${index}`, { required: true })}
              placeholder="名字"
            />
            {errors[`lastName_${index}`] && (
              <p className="error-message">Last name is required.</p>
            )}
            <input
              className="input-in-form-module"
              {...register(`age_${index}`, { pattern: /\d+/ })}
              placeholder="年龄"
            />
            {errors[`age_${index}`] && (
              <p className="error-message">Please enter a number for age.</p>
            )}
          </div>
        ))}
        <div className="buttonsGroup">
          <button
            type="button"
            onClick={() => setFieldCount(fieldCount + 1)}
            className="fieldButton"
          >
            +
          </button>
          {fieldCount > 1 && (
            <button
              type="button"
              onClick={() => setFieldCount(fieldCount - 1)}
              className="fieldButton"
            >
              -
            </button>
          )}
        </div>
        <input type="submit" className="input-in-form-module" value="提交" />
      </form>
    </div>
  );
}

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import './FormModule.css';
import { removeFormDataThatNotShown } from '../util/DisplayUtil';

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
    <div className="container">
      <form onSubmit={handleSubmit(onSubmit)}>
        {[...Array(fieldCount)].map((_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index}>
            <input
              {...register(`firstName_${index}`)}
              placeholder="First Name"
            />
            <input
              {...register(`lastName_${index}`, { required: true })}
              placeholder="Last Name"
            />
            {errors[`lastName_${index}`] && (
              <p className="error-message">Last name is required.</p>
            )}
            <input
              {...register(`age_${index}`, { pattern: /\d+/ })}
              placeholder="Age"
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
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
}

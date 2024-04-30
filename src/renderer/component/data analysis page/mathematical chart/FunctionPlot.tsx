import React, { useEffect, useRef } from 'react';
import functionPlot from 'function-plot';
import './FunctionPlot.css';

// @ts-ignore
function Graph(props) {
  const graphRef = useRef(null);

  useEffect(() => {
    functionPlot({
      tip: {
        xLine: true, // dashed line parallel to y = 0
        yLine: true, // dashed line parallel to x = 0
      },
      target: graphRef.current,
      width: 800,
      height: 500,
      // eslint-disable-next-line react/destructuring-assignment,react/prop-types
      data: props.data,
      // eslint-disable-next-line react/destructuring-assignment,react/prop-types
      ...props.options,
    });
    // eslint-disable-next-line react/destructuring-assignment,react/prop-types
  }, [props.data, props.options]);

  return <div ref={graphRef} />;
}

export default Graph;

import isString from 'lodash/isString.js';

export function handleAxiosError(error) {
  const output = {};
  if (error.response) {
    const axiosErrorPrefix = `Error in response with code ${error.response.status}: `;
    if (error.response.data.message) {
      output.message = error.response.data.message;
    } else if (isString(error.response.data)) {
      output.message = `${axiosErrorPrefix} ${error.response.data}`;
    } else {
      output.message = `${axiosErrorPrefix} Unparseable error response.`;
    }
  } else {
    output.message = 'Unknown axios exception encountered.';
  }

  output.status = 'error';
  return output;
}

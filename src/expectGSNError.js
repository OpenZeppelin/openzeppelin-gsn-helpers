const { expect } = require('chai');

const expectGSNError = async function (promise) {
  try {
    await promise;
  } catch (error) {
    return;
  }

  expect.fail('Expected a GSN exception but none was received');
};

module.exports = expectGSNError;

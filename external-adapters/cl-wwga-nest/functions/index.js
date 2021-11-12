const functions = require("firebase-functions");

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

const { Requester, Validator } = require("@chainlink/external-adapter");
const { getThermostatInfo } = require('./wwga');

// Define custom error scenarios for the API.
// Return true for the adapter to retry.
const customError = (data) => {
  if (data.Response === "Error") return true;
  return false;
};

// Define custom parameters to be used by the adapter.
// Extra parameters can be stated in the extra object,
// with a Boolean value indicating whether or not they
// should be required.
const customParams = {
  user: "user",
  timestamp: "timestamp",
};


const createRequest = async (input, callback) => {
  // The Validator helps you validate the Chainlink request data
  const validator = new Validator(callback, input, customParams);
  const jobRunID = validator.validated.id;
  const { user, timestamp } = validator.validated.data;

  const thermostatInfo = await getThermostatInfo(user, timestamp);

  const response = {
    jobRunID,
    data: `${thermostatInfo.mode},${thermostatInfo.temperature},${thermostatInfo.heatSetpoint},${thermostatInfo.coolSetpoint}`,
    result: null,
    statusCode: 200,
  };

  callback(response.statusCode, response);
};

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.getThermostatInfo = functions.https.onRequest(async (request, response) => {
  functions.logger.info(`Hello user ${request.body.data.user} at ${request.body.data.timestamp}`, {structuredData: true});
  createRequest(request.body, (statusCode, data) => {
    functions.logger.info(`Response data ${JSON.stringify(data)}`, {structureData: true});
    response.status(statusCode).send(data);
  });
});

const functions = require('firebase-functions');
const got = require('got');

const BASE_URL = 'https://www.googleapis.com/oauth2/v4/token';
const CLIENT_ID = functions.config().wwga.id;
const CLIENT_SECRET = functions.config().wwga.secret;
const PROJECT_ID = functions.config().wwga.project_id;

const MODES_TO_VALUE = {
  OFF: 0,
  HEAT: 1,
  COOL: 2,
  HEATCOOL: 3
}

const getRefreshToken = (userAddress) => {
  // TODO IMPLEMENT THIS
  return functions.config().test.refresh_token;
}
const getAccessToken = async (userAddress, timestamp) => {

  // Get the refresh token from Firestore
  const userRefreshToken = getRefreshToken(userAddress);

  try {
    const request_url = `${BASE_URL}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&refresh_token=${userRefreshToken}&grant_type=refresh_token`;

    // Make a request
    const { body } = await got.post(request_url, {
      responseType: 'json'
    });

    // Get the Access Token
    const { access_token } = body;
    return access_token
  } catch (e) {
    console.log(e);
  }
  return null;
};

// TODO FIX THIS
const getUserDeviceId = async (userAddress) => {
  return functions.config().test.device_id;
}

const getDeviceTraitTemperature = async (userAddress, accessToken, timestamp) => {

  // Get DeviceId from Firebase Storage
  const deviceId = await getUserDeviceId(userAddress);

  // Retrieve Data
  const request_url = `https://smartdevicemanagement.googleapis.com/v1/enterprises/${PROJECT_ID}/devices/${deviceId}`;

  const { body } = await got.get(request_url, {
    responseType: "json",
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  // Get the traits from body
  const { traits } = body;

  // Get the thermostat mode
  const thermostatMode = traits["sdm.devices.traits.ThermostatMode"];
  const { mode } = thermostatMode;

  // If the thermostat isn't off then it has set points
  let coolSetpoint = null;
  let heatSetpoint = null;
  if (mode !== 'OFF') {
    const setpoints = traits["sdm.devices.traits.ThermostatTemperatureSetpoint"];
    coolSetpoint = setpoints["coolCelsius"];
    heatSetpoint = setpoints["heatCelsius"];
    console.log(`Mode is not off setpoints are cool: ${coolSetpoint} heat: ${heatSetpoint}`)
  }

  // Get the current temperature
  const temperature = traits["sdm.devices.traits.Temperature"];
  const { ambientTemperatureCelsius } = temperature;

  return {
    mode: MODES_TO_VALUE[mode],
    temperature: ambientTemperatureCelsius,
    coolSetpoint: coolSetpoint === null ? 0 : coolSetpoint,
    heatSetpoint: heatSetpoint === null ? 0 : heatSetpoint
  }
};

const getThermostatInfo = async (userAddress, timestamp) => {
  const accessToken = await getAccessToken(userAddress);
  return await getDeviceTraitTemperature(userAddress, accessToken, timestamp);
};

module.exports = {
  getThermostatInfo
}

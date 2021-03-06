const grpc = require('grpc')
var messages = require('./led_sign_pb')
var services = require('./led_sign_grpc_pb')

/**
 * This function checks if the LED Sign is up and running. If the sign is up,
 * we should get a response back containing "hello <officerName>!". If not, we
 * return an object that the sign is down.
 * @param {string} officerName The name of the officer interacting with the sign
 * @param {string} signIp - The IP address of the sign.
 * @returns {Promise} Promise object which will contain the message from the
 * sign and if an error occurred.
 */
function healthCheck(officerName, signIp) {
  const client = new services.LedSignClient(
    `${signIp}:50051`,
    grpc.credentials.createInsecure()
  )
  const healthCheckRequest = new messages.HealthCheckRequest()
  healthCheckRequest.setOfficerName(officerName)
  return new Promise(function (resolve, reject) {
    client.healthCheck(healthCheckRequest, function (err, response) {
      if (err || !response) {
        reject({ message: 'Sign is down', error: true })
      } else {
        resolve({ message: response.getMessage(), error: false })
      }
    })
  })
}

/**
 * This function updates the text of the sign in the SCE club room.
 * @param {*} signData An object containing all of the information to update
 * the sign with.
 * @param {(string|undefined)} signData.text - The text to display on the sign
 * @param {string} signData.brightness - The brightness of the sign
 * @param {string} signData.scrollSpeed - How fast the text will scroll across
 * the sign
 * @param {string} signData.backgroundColor - The background color the text
 * will scroll over represented in hex color value.
 * @param {string} signData.textColor - The color of the text to display
 * represented in hex color value.
 * @param {(string|undefined)} signData.borderColor - The color displayed at
 * the edge of the sign represneted in hex color value.
 * @param {string} signIp - The IP address of the sign.
 * @returns {Promise} Promise object which will contain the message from the
 * sign and if an error occurred.
 */
function updateSignText(signData, signIp) {
  const client = new services.LedSignClient(
    `${signIp}:50051`,
    grpc.credentials.createInsecure()
  )
  const textRequest = new messages.LedSignRequest()
  textRequest.setText(signData.text)
  textRequest.setBrightness(signData.brightness)
  textRequest.setScrollSpeed(signData.scrollSpeed)
  textRequest.setBackgroundColor(signData.backgroundColor)
  textRequest.setTextColor(signData.textColor)
  textRequest.setBorderColor(signData.borderColor)
  return new Promise(function (resolve, reject) {
    client.updateSignText(textRequest, function (err, response) {
      if (err) reject({ message: 'Update failed', error: true })
      resolve({ message: response && response.getMessage(), error: false })
    })
  })
}

module.exports = { healthCheck, updateSignText }

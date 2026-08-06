const mongoose = require("mongoose");
function luhnCheckDigit(digits) {
  let sum = 0;
  let shouldDouble = true;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (shouldDouble) {
      d *= 2;
      if (d > 9) {
        d -= 9;
      }
    }
    sum += d;
    shouldDouble = !shouldDouble;
  }
  return (10 - (sum % 10)) % 10;
}
function generateCardNumber() {
  const prefix = String(51 + Math.floor(Math.random() * 5));
  let digits = prefix;
  for (let i = 0; i < 13; i++) digits += Math.floor(Math.random() * 10);
  return digits + luhnCheckDigit(digits);
}
async function generateUniqueCardNumber() {
  const Card = mongoose.model("card");
  let cardNumber;
  do {
    cardNumber = generateCardNumber();
  } while (await Card.exists({ cardNumber }));
  return cardNumber;
}
function generateCVV() {
  return String(Math.floor(Math.random() * 1000)).padStart(3, "0");
}
function generateExpiryDate(issuanceDate = new Date()) {
  const expiry = new Date(issuanceDate);
  expiry.setFullYear(expiry.getFullYear() + 4);
  return expiry;
}
module.exports = {
  generateUniqueCardNumber,
  generateCVV,
  generateExpiryDate,
  generateCardNumber,
};

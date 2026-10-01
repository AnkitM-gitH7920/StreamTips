import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;

async function generateAccessToken(userType, data, expiry) {
     const accessToken = await jwt.sign({
          userType: userType,
          ...data

     }, ACCESS_TOKEN_SECRET, {
          expiresIn: expiry,
          algorithm: "HS256"
     })

     return accessToken;

}
async function generateRefreshToken(userType, data, expiry) {
     const accessToken = await jwt.sign({
          userType: userType,
          ...data

     }, REFRESH_TOKEN_SECRET, {
          expiresIn: expiry,
          algorithm: "HS256"
     })

     return accessToken;

}
async function decodeJWTToken(token) {
     const decodedToken = await jwt.decode(token);
     if (!decodedToken) throw new Error("DECODE_ERROR");

     return decodedToken;

}
// guestToken, process.env.JWT_ACCESS_SECRET, { algorithms: ["HS256"] }
async function jwtVerifier(token, secret) {
     try {
          const verifiedDecodedToken = await jwt.verify(token, secret, { algorithms: ["HS256"] });
          return verifiedDecodedToken;

     } catch (jwtVerificationError) {
          throw jwtVerificationError;
     }
}

export {
     generateAccessToken,
     generateRefreshToken,
     decodeJWTToken,
     jwtVerifier
}

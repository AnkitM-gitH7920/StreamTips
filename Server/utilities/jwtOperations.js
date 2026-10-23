import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;

async function genAccessAndRefreshTokens(payload, accessExpiry, refreshExpiry) {
     const accessToken = await jwt.sign(payload, ACCESS_TOKEN_SECRET, {
          expiresIn: accessExpiry,
          algorithm: "HS256",
     });

     const refreshToken = await jwt.sign(payload, REFRESH_TOKEN_SECRET, {
          expiresIn: refreshExpiry,
          algorithm: "HS256",
     });
     return { accessToken, refreshToken };
}
async function generateAccessToken(data, expiry) {
     const accessToken = await jwt.sign({ ...data }, ACCESS_TOKEN_SECRET, {
          expiresIn: expiry,
          algorithm: "HS256",
     });

     return accessToken;
}
async function generateRefreshToken(data, expiry) {
     const refreshToken = await jwt.sign({ ...data }, REFRESH_TOKEN_SECRET, {
          expiresIn: expiry,
          algorithm: "HS256",
     });

     return refreshToken;
}

export { generateAccessToken, generateRefreshToken, genAccessAndRefreshTokens };

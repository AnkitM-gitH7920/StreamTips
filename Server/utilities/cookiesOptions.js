/**
 *
 * @param {String} tokenType
 * @returns Object
 */

function issueCookieOptions(tokenType, cookieExpiry) {
     if (tokenType === "access") {
          return {
               httpOnly: true,
               sameSite: "lax",
               maxAge: 15 * 24 * 60 * 60 * 1000,
               secure: process.env.NODE_ENV === "deployed"
          }
     }
     if (tokenType === "refresh") {
          return {
               httpOnly: true,
               sameSite: "lax",
               maxAge: 30 * 24 * 60 * 60 * 1000,
               secure: process.env.NODE_ENV === "deployed"
          }
     }
     if (cookieExpiry && !tokenType) {
          return {
               httpOnly: true,
               sameSite: "lax",
               maxAge: cookieExpiry,
               secure: process.env.NODE_ENV === "deployed"
          }
     }

}

export { issueCookieOptions }

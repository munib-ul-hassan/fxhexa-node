import dotenv from "dotenv";
import * as jose from "jose";
import keyGen from "./keyGen.js";
const envConfig = dotenv.config({ path: "../../../.env" }).parsed;
const endpoint = envConfig ? envConfig["ENDPOINT"] : "localhost";
const { publicKey, privateKey } = keyGen;

export const tokenGen = async (user, tokenType,deviceToken,isTemporary) => {
  
  return await new jose.EncryptJWT({
    uid: user._id,    
    
    tokenType: tokenType ? tokenType : "auth",
    deviceToken,
    isTemporary: isTemporary ? isTemporary : false
  })
    .setProtectedHeader({ alg: "RSA-OAEP-256", enc: "A256GCM" })
    .setIssuedAt(new Date().getTime())
    .setIssuer(endpoint)
    .setAudience(endpoint)
    .setExpirationTime("30d")
    .encrypt(publicKey);
};

// export const joseJwtDecrypt = async (token, PK = privateKey) => {
//   try {
//     const decryptedToken = await jose.jwtDecrypt(token, PK);
//     return decryptedToken;
//   } catch (error) {

//     return false;
//   }
// };

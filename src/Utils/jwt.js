import keyGen from "./keyGen.js";
import * as jose from "jose";
import dotenv from "dotenv";
import AuthModel from "../DB/Model/authModel.js";
import DeviceModel from "../DB/Model/deviceModel.js";

const envConfig = dotenv.config({ path: "./.env" }).parsed;

const endpoint = envConfig ? envConfig["ENDPOINT"] : "localhost";
const { publicKey, privateKey } = keyGen;

export const tokenGen = async (user, tokenType, deviceToken) => {
  return await new jose.EncryptJWT({
    uid: user._id,
    ref: tokenType === tokenType.refresh ? user.publicId : "",
    deviceToken: deviceToken ? deviceToken : "",
    userType: user.userType,
    tokenType: tokenType ? tokenType : tokenType.auth,
  })
    .setProtectedHeader({ alg: "RSA-OAEP-256", enc: "A256GCM" })
    .setIssuedAt(new Date().getTime())
    .setIssuer(endpoint)
    .setAudience(endpoint)
    .setExpirationTime(tokenType === "refresh" ? "30d" : "2d")
    .encrypt(publicKey);
};
export const generateToken = async (data) => {
  const { _id, tokenType, deviceId, isTemporary, userType } = data;
  if (!_id || !deviceId) {
    return {
      error: {
        message: "Invalid arguments to generateToken",
      },
    };
  }
  return await new jose.EncryptJWT({
    uid: _id,
    ref: _id,
    deviceId: deviceId ? deviceId : "",
    userType: userType,
    tokenType: tokenType ? tokenType : "auth",
    isTemporary: isTemporary ? isTemporary : false,
  })
    .setProtectedHeader({ alg: "RSA-OAEP-256", enc: "A256GCM" })
    .setIssuedAt(new Date().getTime())
    .setIssuer(endpoint)
    .setAudience(endpoint)
    .setExpirationTime(tokenType === "refresh" && !isTemporary ? "30d" : !isTemporary ? "2d" : "5m")
    .encrypt(publicKey);
};
export const joseJwtDecrypt = async (token, PK = privateKey) => {
  try {
    const decryptedToken = await jose.jwtDecrypt(token, PK);
    return decryptedToken;
  } catch (error) {
    return { error };
  }
};
const getUserProfile = async (uid) => {
  const user = await AuthModel.findById(uid).populate(["profile", "devices"]);
  if (!user) {
    throw new Error("User not found");
  }
  const profile = user._doc.profile._doc;
  // delete profile.auth;
  return {
    data: profile,
    devices: user._doc.devices._doc,
    message: "User found",
    status: 200,
  };
};
export const verifyJWT = async (data) => {
  const { authToken, refreshToken, deviceToken, type } = data;
  let newAuthToken, newRefreshToken, decodedAuthToken, decodedRefreshToken, uid, typeMatch, decode;
  if (!authToken || !refreshToken || !deviceToken || !type) {
    return {
      error: "Invalid arguments to verifyJWT",
    };
  }
  try {
    decodedAuthToken = await joseJwtDecrypt(authToken);
    if (decodedAuthToken.error) {
      if (decodedAuthToken.error.message !== "JWT expired") {
        return {
          error: "Invalid authorization token.",
        };
      }
      decodedRefreshToken = await joseJwtDecrypt(refreshToken);
      if (decodedRefreshToken.error) {
        if (decodedRefreshToken.error.message !== "JWT expired") {
          return {
            error: "Invalid refresh token.",
          };
        }
        throw new Error("No valid Tokens were provided");
      }

      decode = { ...decodedRefreshToken };
    } else {
      decode = { ...decodedAuthToken };
    }
    
    if (type != "auth") {
      typeMatch = decode.payload.userType === type;
      if (!typeMatch) {
        throw new Error("User type mismatch");
      }
    }
  } catch (error) {
    return {
      error: error.message,
    };
  }

  try {
    uid = decode.payload.uid;
    const { data, devices } = await getUserProfile(uid);
    const profile = { ...data };
    const device = await DeviceModel.findOne({ deviceToken: deviceToken });

    if (
      // !decode.payload.deviceId ||
      // (!(decode.payload.deviceId in device) &&
      //   deviceToken !== devices[decode.payload.deviceId]?.deviceToken) ||
      // !device ||
      device.deviceToken !== deviceToken
    ) {
      return {
        error: "Device token mismatch",
      };
    }
    if (decodedAuthToken.error) {
      newAuthToken = await tokenGen(uid, "auth", deviceToken);
      newRefreshToken = await tokenGen(uid);
    }
    return decode.payload.isTemporary
      ? {
          profileId: profile.uid,
        }
      : {
          profile,
          authToken: newAuthToken,
          refreshToken: newRefreshToken,
        };
  } catch (error) {
    return {
      error: error.message,
    };
  }
};

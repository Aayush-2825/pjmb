import crypto from "crypto";

/**
 * Hash a recovery code before storing it
 * (Never store raw recovery codes)
 */
export const hashRecoveryCode = (code) => {
  return crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");
};

/**
 * Compare raw recovery code with stored hash
 */
export const verifyRecoveryCode = (rawCode, hashedCode) => {
  const hash = hashRecoveryCode(rawCode);
  return crypto.timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(hashedCode, "hex"),
  );
};

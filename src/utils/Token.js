import crypto from "crypto";

export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex"); // 64 chars
};

export const hashedVerificationToken = (token) =>{
  return crypto.createHash('sha256').update(token).digest('hex')
}

export const sessionToken = () =>{
  return crypto.randomBytes(32).toString("hex");
}

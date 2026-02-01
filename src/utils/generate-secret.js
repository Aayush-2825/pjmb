import QRCode from "qrcode";
import speakeasy from "speakeasy";

export const generateSecret = async (user) => {
  const secret = speakeasy.generateSecret({
    name: `YourApp (${user.email})`,
  });

  const otpAuthUrl = secret.otpauth_url;
  const qrCode = await QRCode.toDataURL(otpAuthUrl);

  return {
    secret,
    otpAuthUrl,
    qrCode,
  };
};

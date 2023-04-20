import { processImageB64 } from "components-care";

const downloadProfileImage = async (url: string): Promise<string | null> => {
  try {
    const resp = await fetch(url);
    const data = await resp.blob();
    const reader = new FileReader();
    const dataB64 = await new Promise<string>((resolve, reject) => {
      reader.addEventListener("load", () => resolve(reader.result as string));
      reader.addEventListener("error", reject);
      reader.readAsDataURL(data);
    });
    return await processImageB64(dataB64, "image/jpg", {
      width: 40,
      height: 40,
      keepRatio: true,
    });
  } catch (e) {
    console.error("downloadProfileImage error", e);
    return null;
  }
};

export default downloadProfileImage;

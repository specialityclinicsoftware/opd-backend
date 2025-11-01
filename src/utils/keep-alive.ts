import axios from "axios";

const SELF_URL = "https://opd-backend-xvid.onrender.com/health";

export function keepServerAlive() {
  setInterval(async () => {
    try {
      await axios.get(SELF_URL);
      console.log("✅ Keep-alive ping sent");
    } catch (err) {
      console.error("❌ Keep-alive failed:", (err as any).message);
    }
  }, 5 * 60 * 1000); // every 5 mins
}

import axios from 'axios';

if (!process.env.AUTH_SERVICE_URL) {
  throw new Error("AUTH_SERVICE_URL no definida");
}
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

export async function validateUser(userId: number): Promise<boolean> {
  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/api/users/${userId}`, { timeout: 5000 });
    return response.status === 200;
  } catch (error : any) {
    console.log("🔎 AUTH_SERVICE_URL:", process.env.AUTH_SERVICE_URL);
    console.error("❌ Error al validar usuario:", error?.response?.status, error?.message);
    return false; // 404 or network error
  }
}

import axios from 'axios';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000'; // usar nombre del contenedor en compose o localhost

export async function validateUser(userId: number): Promise<boolean> {
  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/api/users/${userId}`, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    return false; // 404 o error de red
  }
}

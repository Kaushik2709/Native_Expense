import { Platform } from "react-native";

// Change this to your Render URL after deployment
const PRODUCTION_URL = 'https://your-backend-url.onrender.com';
const LOCAL_URL = Platform.OS === 'web' ? 'http://localhost:5000' : 'http://10.168.218.1:5000';

export default function BaseURL() {
     // Switch to true when you want to use the production backend
     const isProduction = false;

     return isProduction ? PRODUCTION_URL : LOCAL_URL;
}
import { Platform } from "react-native";

export default function BaseURL() {  

     const baseURL = Platform.OS === 'web' ? 'http://localhost:5000' : 'http://10.215.75.202:5000';
     return baseURL;
}
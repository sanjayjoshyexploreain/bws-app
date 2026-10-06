import AsyncStorage from '@react-native-async-storage/async-storage';

// Point this to your new backend proxy server URL.
// For local testing on a physical device via Expo Go, use your computer's local IP
// For production, change to your hosted backend URL (e.g., 'https://api.yourdomain.com/api')
const BASE_URL = 'https://bwsgroup.pl/api';

async function callApi(endpoint, body) {
  let token = null;
  
  // Retrieve token from AsyncStorage
  try {
    const saved = await AsyncStorage.getItem("attendanceAppState");
    if (saved) {
      const parsed = JSON.parse(saved);
      token = parsed.token;
    }
  } catch (e) {
    console.error("Failed to fetch token from storage");
  }

  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API error: ${response.status} - ${errText}`);
  }
  return response.json();
}

export const Api = {
  login: (employeeId, pin) => callApi('/login', { employeeId, pin }),
  generateOtp: () => callApi('/generateOtp', {}),
  
  // Worker Routes (Backend injects employeeId from JWT)
  submitEntry: (payload) => callApi('/submitEntry', payload),
  uploadPhoto: (payload) => callApi('/uploadPhoto', payload),
  getMyEntries: (employeeId, monthKey) => callApi('/getMyEntries', { monthKey: monthKey || "" }),
  submitWorkwearRequest: (employeeId, requestItems) => callApi('/submitWorkwearRequest', { requestItems }),
  updatePIN: (employeeSpId, accessPIN) => callApi('/updatePIN', { accessPIN: String(accessPIN) }),
  
  // Shared/General Authenticated Routes
  listEmployees: () => callApi('/listEmployees', {}),
  getPhotos: (entryId) => callApi('/getPhotos', { entryId }),

  // Admin Routes
  adminGetEntries: (status, dateKey) => callApi('/adminGetEntries', { status: status || "", dateKey: dateKey || "" }),
  reviewEntry: (entryId, status, adminNotes, reviewedBy) => callApi('/reviewEntry', { entryId, status, adminNotes }),
  monthlyReport: (monthKey, employeeId) => callApi('/monthlyReport', { monthKey, employeeId: employeeId || "" }),
};

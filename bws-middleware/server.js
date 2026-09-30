require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // For base64 photo uploads

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// Utility to call Power Automate
async function callFlow(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Flow error: ${response.status} - ${text}`);
  }
  return response.json();
}

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ success: false, message: 'Access Denied: No Token Provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid Token' });
    req.user = user; // Contains { employeeId, role, ... }
    next();
  });
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Access Denied: Admin role required' });
  }
  next();
}

// --- UNAUTHENTICATED ROUTES ---

app.post('/api/login', async (req, res) => {
  try {
    const { employeeId, pin } = req.body;
    
    // Call Power Automate to verify credentials
    const flowRes = await callFlow(process.env.FLOW_LOGIN, { employeeId, pin });
    
    if (!flowRes.success) {
      return res.status(401).json(flowRes);
    }

    // Determine Role
    const isManagerOrAdmin = flowRes.role === 'Admin' || flowRes.role === 'Manager' || 
                             (flowRes.employeeName && (flowRes.employeeName.includes('Admin') || flowRes.employeeName.includes('Manager')));
    const role = isManagerOrAdmin ? 'Admin' : 'Worker';

    // Generate JWT
    const token = jwt.sign(
      { 
        employeeId: flowRes.employeeId, 
        employeeSpId: flowRes.spId,
        role: role
      }, 
      JWT_SECRET, 
      { expiresIn: '12h' } // Token expires in 12 hours
    );

    res.json({ ...flowRes, token, role });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.post('/api/generateOtp', async (req, res) => {
  try {
    const flowRes = await callFlow(process.env.FLOW_GENERATE_OTP, {});
    res.json(flowRes);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


// --- AUTHENTICATED ROUTES ---
// We inject req.user.employeeId into the payload to prevent ID spoofing

app.post('/api/submitEntry', authenticateToken, async (req, res) => {
  try {
    // Override employeeId with the one from the verified JWT
    const payload = { ...req.body, employeeId: req.user.employeeId, employeeSpId: req.user.employeeSpId };
    const flowRes = await callFlow(process.env.FLOW_SUBMIT_ENTRY, payload);
    res.json(flowRes);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/getMyEntries', authenticateToken, async (req, res) => {
  try {
    const payload = { ...req.body, employeeId: req.user.employeeId };
    const flowRes = await callFlow(process.env.FLOW_GET_MY_ENTRIES, payload);
    res.json(flowRes);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/uploadPhoto', authenticateToken, async (req, res) => {
  try {
    const payload = { ...req.body, employeeId: req.user.employeeId };
    const flowRes = await callFlow(process.env.FLOW_UPLOAD_PHOTO, payload);
    res.json(flowRes);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/submitWorkwearRequest', authenticateToken, async (req, res) => {
  try {
    const payload = { ...req.body, employeeId: req.user.employeeId };
    const flowRes = await callFlow(process.env.FLOW_SUBMIT_WORKWEAR_REQUEST, payload);
    res.json(flowRes);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/updatePIN', authenticateToken, async (req, res) => {
  try {
    const payload = { ...req.body, employeeSpId: req.user.employeeSpId };
    const flowRes = await callFlow(process.env.FLOW_UPDATE_PIN, payload);
    res.json(flowRes);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/getPhotos', authenticateToken, async (req, res) => {
  try {
    const flowRes = await callFlow(process.env.FLOW_GET_PHOTOS, req.body);
    res.json(flowRes);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/listEmployees', authenticateToken, async (req, res) => {
  try {
    const flowRes = await callFlow(process.env.FLOW_LIST_EMPLOYEES, req.body);
    res.json(flowRes);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// --- ADMIN ROUTES (Requires Admin Role) ---

app.post('/api/adminGetEntries', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const flowRes = await callFlow(process.env.FLOW_ADMIN_GET_ENTRIES, req.body);
    res.json(flowRes);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/reviewEntry', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const payload = { ...req.body, reviewedBy: req.user.employeeId };
    const flowRes = await callFlow(process.env.FLOW_REVIEW_ENTRY, payload);
    res.json(flowRes);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/monthlyReport', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const flowRes = await callFlow(process.env.FLOW_MONTHLY_REPORT, req.body);
    res.json(flowRes);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`BWS API Gateway running on port ${PORT}`);
});

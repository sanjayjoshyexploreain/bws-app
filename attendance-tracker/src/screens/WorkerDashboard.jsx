import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Api } from '../api/api';
import PoweredBy from '../components/PoweredBy';

export default function WorkerDashboard() {
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  const [employeeDetails, setEmployeeDetails] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const employees = await Api.listEmployees();
        const me = employees.find(e => e.EmployeeID === state.employeeId || e.ID === state.employeeId);
        setEmployeeDetails(me);
      } catch (err) {
        console.error("Failed to load employee details");
      }
    };
    fetchDetails();
  }, [state.employeeId]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #0d1c2d, #051424)',
      paddingBottom: '292px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <header style={{
        background: 'rgba(5, 20, 36, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ fontSize: '17px', fontWeight: '700', color: 'var(--color-text)', letterSpacing: '0.01em' }}>
          Worker Dashboard
        </div>
        <button onClick={logout} style={{
          color: 'var(--color-text-muted)',
          fontSize: '13px',
          background: 'none',
          border: 'none',
          cursor: 'pointer'
        }}>Logout</button>
      </header>

      <main style={{ flex: 1, padding: '24px 16px' }}>
        <div style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          boxShadow: 'var(--shadow-card)',
          marginBottom: '24px'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Employee Name</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text)' }}>{state.employeeName}</div>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Employee ID</div>
            <div style={{ fontSize: '16px', color: 'var(--color-text)' }}>{state.employeeId}</div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Company Name</div>
            <div style={{ fontSize: '16px', color: 'var(--color-text)' }}>
              {employeeDetails ? 
                (typeof (employeeDetails['Company Name'] || employeeDetails.CompanyName) === 'object' ? 
                  (employeeDetails['Company Name']?.Value || employeeDetails.CompanyName?.Value || 'B&W Services') : 
                  (employeeDetails['Company Name'] || employeeDetails.CompanyName || 'B&W Services')
                ) : 'Loading...'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Client Company</div>
            <div style={{ fontSize: '16px', color: 'var(--color-text)' }}>
              {employeeDetails ? 
                (typeof (employeeDetails['Client Company'] || employeeDetails.ClientCompany) === 'object' ? 
                  (employeeDetails['Client Company']?.Value || employeeDetails.ClientCompany?.Value || 'N/A') : 
                  (employeeDetails['Client Company'] || employeeDetails.ClientCompany || 'N/A')
                ) : 'Loading...'}
            </div>
          </div>
        </div>
      </main>

      <button
        onClick={() => navigate('/upload-photo')}
        style={{
          position: 'fixed',
          bottom: '168px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '448px',
          padding: '13px',
          background: '#1e293b',
          border: '1px solid #334155',
          color: 'var(--color-text)',
          borderRadius: 'var(--radius-xl)',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          zIndex: 10
        }}
      >
        📸 Upload Photos
      </button>

      <button
        onClick={() => navigate('/workwear')}
        style={{
          position: 'fixed',
          bottom: '96px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '448px',
          padding: '13px',
          background: '#1e293b',
          border: '1px solid #334155',
          color: 'var(--color-text)',
          borderRadius: 'var(--radius-xl)',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          zIndex: 10
        }}
      >
        👔 Work Wear Request
      </button>

      <button
        onClick={() => navigate('/submit')}
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '448px',
          padding: '17px',
          background: 'var(--color-primary)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius-xl)',
          fontSize: '16px',
          fontWeight: '700',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-button)',
          zIndex: 10
        }}
      >
        + Submit Attendance
      </button>

      <div style={{ position: 'fixed', bottom: '232px', width: '100%', zIndex: 5 }}>
        <PoweredBy />
      </div>
    </div>
  );
}

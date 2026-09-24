import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Api } from '../api/api';
import { formatWarsawDate } from '../utils/time';
import StatusPill from '../components/StatusPill';
import LoadingSpinner from '../components/LoadingSpinner';
import PoweredBy from '../components/PoweredBy';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [dateFilter, setDateFilter] = useState('');
  
  const [activeTab, setActiveTab] = useState('entries');
  const [employees, setEmployees] = useState([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  const [pinGenState, setPinGenState] = useState({
    isRunning: false,
    isComplete: false,
    total: 0,
    generated: 0,
    skipped: 0,
    failed: 0,
    currentEmployee: '',
    progress: 0,
    errors: []
  });
  const [showPinTool, setShowPinTool] = useState(false);

  const fetchEntries = async (statusOverride, dateOverride) => {
    const status = statusOverride !== undefined ? statusOverride : statusFilter;
    const date = dateOverride !== undefined ? dateOverride : dateFilter;
    setIsLoading(true);
    setError('');
    try {
      const res = await Api.adminGetEntries(status === 'All' ? '' : status, date);
      const rawEntries = res.entries;
      const entriesList = typeof rawEntries === 'string'
        ? JSON.parse(rawEntries)
        : Array.isArray(rawEntries) ? rawEntries : [];
      setEntries(entriesList);
    } catch (err) {
      setError('Failed to fetch entries.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    if (activeTab === 'workwear') {
      const fetchEmployees = async () => {
        setIsLoadingEmployees(true);
        try {
          const res = await Api.listEmployees();
          setEmployees(res);
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoadingEmployees(false);
        }
      };
      fetchEmployees();
    }
  }, [activeTab]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchEntries();
  };

  const workwearRequests = employees.filter(e => e.WorkwearRequests);

  const generateMissingPINs = async () => {
    setPinGenState({
      isRunning: true,
      isComplete: false,
      total: 0,
      generated: 0,
      skipped: 0,
      failed: 0,
      currentEmployee: 'Loading employees...',
      progress: 0,
      errors: []
    })

    try {
      const employeesData = await Api.listEmployees()
      const allEmployees = Array.isArray(employeesData) ? employeesData : []

      const total = allEmployees.length

      // Collect all existing PINs into a Set
      const existingPINs = new Set(
        allEmployees
          .filter(emp =>
            emp.AccessPIN &&
            emp.AccessPIN.toString().trim() !== ''
          )
          .map(emp => emp.AccessPIN.toString().trim())
      )

      let generated = 0
      let skipped = 0
      let failed = 0
      const errors = []

      for (let i = 0; i < allEmployees.length; i++) {
        const emp = allEmployees[i]
        
        const empName = emp['Employee Full Name'] || emp.EmployeeID || 'Unknown'

        // Update current employee in UI
        setPinGenState(prev => ({
          ...prev,
          total,
          currentEmployee: empName,
          progress: Math.round((i / total) * 100),
          generated,
          skipped,
          failed
        }))

        // Skip if PIN already exists
        const existingPIN = emp.AccessPIN ? emp.AccessPIN.toString().trim() : ''
        
        if (existingPIN !== '') {
          skipped++
          continue
        }

        // Generate unique 4-digit PIN
        let pin = ''
        let attempts = 0
        do {
          pin = Math.floor(1000 + Math.random() * 9000).toString()
          attempts++
          if (attempts > 1000) break
        } while (existingPINs.has(pin))

        // Reserve PIN immediately
        existingPINs.add(pin)

        // Get SharePoint internal ID
        const spId = emp.ID || emp.id || emp.Id
        
        if (!spId) {
          failed++
          errors.push({ employee: empName, error: 'No SharePoint ID found' })
          continue
        }

        // Call API to update PIN
        try {
          await Api.updatePIN(spId, pin)
          generated++
        } catch (err) {
          failed++
          existingPINs.delete(pin)
          errors.push({ employee: empName, error: err.message || 'Update failed' })
        }

        // 300ms delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      // Final state
      setPinGenState({
        isRunning: false,
        isComplete: true,
        total,
        generated,
        skipped,
        failed,
        currentEmployee: 'Complete',
        progress: 100,
        errors
      })

    } catch (err) {
      setPinGenState(prev => ({
        ...prev,
        isRunning: false,
        isComplete: true,
        currentEmployee: 'Error',
        errors: [{ employee: 'System', error: err.message || 'Unknown error' }]
      }))
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #0d1c2d, #051424)',
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
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ fontSize: '17px', fontWeight: '700', color: 'var(--color-text)', letterSpacing: '0.01em' }}>Admin Panel</div>
        <div>
          <button 
            onClick={() => navigate('/admin/report')}
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: '600',
              marginRight: '12px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Monthly Report
          </button>
          <button onClick={logout} style={{
            color: 'var(--color-text-muted)',
            fontSize: '13px',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}>Logout</button>
        </div>
      </header>

      <div style={{ display: 'flex', margin: '0 16px 16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: '4px', border: '1px solid var(--border-subtle)', marginTop: '16px' }}>
        <div onClick={() => setActiveTab('entries')} style={{ flex: 1, padding: '10px', textAlign: 'center', fontSize: '14px', fontWeight: '600', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: activeTab === 'entries' ? 'var(--color-primary)' : 'transparent', color: activeTab === 'entries' ? 'white' : 'var(--color-text-muted)' }}>
          Entries
        </div>
        <div onClick={() => setActiveTab('workwear')} style={{ flex: 1, padding: '10px', textAlign: 'center', fontSize: '14px', fontWeight: '600', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: activeTab === 'workwear' ? 'var(--color-primary)' : 'transparent', color: activeTab === 'workwear' ? 'white' : 'var(--color-text-muted)' }}>
          Workwear Requests
        </div>
      </div>

      {activeTab === 'entries' && (
        <>
          {!showPinTool ? (
            <div style={{ margin: '0 16px 12px' }}>
              <button
                onClick={() => setShowPinTool(true)}
                disabled={pinGenState.isRunning}
                style={{
                  width: '100%',
                  padding: '11px',
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.25)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-warning)',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                🔑 Generate Missing Access PINs
              </button>
            </div>
          ) : (
            <div style={{
              margin: '0 16px 16px',
              background: 'rgba(245,158,11,0.05)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: 'var(--color-warning)'
                }}>
                  🔑 Access PIN Generator
                </span>
                {!pinGenState.isRunning && (
                  <button
                    onClick={() => {
                      setShowPinTool(false)
                      setPinGenState({
                        isRunning: false,
                        isComplete: false,
                        total: 0,
                        generated: 0,
                        skipped: 0,
                        failed: 0,
                        currentEmployee: '',
                        progress: 0,
                        errors: []
                      })
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-muted)',
                      fontSize: '20px',
                      cursor: 'pointer',
                      lineHeight: 1
                    }}
                  >
                    ×
                  </button>
                )}
              </div>

              {!pinGenState.isRunning && !pinGenState.isComplete && (
                <div>
                  <p style={{
                    fontSize: '12px',
                    color: 'var(--color-text-muted)',
                    marginBottom: '14px',
                    lineHeight: '1.6'
                  }}>
                    Generates unique 4-digit PINs for employees 
                    who do not have one. Employees with existing 
                    PINs are never modified. Safe to run multiple 
                    times.
                  </p>
                  <button
                    onClick={generateMissingPINs}
                    style={{
                      width: '100%',
                      padding: '13px',
                      background: 'var(--color-warning)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Start Generating PINs
                  </button>
                </div>
              )}

              {pinGenState.isRunning && (
                <div>
                  <div style={{
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '99px',
                    height: '6px',
                    marginBottom: '10px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: pinGenState.progress + '%',
                      background: 'var(--color-warning)',
                      borderRadius: '99px',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>

                  <p style={{
                    fontSize: '12px',
                    color: 'var(--color-text-muted)',
                    textAlign: 'center',
                    marginBottom: '12px'
                  }}>
                    {pinGenState.progress}% — {pinGenState.currentEmployee}
                  </p>

                  <div style={{
                    display: 'flex',
                    gap: '8px'
                  }}>
                    {[
                      { 
                        label: 'Generated', 
                        value: pinGenState.generated,
                        color: 'var(--color-success)'
                      },
                      { 
                        label: 'Skipped', 
                        value: pinGenState.skipped,
                        color: 'var(--color-text-secondary)'
                      },
                      { 
                        label: 'Failed', 
                        value: pinGenState.failed,
                        color: 'var(--color-danger)'
                      }
                    ].map(stat => (
                      <div key={stat.label} style={{
                        flex: 1,
                        textAlign: 'center',
                        background: 'rgba(255,255,255,0.04)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px 4px'
                      }}>
                        <div style={{
                          fontSize: '22px',
                          fontWeight: '800',
                          color: stat.color
                        }}>
                          {stat.value}
                        </div>
                        <div style={{
                          fontSize: '10px',
                          color: 'var(--color-text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginTop: '2px'
                        }}>
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pinGenState.isComplete && (
                <div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    {[
                      { 
                        label: 'Total Scanned', 
                        value: pinGenState.total,
                        color: 'var(--color-text)'
                      },
                      { 
                        label: 'PINs Generated', 
                        value: pinGenState.generated,
                        color: 'var(--color-success)'
                      },
                      { 
                        label: 'Already Had PIN', 
                        value: pinGenState.skipped,
                        color: 'var(--color-text-muted)'
                      },
                      { 
                        label: 'Failed', 
                        value: pinGenState.failed,
                        color: pinGenState.failed > 0
                          ? 'var(--color-danger)'
                          : 'var(--color-text-muted)'
                      }
                    ].map(stat => (
                      <div key={stat.label} style={{
                        background: 'rgba(255,255,255,0.04)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '12px',
                        textAlign: 'center'
                      }}>
                        <div style={{
                          fontSize: '26px',
                          fontWeight: '800',
                          color: stat.color
                        }}>
                          {stat.value}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: 'var(--color-text-muted)',
                          marginTop: '3px'
                        }}>
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {pinGenState.generated > 0 && (
                    <div style={{
                      background: 'rgba(16,185,129,0.1)',
                      border: '1px solid rgba(16,185,129,0.25)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 14px',
                      fontSize: '13px',
                      color: 'var(--color-success)',
                      textAlign: 'center',
                      marginBottom: '8px'
                    }}>
                      ✓ {pinGenState.generated} PINs generated 
                      successfully
                    </div>
                  )}

                  {pinGenState.errors.length > 0 && (
                    <div style={{
                      background: 'rgba(239,68,68,0.06)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 14px',
                      marginBottom: '8px'
                    }}>
                      <p style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: 'var(--color-danger)',
                        marginBottom: '6px'
                      }}>
                        Failed updates:
                      </p>
                      {pinGenState.errors.map((err, i) => (
                        <p key={i} style={{
                          fontSize: '11px',
                          color: 'var(--color-text-muted)',
                          marginBottom: '3px'
                        }}>
                          • {err.employee}: {err.error}
                        </p>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setPinGenState({
                      isRunning: false,
                      isComplete: false,
                      total: 0,
                      generated: 0,
                      skipped: 0,
                      failed: 0,
                      currentEmployee: '',
                      progress: 0,
                      errors: []
                    })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-text-muted)',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Run Again
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === 'entries' ? (
        <>
          <form onSubmit={handleApplyFilters} style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {['All', 'Pending', 'Approved', 'Rejected'].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setStatusFilter(s);
                fetchEntries(s);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-lg)',
                border: statusFilter === s ? '1px solid var(--color-primary)' : '1px solid var(--border-active)',
                backgroundColor: statusFilter === s ? 'var(--color-primary)' : 'transparent',
                color: statusFilter === s ? 'white' : 'var(--color-text-secondary)',
                fontSize: '13px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                boxShadow: statusFilter === s ? 'var(--shadow-button)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--color-text)',
              fontSize: '14px',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
          <button type="submit" style={{
            padding: '10px 16px',
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-button)'
          }}>
            Apply
          </button>
        </div>
      </form>

      <main style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {error ? (
          <div style={{ color: 'var(--color-danger)', textAlign: 'center' }}>{error}</div>
        ) : isLoading ? (
          <LoadingSpinner />
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--color-text-muted)', fontSize: '15px' }}>No entries found</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Array.isArray(entries) && entries.map((entry, idx) => (
              <div key={entry.ID || idx} style={{
                background: 'var(--bg-card)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                boxShadow: 'var(--shadow-card)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--color-text)' }}>{entry.EmployeeName || entry.EmployeeID || `ID: ${entry.ID}`}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginTop: '2px' }}>{formatWarsawDate(entry.WorkDate)}</div>
                  </div>
                  <StatusPill status={entry.Status?.Value || entry.Status} />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text)' }}>{entry.HoursWorked}</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>hours logged</div>
                </div>

                <button
                  onClick={() => navigate(`/admin/entry/${entry.ID}`, { state: { entry } })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'var(--color-text)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    marginTop: '12px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  Review Details
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
        </>
      ) : (
      <main style={{ flex: 1, padding: '4px 0 20px', display: 'flex', flexDirection: 'column' }}>
        {isLoadingEmployees ? (
          <LoadingSpinner />
        ) : workwearRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)', fontSize: '15px' }}>
            No workwear requests found
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {workwearRequests.map((emp) => (
              <div key={emp.ID} style={{
                margin: '0 16px 10px',
                padding: '16px',
                background: 'var(--bg-card)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-card)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--color-text)' }}>
                    {emp['Employee Full Name'] || emp.EmployeeFullName || emp.Title || 'Employee'}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    ID: {emp.EmployeeID}
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                  {emp.WorkwearRequests.split(', ').map((req, i) => (
                    <div key={i} style={{
                      background: 'rgba(37,99,235,0.12)',
                      color: 'var(--color-primary)',
                      border: '1px solid rgba(37,99,235,0.25)',
                      padding: '4px 10px',
                      borderRadius: '99px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {req}
                    </div>
                  ))}
                </div>
                
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Request count: {emp.WorkwearRequestCount || 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      )}

      <div style={{ marginTop: 'auto' }}>
        <PoweredBy />
      </div>
    </div>
  );
}

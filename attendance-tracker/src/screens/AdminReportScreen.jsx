import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Api } from '../api/api';
import { getCurrentWarsawMonthKey, formatWarsawDate } from '../utils/time';
import LoadingSpinner from '../components/LoadingSpinner';
import PoweredBy from '../components/PoweredBy';

export default function AdminReportScreen() {
  const navigate = useNavigate();
  const [currentMonthKey, setCurrentMonthKey] = useState(getCurrentWarsawMonthKey());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [employees, setEmployees] = useState([]);
  
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await Api.listEmployees();
        setEmployees(res || []);
      } catch (err) {
        console.error("Failed to load employees", err);
      }
    };
    fetchEmployees();
  }, []);

  const fetchReport = async (monthKey, employeeId) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await Api.monthlyReport(monthKey, employeeId);
      console.log('monthlyReport raw response:', JSON.stringify(res));

      // Normalize rows — handle multiple possible field names from the flow
      let rows = res.rows || res.entries || res.items || res.data || [];
      if (typeof rows === 'string') rows = JSON.parse(rows);
      if (!Array.isArray(rows)) rows = [];

      const grandTotalHours = res.grandTotalHours ?? res.totalHours ?? res.total ?? 0;

      setReportData({ ...res, rows, grandTotalHours });
    } catch (err) {
      setError(err.message || 'Failed to fetch report.');
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(currentMonthKey, selectedEmployeeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApply = () => {
    fetchReport(currentMonthKey, selectedEmployeeId);
  };

  const handlePrevMonth = () => {
    const [year, month] = currentMonthKey.split('-');
    let newDate = new Date(year, parseInt(month) - 1 - 1, 1);
    let newYear = newDate.getFullYear();
    let newMonth = (newDate.getMonth() + 1).toString().padStart(2, '0');
    setCurrentMonthKey(`${newYear}-${newMonth}`);
  };

  const handleNextMonth = () => {
    const [year, month] = currentMonthKey.split('-');
    let newDate = new Date(year, parseInt(month) - 1 + 1, 1);
    let newYear = newDate.getFullYear();
    let newMonth = (newDate.getMonth() + 1).toString().padStart(2, '0');
    setCurrentMonthKey(`${newYear}-${newMonth}`);
  };

  const formatMonthDisplay = (key) => {
    const [year, month] = key.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const normalizeRow = (rawRow) => {
    const eId = rawRow.employeeId || rawRow.EmployeeID || rawRow.EmployeeId || '';
    const mappedEmp = employees.find(e => e.EmployeeID === eId || e.ID === eId || String(e.ID) === String(eId));
    
    let backendName = rawRow.employeeName || rawRow.EmployeeName || '';
    if (backendName === eId) backendName = '';
    
    const eName = (mappedEmp ? (mappedEmp['Employee Full Name'] || mappedEmp.FullName || mappedEmp.EmployeeName) : '') || backendName || eId;
    
    return {
      employeeId:   eId,
      employeeName: eName,
      workDate:     rawRow.workDate     || rawRow.WorkDate     || '',
      hoursWorked:  rawRow.hoursWorked  || rawRow.HoursWorked  || 0,
      comments:     rawRow.comments     || rawRow.Comments     || '',
      adminNotes:   rawRow.adminNotes   || rawRow.AdminNotes   || '',
      entryId:      rawRow.entryId      || rawRow.ID           || rawRow.id           || '',
    };
  };

  const exportCSV = () => {
    if (!reportData || !reportData.rows || reportData.rows.length === 0) return;

    const esc = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    
    const normalizedRows = reportData.rows.map(normalizeRow);
    const sortedRows = normalizedRows.sort((a, b) => {
      if (a.employeeId === b.employeeId) {
        return a.workDate.localeCompare(b.workDate);
      }
      return a.employeeId.localeCompare(b.employeeId);
    });

    const headers = ['Employee ID', 'Employee Name', 'Date', 'Hours Worked', 'Comments', 'Admin Notes'];
    const csvRows = [];
    csvRows.push(headers.map(esc).join(','));

    sortedRows.forEach(row => {
      csvRows.push([
        row.employeeId,
        row.employeeName,
        formatWarsawDate(row.workDate),
        row.hoursWorked,
        row.comments,
        row.adminNotes
      ].map(esc).join(','));
    });

    csvRows.push('');
    csvRows.push('');
    csvRows.push([
      '', '', '', '', 'Total Hours:', reportData.grandTotalHours
    ].map(esc).join(','));

    const csvString = csvRows.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${reportData.monthKey}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  const groupedData = [];
  if (reportData && reportData.rows && reportData.rows.length > 0) {
    const groupMap = {};

    reportData.rows.forEach(rawRow => {
      const row = normalizeRow(rawRow);
      if (!groupMap[row.employeeId]) {
        groupMap[row.employeeId] = {
          employeeId: row.employeeId,
          employeeName: row.employeeName,
          entries: [],
          subtotalHours: 0
        };
        groupedData.push(groupMap[row.employeeId]);
      }
      groupMap[row.employeeId].entries.push(row);
      groupMap[row.employeeId].subtotalHours += Number(row.hoursWorked) || 0;
    });
    
    groupedData.sort((a, b) => (a.employeeName || '').localeCompare(b.employeeName || ''));
    
    groupedData.forEach(group => {
      group.entries.sort((a, b) => (a.workDate || '').localeCompare(b.workDate || ''));
    });
  }

  const truncate = (str, len) => {
    if (!str) return "—";
    if (str.length > len) return str.substring(0, len) + "...";
    return str;
  };

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
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <button onClick={() => navigate('/')} style={{
          color: 'var(--color-primary)',
          fontSize: '15px',
          fontWeight: '600',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginRight: '15px'
        }}>← Back</button>
        <div style={{ fontSize: '17px', fontWeight: '700', color: 'var(--color-text)', letterSpacing: '0.01em' }}>Monthly Report</div>
      </header>

      <main style={{ flex: 1, padding: '20px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '6px', display: 'block', letterSpacing: '0.03em', textTransform: 'uppercase' }}>Month</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <button onClick={handlePrevMonth} style={{ padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', border: 'none', cursor: 'pointer' }}>{'<'}</button>
                <div style={{ flex: 1, textAlign: 'center', padding: '10px', fontSize: '15px', color: 'var(--color-text)' }}>{formatMonthDisplay(currentMonthKey)}</div>
                <button onClick={handleNextMonth} style={{ padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', border: 'none', cursor: 'pointer' }}>{'>'}</button>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '6px', display: 'block', letterSpacing: '0.03em', textTransform: 'uppercase' }}>Employee</label>
              <select 
                value={selectedEmployeeId} 
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'var(--color-text)',
                  fontSize: '15px',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              >
                <option value="" style={{ backgroundColor: '#0d1c2d', color: '#f1f5f9' }}>All Employees</option>
                {employees.map((emp, idx) => (
                  <option 
                    key={emp.EmployeeID || `emp-${idx}`} 
                    value={emp.EmployeeID || ''}
                    style={{ backgroundColor: '#0d1c2d', color: '#f1f5f9' }}
                  >
                    {emp['Employee Full Name'] || emp.FullName || emp.EmployeeName || 'Unknown'}
                  </option>
                ))}
              </select>
            </div>

            <div style={{width: '100%'}}>
              <button 
                onClick={handleApply}
                disabled={isLoading}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff',
                  padding: '12px 20px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '15px',
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: 'var(--shadow-button)'
                }}
              >
                {isLoading ? 'Loading...' : 'Apply'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ color: 'var(--color-danger)', padding: '12px', backgroundColor: 'var(--color-danger-bg)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <LoadingSpinner />
          </div>
        ) : reportData && (
          <>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{
                flex: 1,
                minWidth: '150px',
                background: 'var(--bg-card)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                boxShadow: 'var(--shadow-card)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', letterSpacing: '0.03em', textTransform: 'uppercase', marginBottom: '6px' }}>Total Hours</div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text)' }}>{Number(reportData.grandTotalHours).toFixed(1)}</div>
              </div>
              <div style={{
                flex: 1,
                minWidth: '150px',
                background: 'var(--bg-card)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                boxShadow: 'var(--shadow-card)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', letterSpacing: '0.03em', textTransform: 'uppercase', marginBottom: '6px' }}>Employees</div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text)' }}>{groupedData.length}</div>
              </div>
            </div>

            {groupedData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--color-text-muted)', fontSize: '15px' }}>
                No approved entries found for this period
              </div>
            ) : (
              <div style={{
                background: 'var(--bg-card)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-card)',
                overflow: 'hidden'
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--color-text-secondary)' }}>
                        <th style={{ padding: '14px 16px', fontWeight: '600' }}>Date</th>
                        <th style={{ padding: '14px 16px', fontWeight: '600' }}>Hours</th>
                        <th style={{ padding: '14px 16px', fontWeight: '600' }}>Comments</th>
                        <th style={{ padding: '14px 16px', fontWeight: '600' }}>Admin Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedData.map(group => (
                        <React.Fragment key={group.employeeId}>
                          <tr style={{ background: 'rgba(37,99,235,0.1)', borderBottom: '1px solid var(--border-subtle)' }}>
                            <td colSpan="4" style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--color-text)' }}>
                              {group.employeeName} — {group.subtotalHours.toFixed(1)}h
                            </td>
                          </tr>
                          {group.entries.map(entry => (
                            <tr key={entry.entryId} style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--color-text-secondary)' }}>
                              <td style={{ padding: '12px 16px' }}>{formatWarsawDate(entry.workDate)}</td>
                              <td style={{ padding: '12px 16px', color: 'var(--color-text)', fontWeight: '600' }}>{Number(entry.hoursWorked).toFixed(1)}</td>
                              <td style={{ padding: '12px 16px' }}>{truncate(entry.comments, 40)}</td>
                              <td style={{ padding: '12px 16px' }}>{truncate(entry.adminNotes, 40)}</td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                      <tr style={{ background: 'rgba(255,255,255,0.03)', borderTop: '2px solid var(--border-active)' }}>
                        <td colSpan="4" style={{ padding: '16px', textAlign: 'right', fontWeight: '700', color: 'var(--color-text)', fontSize: '15px' }}>
                          Grand Total: <span style={{color: 'var(--color-primary)'}}>{Number(reportData.grandTotalHours).toFixed(1)}h</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {reportData && reportData.rows && reportData.rows.length > 0 && (
        <button
          onClick={exportCSV}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 100,
            padding: '14px 24px',
            backgroundColor: 'var(--color-success)',
            color: '#fff',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 4px 15px rgba(16,185,129,0.4)',
            fontWeight: '700',
            border: 'none',
            cursor: 'pointer',
            fontSize: '15px'
          }}
        >
          Export CSV
        </button>
      )}

      <div style={{ marginTop: 'auto', paddingBottom: '20px' }}>
        <PoweredBy />
      </div>
    </div>
  );
}

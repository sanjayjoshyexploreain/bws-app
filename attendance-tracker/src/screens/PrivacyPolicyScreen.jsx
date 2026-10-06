import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicyScreen() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backButton}>
          ← Back to Home
        </button>
        <h1 style={styles.title}>Privacy Policy</h1>
        <p style={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div style={styles.content}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>1. Introduction</h2>
          <p style={styles.text}>
            Welcome to the BWS Portal. This application is an internal workforce management tool 
            developed and operated by Build & Weld Services (BWS). This Privacy Policy explains 
            how we collect, use, and protect your personal information when you use our mobile 
            and web applications.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>2. Information We Collect</h2>
          <p style={styles.text}>
            To facilitate employment tracking and work verification, we collect the following data:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}><strong>Personal Information:</strong> Employee Name, Employee ID, and Role.</li>
            <li style={styles.listItem}><strong>Attendance Data:</strong> Clock-in times, clock-out times, hours worked, and daily work comments.</li>
            <li style={styles.listItem}><strong>Photographs:</strong> Photos of completed work sites or safety compliance submitted via the camera during attendance submissions.</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>3. Camera and Photo Library Access</h2>
          <p style={styles.text}>
            The BWS Portal strictly requires access to your device's Camera to allow you to take 
            and upload required photographic evidence of your daily work. 
            <strong> We do not access your personal photo library, nor do we record audio or video.</strong> 
            The camera is only activated when you explicitly press the capture button within the app.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>4. How We Use Your Information</h2>
          <p style={styles.text}>
            Your data is used exclusively for internal business operations, including:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>Verifying daily attendance and calculating payroll.</li>
            <li style={styles.listItem}>Tracking project progress and generating reports for BWS administrators.</li>
            <li style={styles.listItem}>Fulfilling workwear requests based on your profile.</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>5. Data Sharing and Disclosure</h2>
          <p style={styles.text}>
            We do not sell, rent, or trade your personal information. Attendance data and work 
            photos may be shared internally with BWS management and, where contractually required, 
            summarized reports may be shared with the specific Client Company you are assigned to.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>6. Data Security</h2>
          <p style={styles.text}>
            All data transmitted between the BWS Portal and our servers is encrypted using standard 
            HTTPS/TLS protocols. We utilize secure backend middlewares to ensure that your Employee ID 
            cannot be spoofed or accessed by unauthorized users.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>7. Data Retention & Deletion Rights</h2>
          <p style={styles.text}>
            We retain your attendance data as required for tax, payroll, and auditing purposes. 
            Inside Settings there is a button called Account Deletion. When it is clicked, the account deletion request is sent to the HR, and they will delete it by checking the status.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>8. Contact Us</h2>
          <p style={styles.text}>
            If you have any questions or concerns regarding this Privacy Policy or how your data is 
            handled, please contact your BWS Manager or the BWS IT Department.
          </p>
        </section>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#030b14', // Matching the app's dark theme
    color: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '40px 20px',
  },
  header: {
    maxWidth: '800px',
    margin: '0 auto',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    paddingBottom: '20px',
    marginBottom: '40px',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#0ea5e9',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '0',
    marginBottom: '20px',
    display: 'inline-block',
  },
  title: {
    fontSize: '36px',
    fontWeight: '800',
    margin: '0 0 10px 0',
    color: '#fff',
  },
  lastUpdated: {
    color: '#64748b',
    fontSize: '14px',
    margin: '0',
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: 'rgba(10, 25, 47, 0.65)',
    borderRadius: '16px',
    padding: '40px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#38bdf8',
    marginBottom: '16px',
    marginTop: '0',
  },
  text: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#cbd5e1',
    margin: '0 0 12px 0',
  },
  list: {
    margin: '0',
    paddingLeft: '20px',
    color: '#cbd5e1',
  },
  listItem: {
    fontSize: '15px',
    lineHeight: '1.6',
    marginBottom: '8px',
  }
};

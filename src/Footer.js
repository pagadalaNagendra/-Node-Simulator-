import React from 'react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <p style={styles.text}>© 2024 Smart City Living lab All Rights Reserved.</p>

      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#1A3636',
    color: '#fff',
    padding: '10px 20px',
    position: 'fixed',
    left: 0,
    bottom: 0,
    width: '100%',
    textAlign: 'center',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  text: {
    margin: '5px 0',
  },
  links: {
    marginTop: '10px',
  },
  link: {
    color: '#61dafb',
    margin: '0 10px',
    textDecoration: 'none',
  },
};

export default Footer;

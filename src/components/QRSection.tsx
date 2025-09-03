const QRSection = () => {
  return (
    <div className="qr-section">
      <h2>Scan for Reporting Tool</h2>
      <div className="qr-container">
        <img 
          src="/qr-code.svg" 
          alt="QR Code for street intimidation resources" 
          className="qr-code"
        />
      </div>
      <p className="qr-description">
        Scan this QR code to access the reporting tool
      </p>
    </div>
  );
};

export default QRSection;

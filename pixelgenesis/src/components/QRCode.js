import QRCode from 'react-qr-code';

function QRCodeGenerator({ value, size = 256, bgColor = "#FFFFFF", fgColor = "#000000" }) {
  return (
    <div className="qr-code-container">
      <QRCode
        value={value}
        size={size}
        bgColor={bgColor}
        fgColor={fgColor}
        level="M"
        includeMargin={true}
      />
    </div>
  );
}

export default QRCodeGenerator;

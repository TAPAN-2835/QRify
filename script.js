let logoDataUrl = null;
let qrGenerated = false; // Track if the QR code has been generated

// Handle form submission
function handleGenerateButton(event) {
  event.preventDefault();
  generateQRCode();
  qrGenerated = true; // Mark QR code as generated
}

// Handle real-time updates after QR generation
document.getElementById("url-input").addEventListener("input", () => {
  if (qrGenerated) generateQRCode();
});
document.getElementById("color").addEventListener("input", () => {
  if (qrGenerated) generateQRCode();
});
document.getElementById("bgColor").addEventListener("input", () => {
  if (qrGenerated) generateQRCode();
});
document.getElementById("qr-caption").addEventListener("input", () => {
  if (qrGenerated) generateQRCode();
});
document.getElementById("logoUpload").addEventListener("change", handleLogoUpload);

function handleLogoUpload() {
  const file = document.getElementById("logoUpload").files[0];
  const toggleContainer = document.getElementById("toggleContainer"); // Reference the toggle container

  if (!file) {
    logoDataUrl = null;
    toggleContainer.style.display = "none"; // Hide the toggle container
    if (qrGenerated) generateQRCode();
    return;
  }

  toggleContainer.style.display = "inline-block"; // Show the toggle container

  const reader = new FileReader();
  reader.onload = (event) => {
    logoDataUrl = event.target.result;
    if (qrGenerated) generateQRCode();
  };
  reader.readAsDataURL(file);
}

function clearLogo() {
  const logoInput = document.getElementById("logoUpload"); // Reference the file input
  const toggleContainer = document.getElementById("toggleContainer"); // Reference the toggle container

  if (document.getElementById("cancel-btn").checked) {
    logoInput.value = ""; // Clear the file input
    logoDataUrl = null; // Reset the logo data
    toggleContainer.style.display = "none"; // Hide the toggle container
    document.getElementById("cancel-btn").checked = false; // Reset the toggle state

    if (qrGenerated) generateQRCode(); // Regenerate QR code without the logo
  }
}

function generateQRCode() {
  const url = document.getElementById("url-input").value;
  const fgColor = document.getElementById("color").value;
  const bgColor = document.getElementById("bgColor").value;
  const caption = document.getElementById("qr-caption").value;

  const canvas = document.getElementById("qr-canvas");
  const ctx = canvas.getContext("2d");

  if (!url) {
    document.getElementById("qr-output").innerHTML = "<p>Enter a URL to generate your QR code.</p>";
    document.getElementById("download-btn").style.display = "none";
    return;
  }

  QRCode.toCanvas(canvas, url, {
    color: {
      dark: fgColor,
      light: bgColor,
    },
    width: 300,
  }, (error) => {
    if (error) {
      alert("Error generating QR code");
      return;
    }

    if (logoDataUrl) {
      const logo = new Image();
      logo.src = logoDataUrl;
      logo.onload = () => {
        const logoSize = canvas.width * 0.2;
        const x = (canvas.width - logoSize) / 2;
        const y = (canvas.height - logoSize) / 2;
        ctx.drawImage(logo, x, y, logoSize, logoSize);

        if (caption) {
          ctx.font = "16px Arial";
          ctx.textAlign = "center";
          ctx.fillStyle = fgColor;
          ctx.fillText(caption, canvas.width / 2, canvas.height - 10);
        }
        finalizeQRCode(canvas);
      };
    } else {
      if (caption) {
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = fgColor;
        ctx.fillText(caption, canvas.width / 2, canvas.height - 10);
      }
      finalizeQRCode(canvas);
    }
  });
}

function finalizeQRCode(canvas) {
  const qrOutput = document.getElementById("qr-output");
  qrOutput.innerHTML = `<img src="${canvas.toDataURL()}" alt="QR Code" style="max-width: 300px;">`;

  const downloadBtn = document.getElementById("download-btn");
  downloadBtn.style.display = "inline-block";
  downloadBtn.onclick = () => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL();
    link.download = "qr-code-with-logo-and-caption.png";
    link.click();
  };
}
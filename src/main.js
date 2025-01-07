const canvas = document.getElementById('previewCanvas');
  const ctx = canvas.getContext('2d');
  const imageInput = document.getElementById('imageInput');
  const cropMethod = document.getElementById('cropMethod');
  const bgColor = document.getElementById('bgColor');
  const downloadBtn = document.getElementById('downloadBtn');

  const DP_SIZE = 640;
  const PREVIEW_SIZE = 300; // Smaller size for preview

  function processImage(img) {
    // Calculate dimensions for preview
    const scale = Math.min(PREVIEW_SIZE / img.width, PREVIEW_SIZE / img.height);
    const width = img.width * scale;
    const height = img.height * scale;
    const x = (PREVIEW_SIZE - width) / 2;
    const y = (PREVIEW_SIZE - height) / 2;

    // Set canvas dimensions
    canvas.width = PREVIEW_SIZE;
    canvas.height = PREVIEW_SIZE;
    canvas.style.width = `${PREVIEW_SIZE}px`;
    canvas.style.height = `${PREVIEW_SIZE}px`;

    // Clear canvas
    ctx.clearRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);

    // Apply background based on selected method
    if (cropMethod.value === 'blur') {
      applyBlurBackground(img);
    } else if (cropMethod.value === 'solid') {
      ctx.fillStyle = bgColor.value;
      ctx.fillRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
    }

    // Draw main image
    ctx.drawImage(img, x, y, width, height);
  }

  function applyBlurBackground(img) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // Create blurred background
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    tempCtx.drawImage(img, 0, 0);
    tempCtx.filter = 'blur(20px)';
    tempCtx.drawImage(tempCanvas, 0, 0);

    // Scale and draw blurred background
    const scale = Math.max(PREVIEW_SIZE / img.width, PREVIEW_SIZE / img.height);
    const width = img.width * scale;
    const height = img.height * scale;
    const x = (PREVIEW_SIZE - width) / 2;
    const y = (PREVIEW_SIZE - height) / 2;
    
    ctx.drawImage(tempCanvas, x, y, width, height);
  }

  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        processImage(img);
        canvas.style.display = 'block'; // Show canvas after image loads
      };
    }
  });

  cropMethod.addEventListener('change', () => {
    if (imageInput.files[0]) {
      const img = new Image();
      img.src = URL.createObjectURL(imageInput.files[0]);
      img.onload = () => processImage(img);
    }
  });

  bgColor.addEventListener('change', () => {
    if (cropMethod.value === 'solid' && imageInput.files[0]) {
      const img = new Image();
      img.src = URL.createObjectURL(imageInput.files[0]);
      img.onload = () => processImage(img);
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (!imageInput.files[0]) {
      alert('Please upload an image first!');
      return;
    }

    // Create full-size canvas for download
    const downloadCanvas = document.createElement('canvas');
    const downloadCtx = downloadCanvas.getContext('2d');
    downloadCanvas.width = DP_SIZE;
    downloadCanvas.height = DP_SIZE;

    const img = new Image();
    img.src = URL.createObjectURL(imageInput.files[0]);
    img.onload = () => {
      const scale = Math.min(DP_SIZE / img.width, DP_SIZE / img.height);
      const width = img.width * scale;
      const height = img.height * scale;
      const x = (DP_SIZE - width) / 2;
      const y = (DP_SIZE - height) / 2;

      // Apply background
      if (cropMethod.value === 'blur') {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        tempCtx.drawImage(img, 0, 0);
        tempCtx.filter = 'blur(20px)';
        tempCtx.drawImage(tempCanvas, 0, 0);
        downloadCtx.drawImage(tempCanvas, x, y, width, height);
      } else if (cropMethod.value === 'solid') {
        downloadCtx.fillStyle = bgColor.value;
        downloadCtx.fillRect(0, 0, DP_SIZE, DP_SIZE);
      }

      // Draw main image
      downloadCtx.drawImage(img, x, y, width, height);

      // Trigger download
      const link = document.createElement('a');
      link.download = 'whatsapp-dp.png';
      link.href = downloadCanvas.toDataURL('image/png');
      link.click();
    };
  });

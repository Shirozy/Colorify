document.addEventListener('DOMContentLoaded', () => {
  const imageFileInput = document.getElementById('image-file');
  const fileNameDisplay = document.getElementById('file-name');
  const colorPaletteSelect = document.getElementById('color-palette');
  const customColorInput = document.getElementById('custom-color-input');
  const customColorsInput = document.getElementById('colors');
  const submitButton = document.getElementById('submit-btn');
  const statusButton = document.getElementById('status-btn');
  const jobStatusDisplay = document.getElementById('job-status');
  const messageDisplay = document.getElementById('message');
  const jobIdInput = document.getElementById('job-id');

  let jobId = null;

  colorPaletteSelect.addEventListener('change', () => {
    if (colorPaletteSelect.value === 'custom') {
      customColorInput.style.display = 'block';
    } else {
      customColorInput.style.display = 'none';
    }
  });

  imageFileInput.addEventListener('change', () => {
    const file = imageFileInput.files[0];
    fileNameDisplay.textContent = file ? file.name : 'No file chosen';
  });

  submitButton.addEventListener('click', async () => {
    const file = imageFileInput.files[0];
    if (!file) {
      messageDisplay.textContent = 'Please choose an image file.';
      return;
    }

    let palette = colorPaletteSelect.value;

    if (palette === 'custom') {
      const customPalette = customColorsInput.value.trim();
      if (!customPalette) {
        messageDisplay.textContent = 'Please enter a custom color palette.';
        return;
      }
      palette = customPalette.split(',').map(color => color.trim());
    } else {
      const predefinedPalettes = {
        dracula: ['#282a36', '#f8f8f2', '#ff79c6', '#8be9fd', '#50fa7b', '#ffb86c', '#bd93f9', '#ff5555'],
        tokyonight: ['#1a1b26', '#f7768e', '#9ece6a', '#e0af68', '#7aa2f7', '#bb9af7', '#9d7cd8', '#7dcfff'],
        nord: ['#2e3440', '#bf616a', '#a3be8c', '#ebcb8b', '#81a1c1', '#b48ead', '#88c0d0', '#e5e9f0'],
        catppuccin: ['#F5E0DC', '#F2CDCD', '#F5A97B', '#F7E58A', '#A6D7F7', '#D7A5F7', '#D8B7FF', '#F5C2E7'],
        monokai: ['#272822', '#f92672', '#a6e22e', '#f4bf75', '#66d9ef', '#ae81ff', '#a1efe4', '#f8f8f2'],
        solarized: ['#002b36', '#dc322f', '#859900', '#b58900', '#268bd2', '#d33682', '#2aa198', '#eee8d5']
      };

      palette = predefinedPalettes[palette] || [];
    }

    messageDisplay.textContent = 'Processing...';

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('colors', palette.join(','));

      const response = await fetch('http://localhost:3000/v1/convert-async', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to submit the job');
      }

      const data = await response.json();
      jobId = data.jobId;
      
      jobIdInput.value = jobId;

      messageDisplay.textContent = `Job submitted successfully. Job ID: ${jobId}`;
    } catch (error) {
      messageDisplay.textContent = `Error: ${error.message}`;
    }
  });

  // Check job status
  statusButton.addEventListener('click', async () => {
    const jobIdInputValue = jobIdInput.value.trim();
    if (!jobIdInputValue) {
      jobStatusDisplay.textContent = 'Please enter a valid Job ID.';
      return;
    }

    jobStatusDisplay.textContent = 'Checking status...';

    try {
      const response = await fetch(`http://localhost:3000/v1/job-status/${jobIdInputValue}`);
      const data = await response.json();

      if (data.status === 'completed') {
        jobStatusDisplay.innerHTML = `Job completed! <br> Download the result: <a href="${data.result.outputPath}" target="_blank">Download Image</a>`;
      } else {
        jobStatusDisplay.textContent = 'Job still processing or not found.';
      }
    } catch (error) {
      jobStatusDisplay.textContent = `Error: ${error.message}`;
    }
  });
});

const submitButton = document.getElementById('submit-btn');
const statusButton = document.getElementById('status-btn');
const messageDiv = document.getElementById('message');
const jobStatusDiv = document.getElementById('job-status');
const imageFileInput = document.getElementById('image-file');
const colorPaletteSelect = document.getElementById('color-palette');
const customColorInput = document.getElementById('custom-color-input');
const colorsInput = document.getElementById('colors');
const jobIdInput = document.getElementById('job-id');
const fileInput = document.getElementById('image-file');
const fileNameDisplay = document.getElementById('file-name');

fileInput.addEventListener('change', () => {
  const fileName = fileInput.files[0]?.name || 'No file chosen';
  fileNameDisplay.textContent = fileName;
});

// Predefined color palettes
const palettes = {
  dracula: ['#ff79c6', '#bd93f9', '#ffb86c', '#50fa7b', '#8be9fd'],
  tokyonight: ['#7aa2f7', '#bb9af7', '#7dcfff', '#c0caf5', '#a9b1d6'],
  nord: ['#88c0d0', '#81a1c1', '#5e81ac', '#8fbcbb', '#d08770'],
  catppuccin: ['#f5c2e7', '#b4befe', '#a6e3a1', '#f38ba8', '#fab387'],
  monokai: ['#f92672', '#a6e22e', '#66d9ef', '#fd971f', '#ae81ff'],
  solarized: ['#268bd2', '#2aa198', '#b58900', '#859900', '#dc322f']
};

// Show/hide custom input field based on selected palette
colorPaletteSelect.addEventListener('change', () => {
  if (colorPaletteSelect.value === 'custom') {
    customColorInput.style.display = 'block';
  } else {
    customColorInput.style.display = 'none';
  }
});

submitButton.addEventListener('click', async () => {
  const file = imageFileInput.files[0];
  const selectedPalette = colorPaletteSelect.value;

  messageDiv.textContent = '';
  jobStatusDiv.textContent = '';

  if (!file) {
    messageDiv.textContent = 'Please select an image file!';
    messageDiv.style.color = '#bf616a';
    return;
  }

  let colors;
  if (selectedPalette === 'custom') {
    colors = colorsInput.value.trim();

    if (!colors) {
      messageDiv.textContent = 'Please provide a custom color palette!';
      messageDiv.style.color = '#bf616a';
      return;
    }

    const colorArray = colors.split(',');
    const validColors = colorArray.every(color => /^#[0-9A-F]{6}$/i.test(color));
    
    if (!validColors) {
      messageDiv.textContent = 'Please provide valid hex colors in the palette (e.g., #ff0000,#00ff00).';
      messageDiv.style.color = '#bf616a';
      return;
    }
  } else {
    colors = palettes[selectedPalette].join(',');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('colors', colors);

  try {
    messageDiv.textContent = 'Processing... Please wait.';
    messageDiv.style.color = '#5e81ac';

    const response = await fetch('http://localhost:3000/v1/convert-async', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      messageDiv.textContent = `Job submitted successfully! Your job ID: ${data.jobId}`;
      messageDiv.style.color = '#a3be8c';
      jobIdInput.value = data.jobId;  // Save job ID for later status check
    } else {
      messageDiv.textContent = data.error || 'An error occurred.';
      messageDiv.style.color = '#bf616a';
    }
  } catch (error) {
    console.error(error);
    messageDiv.textContent = 'Error submitting job!';
    messageDiv.style.color = '#bf616a';
  }
});

statusButton.addEventListener('click', async () => {
  const jobId = jobIdInput.value.trim();

  jobStatusDiv.textContent = '';

  if (!jobId) {
    jobStatusDiv.textContent = 'Please provide a job ID!';
    jobStatusDiv.style.color = '#bf616a';
    return;
  }

  try {
    jobStatusDiv.textContent = 'Checking job status...';
    jobStatusDiv.style.color = '#5e81ac';

    const response = await fetch(`http://localhost:3000/v1/job-status/${jobId}`);
    const data = await response.json();

    if (response.ok) {
      jobStatusDiv.innerHTML = `Status: ${data.status} <br> Output file: <a href="${data.result.outputPath}" target="_blank">Download</a>`;
      jobStatusDiv.style.color = '#a3be8c';
    } else {
      jobStatusDiv.textContent = data.error || 'An error occurred.';
      jobStatusDiv.style.color = '#bf616a';
    }
  } catch (error) {
    console.error(error);
    jobStatusDiv.textContent = 'Error checking job status!';
    jobStatusDiv.style.color = '#bf616a';
  }
});

const submitButton = document.getElementById('submit-btn');
const statusButton = document.getElementById('status-btn');
const messageDiv = document.getElementById('message');
const jobStatusDiv = document.getElementById('job-status');
const imageFileInput = document.getElementById('image-file');
const colorsInput = document.getElementById('colors');
const jobIdInput = document.getElementById('job-id');

submitButton.addEventListener('click', async () => {
  const file = imageFileInput.files[0];
  const colors = colorsInput.value.trim();

  messageDiv.textContent = '';
  jobStatusDiv.textContent = '';

  if (!file) {
    messageDiv.textContent = 'Please select an image file!';
    messageDiv.style.color = 'red';
    return;
  }

  if (!colors) {
    messageDiv.textContent = 'Please provide a color palette!';
    messageDiv.style.color = 'red';
    return;
  }

  const colorArray = colors.split(',');
  const validColors = colorArray.every(color => /^#[0-9A-F]{6}$/i.test(color));
  
  if (!validColors) {
    messageDiv.textContent = 'Please provide valid hex colors in the palette (e.g., #ff0000,#00ff00).';
    messageDiv.style.color = 'red';
    return;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('colors', colors);

  try {
    messageDiv.textContent = 'Processing... Please wait.';
    messageDiv.style.color = 'blue';

    const response = await fetch('http://localhost:3000/v1/convert-async', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      messageDiv.textContent = `Job submitted successfully! Your job ID: ${data.jobId}`;
      messageDiv.style.color = 'green';
    } else {
      messageDiv.textContent = data.error || 'An error occurred.';
      messageDiv.style.color = 'red';
    }
  } catch (error) {
    console.error(error);
    messageDiv.textContent = 'Error submitting job!';
    messageDiv.style.color = 'red';
  }
});

statusButton.addEventListener('click', async () => {
  const jobId = jobIdInput.value.trim();

  jobStatusDiv.textContent = '';

  if (!jobId) {
    jobStatusDiv.textContent = 'Please provide a job ID!';
    jobStatusDiv.style.color = 'red';
    return;
  }

  try {
    jobStatusDiv.textContent = 'Checking job status...';
    jobStatusDiv.style.color = 'blue';

    const response = await fetch(`http://localhost:3000/v1/job-status/${jobId}`);
    const data = await response.json();

    if (response.ok) {
      jobStatusDiv.innerHTML = `Status: ${data.status} <br> Output file: <a href="${data.result.outputPath}" target="_blank">Download</a>`;
      jobStatusDiv.style.color = 'green';
    } else {
      jobStatusDiv.textContent = data.error || 'An error occurred.';
      jobStatusDiv.style.color = 'red';
    }
  } catch (error) {
    console.error(error);
    jobStatusDiv.textContent = 'Error checking job status!';
    jobStatusDiv.style.color = 'red';
  }
});

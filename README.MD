# Colorify

An image color converter inspired by [ImageGoNord](https://github.com/Schroedinger-Hat/ImageGoNord-Web/tree/main).

## Image Conversion API

### **Endpoints**

---

### Convert Image (Async)

* **POST /v1/convert-async**
* **Request Body:**
    - `file`: The image file to convert (required)
    - `colors`: A comma-separated list of colors to tint the image with (optional). Only the first color will be applied.
    
    **Supported Color Formats**:
    - Hexadecimal (e.g., `#FF0000`, `#00FF00`)
    - RGB (e.g., `rgb(255, 0, 0)`, `rgb(0, 255, 0)`)
    - Named colors (e.g., `red`, `green`, `blue`)

* **Response:**
    - `jobId`: The ID of the conversion job (string)

**Example (JavaScript)**

```javascript
const axios = require('axios');

const file = 'path/to/image.jpg';
const colors = ['#FF0000', '#00FF00'];  // Only the first color will be applied

axios.post('http://localhost:3000/v1/convert-async', {
  file: file,
  colors: colors,
})
.then((response) => {
  console.log(`Job ID: ${response.data.jobId}`);
})
.catch((error) => {
  console.error(error);
});
```

---

### Get Job Status

* **GET /v1/job-status/:jobId**
* **Path Parameters:**
    - `jobId`: The ID of the conversion job (required)
* **Response:**
    - `status`: The status of the conversion job (string). Possible values: `pending`, `completed`, `failed`.
    - `outputPath`: The path to the converted image (string). This is returned only when the job is completed.

**Example (JavaScript)**

```javascript
const axios = require('axios');

const jobId = '1234567890';  // Replace with actual Job ID

axios.get(`http://localhost:3000/v1/job-status/${jobId}`)
.then((response) => {
  console.log(`Job Status: ${response.data.status}`);
  if (response.data.status === 'completed') {
    console.log(`Output Path: ${response.data.outputPath}`);
  }
})
.catch((error) => {
  console.error(error);
});
```

---

### Error Handling

The API returns standard HTTP error codes to indicate the outcome of a request. The following error codes are used:

- **400 Bad Request**: Invalid request data (e.g., missing or invalid file, invalid color format).
- **404 Not Found**: Job ID does not exist or is not found.
- **500 Internal Server Error**: Server-side error (e.g., image processing failure).

For example, if no file is provided in the request body:

```json
{
  "error": "You need to provide a valid image file"
}
```

---

### API Versioning

The API uses a version number in the URL to ensure backwards compatibility. The current version is `v1`.

---

### Security

The API uses **HTTPS** to encrypt data in transit. Make sure to use a secure connection when making requests in a production environment. For local development, you can use HTTP.

---

## Contributing

### Yay! You want to help?

We're thrilled to have you on board! Contributing to the Image Conversion API is a great way to give back to the community, learn new skills, and get your name in lights (well, at least in our GitHub contributors list).

### How to Contribute

1. **Fork the repo**: Click the "Fork" button on our GitHub repository to create a copy of the code in your own account.
2. **Choose an issue**: Browse our issue tracker to find a task that suits your skills and interests. If you can't find one, create a new issue to propose a feature or bug fix!
3. **Write code**: Make your changes, write tests, and ensure everything works as expected.
4. **Submit a pull request**: Send us your code changes for review. Make sure to include a clear description of what you've done and why.
5. **Get feedback**: Our team will review your code, provide feedback, and help you iterate until it's perfect.

### Contribution Guidelines

- **Commit messages**: Keep them concise, descriptive, and in the imperative mood (e.g., "Fix bug in image resizing").
- **Tests**: Write tests for your code to ensure it works as expected.
- **Documentation**: Update our documentation to reflect any changes you make.

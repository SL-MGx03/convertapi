# ConvertAI API

![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=nodedotjs)
![Platform](https://img.shields.io/badge/Platform-Replit-667881?style=for-the-badge&logo=replit)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)

A robust, self-hosted file conversion API designed to run on Replit. This backend service leverages the power of LibreOffice to handle complex document and presentation conversions, providing a simple REST API interface for your applications.

### **[Live API Status Page →](https://f37b2347-8d76-44a5-91e9-960f851f7f85-00-1jakbs91d8f57.pike.replit.dev/status)**

---

## Features

- **📄 Document Conversion:**
  - Word (DOCX) to PDF
  - PDF to Word (DOCX)
- **📊 Presentation Conversion:**
  - PowerPoint (PPTX) to PDF
  - PDF to PowerPoint (PPTX)
- **⚙️ Powered by LibreOffice:** Utilizes the headless capabilities of LibreOffice for high-fidelity conversions.
- **🧼 Automatic Cleanup:** All uploaded and converted files are automatically deleted from the server after the job is complete, ensuring no long-term storage of user data.
- **🚀 Deploy in Minutes:** Get your own private instance running on Replit with just a few clicks.
- **📈 Live Status Monitoring:** A beautiful, built-in status page to monitor server resources, uptime, and API health in real-time.

## Technology Stack

- **Backend:** Node.js, Express.js
- **File Uploads:** `multer`
- **Environment:** Replit
- **Core Conversion Engine:** LibreOffice (installed via the Nix package manager on Replit)
- **Frontend Status Page:** Vanilla HTML, CSS, and JavaScript.

---

## How to Deploy Your Own Instance on Replit

Follow these simple steps to deploy your own version of the ConvertAI API for free.

### Step 1: Fork the Repository

First, create your own copy of this repository by clicking the **"Fork"** button at the top right of this page. This will give you your own version of the code under your GitHub account.

### Step 2: Import into Replit

1.  Navigate to [replit.com](https://replit.com/).
2.  Click the **`+ Create Repl`** button in the top left.
3.  In the creation modal, click the **`Import from GitHub`** button on the top right.
4.  Paste the URL of **your forked repository** (e.g., `https://github.com/YourUsername/convertapi`).
5.  Click **`Import from GitHub`**.

![Replit Import from GitHub](https://docs.replit.com/images/programming-ide/import-from-github.png)

### Step 3: Run the Repl

- **Installation:** Once imported, Replit will automatically read the `.replit` and `replit.nix` files. It will begin installing the Nix environment, which includes Node.js and LibreOffice. This step may take a few minutes, and you will see "Re-evaluating Nix file..." in the console.
- **Execution:** After the environment is ready, Replit will run `npm install` and then execute the start command (`node index.js`).

Your API server is now running!

### Step 4: Get Your API URL

Replit automatically hosts your running application. The public URL for your API can be found at the top of the **"Webview"** tab. This is the base URL you will use to make requests.

---

## API Endpoints

All conversion endpoints are `POST` requests and expect a `multipart/form-data` body with a single file field named `file`.

### Conversions

-   **PPTX to PDF**
    -   `POST /convert/pptx-to-pdf`
-   **PDF to PPTX**
    -   `POST /convert/pdf-to-pptx`
-   **DOCX to PDF**
    -   `POST /convert/docx-to-pdf`
-   **PDF to DOCX**
    -   `POST /convert/pdf-to-docx`

#### Example Usage (using `curl`):

```bash
curl -X POST \
  -F "file=@/path/to/your/document.docx" \
  https://your-repl-url.replit.dev/convert/docx-to-pdf \
  -o "converted_document.pdf"
```

### Status Monitoring

-   **HTML Status Page**
    -   `GET /status`: Returns a full HTML page displaying the real-time status of the server.
-   **JSON Status Data**
    -   `GET /api/status`: Returns a JSON object with detailed resource usage, perfect for programmatic monitoring.

## Contributing

Contributions are welcome! If you have ideas for new features or have found a bug, please open an issue first to discuss it.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## My Tool
https://slmgx.live/convertAI

## License

This project is distributed under the MIT License. See the `LICENSE` file for more information.

---
*This repository owned by [SL-MGx03](https://github.com/SL-MGx03).*
*MY Website* [https://slmgx.live](https://slmgx.live)


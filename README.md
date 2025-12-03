# ConvertAI API

![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=nodedotjs)
![Platform](https://img.shields.io/badge/Platform-Render-4D2AFF?style=for-the-badge&logo=render)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)

A robust, self-hosted file conversion API. This backend service leverages LibreOffice for high‑fidelity document and presentation conversions, exposing a simple REST API interface for your applications.

---

## Features

- Document Conversion:
  - DOCX → PDF
  - PDF → DOCX
- Presentation Conversion:
  - PPTX → PDF
  - PDF → PPTX
- Powered by LibreOffice (headless) and `pdftotext` for PDF ingestion
- Automatic cleanup of uploaded and converted files
- Status endpoints for health checks and monitoring

---

## Deploy on Render

You can deploy either using Render’s native Node service or via Docker. The repo includes optional Dockerfile/render.yaml if you choose a Docker-based setup.

### Native deploy (no Docker)
1. Push the repository to GitHub.
2. In [Render](https://render.com), click “New” → “Web Service”.
3. Connect your GitHub repo.
4. Select the Node environment, and use the start command: `node index.js`.
5. Deploy. Render will set `PORT` automatically (the app uses `process.env.PORT`).

### Optional: Docker-based deploy
1. Ensure `Dockerfile` and `render.yaml` exist in the repo.
2. In Render, choose “New” → “Blueprint” and point to your repository.
3. Deploy. The Docker image installs `libreoffice` and `poppler-utils` and runs the service.

---

## API Endpoints

All conversion endpoints are `POST` requests and expect a `multipart/form-data` body with a single file field named `file`.

- POST `/convert/pptx-to-pdf`
- POST `/convert/pdf-to-pptx`
- POST `/convert/docx-to-pdf`
- POST `/convert/pdf-to-docx`

Example (curl):
```bash
curl -X POST \
  -F "file=@/path/to/your/document.docx" \
  https://your-service.onrender.com/convert/docx-to-pdf \
  -o "converted_document.pdf"
```

Status and health:
- GET `/` — health check
- GET `/status` — HTML status page (served from `public/index.html`)
- GET `/api/status` — JSON status data with system metrics

---

## Notes

- The service relies on `soffice` (LibreOffice) and `pdftotext` for certain PDF conversions. In Docker, these are installed via `apt`. For native Render, ensure your chosen environment includes these binaries.
- Default conversion timeout is 120 seconds. Adjust in `index.js` if needed.
- Uploaded and converted files are automatically deleted after the download response.

---

## Contributing

Contributions are welcome! If you have ideas for new features or found a bug, please open an issue first to discuss it.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## My Tool
https://slmgx.live/convertAI

## License

This project is distributed under the MIT License. See the `LICENSE` file for more information.

---
Project owned by [SL-MGx03](https://github.com/SL-MGx03). Website: [https://slmgx.live](https://slmgx.live)

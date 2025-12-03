FROM node:18-slim

# Install LibreOffice and pdftotext. Include core packages so soffice exists.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      libreoffice \
      libreoffice-common \
      libreoffice-core \
      libreoffice-writer \
      libreoffice-impress \
      libreoffice-calc \
      poppler-utils \
      ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node dependencies
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copy app
COPY . .

# Ensure dirs exist
RUN mkdir -p uploads public

# For debugging: show where soffice is
RUN which soffice || true && ls -l /usr/bin/soffice || true && ls -l /usr/lib/libreoffice/program/soffice || true

EXPOSE 3000
CMD ["npm", "start"]

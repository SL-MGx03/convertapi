FROM node:18-slim

# Install system dependencies: LibreOffice (soffice), pdftotext, Python 3 and pip
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      libreoffice \
      libreoffice-writer \
      libreoffice-impress \
      libreoffice-calc \
      poppler-utils \
      python3 \
      python3-pip \
      ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node dependencies with npm (avoids Yarn lockfile mixing issues)
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copy application source (Node, public/, python/)
COPY . .

# Install Python dependencies from python/requirements.txt if present
RUN if [ -f python/requirements.txt ]; then pip3 install -r python/requirements.txt; else echo "No python/requirements.txt found"; fi

# Ensure runtime dirs exist
RUN mkdir -p uploads public

# Optional: verify binaries exist (helpful for debugging)
RUN which soffice && which pdftotext && python3 --version

EXPOSE 3000
CMD ["npm", "start"]

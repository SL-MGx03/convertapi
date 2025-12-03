FROM node:18-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      libreoffice \
      poppler-utils \
      ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node dependencies
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copy application source
COPY . .

# Ensure directories exist
RUN mkdir -p uploads public

EXPOSE 3000
CMD ["npm", "start"]

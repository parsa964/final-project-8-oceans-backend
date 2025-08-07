# Use the official Bun image
FROM oven/bun:1.1.42-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy application code
COPY . .

# Expose both service ports
EXPOSE 3001 3002

# Start the application
CMD ["bun", "run", "index.ts"]
# Multi-stage build: combina Python + Node.js de forma eficiente
FROM python:3.12-alpine

# Instalar Node.js para rodar test harness no CI
RUN apk add --no-cache nodejs npm

# Instalar yaml globalmente (para harness do CI)
RUN npm install --global yaml

# Configurar NODE_PATH para módulos globais
ENV NODE_PATH=/usr/local/lib/node_modules

WORKDIR /app
COPY main.py runner.yml ./
CMD ["python3", "main.py"]

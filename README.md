# PDF-AI

## Introduction

PDF-AI is a modular application designed for advanced PDF processing and interaction using AI. It includes multiple microservices for tasks such as PDF conversion, AI-driven chat interfaces, and PDF viewing. The project aims to provide an efficient platform for PDF handling and AI integration.

## Features

- AI-driven question answering and chat based on uploaded PDFs.
- PDF conversion to various formats (e.g., text, Word, HTML).
- Frontend for user interaction, including a chat interface and PDF viewer.
- Modular microservice architecture.

## Project Structure

The repository is organized as follows:

```
PDF-AI/
│
├── ai-service/             # AI-related services
│   ├── app.py             # Main application for AI service
│   ├── Dockerfile         # Docker setup for AI service
│   └── requirements.txt   # Dependencies for AI service
│
├── file-converter-service/ # Service for PDF conversion
│   ├── app.py             # Main application for file conversion
│   ├── Dockerfile         # Docker setup for file conversion service
│   └── requirements.txt   # Dependencies for file conversion
│
├── pdf-service/            # Service for PDF uploading and processing
│   ├── app.py             # Main application for PDF service
│   ├── Dockerfile         # Docker setup for PDF service
│   └── requirements.txt   # Dependencies for PDF service
│
├── frontend/               # React-based user interface
│   ├── src/               # Source code for the frontend
│   ├── public/            # Static assets
│   ├── Dockerfile         # Docker setup for frontend
│   ├── package.json       # Node.js dependencies
│   └── README.md          # Frontend-specific instructions
│
├── docker-compose.yml      # Docker Compose setup for all services
├── LICENSE                 # License file
├── .gitignore              # Ignored files for Git
└── README.md               # Project documentation
```

## Installation

To set up and run the application locally:

1. Clone the repository:
    ```bash
    git clone https://github.com/KademEray/PDF-AI.git
    ```

2. Navigate to the project directory:
    ```bash
    cd PDF-AI
    ```

3. Start the application using Docker Compose:
    ```bash
    docker-compose up
    ```

4. Access the application in your browser at `http://localhost:3000` (default port).

## Components

### AI Service
- **Path**: `ai-service/`
- **Description**: Handles AI-driven tasks, such as answering questions and providing insights from uploaded PDFs.
- **Dependencies**: Install using `requirements.txt`.
- **Run**:
    ```bash
    python ai-service/app.py
    ```

### File Converter Service
- **Path**: `file-converter-service/`
- **Description**: Converts PDFs to other formats (text, Word, HTML).
- **Dependencies**: Install using `requirements.txt`.
- **Run**:
    ```bash
    python file-converter-service/app.py
    ```

### PDF Service
- **Path**: `pdf-service/`
- **Description**: Manages PDF uploads and basic processing tasks.
- **Dependencies**: Install using `requirements.txt`.
- **Run**:
    ```bash
    python pdf-service/app.py
    ```

### Frontend
- **Path**: `frontend/`
- **Description**: User interface for interacting with the application, including PDF viewing and chat functionality.
- **Run Locally**:
    ```bash
    cd frontend
    npm install
    npm start
    ```

## Development

### Prerequisites
- Python 3.9+
- Node.js 16+
- Docker and Docker Compose

### Setting Up Locally
1. Install dependencies for all Python services:
    ```bash
    pip install -r requirements.txt
    ```

2. Install frontend dependencies:
    ```bash
    cd frontend
    npm install
    ```

## Contributors

- [KademEray](https://github.com/KademEray) - Project Creator and Maintainer

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

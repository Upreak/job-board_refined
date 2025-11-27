# API Endpoints

This document details the API endpoints for the backend.

## Orchestrator API

### `POST /tasks`

Creates a new task.

*   **Request Body:**
    *   `task_type` (string): The type of task to create (e.g., "resume_parsing", "chat").
    *   `payload` (object): The data required for the task.
*   **Response:**
    *   `qid` (string): A unique identifier for the task.

### `GET /tasks/{qid}`

Retrieves the status and result of a task.

*   **URL Parameters:**
    *   `qid` (string): The unique identifier of the task.
*   **Response:**
    *   `qid` (string): The unique identifier of the task.
    *   `status` (string): The current status of the task (e.g., "queued", "in_progress", "completed", "failed").
    *   `result` (object): The result of the task, if completed.

### `GET /health`

Checks the health of the Orchestrator.

*   **Response:**
    *   `status` (string): "ok" if the service is healthy.

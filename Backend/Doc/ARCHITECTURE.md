# Backend Architecture

This document provides an overview of the backend architecture, which is designed to be scalable, maintainable, and robust. The architecture follows an Orchestrator-Worker model, which decouples business logic from task execution.

## Components

The backend is composed of three main components:

1.  **Orchestrator:** The central component responsible for managing workflows, handling API requests, and coordinating tasks.
2.  **Brain Module (Worker):** An independent worker that executes long-running and computationally intensive tasks, such as AI processing.
3.  **Task Queue (Celery with Redis):** A message broker that facilitates communication between the Orchestrator and the Brain Module.

## Workflow

1.  **API Request:** The frontend sends a request to the Orchestrator's API.
2.  **Task Creation:** The Orchestrator creates a new task in the database and dispatches it to the task queue.
3.  **Task Execution:** The Brain Module picks up the task from the queue, executes it, and updates the task's status in the database.
4.  **Polling for Results:** The frontend polls the Orchestrator's API for the task's status and retrieves the results when the task is complete.

## API Endpoints

*   `POST /tasks`: Creates a new task.
    *   **Request Body:** `{ "task_type": "...", "payload": { ... } }`
    *   **Response:** `{ "qid": "..." }`
*   `GET /tasks/{qid}`: Retrieves the status and result of a task.
    *   **Response:** `{ "qid": "...", "status": "...", "result": { ... } }`
*   `GET /health`: Checks the health of the Orchestrator.

## Rulebook Engine

The Orchestrator uses a Rulebook Engine to determine the workflow for each task type. The rulebook is defined in `Backend/rulebook/workflows.yaml` and allows for flexible and data-driven workflows.

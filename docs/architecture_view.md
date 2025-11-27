# Architecture View

This document provides a high-level overview of the system architecture.

## System Components

The system is composed of the following components:

*   **Frontend:** A React-based single-page application that provides the user interface.
*   **Backend:** A Python-based backend that handles business logic, data processing, and communication with the AI/LLM.

## Backend Architecture

The backend follows a scalable and maintainable Orchestrator-Worker model:

*   **Orchestrator:** A FastAPI application that serves as the main entry point for the backend. It is responsible for:
    *   Handling API requests from the frontend.
    *   Managing workflows using a Rulebook Engine.
    *   Dispatching tasks to the Brain Module via a task queue.
*   **Brain Module (Worker):** A Celery worker that executes long-running and computationally intensive tasks, such as:
    *   Parsing resumes.
    *   Generating chat responses.
*   **Task Queue (Celery with Redis):** A message broker that facilitates asynchronous communication between the Orchestrator and the Brain Module.
*   **Database (PostgreSQL):** A relational database that stores all application data, including user information, job postings, and task statuses.

## Data Flow

1.  A user interacts with the frontend, which sends an API request to the Orchestrator.
2.  The Orchestrator creates a task in the database and dispatches it to the task queue.
3.  The Brain Module worker picks up the task, processes it, and updates the task's status in the database.
4.  The frontend polls the Orchestrator for the task's status and displays the results to the user when the task is complete.

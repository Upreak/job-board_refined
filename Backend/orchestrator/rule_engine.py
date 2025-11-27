import yaml
from typing import Dict, Any

class RuleEngine:
    def __init__(self, rulebook_path: str):
        with open(rulebook_path, 'r') as f:
            self.rulebook = yaml.safe_load(f)

    def get_workflow(self, task_type: str) -> Dict[str, Any]:
        """
        Retrieves the workflow for a given task type.
        """
        return self.rulebook.get(task_type, {})

    def get_initial_tasks(self, task_type: str) -> list:
        """
        Gets the initial list of tasks for a given workflow.
        """
        workflow = self.get_workflow(task_type)
        return workflow.get("on_create", [])

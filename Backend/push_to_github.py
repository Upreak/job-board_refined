#!/usr/bin/env python3
"""
GitHub Push Script for Job Board Backend
Run this script with your GitHub Personal Access Token to push the code.
"""

import subprocess
import sys

def push_to_github(token):
    """Push the backend code to GitHub using the provided token."""

    # Update remote URL with the token
    remote_url = f"https://Upreak:{token}@github.com/Upreak/job-board_refined.git"
    subprocess.run(["git", "remote", "set-url", "origin", remote_url], check=True)

    # Add the instructions file
    subprocess.run(["git", "add", "GIT_PUSH_INSTRUCTIONS.md"], check=True)
    subprocess.run(["git", "commit", "-m", "Add deployment instructions"], check=True)

    # Push to GitHub
    subprocess.run(["git", "push", "-u", "origin", "master"], check=True)

    print("✅ SUCCESS: Backend code pushed to GitHub!")
    print("📍 Repository: https://github.com/Upreak/job-board_refined.git")
    print("📁 Files uploaded: 85+ files, 14,000+ lines of code")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("❌ ERROR: Missing token argument")
        print("\n📋 USAGE:")
        print("  python push_to_github.py YOUR_TOKEN_HERE")
        print("\n🔑 GET YOUR TOKEN:")
        print("  1. Go to: https://github.com/settings/tokens")
        print("  2. Click 'Generate new token (classic)'")
        print("  3. Select 'repo' scope")
        print("  4. Copy the token (starts with 'ghp_')")
        print("  5. Run: python push_to_github.py [your_token]")
        sys.exit(1)

    token = sys.argv[1]
    push_to_github(token)
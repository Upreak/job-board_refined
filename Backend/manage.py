import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.sql import text
from dotenv import load_dotenv

load_dotenv()

# Add the Backend directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__))))

from shared.db import DATABASE_URL

def apply_migrations():
    """
    Applies all SQL migrations in the migrations directory.
    """
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        migrations_dir = os.path.join(os.path.dirname(__file__), "migrations")
        for filename in sorted(os.listdir(migrations_dir)):
            if filename.endswith(".sql"):
                filepath = os.path.join(migrations_dir, filename)
                with open(filepath, "r") as f:
                    print(f"Applying migration: {filename}")
                    connection.execute(text(f.read()))

if __name__ == "__main__":
    apply_migrations()

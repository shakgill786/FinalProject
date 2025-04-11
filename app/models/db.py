from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# These are for production schema handling
import os
environment = os.getenv("FLASK_ENV")
SCHEMA = os.environ.get("SCHEMA")

def add_prefix_for_prod(table_name):
    if environment == "production":
        return f"{SCHEMA}.{table_name}"
    else:
        return table_name

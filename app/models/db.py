import os
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

environment = os.getenv('FLASK_ENV')
SCHEMA = os.getenv('SCHEMA')

def add_prefix_for_prod(table_name: str) -> str:
    # Only prefix if we're truly in production *and* SCHEMA is set
    if environment == 'production' and SCHEMA:
        return f"{SCHEMA}.{table_name}"
    return table_name

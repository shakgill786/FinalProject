from flask.cli import AppGroup
from app import app, db
from flask_migrate import Migrate
from app.models import *

migrate = Migrate(app, db)

# Register CLI commands
if __name__ == '__main__':
    app.run()

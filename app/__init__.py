from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config


db = SQLAlchemy()


def my_app():
	app = Flask(__name__,
			template_folder='front/templates',
            static_folder='front/static')
	app.config.from_object(Config)

	# Initialize extensions
	from app.routes import bp
	app.register_blueprint(bp)
	db.init_app(app)

	return app
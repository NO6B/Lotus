from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from config import Config

db = SQLAlchemy()
mail = Mail()


def my_app():

    app = Flask(__name__,
                template_folder='front',
                static_folder='front')
    app.config.from_object(Config)

    from app.routes import bp
    app.register_blueprint(bp)
    db.init_app(app)
    mail.init_app(app)

    return app

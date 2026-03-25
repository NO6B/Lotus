from app import db
from datetime import datetime

class Admin(db.Model):
    __tablename__ = "admin"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

class Client(db.Model):
    __tablename__ = "client"
    id = db.Column(db.Integer, primary_key=True)
    mail = db.Column(db.String(120), unique=True, nullable=False)
    nom = db.Column(db.String(50), nullable=False)
    prenom = db.Column(db.String(50), nullable=False)
    
    rendez_vous = db.relationship('RendezVous', backref='client', lazy=True)
    # Relation pour accéder aux messages du client
    messages = db.relationship('Message', backref='client', lazy=True)

class Creneau(db.Model):
    __tablename__ = "creneau"
    id = db.Column(db.Integer, primary_key=True)
    date_heure = db.Column(db.DateTime, nullable=False)
    statut = db.Column(db.String(20), default='libre')
    
    rendez_vous = db.relationship('RendezVous', backref='creneau', uselist=False, lazy=True)

class RendezVous(db.Model):
    __tablename__ = "rendez_vous"
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=False)
    creneau_id = db.Column(db.Integer, db.ForeignKey('creneau.id'), nullable=False, unique=True)
    statut = db.Column(db.String(50), default="en_attente_mail") 

class Message(db.Model):
    __tablename__ = "message"
    id = db.Column(db.Integer, primary_key=True)
    contenu = db.Column(db.Text, nullable=False)
    date_envoi = db.Column(db.DateTime, default=datetime.utcnow)
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=False)
from app import db
from datetime import datetime

class Admin(db.Model):
    __tablename__ = "admin"
    id = db.Column(db.Integer, primary_key=True)
    pseudo = db.Column(db.String(50), unique=True, nullable=False)
    mdp = db.Column(db.String(255), nullable=False)

class Client(db.Model):
    __tablename__ = "client"
    id = db.Column(db.Integer, primary_key=True)
    mail = db.Column(db.String(120), unique=True, nullable=False)
    nom = db.Column(db.String(50))
    prenom = db.Column(db.String(50))
    
    rendez_vous = db.relationship('RendezVous', backref='client', lazy=True)

class Message(db.Model):
    __tablename__ = "message"
    id = db.Column(db.Integer, primary_key=True)
    mail_expediteur = db.Column(db.String(120), nullable=False)
    contenu = db.Column(db.Text, nullable=False)
    date_envoi = db.Column(db.DateTime, default=datetime.utcnow)

class RendezVous(db.Model):
    __tablename__ = "rendez_vous"
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=False)
    date_heure = db.Column(db.DateTime, nullable=False)
    statut = db.Column(db.String(50), default="en_attente")

class VerificationOTP(db.Model):
    __tablename__ = "verification_otp"
    id = db.Column(db.Integer, primary_key=True)
    rendezvous_id = db.Column(db.Integer, db.ForeignKey('rendez_vous.id'), nullable=False)
    code = db.Column(db.String(6), nullable=False)
    date_expiration = db.Column(db.DateTime, nullable=False)
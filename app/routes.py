from flask import Blueprint, render_template, request
from .model import RendezVous, Message, Admin, Client, Creneau
from app import db

bp = Blueprint("main", __name__)

@bp.route('/admin/dashboard', methods=['GET', 'POST'])
def dashboard():

    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        admin = Admin.query.filter_by(username=username).first()

        if admin and admin.password_hash == password:
            return render_template('dashboard.html')

    rdv_en_attente = RendezVous.query.filter_by(statut='en_attente_mail').all()
    rdv_confirmes = RendezVous.query.filter_by(statut='confirme').all()


    tous_les_clients = Client.query.all()
    objet = Admin(
        username='admin',
        password_hash='admin'
    )
    db.session.add(objet)
    db.session.commit()

    return render_template(
        'dashboard.html', 
        rdv_en_attente=rdv_en_attente, 
        rdv_confirmes=rdv_confirmes,
        clients=tous_les_clients
    )

@bp.route('/')
@bp.route('/index', methods = ['POST', 'GET'])
def index():

    if request.method == 'POST':
        mail = request.form['mail']
        nom = request.form['nom']
        prenom = request.form['prenom']
        
        objet = Client(
            mail=mail,
            nom=nom,
            prenom=prenom
        )
        db.session.add(objet)
        db.session.commit()
        return render_template('index.html')
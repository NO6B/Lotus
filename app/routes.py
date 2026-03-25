from flask import Blueprint, render_template, request, redirect, url_for, jsonify, session
from datetime import datetime
from .model import RendezVous, Message, Admin, Client, Creneau
from app import db

bp = Blueprint("main", __name__)

def admin_requis(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return redirect(url_for('main.admin_login'))
        return f(*args, **kwargs)
    return decorated

@bp.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        mail = request.form.get('mail')
        nom = request.form.get('nom')
        prenom = request.form.get('prenom')
        date_str = request.form.get('date')
        heure_str = request.form.get('heure')
        contenu_message = request.form.get('message')

        if not mail or not date_str or not heure_str:
            return redirect(url_for('main.index'))

        client = Client.query.filter_by(mail=mail).first()
        if not client:
            client = Client(mail=mail, nom=nom, prenom=prenom)
            db.session.add(client)
            db.session.flush()

        date_heure_obj = datetime.strptime(f"{date_str} {heure_str}", "%Y-%m-%d %H:%M")

        creneau = Creneau.query.filter_by(date_heure=date_heure_obj).first()
        if creneau:
            # Créneau déjà pris
            return redirect(url_for('main.index'))

        creneau = Creneau(date_heure=date_heure_obj, statut='occupe')
        db.session.add(creneau)
        db.session.flush()

        rdv = RendezVous(client_id=client.id, creneau_id=creneau.id, statut='en_attente_mail')
        db.session.add(rdv)

        if contenu_message and contenu_message.strip():
            db.session.add(Message(contenu=contenu_message, client_id=client.id))

        db.session.commit()
        return redirect(url_for('main.index'))

    return render_template('index.html')


@bp.route('/admin/dashboard')
@admin_requis
def dashboard():
    return render_template('dashboard.html',
        rdv_en_attente=RendezVous.query.filter_by(statut='en_attente_mail').all(),
        rdv_confirmes=RendezVous.query.filter_by(statut='confirme').all(),
        clients=Client.query.all(),
        messages=Message.query.order_by(Message.date_envoi.desc()).all()
    )


@bp.route('/api/creneaux-occupes')
def get_creneaux_occupes():
    creneaux = Creneau.query.join(RendezVous).all()
    data = {}
    for c in creneaux:
        rdv = RendezVous.query.filter_by(creneau_id=c.id).first()
        if rdv:
            client = rdv.client
            msg = Message.query.filter_by(client_id=client.id).order_by(Message.date_envoi.desc()).first()
            cle = c.date_heure.strftime('%Y-%m-%d_%H:%M')
            data[cle] = {
                "client": f"{client.prenom} {client.nom}",
                "message": msg.contenu if msg else "Pas de message laissé."
            }
    return jsonify(data)


@bp.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if session.get('admin_logged_in'):
        return redirect(url_for('main.dashboard'))
    erreur = None
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        admin = Admin.query.filter_by(username=username).first()
        if admin and admin.password_hash == password:
            session['admin_logged_in'] = True
            session.permanent = True
            return redirect(url_for('main.dashboard'))
        erreur = "Email ou mot de passe incorrect."
    return render_template('login.html', erreur=erreur)


@bp.route('/admin/logout')
def logout():
    session.pop('admin_logged_in', None)
    return redirect(url_for('main.admin_login'))
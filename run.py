from app import my_app

app = my_app()

with app.app_context():
    from app import db
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
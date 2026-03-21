from app import my_app

app = my_app()


if __name__ == "__main__":
    app.run(debug=True, port=5000)
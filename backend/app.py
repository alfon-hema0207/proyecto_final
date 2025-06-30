from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from routes.auth import auth_bp
from routes.ventas import ventas_bp

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return "Servidor Flask funcionando!"

app.config["JWT_SECRET_KEY"] = "1234"
jwt = JWTManager(app)

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(ventas_bp, url_prefix="/api")

if __name__ == "__main__":
    app.run(debug=True)
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from models.user_model import create_user, find_user_by_username, verify_password

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "user")

    if not username or not password:
        return jsonify({"msg": "Faltan username o password"}), 400

    if find_user_by_username(username):
        return jsonify({"msg": "Usuario ya existe"}), 409

    created = create_user(username, password, role)
    if created:
        return jsonify({"msg": "Usuario creado"}), 201
    else:
        return jsonify({"msg": "Error al crear usuario"}), 500

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"msg": "Faltan username o password"}), 400

    user = find_user_by_username(username)
    if not user or not verify_password(user["password"], password):
        return jsonify({"msg": "Usuario o password incorrectos"}), 401

    access_token = create_access_token(identity={"username": user["username"], "role": user["role"]})
    return jsonify(access_token=access_token), 200

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    current_user = get_jwt_identity()
    return jsonify(current_user), 200
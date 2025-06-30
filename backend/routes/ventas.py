from flask import Blueprint, jsonify, request
from db import get_connection
from controllers.ventas_controller import (
    ventas_por_region,
    ventas_por_producto,
    ventas_por_cliente,
    ventas_por_tiempo
)

from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps

ventas_bp = Blueprint('ventas', __name__)

def role_required(allowed_roles):
    def decorator(fn):
        @wraps(fn)
        @jwt_required()  # exige token JWT válido
        def wrapper(*args, **kwargs):
            user = get_jwt_identity()
            if user["role"] not in allowed_roles:
                return jsonify({"msg": "No autorizado"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

@ventas_bp.route('/ventas/por-region', methods=['GET'])
#@role_required(["admin", "analyst"])  # solo usuarios con estos roles pueden acceder
def endpoint_ventas_por_region():
    try:
        year = request.args.get('year')
        category = request.args.get('category')
        conn = get_connection()
        resultados = ventas_por_region(conn, year, category)
        return jsonify(resultados)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@ventas_bp.route('/ventas/por-producto', methods=['GET'])
def endpoint_ventas_por_producto():
    try:
        year = request.args.get('year')
        region = request.args.get('region')
        category = request.args.get('category')
        conn = get_connection()
        resultados = ventas_por_producto(conn, year, region, category)
        return jsonify(resultados)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@ventas_bp.route('/ventas/por-cliente', methods=['GET'])
def endpoint_ventas_por_cliente():
    try:
        year = request.args.get('year')
        region = request.args.get('region')
        conn = get_connection()
        resultados = ventas_por_cliente(conn, year, region)
        return jsonify(resultados)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@ventas_bp.route('/ventas/por-tiempo', methods=['GET'])
def endpoint_ventas_por_tiempo():
    try:
        region = request.args.get('region')
        category = request.args.get('category')
        conn = get_connection()
        resultados = ventas_por_tiempo(conn, region, category)
        return jsonify(resultados)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()
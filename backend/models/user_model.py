from db import get_connection
from passlib.hash import bcrypt

def create_user(username, password, role="user"):
    conn = get_connection()
    cursor = conn.cursor()
    hashed_password = bcrypt.hash(password)
    try:
        cursor.execute(
            "INSERT INTO users (username, password, role) VALUES (%s, %s, %s)",
            (username, hashed_password, role)
        )
        conn.commit()
        return True
    except Exception as e:
        print(e)
        return False
    finally:
        cursor.close()
        conn.close()

def find_user_by_username(username):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    return user

def verify_password(stored_password, provided_password):
    return bcrypt.verify(provided_password, stored_password)

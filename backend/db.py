import mysql.connector
from config import db_config
from config import Config

def get_connection():
    return mysql.connector.connect(**db_config)

def get_connection():
    return mysql.connector.connect(
        host=Config.MYSQL_HOST,
        user=Config.MYSQL_USER,
        password=Config.MYSQL_PASSWORD,
        database=Config.MYSQL_DB
    )
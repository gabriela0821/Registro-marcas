from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

DATABASE = 'marcas.db'

def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS marcas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            titular TEXT NOT NULL,
            numero_registro TEXT UNIQUE NOT NULL,
            fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
            categoria TEXT NOT NULL,
            descripcion TEXT,
            estado TEXT DEFAULT 'Activa'
        )
    ''')
    conn.commit()
    conn.close()

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def home():
    return jsonify({"message": "API de Registros de Marca - Signa"})

@app.route('/marcas/', methods=['GET'])
def listar_marcas():
    conn = get_db_connection()
    marcas = conn.execute('SELECT * FROM marcas ORDER BY id DESC').fetchall()
    conn.close()
    
    result = []
    for marca in marcas:
        result.append({
            'id': marca['id'],
            'nombre': marca['nombre'],
            'titular': marca['titular'],
            'numero_registro': marca['numero_registro'],
            'fecha_registro': marca['fecha_registro'],
            'categoria': marca['categoria'],
            'descripcion': marca['descripcion'],
            'estado': marca['estado']
        })
    return jsonify(result)

@app.route('/marcas/', methods=['POST'])
def crear_marca():
    data = request.get_json()
    
    conn = get_db_connection()
    existing = conn.execute('SELECT id FROM marcas WHERE numero_registro = ?', (data['numero_registro'],)).fetchone()
    
    if existing:
        conn.close()
        return jsonify({"detail": "El número de registro ya existe"}), 400
    
    cursor = conn.execute('''
        INSERT INTO marcas (nombre, titular, numero_registro, categoria, descripcion, estado)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        data['nombre'], data['titular'], data['numero_registro'],
        data['categoria'], data.get('descripcion', ''), data.get('estado', 'Activa')
    ))
    
    marca_id = cursor.lastrowid
    marca = conn.execute('SELECT * FROM marcas WHERE id = ?', (marca_id,)).fetchone()
    conn.commit()
    conn.close()
    
    return jsonify({
        'id': marca['id'], 'nombre': marca['nombre'], 'titular': marca['titular'],
        'numero_registro': marca['numero_registro'], 'fecha_registro': marca['fecha_registro'],
        'categoria': marca['categoria'], 'descripcion': marca['descripcion'], 'estado': marca['estado']
    }), 201

@app.route('/marcas/<int:marca_id>', methods=['GET'])
def obtener_marca(marca_id):
    conn = get_db_connection()
    marca = conn.execute('SELECT * FROM marcas WHERE id = ?', (marca_id,)).fetchone()
    conn.close()
    
    if not marca:
        return jsonify({"detail": "Marca no encontrada"}), 404
    
    return jsonify({
        'id': marca['id'], 'nombre': marca['nombre'], 'titular': marca['titular'],
        'numero_registro': marca['numero_registro'], 'fecha_registro': marca['fecha_registro'],
        'categoria': marca['categoria'], 'descripcion': marca['descripcion'], 'estado': marca['estado']
    })

@app.route('/marcas/<int:marca_id>', methods=['PUT'])
def actualizar_marca(marca_id):
    data = request.get_json()
    conn = get_db_connection()
    
    marca = conn.execute('SELECT * FROM marcas WHERE id = ?', (marca_id,)).fetchone()
    if not marca:
        conn.close()
        return jsonify({"detail": "Marca no encontrada"}), 404
    
    update_fields = []
    values = []
    for field in ['nombre', 'titular', 'numero_registro', 'categoria', 'descripcion', 'estado']:
        if field in data:
            update_fields.append(f"{field} = ?")
            values.append(data[field])
    
    if update_fields:
        values.append(marca_id)
        query = f"UPDATE marcas SET {', '.join(update_fields)} WHERE id = ?"
        conn.execute(query, values)
    
    marca_updated = conn.execute('SELECT * FROM marcas WHERE id = ?', (marca_id,)).fetchone()
    conn.commit()
    conn.close()
    
    return jsonify({
        'id': marca_updated['id'], 'nombre': marca_updated['nombre'], 'titular': marca_updated['titular'],
        'numero_registro': marca_updated['numero_registro'], 'fecha_registro': marca_updated['fecha_registro'],
        'categoria': marca_updated['categoria'], 'descripcion': marca_updated['descripcion'], 'estado': marca_updated['estado']
    })

@app.route('/marcas/<int:marca_id>', methods=['DELETE'])
def eliminar_marca(marca_id):
    conn = get_db_connection()
    marca = conn.execute('SELECT * FROM marcas WHERE id = ?', (marca_id,)).fetchone()
    if not marca:
        conn.close()
        return jsonify({"detail": "Marca no encontrada"}), 404
    
    conn.execute('DELETE FROM marcas WHERE id = ?', (marca_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Marca eliminada exitosamente"})

@app.route('/marcas/buscar/<termino>')
def buscar_marcas(termino):
    conn = get_db_connection()
    search_term = f"%{termino}%"
    marcas = conn.execute('''
        SELECT * FROM marcas WHERE nombre LIKE ? OR titular LIKE ? OR numero_registro LIKE ?
        ORDER BY id DESC
    ''', (search_term, search_term, search_term)).fetchall()
    conn.close()
    
    result = []
    for marca in marcas:
        result.append({
            'id': marca['id'], 'nombre': marca['nombre'], 'titular': marca['titular'],
            'numero_registro': marca['numero_registro'], 'fecha_registro': marca['fecha_registro'],
            'categoria': marca['categoria'], 'descripcion': marca['descripcion'], 'estado': marca['estado']
        })
    return jsonify(result)

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=8000)
from flask import Flask, request, jsonify, make_response, render_template, redirect
from flask_socketio import SocketIO
import mysql.connector
import uuid
import random

DBuser = "drill"
DBpasswd = "test123"
DBdatabase = "drivequiz"

def connect():
    db = mysql.connector.connect(user=DBuser, password=DBpasswd,
                              host='localhost',
                              database=DBdatabase)
    cursor = db.cursor()
    return db, cursor

# Create a Flask app instance
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

websocket_pool = {}

@app.before_request
def cors_preflight():
    print("\n\n")
    if request.method == "OPTIONS":
        response = make_response()
        return response

@app.after_request
def after_request(response):
    print("after_request", request.method, request.url)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Max-Age"] = "3600"
    return response

@app.errorhandler(404)
def page_not_found(error):
    return redirect("/")

@app.route("/")
def hello():
    return render_template('index.html')

@app.route('/login', methods=["POST"])
def login():
    """Generate user token with arguemnts user and pass"""
    socketio.emit("message","test")
    db, cursor = connect()

    data = request.json

    cursor.execute("SELECT id FROM users WHERE username = %s AND password = %s;", (data["user"], data["pass"],))
    res = cursor.fetchone()
    print("HHH", res, data)

    if res:
        token = str(uuid.uuid4())

        cursor.execute("UPDATE users SET token = %s WHERE id = %s;", (token, res[0],))
        db.commit()

        db.close()
        return jsonify({"success": True, "token": token})
    else:
        db.close()
        return jsonify({"success": False})

@app.route("/getquizes")
def get_quizes():
    """Get all the quizes the user has avaliable to them"""
    db, cursor = connect()

    headers = request.headers
    args = request.args

    cursor.execute("SELECT id FROM users WHERE token = %s;", (headers["token"],))
    res = cursor.fetchone()

    if res:
        userid = res[0]

        cursor.execute("SELECT id, name FROM quizes WHERE userid = %s ORDER BY name;", (userid,))
        res = cursor.fetchall()
        
        db.close()
        return jsonify({"success": True, "data": res})
    else:
        db.close()
        return jsonify({"success": False})

@app.route("/getcode", methods=["POST"])
def get_code():
    """Check if a code is valid before refering to sockets"""
    data = request.json

    code = data["code"]
    name = data["name"]
    print("\n"*10)
    print(code, name)
    print(websocket_pool)

    if code in websocket_pool:
        if name not in websocket_pool[code]["children"]:
            return jsonify({"success": True})
        else:
            return jsonify({"success": False, "message": "Der er allerede en bruger med det navn"})
    else:
        return jsonify({"success": False, "message": "Koden er ikke genkendt"})



@socketio.on('connect')
def handle_connect():
    print('\n\nClient connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('\n\nClient disconnected')

@socketio.on('start_quiz')
def handle_start_quiz(data):
    token, id = data['token'], data['id']
    print(f'\n\n{token}, {id} connected')
    # Store the WebSocket connection in the pool with the given name
    # 'request.sid' contains the client's socket ID
    code = ''.join(random.choices("0123456789ABCDEF", k=5))
    print(code, id)

    db, cursor = connect()

    cursor.execute("SELECT id, name, image FROM questions WHERE quizid = %s;", (id,))
    res = cursor.fetchall()
    cursor.execute("SELECT name FROM quizes WHERE id = %s;", (id,))
    name = cursor.fetchall()

    db.close()

    websocket_pool[code] = {"master": request.sid, "children": {}, "questions": res, "name": name[0]}
    print(websocket_pool)
    socketio.emit('server_code', {'code': code, 'questions': res}, room=request.sid)

@socketio.on('join_quiz')
def handle_join_quiz(data):
    print("\n\nJOIN QUIZ", data)
    websocket_pool[data["code"]]["children"][data["name"]] = {"sid": request.sid}
    websocket_pool[data["code"]]["children"][data["name"]]["awnser"] = -1
    websocket_pool[data["code"]]["children"][data["name"]]["score"] = 0

    socketio.emit('server_name', {"quizname": websocket_pool[data["code"]]["name"]}, room=request.sid)
    socketio.emit('server_join', {'name': data["name"]}, room=websocket_pool[data["code"]]["master"])

@socketio.on('next_question')
def handle_next_question(data):
    print("\n\nNEXT QUESTIN", data)

    db, cursor = connect()

    cursor.execute("SELECT id, name, correct FROM options WHERE questionid = %s;", (data["qid"],))
    res = cursor.fetchall()

    db.close()

    for name, val in websocket_pool[data["code"]]["children"].items():
        websocket_pool[data["code"]]["children"][name]["awnser"] = -1
        socketio.emit('server_question', {'options': res}, room=val["sid"])

@socketio.on('submit_awnser')
def handle_submit_awnser(data):
    print("\n\nSUBMIT AWNSER", data)

    db, cursor = connect()

    cursor.execute("SELECT correct FROM options WHERE id = %s;", (data["awnser"],))
    res = cursor.fetchone()

    db.close()

    websocket_pool[data["code"]]["children"][data["name"]]["awnser"] = data["awnser"]
    websocket_pool[data["code"]]["children"][data["name"]]["score"] += res[0]

@socketio.on('get_awnsers')
def handle_get_awnser(data):
    print("\n\nGET AWNSER", data)

    db, cursor = connect()

    cursor.execute("SELECT id, name, correct FROM options WHERE questionid = %s;", (data["qid"],))
    res = cursor.fetchall()

    cursor.execute("SELECT id, name, correct FROM options WHERE questionid = %s AND correct=%s;", (data["qid"],1,))
    correct = cursor.fetchone()

    db.close()

    socketio.emit('server_awnsers', {'awnsers': websocket_pool[data["code"]], 'options': res}, room=websocket_pool[data["code"]]["master"])
    print(res)
    for name, val in websocket_pool[data["code"]]["children"].items():
        print(val, correct[0])
        socketio.emit('server_score', {'status': val["awnser"] == correct[0]}, room=val["sid"])

    


if __name__ == '__main__':
    # Run the app on localhost at port 5000
    socketio.run(app, debug=True, host="0.0.0.0", ssl_context=("server.crt", "server.key"))

from flask import Flask, request
from flask import request
from flask import render_template
from flask_cors import CORS

from datetime import datetime

import sqlite3

from waitress import serve
#######################################################################################################
# create the Flask srv_app
srv_app = Flask(__name__)
CORS(srv_app)
#######################################################################################################
IP = '192.168.1.2'
PORT = '1111'
#######################################################################################################
def decode_ip(ip):
    addr = ip.split('.')[-1]
    if addr == '1':
        return 'gateway'
    elif addr == '2':
        return 'auth_server'
    else:
        return 'Неизвестный адрес'
    
def getDBAuth(token, ip='None'):
    try:
        with sqlite3.connect("tokens.sqlite", check_same_thread=False) as con:
            cur = con.cursor()
            data = cur.execute("SELECT login, password, type FROM token WHERE tkn='"+token+"';") 
            lgn, pwd, sitetype = data.fetchone()
            data = cur.execute("SELECT url, loginfield, passwordfield FROM link WHERE type='"+sitetype+"';")
            url, loginfield, passwordfield = data.fetchone()
            print('[', datetime.now().strftime('%d.%m.%Y %H:%M'), decode_ip(ip), ']', "Token accepted:", token)
            print('    ', url,":",lgn,":", pwd)
            return {"url":str(url), "loginfield":str(loginfield), "passwordfield":str(passwordfield),"login":str(lgn), "password":str(pwd), "succeed":True}
    except Exception as e:
        print('[', datetime.now().strftime('%d.%m.%Y %H:%M'), decode_ip(ip), ']', "Wrong token:", token)
        #print(e)
        return {"url":"", "loginfield":"", "passwordfield":"","login":"", "password":"", "succeed":False}
#######################################################################################################
# server POST interface
@srv_app.route('/auth', methods=['POST'])
def scheduler():
    request_data = request.get_json()
    token = request_data["token"]
    ip = request.environ['REMOTE_ADDR']
    auth = getDBAuth(token, ip)
    return auth
#######################################################################################################
# main loop
#if __name__ == '__main__':
#    srv_app.run(debug=True,port=PORT,host=IP)
#######################################################################################################
serve(srv_app, listen=IP+':'+PORT)
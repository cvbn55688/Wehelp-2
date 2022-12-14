from flask import *
# from attraction.attraction_system import attraction_system
# from auth.member_system import member_system
# from booking.booking_system import booking_system
# from order.order_system import order_system
from flask_jwt_extended import JWTManager
from datetime import timedelta
from controller.member_system import member_system
from controller.attraction_system import attraction_system
from controller.booking_system import booking_system



app=Flask(__name__,
    static_folder="../static",
    static_url_path="/",
    template_folder='../templates')
app.secret_key="test"
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.register_blueprint(attraction_system, url_prefix="")
app.register_blueprint(member_system, url_prefix="")
app.register_blueprint(booking_system, url_prefix="")
# app.register_blueprint(order_system, url_prefix="")

jwt = JWTManager(app)
jwt.init_app(app)
app.config["JWT_SECRET_KEY"] = "super-secret" 
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=30)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=7)


# Pages
@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")
@app.route("/member")
def member_center():
	return render_template("member_center.html")
@app.route("/history_order")
def history_order():
	return render_template("history_order.html")


app.run(host='0.0.0.0', port=3000, debug = True)


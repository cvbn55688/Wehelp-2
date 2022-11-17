from flask import *
import mysql.connector
from mysql.connector import pooling
from mysql.connector import Error

connection_pool = pooling.MySQLConnectionPool(
                                            host = 'localhost',
                                            port= "3306",
                                            user = 'root',
                                            password = 'password',
                                            database = 'website',
                                            pool_name="my_pool",
                                            pool_size = 5,
                                            charset="utf8"
                                            )

app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True

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

@app.route("/api/categories")
def categories():
	try:
		connection = connection_pool.get_connection()
		cursor = connection.cursor()
		cursor.execute('select categories from categories;')
		records = cursor.fetchall()
		data_list = []
		for i in records:
			data_list.append(i[0])
		data = {"data" : data_list}
		return data, 200
	except Exception as e:
		errorMes = {"error" : True, "message" : str(e)}
		return errorMes, 500
	finally:
		cursor.close()
		connection.close()

@app.route("/api/attraction/<attractionId>")
def attractionID(attractionId):
	try:
		connection = connection_pool.get_connection()
		cursor = connection.cursor()
		sql = 'select img, other_info from descrition where attraction_id = %s;'
		cursor.execute(sql, (attractionId,))
		records = cursor.fetchone()			
		records_img = records[0]
		records_img = records_img.split(",")
		records_img.pop()
		records_img = {"images" : records_img}
		records_info = records[1]
		records_info = (json.loads(records_info))
		records_info.update(records_img)
		data = {"data" : records_info}
		return data, 200
	except Exception as e:
		try:
			if records == None:
				e = "景點編碼不正確"
				errorMes = {"error" : True, "message" : str(e)}
				return errorMes, 400
		except:
			errorMes = {"error" : True, "message" : str(e)}
			return errorMes, 500
	finally:
		cursor.close()
		connection.close()

@app.route("/api/attractions")
def attractions():
	try:
		page = request.args.get("page")
		keyword = request.args.get("keyword")
		if keyword == None:
			keyword = ''
		connection = connection_pool.get_connection()
		cursor = connection.cursor()
		sql = 'select descrition.img, descrition.other_info from attraction inner join categories on attraction.cat_id = categories.id inner join descrition on descrition.id = attraction.id where attraction.name like %s or categories.categories like %s order by attraction.id limit %s,12;'
		cursor.execute(sql, ("%"+keyword+"%", keyword, int(page)*12))
		records = cursor.fetchall()
		if records != []:
			data_list = []
			for record in records:
				record_img = record[0]
				record_img = record_img.split(",")
				record_img.pop()
				record_img = {"images" : record_img}
				record_info = record[1]
				record_info = (json.loads(record_info))
				record_info.update(record_img)
				data_list.append(record_info)
				if len(records) < 12:
					nextpage = None
				else:
					nextpage = int(page)+1
			data = {"nextPage" : nextpage , "data" : data_list}
			return data, 200
		else:
			data = {"nextPage" : None , "data" : []}
			return data, 200
	except Exception as e:
		if page == None or page.isdigit() == False:
			errorMes = {"error" : True, "message" : "page is not corract"}
			return errorMes, 500
		else:
			errorMes = {"error" : True, "message" : str(e)}
			return errorMes, 500
	finally:
			cursor.close()
			connection.close()

app.run(port=3000, debug = True)

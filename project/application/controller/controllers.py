from flask import  request, jsonify,send_file, current_app
import os,csv
from flask import render_template
from flask import current_app as app
from application.data.models import Venue,Show,Rate, Userlog,Rolesusers,User,ShowBooked
from application.data.data_access import get_venues
from flask_security import current_user, auth_required,hash_password,roles_required
import json
from application.data.database import db
from datetime import datetime
from application.jobs import tasks
from sqlalchemy.orm import aliased
from time import perf_counter_ns
from main import cache
from jinja2 import Template
from weasyprint import HTML
import uuid

def venue_to_json(venue):
    return {
        "venue_id": venue.venue_id,
        "venue_name": venue.venue_name,
        "location": venue.location,
        "place": venue.place,
        "screen": venue.Screen
        # Add more attributes as needed
    }

def rate_to_json(rate):
    return {
    "r_id": rate.r_id,
    "rating": rate.rating,
    "review":  rate.review,
    "showname":  rate.showname,
    "ruser_id":  rate.ruser_id,
    "rshow_id":  rate.rshow_id,
}






def show_to_json(show):
    return {
        "show_id": show.show_id,
        "show_name": show.show_name,
        "ratings": show.rating,
        "timings": show.timing.strftime("%d/%m/%Y %I:%M %p"),
        "tags": show.tags,
        "trailer":show.trailer,
        "movie_description":show.movie_description,
        "screenNumber": show.screenNumber,
        "seats": show.seats,
        "price": show.price,
        "amount_recieved": show.amount_recieved,
    }

def showbook_to_json(sb):
    return {
                "sb_id": sb.sb_id,
                "seats_booked": sb.seats_booked,
                "showname": sb.showname,
                "showtime": sb.showtime.strftime("%d/%m/%Y %I:%M %p"),
                "venuename": sb.venuename,
                "venueplace": sb.venueplace,
                "venuelocation": sb.venuelocation,
                "Total_price": sb.Total_price,
                "bshow_id": sb.bshow_id,
                "buser_id": sb.buser_id,
            }
# ----------- APIs ----------------------------------------------------------------------#


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/registers", methods=['POST'])
def registers():
    if request.method == 'POST':
        post_data = request.get_json()
        username = post_data["username"]
        email = post_data["email"]
        city = post_data["city"]
        password = post_data["password"]

        with current_app.app_context():
            user_datastore = current_app.security.datastore
            if not user_datastore.find_user(username=username) and not user_datastore.find_user(email=email):
                user_datastore.create_user(username=username, email=email, city=city, password=hash_password(password))
                db.session.commit()
                return jsonify({"message": "successfully registered!!"})
    return jsonify({"message": "registration unsuccess!!"})


@app.route('/export/<v_id>', methods=['GET', 'POST'])
def export_and_download(v_id):
    to = current_user.email
    job = tasks.export_report.apply_async(args=[v_id, to])
    return str(job), 200


def format_report(file,data={},name=""):
    with open(file) as file_:
        template=Template(file_.read())
        return template.render(details=data,user_name=current_user.username,name=name)
    
def create_pdf_report(data):
    message=format_report("templates/reporttemplate.html",data=data,name="PDF")
    html=HTML(string=message)
    filename=str(current_user.username)+".pdf"
    print(filename)
    html.write_pdf(target=filename)

def create_html_report(data):
    message = format_report("templates/reporttemplate.html", data=data,name="HTML")
    filename = str(current_user.username) + ".html"
    print(filename)
    
    with open(filename, 'w') as file:
        file.write(message)


@app.route("/generate/<name>")
@auth_required('token')
def main(name):
    id=current_user.id
    user=User.query.filter_by(id=id).first()
    show_booked_alias = aliased(ShowBooked)
    rate_alias = aliased(Rate)
    query = db.session.query(show_booked_alias, rate_alias).join(rate_alias, show_booked_alias.bshow_id == rate_alias.rshow_id)
    bdetails=query.all()
    l=[]
    for i,j in bdetails:
        if user.id==j.ruser_id:
            s={"showname":i.showname,"seats":i.seats_booked,"rating":j.rating,"review":j.review}
            l.append(s)
    if name=="pdf":
        create_pdf_report(l)
    else:
        create_html_report(l)        
    return jsonify({"message":"PDF generated"})



@app.route('/addroles', methods=['POST'])
@auth_required('token')
@roles_required('super admin')
def addroles():
    post_data=request.get_json()
    user_id=post_data["user_id"]
    role_id=post_data["role_id"]
    role=Rolesusers(user_id=user_id,role_id=role_id)
    db.session.add(role)
    db.session.commit()
    return jsonify({"message": "successfully added!!"})


@app.route('/trailer/<s_name>/')
def show_details(s_name):
    showalias = aliased(Show)
    srate= db.session.query(Show, Rate).select_from(Show).join(showalias, Show.show_id == Rate.rshow_id)
    showrate = srate.all()
    sratelist=[]
    for i , j in showrate:
        if i.show_name==s_name:
            d={
                "show_name":i.show_name,
                "trailer": i.trailer,
                "movie_description": i.movie_description,
                "rating":j.rating,
                "review": j.review
            }
            sratelist.append(d)
    return jsonify(sratelist)

    
@app.route('/userlog')
@auth_required('token')
def userlog():
    id = current_user.id
    time = datetime.now()
    log = Userlog.query.filter_by(luser_id=id).first()
    if log:
        # Update the existing log entry with the new time
        log.lastvisited = time
    else:
        # Create a new log entry
        log = Userlog(luser_id=id, lastvisited=time)
        db.session.add(log)
    
    db.session.commit()
    return jsonify({"message": "User log recorded or updated successfully"})

 
@app.route('/user/venue')
@cache.cached(timeout=20)
def user_venue():
    start=perf_counter_ns()
    ven=Venue.query.all()
    aVen=[venue_to_json(v) for v in ven]
    if ven:
        s = []
        for venue in ven:
            shows = venue.show
            sorted_shows = sorted(shows, key=lambda x: x.timing)
            s.append([show_to_json(s) for s in sorted_shows])
        d = {}
        for a in range(len(aVen)):
            d[json.dumps(aVen[a])] = s[a]
        stop=perf_counter_ns()
        print("Time taken", stop-start)
        return json.dumps(d)
    else:
        return jsonify({"error": "No venues found"}), 404

       

 
        



    
@app.route('/user/search', methods=['GET', 'POST'])
def search():
    if request.method == 'POST':
        post_data = request.get_json()
        city = post_data['city']
        ven = Venue.query.filter_by(place=city).all()
        aVen = [venue_to_json(v) for v in ven]
        if ven:
            s = []
            for venue in ven:
                shows = venue.show
                sorted_shows = sorted(shows, key=lambda x: x.timing)
                s.append([show_to_json(s) for s in sorted_shows])
            d = {}
            for a in range(len(aVen)):
                d[json.dumps(aVen[a])] = s[a]

            return json.dumps(d)
        else:
            return jsonify({"error": "No venues found"}), 404
    else:
        return jsonify({"error": "Invalid request method"}), 405

        
        

from application.jobs.workers import celery
from flask import send_file,jsonify
from datetime import datetime,timedelta
from celery.schedules import crontab
from httplib2 import Http
from jinja2 import Template
from application.jobs.email import send_email
from application.data.models import User, Userlog,ShowBooked,Rate,Venue
from application.data.database import db
from sqlalchemy.orm import aliased
import os,csv,zipfile


# --------------------------------periodic task---------------------------------------#
@celery.on_after_finalize.connect
def set_up_daily_task(sender, **kwargs):
   sender.add_periodic_task(crontab(hour=12, minute=30),send_daily_email.s(),name="send_email_task")

# --------------------------------------------------------------------------------------------------------------------#
@celery.on_after_finalize.connect
def set_up_monthly_task(sender, **kwargs):
   sender.add_periodic_task(crontab(day_of_month='1', hour=0, minute=0),send_monthly_email.s(),name="send_monthly_email")

# ----------------------------------------------------------------------------------------------------------------------------#
# @celery.on_after_finalize.connect
# def set_up_daily_task(sender, **kwargs):
#     sender.add_periodic_task(10.0, send_daily_email.s(),name="send_daily_email_task")

# @celery.on_after_finalize.connect
# def set_up_monthly_task(sender, **kwargs):
#     sender.add_periodic_task(20.0, send_monthly_email.s(),name="send_monthly_email_task")

# ---------------------------------task functions---------------------------------------------------#
@celery.task
def send_daily_email():
    users = aliased(User)
    userlog = db.session.query(User, Userlog).select_from(User).join(users, User.id == Userlog.luser_id)
    log = userlog.all()
    for i, j in log:
        if datetime.now() - j.lastvisited >= timedelta(hours=24):
            with open('templates/dailyalert.html') as file_:
                template = Template(file_.read())
                message = template.render(name=i.username, lastvisited=j.lastvisited)

            send_email(
                to=i.email,
                sub="Visit Alert",
                message=message
            )

    return "Emails have been sent to users who haven't visited in 24 hours!"

# ----------------------------------------------------------------------------------------#

@celery.task
def send_monthly_email():
    users=User.query.all()
    show_booked_alias = aliased(ShowBooked)
    rate_alias = aliased(Rate)
    query = db.session.query(show_booked_alias, rate_alias).join(rate_alias, show_booked_alias.bshow_id == rate_alias.rshow_id)
    bdetails=query.all()

    for user in users:
        l=[]
        for i,j in bdetails:
            if user.id==j.ruser_id:
                s={"showname":i.showname,"seats":i.seats_booked,"rating":j.rating,"review":j.review}
                l.append(s)
        with open('templates/monthlyreport.html') as file_:
                template = Template(file_.read())
                message = template.render(user_name=user.username,details=l)

        send_email(
                to=user.email,
                sub="Visit Alert",
                message=message
            )
    return "Monthly Emails have been sent to all users!"
        
# ----------------------------------------------------------------------------------------#
@celery.task
def export_report(v_id, to):
    ven = Venue.query.get(v_id)
    if ven:
        shows = ven.show
        show_booked_alias = aliased(ShowBooked)
        rate_alias = aliased(Rate)
        query = db.session.query(show_booked_alias, rate_alias).join(rate_alias, show_booked_alias.bshow_id == rate_alias.rshow_id)
        bdetails = query.all()
        showids = [i.show_id for i in shows]
        csv_data = [
            ["venuename", "Place", "location", "showname", "showsbooked", "ratings", "reviews"]
        ]
        processed_combinations = set()
        for i in showids:
            for j, k in bdetails:
                combination = (i, k.rating, k.review)
                if i == j.bshow_id and combination not in processed_combinations:
                    csv_data.append([
                        j.venuename, j.venueplace, j.venuelocation, j.showname, j.seats_booked, k.rating, k.review
                    ])
                    processed_combinations.add(combination)
        venuename_cleaned = ven.venue_name.replace(" ", "_")
        downloads_folder = os.path.expanduser("~/Desktop")
        csv_file_path = os.path.join(downloads_folder, f'{venuename_cleaned}.csv')

        mode = 'w' if not os.path.exists(csv_file_path) else 'a'
        with open(csv_file_path, mode, newline='') as csvfile:
            csv_writer = csv.writer(csvfile)
            csv_writer.writerows(csv_data)

        # Zip the CSV file
        zip_file_path = os.path.join(downloads_folder, f'{venuename_cleaned}.zip')
        with zipfile.ZipFile(zip_file_path, 'w') as zipf:
            zipf.write(csv_file_path, arcname=os.path.basename(csv_file_path))

        with open('templates/exportreport.html') as file_:
            template = Template(file_.read())
            message = template.render()

        send_email(
            to=to,
            sub="Visit Alert",
            message=message,
            file=zip_file_path  
        )
        return "Mail Sent to User!!"

    return jsonify({"message": "venue not found"})
    
    
# ----------------------------------------------------------------------------------------#
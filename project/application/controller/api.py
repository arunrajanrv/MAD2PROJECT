from flask_restful import Resource
from flask_restful import fields, marshal_with
from flask_restful import reqparse
from application.utils.validation import NotGivenError, NotFoundError
from application.data.models import User,Venue,VenueCreated,Show,ShowBooked,ShowCreated,Rate
from application.data.database import db
from datetime import datetime
import matplotlib.pyplot as plt
import matplotlib
from flask import current_app as app, jsonify
from flask_security import current_user,login_required, roles_required,auth_required
from sqlalchemy import or_
from time import perf_counter_ns
from main import cache



# ----------- Output Feilds -----------
admin_fields = {
    "admin_id": fields.Integer,
    "admin_name": fields.String,
    "mobile": fields.String,
    "password": fields.String,
}
# ----------------------------------------------------------------------------------------#
user_fields = {
    "id": fields.Integer,
    "user_name": fields.String,
    "email": fields.String,
    "city": fields.String,
    "password": fields.String,
}
# ----------------------------------------------------------------------------------------#
venue_fields = {
    "venue_id": fields.Integer,
    "venue_name": fields.String,
    "place": fields.String,
    "location": fields.String,
    "Screen": fields.String,
}
# ----------------------------------------------------------------------------------------#
show_fields = {
    "show_id": fields.Integer,
    "show_name": fields.String,
    "rating": fields.Integer,
    "timings": fields.DateTime(dt_format="rfc822"),
    "tags": fields.String,
    "screen number": fields.Integer,
    "seats": fields.Integer,
    "price": fields.Integer,
    "amount_recieved": fields.Integer,
}
# ----------------------------------------------------------------------------------------#
showbook_fields = {
    "sb_id": fields.Integer,
    "seats_booked": fields.Integer,
    "showname": fields.String,
    "showtime": fields.DateTime(dt_format="rfc822"),
    "venuename": fields.String,
    "venueplace": fields.String,
    "venueloaction": fields.String,
    "Total_price": fields.Integer,
    "bshow_id": fields.Integer,
    "buser_id": fields.Integer,
}
# ----------------------------------------------------------------------------------------#
rate_fields = {
    "r_id": fields.Integer,
    "rating": fields.Integer,
    "review": fields.String,
    "showname": fields.String,
    "ruser_id": fields.Integer,
    "rshow_id": fields.Integer,
}
# ----------------------------fuction for jsonify-----------------------------------------------#
def venue_to_json(venue):
    return {
        "venue_id": venue.venue_id,
        "venue_name": venue.venue_name,
        "location": venue.location,
        "place": venue.place,
        "screen": venue.Screen
    }

# ----------------------------------------------------------------------------------------#
def user_to_json(user):
    return {
        "user_name": user.username,
        "email":user.email,
        "city":user.city
    }
# ----------------------------------------------------------------------------------------#
def showbooked_to_json(sb):
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
# ----------------------------------------------------------------------------------------#
def rate_to_json(rate):
    return {
    "r_id": rate.r_id,
    "rating": rate.rating,
    "review":  rate.review,
    "showname":  rate.showname,
    "ruser_id":  rate.ruser_id,
    "rshow_id":  rate.rshow_id,
}

# ----------------------------------------------------------------------------------------#
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
# ----------------------------------------------------------------------------------------#
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

# ----------- Parsers -------------------------------------------------------------------#

venue_parse = reqparse.RequestParser()
venue_parse.add_argument("venue_name")
venue_parse.add_argument("place")
venue_parse.add_argument("location")
venue_parse.add_argument("screen")
# ----------------------------------------------------------------------------------------#
show_parse = reqparse.RequestParser()
show_parse.add_argument("show_name")
show_parse.add_argument("ratings")
show_parse.add_argument("timings")
show_parse.add_argument("tags")
show_parse.add_argument("trailer")
show_parse.add_argument("movie_description")
show_parse.add_argument("screenNumber")
show_parse.add_argument("seats")
show_parse.add_argument("price")
show_parse.add_argument("amount_recieved")

# ----------------------------------------------------------------------------------------#
user_parse = reqparse.RequestParser()
user_parse.add_argument("user_name")
user_parse.add_argument("email")
user_parse.add_argument("password")
user_parse.add_argument("city")
# ----------------------------------------------------------------------------------------#
showbook_parse = reqparse.RequestParser()
showbook_parse.add_argument("NOS")
# ----------------------------------------------------------------------------------------#
rate_parse = reqparse.RequestParser()
rate_parse.add_argument("rating")
rate_parse.add_argument("review")

# ----------------------------------------------------------------------------------------#
class UserTicketAPI(Resource):
    @cache.cached(timeout=20)
    @auth_required('token')
    def get(self,show_id):
        id=current_user.id
        sbd=ShowBooked.query.filter(ShowBooked.buser_id==id,ShowBooked.bshow_id==show_id).all()
        if sbd:
            return jsonify([showbook_to_json(sb) for sb in sbd])
        else:
            raise NotFoundError(status_code=404)

# ----------------------------------------------------------------------------------------#

class SummaryAPI(Resource):
    @auth_required('token')
    @roles_required('admin')
    @cache.cached(timeout=10)
    def get(self):
        id=current_user.id
        start=perf_counter_ns()
        a=User.query.filter_by(id=id).first()
        v=a.venue
        ven=[i.venue_name for i in v]
        s=[]
        for i in v:
            s.append(i.show)
        det=[]
        for j in s:
            de=[]
            for k in j:
                sname = k.show_name
                samnt = k.amount_recieved
                if samnt is not None:
                    de.append([sname, samnt])
            det.append(de)
        d={}
        for i in range(len(ven)):
            d[ven[i]]=det[i]
        for key, values in d.items():
            x_values = [val[0] for val in values]
            y_values = [val[1] for val in values]
            matplotlib.use('Agg')
            plt.clf()
            plt.bar(x_values, y_values)
            plt.xlabel('Title')
            plt.ylabel('Amount Recived')
            plt.title(f'{key}')
            plt.savefig("static/js/"+f"{key}.png")
        stop=perf_counter_ns()
        print("Time taken", stop-start)
        return jsonify(ven)
# ----------------------------------------------------------------------------------------#

class VenueAPI(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        id=current_user.id
        ad = User.query.filter_by(id=id).first()
        ven = ad.venue
        if ven != []:
            return jsonify([venue_to_json(venue) for venue in ven])
        else:
            raise NotFoundError(status_code=404)

    @marshal_with(venue_fields)
    @login_required
    @roles_required('admin')
    def put(self, venue_id):
        ven = Venue.query.filter(Venue.venue_id == venue_id).first()

        if ven is None:
            raise NotFoundError(status_code=404)

        args = venue_parse.parse_args()
        venue_name = args.get("venue_name", None)
        place = args.get("place", None)
        location = args.get("location", None)
        screen = args.get("screen", None)

        if venue_name is None:
            raise NotGivenError(
                status_code=400,
                error_code="VENUE001",
                error_message="Venue Name is required",
            )

        if place is None:
            raise NotGivenError(
                status_code=400,
                error_code="VENUE002",
                error_message="place is required",
            )

        if location is None:
            raise NotGivenError(
                status_code=400,
                error_code="VENUE003",
                error_message="Location is required",
            )

        if screen is None:
            raise NotGivenError(
                status_code=400,
                error_code="VENUE004",
                error_message="Number of Screen is required",
            )
        
        else:
            venue = Venue.query.filter(Venue.venue_name == venue_name,Venue.place == place,Venue.location == location,Venue.Screen == screen).first()
            if venue:
                raise NotFoundError(status_code=409)
            else:
                ven.venue_name = venue_name
                ven.place = place
                ven.location = location
                ven.Screen = screen
                db.session.commit()
                return ven, 201
                

        
    @login_required
    @roles_required('admin')
    def delete(self, venue_id):
        ven=Venue.query.filter_by(venue_id=venue_id).first()
        show=ven.show
        for i in show:
            db.session.delete(i)
        ShowCreated.query.filter_by(cvenue_id=venue_id).delete()
        VenueCreated.query.filter_by(cvenue_id=venue_id).delete()
        Venue.query.filter_by(venue_id=venue_id).delete()
        db.session.commit()
        return "successfully deleted", 200
        

    @marshal_with(venue_fields)
    @login_required
    @roles_required('admin')
    def post(self):
        admin_id=current_user.id
        args = venue_parse.parse_args()
        venue_name = args.get("venue_name", None)
        place = args.get("place", None)
        location = args.get("location", None)
        screen = args.get("screen", None)

        if venue_name is None:
            raise NotGivenError(
                status_code=400,
                error_code="VENUE001",
                error_message="Venue Name is required",
            )

        if place is None:
            raise NotGivenError(
                status_code=400,
                error_code="VENUE002",
                error_message="place is required",
            )

        if location is None:
            raise NotGivenError(
                status_code=400,
                error_code="VENUE003",
                error_message="Location is required",
            )

        if screen is None:
            raise NotGivenError(
                status_code=400,
                error_code="VENUE004",
                error_message="screen is required",
            )

        ven = Venue.query.filter(
            Venue.venue_name == venue_name,
            Venue.place == place,
            Venue.location == location,
        ).first()

        if ven is None:
            ven = Venue(
                venue_name=venue_name, place=place, location=location, Screen=screen
            )
            db.session.add(ven)
            db.session.commit()
            vid = ven.venue_id
            vc = VenueCreated(cadmin_id=admin_id, cvenue_id=vid)
            db.session.add(vc)
            db.session.commit()
            return ven, 201

        else:
            raise NotFoundError(status_code=409)

# ----------------------------------------------------------------------------------------#

class ShowAPI(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self, venue_id):
        ven = Venue.query.filter_by(venue_id=venue_id).first()
        sho = ven.show
        if sho != []:
            return jsonify([show_to_json(show) for show in sho])
        
        else:
            raise NotFoundError(status_code=404)
        
    @auth_required('token')
    @roles_required('admin')
    def put(self, show_id):
        show = Show.query.filter(Show.show_id == show_id).first()

        if show is None:
            raise NotFoundError(status_code=404)

        args = show_parse.parse_args()
        show_name = args.get("show_name", None)
        ratings = args.get("ratings", None)
        tags = args.get("tags", None)
        screenNumber = args.get("screenNumber", None)
        seats = args.get("seats", None)
        price = args.get("price", None)

        if show_name is None:
            raise NotGivenError(
                status_code=400,
                error_code="SHOW001",
                error_message="show_name is required",
            )

        if ratings is None:
            raise NotGivenError(
                status_code=400,
                error_code="SHOW002",
                error_message="ratings is required",
            )

        if tags is None:
            raise NotGivenError(
                status_code=400, error_code="SHOW003", error_message="tags is required"
            )

        if screenNumber is None:
            raise NotGivenError(
                status_code=400,
                error_code="SHOW004",
                error_message="screen number is required",
            )

        if seats is None:
            raise NotGivenError(
                status_code=400, error_code="SHOW005", error_message="seats is required"
            )

        if price is None:
            raise NotGivenError(
                status_code=400, error_code="SHOW006", error_message="Price is required"
            )
        else:
            show.show_name = show_name
            show.ratings = ratings
            show.tags = tags
            show.screenNumber = screenNumber
            show.price = price
            show.seats = seats
            db.session.commit()

            return {
                "show_id": show.show_id,
                "show_name": show.show_name,
                "rating": show.rating,
                "timings": show.timing.strftime("%d/%m/%Y %I:%M %p"),
                "tags": show.tags,
                "screen number": show.screenNumber,
                "seats": show.seats,
                "price": show.price,
                "amount_recieved": show.amount_recieved,
            }
    @auth_required('token')
    @roles_required('admin')
    def delete(self, show_id):
        show = Show.query.filter_by(show_id=show_id).scalar()
        cshow = ShowCreated.query.filter_by(cshow_id=show_id).scalar()

        if show is None or cshow is None:
            raise NotFoundError(status_code=404)

        try:
            db.session.delete(show)
            db.session.delete(cshow)
            db.session.commit()
            return "successfully deleted", 200
        except Exception as e:
            db.session.rollback()
            return f"Error deleting show: {str(e)}", 500

    @auth_required('token')
    @roles_required('admin')
    def post(self, venue_id):
        
        args = show_parse.parse_args()
        show_name = args.get("show_name", None)
        ratings = args.get("ratings", None)
        timings = args.get("timings", None)
        tags = args.get("tags", None)
        screenNumber = args.get("screenNumber", None)
        trailer = args.get("trailer", None)
        trailer="https://www.youtube.com/embed/"+str(trailer[17:])
        movie_description = args.get("movie_description", None)
        seats = args.get("seats", None)
        price = args.get("price", None)

        if show_name is None:
            raise NotGivenError(
                status_code=400,
                error_code="SHOW001",
                error_message="show_name is required",
            )

        if ratings is None:
            raise NotGivenError(
                status_code=400,
                error_code="SHOW002",
                error_message="ratings is required",
            )

        if timings is None:
            raise NotGivenError(
                status_code=400,
                error_code="SHOW003",
                error_message="timings is required",
            )

        if tags is None:
            raise NotGivenError(
                status_code=400, error_code="SHOW004", error_message="tags is required"
            )

        if screenNumber is None:
            raise NotGivenError(
                status_code=400,
                error_code="SHOW005",
                error_message="screen number is required",
            )

        if seats is None:
            raise NotGivenError(
                status_code=400, error_code="SHOW006", error_message="seats is required"
            )

        if price is None:
            raise NotGivenError(
                status_code=400, error_code="SHOW007", error_message="price is required"
            )

        timing_value = datetime.strptime(str(timings), "%Y-%m-%dT%H:%M")
        ti = str(timing_value)
        ven = Venue.query.filter_by(venue_id=venue_id).first()
        show = ven.show
        sname = []
        tim = []
        for s in show:
            sname.append(s.show_name)
            tim.append(s.timing.strftime("%Y-%m-%d %H:%M:%S"))
        if sname != [] and tim != []:
            if show_name in sname and ti not in tim:
                s = Show(
                    show_name=show_name,
                    rating=ratings,
                    timing=timing_value,
                    tags=tags,
                    trailer=trailer,
                    movie_description=movie_description,
                    screenNumber=screenNumber,
                    seats=seats,
                    price=price,
                )
                db.session.add(s)
                db.session.commit()
                s_id = s.show_id
                sc = ShowCreated(cshow_id=s_id, cvenue_id=venue_id)
                db.session.add(sc)
                db.session.commit()
                s = {
                    "show_id": s.show_id,
                    "show_name": s.show_name,
                    "rating": s.rating,
                    "timings": s.timing.strftime("%d/%m/%Y %I:%M %p"),
                    "tags": s.tags,
                    "screen number": s.screenNumber,
                    "seats": s.seats,
                    "price": s.price,
                    "amount_recieved": s.amount_recieved,
                }
                return s, 201
            if show_name not in sname:
                s = Show(
                    show_name=show_name,
                    rating=ratings,
                    timing=timing_value,
                    tags=tags,
                    trailer=trailer,
                    movie_description=movie_description,
                    screenNumber=screenNumber,
                    seats=seats,
                    price=price,
                )
                db.session.add(s)
                db.session.commit()
                s_id = s.show_id
                sc = ShowCreated(cshow_id=s_id, cvenue_id=venue_id)
                db.session.add(sc)
                db.session.commit()
                s = {
                    "show_id": s.show_id,
                    "show_name": s.show_name,
                    "rating": s.rating,
                    "timings": s.timing.strftime("%d/%m/%Y %I:%M %p"),
                    "tags": s.tags,
                    "screen number": s.screenNumber,
                    "seats": s.seats,
                    "price": s.price,
                    "amount_recieved": s.amount_recieved,
                }
                return s, 201
            else:
                raise NotGivenError(
                    status_code=409,
                    error_code="SHOW008",
                    error_message="time already exist",
                )
        else:
            s = Show(
                show_name=show_name,
                rating=ratings,
                timing=timing_value,
                tags=tags,
                trailer=trailer,
                movie_description=movie_description,
                screenNumber=screenNumber,
                seats=seats,
                price=price,
            )
            db.session.add(s)
            db.session.commit()
            s_id = s.show_id
            sc = ShowCreated(cshow_id=s_id, cvenue_id=venue_id)
            db.session.add(sc)
            db.session.commit()
        s = {
            "show_id": s.show_id,
            "show_name": s.show_name,
            "rating": s.rating,
            "timings": s.timing.strftime("%d/%m/%Y %I:%M %p"),
            "tags": s.tags,
            "screen number": s.screenNumber,
            "seats": s.seats,
            "price": s.price,
            "amount_recieved": s.amount_recieved,
        }
        return s, 201

# ----------------------------------------------------------------------------------------#

class BookdetailsAPI(Resource):
    @auth_required('token')
    @cache.cached(timeout=50)
    def get(self,show_id):
        sea=Show.query.filter_by(show_id=show_id).first()
        return jsonify(show_to_json(sea))

# ----------------------------------------------------------------------------------------#
class UserAPI(Resource):
    def get(self):
        users=User.query.all()
        us=[user_to_json(i) for i in users]
        return jsonify(us)

    @marshal_with(user_fields)
    @auth_required('token')
    def put(self, user_id):
        args = user_parse.parse_args()
        user_name = args.get("user_name")
        email = args.get("email")
        pswd = args.get("password")
        city = args.get("city")

        users = User.query.filter(
            User.user_name == user_name, User.email == email
        ).first()

        if user_name is None:
            raise NotGivenError(
                status_code=400,
                error_code="USER001",
                error_message="User_name is required",
            )

        if email is None:
            raise NotGivenError(
                status_code=400,
                error_code="USER002",
                error_message="email is required",
            )

        if pswd is None:
            raise NotGivenError(
                status_code=400,
                error_code="USER003",
                error_message="Password is required",
            )

        if users:
            raise NotGivenError(
                status_code=400,
                error_code="USER004",
                error_message="User_name or email already exist",
            )

        us = User.query.filter_by(id=user_id).first()
        if us:
            us.user_name = user_name
            us.email = email
            us.password = pswd
            us.city = city
            db.session.commit()
            return us, 200

        else:
            raise NotFoundError(status_code=404)

    @marshal_with(user_fields)
    def post(self):
        args = user_parse.parse_args()
        user_name = args.get("user_name")
        email = args.get("email")
        city = args.get("city")

        pswd = args.get("password")

        if user_name is None:
            raise NotGivenError(
                status_code=400,
                error_code="USER001",
                error_message="User_name is required",
            )

        if email is None:
            raise NotGivenError(
                status_code=400,
                error_code="USER002",
                error_message="email Number is required",
            )

        if pswd is None:
            raise NotGivenError(
                status_code=400,
                error_code="USER003",
                error_message="Password is required",
            )

        us = User.query.filter(
            or_(User.user_name == user_name, User.email == email)
        ).first()
        if us:
            raise NotFoundError(status_code=409)

        else:
            us = User(user_name=user_name,mobile=email, city=city, password=pswd)
            db.session.add(us)
            db.session.commit()
            return us, 201


# ----------------------------------------------------------------------------------------#
class ShowbookedAPI(Resource):
    @auth_required('token')
    def get(self):
        user_id=current_user.id
        sb = ShowBooked.query.filter_by(buser_id =user_id).all()

        if sb:
            sbd = [showbooked_to_json(sbbd) for sbbd in sb]
            return jsonify(sbd)
        else:
            raise NotFoundError(status_code=404)
        
    @auth_required('token')
    def post(self, show_id, venue_id):
        user_id=current_user.id
        args = showbook_parse.parse_args()
        Num = args.get("NOS")

        if Num is None:
            raise NotGivenError(
                status_code=400,
                error_code="SHOWBOOKED001",
                error_message="Number of seats is required",
            )

        show = Show.query.filter_by(show_id=show_id).first()
        if not show:
            raise NotFoundError(status_code=404)
        price = show.price
        Tprice = int(price) * int(Num)
        vn = Venue.query.filter_by(venue_id=venue_id).first()
        vname = vn.venue_name
        vplace = vn.place
        vlocation = vn.location
        s_name = show.show_name
        stime = show.timing
        sb = ShowBooked(
            seats_booked=int(Num),
            Total_price=int(Tprice),
            showname=s_name,
            showtime=stime,
            venuename=vname,
            venueplace=vplace,
            venuelocation=vlocation,
            bshow_id=show_id,
            buser_id=user_id,
        )
        db.session.add(sb)

        if int(show.seats) < int(Num):
            raise NotGivenError(
                status_code=400,
                error_code="SHOWBOOKED002",
                error_message="That many seats are not available",
            )

        if show.amount_recieved is None:
            show.amount_recieved = int(Tprice)
        else:
            show.amount_recieved += int(Tprice)
        show.seats -= int(Num)
        db.session.commit()
        sbd = {
            "sb_id": sb.sb_id,
            "seats_booked": sb.seats_booked,
            "showname": sb.showname,
            "showtime": sb.showtime.strftime("%d/%m/%Y %I:%M %p"),
            "venuename": sb.venuename,
            "venueplace": sb.venueplace,
            "venueloaction": sb.venuelocation,
            "Total_price": sb.Total_price,
            "bshow_id": sb.bshow_id,
            "buser_id": sb.buser_id,
        }
        return sbd, 200


# ----------------------------------------------------------------------------------------#
class RateAPI(Resource):
    @auth_required('token')
    def get(self):
        user_id=current_user.id
        rshow=Rate.query.filter_by(ruser_id=user_id).all()
        showlist=[]
        for i in rshow:
            showlist.append(i.showname)
        return jsonify(showlist)




    @marshal_with(rate_fields)
    @auth_required('token')
    def post(self,show_id):
        user_id=current_user.id
        args = rate_parse.parse_args()
        rate = int(args.get("rating"))
        review = args.get("review")
        if rate is None:
            raise NotGivenError(
                status_code=400,
                error_code="RATE001",
                error_message="Rating is required",
            )
        if review is None:
            raise NotGivenError(
                status_code=400,
                error_code="RATE002",
                error_message="Review is required",
            )

        rat = Rate.query.filter(
            Rate.ruser_id == user_id, Rate.rshow_id == show_id
        ).first()
        if rat:
            raise NotGivenError(
                status_code=400,
                error_code="RATE003",
                error_message="your rating and review already exist for this show",
            )
        else:
            sh = Show.query.filter_by(show_id=show_id).first()
            if sh:
                sn = sh.show_name
                shb = Rate(
                    rating=rate,
                    review=review,
                    showname=sn,
                    ruser_id=user_id,
                    rshow_id=show_id,
                )
                db.session.add(shb)
                sh.rating = (sh.rating + rate) // 2
                db.session.commit()
                return shb, 200
            else:
                raise NotFoundError(status_code=404)

# ----------------------------------------------------------------------------------------#
class ProfileAPI(Resource):
    @auth_required('token')
    def get(self):
        user_id=current_user.id
        user=User.query.filter_by(id=user_id).first()
        if user:
            return jsonify(user_to_json(user))
        else:
            raise NotFoundError(status_code=404)


# ----------------------------------------------------------------------------------------#

if __name__ == "__main__":
    app.run(debug=True, port=8080)

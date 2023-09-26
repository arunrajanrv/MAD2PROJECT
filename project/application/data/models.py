from .database import db
from datetime import datetime
from flask_security import RoleMixin,UserMixin,RegisterForm
from wtforms import StringField
from wtforms.validators import DataRequired
from sqlalchemy.orm import aliased



class ExtendedRegisterForm(RegisterForm):
    city = StringField('City', [DataRequired()])




# ----------- Models -----------------------------------------------------------#

class Rolesusers(db.Model):
    __tablename__ = 'rolesusers'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column('user_id', db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column('role_id', db.Integer, db.ForeignKey('role.id')) 


class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))



class Show(db.Model):
    __tablename__ = "show"
    show_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    show_name = db.Column(db.String, nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    trailer = db.Column(db.String, nullable=True)
    movie_description = db.Column(db.String, nullable=True)
    timing = db.Column(
        db.DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    tags = db.Column(db.String, nullable=False)
    screenNumber = db.Column(db.Integer, nullable=False)
    seats = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Integer, nullable=False)
    amount_recieved = db.Column(db.Integer, nullable=True)





class User(db.Model, UserMixin):
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    username = db.Column(db.String,nullable=False,unique=True)
    email = db.Column(db.String, unique=True, nullable=False)
    city = db.Column(db.String, nullable=True)
    password = db.Column(db.String, nullable=False)
    active = db.Column(db.Boolean(), default=True)
    fs_uniquifier = db.Column(db.String(256), unique=True)
    roles = db.relationship('Role', secondary='rolesusers',backref=db.backref('users', lazy='dynamic'))
    # Relationship with ShowBooked
    bookings = db.relationship("ShowBooked", backref="user")
    venue = db.relationship("Venue", backref="adminn", secondary="venuecreated")
    # Relationship with Rate
    ratings = db.relationship("Rate", backref="user")
    logs = db.relationship("Userlog", backref="logg")



class Venue(db.Model):
    __tablename__ = "venue"
    venue_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    venue_name = db.Column(db.String, nullable=False)
    place = db.Column(db.String, nullable=False)
    location = db.Column(db.String, nullable=False)
    Screen = db.Column(db.Integer, nullable=False)
    show = db.relationship("Show", backref="ven", secondary="showcreated")


class VenueCreated(db.Model):
    __tablename__ = "venuecreated"
    vc_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    cadmin_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    cvenue_id = db.Column(db.Integer, db.ForeignKey("venue.venue_id"), nullable=False)


class ShowCreated(db.Model):
    __tablename__ = "showcreated"
    sc_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    cshow_id = db.Column(db.Integer, db.ForeignKey("show.show_id"), nullable=False)
    cvenue_id = db.Column(db.Integer, db.ForeignKey("venue.venue_id"), nullable=False)

# ----------- Models -----------------------------------------------------------#




class ShowBooked(db.Model):
    sb_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    seats_booked = db.Column(db.Integer, nullable=False)
    showname = db.Column(db.String, nullable=False)
    showtime = db.Column(
        db.DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    venuename = db.Column(db.String, nullable=False)
    venuelocation = db.Column(db.String, nullable=False)
    venueplace = db.Column(db.String, nullable=False)
    Total_price = db.Column(db.Integer, nullable=False)
    bshow_id = db.Column(db.Integer, db.ForeignKey("show.show_id"), nullable=False)
    buser_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)


class Rate(db.Model):
    r_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    rating = db.Column(db.Integer, nullable=False)
    showname = db.Column(db.String, nullable=False)
    review = db.Column(db.String, nullable=False)
    ruser_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    rshow_id = db.Column(db.Integer, db.ForeignKey("show.show_id"), nullable=False)


class Userlog(db.Model):
    log_id=db.Column(db.Integer, autoincrement=True, primary_key=True)
    lastvisited=db.Column(
        db.DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    luser_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)


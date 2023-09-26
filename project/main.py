import os
from flask import Flask
from flask_restful import Api
from flask_security import Security, SQLAlchemySessionUserDatastore
from application.config import LocalDevelopmentConfig
from application.data.database import db
from application.data.models import User, Role,ExtendedRegisterForm
from application.jobs import workers
from flask_caching import Cache

app = None
api = None
celery = None
cache=None

import logging
logging.basicConfig(filename='debug.log', level=logging.DEBUG, format=f'%(asctime)s %(levelname)s %(name)s %(threadName)s : %(message)s')

def create_app():
    app = Flask(__name__, template_folder="templates")
    if os.getenv("ENV", "development") == "production":
        raise Exception("Currently no production config is setup.")
    else:
        print("Staring Local Development")
        app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    app.app_context().push()
    api = Api(app)
    app.app_context().push()
    user_datastore = SQLAlchemySessionUserDatastore(db.session, User, Role)
    app.security = Security(app, user_datastore,register_form=ExtendedRegisterForm)
    celery=workers.celery
    celery.conf.update(
        broker_url = app.config["CELERY_BROKER_URL"],
        result_backend = app.config["CELERY_RESULT_BACKEND"]
    )

    celery.Task=workers.ContextTask
    app.app_context().push()
    cache=Cache(app)
    app.app_context().push()
    return app, api, celery, cache


app, api, celery, cache = create_app()

# Import all the controllers so they are loaded
from application.controller.controllers import *


from application.controller.api import UserAPI
api.add_resource(UserAPI, "/api/user/<int:user_id>", "/api/user")

from application.controller.api import VenueAPI
api.add_resource(
    VenueAPI, "/api/venue/<int:venue_id>", "/api/venue/create", "/api/venue"
)

from application.controller.api import ShowAPI
api.add_resource(ShowAPI, "/api/show/create/<int:venue_id>", "/api/show/<int:show_id>","/api/show/admin/<int:venue_id>")

from application.controller.api import ShowbookedAPI
api.add_resource(
    ShowbookedAPI,
    "/api/showbook",
    "/api/showbook/create/<int:venue_id>/<int:show_id>",
)

from application.controller.api import RateAPI
api.add_resource(RateAPI, "/api/rate/create/<int:show_id>",
                 "/api/rate")


from application.controller.api import BookdetailsAPI
api.add_resource(BookdetailsAPI,"/api/book/<int:show_id>")


from application.controller.api import UserTicketAPI
api.add_resource(UserTicketAPI,"/api/ticket/<int:show_id>")

from application.controller.api import SummaryAPI
api.add_resource(SummaryAPI,"/api/summary")

from application.controller.api import ProfileAPI
api.add_resource(ProfileAPI,"/api/profile")



@app.errorhandler(404)
def page_not_found(e):
    # note that we set the 404 status explicitly
    return render_template('/security/404.html'), 404


@app.errorhandler(403)
def not_authorized(e):
    return render_template("/security/403.html"), 403

@app.errorhandler(405)
def not_authorized(e):
    return render_template("/security/403.html"), 405



if __name__ == "__main__":
    # Run the Flask app
    app.run(host='0.0.0.0', port=8080)

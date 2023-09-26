import CreateUser from "./components/createuser.js";
import Login from "./components/login.js"
import Admin from "./components/admin.js";
import User from "./components/user.js"
import venshow from "./components/venueshow.js";
import Book from "./components/book.js";
import Ticket from "./components/ticket.js";
import CitySearch from "./components/citysearch.js";
import Userdashboard from "./components/Userdashboard.js";
import Bookedshow from "./components/bookedshow.js";
import Logout from "./components/logout.js";
import Rate from "./components/rate.js";
import summry from "./components/summary.js";
import Trailer from "./components/trailer.js";
import Addroles from "./components/addroles.js";
import Profile from "./components/profile.js";
import PageNotFound from "./components/PageNotFound.js";

const routes = [
    
    {
      path: "/logout",
      name: "Logout",
      component: Logout,
    },
    {
      path: "/rate/:showId",
      name: "Rate",
      component: Rate,
    },
    {
      path: '/trailer/:showname/:strailer',
      name: 'Trailer',
      component: Trailer,
    },
    {
      path: "/summary",
      name: "summary",
      component: summry,
    },
    {
      path: "/profile",
      name: "Profile",
      component: Profile,
    },
    {
      path: "/bookedshow",
      name: "Bookedshow",
      component: Bookedshow,
    },
    {
      path: "/userdashboard",
      name: "Userdashboard",
      component: Userdashboard,
    },
    {
      path: "/citysearch/:city",
      name: "CitySearch",
      component: CitySearch,
    },
    {
      path: "/ticket/:showId",
      name: "Ticket",
      component: Ticket,
    },
    {
      path: "/login",
      name: "login",
      component: Login,
    //   children: [
    //     {
    //       path: "id", // The path here should be relative to the parent route ("/login")
    //       name: "loginId",
    //       component: LoginComponentId,
    //     },
    //   ],
    },
    {
      path: "/admin",
      name: "Admin",
      component: Admin,
    },
    {
      path: "/",
      name: "User",
      component: User,
    },
    {
      path: "/register",
      name: "CreateUser",
      component: CreateUser,
    },
    {
      path: "/book/:venueId/:showId",
      name: "Book",
      component: Book,
    },
    {
      path: "/addroles",
      name: "Addroles",
      component: Addroles,
    },    
    {
      path: "/venueshow/:venueId/:vname/:place/:loc",
      name: "VenueShow",
      component: venshow,
    },
    {
      path: "*",
      name: "PageNotFound",
      component: PageNotFound,
    },
  ];
  
  const router = new VueRouter({
    routes,
  });

  export default router;
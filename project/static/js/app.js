
import router from "./routers.js";


const store = new Vuex.Store({
  state: {
    user: {
      is_authenticated: false, 
      role: 'admin', 
    },
  },
})



new Vue({
  el: "#app",
  router: router,
  data: {
   
   
  },
  
});

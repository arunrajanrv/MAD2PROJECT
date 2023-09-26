import Userdashboard from "./Userdashboard.js";

const User=Vue.component("User",{
    template:` <div class="container">
    <Userdashboard />
  </div>`,
  components: {
    Userdashboard,
  },
  data() {
    return {
      id: null, // Initialize admin_id to null
    };
  },
  methods: {
    // getUserdetails(){
    //   fetch(`http://127.0.0.1:8080/`)
    // }
  },
})

export default User;
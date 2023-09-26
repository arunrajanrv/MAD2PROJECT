import Admindashboard from "./Admindashboard.js";
const Admin = Vue.component("Admin",{
  template: `
    <div class="container">
        <!-- Show Admindashboard.vue component when authenticated -->
        <Admindashboard  />
    </div>
    `,
    components: {
        Admindashboard,
      },
      data() {
        return {
          admin_id: null, // Initialize admin_id to null
        };
      },
      created() {
        // Retrieve the admin_id from the URL parameter and set it to the data property
      },
      methods: {},
});

export default Admin;
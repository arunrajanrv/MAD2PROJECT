const venshow = Vue.component("venshow", {
  template: `
    <div class="container">
    <div class="saml">
      <div class="ventitle">
        <h3>{{ venue_name }},&nbsp;</h3>
        <h3>{{ location }},&nbsp;</h3>
        <h3>{{ place }}</h3>
      </div>
      <button
                  type="button"
                  class="btn btn-warning btn-sm"
                  @click="refreshpage"
                >
                  Go back
                </button>
    </div>
    <div>
      <h1 v-if="Object.keys(show).length === 0">No shows have been added</h1>
      <table class="table table-hover" v-if="Object.keys(show).length > 0">
        <thead>
          <tr>
            <th scope="col">Show Name</th>
            <th scope="col">Rating</th>
            <th scope="col">Timing</th>
            <th scope="col">Screen Number</th>
            <th scope="col">Seats</th>
            <th scope="col">Price</th>
            <th scope="col">Amount Received</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in show" :key="i.show_id">
            <td>{{ i.show_name }}</td>
            <td>{{ i.ratings }}</td>
            <td>{{ i.timings }}</td>
            <td>{{ i.screenNumber }}</td>
            <td>{{ i.seats }}</td>
            <td>{{ i.price }}</td>
            <td>{{ i.amount_recieved }}</td>
            <td>
              <div class="btn-group" role="group">
                <button
                  type="button"
                  class="btn btn-secondary btn-mm"
                  @click="editShow(i)"
                >
                  Update
                </button>
                <button
                  type="button"
                  class="btn btn-danger btn-mm"
                  @click="deleteShow(i.show_id)"
                >
                  Delete
                </button>
                
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <button type="button" class="btn btn-success" @click="toggleShowForm">
    Add show
    </button>
    <form v-if="showForm" @submit.prevent="createShow">
      <div class="form-group">
        <label for="show_name">Show Name:</label><br />
        <input
          type="text"
          class="form-control"
          id="show_name"
          v-model="formData.show_name"
          required
        />
      </div>
      <div class="form-group">
        <label for="show_name">Screen Number:</label><br />
        <input
          type="number"
          class="form-control"
          id="screen"
          v-model="formData.screenNumber"
          required
        />
      </div>
      <div class="form-group">
        <label for="rating">Rating:</label><br />
        <input
          type="number"
          class="form-control"
          id="rating"
          v-model="formData.ratings"
          required
        />
      </div>
      <div class="form-group">
        <label for="timing">Show Time:</label><br />
        <input
          type="datetime-local"
          class="form-control"
          id="timing"
          v-model="formData.timings"
          required
        />
      </div>
      <div class="form-group">
        <label for="tags">Tags:</label><br />
        <input
          type="text"
          class="form-control"
          id="tags"
          v-model="formData.tags"
          required
        />
      </div>
      <div class="form-group">
        <label for="Trailer">Trailer link:</label><br />
        <input
          type="text"
          class="form-control"
          id="trailer"
          v-model="formData.trailer"
        />
      </div>
      <div class="form-group">
        <label for="Movie description">Movie description:</label><br />
        <input
          type="text"
          class="form-control"
          id="md"
          v-model="formData.movie_description"
        />
      </div>
      <div class="form-group">
        <label for="price">Seats:</label><br />
        <input
          type="number"
          class="form-control"
          id="seats"
          v-model="formData.seats"
          required
        />
      </div>
      <div class="form-group">
        <label for="price">Price:</label><br />
        <input
          type="number"
          class="form-control"
          id="price"
          v-model="formData.price"
          required
        />
      </div>
      <button type="submit" class="btn btn-primary">create</button>
    </form>
    <form v-if="showUpdateForm" @submit.prevent="updateShow">
      <div class="form-group">
        <label>show Name:</label>
        <input
          type="text"
          name="show_name"
          class="form-control"
          v-model="selectedShow.show_name"
          required
        />
      </div>
      <div class="form-group">
        <label for="show_name">Screen Number:</label><br />
        <input
          type="text"
          class="form-control"
          name="snumber"
          v-model="selectedShow.screenNumber"
          required
        />
      </div>
      <div class="form-group">
        <label>Rating:</label>
        <input
          type="text"
          name="rating"
          class="form-control"
          v-model="selectedShow.ratings"
          required
        />
      </div>
      <div class="form-group">
        <label>tags:</label>
        <input
          type="text"
          name="tags"
          class="form-control"
          v-model="selectedShow.tags"
          required
        />
      </div>
      <div class="form-group">
        <label for="price">Seats:</label><br />
        <input
          type="text"
          class="form-control"
          id="seats"
          name="seats"
          v-model="selectedShow.seats"
          required
        />
      </div>
      <div class="form-group">
        <label>Price:</label>
        <input
          type="text"
          name="price"
          class="form-control"
          v-model="selectedShow.price"
          required
        />
      </div>
      <div>
        <input class="btn btn-primary" type="submit" value="save" />
      </div>
    </form>
    <h4 style="color: red;" v-if="showmsg">{{ermsg}}</h4>
  </div>`,
  data() {
    return {
      venue_id: "",
      venue_name: "",
      showmsg:false,
      ermsg:"",
      place: "",
      location: "",
      show: [],
      showForm: false,
      selectedShow: {},
      showUpdateForm: false, // Initialize to false to hide the form initially
      formData: {
        show_name: "",
        screenNumber: null,
        ratings: null,
        timings: "",
        tags: "",
        trailer: "",
        movie_description: "",
        seats: null,
        price: null,
      },
    };
  },
  mounted() {
    this.venueshow(); // Fetch show data when the component is mounted
  },
  created() {
    this.venue_id = this.$route.params.venueId;
    this.venue_name = this.$route.params.vname;
    this.place = this.$route.params.place;
    this.location = this.$route.params.loc;
  },
  methods: {
    refreshpage() {
      // Reload the page to view the venue
      this.$router.push("/admin");
    },
    toggleShowForm() {
      this.showForm = !this.showForm;
    },
    venueshow() {
      const token=localStorage.getItem('auth_token');
      fetch(`http://127.0.0.1:8080/api/show/admin/${this.venue_id}`,{
        method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token":token
          },})
        .then((response) => {
          if(response.ok){
          return response.json()
          }else{
            throw new Error("No shows available");
          }
        })
        .then((data) => {
          this.show = data;
        })
        .catch((err) => {
          console.error(err);
        });
    },
    createShow() {
      const token=localStorage.getItem('auth_token');
      fetch(`http://127.0.0.1:8080/api/show/create/${this.venue_id}`,{
        method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token":token
          },
        body: JSON.stringify(this.formData),
      })
        .then((response) => {
          if(response.ok){
            return response.json()
          }
          else if(response.status===409){
            throw new Error("show exist already!!!.");
          }          
          else{
            throw new Error("show not created!!!.");
          }
        })
        .then((data) => {
          // Handle the response from the server if needed
          console.log(data);
          console.log("created successfully");
          // Optionally, you can re-fetch the show data to update the table with the new show
          this.venueshow();
          this.showForm = false;
        })
        .catch((err) => {
          this.showmsg=true;
          this.ermsg=err;
          setTimeout(()=>{
            this.showmsg=false;
            this.ermsg="";
          },3000)
          console.error(err);
        });
    },
    editShow(show) {
      // Display the form with the selected venue details
      this.showUpdateForm = !this.showUpdateForm;
      if (this.showUpdateForm) {
        this.selectedShow = { ...show }; // Create a copy to avoid modifying the original venue in the table
      } else {
        this.selectedShow = {};
      }
    },
    updateShow() {
      const confirmDelete = window.confirm(
        "Are you sure you want to update this show?"
      );
      if (confirmDelete) {
        const token=localStorage.getItem('auth_token');
        fetch(`http://127.0.0.1:8080/api/show/${this.selectedShow.show_id}`,{
          method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token":token
            },
          body: JSON.stringify(this.selectedShow),
        })
          .then((response) =>{
            if(response.ok){
              return response.json()
            }
            else if(response.status===409){
              throw new Error("show exist already!!!.");
            }          
            else{
              throw new Error("show not updated!!!.");
            }
          })
          .then((data) => {
            // Handle the response from the server if needed
            console.log("updated successfully");
            // Re-fetch the venue data to update the table with the updated venue
            this.venueshow();
            this.showUpdateForm = false; // Hide the form after updating
          })
          .catch((err) => {
            this.showmsg=true;
          this.ermsg=err;
          setTimeout(()=>{
            this.showmsg=false;
            this.ermsg="";
          },3000)
            console.error(err);
          });
      }
    },
    deleteShow(showId) {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this show?"
      );
      if (confirmDelete) {
        const token=localStorage.getItem('auth_token');
        fetch(`http://127.0.0.1:8080/api/show/${showId}`,{
          method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token":token
            },})
          .then((response) => response.json())
          .then((data) => {
            // Handle the response from the server if needed
            console.log("Deleted successfully");
            // Re-fetch the venue data to update the table after deletion
            this.venueshow();
          })
          .catch((err) => {
            console.error(err);
          });
      }
    },
  },
});

export default venshow;

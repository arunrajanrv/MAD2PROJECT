import venshow from "./venueshow.js";
const Admindashboard = Vue.component("Admindashboard",{
  template: `
    <div>
    <div v-if="showmsgg">
    <h1 style="color: red;">{{ermsgg}}</h1>
    </div>
    <div v-if="!showmsgg">
      <h4>Admin Dashboard</h4>
    <h4 style="color: green;" v-if="exporting">File exported successfully!!</h4>
    <div class="containers" v-if="!venshow">
      <br />
      <h1 v-if="Object.keys(venue).length === 0">No venues have been added</h1>
      <table class="table table-hover" v-if="Object.keys(venue).length > 0">
        <thead>
          <tr>
            <th scope="col">Venue Name</th>
            <th scope="col">place</th>
            <th scope="col">location</th>
            <th scope="col">Screens</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in venue">
            <td>{{ i.venue_name }}</td>
            <td>{{ i.place }}</td>
            <td>{{ i.location }}</td>
            <td>{{ i.screen }}</td>
            <td>
              <div class="btn-group" role="group">
                <button
                  type="button"
                  class="btn btn-secondary btn-mm"
                  @click="editVenue(i)"
                >
                  Update
                </button>
                <button
                  type="button"
                  class="btn btn-danger btn-mm"
                  @click="deleteVenue(i.venue_id)"
                >
                  Delete
                </button>
                <button
                  type="button"
                  class="btn btn-info btn-mm"
                  @click="
                    venueshow(i.venue_id, i.venue_name, i.place, i.location)
                  "
                >
                  view show
                </button>
                <button
                  type="button"
                  class="btn btn-dark btn-mm"
                  @click="
                    exportt(i.venue_id)
                  "
                >
                  export
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <button type="button" class="btn btn-success" @click="toggleShowForm">
        Add Venue
      </button>
      <form
        v-if="showForm"
        @submit="createVenue"
        style="margin-top: 20px; margin-bottom: 20px;"
      >
        <!-- Venue Name -->
        <div class="form-group">
          <label for="venue_name">Venue Name:</label><br />
          <input
            type="text"
            class="form-control"
            id="venue_name"
            v-model="formData.venue_name"
            required
          />
        </div>

        <!-- Place -->
        <div class="form-group">
          <label for="place">Place:</label><br />
          <input
            type="text"
            class="form-control"
            id="place"
            v-model="formData.place"
            required
          />
        </div>

        <!-- Location -->
        <div class="form-group">
          <label for="location">Location:</label><br />
          <input
            type="text"
            class="form-control"
            id="location"
            v-model="formData.location"
            required
          />
        </div>

        <!-- Total Number of Screens -->
        <div class="form-group">
          <label for="screen">Total Number of Screens:</label><br />
          <input
            type="text"
            class="form-control"
            id="screen"
            v-model="formData.screen"
            required
          />
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          style="display: block; margin: auto"
        >
          Create
        </button>
      </form>
      <!-- Form to update the selected venue -->
      <form
        v-if="showUpdateForm"
        @submit.prevent="updateVenue"
        style="margin-top: 20px"
      >
        <div class="form-group">
          <label for="update_venue_name">Venue Name:</label><br />
          <input
            type="text"
            class="form-control"
            id="update_venue_name"
            v-model="selectedVenue.venue_name"
            required
          />
        </div>
        <div class="form-group">
          <label for="update_place">Place:</label><br />
          <input
            type="text"
            class="form-control"
            id="update_place"
            v-model="selectedVenue.place"
            required
          />
        </div>
        <div class="form-group">
          <label for="update_location">Location:</label><br />
          <input
            type="text"
            class="form-control"
            id="update_location"
            v-model="selectedVenue.location"
            required
          />
        </div>
        <div class="form-group">
          <label for="update_screen">Total Number of Screens:</label><br />
          <input
            type="text"
            class="form-control"
            id="update_screen"
            v-model="selectedVenue.screen"
            required
          />
        </div>
        <button type="submit" class="btn btn-primary">Update Venue</button>
      </form>
      <h4 style="color: red;" v-if="showmsg">{{ermsg}}</h4>
    </div>
      </div>
  </div>
    
    `,
  components: {
    venshow,
  },
  data() {
    return {
      venue: [],
      venshow: false,
      showForm: false, 
      exporting:false,
      showmsg:false,
      ermsg:"",
      showmsgg:false,
      ermsg:"",
      showUpdateForm: false,
      venue_id: null,
      venue_name: "",
      place: "",
      location: "",
      formData: {
        venue_name: "",
        place: "",
        location: "",
        screen: "",
      },
      selectedVenue: {}, // Store the details of the selected venue to be updated
    };
  },
  mounted() {
    this.fetchVenueData();
  },
  methods: {
    exportt(vid){
      const token=localStorage.getItem('auth_token');
      fetch(`http://127.0.0.1:8080/export/${vid}`,{
        method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token":token
          },})
          .then((response)=>{
            if(response.ok){
              this.exporting=true;
              setTimeout(() => {
                this.exporting = false;
              }, 3000);
            }
              
          })
          .catch((err)=>{
            console.log(err)
          })

    },
    toggleShowForm() {
      this.showForm = !this.showForm;
    },
    fetchVenueData() {
      const token=localStorage.getItem('auth_token');
      fetch(`http://127.0.0.1:8080/api/venue`,{
        method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token":token
          },})
        .then((response) =>{
          if(response.ok){
            return response.json()
          }
          else if(response.status===401){
            throw new Error("Not Authorised!!!");
          }
          else{
            throw new Error("venue data is not present");
          }
        })
        .then((data) => {
          this.venue = data;
        })
        .catch((err) => {
          this.showmsgg=true;
          this.ermsgg=err.toString().slice(7);
          console.error(err);
        });
    },
    createVenue() {
      const token=localStorage.getItem('auth_token');
      fetch(`http://127.0.0.1:8080/api/venue/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token":token
        },
        body: JSON.stringify(this.formData),
      })
        .then((response) =>{
          if(response.ok){
            return response.json()
          }
          else if(response.status===409){
            throw new Error("venue exist already!!!");
          }         
          else{
            throw new Error("venue not created!!!");
          }
        })
        .then((data) => {
          this.fetchVenueData();
          this.showForm = false;
        })
        .catch((err) => {
          this.showmsg=true;
          this.ermsg=err.toString().slice(7);
          setTimeout(()=>{
            this.showmsg=false;
            this.ermsg="";
          },3000)
          console.error(err);
        });
    },
    editVenue(venue) {
      this.showUpdateForm = !this.showUpdateForm;
      if (this.showUpdateForm) {
        this.selectedVenue = { ...venue }; 
      } else {
        this.selectedVenue = {};
      }
    },
    updateVenue() {
      const confirmUpdate = window.confirm("Are you sure you want to update this venue?");
      if (!confirmUpdate) return;
      
      const token = localStorage.getItem('auth_token');
      
      fetch(`http://127.0.0.1:8080/api/venue/${this.selectedVenue.venue_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": token
        },
        body: JSON.stringify(this.selectedVenue),
      })
      .then((response) => {
        if(response.ok){
          return response.json()
        }
        else if(response.status===409){
          throw new Error("venue exist already!!!");
        }          
        else{
          throw new Error("venue not updated!!!");
        }
      })
      .then((data) => {
        return this.fetchVenueData();
      })
      .then(() => {
        this.showUpdateForm = false;
      })
      .catch((err) => {
        this.showmsg=true;
        this.ermsg=err.toString().slice(7);
        setTimeout(()=>{
          this.showmsg=false;
          this.ermsg="";
        },3000)
        console.error(err);
      });
    },    
    deleteVenue(venueId) {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this show?"
      );
      if (confirmDelete) {
        const token=localStorage.getItem('auth_token');
        fetch(`http://127.0.0.1:8080/api/venue/${venueId}`,{
          method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token":token
            },})
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error("venue Not deleted!!");
            }
          })
          .then((data) => {
            this.showmsg=true;
            this.ermsg=data.toString().slice(7);
            setTimeout(()=>{
              this.showmsg=false;
              this.ermsg="";
            },3000);
            this.fetchVenueData();
          })
          .catch((err) => {
            this.showmsg=true;
            this.ermsg=err.toString().slice(7);
            setTimeout(()=>{
              this.showmsg=false;
              this.ermsg="";
            },3000);
          });
      }
    },
    venueshow(venueId, vname, place, loc) {
      this.$router.push({
        name: "VenueShow",
        params: { venueId: venueId,
                  vname:vname,
                place:place,
              loc:loc },
      })
     
    },
  },
});

export default Admindashboard;

// Define the Book component
const Book = Vue.component("Book", {
  template: `
    <div>
      <div v-if="showmsg">
      <h2 style="color: red;">{{ermsg}}</h2> 
      <h6>click here to <router-link to="/login">login</router-link></h6>
      </div>
      <div v-if="showmmsg">
        <div class="container mt-5">
          <div class="row justify-content-center">
            <div class="col-md-6">
              <h1>Show Name: {{ seats.show_name }}</h1>
              <h6>Available seats: <span :style="getAvailableSeatsStyle">{{ seats.seats }}</span></h6>
              <h4 style="color: red;">{{ errorMessage }}</h4>
              <form @submit.prevent="bookticket" class="login-form">
                <!-- Form fields -->
        
                <div class="mb-3">
                  <label for="bseats" class="form-label">No of seats:</label>
                  <input
                    type="number"
                    class="form-control"
                    id="bseats"
                    name="bseats"
                    v-model="bseats"
                    required
                  />
                </div>
                <div class="mb-3">
                  <label for="ticketprice" class="form-label">Ticket Price:</label>
                  <input
                    type="text"
                    class="form-control"
                    id="ticketprice"
                    name="ticketprice"
                    :value="seats.price"
                    readonly
                  />
                </div>
                <div class="mb-3">
                  <label for="tticketprice" class="form-label">Total Ticket Price:</label>
                  <input
                    type="text"
                    class="form-control"
                    id="tticketprice"
                    name="tticketprice"
                    v-model="tticketprice"
                    readonly
                  />
                </div>
                <button type="submit" class="btn btn-primary" :disabled="isBookingDisabled">Confirm Booking</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      show_id: "",
      venue_id: "",
      seats: {},
      bseats: 0,
      ticketprice: 0,
      tticketprice: 0,
      errorMessage: "",
      isBookingDisabled: true, 
      isBookingInProgress: false, 
      showmsg:false,
      showmmsg:true,
    };
  },
  created() {
    this.show_id = this.$route.params.showId;
    this.venue_id = this.$route.params.venueId;
  },
  methods: {
    bookticket() {
      if (this.isBookingInProgress) return; 
      
      const payload = {
        NOS: this.bseats,
        Tprice: this.tticketprice,
      };

      this.isBookingInProgress = true; 
      const token=localStorage.getItem('auth_token');
      fetch(`http://127.0.0.1:8080/api/showbook/create/${this.venue_id}/${this.show_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token":token
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          this.$router.push({
            name: "Ticket",
            params: {
              showId: this.show_id
            }
          });
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          this.isBookingInProgress = false; // Reset the flag once booking is completed (success or error)
        });
    },
  },
  mounted() {
    const token=localStorage.getItem('auth_token');
    fetch(`http://127.0.0.1:8080/api/book/${this.show_id}`,{
      method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token":token
        },
    })
      .then((response) => {
        if(response.ok){
          return response.json()
        }
        else if(response.status==401){
          throw new Error("Please login to Book the show");
        }
        else{
          throw new Error("Please login to Book the show");
        }
      })
      .then((data) => {
        this.seats = data;
        this.bseats = 0;
        this.tticketprice = 0;
        this.isBookingDisabled = false; 
      })
      .catch((error) => {
        this.showmsg=true;
        this.showmmsg=false;
        this.ermsg=error.toString().slice(7);
      
        console.error(error);
      });
  },
  computed: {
    getAvailableSeatsStyle() {
      const availableSeats = this.seats.seats;
      if (availableSeats > 100) {
        return "color: green;";
      } else if (availableSeats > 20) {
        return "color: orange;";
      } else {
        return "color: red;";
      }
    },
  },
  watch: {
    bseats: function (newBseats) {
      if (newBseats > this.seats.seats) {
        this.errorMessage = "Seats are not available";
        this.tticketprice = 0;
        this.isBookingDisabled = true; // Disable the button if entered seats are greater than available seats
      } else {
        this.errorMessage = "";
        this.tticketprice = newBseats * this.seats.price;
        this.isBookingDisabled = false; // Enable the button if entered seats are valid
      }
    },
  },
});

export default Book;
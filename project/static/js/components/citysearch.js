const CitySearch = Vue.component("CitySearch", {
  template: `
  <div>
    <!-- "Go back" router link with a go symbol -->
    <router-link to="/user" class="go-back-link">
      <i class="fas fa-arrow-left"></i> Go back
    </router-link>
    <div class="container">
    <div v-if="venshow && Object.keys(venshow).length === 0">
      <p>No venues found</p>
    </div>
    <div v-else>
      <div v-for="venue in venshow" :key="venue.venue_id" class="venue-box p-3 mb-3">
        <h4>{{ venue.venue_name }}🍿👀🎞</h4>
        <p>{{ venue.location }}, {{ venue.place }}</p>
        <div class="d-flex flex-wrap">
          <div v-for="show in venue.shows" :key="show.show_id" class="show-box p-2 m-2">
            <h6>{{ show.show_name }}🎞️</h6>
            <p>{{ show.timings }}</p>
            <p>{{ show.tags }}</p>
            <p>Screen: {{ show.screenNumber }}</p>
            <button
              class="btn"
              :class="{
                'btn-primary': show.seats > 0,
                'btn-danger': show.seats === 0
              }"
              @click="show.seats > 0 ? bookticket(venue.venue_id, show.show_id) : null"
              :disabled="show.seats === 0"
            >
              {{ show.seats > 0 ? 'Book' : 'Housefull' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>   
    `,
  data() {
    return {
      city: "",
      venshow: null,
    };
  },
  created() {
    this.city = this.$route.params.city;
  },
  mounted() {
    this.fetchVenuesData();
  },
  methods: {
    convertKeysToDict(data) {
        const result = {};
        for (const key in data) {
          const venue = JSON.parse(key); // Parse the key to get the venue object
          const venueDetails = data[key]; // Array of show objects for the venue
  
          // Add the venue details to the result object
          result[venue.venue_id] = {
            venue_id: venue.venue_id,
            venue_name: venue.venue_name,
            city: venue.city,
            location: venue.location,
            place: venue.place,
            shows: venueDetails, // Assuming the array of show objects is named 'shows'
          };
        }
  
        console.log(result);
        return result;
      },
    fetchVenuesData() {
      const payload = {
        city: this.city,
      };

      fetch(`http://127.0.0.1:8080/user/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
            this.venshow = this.convertKeysToDict(data);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    bookticket(venue_id, show_id) {
      console.log(venue_id);
      console.log(show_id);
      this.$router.push({
        name: "Book",
        params: {
          venueId: venue_id,
          showId: show_id,
        },
      });
    },
    goback(){
        this.$router.push({
            name: "User"
          });
    }
  },
});

export default CitySearch;

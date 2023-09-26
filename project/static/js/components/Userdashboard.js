const Userdashboard = Vue.component("Userdashboard", {
  template: `
  <div>
    <!-- Navigation Bar -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container">
        <router-link class="navbar-brand" to="/">TicketBooking</router-link>

        <div class="input-group">
          <!-- Search Bar -->
          <input
            type="text"
            class="form-control"
            v-model="searchQuery"
            @keyup="performSearch"
            placeholder="Search movies, tags, cities, theaters..."
          />
          <button class="btn btn-primary" @click="performSearchh">
            <i class="fas fa-search"></i>
          </button>

          <!-- Navigation Links -->
          <ul class="navbar-nav ml-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/bookedshow">Shows Booked</router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Rest of the content remains unchanged -->
    <div class="container">
      <!-- Show the message only when search has been performed and there are no matches -->
      <div v-if="searchPerformed && filteredVenues.length === 0">
        <h1>Not available</h1>
      </div>
      <!-- Show the venues and shows when there are matches -->
      <div v-else>
        <div
          v-for="venue in filteredVenues"
          :key="venue.venue_id"
          class="venue-box p-3 mb-3"
        >
          <h4>{{ venue.venue_name }}🍿👀🎞</h4>
          <p>{{ venue.location }}, {{ venue.place }}</p>

          <!-- Show details for this venue -->
          <div class="d-flex flex-wrap">
            <div
              v-for="show in venue.shows"
              :key="show.show_id"
              class="show-box p-2 m-2"
            >
              <h6>{{ show.show_name }}🎞️</h6>
              <p>{{ show.timings }}</p>
              <p>{{ show.tags }}</p>
              <p>Screen: {{ show.screenNumber }}</p>
              <p>{{ getStarsEmoji(show.ratings) }}</p>
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
              <button class="btn btn-dark" @click="wtrailer(show.show_name,show.trailer)">Watch Trailer</button>
              <router-view></router-view>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>


  `,
  data() {
    return {
      shows: [],
      venues: [],
      venshow: {},
      searchQuery: "", // Add the searchQuery data property
      searchPerformed: false, // Add the searchPerformed data property
    };
  },
  created() {
    // console.log(this.user_id)
  },
  mounted() {
    this.fetchVenuesData();
  },

  computed: {
    filteredVenues() {
      if (!this.searchQuery) {
        return this.venshow;
      }
    
      const lowerCaseQuery = this.searchQuery.toLowerCase();
      return Object.values(this.venshow).filter((venue) => {
        const filteredVenue = {
          ...venue,
          shows: venue.shows.filter((show) => {
            return (
              show.show_name.toLowerCase().includes(lowerCaseQuery) ||
              show.tags.toLowerCase().includes(lowerCaseQuery) // Filter shows based on show_name and tags
            );
          }),
        };
    
        // Include the venue in the result if it has at least one show that matches the search query
        return (
          filteredVenue.venue_name.toLowerCase().includes(lowerCaseQuery) ||
          filteredVenue.location.toLowerCase().includes(lowerCaseQuery) ||
          filteredVenue.place.toLowerCase().includes(lowerCaseQuery) ||
          filteredVenue.shows.length > 0
        );
      });
    },
  },    

  methods: {
    wtrailer(sname,strailer){
      this.$router.push({
        name:"Trailer",
        params:{
          showname:sname,
          strailer:strailer
        }
      })

    },
    fetchVenuesData() {
      fetch(`http://127.0.0.1:8080/user/venue`)
        .then((response) => response.json())
        .then((data) => {
          // Process the response data
          this.venshow = this.convertKeysToDict(data);
        })
        .catch((err) => {
          console.error(err);
        });
    },
    getStarsEmoji(rating) {
      const stars = ['⭐️', '⭐️⭐️', '⭐️⭐️⭐️', '⭐️⭐️⭐️⭐️', '⭐️⭐️⭐️⭐️⭐️'];
      return stars[Math.max(0, Math.min(4, Math.round(rating) - 1))];
    },
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
      return result;
    },
    bookticket(venue_id, show_id) {
      this.$router.push({
        name: "Book",
        params: {
          venueId: venue_id,
          showId: show_id,
        },
      });
    },
    performSearchh() {
      this.searchPerformed = true; // Set searchPerformed to true when search is performed
      this.$router.push({
        name: "CitySearch",
        params: {
          city: this.searchQuery,
        },
      });
    },
    performSearch() {
      this.searchPerformed = true; // Set searchPerformed to true when search is performed
    },
  },
});

export default Userdashboard;

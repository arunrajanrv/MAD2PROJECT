const Bookedshow = Vue.component("Bookedshow",{
    template:`
    <div>
      <div v-if="showmsg">
        <h2 style="color: red;">{{ermsg}}</h2> 
        <h6 v-if="ermsg === 'Please Login to see the Booked details!!'">click here to <router-link to="/login">login</router-link></h6>
      </div>
        <div class="container mt-4" v-if="!showmsg">
          <div class="row" v-if="showbooked.length > 0">
            <div v-for="(booking, index) in showbooked" :key="index" class="col-md-4">
              <div class="card mb-3">
                <div class="card-header">
                  <h5 class="mb-0">{{ booking.venuename }}, {{ booking.venueplace }}</h5>
                </div>
                <div class="card-body">
                  <div class="card mb-2">
                    <div class="card-body">
                      <h6 class="card-title">{{ booking.showname }} 🎞️</h6>
                      <p class="card-text">Show Time: {{ booking.showtime }}</p>
                      <p class="card-text">Seats Booked: {{ booking.seats_booked }}</p>
                      <p class="card-text">Total Price: {{ booking.Total_price }}</p>
                      <button class="btn btn-warning" :disabled="isRated(booking.showname)" @click="rate(booking.bshow_id)">Rate</button>
                      <button class="btn btn-success"><router-link :to="'/ticket/' + booking.bshow_id" style="text-decoration: none; color:white;">Download Ticket</router-link></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <h1>No shows booked!!</h1>
          </div>
        </div>
      </div>
</div>

    `,
    data(){
        return{
            showbooked:"",
            ratedShows: [],
            ermsg : "",
            showmsg:false,
            showmsgg:false,
            ermsgg:""
        }
    },
    mounted(){
        this.fetchdata()
        this.ratedata()
    },
    methods:{
        fetchdata(){
          const token=localStorage.getItem('auth_token');
            fetch(`http://127.0.0.1:8080/api/showbook`,{
              method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  "Authentication-Token":token
                },})
            .then((response)=> {
              if(response.ok){
                return response.json()
              }else if (response.status === 404) {
                throw new Error("No shows Booked!!");
              } else if (response.status === 401) {
                throw new Error("Please Login to see the Booked details!!");
              }
            })
            .then((data)=>{
                console.log(data);
                this.showbooked=data;
            })
            .catch((error)=>{
              console.log(error)

              this.ermsg=error.toString().slice(7);
              this.showmsg=true;
            })
        },
        ratedata(){
          const token=localStorage.getItem('auth_token');
          fetch(`http://127.0.0.1:8080/api/rate`,{
            method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Authentication-Token":token
              },})
          .then((response)=> response.json())
            .then((data)=>{
                this.ratedShows=data;
            })


        },
        isRated(showname) {
          return this.ratedShows.includes(showname);
        },

        rate(sid){
          this.$router.push({
            name:"Rate",
            params:{
              showId:sid
            }
          })
        }
    }

})

export default Bookedshow;
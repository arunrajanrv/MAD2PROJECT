const Rate = Vue.component("Rate",{
    template:`
    <div style="display: table; height: 60vh; width: 100%; text-align: center; color:white;">
    <div style="display: table-cell; vertical-align: middle;">
      <div style="max-width: 500px; margin: 0 auto; padding: 20px; border: 2px solid #ccc; border-radius: 10px; background-color:#dc3545; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);">
    <h1>Rate Movie: {{ showId }}</h1>

    <form @submit.prevent="submitRating">
      <div>
        <label for="rating">Rating:</label>
        <div class="stars">
          <span
            v-for="star in 5"
            :key="star"
            @click="rateMovie(star)"
            :class="{ 'star-filled': star <= selectedRating }"
          >
            &#x2605;
          </span>
        </div>
      </div>

      <div>
        <label for="comments">Comments:</label>
        <textarea v-model="comments" id="comments" rows="4" cols="50"></textarea>
      </div>

      <button @click="submittRating" type="submit">Submit</button>
    </form>
    </div>
    </div>
  </div>
     
    `,
    data(){
        return{
            showId:"",
            selectedRating: 0,
            comments: "",
        }
    },
    created(){
        this.showId = this.$route.params.showId;
    },
    methods: {
        rateMovie(rating) {
          this.selectedRating = rating;
        },
        submitRating() {
          // Here, you can submit the rating and comments to your backend or perform any other actions.
          // For this example, we'll just log the data to the console.
          console.log("Selected Rating:", this.selectedRating);
          console.log("Comments:", this.comments);
    
          // Reset the form after submission
          this.selectedRating = 0;
          this.comments = "";
        },
        submittRating() {
          const payload = {
            rating: this.selectedRating,
            review: this.comments,
          };
          const token=localStorage.getItem('auth_token');
          fetch(`http://127.0.0.1:8080/api/rate/create/${this.showId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token":token
            },
            body: JSON.stringify(payload),
          })
            .then((response) => response.json())
            .then((data) => {
              
              this.$router.push("/bookedshow");
            })
            .catch((error) => {
              console.error("Error while submitting rating:", error);
              // You may add further error handling here, like showing an error message to the user
            });
        
          // Reset the form after submission
          this.selectedRating = 0;
          this.comments = "";
        },
      
    },

})

export default Rate;
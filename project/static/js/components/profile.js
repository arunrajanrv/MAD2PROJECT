const Profile = Vue.component("Profile", {
  template: `
  <div class="container">
  <div v-if="showmsgg" class="mt-5">
    <h1 style="color: red;">{{ ermsgg }}</h1>
  </div>
  <div v-else class="mt-5">
    <h4 v-if="showmsg" style="color: green; text-align: center;">{{ msg }}</h4>
    <h1 style="text-align: center;">Profile Page</h1>
    <div class="text-center mt-3">
      <img src="/static/js/user.jpg" class="img-fluid rounded-circle" style="max-width: 150px;" />
      <h4 class="mt-3">Name: {{ profiledata.user_name }}</h4>
      <h4>E-mail: {{ profiledata.email }}</h4>
      <h4>City: {{ profiledata.city }}</h4>
      <p><a href="/#/bookedshow">click here</a> to see the booked details</p>
      <button class="btn btn-info" @click="generatePDF('pdf')">Generate PDF</button>
      <button class="btn btn-info" @click="generatePDF('html')">Generate HTML</button>
      <br>
      <br>
    </div>
  </div>
</div>

    `,
  data() {
    return {
      profiledata: "",
      ermsgg: "",
      showmsgg: false,
      msg: "",
      showmsg: false,
    };
  },
  mounted() {
    const token = localStorage.getItem("auth_token");
    fetch("http://127.0.0.1:8080/api/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authentication-Token": token,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else if (response.status === 401) {
          throw new Error("Not Authorised!!!");
        } else {
          throw new Error("profile not available");
        }
      })
      .then((data) => {
        this.profiledata = data;
      })
      .catch((error) => {
        this.showmsgg = true;
        this.ermsgg = error;
        console.error(error);
      });
  },
  methods:{
    generatePDF(name){
        const token = localStorage.getItem("auth_token");
    fetch(`http://127.0.0.1:8080/generate/${name}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authentication-Token": token,
      },
    }).then((response) => {
        if (response.ok) {
          return response.json();
        } else if (response.status === 401) {
          throw new Error("Not Authorised!!!");
        } else {
          throw new Error("profile not available");
        }
      }).then((data) => {
        this.showmsg = true;
        this.msg = "Generated Successfully!!"
        setTimeout(()=>{
            this.showmsg = false;
        this.msg = ""
        },3000)
      })
      .catch((error) => {
        this.showmsgg = true;
        this.ermsgg = error;
        console.error(error);
      });

    }
  }
});


export default Profile;
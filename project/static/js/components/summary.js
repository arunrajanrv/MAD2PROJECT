const summry = Vue.component("summry", {
  template: `
    <div>
    <div v-if="showmsgg">
    <h1 style="color: red;">{{ermsgg}}</h1>
    </div>
    <div v-if="!showmsgg">
    <h1>Summary Page</h1>
    <div class="image-grid">
      <div v-for="i in plot_data" :key="i" class="image-container">
        <img :src="'/static/js/' + i + '.png'" />
      </div>
    </div>
    </div>
  </div>
  

    `,
  data() {
    return {
      plot_data: "",
      ermsgg: "",
      showmsgg: false,
    };
  },
  mounted() {
    this.fetchdata();
  },
  methods: {
    fetchdata() {
      const token = localStorage.getItem("auth_token");
      fetch(`http://127.0.0.1:8080/api/summary`, {
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
            throw new Error("Summary not available");
          }
        })
        .then((data) => {
          this.plot_data = data;
        })
        .catch((error) => {
          this.showmsgg = true;
          this.ermsgg = error;
          console.error(error);
        });
    },
  },
});

export default summry;

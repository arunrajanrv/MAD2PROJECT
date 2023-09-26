const Trailer = Vue.component("Trailer", {
  template: `
  <div class="trailer-container">
  <h1 class="title">{{ sname }}</h1>
  <div class="video-description">
    <div class="video-container">
      <iframe
        width="560"
        height="315"
        :src="strailer"
        title="YouTube video player"
        frameborder="0"
        allowfullscreen
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
      ></iframe>
    </div>
    <div class="description">
      <p>{{ movieDesp }}</p>
    </div>
  </div>
  <div v-for="(i, index) in tdata" :key="index" class="user-review">
    <h6 class="user-title">User {{ index + 1 }}</h6>
    <div class="rating">
      <span class="star" v-for="star in i.rating" :key="star">&#9733;</span>
    </div>
    <p class="review">{{ i.review }}</p>
  </div>
</div>

    `,
    name: "TrailerPage",
    data() {
      return {
        sname: "",
        tdata: [],
        strailer: "",
        movieDesp: "",
      };
    },
    created() {
      this.sname = this.$route.params.showname;
      this.strailer = this.$route.params.strailer;
    },
    mounted() {
      this.fetchdata();
    },
    methods: {
      fetchdata() {
        fetch(`http://127.0.0.1:8080/trailer/${this.sname}`)
          .then((response) => response.json())
          .then((data) => {
            this.tdata = data;
            this.movieDesp = data[0].movie_description;
          });
      },
    },
  })

export default Trailer;

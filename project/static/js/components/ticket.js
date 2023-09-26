const Ticket = Vue.component("Ticket", {
  template: `
    <div>
    <div v-if="showmsgg">
    <h1 style="color: red;">{{ermsgg}}</h1>
    </div>
    <div v-if="!showmsgg">
    <h1 style="margin: 10px 20px;">Ticket Booking🎫</h1>
    <div v-for="(ticket, index) in sdetails" :key="index" class="ticket">
      <div class="venue">{{ ticket.venuename }} - {{ ticket.venuelocation }} - {{ ticket.venueplace }}</div>
      <div class="show">{{ ticket.showname }} - {{ ticket.showtime }}</div>
      <div class="seat">Total Seats booked: {{ ticket.seats_booked }}</div>
    </div>
    <a style="margin-left:115px;" href="javascript:void(0)" class="btn btn-primary download" @click="downloadTicket()">Download</a>
  </div>
  </div>
    `,
  data() {
    return {
      show_id: "",
      sdetails: "",
      ermsg: "",
      showmsgg: false,
    };
  },
  created() {
    this.show_id = this.$route.params.showId;
  },
  mounted() {
    const token = localStorage.getItem("auth_token");
    fetch(`http://127.0.0.1:8080/api/ticket/${this.show_id}`, {
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
          throw new Error("ticket not available.");
        }
      })
      .then((data) => {
        this.sdetails = data;
      })
      .catch((error) => {
        this.showmsgg = true;
        this.ermsgg = error;
        console.log(error);
      });
  },
  methods: {
    downloadTicket() {
      window.print();
    },
  },
});

export default Ticket;

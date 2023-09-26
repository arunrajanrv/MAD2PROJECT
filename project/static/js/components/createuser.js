const CreateUser = Vue.component("CreateUser",{
    template:` <div>
    <div class="container">
      <h1 class="text-center">Register</h1>
      <h4 :class="{ 'text-success': ermsg === 'successfully registered!!', 'text-danger': ermsg !== 'successfully registered!!' }" v-if="showmessage">{{ ermsg }}</h4>
      <form @submit.prevent="createUser">
        <div class="form-group">
          <label for="username">Username:</label>
          <input
            v-model="formData.username"
            type="text"
            class="form-control"
            id="username"
            name="username"
            required
          >
          <p class="error" style="color:red;" id="usernameError">{{ usernameError }}</p>
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input
            v-model="formData.email"
            type="email"
            class="form-control"
            id="email"
            name="email"
            required
          >
          <p class="error" style="color:red;" id="emailError">{{ emailError }}</p>
        </div>
        <div class="form-group">
          <label for="city">City:</label>
          <input
            v-model="formData.city"
            type="text"
            class="form-control"
            id="city"
            name="city"
            required
          >
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input
            v-model="formData.password"
            type="password"
            class="form-control"
            id="password"
            name="password"
            required
          >
        </div>
        <input
          type="submit"
          class="btn btn-primary btn-block"
          value="Register"
          style="margin-top:10px;"
        >
      </form>
    </div>
  </div>`,
  data() {
    return {
      showmessage:false,
      ermsg:"",
      showform: true,
      formData: {
        username: "",
        email: "",
        city: "",
        password: "",
        password_confirm: "",
      },
      emailError: "",
      usernameError:""
    };
  },
  methods: {
    createUser() {
      const data = {
          username: this.formData.username,
          email: this.formData.email,
          city: this.formData.city,
          password: this.formData.password,
        }
      fetch("http://127.0.0.1:8080/registers",{
				method: 'POST', 
				headers: {
					'Content-Type':'application/json'
				},
				body:JSON.stringify(data) 
			})
			.then(response=>{
				if(response.status===200)
					return response.json();
			})
			.then(data=>{
        this.showmessage=true;
				this.ermsg=data.message;
        if(data.message==="successfully registered!!"){
          setTimeout(()=>{
            this.$router.push("/login")
          },2000)
        }

			})
    },
    fetchData() {
      fetch(`http://127.0.0.1:8080/api/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          this.userdata = data;
        });
    },
  },
  watch: {
    'formData.username': function (newVal) {
      this.usernameError = this.userdata.some((user) => user.user_name === newVal)
        ? "Username already exists"
        : "";
    },
    'formData.email': function (newVal) {
      this.emailError = this.userdata.some((user) => user.email === newVal)
        ? "Email already exists"
        : "";
    },
  },
  mounted() {
    this.fetchData();
  },
})

export default CreateUser;
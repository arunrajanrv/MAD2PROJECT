
const Login = Vue.component("login", {
  template: `
  <div>
  <div class="container">
  <h1>Login page</h1>
    <h2 v-if="showmessage" class="error-message">{{ msg }}</h2>
    <!-- Token-based login form -->
    <div v-if="showloginform">
      <form @submit.prevent="login" class="login-form">
        <!-- Form fields -->
        <div class="mb-3">
          <label for="admin_name" class="form-label">Username:</label>
          <input
            type="text"
            class="form-control"
            id="username"
            name="username"
            v-model="username"
            required
          />
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Password:</label>
          <input
            type="password"
            class="form-control"
            id="password"
            name="password"
            v-model="password"
            required
          />
        </div>
        <div style="display: flex; gap:20px;">
        <div><button type="submit" class="btn btn-primary">Login</button></div>
        <div><button class="btn btn-dark"><router-link style="color: white; text-decoration: none;" to="/register">Register</router-link></button></div>
        </div>
      </form>
    </div>
    
  </div>
</div>
      `,
  data() {
    return {
      showroute: true,
      showmessage: false,
      msg: "",
      create: false,
      username: "",
      password: "",
      authenticated: false,
      showloginform: true,
    };
  },

  methods: {
    login() {
      const payload = {
        username: this.username,
        password: this.password,
      };
      fetch("http://127.0.0.1:8080/login?include_auth_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Invalid Username/password"); 
          }
        })
        .then((data) => {
          localStorage.setItem(
            'auth_token',
            data.response.user.authentication_token
          )
          window.location.href='/';
        })
        .catch((error) => {
          this.showmessage = true;
          setTimeout(() => {
            this.showmessage = false;
          }, 3000);
          this.msg = "Invalid Username/password";
          console.error(error);
        });
    },
  },
});

export default Login;

function validateForm() {
    
  }
  
  new Vue({
    el: "#app1",
    data: {
      userdata: [],
      emailError: false,
      usernameError: false,
      message: ""
    },
    computed: {
      emailErrorMessage() {
        return this.emailError ? "Email already exists." : "";
      },
      usernameErrorMessage() {
        return this.usernameError ? "Username already exists." : "";
      }
    },
    mounted() {
      fetch(`http://127.0.0.1:8080/api/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then((response) => response.json())
      .then((data) => {
        this.userdata = data;
      });
    }
  });
  
const Logout=Vue.component("Logout",{
    data(){
        return {
            message:""
        }
    },
	created(){
		const token=localStorage.getItem('auth_token');
		fetch("http://127.0.0.1:8080/userlog",{
			method: "GET",
			  headers: {
				"Content-Type": "application/json",
				"Authentication-Token":token
			  },})
			  .then((response)=>response.json())
			  .then((data)=>{
				console.log("success")
			  })
	},
    mounted(){
			fetch("http://127.0.0.1:8080/logout",{
				method:"POST",
				headers:{
					'Content-Type':'application/json'
				}
			})
			.then(response=>{
				if(response.status===200){
					localStorage.removeItem('auth_token');
					window.location.href='/';
				}
			})
		
    }
})


export default Logout;


const Addroles= Vue.component("Addroles",{
    template:`
        <div>
            <h1 style="margin-left:10px;">Add Roles Page</h1>
            <div style="display:flex; gap:30px;">
                <div style="margin-left:10px;">
                <table class="table table-bordered">
                    <thead>
                    <tr>
                        <th>Role ID</th>
                        <th>Role Name</th>
                        <th>Role Description</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>1</td>
                        <td>super admin</td>
                        <td>Access to Everything.</td>
                    </tr>
                    <tr>
                        <td>2</td>
                        <td>admin</td>
                        <td>Access to Admindashboard and summary.</td>
                    </tr>
                    <tr>
                        <td>3</td>
                        <td>user</td>
                        <td>Access to book shows and search venues, shows etc.</td>
                    </tr>
                    </tbody>
                </table>
            
                </div>
                <div>
                <h4 style="color: green;" v-if="showmessage">{{message}}</h4>
                <form>
                <div style="margin-top:10px;">
                    <label for="user_id">USER ID:</label>
                    <input type="text" v-model="formData.user_id" required>
                </div>
                <div style="margin-top:10px;">
                    <label for="role_id">ROLE ID:</label>
                    <input type="text" v-model="formData.role_id" required>
                </div>
                <input class="btn btn-dark" style="margin-left:120px; margin-top:10px;" type="submit" @click="createrole"/>
                </form>
                </div>
            </div>
        </div>
    `,
    data(){
        return {
            showmessage:false,
            message : "",
            formData:{
                user_id:"",
                role_id:""
            }
        }
    },
    methods:{
        createrole(){
            const data={
                "user_id": this.formData.user_id,
                "role_id": this.formData.role_id
            }
            const token=localStorage.getItem('auth_token');
            fetch(`http://127.0.0.1:8080/addroles`,{
                method: 'POST', 
				headers: {
					'Content-Type':'application/json',
                    "Authentication-Token":token
				},
				body:JSON.stringify(data)
            }).then((res)=>{
                if(res.ok){
                    this.showmessage=true;
                    this.message="added successfully";
                    setTimeout(()=>{
                        this.showmessage=false;
                        this.message=""
                    },3000)
                }
            })
        }
    }
})


export default Addroles;
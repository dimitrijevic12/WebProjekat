Vue.component('vue-ctk-date-time-picker', window['vue-ctk-date-time-picker']);

Vue.component('apartments',{
	template: `
	<div class="apartments">
		<div class="wrapper">
		<div class="search-form">
			<form class="f">
				<h1 class="search">Search</h1>
				<label for="fname">Location:</label><br>
				<ul class="form-ul">
					<li><input type="text" id="searchLocation" name="searchLocation" placeholder="Where would you like to go..."><br></li>
				</ul>
				
				<label for="lname">Date:</label><br>
				<input type="date" placeholder="Check in date" id="checkInDate" name="checkInDate">
				<input type="date" id="checkOutDate" name="checkOutDate" placeholder="Check out date"><br>
				<label>Price:</label><br>
				<input type="number" name="minPrice" placeholder="min price">
				<input type="number" name="maxPrice" placeholder="max price"><br>
				<label>Guests number: </label><br>
				<input type="number" name="guestNum" value="number of guests"><br><br>
				<input type="submit" value="Search">
			</form>
		</div>

		<div class="apartments-label">
			<button @click="openAddApartmentModal">Add apartment</button>
			<ul class="ap-ul">
				<li v-for="a in apartments" class="apartment">
					<div class="image-holder">
						<!--<img src="images/ap1.jpg" class="">-->
					</div>
					<router-link class="hotel-name" :to="{ name: 'one-apartment', params: { id: a.id }}"><h3 class="hotel-name">{{a.name}}</h3></router-link>
					<div class="rating-box">
						<template v-for="n in 5" >
							<input type="radio" >
							<label v-if="a.stars < n"  class="star" >&#9733</label>
							<label v-else class="star" >&#127775</label>
						</template>
					</div>
					<label class="activity">status: {{a.status}}</label>
					<div class="host-data">
						<h4 class="host-username">username: {{a.hostUsername}}</h4>
					</div>
					<h4 class="sobe">room count:{{a.roomCount}}</h4>
					<h4 class="gosti">guest count: {{a.guestCount}}</h4>
					<button type="button" class="amenities">Sadrzaj</button> 
					<h3 class="price">200e</h3>
					<button type="button" v-if="role==='GUEST' " class="reserve" @click="openReserveDialog(a)">rezervisi</button>
				</li>
			</ul>
		</div>
		</div>
		<add-apartment-modal></add-apartment-modal>
		<reservate-apartment-modal></reservate-apartment-modal>
	</div>
	`,
		
	data: function() {
		return{
			apartments: null,
			role: 'ANON'
		}
	},
	
	mounted : function(){
		
		let user = this.$cookies.get('user');
		if(user) this.role = user.role;
		
		if(this.role === 'ADMIN'){
			axios
			.get('rest/apartments/')
			.then((response) => {
				this.apartments = response.data;
			});
		}
		else if(this.role === 'HOST'){
			axios
				.get('rest/apartments/host/'+this.$cookies.get('user').username)
				.then((response) => {
					this.apartments = response.data;
				})
		}else{
			axios
				.get('rest/apartments/active')
				.then((response) => {
					this.apartments = response.data;
				})
		}
		
	},
	methods: {
		openAddApartmentModal: function(){
			this.$root.$emit('open-add-apartment-modal');
		},
		openReserveDialog(apartment){
			this.$root.$emit('reserve-dialog',apartment);
		},
	}

})

Vue.component('add-apartment-modal',{
	template: `
		<div class="modal" ref="addApartmentModal">
			<div class="signUpModal-content">
				<span @click="closeAddApartmentModal" class="close">&times;</span><br/><br/>
				<div class="label-input-signup first">
					<div class='label-error'>
						<label>Name:</label>
					</div>
					<input type="text"/><br/>
				</div>
				<div class="label-input-signup">
					<div class='label-error'>
						<label>Location:</label>
					</div>
					<input type="text"/><br/>
				</div>
				<div class="label-input-signup">
					<div class='label-error'>
						<label>Type:</label>
					</div>
					<select>
						<option value="ROOM">Room</option>
						<option value="APARTMENT">Apartment</option>
					</select><br/>
				</div>
				<div class="label-input-signup">
					<div class='label-error'>
						<label>Room count:</label>
					</div>
					<input type="number"/>
				</div>
				<div class="label-input-signup">
					<div class='label-error'>
						<label>Guest count:</label>
					</div>
					<input type="number"/>
				</div>
				<div class="label-input-signup">
					<div class='label-error'>
						<label>Images:</label>
					</div>
					<input type="file" ref="browseImages" multiple/><br/>
				</div>
				<div class="label-input-signup date-time-picker-container">
					<div class='label-error'>
						<label>Check in - Check out time:</label>
					</div>
					<vue-ctk-date-time-picker class="timepicker" v-model="checkInTime" :label="'Check in'" :format="'HH:mm'" :formatted="'HH:mm'" :inputSize="'sm'" :onlyTime="true"></vue-ctk-date-time-picker>
					<vue-ctk-date-time-picker class="timepicker" v-model="checkOutTime" :label="'Check out'" :format="'HH:mm'" :formatted="'HH:mm'" :inputSize="'sm'" :onlyTime="true"></vue-ctk-date-time-picker>
				</div>
				<div class="label-input-signup date-time-picker-container">
					<div class='label-error'>
						<label>Approve dates</label>
					</div>
					<vue-ctk-date-time-picker v-model="approvedDates" :label="'Choose dates'" :format="'DD/MM/YYYY'" :formatted="'DD/MM/YYYY'" :range="true" v-bind:disabledDates="['2020-09-11','2020-09-12','2020-09-13']"></vue-ctk-date-time-picker><br>
				</div>
				<div class="label-input-signup last">
					<div class='label-error'>
						<label>Amenities</label>
					</div>
					<select>
						<option v-for="amenity in amenities" value="amenity.id">{{amenity.name}}</option>
					</select><br/>
				</div>
				<div class="signup-button-containter">
					<button>Create</button>
				</div>
			</div>
		</div>
	`,
	data: function(){
		return{
			checkInTime: null,
			checkOutTime: null,
			approvedDates: {
				start: '09/09/2020',
				end: '10/09/2020'
			},
			amenities: null
		}
	},
	mounted(){
		this.$root.$on('open-add-apartment-modal', () => {this.$refs.addApartmentModal.style.display = "block";});
		axios	
			.get('rest/amenities')
			.then((response) =>{this.amenities = response.data})
	},
	methods: {
		closeAddApartmentModal(){
			this.$refs.addApartmentModal.style.display="none";
		},

		test(){
			console.log(this.checkInTime);
			console.log(this.checkOutTime);
		}
	}
})

Vue.component('reservate-apartment-modal',{
	template: 
		`
		<div id="reserve-modal" class="modal reservation-modal"  ref="reservateApartmentModal">
			<form>
				<h1 class="naslov">{{apartment.name}}</h1>
				<div class="row">
				<label>Pocetni datum:</label>
				<input v-model="reservation.checkInDate" type="date" name="" placeholder="">
				</div>
				<div class="row">
				<label>Broj nocenja:</label>
				<input v-model="reservation.nightCount" type="number" min="1" max="99" name="" size="4" placeholder="1">
				</div>
				<div class="row">
					<label>Cena:{{reservation.nightCount*apartment.price}}</label>
					
				</div>
				<div class="row">
					<label>Komentar:</label><br/>
					<textarea v-model="reservation.message" name="komentar" maxlength="255"></textarea>
				</div>
	
				<div class="row">				
					<div class="buttons">
						<button type="submit">Reserve</button>
						<button type="button" @click="closeDialog()">Cancel</button>
					</div>
				</div>
			</form>
	</div>
	`,
	
	data: function(){
		return{
			apartment: {},
			reservation: {},
		}
	},
	
	mounted: function(){
		this.$root.$on('reserve-dialog',(apartment) => {
			this.apartment = apartment;
			this.reservation.apartmentId = apartment.id;
			this.$refs.reservateApartmentModal.classList.add("modal-show");
			this.$refs.reservateApartmentModal.style.display="block";
			this.reservation.nightCount=1;
		});
	},
	
	methods: {
		closeDialog(){
			this.$refs.reservateApartmentModal.style.display = "none";
			this.$refs.reservateApartmentModal.classList.remove("modal-show");
		}
	}
})

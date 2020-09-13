Vue.component('vue-ctk-date-time-picker', window['vue-ctk-date-time-picker']);

Vue.component('apartments',{
	template: `
	<div class="apartments">
		<div class="wrapper">
		<div class="search-form">
			<form class="f">
				<h1 class="search">Search</h1>
				<ul class="form-ul">
					<li><input list="cities" id="searchLocation" class="search-field" v-model="filter.city"  placeholder="Where would you like to go..."><br></li>
					<datalist id="cities">
						<template v-for="city in cities"> 
							<option>{{city}}</option>
						</template>
					</datalist>
					<li v-if="role === 'ADMIN' || role === 'HOST'">
						<select v-model="filter.type" class="search-field">
							<option value="">ALL</option>
							<option value="ROOM">ROOMS</option>
							<option value="APARTMENT">APARTMENTS</option>
						</select>
					</li>
					<li v-if="role === 'ADMIN' || role === 'HOST'">
						<select v-model="filter.status"  class="search-field">
							<option value="">ALL</option>
							<option>ACTIVE</option>
							<option>INACTIVE</option>
						</select>
					</li>
					<li><vue-ctk-date-time-picker class="search-field" v-model="filter.date" :label="'Choose dates'" :format="'DD/MM/YYYY'" :formatted="'DD/MM/YYYY'" :range="true" v-bind:disabledDates="['2020-09-11','2020-09-12','2020-09-13']"></vue-ctk-date-time-picker></li>
					<li>
						<input type="number" class="minMaxField" v-model="filter.minPrice" min="0"  placeholder="min price"><span>&nbsp;-</span>
						<input type="number" class="minMaxField"  v-model="filter.maxPrice" min="0"  placeholder="max price">
					</li>
					<li>
						<input type="number" class="minMaxField" v-model="filter.minRoom" min="1" placeholder="min room"><span>&nbsp;-</span>
						<input type="number" class="minMaxField"  v-model="filter.maxRoom" min="1"placeholder="max room">
					</li>
					<li>
						<input type="number" class="search-field" v-model="filter.guestNum" min="1" name="guestNum" placeholder="number of guests">
						<button type="button" class="minMaxField" @click="filterAmenities()">Amenities</button>
					</li>
					<li><button type="button" @click="searchClick()">Search</button></li>
				</ul>
			</form>
		</div>

		<div class="apartments-label">
			<button @click="openAddApartmentModal">Add apartment</button>
			<ul class="ap-ul">
				<li v-for="a in filteredApartments" class="apartment">
					<div class="image-holder">
						<!--<img src="images/ap1.jpg" class="">-->
					</div>
					<router-link class="hotel-name" :to="{ name: 'one-apartment', params: { id: a.id }}"><h3 class="hotel-name">{{a.name}}</h3></router-link>
					<label class="activity">status: {{a.status}}</label>
					<div class="host-data">
						<h4 class="host-username">username: {{a.hostUsername}}</h4>
					</div>
					<h4 class="sobe">room count:{{a.roomCount}}</h4>
					<h4 class="gosti">guest count: {{a.guestCount}}</h4>
					<button type="button" class="amenities" @click="showAmenities(a)">Sadrzaj</button> 
					<h3 class="price">{{a.price}}e</h3>
					<button type="button" v-if="role==='GUEST' " class="reserve" @click="openReserveDialog(a)">rezervisi</button>
				</li>
			</ul>
		</div>
		</div>
		<add-apartment-modal></add-apartment-modal>
		<reservate-apartment-modal></reservate-apartment-modal>
		<show-apartment-amenities></show-apartment-amenities>
		<select-amenities-for-search></select-amenities-for-search>
	</div>
	`,
		
	data: function() {
		return{
			apartments: {},
			role: 'ANON',
			filteredApartments: {},
			filter: {
				city: '',
				guestNum:'',
				minPrice:'',
				maxPrice:'',
				minRoom: '',
				maxRoom: '',
				date: {
					start: '',
					end: ''
				},
				type: '',
				status: '',
				amenitiesIds: [],
			},
			cities: [],
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
				let allCities = [];
				for(let apartment of this.apartments){
					allCities.push(apartment.location.address.city) ;
				}
				this.cities = allCities.filter((value,index,self)=> self.indexOf(value) === index)
				this.filteredApartments = this.apartments;
			});
			
		}
		else if(this.role === 'HOST'){
			axios
				.get('rest/apartments/host/'+this.$cookies.get('user').username)
				.then((response) => {
					this.apartments = response.data;
					let allCities = [];
					for(let apartment of this.apartments){
						allCities.push(apartment.location.address.city) ;
					}
					this.cities = allCities.filter((value,index,self)=> self.indexOf(value) === index)
					this.filteredApartments = this.apartments;
				})
		}else{
			axios
				.get('rest/apartments/active')
				.then((response) => {
					this.apartments = response.data;
					let allCities = [];
					for(let apartment of this.apartments){
						allCities.push(apartment.location.address.city) ;
					}
					this.cities = allCities.filter((value,index,self)=> self.indexOf(value) === index)
					this.filteredApartments = this.apartments;
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
		showAmenities(apartment){
			this.$root.$emit('apartment-amenities-dialog',apartment.amenitiesIds);
		},
		filterAmenities(){
			this.$root.$emit('show-amenities-for-select');
		},
		
		IsApartmentAvailable(apartment){
			//alert(apartment.id);
			return true;
			/*let filterCheckInDay;
			let filterCheckOutDay;
			
			if(this.filter.date.start) { 
				filterCheckInDay = new Date(this.filter.date.start);
				/*itemCheckInDay = new Date(item.checkInTime);
				bool1 = filterCheckInDay>=itemCheckInDay
		}
			if(this.filter.date.end ) {
				filterCheckOutDay = new Date(this.filter.date.end);
				 /*itemCheckOutDay = new Date(item.checkOutTime);
				 bool2 =filterCheckOutDay<=itemCheckOutDay;
			}*/
			
		},
		
		IsApartmentContainsAmenities(apartment){
			for(let amenityId of this.filter.amenitiesIds){
				let intAmenityId = parseInt(amenityId,10);
				if(!apartment.amenitiesIds.includes(intAmenityId)) return false; 
			}
			return true;
		},
		
		searchClick(){
			this.$root.$on('selected-amenities',(response)=>{
				this.filter.amenitiesIds = response;
			})
			if(this.filter.city === '' && this.filter.guestNum === '' && this.filter.minPrice === '' && 
					this.filter.maxPrice === '' && this.filter.minRoom === '' && this.filter.maxRoom === '' && 
					(this.filter.date == null || this.filter.date.start === '' )&& (this.filter.date == null || this.filter.date.end === '') && this.filter.type === '' && this.filter.status === '' && this.filter.amenitiesIds.length === 0)
				this.filteredApartments = this.apartments;
			else{
				this.filteredApartments = this.apartments.filter((item) => {		
					
					
					return item.location.address.city.toLowerCase().includes(this.filter.city.toLowerCase()) &&
							(this.filter.guestNum === '' || item.guestCount>= this.filter.guestNum) &&
							(this.filter.minPrice ==='' || item.price>=this.filter.minPrice) &&
							(this.filter.maxPrice ==='' || item.price<=this.filter.maxPrice) &&
							(this.filter.minRoom === '' || item.roomCount>=this.filter.minRoom)&&
							(this.filter.maxRoom === '' || item.roomCount<=this.filter.maxRoom)&&
							(this.filter.type === '' || item.type === this.filter.type)&&
							(this.filter.status === '' || item.status === this.filter.status) && 
							this.IsApartmentAvailable(item) && this.IsApartmentContainsAmenities(item);	
				});
			}
		},
	}

})

Vue.component('select-amenities-for-search',{
	template: 
		`
		<div class="modal" ref="showAmenitiesForSelectModal">
			<form>
				<div id="amenities-modal">
					<h1>Amenities</h1>
					<div id="amenities-list">
						<div v-for="a in amenities">
							<input type="checkbox" :value="a.id" name="cb"><label>{{a.name}}</label>
						</div>
		            </div>
					<button type="button" @click="closeDialog">Potvrdi</button>
	            </div>
			</form>
		</div>
		`,
		
		data: function(){
			return {
				amenities: {},
			}
		},
		
		mounted: function(){
			this.$root.$on('show-amenities-for-select',()=>{
				axios.get('rest/amenities/').then((response) =>{
					this.amenities = response.data;
					this.$refs.showAmenitiesForSelectModal.classList.add("modal-show");
					this.$refs.showAmenitiesForSelectModal.style.display = "block";
				});
			})
		},
		
		methods: {
			closeDialog(){
				
				let allCheckBoxs = document.getElementsByName('cb');
				let allSelectedIds = [];
				
				for(let checkbox of allCheckBoxs){
					if(checkbox.checked){
						allSelectedIds.push(checkbox.value);
					}
				}
				this.$root.$emit('selected-amenities',allSelectedIds);
				this.$refs.showAmenitiesForSelectModal.classList.remove("modal-show");
				this.$refs.showAmenitiesForSelectModal.style.display = "none";

			}
		}
})

Vue.component('show-apartment-amenities',{
	template: 
		`
		<div class="modal" ref="showAmenitiesModal">
			<form>
				<div id="amenities-modal">
					<h1>Amenities</h1>
					<div id="amenities-list">
						<ul>
							<li v-for="a in amenities">{{a.name}}</li>
						</ul>
		            </div>
					<button type="button" @click="closeDialog">Izadji</button>
	            </div>
			</form>
		</div>
		`,
	data: function() {
		return {
			amenities: [],
		}
	},
	
	mounted: function(){
		this.$root.$on('apartment-amenities-dialog',(amenitiesIds)=>{
			axios.get('rest/amenities')
				.then((response)=> {
					let allAmenities = response.data;
					this.amenities = allAmenities.filter((item)=>{
						for(let id of amenitiesIds){
							if(id===item.id) return true;
						}
						return false;
					})
					this.$refs.showAmenitiesModal.classList.add("modal-show");
					this.$refs.showAmenitiesModal.style.display = "block";
				})
		});	
	},
	
	methods: {
		closeDialog(){
			this.$refs.showAmenitiesModal.classList.remove("modal-show");
			this.$refs.showAmenitiesModal.style.display = "none";

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

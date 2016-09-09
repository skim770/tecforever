var config = {
    apiKey: "AIzaSyAJI1mRoNKalrvI6GxgzgcL2e0FRx2bg7I",
    authDomain: "tecforever-549d2.firebaseapp.com",
    databaseURL: "https://tecforever-549d2.firebaseio.com",
    storageBucket: "tecforever-549d2.appspot.com",
};
firebase.initializeApp(config);
var inventoryRef = firebase.database().ref('inventory');

firebase.auth().signInAnonymously().catch(function(error) {
  var errorCode = error.code;
  var errorMessage = error.message;
});

var xmlHttpReq = new XMLHttpRequest();
var categories = ['#new', '#ref', '#wd', '#dw', '#cooking', '#av', '#tv'];
var itemsNew = [];
var itemsRef = [];
var itemsWd = [];
var itemsDw = [];
var itemsCooking = [];
var itemsAv = [];
var itemsTv = [];
var itemsOthers = [];

var tabNew = document.getElementById('new');
tabNew.addEventListener('click', function() {activateCategory('#new')});
var tabRef = document.getElementById('ref');
tabRef.addEventListener('click', function() {activateCategory('#ref')});
var tabWd = document.getElementById('wd');
tabWd.addEventListener('click', function() {activateCategory('#wd')});
var tabDw = document.getElementById('dw');
tabDw.addEventListener('click', function() {activateCategory('#dw')});
var tabCooking = document.getElementById('cooking');
tabCooking.addEventListener('click', function() {activateCategory('#cooking')});
var tabAv = document.getElementById('av');
tabAv.addEventListener('click', function() {activateCategory('#av')});
var tabTv = document.getElementById('tv');
tabTv.addEventListener('click', function() {activateCategory('#tv')});
var tabOthers = document.getElementById('others');
tabOthers.addEventListener('click', function() {activateCategory('#others')});

inventoryRef.orderByChild('datePosted').once('value').then(function(snapshot) {
	snapshot.forEach(function(item) {
		if (item.val().remain != null && parseInt(item.val().remain) > 0) {
			itemsNew.push(item.val());
		}
	});
	activateCategory('#new');
});
inventoryRef.once('value').then(function(snapshot) {
	snapshot.forEach(function(item) {
		if (item.val().remain != null && parseInt(item.val().remain) > 0) {
			var type = item.val().inventoryType.toUpperCase();
			if (type.includes("RF") || type.includes("REF")) {
				itemsRef.push(item.val());
			} else if (type.includes("WASH") || type.includes("DRYER") || type.includes("PEDESTAL")) {
				itemsWd.push(item.val());
			} else if (type.includes("DISHW")) {
				itemsDw.push(item.val());
			} else if (type.includes("RANG") || type.includes("COOKTOP") || type.includes("OVEN") || type.includes("STOVE") || type.includes("MICRW")) {
				itemsCooking.push(item.val());
			} else if (type.includes("DVD") || type.includes("SOUND") || type.includes("AUDIO") || type.includes("PROJECTOR") || type.includes("THEATER")) {
				itemsAv.push(item.val());
			} else if (type.includes("TV")) {
				itemsTv.push(item.val());
			} else {
				itemsOthers.push(item.val());
			}
		}
	});
});

function activateCategory(id) {
	categories.forEach(function(category) {
		if (id === '#new' || id === '#others') {
			$('#sidebar-wrapper').addClass("none");
			$('#page-content-wrapper').addClass("scoot-left");
		} else {
			$('#sidebar-wrapper').removeClass("none");
			$('#page-content-wrapper').removeClass("scoot-left");
		}
		if (id === category) {
			$(category).addClass('active');
			$(category + "-filters").removeClass('is-hidden');
		} else {
			$(category).removeClass('active');
			$(category + "-filters").addClass('is-hidden');
		}
	});
	switch(id) {
		case '#new':
			renderDOM(itemsNew);
			break;
		case '#ref':
			renderDOM(itemsRef);
			break;
		case '#wd':
			renderDOM(itemsWd);
			break;
		case '#dw':
			renderDOM(itemsDw);
			break;
		case '#cooking':
			renderDOM(itemsCooking);
			break;
		case '#av':
			renderDOM(itemsAv);
			break;
		case '#tv':
			renderDOM(itemsTv);
			break;
		default:
			renderDOM(itemsOthers);	
	}
}

var InventoryList = React.createClass({
	render: function() {
		var items = this.props.data.map(function(item) {
			return (
				<Item data={item} />
			);
		});
		return (
			<div className="inventory-list">
				{items}
			</div>
		);
	}
});

var Item = React.createClass({
	render: function() {
		var imgTag;
		var type = this.props.data.inventoryType.toUpperCase();
		if (type.includes("RF") || type.includes("REF")) {
			imgTag = (<img src="resources/img/appliance_icons/refrigerator.svg" alt="Refrigerator" height="100%"/>);
		} else if (type.includes("WASH") || type.includes("DRYER") || type.includes("PEDESTAL")) {
			imgTag = (<img src="resources/img/appliance_icons/washing-machine.svg" width="100%" height="100%"/>);
		} else if (type.includes("DISHW")) {
			// var srclink = "http://www.lg.com/us/images/dishwashers/" + this.props.data.model.toLowerCase() + "/gallery/large01.jpg";
			// imgTag = (<img src={srclink} alt="Image not found" height="200px"/>);
			imgTag = (<img src="resources/img/appliance_icons/dishwasher.svg" width="100%" height="100%"/>);
		} else if (type.includes("RANG") || type.includes("COOKTOP") || type.includes("OVEN") || type.includes("STOVE") || type.includes("MICRW")) {
			imgTag = (<img src="resources/img/appliance_icons/oven.svg" width="100%" height="100%"/>);
		} else if (type.includes("DVD") || type.includes("SOUND") || type.includes("AUDIO") || type.includes("PROJECTOR") || type.includes("THEATER")) {
			imgTag = (<img src="resources/img/appliance_icons/music-player.svg" width="100%" height="100%"/>);
		} else if (type.includes("TV")) {
			imgTag = (<img src="resources/img/appliance_icons/television.svg" width="100%" height="100%"/>);
		} else {
			imgTag = (<img src="resources/img/tf-logo.png" width="100%" height="100%"/>);
		}

		return (
			<div className="inventory-item col-md-3">
				<div className="item-img">{imgTag}</div>
				<table width="100%"><tr>
					<td className="item-manufacturer">
						<div>{this.props.data.manufacturer}</div>
					</td>
					<td className="item-model">
						<div>{this.props.data.model}</div>
					</td>
				</tr></table>
				<div className="item-desc">{this.props.data.desc}</div>
				<div><table width="100%"><tr>
					<td className="item-original-price">
						<div>${this.props.data.origMarketCost}</div>
					</td>
					<td className="item-new-price">
						<div>${this.props.data.retailCost}</div>
					</td>
				</tr></table></div>
			</div>
		);
	}
});

function renderDOM(data) {
	ReactDOM.render(
		<InventoryList data={data} />,
		document.getElementById('inventory_container')
	);
}
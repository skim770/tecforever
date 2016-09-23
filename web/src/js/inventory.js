
var xmlHttpReq = new XMLHttpRequest();
var categories = ['#ref', '#wd', '#dw', '#cooking', '#av', '#tv'];
var currentCategory = '#ref';
var itemsNew = [];
var itemsRef = [];
var itemsWd = [];
var itemsDw = [];
var itemsCooking = [];
var itemsAv = [];
var itemsTv = [];

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

var sortBtn = document.getElementById('sort-btn');
var sortNew = document.getElementById('sort-Newest');
sortNew.addEventListener('click', function() {
	fetchFirebaseData('datePosted', 'descend');
	$("#sort-btn").html("Newest Arrivals <i class=\"material-icons\" style=\"float:right;\">expand_more</i>");
});
var sortLow = document.getElementById('sort-LowToHigh');
sortLow.addEventListener('click', function() {
	fetchFirebaseData('retailCost', 'ascend');
	$("#sort-btn").html("Price: Low to High <i class=\"material-icons\" style=\"float:right;\">expand_more</i>");
});
var sortHigh = document.getElementById('sort-HighToLow');
sortHigh.addEventListener('click', function() {
	fetchFirebaseData('retailCost', 'descend');
	$("#sort-btn").html("Price: High to Low <i class=\"material-icons\" style=\"float:right;\">expand_more</i>");
});

document.getElementById('overlay-close-btn').addEventListener('click', function() {
	$('#item-detail-popup').popup('hide');
});

function sortItems(sender) {
	switch (sender) {
		case 'lowToHigh':
			fetchFirebaseData('retailCost', 'ascend');
			document.getElementById('sort-btn').value = "Price: Low to High";
			break;
		case 'highToLow':
			fetchFirebaseData('retailCost', 'descend');
			document.getElementById('sort-btn').value = "Price: High to Low";
			break;
		default:
			fetchFirebaseData('datePosted', 'descend');
			document.getElementById('sort-btn').value = "Newest Arrivals";
	}
}

fetchFirebaseData('datePosted', 'descend');
function fetchFirebaseData(orderAttr, order) {
	itemsNew = [];
	itemsRef = [];
	itemsWd = [];
	itemsDw = [];
	itemsCooking = [];
	itemsAv = [];
	itemsTv = [];

	inStockRef.orderByChild(orderAttr).once('value').then(function(snapshot) {
		snapshot.forEach(function(item) {
			if (item.val().remain != null && parseInt(item.val().remain) > 0) {
				var itemClone = item.val();
				itemClone["firebaseKey"] = item.key;
				
				var type = item.val().inventoryType.toUpperCase();
				if (type.includes("RF") || type.includes("REF")) {
					itemsRef.push(itemClone);
				} else if (type.includes("WASH") || type.includes("DRYER") || type.includes("PEDESTAL")) {
					itemsWd.push(itemClone);
				} else if (type.includes("DISHW")) {
					itemsDw.push(itemClone);
				} else if (type.includes("RANG") || type.includes("COOKTOP") || type.includes("OVEN") || type.includes("STOVE") || type.includes("MICRW")) {
					itemsCooking.push(itemClone);
				} else if (type.includes("DVD") || type.includes("SOUND") || type.includes("AUDIO") || type.includes("PROJECTOR") || type.includes("THEATER")) {
					itemsAv.push(itemClone);
				} else if (type.includes("TV")) {
					itemsTv.push(itemClone);
				}
				itemsNew.push(itemClone);
			}
		});
		if (order == 'descend') {
			itemsNew.reverse();
			itemsRef.reverse();
			itemsWd.reverse();
			itemsDw.reverse();
			itemsCooking.reverse();
			itemsAv.reverse();
			itemsTv.reverse();
		}
		activateCategory(currentCategory);
	});
}

function activateCategory(id) {
	categories.forEach(function(category) {
		if (id === category) {
			$(category).addClass('active');
			$(category + "-filters").removeClass('is-hidden');
		} else {
			$(category).removeClass('active');
			$(category + "-filters").addClass('is-hidden');
		}
	});
	switch(id) {
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
	currentCategory = id;
}

var InventoryList = React.createClass({
	render: function() {
		var items = this.props.data.map(function(item) {
			if (item.origMarketCost == null || item.retailCost == null) {
				return;
			}
			return (
				<Item data={item}/>
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
	handleClick: function(data) {
		$('#item-detail-popup').removeClass("none");
		$('#ItemImage').attr('src', data.imgSrc);
		if (data.desc != null) {
			$('#Description').text(data.desc);
		} else {
			$('#Description').text("");
		}
		$('#Manufacturer').text(data.manufacturer);
		$('#Model').text(data.model);
		$('#Serial').text(data.serial);
		if (data.warranty != null) {
			$('#LabelWarranty').removeClass("none");
			$('#Warranty').removeClass("none");
			$('#Warranty').text(data.warranty);
		} else {
			$('#LabelWarranty').addClass("none");
			$('#Warranty').addClass("none");
		}
		if (data.condition != null) {
			$('#LabelCondition').removeClass("none");
			$('#Condition').removeClass("none");
			$('#Condition').text(data.condition);
		} else {
			$('#LabelCondition').addClass("none");
			$('#Condition').addClass("none");
		}
		$('#OurPrice').text("$" + data.retailCost.toFixed(2));
		$('#OriginalPrice').text("$" + data.origMarketCost.toFixed(2));

		var subject = "Regarding " + data.serial;
		var body = "Hi,\n\nI am interested in the following item,\n\n" + data.desc + "\nSERIAL: " + data.serial + "\nMODEL: " + data.model + "\n";
		var mailStr = "mailto:sales@tecforever.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
		$('#SendEmail').attr('href',  mailStr);

		$('#item-detail-popup').popup('show');
	},
	render: function() {
		var data = this.props.data;
		var saveRate = 0;
		if (data.origMarketCost != null && data.origMarketCost != typeof undefined 
			&& data.retailCost != null && data.retailCost != typeof undefined) {
			var saveRate = (data.origMarketCost - data.retailCost) / data.origMarketCost * 100;
		}
		var saleTag;
		if (saveRate > 0) {
			saleTag = "SAVE " + Math.round(saveRate) + "%";
		}
		return (
			<div className="inventory-item col-md-3" onClick={this.handleClick.bind(this, data)}>
				<div className="item-img">
					<img src={data.imgSrc} width="auto" height="100%"/>
				</div>
				<div className="sales-tag">{saleTag}</div>
				<div className="item-price-info">
					<table width="100%"><tr>
						<td className="item-new-price">
							<div>${data.retailCost.toFixed(2)}</div>
						</td>
						<td className="item-original-price">
							<div>${data.origMarketCost.toFixed(2)}</div>
						</td>
					</tr></table>
				</div>
				<div>
					<p className="item-manufacturer">{data.manufacturer}</p>
					<p className="item-model"> - {data.model} - </p>
					<p className="item-desc">{data.desc}</p>
				</div>
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
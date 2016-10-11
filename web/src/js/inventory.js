fetchFirebaseData('datePosted', 'descend');

var categories = {ref: [], wd: [], dw: [], cooking: [], av: [], tv: []};
var currentCategory = getQueryVariables("category");

function getQueryVariables(variable) {
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		if (pair[0] == variable) {
			return pair[1];
		}
	}
	return "ref";
}

if ($(window).width() < 480) {
	$(".collapse").collapse('hide');
	$("#sidebar-wrapper").addClass("none");
	$("#DataTable").addClass("none");
	$("#DataTable-480").removeClass("none");

	document.getElementById('mobileNavFilter').addEventListener('click', function() {
		$("#sidebar-wrapper").removeClass("none");
	});

	$(document).click(function(e) {
		if ($(e.target).is('.nav-cat')) {
			$('#tf-nav-collapse').collapse('hide');
		}
	    if (!$(e.target).is('a') && !$(e.target).is('li') && !$(e.target).is('i') && !$(e.target).is('.cat-filters') && !$(e.target).is(':checkbox') && !$(e.target).is('.panel') && !$(e.target).is('.panel-heading') && !$(e.target).is('.panel-body') && !$(e.target).is('panel-collapse')) {
	    	$('#tf-nav-collapse').collapse('hide');
	        $('#sidebar-wrapper.collapse').collapse('hide');        
	    }
	});
}

/*
 * Initialize click listeners for UI components.
 */
document.getElementById('ref').addEventListener('click', function() { activateCategory('ref') });
document.getElementById('wd').addEventListener('click', function() { activateCategory('wd') });
document.getElementById('dw').addEventListener('click', function() { activateCategory('dw') });
document.getElementById('cooking').addEventListener('click', function() { activateCategory('cooking') });
document.getElementById('av').addEventListener('click', function() { activateCategory('av') });
document.getElementById('tv').addEventListener('click', function() { activateCategory('tv') });
document.getElementById('overlay-close-btn').addEventListener('click', function() {$('#item-detail-popup').popup('hide');});

document.getElementById('sort-Newest').addEventListener('click', function() {
	fetchFirebaseData('datePosted', 'descend');
	$("#sort-btn").html("Newest Arrivals <i class=\"material-icons\" style=\"float:right;\">expand_more</i>");
});
document.getElementById('sort-LowToHigh').addEventListener('click', function() {
	fetchFirebaseData('retailCost', 'ascend');
	$("#sort-btn").html("Price: Low to High <i class=\"material-icons\" style=\"float:right;\">expand_more</i>");
});
document.getElementById('sort-HighToLow').addEventListener('click', function() {
	fetchFirebaseData('retailCost', 'descend');
	$("#sort-btn").html("Price: High to Low <i class=\"material-icons\" style=\"float:right;\">expand_more</i>");
});

/*
 * Called when "Sort by" component is changed.
 * Re-fetches from Firebase in correct order.
 */
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

function fetchFirebaseData(orderAttr, order) {
	categories = {ref: [], wd: [], dw: [], cooking: [], av: [], tv: []};

	inStockRef.orderByChild(orderAttr).once('value').then(function(snapshot) {
		snapshot.forEach(function(item) {
			if (item.val().remain != null && parseInt(item.val().remain) > 0) {
				var itemClone = item.val();
				itemClone["firebaseKey"] = item.key;
				
				var type = item.val().inventoryType.toUpperCase();
				if (type.includes("RF") || type.includes("REF")) {
					categories.ref.push(itemClone);
				} else if (type.includes("WASH") || type.includes("DRYER") || type.includes("PEDESTAL")) {
					categories.wd.push(itemClone);
				} else if (type.includes("DISHW")) {
					categories.dw.push(itemClone);
				} else if (type.includes("RANG") || type.includes("COOKTOP") || type.includes("OVEN") || type.includes("STOVE") || type.includes("MICRW")) {
					categories.cooking.push(itemClone);
				} else if (type.includes("DVD") || type.includes("SOUND") || type.includes("AUDIO") || type.includes("PROJECTOR") || type.includes("THEATER")) {
					categories.av.push(itemClone);
				} else if (type.includes("TV")) {
					categories.tv.push(itemClone);
				}
			}
		});
		if (order == 'descend') {
			for (var key in categories) {
				categories[key].reverse();
			}
		}
		activateCategory(currentCategory);
	});
}

/*
 * Called when a category is changed. Re-renders DOM accordingly.
 * id - Category (i.e. ref, wd, etc)
 */
function activateCategory(id) {
	for (var key in categories) {
		if (id === key) {
			$("#" + key).addClass('active');
			$("#" + key + "-filters").removeClass('is-hidden');
		} else {
			$("#" + key).removeClass('active');
			$("#" + key + "-filters").addClass('is-hidden');
		}
	}
	currentCategory = id;
	filterInventory();
}

/*
 * Define Filtering behavior with checkbox change event
 */
$(':checkbox').change(function() { filterInventory() });
function filterInventory() {
	var allUnchecked = true;
	var filterCondition = "";
	var filterCBs = $("#" + currentCategory + "-filters").find($("div.panel-body"));

	for (var i = 0; i < filterCBs.length; i++) {
		var subFilterCBs = jQuery(filterCBs[i]).find($(":checkbox"));
		for (var j = 0; j < subFilterCBs.length; j++) {
			var elmComp = subFilterCBs[j].id.split("-");
			if (subFilterCBs[j].checked) {
				var subCondition = "";
				for (var k = 2; k < elmComp.length; k++) {
					if (elmComp[k].includes("!")) {
						subCondition += " && !desc.includes('" + elmComp[k].substring(1) + "')";
					} else if (elmComp[k].includes("+")) {
						var unitCondition = "";
						var units = elmComp[k].split("+");
						for (var l = 0; l < units.length; l++) {
							unitCondition += " || desc.includes('" + units[l] + "')";
						}
						subCondition += " && (" + unitCondition.substring(4) + ")";
					} else {
						subCondition += " && desc.includes('" + elmComp[k] + "')";
					}
				}
				filterCondition += " || (" + subCondition.substring(4) + ")";
				allUnchecked = false;
			}
		}
	}

	if (allUnchecked) {
		renderDOM(categories[currentCategory]);
	} else {
		filterCondition = filterCondition.substring(4);
		var filteredList = categories[currentCategory].filter(filterRules);
		renderDOM(filteredList);
	}

	function filterRules(item) {
		console.log(filterCondition);
		if (item.desc) {
			var desc = item.desc.toLowerCase();
			if (eval(filterCondition)) return item;
		}
	}
}

// ****************************************************************************
// ************************  JSX for React components  ************************
// ****************************************************************************
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
		$('.Manufacturer').text(data.manufacturer);
		$('.Model').text(data.model);
		$('.Serial').text(data.serial);
		if (data.warranty != null) {
			$('.LabelWarranty').removeClass("none");
			$('.Warranty').removeClass("none");
			$('.Warranty').text(data.warranty);
		} else {
			$('.LabelWarranty').addClass("none");
			$('.Warranty').addClass("none");
		}
		if (data.condition != null) {
			$('.LabelCondition').removeClass("none");
			$('.Condition').removeClass("none");
			$('.Condition').text(data.condition);
		} else {
			$('.LabelCondition').addClass("none");
			$('.Condition').addClass("none");
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
		if (saveRate > 0)
			saleTag = "SAVE " + Math.round(saveRate) + "%";
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
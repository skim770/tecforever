/*
 * Firebase
 */
var config = {
    apiKey: "AIzaSyAJI1mRoNKalrvI6GxgzgcL2e0FRx2bg7I",
    authDomain: "tecforever-549d2.firebaseapp.com",
    databaseURL: "https://tecforever-549d2.firebaseio.com",
    storageBucket: "tecforever-549d2.appspot.com",
};
firebase.initializeApp(config);
var fbInventoryRef = firebase.database().ref('inventory');
var fbInvInStockRef = firebase.database().ref('inventory/inStock');
var fbInvSoldOutRef = firebase.database().ref('inventory/soldOut');
var fbInvScrapRef = firebase.database().ref('inventory/scrap');
var fbImgMapRef = firebase.database().ref('/imageMap');

window.onload = function() {
	firebase.auth().onAuthStateChanged(function(user) {
		if (!user) {
			window.location.href = "login.html";
	    }
	});
	fullInventory();
};

var feedData;
var inventory = [];
var inStock = [];
var soldOut = [];
var imgMap = {};
var fileInputTextDiv = document.getElementById('file_input_text_div');
var fileInput = document.getElementById('file_input_file');
var fileInputText = document.getElementById('file_input_text');
var confirmBtn = document.getElementById('confirm-btn');
var cancelBtn = document.getElementById('cancel-btn');
fileInput.addEventListener('change', changeInputText);
fileInput.addEventListener('change', changeState);
fileInput.addEventListener('change', handleFile, false);

confirmBtn.addEventListener('click', function() {
	if (feedData != null) {
		pushNewInventory(feedData);
		reset();
	}
})
cancelBtn.addEventListener('click', function() {
	reset();
});

$(window).scroll(function() {
	$('#content-header').css({
		'top': $(this).scrollTop() - 95
	});
});

function changeState() {
    if (fileInputText.value.length != 0) {
    	confirmBtn.classList.remove('is-hidden');
  		cancelBtn.classList.remove('is-hidden');
  	} else {
    	confirmBtn.classList.add('is-hidden');
  		cancelBtn.classList.add('is-hidden');
  	}
}

function reset() {
	fileInput.value = "";
	fileInputText.value = "";
	changeState();
	renderDOM(fullInventory());
}

function fullInventory() {
	fbInvInStockRef.once('value', function(snapshot) {
		snapshot.forEach(function(item) {
			var newItem = item.val();
			newItem.firebaseKey = item.key;
			inStock.push(newItem);
			inventory.push(newItem);
		});
	}).then(function() {
		fbInvSoldOutRef.once('value', function(snapshot) {
			snapshot.forEach(function(item) {
				var newItem = item.val();
				newItem.firebaseKey = item.key;
				soldOut.push(newItem);
				inventory.push(newItem);
			});
		}).then(function() {
			renderDOM(inventory);
		});
	});
}

function pushNewInventory(inventory) {
	fbImgMapRef.once('value', function(snapshot) {
		snapshot.forEach(function(item) {
			imgMap[item.key] = item.val();
		});
		var today = new Date();
		for (var index in inventory) {
			inventory[index].imgSrc = mapDataToImage(inventory[index].inventoryType, inventory[index].model, inventory[index].desc);
			inventory[index].datePosted = today.getFullYear() + "-" + today.getMonth() + "-" + today.getDate();
			if ((inventory[index].retailCost == null || typeof inventory[index].retailCost == 'undefined') && (inventory[index].origMarketCost == null || typeof inventory[index].origMarketCost == 'undefined')) {
				var newKey = fbInvScrapRef.push().key;
				fbInvScrapRef.child(newKey).set(inventory[index]);
			} else if (inventory[index].remain != null && inventory[index].soldOut == null) {
				var newKey = fbInvInStockRef.push().key;
			    fbInvInStockRef.child(newKey).set(inventory[index]);
			} else if (inventory[index].remain == null && inventory[index].soldOut != null) {
				var newKey = fbInvSoldOutRef.push().key;
			    fbInvSoldOutRef.child(newKey).set(inventory[index]);
			}
		}
		alert("[" + today + "]\n\n" + fileInputText.value + "\n\tadded to the inventory.");
	});
}

function mapDataToImage(inventoryType, model, description) {
	var imgSrc;
	if (imgMap[model] != null) {
		imgSrc = imgMap[model];
	} else {
		var desc = description != null? description.toLowerCase() : "";
		var xmlHttp = new XMLHttpRequest();
		var type = inventoryType.toUpperCase();
		if (type.includes("RF") || type.includes("REF")) {
			imgSrc = "resources/img/appliance_icons/refrigerator.svg";
		} else if (type.includes("WASH") || type.includes("DRYER") || type.includes("PEDESTAL")) {
			imgSrc = "resources/img/appliance_icons/washing-machine.svg";
		} else if (type.includes("DISHW")) {
			imgSrc = "resources/img/appliance_icons/dishwasher.svg";
		} else if (type.includes("RANG") || type.includes("COOKTOP") || type.includes("OVEN") || type.includes("STOVE") || type.includes("MICRW")) {
			imgSrc = "resources/img/appliance_icons/oven.svg";
		} else if (type.includes("DVD") || type.includes("SOUND") || type.includes("AUDIO") || type.includes("PROJECTOR") || type.includes("THEATER")) {
			imgSrc = "resources/img/appliance_icons/music-player.svg";
		} else if (type.includes("TV")) {
			imgSrc = "resources/img/appliance_icons/television.svg";
		} else {
			imgSrc = "resources/img/tf-logo.png";
		}
	}
	return imgSrc;
}

function changeInputText() {
  	var str = fileInput.value;
  	var i;
  	if (str.lastIndexOf('\\')) {
    	i = str.lastIndexOf('\\') + 1;
  	} else if (str.lastIndexOf('/')) {
    	i = str.lastIndexOf('/') + 1;
  	}
  	fileInputText.value = str.slice(i, str.length);
}

function handleFile(e) {
    var files = e.target.files;
    var i,f;
    for (i = 0, f = files[i]; i != files.length; ++i) {
	    var reader = new FileReader();
	    var name = f.name;
	    reader.onload = function(e) {
		    var data = e.target.result;
		    var workbook = XLSX.read(data, {type: 'binary'});
		    parseXLSX(workbook);
	    };
	    reader.readAsBinaryString(f);
    }
}

function parseXLSX(workbook) {
	workbook.SheetNames.forEach(function(sheetName) {
	    var worksheet = workbook.Sheets[sheetName];
	    var rawJSON = XLSX.utils.sheet_to_json(worksheet);
        feedData = processRawJsonData(rawJSON);
        renderDOM(feedData);
	});
}

function processRawJsonData(json) {
	var processedJSON = [];
	for (var i in json) {
		var data = json[i];
		if (!('MODEL#' in data)) {
			continue;
		}

		var renderData = {};
		for (var k in data) {
			var key = k.toLowerCase();
			if (key.includes("shipment")) {
				renderData.shipment = data[k];
			} else if (key.includes("packing") && key.includes("slips") && key.includes("seq")) {
				renderData.packingSlipSeq = data[k];
			} else if (key.includes("input") && key.includes("type")) {
				renderData.sysInputType = data[k];
			} else if (key.includes("lg") && key.includes("wh")) {
				renderData.lgwh = data[k];
			} else if (key.includes("wh") && key.includes("loc")) {
				renderData.whLoc = data[k];
			} else if (key.includes("cyn") && key.includes("wh")) {
				renderData.cynWH = data[k];
			} else if (key.includes("manufacture")) {
				renderData.manufacturer = data[k];
			} else if (key.includes("division")) {
				renderData.division = data[k];
			} else if (key.includes("bay") && key.includes("dock")) {
				renderData.bayDockNum = data[k];
			} else if (key.includes("inventory") && key.includes("type")) {
				renderData.inventoryType = data[k];
			} else if (key.includes("model") && key.includes("#")) {
				if (key.includes("corrected")) {
					renderData.correctedModel = data[k];
				} else if ('MODEL' in data) {
					renderData.model = data["MODEL"];
				} else {
					renderData.model = data[k];
				}
			} else if (key.includes("desc")) {
				renderData.desc = data[k];
			} else if (key.includes("serial") && key.includes("#")) {
				renderData.serial = data[k];
				if (key.includes("cyn")) {
					renderData.cynSerial = data[k];
				} else if (key.includes("corrected")) {
					renderData.correctedSerial = data[k];
				} else {
					renderData.serialNum = data[k];
				}
			} else if (key.includes("tag") && key.includes("removal")) {
				renderData.tagRemoval = data[k];
			} else if (key.includes("cosmetic") && key.includes("grade")) {
				renderData.grade = data[k];
			} else if (key.includes("function") && key.includes("fail")) {
				renderData.funcTestFailed = data[k];
			} else if (key.includes("rec'd q'ty") && !(key.includes("no"))) {
				renderData.recdQty = data[k];
			} else if (key.includes("rec'd q'ty") && key.includes("no")) {
				renderData.noRecdQty = data[k];
			} else if (key.includes("rec'd") && key.includes("truck") && key.includes("load") && key.includes("#")) {
				renderData.recdTruckLoadNum = data[k];
			} else if (key.includes("packing") && key.includes("slip")) {
				if (key.includes("q'ty")) {
					renderData.packingSlipQty = data[k];
				} else if (key.includes("ship") && key.includes("#")) {
					renderData.packingSlipNum = data[k];
				}
			} else if (key.includes("ship") && key.includes("truck")) {
				renderData.truckLoadNum = data[k];
			} else if (key.includes("hold")) {
				renderData.hold = data[k];
			} else if (key.includes("offer")) {
				renderData.offer = data[k];
			} else if (key.includes("delivery") && key.includes("storage")) {
				renderData.deliveryStorage = data[k];
			} else if (key.includes("warranty")) {
				renderData.warranty = data[k];
			} else if (key.includes("prev") && key.includes("loc")) {
				renderData.prevLoc = data[k];
			} else if (key.includes("container") && key.includes("#")) {
				renderData.containerNum = data[k];
			} else if (key.includes("rec'd") && key.includes("date")) {
				renderData.recdDate = data[k];
			} else if (key.includes("rec'd") && key.includes("condition")) {
				renderData.condition = data[k];
			} else if (key.includes("purchased") && key.includes("pricing") && key.includes("rate")) {
				renderData.purchasedPricingRate = data[k];
			} else if (key.includes("unit") && key.includes("price")) {
				renderData.unitPrice = data[k];
			} else if (key.includes("lg") && key.includes("amount")) {
				renderData.lgAmount = data[k];
			} else if (key.includes("dae") && key.includes("heung")) {
				renderData.daeheung = data[k];
			} else if (key.includes("cyn") && (key.includes("cost") || key.includes("$"))) {
				renderData.cynCost = data[k];
			} else if (key.includes("vip")) {
				renderData.vipCost = data[k];
			} else if (key.includes("wholesale")) {
				renderData.wholesaleCost = data[k];
			} else if (key.includes("original") && key.includes("market")) {
				renderData.origMarketCost = data[k];
			} else if (key.includes("price") && key.includes("off") && key.includes("rate")) {
				renderData.priceOffRate = data[k];
			} else if (key.includes("retail")) {
				renderData.retailCost = data[k];
			} else if (key.includes("sold") && key.includes("out") && key.includes("act")) {
				renderData.soldOutActCost = data[k];
			} else if (key.includes("invoice")) {
				renderData.invoice = data[k];
			} else if (key.includes("tecforever") && key.includes("po") && key.includes("#")) {
				renderData.tfPO = data[k];
			} else if (key.includes("sold") && key.includes("out")) {
				renderData.soldOut = data[k];
			} else if (key.includes("remain")) {
				renderData.remain = data[k];
			}
		}
		processedJSON.push(renderData);
	}
	return processedJSON;
}

/*
 * React DOM render using JSX
 */
var NewInventoryList = React.createClass({
	render: function() {
		var itemNodes = this.props.data.map(function(item) {
			return (
				<NewItem data={item} />
			);
		});
		return (
			<div className="new_inventory_list">
				{itemNodes}
			</div>
		);
	}
});

var NewItem = React.createClass({
	render: function() {
		var data = this.props.data;
		return (
			<div className="new_inventory_item">
			<table><tr>
				<td><div className="shipment">{data.shipment}</div></td>
				<td><div className="packing-slips-seq">{data.packingSlipSeq}</div></td>
				<td><div className="sys-input-type">{data.sysInputType}</div></td>
				<td><div className="lg-wh">{data.lgwh}</div></td>
				<td><div className="wh-loc">{data.whLoc}</div></td>
				<td><div className="cyn-wh">{data.cynWH}</div></td>
                <td><div className="manufacture">{data.manufacturer}</div></td>
                <td><div className="division">{data.division}</div></td>
                <td><div className="lg-bay-dock">{data.bayDockNum}</div></td>
				<td><div className="inventory-type">{data.inventoryType}</div></td>
				<td><div className="model-num">{data.model}</div></td>
				<td><div className="model-desc">{data.desc}</div></td>
				<td><div className="corrected-model">{data.correctedModel}</div></td>
                <td><div className="serial-num">{data.serialNum}</div></td>
                <td><div className="tag-removal">{data.tagRemoval}</div></td>
                <td><div className="corrected-serial">{data.correctedSerial}</div></td>
				<td><div className="cyn-serial">{data.cynSerial}</div></td>
				<td><div className="cyn-cosmetic-grade">{data.grade}</div></td>
				<td><div className="cyn-func-test-failed">{data.funcTestFailed}</div></td>
				<td><div className="recd-qty">{data.recdQty}</div></td>
				<td><div className="no-recd-qty">{data.noRecdQty}</div></td>
				<td><div className="packing-slip-qty">{data.packingSlipQty}</div></td>
                <td><div className="ship-load-packing-slip">{data.packingSlipNum}</div></td>
				<td><div className="ship-truck-load-num">{data.truckLoadNum}</div></td>
				<td><div className="hold-not-sold">{data.hold}</div></td>
				<td><div className="offer">{data.offer}</div></td>
				<td><div className="delivery-storage">{data.deliveryStorage}</div></td>
				<td><div className="warranty">{data.warranty}</div></td>
				<td><div className="cyn-prev-wh-loc">{data.prevLoc}</div></td>
                <td><div className="recd-truck-load-num">{data.truckLoadNum}</div></td>
                <td><div className="recd-container-num">{data.containerNum}</div></td>
                <td><div className="recd-date">{data.recdDate}</div></td>
                <td><div className="condition">{data.condition}</div></td>
                <td><div className="purchased-pricing-rate">{data.purchasedPricingRate}</div></td>
                <td><div className="lg-unit-price">{data.unitPrice}</div></td>
                <td><div className="lg-amount">{data.lgAmount}</div></td>
                <td><div className="daeheung">{data.daeheung}</div></td>
				<td><div className="cyn-cost">{data.cynCost}</div></td>
				<td><div className="vip-cost">{data.vipCost}</div></td>
				<td><div className="wholesale-cost">{data.wholesaleCost}</div></td>
				<td><div className="original-market-cost">{data.origMarketCost}</div></td>
				<td><div className="price-off-rate">{data.priceOffRate}</div></td>
				<td><div className="retail-cost">{data.retailCost}</div></td>
				<td><div className="sold-out-act-cost">{data.soldOutActCost}</div></td>
				<td><div className="invoice-num">{data.invoice}</div></td>
				<td><div className="tf-po-num">{data.tfPO}</div></td>
				<td><div className="sold-out">{data.soldOut}</div></td>
				<td><div className="remain">{data.remain}</div></td>
			</tr></table>
			</div>
		)
	}
});

function renderDOM(data) {
	ReactDOM.render(
		<NewInventoryList data={data} />,
		document.getElementById('inventory_container')
	);
}
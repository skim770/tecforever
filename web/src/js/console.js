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

// fbInvInStockRef.remove();
// fbInvSoldOutRef.remove();
// fbInvScrapRef.remove();

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
var overlayCancelBtn = document.getElementById('cancelSave');
fileInput.addEventListener('change', changeInputText);
fileInput.addEventListener('change', changeState);
fileInput.addEventListener('change', handleFile, false);

confirmBtn.addEventListener('click', function() {
	if (feedData != null) {
		pushNewInventory(feedData);
	}
})
cancelBtn.addEventListener('click', function() {
	reset();
});
overlayCancelBtn.addEventListener('click', function() {
	$('#item-detail-popup').popup('hide');
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
	inventory = [];
	inStock = [];
	soldOut = [];
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
			console.log("Rendering " + inventory.length + " inventory items.");
			console.log("Rendering " + inStock.length + " inStock items.");
			console.log("Rendering " + soldOut.length + " soldOut items.");
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
		reset();
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

function updateFirebaseFromOverlayInfo(key) {
	var updates = {};
	updates["/" + key + "/shipment"] = $('#Shipment').val();
	updates["/" + key + "/packingSlipSeq"] = $('#PackingSlipsSeq').val();
	updates["/" + key + "/sysInputType"] = $('#SysInputType').val();
	updates["/" + key + "/lgwh"] = $('#LGWH').val();
	updates["/" + key + "/whLoc"] = $('#WHLOC').val();
	updates["/" + key + "/cynWH"] = $('#CYNWH').val();
	updates["/" + key + "/manufacturer"] = $('#Manufacturer').val();
	updates["/" + key + "/division"] = $('#Division').val();
	updates["/" + key + "/bayDockNum"] = $('#LGBayDock').val();
	updates["/" + key + "/inventoryType"] = $('#InventoryType').val();
	updates["/" + key + "/model"] = $('#Model').val();
	updates["/" + key + "/desc"] = $('#Description').val();
	updates["/" + key + "/correctedModel"] = $('#CorrectedModel').val();
	updates["/" + key + "/serialNum"] = $('#SerialNum').val();
	updates["/" + key + "/tagRemoval"] = $('#TagRemoval').val();
	updates["/" + key + "/correctedSerial"] = $('#CorrectedSerial').val();
	updates["/" + key + "/cynSerial"] = $('#CYNSerial').val();
	updates["/" + key + "/grade"] = $('#Grade').val();
	updates["/" + key + "/funcTestFailed"] = $('#FunctionTest').val();
	updates["/" + key + "/recdQty"] = $('#RecdQty').val();
	updates["/" + key + "/noRecdQty"] = $('#NoRecdQty').val();
	updates["/" + key + "/packingSlipQty"] = $('#PackingSlipQty').val();
	updates["/" + key + "/packingSlipNum"] = $('#ShipLoadPackingSlip').val();
	updates["/" + key + "/truckLoadNum"] = $('#ShipTruckLoadNum').val();
	updates["/" + key + "/hold"] = $('#Hold').val();
	updates["/" + key + "/offer"] = $('#Offer').val();
	updates["/" + key + "/deliveryStorage"] = $('#DeliveryStorage').val();
	updates["/" + key + "/warranty"] = $('#Warranty').val();
	updates["/" + key + "/prevLoc"] = $('#CYNPrevWHLoc').val();
	updates["/" + key + "/recdTruckLoadNum"] = $('#RecdTruckLoadNum').val();
	updates["/" + key + "/containerNum"] = $('#RecdContainerNum').val();
	updates["/" + key + "/recdDate"] = $('#RecdDate').val();
	updates["/" + key + "/condition"] = $('#Condition').val();
	updates["/" + key + "/purchasedPricingRate"] = $('#PurchasedPricingRate').val();
	updates["/" + key + "/unitPrice"] = $('#UnitPrice').val();
	updates["/" + key + "/lgAmount"] = $('#LGAmount').val();
	updates["/" + key + "/daeheung"] = $('#Daeheung').val();
	updates["/" + key + "/cynCost"] = $('#CYNCost').val();
	updates["/" + key + "/vipCost"] = $('#VIPCost').val();
	updates["/" + key + "/wholesaleCost"] = $('#WholesaleCost').val();
	updates["/" + key + "/origMarketCost"] = $('#OriginalMarketCost').val();
	updates["/" + key + "/priceOffRate"] = $('#PriceOffRate').val();
	updates["/" + key + "/retailCost"] = $('#RetailCost').val();
	updates["/" + key + "/soldOutActCost"] = $('#SoldOutActCost').val();
	updates["/" + key + "/invoice"] = $('#InvoiceNum').val();
	updates["/" + key + "/tfPO"] = $('#PONum').val();
	updates["/" + key + "/soldOut"] = $('#SoldOut').val();
	updates["/" + key + "/remain"] = $('#Remain').val();
	fbInvInStockRef.update(updates).then(function() {
		$('#item-detail-popup').popup('hide');
		reset();
	});
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
				if (isNaN(data[k].replace(/,/g, ''))) {
					renderData.origMarketCost = 0;
				} else {
					renderData.origMarketCost = parseFloat(data[k].replace(/,/g, ''));
				}
			} else if (key.includes("price") && key.includes("off") && key.includes("rate")) {
				renderData.priceOffRate = data[k];
			} else if (key.includes("retail")) {
				if (isNaN(data[k].replace(/,/g, ''))) {
					renderData.retailCost = 0;
				} else {
					renderData.retailCost = parseFloat(data[k].replace(/,/g, ''));
				}
			} else if (key.includes("sold") && key.includes("out") && key.includes("act")) {
				renderData.soldOutActCost = data[k];
			} else if (key.includes("invoice")) {
				renderData.invoice = data[k];
			} else if (key.includes("tecforever") && key.includes("po") && key.includes("#")) {
				renderData.tfPO = data[k];
			} else if (key.includes("sold") && key.includes("out")) {
				renderData.soldOut = data[k];
				if (data[k] == null || data[k] == "") {
					renderData.soldOut = 0;
				}
			} else if (key.includes("remain")) {
				renderData.remain = data[k];
				if (data[k] == null || data[k] == "") {
					renderData.remain = 0;
				}
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
	handleClick: function(data) {
		$('#item-detail-popup').removeClass("none");
		$('#ItemImage').attr('src', data.imgSrc);
		$('#Shipment').val(data.shipment);
		$('#PackingSlipsSeq').val(data.packingSlipSeq);
		$('#SysInputType').val(data.sysInputType);
		$('#LGWH').val(data.lgwh);
		$('#WHLOC').val(data.whLoc);
		$('#CYNWH').val(data.cynWH);
		$('#Manufacturer').val(data.manufacturer);
		$('#Division').val(data.division);
		$('#LGBayDock').val(data.bayDockNum);
		$('#InventoryType').val(data.inventoryType);
		$('#Model').val(data.model);
		$('#Description').val(data.desc);
		$('#CorrectedModel').val(data.correctedModel);
		$('#SerialNum').val(data.serialNum);
		$('#TagRemoval').val(data.tagRemoval);
		$('#CorrectedSerial').val(data.correctedSerial);
		$('#CYNSerial').val(data.cynSerial);
		$('#Grade').val(data.grade);
		$('#FunctionTest').val(data.funcTestFailed);
		$('#RecdQty').val(data.recdQty);
		$('#NoRecdQty').val(data.noRecdQty);
		$('#PackingSlipQty').val(data.packingSlipQty);
		$('#ShipLoadPackingSlip').val(data.packingSlipNum);
		$('#ShipTruckLoadNum').val(data.truckLoadNum);
		$('#Hold').val(data.hold);
		$('#Offer').val(data.offer);
		$('#DeliveryStorage').val(data.deliveryStorage);
		$('#Warranty').val(data.warranty);
		$('#CYNPrevWHLoc').val(data.prevLoc);
		$('#RecdTruckLoadNum').val(data.recdTruckLoadNum);
		$('#RecdContainerNum').val(data.containerNum);
		$('#RecdDate').val(data.recdDate);
		$('#Condition').val(data.condition);
		$('#PurchasedPricingRate').val(data.purchasedPricingRate);
		$('#UnitPrice').val(data.unitPrice);
		$('#LGAmount').val(data.lgAmount);
		$('#Daeheung').val(data.daeheung);
		$('#CYNCost').val(data.cynCost);
		$('#VIPCost').val(data.vipCost);
		$('#WholesaleCost').val(data.wholesaleCost);
		$('#OriginalMarketCost').val(data.origMarketCost);
		$('#PriceOffRate').val(data.priceOffRate);
		$('#RetailCost').val(data.retailCost);
		$('#SoldOutActCost').val(data.soldOutActCost);
		$('#InvoiceNum').val(data.invoice);
		$('#PONum').val(data.tfPO);
		$('#SoldOut').val(data.soldOut);
		$('#Remain').val(data.remain);

		if (data.remain == null || data.remain == "" || data.remain == 0) {
			$('#itemSold').addClass('none');
		} else {
			$('#itemSold').removeClass('none');
			$('#itemSold').bind("click", function() {
				var key = data.firebaseKey;
				data.firebaseKey = null;
				data.remain = parseInt(data.remain) - 1;
				if (data.soldOut != null) {
					data.soldOut = parseInt(data.soldOut) + 1;
				} else {
					data.soldOut = 1;
				}
				
				if (data.remain <= 0) {
					fbInvSoldOutRef.child(key).set(data);
					fbInvInStockRef.child(key).remove().then(function() {
						$('#item-detail-popup').popup('hide');
						reset();
					});
				} else {
					updateFirebaseFromOverlayInfo(key);
				}
			});
		}

		$('#deleteItem').bind("click", function() {
			fbInvInStockRef.child(data.firebaseKey).remove().then(function() {
				$('#item-detail-popup').popup('hide');
				reset();
			});
		});

		$('#saveToFirebase').bind("click", function() {
			updateFirebaseFromOverlayInfo(data.firebaseKey);
		});

		$('#item-detail-popup').popup('show');
	},
	render: function() {
		var data = this.props.data;
		return (
			<div className="new_inventory_item" onClick={this.handleClick.bind(this, data)}>
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
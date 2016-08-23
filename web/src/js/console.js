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
window.onload = function() {
	firebase.auth().onAuthStateChanged(function(user) {
		if (!user) {
			window.location.href = "login.html";
	    }
	});
};

var fileInputTextDiv = document.getElementById('file_input_text_div');
var fileInput = document.getElementById('file_input_file');
var fileInputText = document.getElementById('file_input_text');
var confirmBtn = document.getElementById('confirm-btn');
var cancelBtn = document.getElementById('cancel-btn');
fileInput.addEventListener('change', changeInputText);
fileInput.addEventListener('change', changeState);
fileInput.addEventListener('change', handleFile, false);

cancelBtn.addEventListener('click', function() {
	fileInput.value = "";
	fileInputText.value = "";
	changeState();
	renderDOM([]);
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
        var jsonData = XLSX.utils.sheet_to_json(worksheet);
        renderDOM(jsonData);
	});
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
		if (!('MODEL#' in data)) {
			return null;
		}

		var renderData = {};
		var k;
		for (k in data) {
			var key = k.toLowerCase();
			if (key.includes("shipment")) {
				renderData.shipment = data[k];
			} else if (key.includes("packing") && key.includes("slips") && key.includes("seq")) {
				renderData.packingSlipSeq = data[k];
			} else if (key.includes("lg") && key.includes("wh")) {
				renderData.lgwh = data[k];
			} else if (key.includes("inventory") && key.includes("type")) {
				renderData.inventoryType = data[k];
			} else if (key.includes("model") && key.includes("#")) {
				renderData.model = data[k];
				if ('MODEL' in data) {
					renderData.model = data["MODEL"];
				}
			} else if (key.includes("desc")) {
				renderData.desc = data[k];
			} else if (key.includes("serial") && key.includes("#")) {
				renderData.serial = data[k];
			} else if (key.includes("cosmetic") && key.includes("grade")) {
				renderData.grade = data[k];
			} else if (key.includes("function") && key.includes("fail")) {
				renderData.funcTestFailed = data[k];
			} else if (key.includes("rec") && key.includes("q") && !key.includes("no")) {
				renderData.recdQty = data[k];
			} else if (key.includes("rec") && key.includes("q") && key.includes("no")) {
				renderData.noRecdQty = data[k];
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
		return (
			<div className="new_inventory_item">
			<table><tr>
				<td><div className="shipment">{renderData.shipment}</div></td>
				<td><div className="packing-slips-seq">{renderData.packingSlipSeq}</div></td>
				<td><div className="lg-wh">{renderData.lgwh}</div></td>
				<td><div className="inventory-type">{renderData.inventoryType}</div></td>
				<td><div className="model-num">{renderData.model}</div></td>
				<td><div className="model-desc">{renderData.desc}</div></td>
				<td><div className="cyn-serial">{renderData.serial}</div></td>
				<td><div className="cyn-cosmetic-grade">{renderData.grade}</div></td>
				<td><div className="cyn-func-test-failed">{renderData.funcTestFailed}</div></td>
				<td><div className="recd-qty">{renderData.recdQty}</div></td>
				<td><div className="no-recd-qty">{renderData.noRecdQty}</div></td>
				<td><div className="ship-truck-load-num">{renderData.truckLoadNum}</div></td>
				<td><div className="hold-not-sold">{renderData.hold}</div></td>
				<td><div className="offer">{renderData.offer}</div></td>
				<td><div className="delivery-storage">{renderData.deliveryStorage}</div></td>
				<td><div className="warranty">{renderData.warranty}</div></td>
				<td><div className="cyn-cost">{renderData.cynCost}</div></td>
				<td><div className="vip-cost">{renderData.vipCost}</div></td>
				<td><div className="wholesale-cost">{renderData.wholesaleCost}</div></td>
				<td><div className="original-market-cost">{renderData.origMarketCost}</div></td>
				<td><div className="price-off-rate">{renderData.priceOffRate}</div></td>
				<td><div className="retail-cost">{renderData.retailCost}</div></td>
				<td><div className="sold-out-act-cost">{renderData.soldOutActCost}</div></td>
				<td><div className="invoice-num">{renderData.invoice}</div></td>
				<td><div className="tf-po-num">{renderData.tfPO}</div></td>
				<td><div className="sold-out">{renderData.soldOut}</div></td>
				<td><div className="remain">{renderData.remain}</div></td>
			</tr></table>
			</div>
		)
	}
});

function renderDOM(data) {
	console.log(data);
	ReactDOM.render(
		<NewInventoryList data={data} />,
		document.getElementById('inventory_container')
	);
}
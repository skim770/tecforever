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
		return (
			<div className="new_inventory_item">
			<table><tr>
				<td><div className="shipment">{data["Shipment"]}</div></td>
				<td><div className="packing-slips-seq">{data["LG/CYN    Packing Slips Seq."]}</div></td>
				<td><div className="lg-wh">{data["LG  WH"]}</div></td>
				<td><div className="inventory-type">{data["Inventory Type"]}</div></td>
				<td><div className="model-num">{data["MODEL#"]}</div></td>
				<td><div className="model-desc">{data["Model's Description"]}</div></td>
				<td><div className="cyn-serial">{data["Cynergy SERIAL#"]}</div></td>
				<td><div className="cyn-cosmetic-grade">{data["Cynergy  Cosmetic Grade"]}</div></td>
				<td><div className="cyn-func-test-failed">{data["Cynergy  Function  Test Failed"]}</div></td>
				<td><div className="recd-qty">{data["Rec'd Q'ty"]}</div></td>
				<td><div className="no-recd-qty">{data["No Rec'd Q'ty"]}</div></td>
				<td><div className="ship-truck-load-num">{data["SHIP Truck  Load#  (Sold)"]}</div></td>
				<td><div className="hold-not-sold">{data["HOLD                   (Not Sold)"]}</div></td>
				<td><div className="offer">{data["Offer(Rafael)"]}</div></td>
				<td><div className="delivery-storage">{data["Delivery                    / Storage"]}</div></td>
				<td><div className="warranty">{data["Warranty"]}</div></td>
				<td><div className="cyn-cost">{data["CYN COST $                         (D.H. + Freight)"]}</div></td>
				<td><div className="vip-cost">{data["VIP $(Rev.7/1)     (employees)"]}</div></td>
				<td><div className="wholesale-cost">{data["Wholesale $          (Rev. 7/26)"]}</div></td>
				<td><div className="original-market-cost">{data["Original     Market  $"]}</div></td>
				<td><div className="price-off-rate">{data["Price Off rate  (%)"]}</div></td>
				<td><div className="retail-cost">{data["Retail $                       (Rev. 7/26)"]}</div></td>
				<td><div className="sold-out-act-cost">{data["Sold out             Actual price"]}</div></td>
				<td><div className="invoice-num">{data["Invoice #"]}</div></td>
				<td><div className="tf-po-num">{data["Tecforever PO#"]}</div></td>
				<td><div className="sold-out">{data["Sold Out"]}</div></td>
				<td><div className="remain">{data["Remain"]}</div></td>
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
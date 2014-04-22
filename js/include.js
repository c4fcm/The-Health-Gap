var data;
var rows = new Object();
var tbody;
var total_columns = 6;
var max_mort=0; 
var max_media=0;
var max_research=0;

d3.json("js/disease.JSON", function(json) {
	data = json;
	
	var diseases = json.diseases;
	var headers = new Array();
	var k=0;
	var years = new Array();
	console.log('testing');
	console.log(Number(diseases[1].disease_data[0]['Mortality']));
	console.log('testing,end');
	
	for(var i=0;i<diseases.length;i=i+2)
	{
		rows[diseases[i].name] = new Object();
		for(var j=0;j<diseases[i+1].disease_data.length;j++)
		{
			year = Number(diseases[i+1].disease_data[j].year);
			if(years.indexOf(year) < 0)
			{
				years[years.length] = year;
			}
			
			// row for each criterion
			rows[diseases[i].name][year] = new Object();
			var mm=0;
			for(var h in diseases[i+1].disease_data[j])
			{
				
				if(mm == 0) {}
				else
				{
					numNum = Number(diseases[i+1].disease_data[j][h]);
					rows[diseases[i].name][year][h] = numNum;
					if (h == "Mortality" &&  numNum > max_mort) {max_mort=numNum;}
					if (h == "Media Attention (NY Times, Media Cloud)" &&  numNum > max_media) {max_media=numNum;}
					if (h == "Research Funding (millions)" &&  numNum > max_research) {max_research=numNum;}
				}
				mm++;
			}
		}
		headers[k] = diseases[i].name;
		k++;
	}
	
	var bigheader = [years];
// this is where you have change num
	for(var i=0;i<total_columns;i=i+2)
	{
		bigheader[bigheader.length] = headers;
	}

	//making a table using d3 library
	table = d3.select("#container").append("table").attr({'border': '0','align':'center'});
        thead = table.append("thead"),
        tbody = table.append("tbody");
		
	var qq=-1;
	thead.append("tr")
        .selectAll("th")
        .data(bigheader)
        .enter()
        .append("th").attr({'align': 'center'})
            .html(function(column) {
				var drop = createDrpDownMenu(column, qq);
				if(qq == -1)
				{
					drop += ' <font size=\"1\" color=\"#CCCCCC\">Show Values:</font> <input type="checkbox" id="showValue" onclick ="onMenuChange()"  />';
				}
				qq++;
				return drop;
			 });
	
		var diseases = json.diseases;
		
		// menuChanges function is called each time when any of the select box gets changed. 
		onMenuChange();
});

// makerow created the ros object for each preF_indicator present and return the set of rows  
function makeRows(selects)
{
	var colors = ['red', 'gold', 'GreenYellow', 'orange', 'cyan'];
	var row = new Array();
	var year = selects[0];
	var mainobj = new Array();
	for(var i=1;i<selects.length;i++)
	{
		var valueObj = rows[selects[i]];
		var val = valueObj[year];
		if(typeof val == 'undefined')
		{val = {};}
		mainobj[mainobj.length] = val;
	}
	
	var columns = new Array();
	var oj = new Array();var j=0;
	
	var obj = new Object();var m=0;
	first:
	while(j < mainobj.length)
	{
		for(var k in mainobj[j])
		{
			if(typeof obj[k] == 'undefined')
			{
				obj[k] = new Array();
			}
			obj[k][obj[k].length] = mainobj[j][k];
		}
		j++;
	}
	var q=0;
	for( var f in obj)
	{
		var newobj = new Object();var x=1;
		newobj[0] = f;
		columns[0] = 0;
		for(var a=0;a<obj[f].length;a++)
		{
			newobj[x] = obj[f][a];
			columns[x] = x;
			x++;
		}
		newobj['color'] = colors[q];
		q++;
		oj[oj.length] = newobj;
	}
	return {'row': oj, 'col': columns};
}

// appendValues function fetches the row object created by makeRows function and creates the cells with their respective circle radius
function appendValues(tbody, trow)
{	
	w = trow.row;
	console.log(w);
	var columns = trow.col;
	
	//removing all rows first from the table  
	tbody.selectAll("tr").remove();
	
	// maing the rows again to show just the fresh data
	var rows1 = tbody.selectAll("tr")
			.data(w)
			.enter()
			.append("tr").attr({'align':'center'});
			
			var checked = document.getElementById('showValue').checked;
		//	alert(checked);
			var cells = rows1.selectAll("td")
				.data(function(row) {//console.log(row);
					return columns.map(function(column) {
						return {column: column, value: row[column], color: row['color'], showValue : checked};
					});	
				})
				.enter()
				.append("td").style({'padding':'10px'}).attr({'align':'center'})
					.html(function(d) { 
						var circle = drawCircle(d);
						return circle;
					 });
}

// onMenuChange function is being called each time any selectbox gets changed and refresh each rows again
function onMenuChange() {
	var selects = document.getElementsByClassName('selection_box');
	var values = [];
	for(var t=0;t<selects.length;t++)
	{
		values[values.length] = selects[t].value
	}
	var row = makeRows(values);
	appendValues(tbody, row);
}

function optChanged(x) {
	total_columns = x;
	onMenuChange();
}


// this function creates the circle in a cell
function drawCircle(data_d)
{
	if(data_d.column != '0')
	{
		if(typeof data_d.value == 'undefined')
		{
			data_d.value = 0;
		}
		if (data_d.color =='red') {
			    var svg = '<svg width="'+300+'" height="'+300+'">'
				svg += '<circle cx="'+150+'" cy="'+150+'" r="'+Math.ceil(100*data_d.value/max_mort)+'" fill="'+data_d.color+'"  stroke="gray" stroke-width="5" />';
				if(data_d.showValue)  {svg +=  '<h4>'+ addCommas(data_d.value) +'<h4>';}
		}
		else if (data_d.color =='gold') {
				var svg = '<svg width="'+300+'" height="'+300+'">'
				svg += '<circle cx="'+150+'" cy="'+150+'" r="'+Math.ceil(100*data_d.value/max_media)+'" fill="'+data_d.color+'"  stroke="gray" stroke-width="5" />';
				if(data_d.showValue)  {svg +=  '<h4>'+ addCommas(data_d.value) +'<h4>';}
		}
		else if (data_d.color =='GreenYellow') {
				var svg = '<svg width="'+300+'" height="'+300+'">'
				svg += '<circle cx="'+150+'" cy="'+150+'" r="'+Math.ceil(100*data_d.value/max_research)+'" fill="'+data_d.color+'" stroke="gray" stroke-width="5" />';
				if(data_d.showValue)  {svg +=  '<h4>$'+ addCommas(data_d.value) +'<h4>';}
			
		}
		else if (data_d.color =='orange') {
				var svg = '<svg width="'+300+'" height="'+300+'">'
				svg += '<circle cx="'+150+'" cy="'+150+'" r="'+Math.ceil(data_d.value)+'" fill="'+data_d.color+'" stroke="gray" stroke-width="5" />';
				svg +=  '<h4>'+ addCommas(data_d.value) +'/100<h4>';
			
		}
		else if (data_d.color =='cyan') {
				var svg = '<svg width="'+300+'" height="'+300+'">'
				svg += '<circle cx="'+150+'" cy="'+150+'" r="'+Math.ceil(data_d.value)+'" fill="'+data_d.color+'" stroke="gray" stroke-width="5" />';
				svg +=  '<h4>'+ addCommas(data_d.value) +'/100<h4>';
			
		}
		else {console.log("ERROR");} 
		svg += '</svg>';
		console.log(svg);
		return svg;
	}
	else
	{
		return data_d.value;
	}
}

// createDrpDownMenu creates the select boxes from the bigheader array which we creatd above
function createDrpDownMenu(column, qq)
{
	var drop = '<select class="selection_box" onChange="onMenuChange(this)">';
	//var drop_num_col = '<select class="select_num_col" onChange="optChanged(this.value)">';
	//var min_drop_allowed = 2;
	//	for(var u=4;u>=min_drop_allowed;u--)
	//{
		//var selected = null;
		//if(u == qq)
		//{selected = "selected"}
		//drop_num_col += '<option value = '+ u +'>'+ u + '</option>';
	//}
	//drop_num_col += '</select>';
	for(var u=0;u<column.length;u++)
	{
		var selected = null;
		if(u == qq)
		{selected = "selected"}
		drop += '<option value ="'+column[u]+'" '+selected+'>'+column[u]+'</option>';
	}
	drop += '</select>';
	//drop += drop_num_col;
	return drop;
}


/*function to add commas to the numbers*/
function addCommas(str) {
    var parts = (str + "").split("."),
        main = parts[0],
        len = main.length,
        output = "",
        i = len - 1;

    while(i >= 0) {
        output = main.charAt(i) + output;
        if ((len - i) % 3 === 0 && i > 0) {
            output = "," + output;
        }
        --i;
    }
    // put decimal part back
    if (parts.length > 1) {
        output += "." + parts[1];
    }
    return output;
		
}


/*
To create percentage chart
*/
function percentage_chart()
{
var chart = d3.select("#chart").append("svg") // creating the svg object inside the container div
    .attr("class", "chart")
    .attr("width", 200) // bar has a fixed width
    .attr("height", 20 * chartdata.length);
  
  var x = d3.scale.linear() // takes the fixed width and creates the percentage from the data values
    .domain([0, d3.max(chartdata)])
    .range([0, 200]); 
  
  chart.selectAll("rect") // this is what actually creates the bars
    .chartdata(chartdata)
  .enter().append("rect")
    .attr("width", x)
    .attr("height", 20)
    .attr("rx", 5) // rounded corners
    .attr("ry", 5);
    
  chart.selectAll("text") // adding the text labels to the bar
    .chartdata(chartdata)
  .enter().append("text")
    .attr("x", x)
    .attr("y", 10) // y position of the text inside bar
    .attr("dx", -3) // padding-right
    .attr("dy", ".35em") // vertical-align: middle
    .attr("text-anchor", "end") // text-align: right
    .text(String);
}

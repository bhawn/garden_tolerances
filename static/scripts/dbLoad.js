    let container = `
        <div class='container mx-auto my-auto'>
            <div class="container">
                <div class='rr' style='position:sticky!important;top: 0px;z-index: 100;background-color: white;padding-top: 10;'>
                    <h5 class='cc mb-0 pb-2' style='max-width:10%;flex:10%;'>Cold Hardy Info</h5>
                    <span class="ml-auto" style='max-width:90%;flex:90%;padding-right: 8px;'>
                        <input id='search' type="search" class="form-control rounded-0 border" style='outline:none;font-size: 13px;line-height: 18px;' placeholder=" Search ...">
                    </span>
                </div>
                <div class="rr pl-3 small">
                    A list of cold tolerances reported by various, (mainly Texas), gardening societys. Some duplicates.     
                </div>
                <div id="container" class="rr">
                    <div id="c1" class="cc"></div>
                    <div id="c2" class="cc"></div>
                    <div id="c3" class="cc"></div>
                    <div id="c4" class="cc"></div>
                </div>
            </div>
        </div>
    `;
    

    let entry = `
            <div class="card w-100 border-0 position-relative" style="overflow:hidden;background-color:black;margin-top: 16px;">
                <div id="id_{{id}}" class="carousel slide" data-ride="carousel" data-interval="false" data-pause="hover">
                    <div class="carousel-inner h-100">
                        <div class="carousel-item active" style=''>
                            <img src="{{img}}" class="w-100 " alt="..." style="" loading="lazy" style='max-height:500px'>
                        </div>
                    </div>
                </div>
                <a class="carousel-control-prev carousel-control" href="#id_{{id}}" role="button" data-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="sr-only">Previous</span>
                  </a>
                  <a class="carousel-control-next carousel-control" href="#id_{{id}}" role="button" data-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="sr-only">Next</span>
                  </a>
                <div class="card-body position-absolute" style="color:white;bottom:0;text-shadow:1px 1px hsla(0,0%,6.7%,.2), -1px 1px hsla(0,0%,6.7%,.2), -1px -1px hsla(0,0%,6.7%,.2), 1px -1px hsla(0,0%,6.7%,.2);">
                    <h5 class="">{{title}}</h5>
                    <span class="badge badge-primary">{{min_temp}}</span>
                </div>
                
            </div>
    `;


    let i = 0;
    function makeEntry(data) {                                                 
        var entryStuff = entryInfo(data);
        var entryJq = $(entryStuff);
        if(data['Common Name'].length)
            entryJq.find('.card-body').append(`
                <span class="badge badge-primary d-none">${data['Common Name']}</span>
            `);
        
        $("#container #c"+(i%4+1)).append(entryJq);
        ++i
        
        const pic_name = data.Species.replace("*","").toLowerCase() + "_" + data["Species/Cultivar (*Texas Native)"].replaceAll(/ &\ cultivars|\*/g,"").replace("'","").replaceAll(/\u201c|\u2018|\u201d|\u2019/g,"").replaceAll(/“|”/g,"").replaceAll(" ","\ ").toLowerCase();
        const num_imgs = img_count[pic_name];
        const img_loc = '/static/images/Plants/' + pic_name;
        let $id = $("#id_"+data.ID);
        const $ci = $id.find('.carousel-inner');
        if(!num_imgs)
            $id.find('img')[0].height = '18rem';
        for(let i = 2; i <= num_imgs; ++i) {
            $ci.append(`
                <div class="carousel-item">
                    <img src="${img_loc+'_'+i}.jpg" class="w-100" alt="..." loading="lazy">
                </div>
            `);
        }
        if(num_imgs < 2) {
            $id.parent().find('.carousel-control').remove();
        }
    }
    $("body").on('click',".carousel-control",(e)=>{
        let imgs = $(e.target).parents('.card').find('img');
        let active = imgs.parent().filter('.active').find('img');
        const h = active[0].height;
        imgs.each((i)=>{
            if(!i) return;
            imgs[i].style.height = h;
        });
    })
    
    
    let img_count = {};
    function entryInfo(data) {
        const pic_loc = '/static/images/Plants/'+data.Species.replace("*","").replaceAll(" ", "\ ").toLowerCase() + "_" + data["Species/Cultivar (*Texas Native)"].replaceAll(/ &\ cultivars|\*/g,"").replace("'","").replaceAll(/\u201c|\u2018|\u201d|\u2019/g,"").replaceAll(/“|”/g,"").replaceAll(" ","\ ").toLowerCase();
        // if F null go to zone
        let temp = data[String.fromCharCode(176)+'F'];
        if(!temp) temp = data.Zone;
        else temp += " &#176F";
        return (entry
            .replace(/{{img}}/g, pic_loc+'_1.jpg')
            .replace(/{{min_temp}}/g, temp)
            .replace(/{{title}}/g, data.Species + " " + data["Species/Cultivar (*Texas Native)"])
            .replaceAll(/{{id}}/g, data.ID));
            
            // .replace(/{{img}}/g, '/stock.jpg')
            // .replace(/{{type}}/g, data.type"]);
            // .replace(/{{sun}}/g, data.light)
            // .replace(/{{title}}/g, data.title)
            // .replace(/{{date}}/g, data.date));
    }
    
    function parseEntries(data) {
        data = csvJSON(data);
        data.forEach(entry=>makeEntry(entry));
        $('.carousel').carousel({
          ride:false
        })
    }
    
    function getEntries() {
        $.ajax({
            url: '/static/ColdTolerance.csv',
            type: 'GET',
            success: parseEntries,
            error: function(data) {
                if(data.status == 400)
                    alert(data.responseText);
                else
                    alert("error");
            }
        });
    }
    
    function prependContainer() {
        $("body").prepend($(container));
    }
    
    function csvJSON(csv) {
        var lines = csv.split("\n");
        var result = [];
        var headers=lines[0].split(",");
        for(var i=1;i<lines.length;i++){
            var obj = {};
            var currentline=lines[i].replace(/"([^"]*),([^"]*)"/g, '"$1/$2"').split(",");
            for(var j=0;j<headers.length;j++){
                obj[headers[j]] = currentline[j];
            }
            result.push(obj);
        }
        return result;
    }
    
    // now need to map image names to entries.
    function getImageEntries() {
        const dir = '/static/images/Plants/';
        $.ajax({
            url: dir,
            type: 'GET',
            success: function(data) { 
                // console.log(data)
                $(data).find("a").attr("href", function (i, val) {
                    val = val.replaceAll('*','').replaceAll(/ &\ cultivars|\*/g,"").replace("'","").replaceAll(/\u201c|\u2018|\u201d|\u2019/g,"").replaceAll(/“|”/g,"").replaceAll(" ","\ ").replaceAll('%20', "\ ").replaceAll('%5B','[').replaceAll('%5D',']').replaceAll('%28','(').replaceAll('%29',')').toLowerCase();
                    if(val.match(/\.(jpe?g|png|gif|webp)$/)) {
                        let index = val.lastIndexOf('_');
                        let plant = val.slice(0, index);
                        if(img_count[plant] == undefined) img_count[plant] = 1;
                        else img_count[plant] += 1;
                    }
                });
                getEntries();
            },
            error: function(data) {
                if(data.status == 400)
                    alert(data.responseText);
                else
                    alert("error");
            }
        });
    }
    
    $(function() {
        const format = function(value) {
			return value.replace(/[^\-.0-9]/g, "");
        }
        const _greater = function (a, b, c) {
            return a > b;
        }
        const _lesser = function (a, b, c) {
            return c !== "" && a < b;
        }
        const _equal = function (a, b, c) {
            return c !== "" && a == b;
        }
        const numberFilter3 = function(filterValue, objvalue, orig_string) {
	    	if(typeof filterValue !== 'string')
	    		return true;
	    	let config = {};
	        var equality = filterValue.indexOf("=") != -1;
	        var intvalue = format(filterValue);
	        if (intvalue === "") return "";
	        var compare;
	
	        if (filterValue.indexOf(">") != -1) {
	          compare = _greater;
	        } else if (filterValue.indexOf("<") != -1) {
	          compare = _lesser;
	        }
	
	        if (compare && equality) {
	          config.compare = function (a, b, c) {
	            return _equal(a, b, c) || compare(a, b, c);
	          };
	        } else if(!equality && !compare) {
	        	return String(objvalue).includes(String(filterValue));
	        } else {
	          config.compare = compare || _equal;
	        }
	        
	        return config.compare(Number(objvalue),Number(intvalue),orig_string) // orig string to see if string is empty, might not matter as bigint converts to 0 & i dont think it will ever be 0
    	};
        
        $('#search').on( "keyup", function() {
            // Declare variables
            var filter,  li, a, i, txtValue, num;
            filter = $('#search').val().toUpperCase();
            li = $("#container").find(".card");
            
            // Loop through all list items, and hide those who don't match the search query
            for (i = 0; i < li.length; i++) {
                a = li[i];
                txtValue = a.textContent || a.innerText;
                num = txtValue.replace(/[^0-9]/g, "");
                if (txtValue.toUpperCase().indexOf(filter) > -1 || num.length && numberFilter3(filter, num, num)) {
                    li[i].style.display = "";
                } else {
                    li[i].style.display = "none";
                }
            }
        });
        
    })
    
    function start() {
        prependContainer();
        getImageEntries();
    }
    start();
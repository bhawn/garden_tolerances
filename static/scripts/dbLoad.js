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
                    A list of cold tolerances reported by various, (mainly Texas), gardening societys. Some duplicates. Does not account for a cold/dry wet.     
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
        if(entryStuff === -1) return;
        var entryJq = $(entryStuff);
        if(data['Common Name'].length)
            entryJq.find('.card-body').append(`
                <span class="badge badge-primary d-none">${data['Common Name']}</span>
            `);
        
        $("#container #c"+(i%4+1)).append(entryJq);
        ++i
        
        const pic_name = data.Species.replace("*","").toLowerCase() + "_" + data["Species/Cultivar (*Texas Native)"].replaceAll(/ &\ cultivars|\*/g,"").replace("'","").replaceAll(/\u201c|\u2018|\u201d|\u2019/g,"").replaceAll(/“|”/g,"").replaceAll(" ","\ ").toLowerCase();
        const num_imgs = img_count[pic_name];
        const img_loc = './static/images/Plants/' + pic_name;
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
    let plants = {};
    function entryInfo(data) {
        const pic_loc = './static/images/Plants/'+data.Species.replace("*","").replaceAll(" ", "\ ").toLowerCase() + "_" + data["Species/Cultivar (*Texas Native)"].replaceAll(/ &\ cultivars|\*/g,"").replace("'","").replaceAll(/\u201c|\u2018|\u201d|\u2019/g,"").replaceAll(/“|”/g,"").replaceAll(" ","\ ").toLowerCase();
        
        let cd = data;
        cd.temp = data[String.fromCharCode(176)+'F'];
        if(plants[pic_loc] === undefined) {
            plants[pic_loc] = [0, cd];
        } else {
            plants[pic_loc].push(cd);
            // let j = 0;
            for(let i = 1; i < plants[pic_loc].length-1; ++i) {
                let p1 = cd, p2 = plants[pic_loc][i];
                if(p1.temp != p2.temp) {
                    if(false && p1.temp.length != 0 && p2.temp.length != 0) {
                        cd.temp = p1.temp + ' &#176F' + ",  " + p2.temp;
                    } else if(false && p1.temp.length == 0 && p2.temp.length == 0) {
                        if(p1.Zone === p2.Zone) return -1;
                        cd.Zone = p1.Zone + ', ' + p2.Zone;
                    }
                }
                else {
                    // ++j;
                    // if(plants[pic_loc].length-1 <= j) {
                        return -1;
                    // }
                    // continue;
                }
            }
            plants[pic_loc][0] = cd;
        }
        data = cd;
        
        // if F null go to zone
        let temp = data.temp;
        // let temp = data[String.fromCharCode(176)+'F'];
        if(!temp) temp = "Zone " + data.Zone;
        else temp += " &#176F";
        return (entry
            .replace(/{{img}}/g, pic_loc+'_1.jpg')
            .replace(/{{min_temp}}/g, temp)
            .replace(/{{title}}/g, data.Species + " " + data["Species/Cultivar (*Texas Native)"])
            .replaceAll(/{{id}}/g, data.ID));
            
            // .replace(/{{img}}/g, '/stock.jpg')
            // .replace(/{{type}}/g, data.type"]);
            // .replace(/{{sun}}/g, data.light)
    }
    
    function sortAlphaNum(a, b) {
        const reA = /[^a-zA-Z]/g;
        const reN = /[^0-9]/g;
        const aA = a.replace(reA, "");
        const bA = b.replace(reA, "");
        if (aA === bA) {
            const aN = Number(a.replace(reN, ""));
            const bN = Number(b.replace(reN, ""));
            return aN === bN ? 0 : aN > bN ? 1 : -1;
        } else {
            return aA > bA ? 1 : -1;
        }
    }
    
    function parseEntries(data) {
        // data = data.
        // console.log(data.replaceAll(/\".*\"\n",/g,"\n"))
        data = csvJSON(data);
        data = data.sort(function(a,b){
            const av = a.Species.toLowerCase(), bv = b.Species.toLowerCase();
            const v = sortAlphaNum(av, bv);
            if(v === 0) {
                return sortAlphaNum(a["Species/Cultivar (*Texas Native)"].toLowerCase(), b["Species/Cultivar (*Texas Native)"].toLowerCase());
            }
            return v;
        })
        data.forEach(entry=>makeEntry(entry));
        $('.carousel').carousel({
            ride:false
        })
    }
    
    function getEntries() {
        $.ajax({
            // url: 'https://docs.google.com/spreadsheets/d/10jv_2i_rhFQ5Qz_dw5SYu7iRCJtYZ0FNcJM7fFfquKQ/export?format=csv&gid=0',
            // url: 'https://docs.google.com/spreadsheets/d/10jv_2i_rhFQ5Qz_dw5SYu7iRCJtYZ0FNcJM7fFfquKQ/gviz/tq?tqx=out:csv&sheet=Sheet1',
            url: './static/ColdTolerance.csv',
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
        // if not mobile, replace container with container12
        let cntr = $(container);
        if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            cntr.removeClass('container');
            cntr.find('.container').removeClass('container').addClass('mx-5');
        }
        $("body").prepend(cntr);
    }
    
    function csvJSON(csv) {
        csv = csv.replaceAll("\r","");
        var lines = csv.split("\n");
        var result = [];
        // lines[0] = lines[0].replaceAll("\"","");
        var headers=lines[0].replaceAll("\"","").split(",");
        for(var i=1;i<lines.length;i++){
            var obj = {};
            // lines[i] = lines[i].replaceAll(/"([^,]*)",/g,"$1,")
            // lines[i] = lines[i].replaceAll(/"(.*)"$/g,"$1")
            var currentline=lines[i].replaceAll(/"([^"]*),([^"]*)"/g, '"$1/$2"').split(",");
            for(var j=0;j<headers.length;j++){
                obj[headers[j]] = currentline[j];
            }
            result.push(obj);
        }
        return result;
    }
    
    // now need to map image names to entries.
    function getImageEntries() {
        const dir = 'https://api.github.com/repos/bhawn/garden_tolerances/contents/static/images/Plants';
        // const dir = './static/images/Plants/';
        $.ajax({
            url: dir,
            type: 'GET',
            success: function(data) { 
                data.forEach((elem)=>{
                    let val = elem.name;
                    val = val.replaceAll('*','').replaceAll(/ &\ cultivars|\*/g,"").replace("'","").replaceAll(/\u201c|\u2018|\u201d|\u2019/g,"").replaceAll(/“|”/g,"").replaceAll(" ","\ ").replaceAll('%20', "\ ").replaceAll('%5B','[').replaceAll('%5D',']').replaceAll('%28','(').replaceAll('%29',')').toLowerCase();
                    if(val.match(/\.(jpe?g|png|gif|webp)$/)) {
                        let index = val.lastIndexOf('_');
                        let plant = val.slice(0, index);
                        if(img_count[plant] == undefined) img_count[plant] = 1;
                        else img_count[plant] += 1;
                    }
                });
                // $(data).find("a").attr("href", function (i, val) {
                //     val = val.replaceAll('*','').replaceAll(/ &\ cultivars|\*/g,"").replace("'","").replaceAll(/\u201c|\u2018|\u201d|\u2019/g,"").replaceAll(/“|”/g,"").replaceAll(" ","\ ").replaceAll('%20', "\ ").replaceAll('%5B','[').replaceAll('%5D',']').replaceAll('%28','(').replaceAll('%29',')').toLowerCase();
                //     if(val.match(/\.(jpe?g|png|gif|webp)$/)) {
                //         let index = val.lastIndexOf('_');
                //         let plant = val.slice(0, index);
                //         if(img_count[plant] == undefined) img_count[plant] = 1;
                //         else img_count[plant] += 1;
                //     }
                // });
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
    	

        if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            $('body').on('touchend click', '.card', (e)=>{
                let ct = $(e.currentTarget);
                let imgs = ct.find('img');
                let active = imgs.parent().filter('.active').find('img');
                const h = active[0].height;
                imgs.each((i)=>{
                    if(!i) return;
                    imgs[i].style.height = h;
                });
                let cr = ct.find('.carousel');
                cr.carousel('next');
            });
        }
        
        $('#search').on( "keyup", function() {
            // Declare variables
            var filter,  li, a, i, txtValue, num;
            filter = $('#search').val().toUpperCase();
            li = $("#container").find(".card");
            
            // Loop through all list items, and hide those who don't match the search query
            for (i = 0; i < li.length; i++) {
                a = li[i];
                txtValue = (a.textContent || a.innerText).toUpperCase();
                num = txtValue.replace(/[^0-9]/g, "");
                let filt2 = filter.split(/\s/);
                let fil3 = false;
                filt2.forEach((obj)=>{
                    if(obj.length) {
                        fil3 = (txtValue.indexOf(obj) > -1);
                    }
                })
                if (txtValue.indexOf(filter) > -1 || num.length && numberFilter3(filter, num, num) || fil3) {
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
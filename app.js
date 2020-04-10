const SPHERE = {
	container : document.getElementById('sphere'),
	list : false,
	data : null,
	links: 15,
	dots : 15,
	settings : {
		height : 500,
		width  : 530,
		radius : 150,
		speed  : 1,
		slower : 0.9,
		timer  : 5,
		fontMultiplier : 15,
		hoverStyle : {
			border : '1px solid #935C26',
			color  : '#935C26'
		},
		mouseOutStyle : {
			border : 'none',
			color  : 'red'
		}
	},
	options  : {},
	curState : {
		mouseOver : null,
		lastFy : null,
		lastFx : null,
		sy : null,
		cy : null,
		sx : null,
		cx : null,
		mouseX : null,
		mouseY : null
	},
	tags: null,
	mathAssets : {
		halfHeight : null,
		halfWidth : null,
		hwratio : null,
		dtr : null,
		diameter : null,
		speedX : null,
		speedY : null,
		tLength : null
	},
	initialize: function(){
	    var xhr = new XMLHttpRequest();
	    xhr.open("GET",'src/data.json', true);
	    xhr.setRequestHeader("Content-Type", "application/json");
	    xhr.onreadystatechange = function(){
	        if (xhr.readyState === 4 && xhr.status === 200){
	            SPHERE.data = JSON.parse(xhr.responseText);
	            if(SPHERE.data.items.length > 0){
		            SPHERE.list = document.createElement('ul');
		            var countDots = 0;
		            var countLinks = 0;
		            for(let i = 0; i < SPHERE.data.items.length; i++){
		            	var obj = SPHERE.data.items[i];
		            	if(obj.filled){
		            		countLinks++;
			            	if(countLinks <= SPHERE.links){ SPHERE.list.innerHTML += '<li><a href="'+ obj.link +'">'+ obj.title +'</a></li>'; }
		            	}
		            	else{
		            		countDots++;
		            		if(countDots <= SPHERE.dots){ SPHERE.list.innerHTML += '<li><span class="dot-white"></span></li>'; }
		            	}
		            }
		            SPHERE.load();
	            }
	        }
	    };
	    xhr.send();
	},
	load: function(opt){
		if(SPHERE.list){
			SPHERE.container.append(SPHERE.list);
			SPHERE.options = Object.assign(SPHERE.settings, opt);
			SPHERE.initContainer();
			SPHERE.initTags();
			SPHERE.initMaths();
			SPHERE.deployTags();
			setInterval(SPHERE.updateTags, SPHERE.options.timer);
			SPHERE.curState.mouseOver = true;
		}
	},
	initMaths: function(){
		this.mathAssets.halfHeight = this.options.height / 2;
		this.mathAssets.halfWidth = this.options.width / 2;
		this.mathAssets.speedX = this.options.speed / this.mathAssets.halfWidth;
		this.mathAssets.speedY = this.options.speed / this.mathAssets.halfHeight;
		this.mathAssets.dtr = Math.PI / 180;
		this.mathAssets.diameter = this.options.radius * 2;
		this.mathAssets.hwratio = this.options.height / this.options.width;
		this.mathAssets.whratio = this.options.width / this.options.height;
		this.mathAssets.tLength = this.tags.length - 1;
		this.curState.mouseOver = false;
		this.curState.lastFx = this.options.speed;
		this.curState.lastFy = this.options.speed;
	},
	initContainer: function(){
		SPHERE.container.style.height = SPHERE.options.height + 'px';
		SPHERE.container.style.width = SPHERE.options.width + 'px';
		SPHERE.container.style.overflow = 'hidden';
		SPHERE.container.style.position = 'relative';

		SPHERE.container.addEventListener('mousemove', (event)=>{
			SPHERE.curState.mouseX = event.pageX - SPHERE.container.offsetLeft;
			SPHERE.curState.mouseY = event.pageY - SPHERE.container.offsetTop;
		});
		SPHERE.container.addEventListener('mouseover', ()=>{
			SPHERE.curState.mouseOver = false;
		});
		SPHERE.container.addEventListener('mouseout', ()=>{
			SPHERE.curState.mouseOver = true;
		});
	},
	initTags: function(){
		SPHERE.tags = SPHERE.container.children[0].children;
		for(let i = 0; i < SPHERE.tags.length; i++){
			var tag = SPHERE.tags[i];
			var link = SPHERE.tags[i].children[0];
			tag.style.display = 'block';
			tag.style.position = 'absolute';

			tag.addEventListener('mouseover', ()=>{
				this.style = SPHERE.options.hoverStyle;
			});			
			tag.addEventListener('mouseout', ()=>{
				this.style = SPHERE.options.mouseOutStyle;
			});
		}
	},
	deployTags: function(){
		var phi = 0;
		var theta = 0;
		var max = SPHERE.mathAssets.tLength + 1;
		var i = 0;
		while (i++ < max) {
			phi = Math.acos(-1 + (2 * i - 1) / max);
			theta = Math.sqrt(max * Math.PI) * phi;
			SPHERE.tags[i - 1].cx = SPHERE.options.radius * Math.cos(theta) * Math.sin(phi);
			SPHERE.tags[i - 1].cy = SPHERE.options.radius * Math.sin(theta) * Math.sin(phi);
			SPHERE.tags[i - 1].cz = SPHERE.options.radius * Math.cos(phi);
			SPHERE.tags[i - 1].h = SPHERE.tags[i - 1].offsetHeight / 4;
			SPHERE.tags[i - 1].w = SPHERE.tags[i - 1].offsetWidth / 4;
		}
	},
	calcRotation: function(fy, fx){
		SPHERE.curState.sy = Math.sin(fy * SPHERE.mathAssets.dtr);
		SPHERE.curState.cy = Math.cos(fy * SPHERE.mathAssets.dtr);
		SPHERE.curState.sx = Math.sin(fx * SPHERE.mathAssets.dtr);
		SPHERE.curState.cx = Math.cos(fx * SPHERE.mathAssets.dtr);
	},
	updateTags: function(){
		var fy;
		var fx;
		if(SPHERE.curState.mouseOver){
			fy = SPHERE.options.speed - SPHERE.mathAssets.speedY * SPHERE.curState.mouseY;
			fx = SPHERE.mathAssets.speedX * SPHERE.curState.mouseX - SPHERE.options.speed;
		}
		else{
			fy = SPHERE.curState.lastFy * SPHERE.options.slower;
			fx = SPHERE.curState.lastFx * SPHERE.options.slower;
		}
		if(SPHERE.curState.lastFy != fy || SPHERE.curState.lastFx != fx){
			SPHERE.calcRotation(fy, fx);
			SPHERE.curState.lastFy = fy;
			SPHERE.curState.lastFx = fx;
		}
		if(Math.abs(fy) > 0.01 || Math.abs(fx) > 0.01){
			let j = -1;
			while(j++ < SPHERE.mathAssets.tLength){
				rx1 = SPHERE.tags[j].cx;
				ry1 = SPHERE.tags[j].cy * SPHERE.curState.cy + SPHERE.tags[j].cz * -SPHERE.curState.sy;
				rz1 = SPHERE.tags[j].cy * SPHERE.curState.sy + SPHERE.tags[j].cz * SPHERE.curState.cy;
				SPHERE.tags[j].cx = rx1 * SPHERE.curState.cx + rz1 * SPHERE.curState.sx;
				SPHERE.tags[j].cy = SPHERE.tags[j].cy * SPHERE.curState.cy + SPHERE.tags[j].cz * -SPHERE.curState.sy;
				SPHERE.tags[j].cz = rx1 * -SPHERE.curState.sx + rz1 * SPHERE.curState.cx;
				var per = SPHERE.mathAssets.diameter / (SPHERE.mathAssets.diameter + SPHERE.tags[j].cz);
				SPHERE.tags[j].x = SPHERE.tags[j].cx * per;
				SPHERE.tags[j].y = SPHERE.tags[j].cy * per;
				SPHERE.tags[j].alpha = per / 2;
				SPHERE.tags[j].style.left = SPHERE.mathAssets.whratio * (SPHERE.tags[j].x - SPHERE.tags[j].w * per) + SPHERE.mathAssets.halfWidth + 'px';
				SPHERE.tags[j].style.top = SPHERE.mathAssets.hwratio * (SPHERE.tags[j].y - SPHERE.tags[j].h * per) + SPHERE.mathAssets.halfHeight + 'px';
				SPHERE.tags[j].style.opacity = SPHERE.tags[j].alpha;
				SPHERE.tags[j].style.fontSize = SPHERE.options.fontMultiplier * SPHERE.tags[j].alpha + 'px';
				SPHERE.tags[j].style.zIndex = Math.round(-SPHERE.tags[j].cz);
			}
		}
	}	
}
SPHERE.initialize();
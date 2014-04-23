var myCircle;
var circleCount = 0;
var myCircles = [];

var circleGroup;
var imageGroup;

var frame;

var myImgNames = [];
var rasterImages = [];

var counter = 0;
var imgToShow = -1;
var imgToRemove = -2;

var isPathComplete = false;
var startCounter = false;

var jsonData; 
var closestImageIndex = [];

var width = view.size.width;
var height = view.size.height;

var textItem = new PointText({
	// content: 'Draw a path by clicking the mouse.',
	point: new Point(0, 0),
	fillColor: 'white',
	fontSize: '20px'
});

function loadImages(){
//javascript image object
//onload
	// for (var i = 0; i<myImgNames.length; i++){
	// 	$('#body').append("<div class='visuallyHidden'" + 
	// 		"<img id='" + myImgNames[i] + "' src='/images/" + myImgNames[i] + "'/>" +
	// 		"</div>");
	// 	console.log("Appending images");
	// }
	// console.log("Images are on the page");
	
	for(var i = 0; i<myImgNames.length; i++){
		var imageSrc = '/images/' + myImgNames[i];
		var raster = new Raster (imageSrc);
		raster.visible = false;
		
		raster.onLoad = function () {
			this.position = view.center;

			//adjust image size
			var origW = this.width;
			var origH = this.height;
			var newW = 320;
			var newH = 240;
			var scaleW = newW/origW;
			var scaleH = newH/origH;
			
			this.scale(scaleW, scaleH);		
			// console.log("current width of photo: " + origW + " " + origH);
		 	// console.log("new width of photo: " + raster.size);
		 
			rasterImages.push(this);
			imageGroup.addChild(this);
		}
		console.log("rasterImages array = " + rasterImages.length);
	}
	startCounter = true;
}

function drawFrame(){
	frame = new Path.Rectangle({
		// point: [width/4 + 120, height/4],
		point: [0, 0],
		size: [320, 240],
		strokeColor: 'black',
		fillColor: 'black'
	});
	frame.position = view.center;

	//call groups here so that they draw on top of the frame
	circleGroup = new Group(); 
	imageGroup = new Group();
}
//prototype to store circle data
function Circle(circleNum, circlePos){
	this.num = circleNum;
	this.pos = circlePos;
}

function showImages(img, rem){
	
	console.log("in show images");
	rasterImages[img].visible = true;
	// console.log(rasterImages[img].visible);
	
	if (imgToRemove > -1){
	rasterImages[rem].visible = false;
	// console.log(rasterImages[rem].visible);
	}
}

function onFrame(event){
	if (startCounter === true){
		counter ++;
		if (counter%20 === 0){
				console.log("counter is at 100");
				imgToShow ++;
				imgToRemove ++;
				console.log("image to show = " + imgToShow);
				console.log("image to imgToRemove = " + imgToRemove);
				showImages(imgToShow, imgToRemove);
			}

		if (imgToShow===rasterImages.length-1) {
			imgToShow = -1;
			// console.log("if greater imgtoshow:" + imgToShow);
		}

		if (imgToRemove===rasterImages.length-1) {
			imgToRemove = -1;
			// console.log("if greater imgToRemove:" + imgToRemove);
		}
	}
}

function onMouseDown(event) {
	if (isPathComplete == false && frame.bounds.contains(event.point)){
		// console.log("intersects: " + frame.bounds.contains(event.point))
		
		//variable for each x,y of mouseclick and for count of total mouseclicks 
		var currPoint = event.point;
		var currPointTrans = new Point(event.point.x - (width/4 + 120), event.point.y - height/4);
		circleCount = circleCount + 1;
		console.log("circleCount = " + circleCount);
		console.log("currPoint = " + currPoint);
		console.log("currPointTrans = " + currPointTrans);

		//create circle at every click
		myCircle = new Path.Circle(currPoint, 5);
		myCircle.fillColor = 'red';

		//add each circle to the circleGroup
		circleGroup.addChild(myCircle);
		// console.log("circleGroup = " + circleGroup);	
					
		// store x,y and count into temp object, push to array of Circle prototype
		var tempObject = new Circle(circleCount, currPointTrans);
		myCircles.push(tempObject);
		// console.log(myCircles);
		}
	}

// take each circle, compare it to all images
function getDistance( point1, point2 ){
  var xs = 0;
  var ys = 0;
 
  xs = point2.x - point1.x;
  xs = xs * xs;
 
  ys = point2.y - point1.y;
  ys = ys * ys;
 
  return Math.sqrt( xs + ys );
}

function getImagesForPoints(){
	//for each point loop through images
	var minDist = 10000;
	var closestImage = 0;
	console.log("inside getImagesforPoints")
	for (var j = 0; j < myCircles.length; j++){
		for (var i = 0; i < jsonData.length; i++){
			var dist = getDistance(jsonData[i].corner, myCircles[j].pos);
			// console.log("myCircles objects: " + myCircles[j]);

			if (dist<minDist){
				minDist = dist;
				closestImage = i;
			}
			// console.log("closestImage = " + closestImage);
		}
		minDist = 10000;
		// closestImageIndex.push(closestImage);
		var myString = jsonData[closestImage].filename;
		// console.log(typeof myString);
		// console.log(myString);
		var goodString = myString.substring(1);
		console.log(goodString);
		myImgNames.push(goodString);		
	}
	loadImages();
}

$.getJSON('images.json', function(data) {
	// console.log(data[0]);
  	jsonData = data;
  	console.log(jsonData);
});

$(document).ready(function(){
	console.log("Loaded!");
	drawFrame();
	$('#update').click(function(){
		console.log("!");
		getImagesForPoints();

		//reset myCircles object data
		myCircles = [];
		circleCount = 0;
		// console.log("myCircles (should be zero): " + myCircles.length);
				
		//remove circles
		project.activeLayer.children[2].removeChildren();
		console.log(project.activeLayer.children[2].children);
		
		isPathComplete = true;
	});

	$('#clear').click(function(){
		rasterImages = [];
		project.activeLayer.children[3].removeChildren(); //remove images
		startCounter = false;
		counter = 0;
		imgToShow = -1;
		imgToRemove = -2;
		myImgNames = [];
		// console.log("myimg names after clear" + myImgNames);
		isPathComplete = false;		
	
	})
});
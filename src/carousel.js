/**
@todo
- same-height attr seems to break it (everything is 0 height)?
- vertical center prev/next arrows (either position absolute negative margin hack or flexbox?)
- add functionality / support options to bring it to parity with angular-ui carousel
	- timing/intervals, etc.
- remove jQuery dependency (about 5 uses left..)
- [maybe?] option to automatically make it one slide at a time with overflow hidden, display inline-block, etc. so they just pass in slides and it looks like ui-bootstrap carousel
	- UPDATE: this is the ONLY way it works now (at least the 1 slide at a time bit) - so may option to NOT do that and allow it to show multiple slides at a time.

NOTE: there's already a ui-bootstrap carousel which is similar; I wrote this one (rather than using / modifying the existing one) because:
- I'm adding in (hammer) swipe functionality options so need to move the template to the compile function to conditionally build the HTML
- I want it to work without twitter bootstrap (which the existing one didn't seem to)

Takes a parent element with a bunch of children and makes the children horizontally scrollable. The children can be any html; this will use the .wrap function to wrap the children and add previous & next clickable arrows as well as touch swipe support to scroll through content horizontally
NOTE: you are responsible for using "display:inline-block" or similar to get the content to display side to side rather than vertically as well as keeping them in one line (i.e. "white-space:nowrap;")

@dependencies
OPTIONAL
- font-awesome for the next & prev arrows (or you can replace it with whatever you want for the classes 'icon-chevron-left' and 'icon-chevron-right' or by passing in htmlPrev and/or htmlNext attributes of your own custom HTML)
- angular-hammer.js and hammer.js IF using hammer-swipe attribute (defaults to false so this isn't need by default and will work without it)
	- https://github.com/randallb/angular-hammer
	- http://eightmedia.github.io/hammer.js/

//TOC
0. setup
	0.5. init
	0.7. scope.$on(attrs.ids.resizeEvt,..
1. initMaxSlides function
2. updateAnimateInfo function
3. scope.$on('lmContentSliderReInit', ..
	// broadcast this to update if content changes
4. scope.nav function
5. scope.$watch('opts.curSlide',..


scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html)
	// @param {Number} interval The time, in milliseconds, that it will take the carousel to go to the next slide.
	// @param {Boolean} noTransition Whether to disable transitions on the carousel.
	// @param {Boolean} noPause Whether to disable pausing on the carousel (by default, the carousel interval pauses on hover)
	@param {Object} [opts]
		@param {Number|String} [curSlide =0] Either 0 indexed number of which slide to go to OR string of: 'first', 'last'

attrs
	@param {String} id Instance id
	@param {Number} [sameHeight =0] 1 (true) if want to make all elements the same height as the tallest one
	//@param {Number} [noCenter] 1 (true) to not start with the first one centered in the middle
	@param {Number} [centerOffset =0] Number of pixels to start from left (otherwise it will default to centering the first element)
	// @param {Number} [touchShowArrows =0] 1 (true) to show next/prev arrows even on touch
	@param {Number} [showArrows =1] 1 (true) to show next/prev arrows even on touch
	@param {String} [htmlPrev] HTML for "previous" (left) arrow (otherwise default styles will be used)
	@param {String} [htmlNext] HTML for "next" (right) arrow (otherwise default styles will be used)
	@param {Number|String} [navNumItems =0] Either int of number of slides to nav through on each click OR string of 'width' to calculate number of slides based on total width (will show all new items on nav)
	@param {Number} [alwaysShowNav =0] 1 if want to NEVER hide arrows (even if all content could fit so there's no need to scroll)	//@todo this is mostly to avoid an issue with centering where there's no nav even though some content is off the screen.. just fix this issue instead??
	@param {Number} [hammerSwipe =0] 1 to supprt hammer.js swiping to change slides
	@param {Number} [swipeOverlay =0] 1 to put a transparent div on top of all the slides for swiping (since swipe doesn't work on images). NOTE: this will make all your content un-clickable/actionable!!


@usage
$scope.opts.curSlide is $watch'ed so can change it to navigate through to a particular slide

//1. default / no extra options
partial / html:
<div jrg-carousel>
	<div ng-repeat='slide in slides' style='display:inline-block; text-align:center; vertical-align:top;'>		<!-- styles are optional and should be moved to a class / stylesheet; this centers things and makes them display side by side -->
		<!-- custom content here -->
		<img ng-src='{{slide.image}}' style='margin:auto; max-width:100%;'>		<!-- styles are optional and should be moved to a class / stylehseet; this makes the content/images dynamic full width. Remove max-width:100%; for them to keep their size and be centered. Make sure NOT to use 'width:100%;' as this will stretch tall, narrow images. -->
		<div>
			<h4>Slide {{$index}}</h4>
			<p>{{slide.text}}</p>
		</div>
		<!-- end: custom content here -->
	</div>
</div>

controller / js:
$scope.slides =[
	{
		image: 'http://placekitten.com/200/200',
		text: 'cat 1'
	},
	{
		image: 'http://placekitten.com/210/200',
		text: 'cat 2'
	},
	{
		image: 'http://placekitten.com/200/215',
		text: 'cat 3'
	}
];

// $scope.myInterval = 5000;
var slides = $scope.slides = [];
$scope.addSlide = function() {
	var newWidth = 200 + ((slides.length + (25 * slides.length)) % 150);
	slides.push({
		image: 'http://placekitten.com/' + newWidth + '/200',
		text: ['More','Extra','Lots of','Surplus'][slides.length % 4] + ' ' +
		['Cats', 'Kittys', 'Felines', 'Cutes'][slides.length % 4]
	});
};
for (var i=0; i<4; i++) {
	$scope.addSlide();
}



//2. (hammer) swipe
partial / html:
<div jrg-carousel hammer-swipe='1' swipe-overlay='1' opts='opts'>
	<div ng-repeat='slide in slides' style='display:inline-block; text-align:center; vertical-align:top;'>		<!-- styles are optional and should be moved to a class / stylesheet; this centers things and makes them display side by side -->
		<!-- custom content here -->
		<img ng-src='{{slide.image}}' style='margin:auto; max-width:100%;'>		<!-- styles are optional and should be moved to a class / stylehseet; this makes the content/images dynamic full width. Remove max-width:100%; for them to keep their size and be centered. Make sure NOT to use 'width:100%;' as this will stretch tall, narrow images. -->
		<div>
			<h4>Slide {{$index}}</h4>
			<p>{{slide.text}}</p>
		</div>
		<!-- end: custom content here -->
	</div>
</div>

controller / js:
$scope.opts ={
	curSlide: 0
};

// $scope.myInterval = 5000;
var slides = $scope.slides = [];
$scope.addSlide = function() {
	var newWidth = 200 + ((slides.length + (25 * slides.length)) % 150);
	slides.push({
		image: 'http://placekitten.com/' + newWidth + '/200',
		text: ['More','Extra','Lots of','Surplus'][slides.length % 4] + ' ' +
		['Cats', 'Kittys', 'Felines', 'Cutes'][slides.length % 4]
	});
};
for (var i=0; i<4; i++) {
	$scope.addSlide();
}

//end: EXAMPLE usage
*/

'use strict';

angular.module('jackrabbitsgroup.ang-carousel', []).directive('jrgCarousel', ['jrgCarouselResize', '$timeout', function (jrgCarouselResize, $timeout) {
  return {
		restrict: 'A',
		transclude: true,
		scope: {
			opts: '=?'		//make optional and avoid errors with '?'
		},

		compile: function(element, attrs) {
			var defaults ={'sameHeight':'0', 'centerOffset':'0', 'navNumItems':'1', 'alwaysShowNav':'0', 'showArrows':'1', 'hammerSwipe':'0', 'swipeOverlay':'0'};
			for(var xx in defaults) {
				if(attrs[xx] ===undefined) {
					attrs[xx] =defaults[xx];
				}
			}
			//convert to int
			var attrsToInt =['sameHeight', 'centerOffset', 'navNumItems', 'alwaysShowNav', 'showArrows', 'hammerSwipe', 'swipeOverlay'];
			for(var ii=0; ii<attrsToInt.length; ii++) {
				attrs[attrsToInt[ii]] =parseInt(attrs[attrsToInt[ii]], 10);
			}
			
			//set id
			if(attrs.id ===undefined) {
				attrs.id ="jrgCarousel"+Math.random().toString(36).substring(7);
			}
			var id1 =attrs.id;
			attrs.ids ={
				'resizeEvt':id1+"ResizeEvt",
				'content':id1+"Content"
			};
			
			var htmlPrev, htmlNext;
			if(attrs.htmlPrev) {
				htmlPrev =attrs.htmlPrev;
			}
			else {
				htmlPrev ="<div class='jrg-carousel-arrow'><div class='jrg-carousel-arrow-icon icon-chevron-left'></div></div>";
			}
			if(attrs.htmlNext) {
				htmlNext =attrs.htmlNext;
			}
			else {
				htmlNext ="<div class='jrg-carousel-arrow'><div class='jrg-carousel-arrow-icon icon-chevron-right'></div></div>";
			}
			
			var html="<div class='jrg-carousel-cont-outer'>"+		//MUST have outer div otherwise anything (i.e. the hammer swipe directive) will NOT be compiled since compilation does not happen on the element itself!!
				"<div class='jrg-carousel-cont' ";
				if(attrs.hammerSwipe) {
					html+="hm-swipeleft='nav(\"next\", {})' hm-swiperight='nav(\"prev\", {})' hm-options='{swipe_velocity: 0.2}' ";
				}
				html+=">";
				if(attrs.showArrows) {
					html+="<div ng-show='show.prev' class='jrg-carousel-prev' ng-click='nav(\"prev\", {})'><div class='jrg-carousel-arrow-outer'>"+htmlPrev+"</div></div>";
				}
				if(attrs.swipeOverlay) {
					html+="<div class='jrg-carousel-content-swipe'></div>";
				}
				html+="<div id='"+attrs.ids.content+"' class='jrg-carousel-content' style='width:{{styles.content.width}}px; margin-left:{{styles.content.marginLeft}}px;' ng-transclude></div>";
				if(attrs.showArrows) {
					html+="<div ng-show='show.next' class='jrg-carousel-next' ng-click='nav(\"next\", {})'><div class='jrg-carousel-arrow-outer'>"+htmlNext+"</div></div>";
				}
				html+="</div>";
			html+="</div>";
			
			element.replaceWith(html);
			
			return function(scope, element, attrs) {
				/**
				setup
				@toc 0.
				*/
				scope.show ={
					prev: true,
					next: true
				};
				scope.styles ={
					content: {
						width: 0,
						marginLeft: 0
					}
				};
				
				var defaultOpts ={
					curSlide: 0
				};
				if(scope.opts ===undefined) {
					scope.opts ={};
				}
				scope.opts =angular.extend(defaultOpts, scope.opts);
				
				var maxSlides;
				var page =0;		//if navNumItems is greater than 1, this will store the current page / set of slides we're on (otherwise page will be the same as curSlide
				var maxPages;		//this stores total pages (where pages are a collection of slides equal to navNumSlides - typically the amount of slides that are visible at the same time). If navNumItems is 1, this will be the same as maxSlides
				var animateInfo, navNumItems =attrs.navNumItems, alwaysShowNav =false;
				if(attrs.alwaysShowNav) {
					alwaysShowNav =true;
				}
				
				if(attrs.navNumItems !==undefined && attrs.navNumItems !='width') {
					navNumItems =attrs.navNumItems;
				}
				if(attrs.alwaysShowNav !==undefined) {
					alwaysShowNav =attrs.alwaysShowNav;
				}
				
				/**
				@toc 0.5.
				@method init
				*/
				function init(params) {
					initMaxSlides({'attempt':1});
					
					jrgCarouselResize.addCallback(attrs.ids.resizeEvt, {'evtName':attrs.ids.resizeEvt, 'args':[]}, {});
				}
				
				/**
				@toc 0.7.
				@method scope.$on(attrs.ids.resizeEvt,..
				*/
				scope.$on(attrs.ids.resizeEvt, function(evt, params) {
					// var delayReInit =1000;
					var delayReInit =500;
					//console.log('resize');
					updateAnimateInfo({reNav:true});
					//call again after timeout just in case content is changing and not done/resized yet..
					$timeout(function() {
						updateAnimateInfo({reNav:true});
					}, delayReInit);
				});
				
				/**
				Error checks curSlide to ensure it's valid
				@toc 0.8.
				@method checkCurSlide
				*/
				function checkCurSlide(params) {
					if(typeof(scope.opts.curSlide) =='number') {
						if(scope.opts.curSlide <0) {
							scope.opts.curSlide =0;
						}
						else if(scope.opts.curSlide >=maxSlides) {
							scope.opts.curSlide =(maxSlides-1);		//-1 since 0 indexed
						}
					}
					else if(typeof(scope.opts.curSlide) =='string') {
						var allowedStrings =['first', 'last', 'next', 'prev', 'all'];		//hardcoded must match what's used in nav
						if(allowedStrings.indexOf(scope.opts.curSlide) <0) {
							scope.opts.curSlide =0;
						}
					}
					else {			//invalid catch-all: set to 0
						// console.log('jrgCarousel invalid curSlide value: '+scope.opts.curSlide);
						scope.opts.curSlide =0;
					}
				}
				
				/**
				@toc 1.
				@method initMaxSlides
				@param params
					attempt =int of which attempt (sometimes have loading/timing issue; so set timeout and try again for an attempt or two to see if get some data..)
				*/
				function initMaxSlides(params) {
					var ele =document.getElementById(attrs.ids.content);
					//maxSlides =ele.children().length-1;		//-1 is because angular inserts an extra "comment" element that I can't seem to filter out with a "div" tag..
					maxSlides =angular.element(ele).children().length;
					// console.log("maxSlides: "+maxSlides);
					if(maxSlides <1 && params.attempt <3) {		//try again
						params.attempt++;
						//setTimeout(function() {
						$timeout(function() {
							initMaxSlides(params);
						}, 200);
					}
					else {
						updateAnimateInfo({});
					
						scope.nav(scope.opts.curSlide, {});		//init
					}
				}
				
				/**
				@toc 2.
				@method updateAnimateInfo
				@param {Object} [params]
					@param {Boolean} [reNav] True to re-call nav (i.e. for after resize to get back to the correct slide)
				*/
				function updateAnimateInfo(params) {
					var ii;
					var ele =document.getElementById(attrs.ids.content);
					animateInfo ={
						'totWidth':$(ele).parent().outerWidth(true)
						// 'totWidth':angular.element(ele).parent().outerWidth(true)		//no outerWidth function without jQuery
						// 'width':$(ele).children(":first-child").outerWidth(true),
					};
					animateInfo.width =animateInfo.totWidth;		//set each child to width of parent (to only show one at a time)
					
					if(0) {
					$(ele).children().each(function() {
						$(this).width(animateInfo.width);
					});
					}
					else {
					for(ii =0; ii<ele.children.length; ii++) {		//use 'children' NOT 'childNodes', which will also pick up text, comment nodes, etc. - http://stackoverflow.com/questions/7072423/why-does-childnodes-return-a-number-larger-than-i-expect
						angular.element(ele.children[ii]).css({'width':animateInfo.width.toString()+'px'});
					}
					}
					
					maxSlides =angular.element(ele).children().length;
					
					checkCurSlide({});
					
					// scope.styles.content.width =animateInfo.totWidth;		//do NOT set it to parent; needs to be full width of ALL slides side by side
					scope.styles.content.width =animateInfo.width*maxSlides;
					// console.log('animateInfo: '+JSON.stringify(animateInfo)+' maxSlides: '+maxSlides);
					
					//if num slides is calculated dynamically, do it now
					if(attrs.navNumItems !==undefined && attrs.navNumItems =='width') {
						navNumItems =Math.floor(animateInfo.totWidth /animateInfo.width);
					}
					
					//makes them all the same height..
					if(attrs.sameHeight) {
						var maxHeight =0;
						var curHeight;
						
						if(0) {
						$(ele).children().each(function() {
							curHeight =$(this).height();
							if(curHeight >maxHeight) {
								maxHeight =curHeight;
							}
						});
						$(ele).children().each(function() {
							$(this).height(maxHeight);
						});
						}
						else {
						for(ii =0; ii<ele.children.length; ii++) {
							curHeight =angular.element(ele.children[ii]).prop('offsetHeight');
							if(curHeight >maxHeight) {
								maxHeight =curHeight;
							}
						}
						for(ii =0; ii<ele.children.length; ii++) {
							angular.element(ele.children[ii]).css({'height':maxHeight.toString()+'px'});
						}
						}
						
					}
					//end: make them all same height
					
					if(attrs.centerOffset) {
						animateInfo.centerOffset =attrs.centerOffset*1;
					}
					else {		//center
						animateInfo.centerOffset =animateInfo.totWidth/2 -animateInfo.width/2;		//holds the position of the first slide margin-left when it's centered
					}
					
					//console.log(animateInfo.totWidth+" "+animateInfo.width*maxSlides);
					//hide nav arrows if content is less than total width; otherwise show them
					if(!alwaysShowNav && animateInfo.totWidth >animateInfo.width*maxSlides) {		//wider than content = no arrows
						scope.show.prev =false;
						scope.show.next =false;
						//nav to 0 to ensure all content is visible
						//scope.nav('first', {});
						scope.nav('all', {});
					}
					else {
						if(attrs.showArrows) {
							scope.show.prev =true;
							scope.show.next =true;
						}
						if(params.reNav) {
							scope.nav(scope.opts.curSlide, {});
						}
					}
				}
				
				/**
				@toc 3.
				@method $scope.$on('lmContentSliderReInit', ..
				@param args
					nav =mixed; string of 'prev', 'next', 'first', 'last' OR int of slide to go to
				*/
				scope.$on('lmContentSliderReInit', function(evt, args) {
					updateAnimateInfo({});
					var ppTemp ={};
					var to =scope.opts.curSlide;
					if(args.nav) {
						to =args.nav;
					}
					scope.nav(to, ppTemp);
				});
				
				/**
				@toc 4.
				@method scope.nav
				@param to =mixed; string of 'prev', 'next', 'first', 'last' 'all' (shows all content - this assumes total width is larger than all slides together) OR int of slide to go to
				*/
				scope.nav =function(to, params) {
					var ele =document.getElementById(attrs.ids.content);
					var marginLeft;
					//console.log("nav: "+to);
					if(to =='all') {
						marginLeft =Math.floor((animateInfo.totWidth - animateInfo.width*maxSlides) /2);
					}
					else {
						if(to =='prev') {
							if(scope.opts.curSlide >0) {
								//scope.opts.curSlide--;
								scope.opts.curSlide =scope.opts.curSlide -navNumItems;
								if(scope.opts.curSlide <0) {
									scope.opts.curSlide =0;
								}
							}
						}
						else if(to =='next') {
							if(scope.opts.curSlide <(maxSlides-navNumItems)) {
							//if(scope.opts.curSlide <(maxSlides-1)) {
								//scope.opts.curSlide++;
								scope.opts.curSlide =scope.opts.curSlide +navNumItems;
								if(scope.opts.curSlide >=(maxSlides-1)) {
									scope.opts.curSlide =(maxSlides-1);
								}
							}
						}
						else if(to =='first') {
							scope.opts.curSlide =0;
						}
						else if(to =='last') {
							//scope.opts.curSlide =maxSlides-1;
							scope.opts.curSlide =maxSlides -navNumItems;
						}
						else {		//must be an int of which slide to go to
							scope.opts.curSlide =to;
						}
						marginLeft =-1*(+scope.opts.curSlide*animateInfo.width) +animateInfo.centerOffset;
					}
					scope.styles.content.marginLeft =marginLeft;
					// angular.element(ele).css({'margin-left':marginLeft+'px'});
				};
				
				/**
				@toc 5.
				@method $scope.$watch('opts.curSlide',..
				*/
				scope.$watch('opts.curSlide', function(newVal, oldVal) {
					if(!angular.equals(oldVal, newVal)) {		//very important to do this for performance reasons since $watch runs all the time
						// updateAnimateInfo({});
						checkCurSlide({});
						scope.nav(scope.opts.curSlide, {});
					}
				});
				
				init({});
			};
		}
		
		// controller: function($scope, $element, $attrs) {
		// }
	};
}])
.factory('jrgCarouselResize', ['$rootScope', function($rootScope){
var inst ={

	callbacks: {},		//1D array of function callback info ({'evtName' =string of what event name to broadcast, 'args':[]}) to call on each resize
	timeout: false,

	//0.
	/*
	@param params
		timeout =int of milliseconds to wait between calling resize (for performance to avoid firing every millisecond)
	*/
	init: function(params)
	{
		var thisObj =this;
		var defaults ={'timeout':500};
		params =angular.extend(defaults, params);
		$(window).resize(function(){
			if(!thisObj.timeout) {
				thisObj.timeout =setTimeout(function() {
					thisObj.resize({});
					clearTimeout(thisObj.timeout);
					thisObj.timeout =false;		//reset
				}, params.timeout);
			}
		});
	},
	
	//0.5.
	destroy: function(params)
	{
	},

	//1.
	resize: function(params)
	{
		var thisObj =this;
		for(var xx in this.callbacks)
		{
			// console.log('carousel resize callback: '+xx);
			if(!$rootScope.$$phase) {		//if not already in apply / in Angular world
				$rootScope.$apply(function() {
					$rootScope.$broadcast(thisObj.callbacks[xx].evtName, thisObj.callbacks[xx].args);
				});
			}
			else {
				$rootScope.$broadcast(thisObj.callbacks[xx].evtName, thisObj.callbacks[xx].args);
			}
		}
	},

	//2.
	/*
	@param fxnId =string of associative array key/instance id to use (need this for removing callback later)
	@param fxnInfo =//1D array of function callback info ({'evtName' =string of what event name to broadcast, 'args':[]}) to call on each resize
	@param params
	*/
	addCallback: function(fxnId, fxnInfo, params)
	{
		this.callbacks[fxnId] =fxnInfo;
	},

	//2.5.
	removeCallback: function(fxnId, params)
	{
		if(this.callbacks[fxnId] && this.callbacks[fxnId] !==undefined)
			delete this.callbacks[fxnId];
	}

};
inst.init();
return inst;
}])
;
# AngularJS Carousel Directive

## Demo
http://jackrabbitsgroup.github.io/angular-carousel-directive/

## Dependencies
- required: NONE (except AngularJS of course - no jQuery, etc. or any other dependencies)
- optional
	- `font-awesome` (for next and previous arrow icons - though you can use whatever you want)
	- `less-flexbox` (for vertical centering the next and previous arrows)
		- `lesshat`
	- `angular-hammer` and `hammerjs` IF using hammer-swipe attribute for swiping to change the slide
See `bower.json` and `index.html` in the `gh-pages` branch for a full list / more details

## Install
1. download the files
	1. Bower
		1. add `"angular-carousel-directive": "latest"` to your `bower.json` file then run `bower install` OR run `bower install angular-carousel-directive`
2. include the files in your app
	1. carousel.js
	2. carousel.less
3. include the module in angular (i.e. in `app.js`) - `jackrabbitsgroup.angular-carousel-directive`

See the `gh-pages` branch, files `bower.json` and `index.html` for a full example.


## Documentation
See the `carousel.js` file top comments for usage examples and documentation
https://github.com/jackrabbitsgroup/angular-carousel-directive/blob/master/carousel.js
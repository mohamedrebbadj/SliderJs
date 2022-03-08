## SliderJs:
---
![SliderJs Images](/src/images/Slider_States.png)

---
## Usage:
SliderJs is a lightweight independent framework that allow you use custom range input with a lot of handy options that make it more flexible and suitable for your needs, all you have to do is to download '*dist*' folder, and include SliderJs in your page through a '*script*' tag:

	 <script src="./dist/SliderJs.bundle.js"><script>
	
And then in you js file you can provide a selector of the input you want SliderJs to use to store value of the slider, also you can also customize your slider by using the options object in your js file:

    const options = {
	    orientation: vertical // horizontal by default
	    min: 0 // minimum slider value by default 0
	    max: 100 // maximum slider value by default 100
	    step: 1 // slider steps by default (max - min) / 100
	    precision: 0 // represent numbers after the floating point
	    by default is equal to step precision
        value: 50 // by default equal to min
    }
    // Slider.init(css_selector, [options])
    const rangeSlider = SJ.init("input[type='range']", options);
You can also customize your slider through html attributes on your base range input:

    <input type="rang" orientation="horizontal" min="150" max="250" step="25" precision="0" value="175">
**Notice**: SliderJs work only with `<input type='range'>`

*if you have any problem using this plugin open an issue or pull request if have an idea on how to fix it*
*if you have any idea on how to improve this plugin please pull request*


    

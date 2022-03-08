type SN = string | number;
type SNU = SN | undefined;
type Obj = { [index: string]: any };
declare global {
  interface String {
    capitalize: () => string;
  }
}
// ** Helper Methods
// ====> Capitalize a string
if (!('capitalize' in String.prototype)) {
  Object.defineProperty(String.prototype, 'capitalize', {
    value: function () {
      return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false
  });
}
// ** Helper Functions
// ====> Get precision of a float number
function getPrecision(num: unknown): number {
  if (typeof num === 'number') return num.toString().split('.')[1]?.length || 0;
  throw new TypeError(
    `Expected an argument of type number but type ${typeof num} was found instead`
  );
}
// Create and return element with the provided className and html
function createElement(tag: string, { className = '', html = '' } = {}) {
  const elem = document.createElement(tag);
  elem.className = className;
  elem.innerHTML = html;
  return elem;
}
// Slider default options
const sliderDefaults: Obj = {
  min: 0,
  max: 100,
  orientation: 'horizontal',
  thumbs: 1
  /*precision, step, value*/
};
// ** Slider Class
class Slider {
  [index: string]: any;
  constructor(public input: HTMLInputElement, private options: Obj = {}) {
    this.accessibilityAttrs = [
      {
        name: 'tabIndex',
        value: '1'
      }
    ];
    this.passValue();
    this.initOptions();
    this.makeSlider();
    this.setOptionsOnSlider();
    // Delay constants setting to avoid track.offsetWidth error value
    setTimeout(() => {
      this.setConstants();
      this.setProgress();
      this.initActions();
      this.posTooltip();
    }, 0);
  }
  // Set each option to its appropriate value
  setOption(optionName: string): void {
    const jsOpt: SNU = this.options[optionName];
    const attrOpt = this.input.attributes.getNamedItem(optionName)?.value;
    const defaultOpt = sliderDefaults[optionName];
    this[optionName] = defaultOpt;
    if (attrOpt !== undefined) {
      this[optionName] = typeof defaultOpt === 'number' ? +attrOpt : attrOpt;
    }
    if (jsOpt !== undefined) {
      this[optionName] = typeof defaultOpt === 'number' ? +jsOpt : jsOpt;
    }
    // Set default precision to be the final step value precision
    if (optionName === 'step') {
      const precision = getPrecision(this.step);
      // Define max precision when the precision is not provided by the user
      sliderDefaults.precision =
        precision > 4 ? getPrecision(+this.step.toFixed(4)) : precision;
    }
    // Ensure that slider value is just a certain number of slider steps
    if (optionName === 'value') {
      this.redirectVal(this[optionName]);
    }
  }
  // Init slider options
  initOptions() {
    // Values that don't need any calculations
    const initials = ['min', 'max', 'orientation', 'thumbs'];
    initials.forEach((initial) => {
      this.setOption(initial);
    });
    // Set internal property range
    this._range = this.max - this.min;
    // Set default values
    sliderDefaults.value = this.min;
    sliderDefaults.step = this._range / 100;
    // Values need some calculations
    const options = ['step', 'precision', 'value'];
    options.forEach((option) => {
      this.setOption(option);
      delete sliderDefaults[option];
    });
    // Define slider step based on slider precision
    this.step = +this.step.toFixed(this.precision);
    // Remove all attributes from the input and preserve type attribute
    initials
      .concat(options)
      .forEach((option) => this.input.removeAttribute(option));
    this.input.setAttribute('type', 'range');
    // Determine whether to use x or y coordinate to calculate slider value
    this.axis = this.orientation === 'horizontal' ? 'offsetX' : 'offsetY';
    // Determine whether to use height or width to resize slider progress
    this.dimension = this.orientation === 'horizontal' ? 'width' : 'height';
  }
  // Set options on slider and input to make debugging easier
  setOptionsOnSlider() {
    const inputOptions = ['step', 'min', 'max', 'value'];
    const sliderProperties = [
      'step',
      'min',
      'max',
      'value',
      'thumbs',
      'precision',
      'orientation'
    ];
    for (const option of sliderProperties) {
      this.sliderElement.setAttribute(`data-${option}`, `${this[option]}`);
      if (inputOptions.includes(option)) {
        this.input.setAttribute(`${option}`, `${this[option]}`);
        if (option === 'value') this.input.value = this[option];
      }
    }
  }
  // Determine the right side to display tooltip
  posTooltip() {
    const coordinates = this.progress.getBoundingClientRect();
    const tooltipHeight = this.tooltip.offsetHeight;
    const tooltipWidth = this.tooltip.offsetWidth;
    const tooltipHoverDistance = 15;
    let tooltipSide: string;
    if (this.orientation === 'horizontal') {
      if (
        coordinates.top + window.scrollY >=
        tooltipHeight + tooltipHoverDistance
      ) {
        tooltipSide = 'top';
      } else {
        tooltipSide = 'bottom';
      }
    } else if (this.orientation === 'vertical') {
      if (
        coordinates.left + window.scrollX >=
        tooltipWidth + tooltipHoverDistance
      ) {
        tooltipSide = 'left';
      } else {
        tooltipSide = 'right';
      }
    }
    this.tooltip.classList.add(`sj-tooltip-${tooltipSide}`);
  }
  // Create and append slider to the document body
  makeSlider() {
    // Todo: Make tooltip the last thing that get out of view when scrolling horizontally when we're using slider-horizontal
    // Todo: Make tooltip the last thing that get out of view when scrolling vertically when we're using slider-vertical
    // Create slider container
    this.sliderContainer = createElement('div', { className: 'sj-container' });
    // Create Slider
    this.sliderElement = createElement('div', {
      className: `sj sj-${this.orientation}`
    });
    // Add accessibility attributes to slider element
    this.accessibilityAttrs.forEach((attr: { name: string; value: string }) => {
      this.sliderElement.setAttribute(attr.name, attr.value);
    });
    // Append slider first to use its coordinates to position tooltip
    this.input.parentElement.replaceChild(this.sliderContainer, this.input);
    this.sliderContainer.append(this.sliderElement, this.input);
    this.input.hidden = true;
    // Create slider track
    this.track = createElement('div', { className: 'sj-track' });
    // Create and append tooltip and slider thumb to slider track
    this.tooltip = createElement('div', {
      className: `sj-tooltip`,
      html: `${this.value.toFixed(this.precision)}`
    });
    // Create slider progress and append thumb and tooltip to it
    this.progress = createElement('div', { className: `sj-progress` });
    this.progress.append(
      this.tooltip,
      createElement('div', { className: 'sj-thumb' })
    );
    this.track.append(this.progress);
    // Create and append min, slider track and max elements to slider
    this.sliderElement.append(
      createElement('span', { className: 'sj-min', html: `${this.min}` }),
      this.track,
      createElement('span', { className: 'sj-max', html: `${this.max}` })
    );
  }
  // Invokes when pressing left arrow key, decrease slider value by 1 step
  prev() {
    if (this.value >= this.min + this.step) this.value -= this.step;
    this.setProgress();
  }
  // Invokes when pressing right arrow key, increase slider value by 1 step
  next() {
    if (this.value <= this.max - this.step) this.value += this.step;
    this.setProgress();
  }
  // Jump slider value to any arbitrary value depending on pointerdown event and pointermove
  // But it also make sure that the value is on accord with steps
  jump() {}
  // Add event handler for pointerdown, pointermove, pointerup and keydown
  initActions() {
    // Add key control to slider
    this.sliderElement.addEventListener('keydown', (event: any) => {
      if (this.orientation === 'vertical') {
        if (event.code === 'ArrowLeft' || event.code === 'ArrowUp') this.prev();
        if (event.code === 'ArrowRight' || event.code === 'ArrowDown')
          this.next();
      } else if (this.orientation === 'horizontal') {
        if (event.code === 'ArrowLeft' || event.code === 'ArrowDown')
          this.prev();
        if (event.code === 'ArrowRight' || event.code === 'ArrowUp')
          this.next();
      }
    });
    // Add Mouse and touch controls
    this.track.addEventListener('pointerdown', (event: any) => {
      const thumb = event.target.closest('.sj-thumb');
      // Attach future pointerEvents to slider track
      this.track.setPointerCapture(event.pointerId);
      // Action When the user clicks on the track not on the thumb
      if (thumb && this.track.contains(thumb)) {
        // Actions when the suer clicks on the thumb
        // Make thumb bigger when the user click on it
        thumb.classList.add('active');
        // With the user pointerdown on the thumb we add pointermove event handler
        this.track.onpointermove = (event: any) => {
          this.redirectVal(event[this.axis] / this.pixelsPerValue + this.min);
          this.setProgress();
        };
        // Prevent default browser drag event on slider thumb
        thumb.addEventListener('dragstart', (event: any) => {
          event.preventDefault;
        });
      }
      // Remove event handlers that aren't needed
      this.track.onpointerup = (event: any) => {
        this.redirectVal(event[this.axis] / this.pixelsPerValue + this.min);
        this.setProgress();
        this.track.onpointermove = null;
        this.track.onpointerup = null;
        // Set back thumb size to its normal size
        if (thumb) thumb.classList.remove('active');
      };
    });
    // Make slider track and slider progress wider when focus on slider
    const oppositeDim = this.dimension === 'width' ? 'height' : 'width';
    const oppositeDimOffset = `offset${oppositeDim.capitalize()}`;
    this.sliderElement.addEventListener('focus', () => {
      this.progress.style[oppositeDim] =
        this.track[oppositeDimOffset] * 1.2 + 'px';
    });
    this.sliderElement.addEventListener('blur', () => {
      this.progress.style[oppositeDim] =
        this.track[oppositeDimOffset] / 1.2 + 'px';
    });
  }
  // Set progress element width depending on slider value
  setProgress() {
    // Length of the slider value
    const length = this.value - this.min;
    this.progress.style[this.dimension] = length * this.pixelsPerValue + 'px';
    this.tooltip.innerText = this.value.toFixed(this.precision);
  }
  // Make sure that slider value is always in accord with step
  redirectVal(value: number) {
    // Make sure that value is in slider range
    value = value < this.min ? this.min : value > this.max ? this.max : value;
    // Make the provided value harmonize with slider steps
    value = Math.round((value - this.min) / this.step) * this.step + this.min;
    // In some cases Math.round(this.max / this.step) * this.step is bigger than this.max by 1 step at most
    // So we decrease value by one step
    if (value > this.max) value -= this.step;
    this.proxyThis.value = +value.toFixed(this.precision);
  }
  // Set slider constants, this constants help in later calculations
  setConstants() {
    // Compose the property that we should use depending on slider orientation
    const offsetDim = `offset${this.dimension.capitalize()}`;
    this.pixelsPerValue = this.track[offsetDim] / this._range;
  }
  private passValue() {
    // Reflect changes on the hidden input
    this.proxyThis = new Proxy(this, {
      set(target, property, value) {
        if (property === 'value') {
          target.value = value;
          target.input.value = value;
          // The input may auto correct its value, and we get the value and set it back to slider
          if (target.input.value != target.value) {
            target.value = 0;
            target.value = +target.input.value;
          }
          target.input.setAttribute(property, value);
        }
        return true;
      }
    });
  }
}
// Create sliders using the provided selector
// export init function so it will be used by webpack as global constructor of the slider
export function init(selector: string, options: Obj = {}) {
  const elements = Array.from(document.querySelectorAll(selector));
  const sliders = elements
    .filter((element) => {
      return (
        element.tagName === 'INPUT' && element.getAttribute('type') === 'range'
      );
    })
    .map((input) => {
      return new Slider(input as HTMLInputElement, options);
    });
  if (sliders.length !== elements.length) {
    console.warn(
      "Slider class make only input[type='range'] into sliders!, Make sure all the provided elements are range input"
    );
  }
  return sliders.length === 1 ? sliders[0] : sliders;
}
/* 
todo: Fix tooltip make in the end of the body, and make it update when you move slider thumb
    todo: This will fix overlap problem
todo: Finish example folder
todo: Fix webpack config file so that give this structure:
    src
    build
    example
    dist
todo: Make readme file to show the user how to use this frame work
todo: fix multiple initialization on the same input make multiple slider for it
*/

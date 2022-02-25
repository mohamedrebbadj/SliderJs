export {};
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
    this.initOptions();
    this.makeSlider();
    this.setOptionsOnSlider();
    this.initOptions();
    // Delay constants setting to avoid track.offsetWidth error value
    setTimeout(() => {
      this.setConstants();
      this.setProgress();
      this.initActions();
    }, 0);
  }
  // Set each option to its appropriate value
  setOption(optionName: string): SN {
    const jsOpt: SNU = this.options[optionName];
    const attrOpt = this.input.attributes.getNamedItem(optionName)?.value;
    const defaultOpt = sliderDefaults[optionName];
    this[optionName] = defaultOpt;
    if (attrOpt !== undefined) {
      this[optionName] = typeof defaultOpt === 'number' ? +attrOpt : attrOpt;
    }
    if (jsOpt !== undefined && jsOpt !== defaultOpt) {
      this[optionName] = typeof defaultOpt === 'number' ? +jsOpt : jsOpt;
    }
    // Ensure that slider value is just a certain number of slider steps
    if (optionName === 'value') {
      this.redirectVal(this[optionName]);
    }
    return this[optionName];
  }
  // Init slider options
  initOptions() {
    // Values that don't need any calculations
    const initials = ['min', 'max', 'orientation', 'thumbs'];
    initials.forEach((initial) => {
      this.options[initial] = this.setOption(initial);
    });
    // Set internal property range
    this._range = this.options.max - this.options.min;
    // Set default values
    sliderDefaults.value = this.options.min;
    sliderDefaults.step = this._range / 10;
    sliderDefaults.precision = getPrecision(sliderDefaults.step);
    // Values need some calculations
    const options = ['step', 'precision', 'value'];
    options.forEach((option) => {
      this.options[option] = this.setOption(option);
    });
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
    for (const option in this.options) {
      this.sliderElement.setAttribute(`data-${option}`, `${this[option]}`);
      if (inputOptions.includes(option)) {
        this.input.setAttribute(`${option}`, `${this[option]}`);
        if (option === 'value') this.input.value = this[option];
      }
    }
  }
  // Determine the right side to display tooltip
  posTooltip() {
    const coordinates = this.sliderElement.getBoundingClientRect();
    const tooltipHeight = this.tooltip.offsetHeight;
    const tooltipWidth = this.tooltip.offsetWidth;
    // Todo: Find more precise way to position tooltip than adding 20px [represent distance between side of track and the side of tooltip]
    if (this.orientation === 'horizontal') {
      if (coordinates.top + window.scrollY >= tooltipHeight + 20) return 'top';
      else return 'bottom';
    }
    if (coordinates.top + window.scrollY >= tooltipWidth + 20) return 'left';
    else return 'right';
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
      html: `${this.value}`
    });
    // Create slider progress and append thumb and tooltip to it
    this.progress = createElement('div', { className: `sj-progress` });
    this.progress.append(
      this.tooltip,
      createElement('div', { className: 'sj-thumb' })
    );
    this.track.append(this.progress);
    this.tooltip.classList.add(`sj-tooltip-${this.posTooltip()}`);
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
      if (event.code === 'ArrowLeft') this.prev();
      if (event.code === 'ArrowRight') this.next();
    });
    // Add Mouse and touch controls
    this.track.addEventListener('pointerdown', (event: any) => {
      const thumb = event.target.closest('.sj-thumb');
      // Attach future pointerEvents to slider track
      this.track.setPointerCapture(event.pointerId);
      // Action When the user clicks on the track not on the thumb
      if (!thumb || !this.track.contains(thumb)) {
        this.redirectVal(event[this.axis] / this.pixelsPerValue + this.min);
        this.setProgress();
      } else {
        // Actions when the suer clicks on the thumb
        // With the user pointerdown on the thumb we add pointermove event handler
        this.track.onpointermove = (event: any) => {
          this.redirectVal(event[this.axis] / this.pixelsPerValue + this.min);
          this.setProgress();
        };
      }
      // Remove event handlers that aren't needed
      this.track.onpointerup = () => {
        this.track.onpointermove = null;
        this.track.onpointerup = null;
      };
    });
  }
  // Set progress element width depending on slider value
  setProgress() {
    // Length of the slider value
    const length = this.value - this.min;
    this.progress.style[this.dimension] = length * this.pixelsPerValue + 'px';
    this.tooltip.innerText = this.value;
  }
  // Make sure that slider value is always in accord with step
  redirectVal(value: number) {
    this.value = Math.round(value / this.step) * this.step;
    // Make sure that slider value is not out of range
    if (this.value > this.max)
      this.value = Math.floor(this.max / this.step) * this.step;
    if (this.value < this.min)
      this.value = Math.ceil(this.min / this.step) * this.step;
  }
  // Set slider constants, this constants help in later calculations
  setConstants() {
    // Compose the property that we should use depending on slider orientation
    const offsetDim = `offset${this.dimension.capitalize()}`;
    this.pixelsPerValue = this.track[offsetDim] / this._range;
  }
  // Create sliders using the provided selector
  static init(selector: string, options: Obj = {}) {
    const elements = Array.from(document.querySelectorAll(selector));
    const sliders = elements
      .filter((element) => {
        return (
          element.tagName === 'INPUT' &&
          element.getAttribute('type') === 'range'
        );
      })
      .map((input) => new Slider(input as HTMLInputElement, options));
    if (sliders.length !== elements.length) {
      console.warn(
        "Slider class make only input[type='range'] into sliders!, Make sure all the provided elements are range input"
      );
    }
    return sliders;
  }
}
// const sliderInput = document.querySelector(
//   "input[type='range']"
// ) as HTMLInputElement;
// let slider = new Slider(sliderInput);
const sliders = Slider.init("input[type='range'], div");
// ! Create multiple range slider have problem with [z-index, tooltip side]
// ! Add the functionality that transfer value information to the hidden range input
// ! Make thumb bigger when focus on slider
// ! Only solving 1st problem should be done on this branch
// ! Remove this comments after you finish
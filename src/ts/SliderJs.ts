type Attributes = { name: string; value: string }[];
type SN = string | number;
type SNU = SN | undefined;
type Obj = { [index: string]: any };
// ** Helper functions
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
  constructor(
    public input: HTMLInputElement,
    private options: Obj,
    private accessabilityAttrs = ['tabindex']
  ) {
    this.initOptions();
    this.makeSlider();
    this.setOptionsOnSlider();
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
  }
  // Set options on slider and input to make debugging easier
  setOptionsOnSlider() {
    const inputOptions = ['step', 'min', 'max', 'value'];
    for (const option in this.options) {
      this.sliderElement.setAttribute(`data-${option}`, `${this[option]}`);
      if (inputOptions.includes(option)) {
        this.input.setAttribute(`${option}`, `${this[option]}`);
        if (option === "value") this.input.value = this[option];
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
    // Append slider first to use its coordinates to position tooltip
    document.body.append(this.sliderContainer);
    this.sliderContainer.append(this.sliderElement, this.input);
    this.input.hidden = true;
    // Create slider track
    this.track = createElement('div', { className: 'sj-track' });
    // Create and append tooltip and slider thumb to slider track
    this.tooltip = createElement('div', {
      className: `sj-tooltip`,
      html: `${this.value}`
    });
    this.track.append(
      this.tooltip,
      createElement('div', { className: 'sj-thumb' })
    );
    this.tooltip.classList.add(`sj-tooltip-${this.posTooltip()}`);
    // Create and append min, slider track and max elements to slider
    this.sliderElement.append(
      createElement('span', { className: 'sj-min', html: `${this.min}` }),
      this.track,
      createElement('span', { className: 'sj-max', html: `${this.max}` })
    );
  }
}
const sliderInput = document.querySelector(
  "input[type='range']"
) as HTMLInputElement;
let slider = new Slider(sliderInput, { min: 30, value: 40, max: 50 });

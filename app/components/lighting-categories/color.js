import React, {Component} from 'react';
import styles from './color.css';
import {
  getRGBPrime,
  toDegrees,
  calcRadialHue,
  calcRadialMagnitude
} from '../../utils/color-math';

export class ColorCategory extends Component {
  constructor(props) {
    super();
    this.state = {
      lensTransform: '',
      selectedColor: {
        hue: null,
        sat: null,
        rgb: null,
        lensTransform: null
      }
    };
  }

  componentDidMount() {
    const {width, height} = this.ref.getBoundingClientRect();
    this.refWidth = width;
    this.refHeight = height;
  }

  // For the color picker uses a conical gradient
  getRadialHueSat(evt) {
    const {offsetX, offsetY} = evt.nativeEvent;
    const lensTransform = `translate3d(${offsetX - 5}px, ${offsetY - 5}px, 0)`;
    const hue = toDegrees(calcRadialHue(offsetX, offsetY));
    const sat = Math.min(1, calcRadialMagnitude(offsetX, offsetY));
    return {hue, sat};
  }

  // For standard color picker uses a conical gradient
  getLinearHueSat(evt) {
    // calculate later
    const width = this.refWidth;
    const height = this.refHeight;
    const {offsetX, offsetY} = evt.nativeEvent;
    const lensTransform = `translate3d(${offsetX - 5}px, ${offsetY - 5}px, 0)`;
    const hue = 360 * Math.min(1, offsetX / width);
    const sat = 1 - Math.min(1, offsetY / height);
    return {hue, sat};
  }

  onMouseMove(evt) {
    const {offsetX, offsetY} = evt.nativeEvent;
    const lensTransform = `translate3d(${offsetX - 5}px, ${offsetY - 5}px, 0)`;

    const {hue, sat} = this.getLinearHueSat(evt);
    const c = sat;
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = 1 - c;
    const [r, g, b] = getRGBPrime(hue, c, x).map(n =>
      Math.round(255 * (m + n))
    );
    const rgb = `rgba(${r},${g},${b},1)`;
    this.setState({
      lensTransform,
      selectedColor: {
        hue,
        sat,
        rgb
      }
    });
  }

  onClick(evt) {
    const {hue, sat} = this.state.selectedColor;
    this.props.setColor(Math.round(255 * (hue / 360)), Math.round(255 * sat));
  }

  render() {
    return (
      <div style={{background: this.state.selectedColor.rgb}}>
        <div
          onClick={this.onClick.bind(this)}
          onMouseMove={this.onMouseMove.bind(this)}
          className={styles.container}
        >
          <div ref={ref => (this.ref = ref)} className={styles.outer}>
            <div className={styles.inner}>
              <div
                className={styles.lens}
                style={{transform: this.state.lensTransform}}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

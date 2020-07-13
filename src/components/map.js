import React from "react"
import "./map.css"
import intersect from "box-intersect"

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      width: this.props.width,
      height: this.props.height,
      xOffset: 0,
      yOffset: 0,
      dragging: false,
      zoom: 1,
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  mouseUpHandle(e) {
    if (this.state.dragging) {
      this.setState(Object.assign(this.state, {dragging: false}));
    }
  }

  mouseDownHandle(e) {
    if (!this.state.dragging) {
      this.setState(Object.assign(this.state, {dragging: true}));
      this.lastClientX = e.clientX;
      this.lastClientY = e.clientY;
      e.preventDefault();
    }
  }

  drawLine(lines) {
    let o = []
    for(let key in lines.lines) {
      var points = '';
      for(let lkey in lines.lines[key]) {
        let id = lines.lines[key][lkey];
        if (this.props.catalog[id]) {
          points += ' ' + this.props.catalog[id].coordinates.x + ',' + this.props.catalog[id].coordinates.y
        }
        o.push(
          <>
            <polyline vectorEffect="non-scaling-stroke" points={ points } stroke={ lines.color } strokeWidth="1" fill="none" />
          </>
        )
      }
    }
    return o;
  }

  mouseMoveHandle(e) {
    if (this.state.dragging) {
      this.setState({
        xOffset: this.state.xOffset - (-this.lastClientX + (this.lastClientX = e.clientX)),
        yOffset: this.state.yOffset - (-this.lastClientY + (this.lastClientY = e.clientY)),
      });
    }
  }

  handleZoom(e) {
    this.setState({ zoom: (this.state.zoom + e.deltaY / 1000)});
  }

  render() {
    const w = this.state.width;
    const h = this.state.height;
    const z = Math.abs(this.state.zoom);
    const xo = this.state.xOffset;
    const yo = this.state.yOffset;
    const vb = [
      xo / z,
      yo / z,
      w / z,
      h / z,
    ]

    let background = (
      <>
        <rect 
          x={ xo / z }
          y={ yo / z }
          width={ w / z }
          height={ h / z }
          fill="black"
        />
      </>
    );

    let lines = [];
    for(let key in this.props.lines) {
      lines.push(this.drawLine(this.props.lines[key]))
    }

    let occupied = [];

    occupied.push([[(xo + w) / z], [yo / z], (xo + w) / z + 1, [ (yo + h) / z ]]);
    
    let objects = [];
    let safeSize = 12 / z;
    let fontXOffset = 6 / z;
    let fontYOffset = 10 / z;
    let fontHeight = 6 / z;
    for(let key in this.props.catalog) {
      let thing = this.props.catalog[key];
      if (!thing.outline && thing.interesting !== false && thing.coordinates && thing.type !== 'station' && thing.type !== 'star' && thing.type !== 'post') {
        let c = thing.coordinates;
        if (c.x > xo / z && c.x < (w + xo) / z) {
          if (c.y > yo / z && c.y < (h + yo) / z) {
            let box = [c.x-safeSize, c.y-safeSize, c.x+safeSize, c.y+safeSize];
            let labelBox = key ? [c.x+fontXOffset, c.y+fontYOffset, c.x+(fontHeight*key.length), c.y+fontHeight] : false;
            let label = [];
            if (intersect(occupied, [box]).length === 0 && (!labelBox || intersect(occupied, [labelBox]).length === 0 )) {
              occupied.push(box);
              occupied.push(labelBox);
              if (thing.host) {
                label.push(
                  <text
                    x={ thing.coordinates.x + 6 / z }
                    y={ thing.coordinates.y - 1 / z }
                    fill="white"
                    class="host-label"
                    fontSize={ 4.86 / z }
                  >
                    { thing.host.toUpperCase() } SYSTEM
                  </text>
                )
              }

              label.push(
                <text
                  x={ thing.coordinates.x + 6 / z }
                  y={ thing.host ? thing.coordinates.y + 9.5 / z : thing.coordinates.y + 4 / z }
                  fill="white"
                  fontSize={ 11.65 / z }
                >
                  { key.toUpperCase() }
                </text>
              )
            }
            if (label.length > 0) {
              objects.push(
                <g key={ key }>
                  <use href="/markers.svg#planet" x={ thing.coordinates.x } y={ thing.coordinates.y } width={ 10 / z } />
                  { label }
                </g>
              );
            } else {
              objects.push(
                <g key={ key }>
                  <use href="/markers.svg#background-planet" x={ thing.coordinates.x } y={ thing.coordinates.y } width={ 8 / z } />
                </g>
              );
            }
          }
        }
      }
    }

    return (
      <svg
        width={w}
        height={h}
        viewBox={vb.join(' ')}
        onMouseUp={this.mouseUpHandle.bind(this)}
        onMouseDown={this.mouseDownHandle.bind(this)}
        onMouseMove={this.mouseMoveHandle.bind(this)}
        onWheel = {this.handleZoom.bind(this)}
        className={ this.state.dragging ? 'dragging' : 'draggable' }
        data-zoom={ z }
       >
        { background }
        <use
          href="#local-grid"
          x="-50000"
          y="-76200"
          height="100000"
          width="100000"
        />
        <use
          href="#galactic-grid"
          x="-50000"
          y="-76200"
          height="100000"
          width="100000"
        />
        { lines }
        { objects }
      </svg>
    )
  }
}

export default Map
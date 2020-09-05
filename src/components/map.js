import React from "react"
import "./map.css"
import intersect from "box-intersect"
import objHash from "object-hash"

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
      inSight: [],
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);

  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    let occupied = [];
    let inSight = {};

    for(let key in this.refs) {
      let thing = this.refs[key];
      let bbox = thing.current.getBBox();
      let box = [bbox.x, bbox.y, bbox.x+bbox.width, bbox.y+bbox.height];
      if (intersect(occupied, [box]).length === 0) {
        occupied.push(box);
        inSight[key] = true;
      } else {
        inSight[key] = false;
      }
    };
    if (objHash(prevState.inSight) !== objHash(inSight)) {
      this.setState(Object.assign(this.state, {inSight: inSight}));
    }
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

    occupied.push([
      [
        xo / z,
        yo / z,
        (xo + w) / z,
        (yo + h) / z
      ]
    ]);
    
    this.refs = {};

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
            let label = [];
            if (intersect(occupied, [box]).length == 0) {
              if (thing.host) {
                label.push(
                  <text
                    x={ thing.coordinates.x + 6 / z }
                    y={ thing.coordinates.y - 1 / z }
                    fill="white"
                    class="host-label"
                    fontSize={ 4.86 / z }

                    stroke-width={ 2 / z }
                    stroke="#000"
                    paint-order="stroke"
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
                  stroke-width={ 1 / z }
                  stroke="#000"
                  paint-order="stroke"
                >
                  { key.toUpperCase() }
                </text>
              )
            }
            if (label.length > 0) {
              this.refs[key] = React.createRef();
              objects.push((
                <g key={ key }>
                  <use href={ this.state.inSight[key] ? "/markers.svg#planet" : "/markers.svg#background-planet" }  x={ thing.coordinates.x } y={ thing.coordinates.y } width={ (this.state.inSight[key] ? 10 : 4)  / z }/>
                  <g ref={ this.refs[key] } visibility={ this.state.inSight[key] ? 'visible' : 'hidden' }>{ label }</g>
                </g>
              ));
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
        <g>{ lines }</g>
        { objects }
      </svg>
    )
  }
}

export default Map
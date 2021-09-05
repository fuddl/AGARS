"use strict"

Object.defineProperty(exports, "__esModule", {
  value: true,
})
exports.default = void 0

var _react = _interopRequireDefault(require("react"))

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}

class grid extends _react.default.Component {
  toRadians(angle) {
    return angle * (Math.PI / 180)
  }

  s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1)
  }

  guid() {
    return (
      this.s4() +
      this.s4() +
      "-" +
      this.s4() +
      "-" +
      this.s4() +
      "-" +
      this.s4() +
      "-" +
      this.s4() +
      this.s4() +
      this.s4()
    )
  }

  copyAttributes(attributes) {
    return JSON.parse(JSON.stringify(attributes))
  }

  polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees * Math.PI) / 180
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    }
  }

  describeArc(x, y, radius, startAngle, endAngle) {
    let largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
    var start = this.polarToCartesian(x, y, radius, endAngle)
    var end = this.polarToCartesian(x, y, radius, startAngle)
    let d = [
      "M",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
    ].join(" ")
    return d
  }

  arc(attributes) {
    let d = this.describeArc(
      attributes.cx,
      attributes.cy,
      attributes.r,
      attributes.minArc,
      attributes.maxArc
    )
    return /*#__PURE__*/ _react.default.createElement(
      _react.default.Fragment,
      null,
      /*#__PURE__*/ _react.default.createElement("path", {
        stroke: attributes.stroke,
        fill: "none",
        strokeWidth: attributes.strokeWidth,
        d: d,
      })
    )
  }

  circle(attributes) {
    let dashArray = ""
    let fullCircle = 2 * Math.PI * attributes.r

    if (attributes.maxArc) {
      let circlePart =
        this.toRadians(attributes.maxArc - attributes.minArc) * attributes.r
      dashArray = circlePart + "," + (fullCircle - circlePart)
    }

    let dashArrayOffset = null

    if (attributes.minArc) {
      // firefox needs offset of /*+.00022*/
      dashArrayOffset = this.toRadians(attributes.minArc) * attributes.r * -1
    }

    return /*#__PURE__*/ _react.default.createElement(
      _react.default.Fragment,
      null,
      /*#__PURE__*/ _react.default.createElement("circle", {
        cx: attributes.cx,
        cy: attributes.cy,
        r: attributes.r,
        stroke: attributes.stroke,
        fill: "none",
        strokeWidth: attributes.strokeWidth,
        strokeDasharray: dashArray,
        strokeDashoffset: dashArrayOffset,
      })
    )
  }

  subdivisionCircles(attributes) {
    let output = /*#__PURE__*/ _react.default.createElement(
      _react.default.Fragment,
      null
    )

    let n = 1
    let minR = attributes.minR ? attributes.minR : 0

    while (n < attributes.concentricSubdivisions + 1) {
      let rSum = (attributes.r - minR) / (attributes.concentricSubdivisions + 1)

      if (attributes.maxArc) {
        output = /*#__PURE__*/ _react.default.createElement(
          _react.default.Fragment,
          null,
          output,
          this.arc(
            Object.assign(this.copyAttributes(attributes), {
              r: rSum * n + minR,
            })
          )
        )
      } else {
        output = /*#__PURE__*/ _react.default.createElement(
          _react.default.Fragment,
          null,
          output,
          this.circle(
            Object.assign(this.copyAttributes(attributes), {
              r: rSum * n + attributes.minR,
            })
          )
        )
      }

      n++
    }

    return output
  }

  radialSubdivisions(attributes) {
    let arc = 360

    if (attributes.maxArc) {
      arc = attributes.maxArc - attributes.minArc
    }

    let a = arc / attributes.radialSubdivisions
    let n = 0
    let offset = 0

    if (attributes.minArc) {
      offset = this.toRadians(attributes.minArc)
    }

    let output = /*#__PURE__*/ _react.default.createElement(
      _react.default.Fragment,
      null
    )

    while (n < attributes.radialSubdivisions + 1) {
      let minR = attributes.minR ? attributes.minR : 0
      let startX =
        Math.cos(this.toRadians(a * n) + offset) * minR + attributes.cx
      let startY =
        Math.sin(this.toRadians(a * n) + offset) * minR + attributes.cy
      let endX =
        Math.cos(this.toRadians(a * n) + offset) * attributes.r + attributes.cx
      let endY =
        Math.sin(this.toRadians(a * n) + offset) * attributes.r + attributes.cy
      output = /*#__PURE__*/ _react.default.createElement(
        _react.default.Fragment,
        null,
        output,
        /*#__PURE__*/ _react.default.createElement("line", {
          x1: startX,
          y1: startY,
          x2: endX,
          y2: endY,
          stroke: attributes.stroke,
          strokeWidth: attributes.strokeWidth,
        })
      )
      n++
    }

    return output
  }

  render() {
    let attributes = this.copyAttributes(this.props)
    let innerCircle, outerCircle

    if (attributes.maxArc) {
      innerCircle = this.arc(
        Object.assign(this.copyAttributes(attributes), {
          r: attributes.minR,
        })
      )
      outerCircle = this.arc(attributes)
    } else {
      innerCircle = this.circle(
        Object.assign(this.copyAttributes(attributes), {
          r: attributes.minR,
        })
      )
      outerCircle = this.circle(attributes)
    }

    let subdivisionCircles = this.subdivisionCircles(attributes)
    let radialSubdivisions = this.radialSubdivisions(attributes)
    return /*#__PURE__*/ _react.default.createElement(
      "g",
      null,
      innerCircle,
      outerCircle,
      subdivisionCircles,
      radialSubdivisions
    )
  }
}

var _default = grid
exports.default = _default

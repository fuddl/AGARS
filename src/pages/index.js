import React from "react"
import RadialGrid from '../components/radial-grid.js'
import Map from "../components/map"

import data from '../data/catalog.yaml'
import lines from '../data/lines.yaml'
import normalizer from '../data/normalize-data.js'


const IndexPage = () => (
  <>
    <link href="fonts.css" rel="stylesheet" />
    <Map width="1600" height="900" catalog={ normalizer.process(data) } lines={ lines } />
    <svg hidden>
      <defs>
        <symbol id="local-grid" viewBox="-50000 -76200 100000 100000">
          <RadialGrid
            cx={0}
            cy={-26200}
            minR={26112.2}
            r={26332.6}
            concentricSubdivisions={10}
            radialSubdivisions={14}
            stroke="#333"
            strokeWidth={.5}
            minArc={89.755}
            maxArc={90.355}
            opacity={.25}
          />
        </symbol>
        <symbol id="galactic-grid"  viewBox="-50000 -76200 100000 100000">
          <RadialGrid
            cx={0}
            cy={-26200}
            minR={20}
            r={50000}
            concentricSubdivisions={8}
            radialSubdivisions={8}
            stroke="white"
            strokeWidth="1"
            minArc={89.952}
          />
        </symbol>
      </defs>
    </svg>
  </>
)

export default IndexPage
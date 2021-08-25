import fs from "fs"
import YAML from "yaml"
import cheerio from "cheerio"
import RadialGrid from "./radialgrid.js"
import ReactDOMServer from "react-dom/umd/react-dom-server.browser.production.min.js"

const gridData = new RadialGrid.default({
	cx: 0,
	cy: -26200,
	minR: 26012,
	r: 26670,
	concentricSubdivisions: 22,
	radialSubdivisions: 37,
	stroke: "silver",
	strokeWidth: 0.5,
	minArc: 89.125,
	maxArc: 90.79,
	opacity: 0.25,
})

const grid = ReactDOMServer.renderToStaticMarkup(gridData.render())

const file = fs.readFileSync("./src/data/catalog.yaml", "utf8")
const political = fs.readFileSync(
	"./src/images/local-space-political.svg",
	"utf8"
)
const c = YAML.parse(file)
const $ = cheerio.load(political)
let paths = $("path")

const size = 50
for (const key in c) {
	const data = c[key].Mandel || c[key].Mandel_2018
	if (
		data &&
		data.hasOwnProperty("label") &&
		data.hasOwnProperty("coordinates") &&
		!data.coordinates.hasOwnProperty("relative-to")
	) {
		const fileName = data.label.replace(/\s+\([^\)]+\)$/, "")
		const fractions = c[key].hasOwnProperty("fractions") ? c[key].fractions : []
		let newFile = `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="-360 -200 800 680" width="760" height="680">
				${paths
					.get()
					.map(
						p =>
							`<path d="${$(p).attr("d")}" fill="#${
								fractions.includes($(p).attr("data-name")) ? "F5F5F5" : "DFDFDF"
							}" stroke="#D0D0D0" />`
					)
					.join("")}
					${grid}
				<rect x="0" y="0" width="20" height="20" stroke="red" fill="none"/>
				<rect x="-360" y="0" width="20" height="20" stroke="red" fill="none"/>
				<rect x="380" y="0" width="20" height="20" stroke="red" fill="none"/>
				<circle fill="#C12737" cx="${data.coordinates.x}" cy="${
			data.coordinates.y
		}" r="5"/>
			</svg>
		`
		fs.writeFileSync(`./locator/${fileName}.svg`, newFile)
	}
}

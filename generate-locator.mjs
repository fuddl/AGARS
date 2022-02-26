import fs from "fs"
import YAML from "yaml"
import cheerio from "cheerio"
import RadialGrid from "./radialgrid.js"
import ReactDOMServer from "react-dom/umd/react-dom-server.browser.production.min.js"
import pkg from "svgo"

const debug = false

const SVGO = new pkg({
	disable: [
		"removeMetadata",
		"removeHiddenElems",
		"removeUnknownsAndDefaults",
		"convertPathData",
		"mergePaths",
		"removeXMLProcInst",
		"convertStyleToAttrs",
		"cleanupIDs",
		"cleanupNumericValues",
		"convertShapeToPath",
		"inlineStyles",
		"minifyStyles",
		"removeComments",
		"removeEditorsNSData",
		"removeRasterImages",
		"removeTitle",
		"removeDoctype",
		"collapseGroups",
		"removeStyleElement",
	],
	floatPrecision: 0,
})
const SVGOpretty = new pkg({
	pretty: true,
})

const file = fs.readFileSync("./src/data/catalog.yaml", "utf8")
let political = fs.readFileSync(
	"./src/images/local-space-political.svg",
	"utf8"
)
let optimised = await SVGO.optimize(political)
//political = optimised.data

const c = YAML.parse(file)
const $ = cheerio.load(political)
let paths = $("path")

const size = 50

const oWidth = 1000
let shortDesc = `According to: Mandel, G. (2002). Star Trek Star Charts: The Complete Atlas of Star Trek (1 ed.). Pocket Books. ISBN 0-7434-3770-5`

for (const key in c) {
	for (const src of ["Mandel", "Mandel_2018", "sto", "PIC", "DIS"]) {
		let fileSuffix = `in local space`
		if (!c[key].hasOwnProperty(src)) {
			continue
		}
		const data = c[key][src]
		if (src !== "DIS") {
			//continue
		}
		if (c[key]?.type === "post" || c[key]?.interesting === false) {
			continue
		}
		if (
			data &&
			data.hasOwnProperty("label") &&
			data.hasOwnProperty("coordinates") &&
			!data.coordinates.hasOwnProperty("relative-to")
		) {
			const fileName = data.label.replace(/\s+\([^\)]+\)$/, "")
			const fractions = c[key].hasOwnProperty("fractions")
				? c[key].fractions
				: []
			const dist = Math.sqrt(
				Math.pow(data.coordinates.x, 2) + Math.pow(data.coordinates.y, 2)
			)
			if (dist > 1100) {
				continue
			}
			let zoom = 100 / Math.max(dist, 100)
			let clipWidth = 250 / zoom
			let clipHeight = clipWidth * 0.618
			let gridData = new RadialGrid.default({
				cx: 0,
				cy: -26200,
				minR: 25680,
				r: 26720,
				concentricSubdivisions: zoom >= 1 ? 51 : zoom >= 0.5 ? 13 : 26,
				radialSubdivisions: zoom >= 1 ? 42 : zoom >= 0.5 ? 11 : 21,
				stroke: "black",
				strokeWidth: 0.17290001 / zoom,
				minArc: 89.082,
				maxArc: 90.918,
				opacity: 0.25,
			})
			let center = {
				x: data.coordinates.x - clipWidth / 2,
				y: data.coordinates.y - clipHeight / 2,
			}
			if (dist > 330) {
				zoom = 0.332
				clipWidth = 250 / zoom
				clipHeight = clipWidth
				center.x = 31 - clipWidth / 2
				center.y = 142 - clipHeight / 2
				gridData = new RadialGrid.default({
					cx: 31,
					cy: 142,
					minR: 70,
					r: 350,
					concentricSubdivisions: 4,
					radialSubdivisions: 12,
					stroke: "black",
					strokeWidth: 0.17290001 / zoom,
					opacity: 0.25,
				})
			}
			if (dist > 500) {
				zoom = 0.15
				clipWidth = 250 / zoom
				clipHeight = clipWidth
				center.x = 31 - clipWidth / 2
				center.y = 142 - clipHeight / 2
				gridData = new RadialGrid.default({
					cx: 31,
					cy: 142,
					minR: 350,
					r: 832,
					concentricSubdivisions: 1,
					radialSubdivisions: 12,
					stroke: "black",
					strokeWidth: 0.17290001 / zoom,
					opacity: 0.25,
				})
			}
			let grid = ReactDOMServer.renderToStaticMarkup(gridData.render())
			if (src === "PIC") {
				zoom = 0.9
				fileSuffix = "in PIC"
				clipWidth = 345 / zoom
				clipHeight = 195 / zoom
				center.x = 45 - clipWidth / 2
				center.y = 23 - clipHeight / 2
				grid = ""
				for (let x = -9; x < 15; x++) {
					for (let y = -5; y < 8; y++) {
						grid = grid.concat(
							"",
							`<rect
								x="${15 * x}"
								y="${15 * y}"
								height="15"
								width="15"
								stroke="black"
								stroke-width="${0.17290001 / zoom}"
								fill="none"
							/>`
						)
					}
				}
			}
			if (src === "DIS") {
				zoom = 0.9
				fileSuffix = "in DIS"
				clipWidth = 170 / zoom
				clipHeight = 80 / zoom
				center.x = -15
				center.y = 5
				grid = ""
				for (let x = -1; x < 11; x++) {
					for (let y = 0; y < 5; y++) {
						grid = grid.concat(
							"",
							`<rect
								x="${20 * x}"
								y="${20 * y}"
								height="20"
								width="20"
								stroke="black"
								stroke-width="${0.17290001 / zoom}"
								fill="none"
							/>`
						)
					}
				}
			}
			if (src === "sto") {
				fileSuffix = "in STO"
				shortDesc = `Accordion to Star Trek: Online's 'Sector space'. Solid black lines represent sectors in the latest version. Dotted lines represent sector blocks in older versions of Star Trek: Online.`
				zoom = 0.8
				clipWidth = 210 / zoom
				clipHeight = 180 / zoom
				center = { x: -110, y: -90 }
				grid = ""
				for (let x = 0; x < 7; x++) {
					for (let y = -2; y < 6; y++) {
						grid = grid.concat(
							"",
							`<rect
								x="${20 * x}"
								y="${20 * y}"
								height="20"
								width="20"
								stroke="black"
								stroke-width="${0.17290001 / zoom}"
								fill="none"
							/>`
						)
					}
				}
				for (let x = -1; x > -6; x--) {
					for (let y = 3; y > -5; y--) {
						grid = grid.concat(
							"",
							`<rect
								x="${20 * x}"
								y="${20 * y}"
								height="20"
								width="20"
								stroke="black"
								stroke-width="${0.17290001 / zoom}"
								fill="none"
							/>`
						)
					}
				}
				grid = grid.concat(
					`<rect
								x="21"
								y="1"
								height="58"
								width="18"
								stroke="black"
								stroke-width="${0.17290001 / zoom}"
								stroke-dasharray="${1 / zoom} ${1 / zoom}"
								fill="none"
							/>`,
					`<rect
								x="1"
								y="1"
								height="58"
								width="18"
								stroke="black"
								stroke-width="${0.17290001 / zoom}"
								stroke-dasharray="${1 / zoom} ${1 / zoom}"
								fill="none"
							/>`,
					`<rect
								x="1"
								y="-19"
								height="18"
								width="58"
								stroke="black"
								stroke-width="${0.17290001 / zoom}"
								stroke-dasharray="${1 / zoom} ${1 / zoom}"
								fill="none"
							/>`,
					`<rect
								x="1"
								y="-59"
								height="38"
								width="38"
								stroke="black"
								stroke-width="${0.17290001 / zoom}"
								stroke-dasharray="${1 / zoom} ${1 / zoom}"
								fill="none"
							/>`,
					`<rect
								x="41"
								y="1"
								height="18"
								width="58"
								stroke="black"
								stroke-width="${0.17290001 / zoom}"
								stroke-dasharray="${1 / zoom} ${1 / zoom}"
								fill="none"
							/>`,
					`<rect
								x="41"
								y="41"
								height="18"
								width="58"
								stroke="black"
								stroke-width="${0.17290001 / zoom}"
								stroke-dasharray="${1 / zoom} ${1 / zoom}"
								fill="none"
							/>`,
					`<rect
								x="1"
								y="61"
								height="18"
								width="58"
								stroke="black"
								stroke-width="${0.17290001 / zoom}"
								stroke-dasharray="${1 / zoom} ${1 / zoom}"
								fill="none"
							/>`,
					`<rect
								x="61"
								y="61"
								height="18"
								width="58"
								stroke="black"
								stroke-width="${0.17290001 / zoom}"
								stroke-dasharray="${1 / zoom} ${1 / zoom}"
								fill="none"
							/>`,
					`<rect
								x="-79"
								y="41"
								height="18"
								width="58"
								stroke="black"
								stroke-width="${0.17290001 / zoom}"
								stroke-dasharray="${1 / zoom} ${1 / zoom}"
								fill="none"
							/>`,
					`<rect
								x="-79"
								y="21"
								height="18"
								width="58"
								stroke="black"
								stroke-width="${0.17290001 / zoom}"
								stroke-dasharray="${1 / zoom} ${1 / zoom}"
								fill="none"
							/>`,
					`<rect
								x="-119"
								y="21"
								height="38"
								width="38"
								stroke="black"
								stroke-width="${0.17290001 / zoom}"
								stroke-dasharray="${1 / zoom} ${1 / zoom}"
								fill="none"
							/>`,
					`<rect
								x="61"
								y="201"
								height="38"
								width="38"
								stroke="black"
								stroke-width="${0.17290001 / zoom}"
								stroke-dasharray="${1 / zoom} ${1 / zoom}"
								fill="none"
							/>`
				)
			}

			let newFile = `
				<svg
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink"
					viewBox="${[center.x, center.y, clipWidth, clipHeight].join(" ")}"
					width="${oWidth}"
					height="${Math.floor((oWidth / clipWidth) * clipHeight)}"
					data-x="${data.coordinates.x}"
					data-y="${data.coordinates.y}"
					lang="en"
					>
					<title>${data.label}</title>
					<desc>${shortDesc}</desc>
					<g>
						${paths
							.get()
							.map(p => {
								let sto = $(p).attr("data-sto")
								if (
									(src === "sto" && sto !== "hidden") ||
									(src === "sto" && typeof sto == "undefined") ||
									(src !== "sto" && sto !== "only")
								) {
									return `<path d="${$(p).attr("d")}" fill="#${
										fractions.includes($(p).attr("data-name"))
											? "F5F5F5"
											: "DFDFDF"
									}" stroke="#646666" stroke-width="${1 / zoom}" />`
								}
							})
							.join("")}
						<g stroke="#646666" stroke-width="3.5">
							<path fill="none" id="dmz" d="M-61.746,57.443 C-61.746,57.443 -61.01,58.18 -60.273,58.131 C-59.536,58.082 -58.063,56.854 -56.639,56.51 C-55.214,56.166 -53.643,56.707 -53.053,56.756 C-52.464,56.805 -50.941,56.756 -50.352,56.903 C-49.763,57.051 -48.682,57.738 -47.847,57.787 C-47.012,57.836 -43.231,56.265 -41.855,56.216 C-40.48,56.166 -37.533,56.903 -36.699,56.952 C-35.864,57.001 -35.52,56.314 -35.029,56.363 C-34.538,56.412 -33.31,57.787 -32.671,57.787 C-32.033,57.787 -30.952,56.265 -30.216,55.921 C-29.479,55.577 -26.483,53.858 -25.795,51.255 C-25.108,48.652 -25.108,46.589 -25.746,45.656 C-26.385,44.723 -30.265,43.741 -30.805,43.888 C-31.345,44.035 -33.162,45.411 -33.752,45.411 C-34.341,45.411 -36.306,42.955 -36.649,42.562 C-36.993,42.169 -43.182,38.78 -44.557,39.713 C-45.932,40.647 -47.946,41.334 -47.946,41.334" stroke-linecap="round"/>
						</g>
						<use xlink:href="#dmz" stroke="#DFDFDF" stroke-width="${3 - 2 / zoom}" />
						${
							!["sto", "PIC"].includes(src)
								? `<g stroke="#646666" stroke-width="3.5">
									  	<path fill="none" id="rnz" d="M123.267,-11.658 C123.267,-11.658 130.52,-1.154 130.62,6.049 C130.72,13.252 125.918,20.455 124.967,21.556 C124.017,22.656 118.565,27.558 113.563,28.409 C108.561,29.259 96.256,28.909 88.252,27.008 C80.249,25.107 41.884,6.396 29.989,-5.5 C21.697,-13.792 19.951,-32.195 20.387,-35.178 C20.824,-38.16 22.351,-43.761 23.952,-46.743 C25.552,-49.725 31.807,-55.326 33.844,-56.126 C35.881,-56.927 50.574,-59.254 58.575,-56.126 C66.577,-52.999 71.887,-50.235 71.887,-50.235" stroke-linecap="round"/>
									 </g>
									 <use xlink:href="#rnz" stroke="#DFDFDF" stroke-width="${3 - 2 / zoom}" />`
								: ""
						}
						${grid}
						${
							zoom >= 1
								? ""
								: `<line
										x1="${src === "DIS" ? 28 : 0}"
										x2="${src === "DIS" ? 28 : 0}"
										y1="-26200"
										y2="26200"
										stroke="black"
										stroke-dasharray="${2 / zoom} ${2 / zoom}"
										stroke-width="${0.17290001 / zoom}"
									/>`
						}
						${`${
							debug
								? `${Object.entries(c)
										.map(e => {
											if (
												e[1].hasOwnProperty("Mandel") &&
												e[1].Mandel?.coordinates &&
												!e[1].Mandel?.coordinates.hasOwnProperty(
													"relative-to"
												) &&
												(!e[1].hasOwnProperty("type") || e[1].type !== "post")
											) {
												return `<circle cx="${e[1].Mandel.coordinates.x}" cy="${
													e[1].Mandel.coordinates.y
												}" r="${0.5 / zoom}" fill="#D0D0D0" title="${
													e[1].Mandel.label
												}" />`
											}
										})
										.join("")}}
						<rect x="0" y="0" width="20" height="20" stroke="red" fill="none"/>
						<rect x="-420" y="0" width="20" height="20" stroke="red" fill="none"/>
						<rect x="400" y="0" width="20" height="20" stroke="red" fill="none"/>
						<rect x="0" y="-500" width="20" height="20" stroke="red" fill="none"/>
						<rect x="0" y="500" width="20" height="20" stroke="red" fill="none"/>
						`
								: ""
						}`}
						${
							!data.hasOwnProperty("outline")
								? `<circle
							stroke="#C12737"
							cx="${data.coordinates.x}"
							cy="${data.coordinates.y}"
							r="${1 / zoom}"
							fill="#C12838"
						/>
						<circle
							stroke="#C12737"
							cx="${data.coordinates.x}"
							cy="${data.coordinates.y}"
							r="${7 / zoom}"
							stroke-width="${1 / zoom}"
							fill="#C12838"
							fill-opacity=".15"
						/>`
								: `<path d="${data.outline}" fill="#C12838" />`
						}
						
					</g>
					<style>
						@media (prefers-color-scheme: dark) {
							[stroke="black"] {
								stroke: white;
							}
							svg {
								background: #2E3136;
							}
						}
					</style>
				</svg>
			`
			const newFileOptimised = await SVGOpretty.optimize(newFile)
			fs.writeFileSync(
				`./locator/${fileName} ${fileSuffix}.svg`,
				`<?xml version="1.0" encoding="utf-8"?>
				${newFile}`
			)
		}
	}
}

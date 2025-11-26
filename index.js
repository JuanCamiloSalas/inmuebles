import extractListFincaRaiz from "./extractFincaRaiz.js"
import extractListMetroCuadrado from "./extractMetroCuadrado.js"
import convertJSONtoCSV from "./convertJSONtoCSV.js"

const readJsonFiles = (subfolder) => {
    if (!subfolder) {
        console.error('No subfolder provided. Usage: `node index.js <subfolder-name>`')
        return []
    }

    const basePath = subfolder ? `./data/${subfolder}` : `./data`

    // read JSON finca_raiz files
    console.log('Reading finca_raiz JSON files...')
    let indexFincaRaiz = 1
    const fincaRaizList = []

    while (true) {
        const fileName = `${basePath}/finca_raiz_${indexFincaRaiz}.json`

        const properties = extractListFincaRaiz(fileName)
        if (!properties) break
        fincaRaizList.push(properties)
        indexFincaRaiz++
    }

    // read JSON metro_cuadrado files
    console.log('Reading metro_cuadrado JSON files...')
    let indexMetroCuadrado = 1
    const metroCuadradoList = []

    while (true) {
        const fileName = `${basePath}/metro_cuadrado_${indexMetroCuadrado}.json`

        const properties = extractListMetroCuadrado(fileName)
        if (!properties) break
        metroCuadradoList.push(properties)
        indexMetroCuadrado++
    }

    return [
        ...fincaRaizList.flat(),
        ...metroCuadradoList.flat()
    ]
}

// Read subfolder from CLI: `node index.js <subfolder>`
const subfolderArg = process.argv[2]

const data = readJsonFiles(subfolderArg)

// Convert JSON data to CSV
const csvFileName = convertJSONtoCSV(data)

if (csvFileName) {
    console.log(`CSV file created: ${csvFileName}`)
} else {
    console.log('Failed to create CSV file')
}

import { log } from 'console'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const extractListFincaRaiz = (fileName) => {
    if (!fileName) {
        console.error('Filename not provided')
        return null
    }

    let jsonData = null
    try {
        // Decide path: if caller provided a path (starts with ./ or /) use it directly,
        // otherwise fallback to ./jsonFiles/<fileName> for backward compatibility.
        let filePath
        if (fileName.startsWith('/') || fileName.startsWith('./')) {
            filePath = resolve(fileName)
        } else {
            filePath = resolve(`./jsonFiles/${fileName}`)
        }
        const fileContent = readFileSync(filePath, 'utf8')
        jsonData = JSON.parse(fileContent)

    } catch (error) {
        // file not found or invalid JSON
        return false
    }
    
    const properties = jsonData.hits.hits.map(element => {
        const importantElements = [
            "property_type_name",
            "construction_state_name",
            "bathrooms",
            "constructionYear",
            "bedrooms",
            "garage",
            "m2apto",
            "stratum",
            "floor",
            "garage"
        ]

        const tecnicalDetails = {}

        element?._source?.listing?.technicalSheet.forEach(detail => {
            if (importantElements.includes(detail.field)) tecnicalDetails[detail.field] = detail.value
        })

        const {
            // property_type_name,
            // construction_state_name,
            bathrooms,
            constructionYear,
            bedrooms,
            garage,
            m2apto,
            stratum,
            floor
        } = tecnicalDetails

        const result = {
            direccion: element?._source?.listing?.address.toLowerCase(),
            barrio: element?._source?.listing?.locations?.neighbourhood.map(n => n.name).join(', '),
            link: `https://www.fincaraiz.com.co${element?._source?.listing?.link}`,
            area: Math.round(element?._source?.listing?.m2 || Number(m2apto?.replace(" m2", "")?.split(",")[0])) || null,
            precio: element?._source?.listing?.price?.amount,
            antiguedad: constructionYear,
            habitaciones: Number(bedrooms),
            baños: Number(bathrooms),
            piso: Number(floor),
            ascensor: element?._source?.listing?.facilities?.some(facility => facility.name.toLowerCase() === "ascensor") ? "Sí" : "No",
            estrato: Number(stratum),
            parqueaderos: Number(garage),
            "cub/descub": "",
            "interior/exterior": element?._source?.listing?.facilities?.some(facility => facility.name.toLowerCase() === "garage")
                ? element?._source?.listing?.facilities?.find(facility => facility.name.toLowerCase() === "garage")["group"]
                : null,
            "original/remodelado": element?._source?.listing?.description.toLowerCase().includes("remodelad") ? "remodelado" : "original"
        }

        const anotaciones = []

        const interestingsCriterias = ["negociable", "precio fijo", "permuta", "duplex", "apto para estrenar", "altillo", "zonas sociales", "piscina", "cocina integral", "depósito", "chimenea", "patio", "cancha", "gym"]

        interestingsCriterias.forEach(annot => {
            if (element?._source?.listing?.description.toLowerCase().includes(annot)) {
                anotaciones.push(annot)
            }
        })

        result["anotaciones"] = anotaciones.join(', ')
        return result
    })
    return properties.flat()
}

export default extractListFincaRaiz
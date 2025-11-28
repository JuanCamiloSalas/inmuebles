import { readFileSync } from 'fs'
import { resolve } from 'path'

const extractListMetroCuadrado = (fileName) => {
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

    const properties = jsonData?.data?.result?.propertiesByFiltersQuery?.properties.map(element => {
        // console.log(element.features.find(f => f.includes("nroAscensores")))
        // console.log(Number(element?.features.find(f => f.includes("nroAscensores"))?.split(":")[1]))
         const result = {
            id: element?.metroId,
            direccion: null,
            barrio: element?.neighborhood?.name,
            link: `https://www.metrocuadrado.com${element?.url}`,
            area: element?.area,
            precio: element?.price,
            antiguedad: element?.builtTime?.name,
            habitaciones: element?.roomsNumber,
            baños: element?.bathroomsNumber,
            piso: Number(element?.features.find(f => f.includes("nroPiso"))?.split(":")[1]) || null,
            ascensor: Number(element?.features.find(f => f.includes("nroAscensores"))?.split(":")[1]) >= 1 ? "Sí" : "No" || null,
            estrato: element?.stratum,
            parqueadero: element?.parkingNumber,
            estado: element?.builtTime?.name === "Remodelado" || element?.comments?.toLowerCase().includes("remodelad")
                ? "remodelado" : "original"
        }

        const anotaciones = []
        const interestingsCriterias = ["negociable", "precio fijo", "permuta", "duplex", "apto para estrenar", "altillo", "zonas sociales", "piscina", "cocina integral", "depósito", "chimenea", "patio", "cancha", "gym"]

        interestingsCriterias.forEach(annot => {
            if (element?.comments?.toLowerCase().includes(annot)) {
                anotaciones.push(annot)
            }
        })

        result["anotaciones"] = anotaciones.join(', ')
        return result
    })
    return properties.flat()
}

export default extractListMetroCuadrado
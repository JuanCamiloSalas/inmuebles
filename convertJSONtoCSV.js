import fs from 'fs'
import path from 'path'
import XLSX from 'xlsx'

const convertJSONtoCSV = (jsonData) => {
    try {
        // Validate input data
        if (!Array.isArray(jsonData) || jsonData.length === 0) {
            throw new Error('Data must be a non-empty array of objects')
        }
        
        // Ensure csvFiles directory exists
        const csvDir = './csvFiles'
        if (!fs.existsSync(csvDir)) {
            fs.mkdirSync(csvDir, { recursive: true })
        }
        
        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, -5)
        const fileName = `result-${timestamp}.xlsx`
        const csvFilePath = path.join(csvDir, fileName)
        
        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new()
        const worksheet = XLSX.utils.json_to_sheet(jsonData)
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
        
        // Write CSV file
        XLSX.writeFile(workbook, csvFilePath, { bookType: 'xlsx' })
        
        // Return the filename
        return fileName
        
    } catch (error) {
        throw new Error(error)
    }
}

export default convertJSONtoCSV

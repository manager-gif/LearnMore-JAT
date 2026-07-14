const fs = require('fs');
const path = require('path');

// Apunta directamente a la raÃ­z del proyecto para agarrar el index.html y los CSS
const projectRoot = path.resolve(__dirname, '..'); 

function fixFile(filePath) {
    const ext = path.extname(filePath);
    if (!['.html', '.js', '.css', '.json', '.md', '.sql'].includes(ext)) return;

    try {
        const buffer = fs.readFileSync(filePath);
        const decodedText = buffer.toString('binary');
        const cleanBuffer = Buffer.from(decodedText, 'utf-8');
        const finalValidText = cleanBuffer.toString('utf-8');

        fs.writeFileSync(filePath, finalValidText, 'utf-8');
        console.log(`â Reparado: ${path.relative(projectRoot, filePath)}`);
    } catch (err) {
        console.error(`â Error en ${filePath}:`, err.message);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (file === 'node_modules' || file === '.git') continue;
        
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else {
            fixFile(fullPath);
        }
    }
}

console.log("Iniciando limpieza TOTAL del proyecto (HTML, CSS y JS)...");
walkDir(projectRoot);
console.log("¡Terminado! Limpieza profunda completada.");
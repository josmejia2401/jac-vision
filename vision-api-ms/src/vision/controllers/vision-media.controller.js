const fs = require("fs");
const path = require("path");
const constants = require('../../helpers/utils/constants/constants');
const { getRequestLogger } = require("../../helpers/utils/logger/request-logger");

class MediaController {

    async streaming(req, res) {
        const logger = getRequestLogger(req.requestId);
        try {
            const fileName = req.params.filename;
            const videoPath = path.resolve(__dirname, constants.STORAGE_BASE_PATH, fileName);

            const stat = await fs.promises.stat(videoPath);
            const fileSize = stat.size;

            const range = req.headers.range;
            if (!range) {
                return res.status(416).json({
                    success: false,
                    message: "El encabezado Range es requerido para streaming."
                });
            }

            // 10 MB (mejor rendimiento)
            const CHUNK_SIZE = 10 * 1024 * 1024;

            const start = Number(range.replace(/\D/g, ""));
            const end = Math.min(start + CHUNK_SIZE, fileSize - 1);
            const contentLength = end - start + 1;

            res.writeHead(206, {
                "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": contentLength,
                "Content-Type": "video/mp4"
            });

            const stream = fs.createReadStream(videoPath, { start, end });

            stream.on("error", (err) => {
                logger.error("Stream error:", err);
                res.end();
            });

            req.on("close", () => stream.destroy());

            return stream.pipe(res);

        } catch (err) {
            logger.error("Error en streaming:", err);
            return res.status(500).json({ success: false, message: "Error al transmitir video" });
        }
    }


    async download(req, res) {
        const logger = getRequestLogger(req.requestId);
        try {
            const fileName = req.params.filename;
            const file = path.resolve(__dirname, constants.STORAGE_BASE_PATH, fileName);

            if (!fs.existsSync(file)) {
                return res.status(404).json({
                    success: false,
                    message: "El archivo no existe."
                });
            }

            return res.download(file);

        } catch (err) {
            logger.error("Error en descarga:", err);
            return res.status(500).json({ success: false, message: "Error al descargar el video" });
        }
    }

}

module.exports.mediaController = new MediaController();

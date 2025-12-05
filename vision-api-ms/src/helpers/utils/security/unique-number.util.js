class UniqueNumberUtil {
    
    static generateUniqueNumber(n = 12) {
        if (n < 8) {
            throw new Error("El parámetro 'n' debe ser mayor o igual a 8.");
        }

        const now = new Date();
        const datePrefix = now.toISOString().slice(2, 10).replace(/-/g, ""); // yyMMdd

        const randomDigits = n - 6;

        // Convertir SIEMPRE a string
        let timeComponent = String(Date.now());

        if (timeComponent.length > randomDigits) {
            timeComponent = timeComponent.slice(timeComponent.length - randomDigits);
        }

        // random fallback
        const randomComponent = String(Math.floor(
            Math.random() * Math.pow(10, randomDigits)
        )).padStart(randomDigits, "0");

        let numeric = datePrefix + timeComponent;

        if (numeric.length < n) {
            numeric += randomComponent.slice(0, n - numeric.length);
        } else if (numeric.length > n) {
            numeric = numeric.slice(0, n);
        }

        // evitar iniciar en 0
        if (numeric.charAt(0) === "0") {
            numeric = (Math.floor(Math.random() * 9) + 1) + numeric.slice(1);
        }

        return Number(numeric);
    }

    static generateUniqueNumberDataBase() {
        return this.generateUniqueNumber(12);
    }

    static generateUUID() {
        let timestamp = Date.now();
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, char => {
            const r = (timestamp + Math.random() * 16) % 16 | 0;
            timestamp = Math.floor(timestamp / 16);

            if (char === "x") {
                return r.toString(16);
            }
            // Variant RFC4122: y ∈ [8, b]
            return ((r & 0x3) | 0x8).toString(16);
        });
    };
}

module.exports.UniqueNumberUtil = UniqueNumberUtil;
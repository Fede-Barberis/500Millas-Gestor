export default async function handler(req, res) {
    const authHeader = req.headers.authorization || "";
    const expected = `Bearer ${process.env.CRON_SECRET}`;

    if (!process.env.CRON_SECRET || !process.env.BACKEND_URL) {
        return res.status(500).json({
            ok: false,
            error: "Faltan variables BACKEND_URL o CRON_SECRET"
        });
    }

    if (authHeader !== expected) {
        return res.status(401).json({
            ok: false,
            error: "Unauthorized"
        });
    }

    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/reportes/cerrar-mes-cron`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "x-cron-secret": process.env.CRON_SECRET
            },
            body: JSON.stringify({})
        });

        const text = await response.text();
        let payload = {};
        try {
            payload = text ? JSON.parse(text) : {};
        } catch {
            payload = { raw: text };
        }

        return res.status(response.status).json(payload);
    } catch (error) {
        return res.status(500).json({
            ok: false,
            error: "Error llamando backend",
            details: error.message
        });
    }
}

const express = require('express');
const bodyParser = require('body-parser');
const pdf = require('pdf-parse');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // obsługa dużych PDFów

app.post('/extract-pdf', async (req, res) => {
    try {
        if (!req.body.pdfBase64) {
            return res.status(400).json({ error: 'pdfBase64 is required' });
        }

        const pdfBuffer = Buffer.from(req.body.pdfBase64, 'base64');
        const data = await pdf(pdfBuffer);

        const pages = data.text.split(/\f+/); // rozdzielanie po stronach

        // batchowanie po 3 strony
        const batchSize = 3;
        const batches = [];
        for(let i = 0; i < pages.length; i += batchSize){
            batches.push(pages.slice(i, i + batchSize).join('\n\n---PAGE BREAK---\n\n'));
        }

        res.json({ batches });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`PDF2JSON service running on port ${PORT}`));

const express = require('express');
const path = require('path');
const questions = require('./data/questions');

const app = express();
const PORT = process.env.PORT || 3000;

// Link hadiah (bisa diubah nanti)
const REWARD_LINK = 'https://www.canva.com/brand/join?token=TrzFqVwmUy9-UnaZVIgNEQ&referrer=team-invite';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mengambil pertanyaan acak
app.get('/api/question', (req, res) => {
    const randomIndex = Math.floor(Math.random() * questions.length);
    const q = questions[randomIndex];

    // Kirim pertanyaan tanpa jawaban
    res.json({
        id: q.id,
        question: q.question,
        options: q.options
    });
});

// Mengecek jawaban
app.post('/api/answer', (req, res) => {
    const { id, answer } = req.body;

    const q = questions.find(q => q.id === id);
    if (!q) {
        return res.status(404).json({ success: false, message: 'Pertanyaan tidak ditemukan' });
    }

    if (q.answer.toLowerCase() === answer.toLowerCase()) {
        res.json({ success: true, rewardLink: REWARD_LINK });
    } else {
        res.json({ success: false, message: 'Jawaban salah. Coba lagi!' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
